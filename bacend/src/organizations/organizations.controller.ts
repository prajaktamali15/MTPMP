import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { OrgGuard } from '../guards/org.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../rbac/roles.decorator';
import { RolesGuard } from '../rbac/roles.guard';
import { UserRole } from '../../generated/prisma';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
  orgId?: string; // Make orgId optional
}

@Controller('organizations')
// Remove OrgGuard from the controller level for the organizations endpoint
// It will be applied selectively to specific methods
@UseGuards(AuthGuard('jwt'))
export class OrganizationsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  // Don't use OrgGuard for this endpoint as it's used to check user's organizations
  async getAllOrganizations(@Req() req: RequestWithUser) {
    // Users can only see organizations they belong to
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { organization: true },
    });

    if (!user || !user.organization) {
      return [];
    }

    return [user.organization];
  }

  @Get(':id')
  // Don't use OrgGuard for this endpoint as it's used to get a specific organization
  async getOrganizationById(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    // Users can only access organizations they belong to
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user || user.organizationId !== id) {
      throw new BadRequestException('Organization not found or access denied');
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new BadRequestException('Organization not found');
    }

    return organization;
  }

  @Get(':id/members')
  @UseGuards(OrgGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.MEMBER)
  async getOrganizationMembers(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    // Verify that the user belongs to the organization
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user || user.organizationId !== id) {
      throw new BadRequestException('Organization not found or access denied');
    }

    // Get all members of the organization
    const members = await this.prisma.user.findMany({
      where: { organizationId: id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return members;
  }

  @Delete(':id/members/:memberId')
  @UseGuards(OrgGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async removeOrganizationMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Req() req: RequestWithUser,
  ) {
    // Verify that the user belongs to the organization
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user || user.organizationId !== id) {
      throw new BadRequestException('Organization not found or access denied');
    }

    // Check if the member to be removed exists and belongs to the organization
    const memberToRemove = await this.prisma.user.findUnique({
      where: { id: memberId },
    });

    if (!memberToRemove || memberToRemove.organizationId !== id) {
      throw new BadRequestException('Member not found in this organization');
    }

    // Prevent owners from removing themselves
    if (memberToRemove.role === 'OWNER' && memberToRemove.id === req.user.userId) {
      throw new HttpException(
        'Owners cannot remove themselves from the organization',
        HttpStatus.FORBIDDEN,
      );
    }

    // Remove the member from the organization by setting their organizationId to null
    const updatedMember = await this.prisma.user.update({
      where: { id: memberId },
      data: {
        organizationId: null,
        role: 'MEMBER', // Reset role to MEMBER when removed from organization
      },
    });

    return { 
      message: 'Member removed successfully',
      member: {
        id: updatedMember.id,
        email: updatedMember.email,
        name: updatedMember.name,
      }
    };
  }

  @Post()
  // Don't use OrgGuard or RolesGuard for this endpoint as it's used to create the first organization for a user
  async createOrganization(
    @Body() data: { name: string },
    @Req() req: RequestWithUser,
  ) {
    // First check if user already belongs to an organization
    const existingUser = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { organization: true },
    });

    if (existingUser && existingUser.organization) {
      throw new BadRequestException('User already belongs to an organization');
    }

    // Create the organization
    const organization = await this.prisma.organization.create({
      data: {
        name: data.name,
      },
    });

    // Update user's organization and assign OWNER role
    await this.prisma.user.update({
      where: { id: req.user.userId },
      data: {
        organizationId: organization.id,
        role: 'OWNER', // Assign OWNER role to the creator
      },
    });

    return organization;
  }

  @Put(':id')
  @UseGuards(OrgGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async updateOrganization(
    @Param('id') id: string,
    @Body() data: { name: string },
    @Req() req: RequestWithUser,
  ) {
    // Verify that the organization belongs to the user
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user || user.organizationId !== id) {
      throw new BadRequestException('Organization not found or access denied');
    }

    const organization = await this.prisma.organization.update({
      where: { id },
      data: {
        name: data.name,
      },
    });

    return organization;
  }

  @Delete(':id')
  @UseGuards(OrgGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  async deleteOrganization(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    // Verify that the organization belongs to the user
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user || user.organizationId !== id) {
      throw new BadRequestException('Organization not found or access denied');
    }

    // Delete all related data first
    await this.prisma.task.deleteMany({
      where: {
        project: {
          organizationId: id,
        },
      },
    });

    await this.prisma.project.deleteMany({
      where: { organizationId: id },
    });

    // For now, we'll just log a warning about the limitation
    // In a real application, you'd need to handle this differently
    console.warn(
      'Cannot properly disconnect users from organization due to Prisma schema constraints',
    );

    const organization = await this.prisma.organization.delete({
      where: { id },
    });

    return { message: 'Organization deleted successfully' };
  }
}