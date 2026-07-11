import api from '@/lib/api';

const MAX_BYTES = 5 * 1024 * 1024;

// Direct-to-Cloudinary signed upload: our server only issues a signature
// (see server/src/routes/upload.routes.js); the file itself goes straight
// from the browser to Cloudinary and never touches our API.
export async function uploadImage(file) {
  if (!file) throw new Error('No file selected.');
  if (!file.type?.startsWith('image/')) throw new Error('File must be an image.');
  if (file.size > MAX_BYTES) throw new Error('Image must be smaller than 5 MB.');

  const { data } = await api.get('/uploads/signature');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', data.apiKey);
  formData.append('timestamp', data.timestamp);
  formData.append('signature', data.signature);
  formData.append('folder', data.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error?.message || 'Image upload failed.');
  }

  return body.secure_url;
}
