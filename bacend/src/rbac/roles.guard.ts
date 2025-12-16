import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from './rbac.service';
import { UserRole } from '../../generated/prisma';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // For invitation routes, get orgId from headers instead of request.orgId
    let orgId = request.orgId;
    if (!orgId && request.path && request.path.startsWith('/invitations')) {
      orgId = request.headers['x-org-id'] as string;
    }

    // Check if user and orgId are present
    if (!user || !orgId) {
      throw new ForbiddenException(
        'Access denied: User or organization not specified',
      );
    }

    // Check if user has any of the required roles
    for (const role of requiredRoles) {
      if (await this.rbacService.hasRole(user.userId, orgId, role)) {
        return true;
      }
    }

    throw new ForbiddenException('Access denied: Insufficient privileges');
  }
}