import { useEffect, useState } from 'react';
import type { UserRole } from '@/types/auth';
import { validateUserRole } from '@/utils/auth';
import { useToast } from '@/hooks/use-toast';

interface ApiGuardResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for protecting API calls with role validation
 * Use this before making any sensitive API requests
 */
export function useApiGuard<T>(
  requiredRoles: UserRole[],
  apiCall: () => Promise<T>,
  enabled = true
): ApiGuardResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled) return;

    const executeApiCall = async () => {
      setLoading(true);
      setError(null);

      try {
        // First validate user role
        const { isValid, error: validationError } = await validateUserRole(requiredRoles);
        
        if (!isValid) {
          setError(validationError || 'Unauthorized access');
          toast({
            title: 'Zugriff verweigert',
            description: validationError || 'Sie haben keine Berechtigung für diese Aktion.',
            variant: 'destructive'
          });
          return;
        }

        // If validation passes, execute the API call
        const result = await apiCall();
        setData(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten';
        setError(errorMessage);
        toast({
          title: 'Fehler',
          description: errorMessage,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    executeApiCall();
  }, [requiredRoles, enabled, apiCall, toast]);

  return { data, loading, error };
}

/**
 * Helper function to create role-protected API endpoints
 */
export async function protectedApiCall<T>(
  requiredRoles: UserRole[],
  apiFunction: () => Promise<T>
): Promise<T> {
  const { isValid, error } = await validateUserRole(requiredRoles);
  
  if (!isValid) {
    throw new Error(error || 'Unauthorized access');
  }

  return await apiFunction();
}