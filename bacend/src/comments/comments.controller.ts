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

@Controller('comments')
@UseGuards(AuthGuard('jwt'), OrgGuard, RolesGuard)
export class CommentsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAllComments(@Req() req: RequestWithUser) {
    return this.prisma.comment.findMany({
      where: {
        task: {
          project: {
            organizationId: req.orgId,
          },
        },
      },
      include: {
        task: true,
        author: true,
      },
    });
  }

  @Get('task/:taskId')
  async getCommentsByTaskId(
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

    return this.prisma.comment.findMany({
      where: {
        taskId: taskId,
      },
      include: {
        task: true,
        author: true,
      },
    });
  }

  @Get(':id')
  async getCommentById(@Param('id') id: string, @Req() req: RequestWithUser) {
    // First verify that the comment belongs to the organization
    const comment = await this.prisma.comment.findFirst({
      where: {
        id,
        task: {
          project: {
            organizationId: req.orgId,
          },
        },
      },
      include: {
        task: true,
        author: true,
      },
    });

    if (!comment) {
      throw new BadRequestException('Comment not found or access denied');
    }

    return comment;
  }

  @Post()
  @Roles(UserRole.MEMBER, UserRole.ADMIN, UserRole.OWNER)
  async createComment(
    @Body()
    data: {
      content: string;
      taskId: string;
    },
    @Req() req: RequestWithUser,
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

    return this.prisma.comment.create({
      data: {
        content: data.content,
        taskId: data.taskId,
        authorId: req.user.userId,
      },
      include: {
        task: true,
        author: true,
      },
    });
  }

  @Put(':id')
  @Roles(UserRole.MEMBER, UserRole.ADMIN, UserRole.OWNER)
  async updateComment(
    @Param('id') id: string,
    @Body()
    data: {
      content?: string;
    },
    @Req() req: RequestWithUser,
  ) {
    // First verify that the comment belongs to the organization and the user is the author
    const comment = await this.prisma.comment.findFirst({
      where: {
        id,
        task: {
          project: {
            organizationId: req.orgId,
          },
        },
        authorId: req.user.userId,
      },
    });

    if (!comment) {
      throw new BadRequestException('Comment not found or access denied');
    }

    return this.prisma.comment.update({
      where: {
        id: comment.id,
      },
      data,
      include: {
        task: true,
        author: true,
      },
    });
  }

  @Delete(':id')
  @Roles(UserRole.MEMBER, UserRole.ADMIN, UserRole.OWNER)
  async deleteComment(@Param('id') id: string, @Req() req: RequestWithUser) {
    // First verify that the comment belongs to the organization and the user is the author or admin
    const comment = await this.prisma.comment.findFirst({
      where: {
        id,
        task: {
          project: {
            organizationId: req.orgId,
          },
        },
      },
    });

    if (!comment) {
      throw new BadRequestException('Comment not found or access denied');
    }

    // Check if user is the author or has admin rights
    if (
      comment.authorId !== req.user.userId &&
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.OWNER
    ) {
      throw new BadRequestException('Not authorized to delete this comment');
    }

    return this.prisma.comment.delete({
      where: {
        id: comment.id,
      },
    });
  }
}
