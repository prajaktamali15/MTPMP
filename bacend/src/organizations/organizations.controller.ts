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
  @UseGuards(OrgGuard, RolesGuard) // Apply OrgGuard specifically to this method
  async getOrganizationById(@Param('id') id: string, @Req() req: RequestWithUser) {
    // Verify that the user belongs to this organization
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user || user.organizationId !== id) {
      throw new BadRequestException('Organization not found or access denied');
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    return organization;
  }

  @Post()
  @UseGuards(OrgGuard, RolesGuard) // Apply OrgGuard specifically to this method
  @Roles(UserRole.OWNER)
  async createOrganization(@Body() data: { name: string }, @Req() req: RequestWithUser) {
    // Only owners can create new organizations
    const organization = await this.prisma.organization.create({
      data: {
        name: data.name,
      },
    });

    // Make the creator the owner of this organization
    await this.prisma.user.update({
      where: { id: req.user.userId },
      data: {
        role: UserRole.OWNER,
        organization: {
          connect: {
            id: organization.id,
          },
        },
      },
    });

    return organization;
  }

  @Put(':id')
  @UseGuards(OrgGuard, RolesGuard) // Apply OrgGuard specifically to this method
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async updateOrganization(
    @Param('id') id: string,
    @Body() data: { name?: string },
    @Req() req: RequestWithUser,
  ) {
    // Verify that the user belongs to this organization
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user || user.organizationId !== id) {
      throw new BadRequestException('Organization not found or access denied');
    }

    const organization = await this.prisma.organization.update({
      where: { id },
      data,
    });

    return organization;
  }

  @Delete(':id')
  @UseGuards(OrgGuard, RolesGuard) // Apply OrgGuard specifically to this method
  @Roles(UserRole.OWNER)
  async deleteOrganization(@Param('id') id: string, @Req() req: RequestWithUser) {
    // Only owners can delete organizations
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user || user.organizationId !== id) {
      throw new BadRequestException('Organization not found or access denied');
    }

    // Check if user is owner
    if (user.role !== UserRole.OWNER) {
      throw new BadRequestException('Only owners can delete organizations');
    }

    const organization = await this.prisma.organization.delete({
      where: { id },
    });

    return organization;
  }

  @Post(':id/members')
  @UseGuards(OrgGuard, RolesGuard) // Apply OrgGuard specifically to this method
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async addMember(
    @Param('id') orgId: string,
    @Body() data: { userId: string, role: UserRole },
    @Req() req: RequestWithUser,
  ) {
    // Verify that the user belongs to this organization
    const requestingUser = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!requestingUser || requestingUser.organizationId !== orgId) {
      throw new BadRequestException('Organization not found or access denied');
    }

    // Update the user's role in this organization
    const updatedUser = await this.prisma.user.update({
      where: { id: data.userId },
      data: {
        role: data.role,
        organization: {
          connect: {
            id: orgId,
          },
        },
      },
    });

    return { message: 'Member added successfully', user: updatedUser };
  }

  @Delete(':id/members/:userId')
  @UseGuards(OrgGuard, RolesGuard) // Apply OrgGuard specifically to this method
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async removeMember(
    @Param('id') orgId: string,
    @Param('userId') userId: string,
    @Req() req: RequestWithUser,
  ) {
    // Verify that the requesting user belongs to this organization
    const requestingUser = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!requestingUser || requestingUser.organizationId !== orgId) {
      throw new BadRequestException('Organization not found or access denied');
    }

    // Prevent users from removing themselves unless they're owners
    if (req.user.userId === userId && requestingUser.role !== UserRole.OWNER) {
      throw new BadRequestException('You cannot remove yourself from the organization');
    }

    // Remove the user from the organization
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        role: UserRole.GUEST,
      },
    });

    return { message: 'Member removed successfully', user: updatedUser };
  }
}