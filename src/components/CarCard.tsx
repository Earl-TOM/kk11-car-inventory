import { Car } from '../types';
import { MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import ImageCarousel from './ImageCarousel';
import { formatZMW } from '../lib/currency';

interface CarCardProps {
  car: Car;
  onViewDetails?: (car: Car) => void;
  whatsappNumber?: string;
}

const statusColors = {
  Available: 'bg-emerald-500 text-white border-emerald-600',
  Sold: 'bg-rose-500 text-white border-rose-600',
  Reserved: 'bg-amber-500 text-white border-amber-600',
};

export default function CarCard({ car, onViewDetails, whatsappNumber }: CarCardProps) {
  const normalizedWhatsApp = (whatsappNumber || "").replace(/[^\d]/g, "");
  const hasWhatsApp = normalizedWhatsApp.length > 0;

  const whatsappUrl = `https://wa.me/${normalizedWhatsApp}?text=${encodeURIComponent(
    `Hi, I'm interested in the ${car.year} ${car.make} ${car.model} listed for ${formatZMW(car.price)}. Is it still available?`
  )}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="brutalist-border group bg-white p-2 transition-all hover:brutalist-shadow"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b-2 border-art-black">
        <ImageCarousel photos={car.photos} alt={`${car.make} ${car.model}`} />
        <div className="absolute right-0 top-0 border-b-2 border-l-2 border-art-black bg-art-black px-4 py-1">
          <span className="font-mono text-[10px] font-bold text-white">{formatZMW(car.price)}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif text-2xl font-bold leading-tight text-art-black">
            {car.make}
            <br />
            {car.model}
          </h3>
          <span
            className={cn(
              'border-2 px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider',
              statusColors[car.status]
            )}
          >
            {car.status}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t-2 border-art-black pt-4">
          <div className="flex flex-col">
            <span className="font-mono text-[8px] font-bold uppercase text-art-black/40">Year</span>
            <span className="font-serif text-sm italic">{car.year}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[8px] font-bold uppercase text-art-black/40">Engine</span>
            <span className="font-serif text-sm italic truncate">{car.engine || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[8px] font-bold uppercase text-art-black/40">Mileage</span>
            <span className="font-serif text-sm italic">{car.mileage?.toLocaleString() || '0'} KM</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[8px] font-bold uppercase text-art-black/40">Colour</span>
            <span className="font-serif text-sm italic truncate">{car.originalColour || 'Standard'}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onViewDetails?.(car)}
          className="mt-6 w-full border-2 border-art-black bg-white px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-art-black transition-all hover:bg-art-black hover:text-white"
        >
          Full Description
        </button>

        {hasWhatsApp ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-2 border-2 border-art-black bg-art-orange px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-art-black"
          >
            <MessageCircle size={14} />
            Inquire Now
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="mt-3 flex w-full items-center justify-center gap-2 border-2 border-art-black bg-art-black/30 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white"
          >
            <MessageCircle size={14} />
            Contact Unavailable
          </button>
        )}
      </div>
    </motion.div>
  );
}