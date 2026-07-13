import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Branch, City } from '@/types';

export const branchKeys = {
  all: ['branches'] as const,
  citiesAll: ['cities'] as const,
};

export function useBranches() {
  return useQuery({
    queryKey: branchKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Branch[];
    },
  });
}

export function useCities() {
  return useQuery({
    queryKey: branchKeys.citiesAll,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('city_name', { ascending: true });
      if (error) throw error;
      return data as City[];
    },
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newBranch: Omit<Branch, 'id'>) => {
      const { data, error } = await supabase
        .from('branches')
        .insert([newBranch])
        .select()
        .single();
      if (error) throw error;
      return data as Branch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.all });
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatedBranch: Branch) => {
      const { data, error } = await supabase
        .from('branches')
        .update(updatedBranch)
        .eq('id', updatedBranch.id)
        .select()
        .single();
      if (error) throw error;
      return data as Branch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.all });
    },
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (branchId: string) => {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', branchId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.all });
    },
  });
}
