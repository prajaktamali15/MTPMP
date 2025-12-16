import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';
import { GuardsModule } from '../guards/guards.module';

@Module({
  imports: [PrismaModule, RbacModule, GuardsModule],
  controllers: [TasksController],
  providers: [],
})
export class TasksModule {}
