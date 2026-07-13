import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@/types';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: any) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export function useUsers(filters?: any) {
  return useQuery({
    queryKey: userKeys.list(filters || {}),
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('name', { ascending: true });

      if (filters?.branchId && filters.branchId !== 'All Branches') {
        query = query.eq('branch_id', filters.branchId);
      }
      if (filters?.role && filters.role !== 'All') {
        query = query.eq('role', filters.role);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as User[];
    },
  });
}

export function useUserDetail(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data as User;
    },
    enabled: !!userId,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatedUser: User) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updatedUser)
        .eq('id', updatedUser.id)
        .select()
        .single();
      if (error) throw error;
      return data as User;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
    },
  });
}

export function useDeleteUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userIds: string[]) => {
      // First try the Edge function via localhost/production api url
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userIds },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
