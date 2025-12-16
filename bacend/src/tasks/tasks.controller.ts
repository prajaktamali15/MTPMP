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
      include: {
        project: true,
        assignee: true,
        comments: true,
        subtasks: true,
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
    @Body()
    data: {
      title: string;
      description?: string;
      projectId: string;
      assigneeId?: string;
    },
    @Req() req: RequestWithUser,
  ) {
    // Validate that projectId is provided
    if (!data.projectId) {
      throw new BadRequestException('Project ID is required');
    }
    
    // First verify that the project belongs to the organization
    const project = await this.prisma.project.findFirst({
      where: {
        id: data.projectId,
        organizationId: req.orgId,
      },
    });

    if (!project) {
      throw new BadRequestException('Project not found or access denied');
    }

    // Create the task
    const task = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: TaskStatus.OPEN,
        projectId: data.projectId,
        assigneeId: data.assigneeId,
      },
    });
    
    // Create activity log
    await this.prisma.activityLog.create({
      data: {
        action: 'created',
        description: `Created task "${task.title}" in project "${project.name}"`,
        userId: req.user.userId,
        taskId: task.id,
        projectId: project.id,
      },
    });
    
    return task;
  }

  @Put(':id')
  @Roles(UserRole.MEMBER, UserRole.ADMIN, UserRole.OWNER)
  async updateTask(
    @Param('id') id: string,
    @Body()
    data: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      assigneeId?: string;
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
      include: {
        project: true,
      },
    });

    if (!task) {
      throw new BadRequestException('Task not found or access denied');
    }

    // Update the task
    const updatedTask = await this.prisma.task.update({
      where: {
        id: task.id,
      },
      data,
    });
    
    // Create activity log
    await this.prisma.activityLog.create({
      data: {
        action: 'updated',
        description: `Updated task "${updatedTask.title}" in project "${task.project.name}"`,
        userId: req.user.userId,
        taskId: updatedTask.id,
        projectId: task.project.id,
      },
    });
    
    return updatedTask;
  }

  @Delete(':id')
  @Roles(UserRole.MEMBER, UserRole.ADMIN, UserRole.OWNER)
  async deleteTask(@Param('id') id: string, @Req() req: RequestWithUser) {
    // First verify that the task belongs to the organization
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        project: {
          organizationId: req.orgId,
        },
      },
      include: {
        project: true,
      },
    });

    if (!task) {
      throw new BadRequestException('Task not found or access denied');
    }

    // Store task title and project name for activity log before deleting
    const taskTitle = task.title;
    const projectName = task.project.name;
    
    // Delete the task
    const deletedTask = await this.prisma.task.delete({
      where: {
        id: task.id,
      },
    });
    
    // Create activity log
    await this.prisma.activityLog.create({
      data: {
        action: 'deleted',
        description: `Deleted task "${taskTitle}" from project "${projectName}"`,
        userId: req.user.userId,
        taskId: task.id,  // Use task.id instead of deletedTask.id
        projectId: task.project.id,
      },
    });
    
    return deletedTask;
  }
}