// Authentication and role types
export type UserRole = 'AUSZUBILDENDE_R' | 'AUSBILDER_IN';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  apprenticeship: string;
  email: string;
}

export interface AuthSession {
  user: AppUser;
  token: string;
}

// Role mapping for legacy compatibility
export const ROLE_MAPPING = {
  'student': 'AUSZUBILDENDE_R' as UserRole,
  'instructor': 'AUSBILDER_IN' as UserRole,
  'AUSZUBILDENDE_R': 'AUSZUBILDENDE_R' as UserRole,
  'AUSBILDER_IN': 'AUSBILDER_IN' as UserRole,
} as const;

// Route definitions for each role
export const ROLE_ROUTES = {
  AUSZUBILDENDE_R: '/azubi/home',
  AUSBILDER_IN: '/ausbilder/dashboard',
} as const;

// Role display names
export const ROLE_DISPLAY_NAMES = {
  AUSZUBILDENDE_R: 'Auszubildende/r',
  AUSBILDER_IN: 'Ausbilder/in',
} as const;

// Navigation configuration with role-based access
export const NAV_CONFIG = [
  {
    id: 'azubi-home',
    label: 'Mein Bereich',
    allowedRoles: ['AUSZUBILDENDE_R'] as UserRole[],
    path: '/azubi/home'
  },
  {
    id: 'azubi-learning-modules',
    label: 'Lernmodule',
    allowedRoles: ['AUSZUBILDENDE_R'] as UserRole[],
    path: '/azubi/learning-modules'
  },
  {
    id: 'ausbilder-dashboard', 
    label: 'Ausbilder Dashboard',
    allowedRoles: ['AUSBILDER_IN'] as UserRole[],
    path: '/ausbilder/dashboard'
  },
  {
    id: 'chat',
    label: 'ALINA Chat',
    allowedRoles: ['AUSZUBILDENDE_R', 'AUSBILDER_IN'] as UserRole[],
    path: '/chat'
  }
] as const;