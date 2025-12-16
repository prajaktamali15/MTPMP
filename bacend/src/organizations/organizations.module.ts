import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GuardsModule } from '../guards/guards.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [PrismaModule, GuardsModule, RbacModule],
  controllers: [OrganizationsController],
  providers: [],
  exports: [],
})
export class OrganizationsModule {}
