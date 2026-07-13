import { supabase } from '@/lib/supabaseClient';

export async function uploadBranchLogo(branchId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'png';
  const fileName = `branch-logos/${branchId}_${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, file, { upsert: true });
    
  if (uploadError) throw uploadError;
  
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(fileName);
    
  return data.publicUrl;
}

export async function uploadAvatar(fileData: string | undefined, fileNamePrefix: string): Promise<string | undefined> {
  if (!fileData) return fileData;
  if (!fileData.startsWith('data:') && !fileData.startsWith('blob:')) return fileData;

  try {
    const res = await fetch(fileData);
    const blob = await res.blob();
    const fileExt = blob.type.split('/')[1] || 'png';
    const safePrefix = fileNamePrefix.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `user-avatars/${safePrefix}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, blob, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error("Avatar upload failed:", error);
    throw new Error("Failed to upload profile picture.");
  }
}
