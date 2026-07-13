import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Lead } from '@/types';

export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (filters: any) => [...leadKeys.lists(), filters] as const,
  details: () => [...leadKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
};

export function useLeads(filters?: any) {
  return useQuery({
    queryKey: leadKeys.list(filters || {}),
    queryFn: async () => {
      let query = (supabase.from('leads' as any) as any)
        .select('*, assigned_to:profiles!leads_assigned_to_fkey(*)')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'All') {
        query = query.eq('status', filters.status);
      }
      if (filters?.branchId && filters.branchId !== 'All Branches') {
        query = query.eq('branch_id', filters.branchId);
      }
      if (filters?.assignedTo && filters.assignedTo !== 'All') {
        query = query.eq('assigned_to', filters.assignedTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Lead[];
    },
  });
}

export function useLeadDetail(leadId: string) {
  return useQuery({
    queryKey: leadKeys.detail(leadId),
    queryFn: async () => {
      const { data, error } = await (supabase.from('leads' as any) as any)
        .select('*, assigned_to:profiles!leads_assigned_to_fkey(*)')
        .eq('id', leadId)
        .single();
      if (error) throw error;
      return data as unknown as Lead;
    },
    enabled: !!leadId,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newLead: any) => {
      const { data, error } = await (supabase.from('leads' as any) as any)
        .insert([newLead])
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatedLead: any) => {
      const { data, error } = await (supabase.from('leads' as any) as any)
        .update(updatedLead)
        .eq('id', updatedLead.id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Lead;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(data.id) });
    },
  });
}

export function useDeleteLeads() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leadIds: string[]) => {
      const { error } = await (supabase.from('leads' as any) as any)
        .delete()
        .in('id', leadIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}
