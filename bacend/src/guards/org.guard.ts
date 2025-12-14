import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrgGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const orgId = req.orgId;

    // Allow auth routes to pass through
    if (req.path && req.path.startsWith('/auth')) {
      return true;
    }

    // Allow invitation routes to pass through
    if (req.path && req.path.startsWith('/invitations')) {
      return true;
    }

    if (!user) {
      throw new UnauthorizedException('No user logged in');
    }

    // If no orgId is provided, check if user belongs to any organization
    if (!orgId) {
      const userOrg = await this.prisma.user.findUnique({
        where: {
          id: user.userId,
        },
        include: {
          organization: true,
        },
      });

      // If user doesn't belong to any organization, allow the request to proceed
      // This is needed for endpoints like getting user organizations
      if (!userOrg || !userOrg.organization) {
        return true;
      }

      // If user belongs to an organization, but no orgId was provided, deny access
      throw new ForbiddenException('Organization ID required for this operation');
    }

    // Check if user belongs to the specified organization
    const userOrg = await this.prisma.user.findUnique({
      where: {
        id: user.userId,
      },
      include: {
        organization: true,
      },
    });

    if (!userOrg || !userOrg.organization) {
      throw new ForbiddenException('User does not belong to any organization');
    }

    if (userOrg.organizationId !== orgId) {
      throw new ForbiddenException(
        'Access denied: User does not belong to this organization',
      );
    }

    return true;
  }
}