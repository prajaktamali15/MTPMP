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
  orgId: string;
}

@Controller('projects')
@UseGuards(AuthGuard('jwt'), OrgGuard, RolesGuard)
export class ProjectsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAllProjects(@Req() req: RequestWithUser) {
    return this.prisma.project.findMany({
      where: {
        organizationId: req.orgId,
      },
      include: {
        tasks: true,
      },
    });
  }

  @Get(':id')
  async getProjectById(@Param('id') id: string, @Req() req: RequestWithUser) {
    // First verify that the project belongs to the organization
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        organizationId: req.orgId,
      },
    });

    if (!project) {
      throw new BadRequestException('Project not found or access denied');
    }

    return project;
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async createProject(@Body() data: { name: string; description?: string }, @Req() req: RequestWithUser) {
    return this.prisma.project.create({
      data: {
        ...data,
        organizationId: req.orgId,
      },
    });
  }

  @Put(':id')
  @Roles(UserRole.MEMBER, UserRole.ADMIN, UserRole.OWNER)
  async updateProject(
    @Param('id') id: string,
    @Body() data: { name?: string; description?: string },
    @Req() req: RequestWithUser,
  ) {
    // First verify that the project belongs to the organization
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        organizationId: req.orgId,
      },
    });

    if (!project) {
      throw new BadRequestException('Project not found or access denied');
    }

    return this.prisma.project.update({
      where: {
        id: project.id,
      },
      data,
    });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async deleteProject(@Param('id') id: string, @Req() req: RequestWithUser) {
    // First verify that the project belongs to the organization
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        organizationId: req.orgId,
      },
    });

    if (!project) {
      throw new BadRequestException('Project not found or access denied');
    }

    return this.prisma.project.delete({
      where: {
        id: project.id,
      },
    });
  }
}