import { Module } from '@nestjs/common';
import { SubtasksController } from './subtasks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';
import { GuardsModule } from '../guards/guards.module';

@Module({
  imports: [PrismaModule, RbacModule, GuardsModule],
  controllers: [SubtasksController],
  providers: [],
})
export class SubtasksModule {}
