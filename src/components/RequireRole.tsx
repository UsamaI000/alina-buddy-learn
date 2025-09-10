import React from 'react';
import type { UserRole } from '@/types/auth';

interface RequireRoleProps {
  children: React.ReactNode;
  roles: UserRole[];
  userRole?: UserRole | null;
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user role
 * This is for UI visibility only - server-side validation is still required
 */
export function RequireRole({ 
  children, 
  roles, 
  userRole, 
  fallback = null 
}: RequireRoleProps) {
  if (!userRole || !roles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Hook for role-based conditional rendering
export function useRoleCheck(roles: UserRole[], userRole?: UserRole | null): boolean {
  return userRole ? roles.includes(userRole) : false;
}