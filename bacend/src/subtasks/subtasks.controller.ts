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

@Controller('subtasks')
@UseGuards(AuthGuard('jwt'), OrgGuard, RolesGuard)
export class SubtasksController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAllSubtasks(@Req() req: RequestWithUser) {
    return this.prisma.subtask.findMany({
      where: {
        task: {
          project: {
            organizationId: req.orgId,
          },
        },
      },
      include: {
        task: true,
      },
    });
  }

  @Get(':id')
  async getSubtaskById(@Param('id') id: string, @Req() req: RequestWithUser) {
    // First verify that the subtask belongs to the organization
    const subtask = await this.prisma.subtask.findFirst({
      where: {
        id,
        task: {
          project: {
            organizationId: req.orgId,
          },
        },
      },
    });

    if (!subtask) {
      throw new BadRequestException('Subtask not found or access denied');
    }

    return subtask;
  }

  @Get('task/:taskId')
  async getSubtasksByTaskId(
    @Param('taskId') taskId: string,
    @Req() req: RequestWithUser,
  ) {
    // First verify that the task belongs to the organization
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          organizationId: req.orgId,
        },
      },
    });

    if (!task) {
      throw new BadRequestException('Task not found or access denied');
    }

    return this.prisma.subtask.findMany({
      where: {
        taskId: taskId,
      },
      include: {
        task: true,
      },
    });
  }

  @Post()
  @Roles(UserRole.MEMBER, UserRole.ADMIN, UserRole.OWNER)
  async createSubtask(
    @Body()
    data: {
      title: string;
      description?: string;
      status?: TaskStatus;
      taskId: string;
    },
    @Req() req: RequestWithUser,
  ) {
    // Validate that taskId is provided
    if (!data.taskId) {
      throw new BadRequestException('Task ID is required');
    }
    
    // Verify that the task belongs to the organization
    const task = await this.prisma.task.findFirst({
      where: {
        id: data.taskId,
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

    // Create the subtask
    const subtask = await this.prisma.subtask.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || TaskStatus.OPEN,
        taskId: data.taskId,
      },
    });
    
    // Create activity log
    await this.prisma.activityLog.create({
      data: {
        action: 'created',
        description: `Created subtask "${subtask.title}" in task "${task.title}" of project "${task.project.name}"`,
        userId: req.user.userId,
        taskId: task.id,
      },
    });
    
    return subtask;
  }

  @Put(':id')
  @Roles(UserRole.MEMBER, UserRole.ADMIN, UserRole.OWNER)
  async updateSubtask(
    @Param('id') id: string,
    @Body()
    data: {
      title?: string;
      description?: string;
      status?: TaskStatus;
    },
    @Req() req: RequestWithUser,
  ) {
    // First verify that the subtask belongs to the organization
    const subtask = await this.prisma.subtask.findFirst({
      where: {
        id,
        task: {
          project: {
            organizationId: req.orgId,
          },
        },
      },
      include: {
        task: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!subtask) {
      throw new BadRequestException('Subtask not found or access denied');
    }

    // Update the subtask
    const updatedSubtask = await this.prisma.subtask.update({
      where: {
        id: subtask.id,
      },
      data,
    });
    
    // Create activity log
    await this.prisma.activityLog.create({
      data: {
        action: 'updated',
        description: `Updated subtask "${updatedSubtask.title}" in task "${subtask.task.title}" of project "${subtask.task.project.name}"`,
        userId: req.user.userId,
        taskId: subtask.task.id,
      },
    });
    
    return updatedSubtask;
  }

  @Delete(':id')
  @Roles(UserRole.MEMBER, UserRole.ADMIN, UserRole.OWNER)
  async deleteSubtask(@Param('id') id: string, @Req() req: RequestWithUser) {
    // First verify that the subtask belongs to the organization
    const subtask = await this.prisma.subtask.findFirst({
      where: {
        id,
        task: {
          project: {
            organizationId: req.orgId,
          },
        },
      },
      include: {
        task: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!subtask) {
      throw new BadRequestException('Subtask not found or access denied');
    }

    // Store subtask title, task title, and project name for activity log before deleting
    const subtaskTitle = subtask.title;
    const taskTitle = subtask.task.title;
    const projectName = subtask.task.project.name;
    
    // Delete the subtask
    const deletedSubtask = await this.prisma.subtask.delete({
      where: {
        id: subtask.id,
      },
    });
    
    // Create activity log
    await this.prisma.activityLog.create({
      data: {
        action: 'deleted',
        description: `Deleted subtask "${subtaskTitle}" from task "${taskTitle}" in project "${projectName}"`,
        userId: req.user.userId,
        taskId: subtask.task.id,
      },
    });
    
    return deletedSubtask;
  }
}