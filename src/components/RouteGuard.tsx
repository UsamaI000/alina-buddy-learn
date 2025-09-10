import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '@/types/auth';
import { validateUserRole, getRoleBasedRedirect } from '@/utils/auth';
import { Skeleton } from '@/components/ui/skeleton';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRoles: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * Route guard component that validates user permissions server-side
 * Redirects unauthorized users to their appropriate dashboard
 */
export function RouteGuard({ children, requiredRoles, fallback }: RouteGuardProps) {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const validateAccess = async () => {
      const { isValid, user, error } = await validateUserRole(requiredRoles);
      
      if (!isValid) {
        console.warn('Route access denied:', error);
        
        if (user) {
          // User is authenticated but doesn't have permission - redirect to their dashboard
          const redirectPath = getRoleBasedRedirect(user.role);
          navigate(redirectPath, { replace: true });
        } else {
          // User is not authenticated - redirect to login
          navigate('/login', { replace: true });
        }
        
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
      
      setIsValidating(false);
    };

    validateAccess();
  }, [requiredRoles, navigate]);

  if (isValidating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="w-32 h-8 mx-auto" />
          <Skeleton className="w-48 h-4 mx-auto" />
          <p className="text-sm text-muted-foreground">Überprüfe Berechtigung...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}