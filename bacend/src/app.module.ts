import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { GuardsModule } from './guards/guards.module';
import { orgMiddleware } from './common/middleware/org.middleware';
import { OrganizationsModule } from './organizations/organizations.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module'; // Add ActivityLogsModule
import { SubtasksModule } from './subtasks/subtasks.module'; // Add SubtasksModule
import { InvitationsModule } from './invitations/invitations.module'; // Add InvitationsModule
import { FilesModule } from './files/files.module'; // Add FilesModule
import { CommentsModule } from './comments/comments.module'; // Add CommentsModule

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 10, // 10 requests per 60 seconds
      },
    ]),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    TasksModule,
    GuardsModule,
    OrganizationsModule, // Add the missing OrganizationsModule
    ActivityLogsModule, // Add the missing ActivityLogsModule
    SubtasksModule, // Add the missing SubtasksModule
    InvitationsModule, // Add the missing InvitationsModule
    FilesModule, // Add the missing FilesModule
    CommentsModule, // Add the missing CommentsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(orgMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}