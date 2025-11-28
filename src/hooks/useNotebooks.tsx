import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useToast } from '@/hooks/use-toast'; // Import useToast

export const useNotebooks = () => {
  // 1. FIX: Destructure loading and derive isAuthenticated
  const { user, loading: authLoading } = useAuthSession();
  const isAuthenticated = !!user;
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: notebooks = [],
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ['notebooks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching notebooks for user:', user.id);
      
      // First get the notebooks
      const { data: notebooksData, error: notebooksError } = await supabase
        .from('notebooks')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (notebooksError) {
        console.error('Error fetching notebooks:', notebooksError);
        throw notebooksError;
      }

      // Then get source counts
      const notebooksWithCounts = await Promise.all(
        (notebooksData || []).map(async (notebook) => {
          const { count, error: countError } = await supabase
            .from('sources')
            .select('*', { count: 'exact', head: true })
            .eq('notebook_id', notebook.id);

          if (countError) {
            console.error('Error fetching source count:', countError);
            return { ...notebook, sources: [{ count: 0 }] };
          }

          return { ...notebook, sources: [{ count: count || 0 }] };
        })
      );

      return notebooksWithCounts || [];
    },
    // 2. FIX: Now these variables exist
    enabled: !authLoading && isAuthenticated,
    retry: (failureCount, error) => {
      if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notebooks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notebooks',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time notebook update:', payload);
          queryClient.invalidateQueries({ queryKey: ['notebooks', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const createNotebook = useMutation({
    mutationFn: async (notebookData: { title: string; description?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notebooks')
        .insert({
          title: notebookData.title,
          // description: notebookData.description, // Ensure column exists if using this
          user_id: user.id,
          // generation_status: 'pending', // Ensure column exists if using this
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks', user?.id] });
      toast({ title: 'Success', description: 'Notebook created successfully' });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({ title: 'Error', description: 'Failed to create notebook', variant: 'destructive' });
    },
  });

  const deleteNotebook = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notebooks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks', user?.id] });
      toast({ title: 'Deleted', description: 'Notebook deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to delete notebook', variant: 'destructive' });
    },
  });

  return {
    notebooks,
    isLoading: authLoading || isLoading,
    error: error instanceof Error ? error.message : null,
    isError,
    createNotebook: createNotebook.mutate,
    isCreating: createNotebook.isPending,
    deleteNotebook: deleteNotebook.mutate,
    isDeleting: deleteNotebook.isPending
  };
};