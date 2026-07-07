import { ChangeEvent, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export interface ExistingPhoto {
  /** Full URL — used for <img src> display. */
  url: string;
  /** Original PocketBase filename — used to request deletion on save. */
  filename: string;
}

interface PhotoUploaderProps {
  /** Existing photos already stored in PocketBase. */
  existingPhotos: ExistingPhoto[];
  /** New files selected by the user (not yet uploaded). */
  newFiles: File[];
  onRemoveExisting: (filename: string) => void;
  onAddFiles: (files: File[]) => void;
  onRemoveNew: (index: number) => void;
  disabled?: boolean;
}

export default function PhotoUploader({
  existingPhotos,
  newFiles,
  onRemoveExisting,
  onAddFiles,
  onRemoveNew,
  disabled = false,
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    const files: File[] = selectedFiles ? Array.from(selectedFiles) : [];
    event.target.value = '';

    if (files.length === 0) return;

    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error('Please select image files only');
      return;
    }

    setUploading(true);
    onAddFiles(imageFiles);
    toast.success(`${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} queued for upload`);
    setUploading(false);
  };

  const totalCount = existingPhotos.length + newFiles.length;

  return (
    <div className="mt-12 space-y-6">
      <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/40">
        Vehicle Photos {totalCount > 0 && `(${totalCount})`}
      </label>

      <label className="flex cursor-pointer items-center justify-center gap-2 border-2 border-art-black bg-art-black px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-art-orange">
        <Upload size={14} />
        {uploading ? 'Processing...' : 'Upload Images'}
        <input
          type="file"
          multiple
          accept="image/*"
          disabled={disabled || uploading}
          onChange={handleFileInput}
          className="hidden"
        />
      </label>

      <p className="font-mono text-[9px] uppercase tracking-wider text-art-black/40">
        You can select multiple images at once.
      </p>

      {totalCount > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {/* Existing photos (already stored in PocketBase) */}
          {existingPhotos.map((photo) => (
            <div
              key={photo.filename}
              className="group relative aspect-square border-2 border-art-black bg-white"
            >
              <img src={photo.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveExisting(photo.filename)}
                disabled={disabled}
                className="absolute inset-0 flex items-center justify-center bg-art-orange opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-60"
              >
                <Trash2 className="text-white" size={20} />
              </button>
            </div>
          ))}

          {/* New files (queued for upload — show preview via object URL) */}
          {newFiles.map((file, i) => (
            <div
              key={i}
              className="group relative aspect-square border-2 border-art-black bg-white ring-2 ring-art-orange ring-offset-2"
              title="New — not yet saved"
            >
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute left-1 top-1 bg-art-orange px-1 font-mono text-[7px] font-bold uppercase text-white">
                New
              </div>
              <button
                type="button"
                onClick={() => onRemoveNew(i)}
                disabled={disabled}
                className="absolute inset-0 flex items-center justify-center bg-art-orange opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-60"
              >
                <Trash2 className="text-white" size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}