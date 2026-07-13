import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Offer } from '@/types';

export const offerKeys = {
  all: ['offers'] as const,
};

export function useOffers() {
  return useQuery({
    queryKey: offerKeys.all,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Offer[];
    },
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newOffer: Omit<Offer, 'id' | 'created_at' | 'used_count'>) => {
      const { data, error } = await (supabase as any)
        .from('offers')
        .insert([newOffer])
        .select()
        .single();
      if (error) throw error;
      return data as Offer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
}

export function useUpdateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Offer> }) => {
      const { data, error } = await (supabase as any)
        .from('offers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Offer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
}

export function useDeleteOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('offers')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
}

export function useIncrementOfferUsage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await (supabase as any).rpc('increment_offer_usage', { offer_id: id });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
}
