import {
  Controller,
  Get,
  Post,
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

@Controller('activity-logs')
@UseGuards(AuthGuard('jwt'), OrgGuard, RolesGuard)
export class ActivityLogsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAllActivityLogs(@Req() req: RequestWithUser) {
    return this.prisma.activityLog.findMany({
      where: {
        OR: [
          {
            project: {
              organizationId: req.orgId,
            },
          },
          {
            task: {
              project: {
                organizationId: req.orgId,
              },
            },
          },
        ],
      },
      include: {
        user: true,
        project: true,
        task: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  @Get('project/:projectId')
  async getActivityLogsByProjectId(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithUser,
  ) {
    // First verify that the project belongs to the organization
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: req.orgId,
      },
    });

    if (!project) {
      throw new BadRequestException('Project not found or access denied');
    }

    return this.prisma.activityLog.findMany({
      where: {
        projectId: projectId,
      },
      include: {
        user: true,
        project: true,
        task: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  @Get('task/:taskId')
  async getActivityLogsByTaskId(
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

    return this.prisma.activityLog.findMany({
      where: {
        taskId: taskId,
      },
      include: {
        user: true,
        project: true,
        task: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  @Get(':id')
  async getActivityLogById(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    // First verify that the activity log belongs to the organization
    const activityLog = await this.prisma.activityLog.findFirst({
      where: {
        id,
        OR: [
          {
            project: {
              organizationId: req.orgId,
            },
          },
          {
            task: {
              project: {
                organizationId: req.orgId,
              },
            },
          },
        ],
      },
      include: {
        user: true,
        project: true,
        task: true,
      },
    });

    if (!activityLog) {
      throw new BadRequestException('Activity log not found or access denied');
    }

    return activityLog;
  }

  @Post()
  @Roles(UserRole.MEMBER, UserRole.ADMIN, UserRole.OWNER)
  async createActivityLog(
    @Body()
    data: {
      action: string;
      description?: string;
      projectId?: string;
      taskId?: string;
    },
    @Req() req: RequestWithUser,
  ) {
    // Verify that the project or task belongs to the organization
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

    if (data.taskId) {
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
    }

    // If neither project nor task is provided, throw an error
    if (!data.projectId && !data.taskId) {
      throw new BadRequestException(
        'Either projectId or taskId must be provided',
      );
    }

    return this.prisma.activityLog.create({
      data: {
        action: data.action,
        description: data.description,
        userId: req.user.userId,
        projectId: data.projectId,
        taskId: data.taskId,
      },
      include: {
        user: true,
        project: true,
        task: true,
      },
    });
  }
}
