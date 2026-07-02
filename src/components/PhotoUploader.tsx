import { ChangeEvent, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { convertFilesToDataUrls } from "../services/imageFileService";

interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  disabled?: boolean;
}

export default function PhotoUploader({ photos, onChange, disabled = false }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    const files: File[] = selectedFiles ? Array.from(selectedFiles) : [];
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    setUploading(true);

    try {
      const uploaded = await convertFilesToDataUrls(files);
      const nextPhotos = Array.from(new Set([...photos, ...uploaded]));
      onChange(nextPhotos);

      if (uploaded.length > 0) {
        toast.success(`${uploaded.length} image${uploaded.length > 1 ? "s" : ""} uploaded`);
      }
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const nextPhotos = photos.filter((_, i) => i !== index);
    onChange(nextPhotos);
  };

  return (
    <div className="mt-12 space-y-6">
      <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/40">
        Vehicle Photos
      </label>

      <label className="flex cursor-pointer items-center justify-center gap-2 border-2 border-art-black bg-art-black px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-art-orange">
        <Upload size={14} />
        {uploading ? "Uploading..." : "Upload Images"}
        <input
          type="file"
          multiple
          accept="image/*"
          disabled={disabled || uploading}
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>

      <p className="font-mono text-[9px] uppercase tracking-wider text-art-black/40">
        You can select multiple images at once.
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {photos.map((url, i) => (
          <div key={i} className="group relative aspect-square border-2 border-art-black bg-white">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              disabled={disabled || uploading}
              className="absolute inset-0 flex items-center justify-center bg-art-orange opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-60"
            >
              <Trash2 className="text-white" size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}