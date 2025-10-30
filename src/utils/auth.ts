import { supabase } from '@/integrations/supabase/client';
import type { UserRole, AppUser } from '@/types/auth';

/**
 * Get current user role from session
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) return null;

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .single();

  return roleData?.role || null;
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole | null, requiredRoles: UserRole[]): boolean {
  return userRole ? requiredRoles.includes(userRole) : false;
}

/**
 * Get redirect URL based on user role
 */
export function getRoleBasedRedirect(role: UserRole): string {
  const routes = {
    AUSZUBILDENDE_R: '/azubi/home',
    AUSBILDER_IN: '/ausbilder/dashboard',
  };
  return routes[role];
}

/**
 * Map legacy role values to new enum values
 */
export function mapLegacyRole(legacyRole: string): UserRole {
  const mapping = {
    'student': 'AUSZUBILDENDE_R' as UserRole,
    'instructor': 'AUSBILDER_IN' as UserRole,
    'AUSZUBILDENDE_R': 'AUSZUBILDENDE_R' as UserRole,
    'AUSBILDER_IN': 'AUSBILDER_IN' as UserRole,
  };
  return mapping[legacyRole as keyof typeof mapping] || 'AUSZUBILDENDE_R';
}

/**
 * Validate user role with server-side check
 * Used for API protection
 */
export async function validateUserRole(requiredRoles: UserRole[]): Promise<{
  isValid: boolean;
  user: AppUser | null;
  error?: string;
}> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { isValid: false, user: null, error: 'Not authenticated' };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || !profile) {
      return { isValid: false, user: null, error: 'Profile not found' };
    }

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (roleError || !roleData) {
      return { isValid: false, user: null, error: 'Role not found' };
    }

    const userRole = roleData.role as UserRole;
    
    if (!hasRole(userRole, requiredRoles)) {
      return { 
        isValid: false, 
        user: null, 
        error: `Insufficient permissions. Required: ${requiredRoles.join(', ')}` 
      };
    }

    const user: AppUser = {
      id: session.user.id,
      name: `${profile.first_name} ${profile.last_name}`,
      role: userRole,
      apprenticeship: profile.apprenticeship || '',
      email: session.user.email || '',
    };

    return { isValid: true, user };
  } catch (error) {
    return { 
      isValid: false, 
      user: null, 
      error: 'Validation failed' 
    };
  }
}