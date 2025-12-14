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
        token: token,
        organizationId: req.orgId,
        invitedById: req.user.userId,
      },
    });

    // In a real app, you would send an email here
    // For now, we'll just return the invitation with the token
    return { 
      message: 'Invitation created successfully', 
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        token: invitation.token,
        organizationId: invitation.organizationId,
      }
    };
  }

  @Get(':token/accept')
  @UseGuards(AuthGuard('jwt')) // Only need JWT guard for this endpoint
  async acceptInvitation(
    @Param('token') token: string,
    @Req() req: RequestWithUser,
  ) {
    // Find the invitation by token
    const invitation = await this.prisma.invitation.findUnique({
      where: { token: token },
    });

    if (!invitation) {
      throw new BadRequestException('Invalid or expired invitation');
    }

    // Check if the invitation is for the current user's email
    if (invitation.email !== req.user.email) {
      throw new BadRequestException('This invitation is not for your email address');
    }

    // Check if invitation has expired (24 hours)
    const now = new Date();
    const invitationDate = new Date(invitation.createdAt);
    const hoursDiff = Math.abs(now.getTime() - invitationDate.getTime()) / 3600000;
    
    if (hoursDiff > 24) {
      throw new BadRequestException('Invitation has expired');
    }

    // Add user to organization with the specified role
    const updatedUser = await this.prisma.user.update({
      where: { id: req.user.userId },
      data: {
        role: invitation.role,
        organization: {
          connect: {
            id: invitation.organizationId,
          },
        },
      },
    });

    // Delete the invitation as it's been used
    await this.prisma.invitation.delete({
      where: { id: invitation.id },
    });

    return { 
      message: 'Invitation accepted successfully',
      organizationId: invitation.organizationId
    };
  }
}