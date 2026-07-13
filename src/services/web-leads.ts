import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { WebLead } from '@/types';

export const webLeadKeys = {
  all: ['webLeads'] as const,
};

export function useWebLeads() {
  return useQuery({
    queryKey: webLeadKeys.all,
    queryFn: async () => {
      const { data, error } = await (supabase.from('crm_web_leads' as any) as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as WebLead[];
    },
  });
}

export function useCreateWebLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newWebLead: Omit<WebLead, 'id' | 'created_at' | 'status'>) => {
      const { data, error } = await (supabase.from('crm_web_leads' as any) as any)
        .insert([{ ...newWebLead, status: 'New' }])
        .select()
        .single();
      if (error) throw error;
      return data as WebLead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webLeadKeys.all });
    },
  });
}

export function useUpdateWebLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: WebLead['status'] }) => {
      const { data, error } = await (supabase.from('crm_web_leads' as any) as any)
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as WebLead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webLeadKeys.all });
    },
  });
}

export function useAssignWebLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, assignedTo }: { id: string; assignedTo: string }) => {
      const { data, error } = await (supabase.from('crm_web_leads' as any) as any)
        .update({ assigned_to: assignedTo, status: 'Contacted' })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as WebLead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webLeadKeys.all });
    },
  });
}

export function useDeleteWebLeads() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await (supabase.from('crm_web_leads' as any) as any)
        .delete()
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webLeadKeys.all });
    },
  });
}
