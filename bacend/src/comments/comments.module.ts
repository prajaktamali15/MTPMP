import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';
import { GuardsModule } from '../guards/guards.module';

@Module({
  imports: [PrismaModule, RbacModule, GuardsModule],
  controllers: [CommentsController],
  providers: [],
})
export class CommentsModule {}
