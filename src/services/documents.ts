import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Document } from '@/types';

export const documentKeys = {
  all: ['documents'] as const,
  leadLists: (leadId: string) => [...documentKeys.all, 'lead', leadId] as const,
};

export function useDocuments(leadId: string) {
  return useQuery({
    queryKey: documentKeys.leadLists(leadId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Document[];
    },
    enabled: !!leadId,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      leadId,
      file,
      docType,
      uploadedBy,
    }: {
      leadId: string;
      file: File;
      docType: string;
      uploadedBy: string;
    }) => {
      const fileExt = file.name.split('.').pop() || 'pdf';
      const fileName = `${leadId}/${docType.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      const newDoc = {
        lead_id: leadId,
        name: file.name,
        type: docType,
        url: urlData.publicUrl,
        status: 'Pending' as const,
        uploaded_by: uploadedBy,
      };

      const { data, error } = await supabase
        .from('documents')
        .insert([newDoc])
        .select()
        .single();

      if (error) throw error;
      return data as Document;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.leadLists(variables.leadId) });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ leadId, docId, fileUrl }: { leadId: string; docId: string; fileUrl: string }) => {
      const parts = fileUrl.split('/storage/v1/object/public/documents/');
      if (parts.length > 1) {
        const filePath = decodeURIComponent(parts[1]);
        await supabase.storage.from('documents').remove([filePath]);
      }

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.leadLists(variables.leadId) });
    },
  });
}

export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      leadId,
      docId,
      status,
      notes,
    }: {
      leadId: string;
      docId: string;
      status: Document['status'];
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('documents')
        .update({ status, verification_notes: notes || null })
        .eq('id', docId)
        .select()
        .single();

      if (error) throw error;
      return data as Document;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.leadLists(variables.leadId) });
    },
  });
}
