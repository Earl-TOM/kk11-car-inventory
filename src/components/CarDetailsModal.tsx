import { X } from "lucide-react";
import { Car } from "../types";
import { formatZMW } from "../lib/currency";
import ImageCarousel from "./ImageCarousel";

interface CarDetailsModalProps {
  car: Car;
  onClose: () => void;
}

export default function CarDetailsModal({ car, onClose }: CarDetailsModalProps) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-art-black/80 p-4">
      <div className="w-full max-w-3xl overflow-hidden border-4 border-art-black bg-white brutalist-shadow">
        <div className="flex items-center justify-between border-b-2 border-art-black bg-art-black p-4 text-white">
          <h2 className="font-serif text-2xl font-bold">
            {car.make} {car.model}
          </h2>
          <button onClick={onClose} className="border-2 border-white p-2 hover:bg-white hover:text-art-black">
            <X size={16} />
          </button>
        </div>

        <div className="grid gap-0 md:grid-cols-2">
          <div className="aspect-[4/3] border-b-2 border-art-black md:border-b-0 md:border-r-2">
            <ImageCarousel photos={car.photos} alt={`${car.make} ${car.model}`} />
          </div>

          <div className="p-6">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/50">Price</p>
            <p className="mb-4 font-serif text-3xl font-bold">{formatZMW(car.price)}</p>

            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/50">Details</p>
            <p className="mb-4 font-serif text-sm leading-relaxed text-art-black/80">
              {car.description?.trim() || "No full description available for this listing."}
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="font-mono text-[9px] uppercase text-art-black/50">Year:</span> {car.year}</div>
              <div><span className="font-mono text-[9px] uppercase text-art-black/50">Status:</span> {car.status}</div>
              <div><span className="font-mono text-[9px] uppercase text-art-black/50">Engine:</span> {car.engine || "N/A"}</div>
              <div><span className="font-mono text-[9px] uppercase text-art-black/50">Mileage:</span> {car.mileage?.toLocaleString() || "0"} KM</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}