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
  async getSubtasksByTaskId(@Param('taskId') taskId: string, @Req() req: RequestWithUser) {
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
    @Body() data: { 
      title: string; 
      description?: string;
      status?: TaskStatus;
      taskId: string;
    }, 
    @Req() req: RequestWithUser
  ) {
    // Verify that the task belongs to the organization
    const task = await this.prisma.task.findFirst({
      where: {
        id: data.taskId,
        project: {
          organizationId: req.orgId,
        },
      },
    });

    if (!task) {
      throw new BadRequestException('Task not found or access denied');
    }

    return this.prisma.subtask.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || TaskStatus.OPEN,
        taskId: data.taskId,
      },
    });
  }

  @Put(':id')
  @Roles(UserRole.MEMBER, UserRole.ADMIN, UserRole.OWNER)
  async updateSubtask(
    @Param('id') id: string,
    @Body() data: { 
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
    });

    if (!subtask) {
      throw new BadRequestException('Subtask not found or access denied');
    }

    return this.prisma.subtask.update({
      where: {
        id: subtask.id,
      },
      data,
    });
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
    });

    if (!subtask) {
      throw new BadRequestException('Subtask not found or access denied');
    }

    return this.prisma.subtask.delete({
      where: {
        id: subtask.id,
      },
    });
  }
}