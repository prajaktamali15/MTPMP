import { Module } from '@nestjs/common';
import { OrgGuard } from './org.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [OrgGuard],
  exports: [OrgGuard],
})
export class GuardsModule {}