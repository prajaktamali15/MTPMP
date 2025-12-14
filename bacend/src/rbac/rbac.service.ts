import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../../generated/prisma';

@Injectable()
export class RbacService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check if a user has a specific role in an organization
   */
  async hasRole(userId: string, orgId: string, requiredRole: UserRole): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // Check if user exists and belongs to the organization
    if (!user || user.organizationId !== orgId) {
      return false;
    }

    // Check if user has the required role or higher privilege
    return this.hasRequiredPrivilege(user.role, requiredRole);
  }

  /**
   * Check if a user has the required privilege level
   */
  private hasRequiredPrivilege(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.OWNER]: 4,
      [UserRole.ADMIN]: 3,
      [UserRole.MEMBER]: 2,
      [UserRole.GUEST]: 1,
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  /**
   * Assign a role to a user in an organization
   */
  async assignRole(userId: string, orgId: string, role: UserRole): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        role: role,
        organization: { connect: { id: orgId } }
      },
    });
  }

  /**
   * Get user's role in an organization
   */
  async getUserRole(userId: string, orgId: string): Promise<UserRole | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.organizationId !== orgId) {
      return null;
    }

    return user.role;
  }
}