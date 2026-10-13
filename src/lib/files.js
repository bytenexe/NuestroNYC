import { base44 } from '@/api/base44Client';

export async function openPrivateFile(fileUri) {
  if (!fileUri) return null;
  const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 300 });
  if (signed_url) window.open(signed_url, '_blank', 'noopener');
  return signed_url;
}