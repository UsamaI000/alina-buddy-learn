import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type LearningModule = Database['public']['Tables']['learning_modules']['Row'];

export function useLearningModules(apprenticeship?: string) {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModules() {
      try {
        let query = supabase
          .from('learning_modules')
          .select('*')
          .order('created_at', { ascending: true });

        if (apprenticeship) {
          query = query.eq('apprenticeship', apprenticeship);
        }

        const { data, error } = await query;

        if (error) {
          setError(error.message);
        } else {
          setModules(data || []);
        }
      } catch (err) {
        setError('Failed to fetch learning modules');
      } finally {
        setLoading(false);
      }
    }

    fetchModules();
  }, [apprenticeship]);

  return { modules, loading, error };
}