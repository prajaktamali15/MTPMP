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
  constructor(
    private prisma: PrismaService,
  ) {}

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
  async getOrganizationById(@Param('id') id: string, @Req() req: RequestWithUser) {
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

  @Post()
  @UseGuards(OrgGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async createOrganization(@Body() data: { name: string }, @Req() req: RequestWithUser) {
    const organization = await this.prisma.organization.create({
      data: {
        name: data.name,
      },
    });

    // Update user's organization
    await this.prisma.user.update({
      where: { id: req.user.userId },
      data: { organizationId: organization.id },
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
  async deleteOrganization(@Param('id') id: string, @Req() req: RequestWithUser) {
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
    console.warn('Cannot properly disconnect users from organization due to Prisma schema constraints');

    const organization = await this.prisma.organization.delete({
      where: { id },
    });

    return { message: 'Organization deleted successfully' };
  }
}