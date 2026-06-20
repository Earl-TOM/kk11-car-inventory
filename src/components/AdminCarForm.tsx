import { useState, useEffect, FormEvent } from "react";
import { Car, CarStatus } from "../types";
import { carService } from "../services/carService";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import PhotoUploader from "./PhotoUploader";

interface AdminCarFormProps {
  car?: Car | null;
  onClose: () => void;
  onSuccess: () => void;
}

function upper(value: string | undefined) {
  return (value || "").toUpperCase();
}

export default function AdminCarForm({ car, onClose, onSuccess }: AdminCarFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Car>>({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    price: 0,
    status: "Available",
    engine: "",
    mileage: undefined,
    originalColour: "",
    description: "",
    photos: [],
  });

  useEffect(() => {
    if (car) {
      setFormData(car);
    }
  }, [car]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: Partial<Car> = {
      ...formData,
      make: upper(formData.make),
      model: upper(formData.model),
      engine: upper(formData.engine),
      originalColour: upper(formData.originalColour),
    };

    try {
      if (car?.id) {
        await carService.updateCar(car.id, payload);
        toast.success("Listing updated");
      } else {
        await carService.createCar(payload);
        toast.success("Listing created");
      }
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-art-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden border-4 border-art-black bg-art-beige shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b-2 border-art-black bg-art-black p-6 text-white">
          <h2 className="font-serif text-2xl font-bold italic">{car ? "Edit Listing" : "New Archive Entry"}</h2>
          <button onClick={onClose} className="border-2 border-white p-2 hover:bg-white hover:text-art-black">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/40">Manufacturer</label>
              <input
                required
                type="text"
                value={formData.make || ""}
                onChange={(e) => setFormData({ ...formData, make: upper(e.target.value) })}
                className="w-full border-b-2 border-art-black bg-transparent py-2 font-serif text-lg uppercase outline-none focus:border-art-orange"
                placeholder="TOYOTA"
              />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/40">Vehicle Model</label>
              <input
                required
                type="text"
                value={formData.model || ""}
                onChange={(e) => setFormData({ ...formData, model: upper(e.target.value) })}
                className="w-full border-b-2 border-art-black bg-transparent py-2 font-serif text-lg uppercase outline-none focus:border-art-orange"
                placeholder="MARK X"
              />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/40">Production Year</label>
              <input
                required
                type="number"
                min={1886}
                value={formData.year ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    year: e.target.value === "" ? undefined : parseInt(e.target.value, 10),
                  })
                }
                className="w-full border-b-2 border-art-black bg-transparent py-2 font-serif text-lg outline-none focus:border-art-orange"
              />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/40">Valuation (K)</label>
              <input
                required
                type="number"
                min={0}
                step="0.01"
                value={formData.price ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value === "" ? undefined : parseFloat(e.target.value),
                  })
                }
                className="w-full border-b-2 border-art-black bg-transparent py-2 font-serif text-lg outline-none focus:border-art-orange"
              />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/40">Market Status</label>
              <select
                value={formData.status || "Available"}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CarStatus })}
                className="w-full appearance-none border-b-2 border-art-black bg-transparent py-2 font-serif text-lg uppercase outline-none focus:border-art-orange"
              >
                <option value="Available">AVAILABLE</option>
                <option value="Reserved">RESERVED</option>
                <option value="Sold">SOLD</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/40">Engine Displacement</label>
              <input
                type="text"
                value={formData.engine || ""}
                onChange={(e) => setFormData({ ...formData, engine: upper(e.target.value) })}
                className="w-full border-b-2 border-art-black bg-transparent py-2 font-serif text-lg uppercase outline-none focus:border-art-orange"
                placeholder="2.5L V6"
              />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/40">Mileage (KM)</label>
              <input
                type="number"
                min={0}
                value={formData.mileage ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mileage: e.target.value === "" ? undefined : parseInt(e.target.value, 10),
                  })
                }
                className="w-full border-b-2 border-art-black bg-transparent py-2 font-serif text-lg outline-none focus:border-art-orange"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/40">Original Colour</label>
              <input
                type="text"
                value={formData.originalColour || ""}
                onChange={(e) => setFormData({ ...formData, originalColour: upper(e.target.value) })}
                className="w-full border-b-2 border-art-black bg-transparent py-2 font-serif text-lg uppercase outline-none focus:border-art-orange"
                placeholder="MAROON"
              />
            </div>
          </div>

          <div className="mt-12 space-y-2">
            <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/40">Full Description</label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[120px] w-full border-2 border-art-black bg-white p-4 font-serif text-lg outline-none focus:border-art-orange"
              placeholder="Narrative summary of the vehicle history and specs..."
            />
          </div>

          <PhotoUploader
            photos={formData.photos || []}
            onChange={(photos) => setFormData((prev) => ({ ...prev, photos }))}
            disabled={loading}
          />

          <div className="mt-12 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-art-black bg-white py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-art-black hover:bg-art-beige"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] border-2 border-art-black bg-art-black py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-art-orange disabled:opacity-50"
            >
              {loading ? "ARCHIVING..." : car ? "SYNCHRONIZE DATA" : "PUBLISH ENTRY"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}