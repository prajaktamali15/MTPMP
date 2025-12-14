import { Module } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [PrismaModule],
  providers: [RbacService, RolesGuard],
  exports: [RbacService, RolesGuard],
})
export class RbacModule {}