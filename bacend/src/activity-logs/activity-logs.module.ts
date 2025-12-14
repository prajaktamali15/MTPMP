import { Module } from '@nestjs/common';
import { ActivityLogsController } from './activity-logs.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';
import { GuardsModule } from '../guards/guards.module';

@Module({
  imports: [PrismaModule, RbacModule, GuardsModule],
  controllers: [ActivityLogsController],
  providers: [],
})
export class ActivityLogsModule {}