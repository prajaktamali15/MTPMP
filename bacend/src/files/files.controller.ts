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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrgGuard } from '../guards/org.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../rbac/roles.decorator';
import { RolesGuard } from '../rbac/roles.guard';
import { UserRole } from '../../generated/prisma';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

interface RequestWithUser extends Request {  user: {
    userId: string;
    email: string;
    role: string;
  };
  orgId: string;
}

@Controller('files')
@UseGuards(AuthGuard('jwt'), OrgGuard, RolesGuard)
export class FilesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAllFiles(@Req() req: RequestWithUser) {
    return this.prisma.file.findMany({
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
        project: true,
        task: true,
        uploadedBy: true,
      },
    });
  }

  @Get('project/:projectId')
  async getFilesByProjectId(@Param('projectId') projectId: string, @Req() req: RequestWithUser) {
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

    return this.prisma.file.findMany({
      where: {
        projectId: projectId,
      },
      include: {
        project: true,
        task: true,
        uploadedBy: true,
      },
    });
  }

  @Get('task/:taskId')
  async getFilesByTaskId(@Param('taskId') taskId: string, @Req() req: RequestWithUser) {
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

    return this.prisma.file.findMany({
      where: {
        taskId: taskId,
      },
      include: {
        project: true,
        task: true,
        uploadedBy: true,
      },
    });
  }

  @Get(':id')
  async getFileById(@Param('id') id: string, @Req() req: RequestWithUser) {
    // First verify that the file belongs to the organization
    const file = await this.prisma.file.findFirst({
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
        project: true,
        task: true,
        uploadedBy: true,
      },
    });

    if (!file) {
      throw new BadRequestException('File not found or access denied');
    }

    return file;
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  @Roles(UserRole.MEMBER, UserRole.ADMIN, UserRole.OWNER)
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: { 
      projectId?: string;
      taskId?: string;
    }, 
    @Req() req: RequestWithUser
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
      throw new BadRequestException('Either projectId or taskId must be provided');
    }

    return this.prisma.file.create({
      data: {
        name: file.originalname,
        path: file.path,
        size: file.size,
        mimeType: file.mimetype,
        uploadedById: req.user.userId,
        projectId: data.projectId,
        taskId: data.taskId,
      },
      include: {
        project: true,
        task: true,
        uploadedBy: true,
      },
    });
  }

  @Delete(':id')
  @Roles(UserRole.MEMBER, UserRole.ADMIN, UserRole.OWNER)
  async deleteFile(@Param('id') id: string, @Req() req: RequestWithUser) {
    // First verify that the file belongs to the organization
    const file = await this.prisma.file.findFirst({
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
    });

    if (!file) {
      throw new BadRequestException('File not found or access denied');
    }

    // Check if user is the uploader or has admin rights
    if (file.uploadedById !== req.user.userId && 
        req.user.role !== UserRole.ADMIN && 
        req.user.role !== UserRole.OWNER) {
      throw new BadRequestException('Not authorized to delete this file');
    }

    return this.prisma.file.delete({
      where: {
        id: file.id,
      },
    });
  }
}