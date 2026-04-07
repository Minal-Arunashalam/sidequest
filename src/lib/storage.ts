import { supabase } from './supabase';

export async function uploadQuestPhoto(
  userId: string,
  questId: string,
  dataUrl: string
): Promise<string> {
  // Convert base64 data URL to Blob
  const res = await fetch(dataUrl);
  const blob = await res.blob();

  const path = `${userId}/${questId}.jpg`;
  const { error } = await supabase.storage
    .from('quest-photos')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true });

  if (error) throw error;

  // Signed URL valid for 10 years — effectively permanent for the user's own photo
  const { data, error: signError } = await supabase.storage
    .from('quest-photos')
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);

  if (signError) throw signError;
  return data.signedUrl;
}
