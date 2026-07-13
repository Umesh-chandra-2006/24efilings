import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Customer } from '@/types';

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: any) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

export function useCustomers(filters?: any) {
  return useQuery({
    queryKey: customerKeys.list(filters || {}),
    queryFn: async () => {
      let query = (supabase.from('customers' as any) as any)
        .select('*')
        .order('name', { ascending: true });

      if (filters?.branchId && filters.branchId !== 'All Branches') {
        query = query.eq('branch_id', filters.branchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Customer[];
    },
  });
}

export function useCustomerDetail(customerId: string) {
  return useQuery({
    queryKey: customerKeys.detail(customerId),
    queryFn: async () => {
      const { data, error } = await (supabase.from('customers' as any) as any)
        .select('*')
        .eq('id', customerId)
        .single();
      if (error) throw error;
      return data as unknown as Customer;
    },
    enabled: !!customerId,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newCustomer: any) => {
      const { data, error } = await (supabase.from('customers' as any) as any)
        .insert([newCustomer])
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatedCustomer: any) => {
      const { data, error } = await (supabase.from('customers' as any) as any)
        .update(updatedCustomer)
        .eq('id', updatedCustomer.id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Customer;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(data.id) });
    },
  });
}

export function useDeleteCustomers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customerIds: string[]) => {
      const { error } = await (supabase.from('customers' as any) as any)
        .delete()
        .in('id', customerIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}
