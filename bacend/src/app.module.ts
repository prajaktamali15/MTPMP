import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { GuardsModule } from './guards/guards.module';
import { SubtasksModule } from './subtasks/subtasks.module';
import { CommentsModule } from './comments/comments.module';
import { FilesModule } from './files/files.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { orgMiddleware } from './common/middleware/org.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 10, // 10 requests per 60 seconds
    }]),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    TasksModule,
    GuardsModule,
    SubtasksModule,
    CommentsModule,
    FilesModule,
    ActivityLogsModule,
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