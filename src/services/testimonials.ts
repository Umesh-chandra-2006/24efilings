import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Testimonial } from '@/types';

export const testimonialKeys = {
  all: ['testimonials'] as const,
};

export function useTestimonials() {
  return useQuery({
    queryKey: testimonialKeys.all,
    queryFn: async () => {
      const { data, error } = await (supabase.from('crm_testimonials' as any) as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Testimonial[];
    },
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newTestimonial: Omit<Testimonial, 'id' | 'created_at' | 'status'>) => {
      const { data, error } = await (supabase.from('crm_testimonials' as any) as any)
        .insert([{ ...newTestimonial, status: 'Pending' }])
        .select()
        .single();
      if (error) throw error;
      return data as Testimonial;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.all });
    },
  });
}

export function useUpdateTestimonialStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Testimonial['status'] }) => {
      const { data, error } = await (supabase.from('crm_testimonials' as any) as any)
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Testimonial;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.all });
    },
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from('crm_testimonials' as any) as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.all });
    },
  });
}
