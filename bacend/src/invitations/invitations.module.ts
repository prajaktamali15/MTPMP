import { Module } from '@nestjs/common';
import { InvitationsController } from './invitations.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';
import { GuardsModule } from '../guards/guards.module';

@Module({
  imports: [PrismaModule, RbacModule, GuardsModule],
  controllers: [InvitationsController],
  providers: [],
})
export class InvitationsModule {}