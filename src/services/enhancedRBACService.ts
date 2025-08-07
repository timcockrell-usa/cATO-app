/**
 * Enhanced RBAC Service for DoD cATO Implementation
 * Implements the complete DoD authorization hierarchy with role-based permissions
 */

import { DoDAORole, DoDAORolePermissions, ProtectedResource, PermissionLevel, DoDAOUser } from '../types/dodCATOTypes';

// DoD role definitions with detailed permissions
const DOD_ROLE_PERMISSIONS: Record<DoDAORole, DoDAORolePermissions> = {
  Engineer: {
    role: 'Engineer',
    permissions: {
      nist_controls: ['read'],
      zta_activities: ['read'],
      poam_items: ['read'],
      execution_enablers: ['read'],
      sssc_metrics: ['read'],
      compliance_reports: ['read'],
      risk_assessments: ['read'],
      tenant_management: [],
      user_management: [],
      audit_logs: ['read']
    },
    canApproveExceptions: false,
    approvalLevel: 0,
    description: 'Basic engineering role with read-only access to most resources'
  },
  
  SecurityEngineer: {
    role: 'SecurityEngineer',
    permissions: {
      nist_controls: ['read', 'write'],
      zta_activities: ['read', 'write'],
      poam_items: ['read', 'write'],
      execution_enablers: ['read', 'write'],
      sssc_metrics: ['read', 'write'],
      compliance_reports: ['read', 'write'],
      risk_assessments: ['read', 'write'],
      tenant_management: [],
      user_management: [],
      audit_logs: ['read']
    },
    canApproveExceptions: false,
    approvalLevel: 1,
    description: 'Information Systems Security Engineer (ISSE) with full write access to security controls and POA&Ms'
  },
  
  ISSO: {
    role: 'ISSO',
    permissions: {
      nist_controls: ['read', 'write', 'approve'],
      zta_activities: ['read', 'write', 'approve'],
      poam_items: ['read', 'write', 'approve'],
      execution_enablers: ['read', 'write'],
      sssc_metrics: ['read', 'write'],
      compliance_reports: ['read', 'write'],
      risk_assessments: ['read', 'write', 'approve'],
      tenant_management: ['read'],
      user_management: ['read'],
      audit_logs: ['read']
    },
    canApproveExceptions: true,
    approvalLevel: 2,
    description: 'Information Systems Security Officer with approval authority for low-risk items'
  },
  
  ISSM: {
    role: 'ISSM',
    permissions: {
      nist_controls: ['read', 'write', 'approve'],
      zta_activities: ['read', 'write', 'approve'],
      poam_items: ['read', 'write', 'approve'],
      execution_enablers: ['read', 'write', 'approve'],
      sssc_metrics: ['read', 'write', 'approve'],
      compliance_reports: ['read', 'write', 'approve'],
      risk_assessments: ['read', 'write', 'approve'],
      tenant_management: ['read', 'write'],
      user_management: ['read'],
      audit_logs: ['read']
    },
    canApproveExceptions: true,
    approvalLevel: 3,
    description: 'Information Systems Security Manager with broad approval authority'
  },
  
  RiskManagementOfficer: {
    role: 'RiskManagementOfficer',
    permissions: {
      nist_controls: ['read', 'write', 'approve'],
      zta_activities: ['read', 'write', 'approve'],
      poam_items: ['read', 'write', 'approve'],
      execution_enablers: ['read', 'write', 'approve'],
      sssc_metrics: ['read', 'write', 'approve'],
      compliance_reports: ['read', 'write', 'approve'],
      risk_assessments: ['read', 'write', 'approve'],
      tenant_management: ['read', 'write'],
      user_management: ['read', 'write'],
      audit_logs: ['read']
    },
    canApproveExceptions: true,
    approvalLevel: 4,
    description: 'Risk Management Officer with comprehensive risk assessment and approval authority'
  },
  
  AuthorizingOfficer: {
    role: 'AuthorizingOfficer',
    permissions: {
      nist_controls: ['read', 'write', 'approve', 'admin'],
      zta_activities: ['read', 'write', 'approve', 'admin'],
      poam_items: ['read', 'write', 'approve', 'admin'],
      execution_enablers: ['read', 'write', 'approve', 'admin'],
      sssc_metrics: ['read', 'write', 'approve', 'admin'],
      compliance_reports: ['read', 'write', 'approve', 'admin'],
      risk_assessments: ['read', 'write', 'approve', 'admin'],
      tenant_management: ['read', 'write', 'approve', 'admin'],
      user_management: ['read', 'write', 'approve', 'admin'],
      audit_logs: ['read', 'admin']
    },
    canApproveExceptions: true,
    approvalLevel: 5,
    description: 'Authorizing Officer with ultimate authority over all system resources and approvals'
  },
  
  ReadOnlyUser: {
    role: 'ReadOnlyUser',
    permissions: {
      nist_controls: ['read'],
      zta_activities: ['read'],
      poam_items: ['read'],
      execution_enablers: ['read'],
      sssc_metrics: ['read'],
      compliance_reports: ['read'],
      risk_assessments: ['read'],
      tenant_management: [],
      user_management: [],
      audit_logs: []
    },
    canApproveExceptions: false,
    approvalLevel: 0,
    description: 'Read-only user with limited access to view compliance information'
  }
};

class EnhancedRBACService {
  /**
   * Check if a user has specific permission for a resource
   */
  hasPermission(
    userRole: DoDAORole, 
    resource: ProtectedResource, 
    permission: PermissionLevel
  ): boolean {
    const rolePermissions = DOD_ROLE_PERMISSIONS[userRole];
    const resourcePermissions = rolePermissions.permissions[resource];
    
    return resourcePermissions.includes(permission);
  }

  /**
   * Check if a user can approve exceptions at a given level
   */
  canApproveAtLevel(userRole: DoDAORole, requiredLevel: number): boolean {
    const rolePermissions = DOD_ROLE_PERMISSIONS[userRole];
    return rolePermissions.canApproveExceptions && rolePermissions.approvalLevel >= requiredLevel;
  }

  /**
   * Get the approval level for a user role
   */
  getApprovalLevel(userRole: DoDAORole): number {
    return DOD_ROLE_PERMISSIONS[userRole].approvalLevel;
  }

  /**
   * Get all permissions for a role
   */
  getRolePermissions(userRole: DoDAORole): DoDAORolePermissions {
    return DOD_ROLE_PERMISSIONS[userRole];
  }

  /**
   * Get the next required approval level in the hierarchy
   */
  getNextApprovalLevel(currentLevel: number): number | null {
    const levels = Object.values(DOD_ROLE_PERMISSIONS)
      .map(role => role.approvalLevel)
      .filter(level => level > currentLevel)
      .sort((a, b) => a - b);
    
    return levels.length > 0 ? levels[0] : null;
  }

  /**
   * Get roles that can approve at a specific level
   */
  getRolesForApprovalLevel(requiredLevel: number): DoDAORole[] {
    return Object.values(DOD_ROLE_PERMISSIONS)
      .filter(role => role.canApproveExceptions && role.approvalLevel >= requiredLevel)
      .map(role => role.role);
  }

  /**
   * Validate if a user can perform an action on a resource
   */
  validateAccess(
    user: DoDAOUser, 
    resource: ProtectedResource, 
    action: PermissionLevel
  ): { allowed: boolean; reason?: string } {
    // Check if user account is active
    if (user.accountLocked) {
      return { allowed: false, reason: 'Account is locked' };
    }

    // Check if user has required permission
    if (!this.hasPermission(user.role, resource, action)) {
      return { 
        allowed: false, 
        reason: `Role ${user.role} does not have ${action} permission for ${resource}` 
      };
    }

    return { allowed: true };
  }

  /**
   * Get filtered resources based on user permissions
   */
  getAccessibleResources(userRole: DoDAORole): ProtectedResource[] {
    const rolePermissions = DOD_ROLE_PERMISSIONS[userRole];
    return Object.entries(rolePermissions.permissions)
      .filter(([resource, permissions]) => permissions.length > 0)
      .map(([resource]) => resource as ProtectedResource);
  }

  /**
   * Generate role hierarchy for approval workflows
   */
  getApprovalHierarchy(): Array<{ level: number; roles: DoDAORole[]; description: string }> {
    const levels = Array.from(new Set(
      Object.values(DOD_ROLE_PERMISSIONS)
        .filter(role => role.canApproveExceptions)
        .map(role => role.approvalLevel)
    )).sort((a, b) => a - b);

    return levels.map(level => ({
      level,
      roles: Object.values(DOD_ROLE_PERMISSIONS)
        .filter(role => role.approvalLevel === level && role.canApproveExceptions)
        .map(role => role.role),
      description: this.getApprovalLevelDescription(level)
    }));
  }

  /**
   * Get description for approval level
   */
  private getApprovalLevelDescription(level: number): string {
    switch (level) {
      case 1: return 'Initial security review';
      case 2: return 'Security officer approval';
      case 3: return 'Security manager approval';
      case 4: return 'Risk management assessment';
      case 5: return 'Final authorization approval';
      default: return 'Unknown approval level';
    }
  }

  /**
   * Check if user can delegate approval authority
   */
  canDelegate(userRole: DoDAORole): boolean {
    const rolePermissions = DOD_ROLE_PERMISSIONS[userRole];
    return rolePermissions.approvalLevel >= 3; // ISSM and above can delegate
  }

  /**
   * Check if user can escalate to next level
   */
  canEscalate(userRole: DoDAORole): boolean {
    const rolePermissions = DOD_ROLE_PERMISSIONS[userRole];
    return rolePermissions.canApproveExceptions && rolePermissions.approvalLevel < 5;
  }

  /**
   * Get required clearance for resource access
   */
  getRequiredClearance(resource: ProtectedResource): string[] {
    // Define clearance requirements for different resources
    const clearanceRequirements: Record<ProtectedResource, string[]> = {
      nist_controls: ['Public_Trust'],
      zta_activities: ['Public_Trust'],
      poam_items: ['Public_Trust'],
      execution_enablers: ['Public_Trust'],
      sssc_metrics: ['Public_Trust'],
      compliance_reports: ['Public_Trust'],
      risk_assessments: ['Secret'],
      tenant_management: ['Secret'],
      user_management: ['Secret'],
      audit_logs: ['Secret']
    };

    return clearanceRequirements[resource] || ['Public_Trust'];
  }

  /**
   * Validate user clearance for resource access
   */
  validateClearance(
    userClearance: string | undefined, 
    resource: ProtectedResource
  ): boolean {
    if (!userClearance) return false;

    const requiredClearances = this.getRequiredClearance(resource);
    const clearanceHierarchy = ['Public_Trust', 'Secret', 'Top_Secret'];
    
    const userLevel = clearanceHierarchy.indexOf(userClearance);
    const requiredLevel = Math.min(
      ...requiredClearances.map(clearance => clearanceHierarchy.indexOf(clearance))
    );

    return userLevel >= requiredLevel;
  }
}

// Singleton instance
export const rbacService = new EnhancedRBACService();

// Export types and service
export { EnhancedRBACService, DOD_ROLE_PERMISSIONS };
export type { DoDAORole, DoDAORolePermissions, ProtectedResource, PermissionLevel };
