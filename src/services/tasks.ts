import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Task } from '@/types';

export const taskKeys = {
  all: ['tasks'] as const,
  leadLists: (leadId: string) => [...taskKeys.all, 'lead', leadId] as const,
};

export function useTasks(leadId: string) {
  return useQuery({
    queryKey: taskKeys.leadLists(leadId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as Task[];
    },
    enabled: !!leadId,
  });
}

export function useAddTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newTask: any) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...newTask, is_completed: false }])
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Task;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.leadLists(data.lead_id) });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Task;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.leadLists(data.lead_id) });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, leadId }: { id: string; leadId: string }) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.leadLists(variables.leadId) });
    },
  });
}
