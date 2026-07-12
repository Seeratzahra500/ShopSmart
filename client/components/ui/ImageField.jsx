'use client';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { uploadImage } from '@/lib/uploadImage';

// Small live thumbnail preview for URL-ish image fields — shows an inline
// "couldn't load" warning via onError rather than a broken-image icon.
function ImagePreview({ url }) {
  const [failed, setFailed] = useState(false);
  const [prevUrl, setPrevUrl] = useState(url);
  const looksLikeUrl = /^https?:\/\/.+/.test(url?.trim() || '');

  // Reset the "failed" state when the URL changes (adjust state during render).
  if (prevUrl !== url) {
    setPrevUrl(url);
    setFailed(false);
  }

  if (!looksLikeUrl) return null;

  return (
    <div className="mt-2 flex items-center gap-3">
      <div className="w-14 h-14 flex-shrink-0 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--bg-sunken)] overflow-hidden flex items-center justify-center">
        {!failed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Preview"
            onError={() => setFailed(true)}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      {failed && (
        <p className="text-xs text-[var(--danger)] leading-relaxed">Couldn&apos;t load this image</p>
      )}
    </div>
  );
}

// Reusable image input: paste a URL directly, or upload a file straight to
// Cloudinary via a signed request from our API. Falls back gracefully (toast
// + URL field still usable) when uploads aren't configured server-side.
export default function ImageField({ label, value, onChange, hint }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex items-end gap-2">
        <Input
          label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          className="flex-1"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          loading={uploading}
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {hint && <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">{hint}</p>}
      <ImagePreview url={value} />
    </div>
  );
}
