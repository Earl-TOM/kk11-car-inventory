import { ChangeEvent, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface BrandAssetUploaderProps {
  label: string;
  /** Current asset URL (already stored in PocketBase) — shown as preview. */
  currentUrl: string;
  /** Called with the selected File when a new asset is chosen, or null to clear. */
  onFileChange: (file: File | null) => void;
  /** The pending File (not yet saved) — for displaying a local preview. */
  pendingFile?: File | null;
  disabled?: boolean;
  hint?: string;
}

export default function BrandAssetUploader({
  label,
  currentUrl,
  onFileChange,
  pendingFile,
  disabled = false,
  hint,
}: BrandAssetUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    const files: File[] = selectedFiles ? Array.from(selectedFiles) : [];
    event.target.value = '';

    if (files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    onFileChange(file);
    toast.success(`${label} queued for upload`);
    setUploading(false);
  };

  // The preview URL: prefer the pending file's local preview, fall back to stored URL
  const previewUrl = pendingFile
    ? URL.createObjectURL(pendingFile)
    : currentUrl;

  const hasPreview = Boolean(previewUrl);

  return (
    <div className="space-y-3 md:col-span-2">
      <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/40">
        {label}
        {pendingFile && (
          <span className="ml-2 text-art-orange">• Pending upload</span>
        )}
      </label>

      <label className="flex cursor-pointer items-center justify-center gap-2 border-2 border-art-black bg-art-black px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-art-orange">
        <ImagePlus size={14} />
        {uploading ? 'Processing...' : hasPreview ? `Replace ${label}` : `Upload ${label}`}
        <input
          type="file"
          accept="image/*"
          disabled={disabled || uploading}
          onChange={handleUpload}
          className="hidden"
        />
      </label>

      {hint && (
        <p className="font-mono text-[9px] uppercase tracking-wider text-art-black/40">
          {hint}
        </p>
      )}

      {hasPreview ? (
        <div className="relative w-full overflow-hidden border-2 border-art-black bg-white">
          <img
            src={previewUrl}
            alt={label}
            className="h-24 w-full object-contain bg-art-beige p-2"
          />
          <button
            type="button"
            onClick={() => onFileChange(null)}
            disabled={disabled || uploading}
            className="absolute right-2 top-2 border-2 border-art-black bg-white p-1 text-art-black transition-all hover:bg-art-orange hover:text-white disabled:opacity-60"
            aria-label={`Remove ${label}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : null}
    </div>
  );
}