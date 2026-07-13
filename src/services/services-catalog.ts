import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Service, SubService } from '@/types';

export const serviceKeys = {
  all: ['services'] as const,
  subservicesAll: ['subservices'] as const,
};

export function useServices() {
  return useQuery({
    queryKey: serviceKeys.all,
    queryFn: async () => {
      const { data, error } = await (supabase.from('services' as any) as any)
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Service[];
    },
  });
}

export function useSubServices() {
  return useQuery({
    queryKey: serviceKeys.subservicesAll,
    queryFn: async () => {
      const { data, error } = await (supabase.from('sub_services' as any) as any)
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as SubService[];
    },
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, branchId }: { name: string; branchId: string | null }) => {
      const { data, error } = await (supabase.from('services' as any) as any)
        .insert([{ name, branch_id: branchId }])
        .select()
        .single();
      if (error) throw error;
      return data as Service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Service> }) => {
      const { data, error } = await (supabase.from('services' as any) as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from('services' as any) as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
    },
  });
}

export function useCreateSubService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      serviceId,
      branchId,
      subService,
    }: {
      serviceId: string;
      branchId: string | null;
      subService: Omit<SubService, 'id' | 'created_at' | 'service_id'>;
    }) => {
      const { data, error } = await (supabase.from('sub_services' as any) as any)
        .insert([{ service_id: serviceId, branch_id: branchId, ...subService }])
        .select()
        .single();
      if (error) throw error;
      return data as SubService;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.subservicesAll });
    },
  });
}
