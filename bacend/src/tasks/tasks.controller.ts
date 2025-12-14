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
import { TaskStatus } from '../../generated/prisma';
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

@Controller('tasks')
@UseGuards(AuthGuard('jwt'), OrgGuard, RolesGuard)
export class TasksController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAllTasks(@Req() req: RequestWithUser) {
    return this.prisma.task.findMany({
      where: {
        project: {
          organizationId: req.orgId,
        },
      },
      include: {
        project: true,
        assignee: true,
      },
    });
  }

  @Get(':id')
  async getTaskById(@Param('id') id: string, @Req() req: RequestWithUser) {
    // First verify that the task belongs to the organization
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        project: {
          organizationId: req.orgId,
        },
      },
    });

    if (!task) {
      throw new BadRequestException('Task not found or access denied');
    }

    return task;
  }

  @Post()
  @Roles(UserRole.MEMBER, UserRole.ADMIN, UserRole.OWNER)
  async createTask(
    @Body() data: { 
      title: string; 
      description?: string;
      status?: TaskStatus;
      priority?: number;
      dueDate?: string;
      projectId: string;
    }, 
    @Req() req: RequestWithUser
  ) {
    // Verify that the project belongs to the organization
    const project = await this.prisma.project.findFirst({
      where: {
        id: data.projectId,
        organizationId: req.orgId,
      },
    });

    if (!project) {
      throw new BadRequestException('Project not found or access denied');
    }

    // Convert dueDate string to Date if provided
    let dueDate: Date | undefined;
    if (data.dueDate) {
      dueDate = new Date(data.dueDate);
    }

    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || TaskStatus.OPEN,
        priority: data.priority,
        dueDate: dueDate,
        projectId: data.projectId,
      },
    });
  }

  @Put(':id')
  @Roles(UserRole.MEMBER, UserRole.ADMIN, UserRole.OWNER)
  async updateTask(
    @Param('id') id: string,
    @Body() data: { 
      title?: string; 
      description?: string;
      status?: TaskStatus;
      priority?: number;
      dueDate?: string;
      projectId?: string;
    },
    @Req() req: RequestWithUser,
  ) {
    // First verify that the task belongs to the organization
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        project: {
          organizationId: req.orgId,
        },
      },
    });

    if (!task) {
      throw new BadRequestException('Task not found or access denied');
    }

    // If projectId is being updated, verify that the new project belongs to the organization
    if (data.projectId) {
      const project = await this.prisma.project.findFirst({
        where: {
          id: data.projectId,
          organizationId: req.orgId,
        },
      });

      if (!project) {
        throw new BadRequestException('Project not found or access denied');
      }
    }

    // Convert dueDate string to Date if provided
    let dueDate: Date | undefined | null = undefined;
    if (data.dueDate !== undefined) {
      dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    // Build the update data object
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (data.projectId !== undefined) updateData.projectId = data.projectId;

    return this.prisma.task.update({
      where: {
        id: task.id,
      },
      data: updateData,
    });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async deleteTask(@Param('id') id: string, @Req() req: RequestWithUser) {
    // First verify that the task belongs to the organization
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        project: {
          organizationId: req.orgId,
        },
      },
    });

    if (!task) {
      throw new BadRequestException('Task not found or access denied');
    }

    return this.prisma.task.delete({
      where: {
        id: task.id,
      },
    });
  }
}