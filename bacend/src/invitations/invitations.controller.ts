import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { OrgGuard } from '../guards/org.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../rbac/roles.decorator';
import { RolesGuard } from '../rbac/roles.guard';
import { UserRole } from '../../generated/prisma';
import * as crypto from 'crypto';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
  orgId: string;
}

@Controller('invitations')
@UseGuards(AuthGuard('jwt'), OrgGuard, RolesGuard)
export class InvitationsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async createInvitation(
    @Body() data: { email: string, role: UserRole },
    @Req() req: RequestWithUser,
  ) {
    // Verify that the user belongs to the organization
    const requestingUser = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!requestingUser || requestingUser.organizationId !== req.orgId) {
      throw new BadRequestException('Organization not found or access denied');
    }

    // Generate a unique token for the invitation
    const token = crypto.randomBytes(32).toString('hex');

    // Create the invitation
    const invitation = await this.prisma.invitation.create({
      data: {
        email: data.email,
        role: data.role,
        token,
        organizationId: req.orgId,
        invitedById: req.user.userId, // Add the missing field
      },
    });

    // TODO: Send email with invitation link
    // For now, we'll just return the token so it can be used manually
    return { 
      message: 'Invitation created successfully',
      invitationId: invitation.id,
      token: invitation.token,
    };
  }

  @Get(':token')
  // This endpoint doesn't require OrgGuard as it's used by invitees who aren't yet part of the org
  async getInvitation(@Param('token') token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: { organization: true },
    });

    if (!invitation || invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired invitation');
    }

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      organization: invitation.organization,
    };
  }

  @Post(':token/accept')
  // This endpoint doesn't require OrgGuard as it's used by invitees who aren't yet part of the org
  async acceptInvitation(@Param('token') token: string, @Req() req: RequestWithUser) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation || invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired invitation');
    }

    // Verify that the user accepting the invitation matches the invited email
    if (req.user.email !== invitation.email) {
      throw new BadRequestException('This invitation is not for your email address');
    }

    // Add user to organization with the specified role
    await this.prisma.user.update({
      where: { id: req.user.userId },
      data: {
        role: invitation.role,
        organizationId: invitation.organizationId,
      },
    });

    // Delete the invitation as it's been used
    await this.prisma.invitation.delete({
      where: { id: invitation.id },
    });

    return { message: 'Invitation accepted successfully' };
  }
}