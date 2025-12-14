import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';
import { GuardsModule } from '../guards/guards.module';

@Module({
  imports: [PrismaModule, RbacModule, GuardsModule],
  controllers: [ProjectsController],
  providers: [],
})
export class ProjectsModule {}