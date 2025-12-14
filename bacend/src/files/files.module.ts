import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';
import { GuardsModule } from '../guards/guards.module';

@Module({
  imports: [PrismaModule, RbacModule, GuardsModule],
  controllers: [FilesController],
  providers: [],
})
export class FilesModule {}