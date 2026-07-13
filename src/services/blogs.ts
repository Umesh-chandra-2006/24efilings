import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Blog } from '@/types';

export const blogKeys = {
  all: ['blogs'] as const,
};

export function useBlogs() {
  return useQuery({
    queryKey: blogKeys.all,
    queryFn: async () => {
      const { data, error } = await (supabase.from('crm_blogs' as any) as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Blog[];
    },
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newBlog: Omit<Blog, 'id' | 'created_at'>) => {
      const { data, error } = await (supabase.from('crm_blogs' as any) as any)
        .insert([newBlog])
        .select()
        .single();
      if (error) throw error;
      return data as Blog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Blog> }) => {
      const { data, error } = await (supabase.from('crm_blogs' as any) as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Blog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from('crm_blogs' as any) as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
  });
}
