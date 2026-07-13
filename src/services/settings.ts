import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { OrganizationSettings } from '@/types';

export const settingsKeys = {
  all: ['settings'] as const,
};

export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: async () => {
      const { data, error } = await (supabase.from('organization_settings' as any) as any)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data as OrganizationSettings | null;
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<OrganizationSettings>) => {
      // Upsert organization settings
      const { data, error } = await (supabase.from('organization_settings' as any) as any)
        .upsert([{ id: 1, ...updates }])
        .select()
        .single();
      if (error) throw error;
      return data as OrganizationSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}
