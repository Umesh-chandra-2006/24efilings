import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Activity } from '@/types';

export const activityKeys = {
  all: ['activities'] as const,
  leadLists: (leadId: string) => [...activityKeys.all, 'lead', leadId] as const,
  userActivities: ['userActivities'] as const,
  auditLogs: ['auditLogs'] as const,
};

export function useActivities(leadId: string) {
  return useQuery({
    queryKey: activityKeys.leadLists(leadId),
    queryFn: async () => {
      const { data, error } = await (supabase.from('activities' as any) as any)
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as Activity[];
    },
    enabled: !!leadId,
  });
}

export function useAddActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newActivity: any) => {
      const { data, error } = await (supabase.from('activities' as any) as any)
        .insert([newActivity])
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Activity;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.leadLists(data.lead_id) });
    },
  });
}

export function useUserActivities(filters?: { branchId?: string }) {
  return useQuery({
    queryKey: [...activityKeys.userActivities, filters || {}],
    queryFn: async () => {
      let query = (supabase.from('user_activities' as any) as any)
        .select('*, user:profiles(id, name, role)')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (filters?.branchId && filters.branchId !== 'All Branches') {
        query = query.eq('branch_id', filters.branchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: activityKeys.auditLogs,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('audit_logs')
        .select('*, user:profiles(id, name, role)')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as any[];
    },
  });
}
