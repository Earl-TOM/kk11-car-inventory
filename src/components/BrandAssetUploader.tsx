import { ChangeEvent, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { convertFilesToDataUrls } from "../services/imageFileService";

interface BrandAssetUploaderProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hint?: string;
}

export default function BrandAssetUploader({
  label,
  value,
  onChange,
  disabled = false,
  hint,
}: BrandAssetUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    setUploading(true);

    const uploaded = await convertFilesToDataUrls([files[0]]);
    if (uploaded.length > 0) {
      onChange(uploaded[0]);
      toast.success(`${label} uploaded`);
    }

    setUploading(false);
  };

  return (
    <div className="space-y-3 md:col-span-2">
      <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/40">
        {label}
      </label>

      <label className="flex cursor-pointer items-center justify-center gap-2 border-2 border-art-black bg-art-black px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-art-orange">
        <ImagePlus size={14} />
        {uploading ? "Uploading..." : value ? `Replace ${label}` : `Upload ${label}`}
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

      {value ? (
        <div className="relative w-full overflow-hidden border-2 border-art-black bg-white">
          <img src={value} alt={label} className="h-24 w-full object-contain bg-art-beige p-2" />
          <button
            type="button"
            onClick={() => onChange("")}
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