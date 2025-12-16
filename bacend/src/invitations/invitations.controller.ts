import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
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
}

@Controller('invitations')
@UseGuards(AuthGuard('jwt'))
export class InvitationsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @UseGuards(RolesGuard) // Only apply RolesGuard, handle org validation manually
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async createInvitation(
    @Body() data: { email: string; role: UserRole },
    @Req() req: RequestWithUser,
  ) {
    // Get orgId from headers since middleware skips invitation routes
    const orgId = req.headers['x-org-id'] as string;
    
    if (!orgId) {
      throw new BadRequestException('Organization ID missing (x-org-id header required)');
    }

    // Verify that the user belongs to the organization and has the right role
    const requestingUser = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!requestingUser) {
      throw new ForbiddenException('User not found');
    }

    if (requestingUser.organizationId !== orgId) {
      throw new ForbiddenException('Organization not found or access denied');
    }

    // Check if user has required role (ADMIN or OWNER)
    if (requestingUser.role !== UserRole.ADMIN && requestingUser.role !== UserRole.OWNER) {
      throw new ForbiddenException('Insufficient privileges');
    }

    // Check if a user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      // If user exists, directly add them to the organization with the specified role
      await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: data.role,
          organizationId: orgId,
        },
      });
      
      return {
        message: 'User added to organization successfully',
        userId: existingUser.id,
      };
    } else {
      // If user doesn't exist, create a placeholder user that will be completed when they register
      const newUser = await this.prisma.user.create({
        data: {
          email: data.email,
          password: '', // Empty password for now
          name: '', // Empty name for now
          role: data.role,
          organizationId: orgId,
        },
      });
      
      return {
        message: 'Invitation sent successfully. User will be added to organization upon registration.',
        userId: newUser.id,
      };
    }
  }

  // Remove the getInvitation and acceptInvitation endpoints as they're not needed in the simplified flow
}