import { useState, useEffect } from 'react';
import { carService } from '../services/carService';
import { Car, SiteSettings } from '../types';
import CarCard from '../components/CarCard';
import CarDetailsModal from '../components/CarDetailsModal';
import { Loader2, Search, Car as CarIcon } from 'lucide-react';
import { formatZMW } from '../lib/currency';

interface HomeProps {
  settings: SiteSettings | null;
}

const MAX_PRICE_LIMIT = 1_000_000_000;
const LOW_RANGE_MAX = 250_000;
const SLIDER_MAX = 1000;
const SLIDER_MID = 500;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundToThousand(value: number) {
  return Math.round(value / 1000) * 1000;
}

function sliderToPrice(position: number) {
  const safePosition = clamp(position, 0, SLIDER_MAX);

  if (safePosition <= SLIDER_MID) {
    const ratio = safePosition / SLIDER_MID;
    return roundToThousand(ratio * LOW_RANGE_MAX);
  }

  const ratio = (safePosition - SLIDER_MID) / (SLIDER_MAX - SLIDER_MID);
  const value = LOW_RANGE_MAX + ratio * (MAX_PRICE_LIMIT - LOW_RANGE_MAX);
  return roundToThousand(value);
}

function priceToSlider(price: number) {
  const safePrice = clamp(price, 0, MAX_PRICE_LIMIT);

  if (safePrice <= LOW_RANGE_MAX) {
    return Math.round((safePrice / LOW_RANGE_MAX) * SLIDER_MID);
  }

  const ratio = (safePrice - LOW_RANGE_MAX) / (MAX_PRICE_LIMIT - LOW_RANGE_MAX);
  return Math.round(SLIDER_MID + ratio * (SLIDER_MAX - SLIDER_MID));
}

export default function Home({ settings }: HomeProps) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sliderPosition, setSliderPosition] = useState<number>(priceToSlider(MAX_PRICE_LIMIT));
  const [selectedMake, setSelectedMake] = useState<string>('All');
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  const maxPrice = sliderToPrice(sliderPosition);

  useEffect(() => {
    const unsubscribe = carService.subscribeToCars((data) => {
      setCars(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const makes = ['All', ...new Set(cars.map(car => car.make))];

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.make.toLowerCase().includes(search.toLowerCase()) ||
                         car.model.toLowerCase().includes(search.toLowerCase());
    const matchesPrice = car.price <= maxPrice;
    const matchesMake = selectedMake === 'All' || car.make === selectedMake;
    return matchesSearch && matchesPrice && matchesMake;
  });

  return (
    <div className="min-h-screen bg-art-beige">
      <section className="relative overflow-hidden border-b-2 border-art-black py-20 px-4 sm:px-8">
        <div className="container mx-auto flex flex-col items-start gap-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col">
            <span className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-art-black/60">
              {settings?.heroKicker || 'Showroom Inventory 2024'}
            </span>
            <h1 className="whitespace-pre-line font-serif text-7xl font-bold leading-[0.85] tracking-tighter text-art-black sm:text-9xl">
              {settings?.heroTitle || 'Curated\nMotion.'}
            </h1>
          </div>

          <div className="max-w-md border-l-2 border-art-black pl-8 pb-4">
            <p className="font-serif text-xl italic leading-snug text-art-black/80">
              {settings?.heroDescription || 'A production-ready environment for luxury car sales, bridging performance with high-end digital aesthetics.'}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 sm:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start">
          <div className="flex flex-[2] flex-col gap-8">
            <div>
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/40">Search Inventory</label>
              <div className="relative border-b-2 border-art-black">
                <Search className="absolute top-1/2 left-0 -translate-y-1/2 text-art-black" size={20} />
                <input
                  type="text"
                  placeholder="MAKE / MODEL / KEYWORDS"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent py-4 pl-8 font-serif text-2xl outline-none placeholder:text-art-black/20"
                />
              </div>
            </div>

            <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-12">
              <div className="flex-1">
                <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/40">Manufacturer</label>
                <select
                  value={selectedMake}
                  onChange={(e) => setSelectedMake(e.target.value)}
                  className="w-full border-b-2 border-art-black bg-transparent py-2 font-serif text-lg outline-none appearance-none"
                >
                  {makes.map(make => <option key={make} value={make}>{make}</option>)}
                </select>
              </div>

              <div className="flex-1">
                <label className="mb-2 flex justify-between font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/40">
                  Max Price <span>{formatZMW(maxPrice)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max={SLIDER_MAX}
                  step="1"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(parseInt(e.target.value, 10))}
                  className="h-2 w-full cursor-pointer appearance-none bg-art-black/10 accent-art-black"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-col border-2 border-art-black bg-white p-6 brutalist-shadow">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/40">Inventory Statistics</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-serif text-5xl font-bold">{filteredCars.length}</span>
                <span className="font-mono text-[10px] font-bold uppercase text-art-black/40">Units Matching Filters</span>
              </div>
            </div>
            <button
              onClick={() => {
                setSearch('');
                setSliderPosition(priceToSlider(MAX_PRICE_LIMIT));
                setSelectedMake('All');
              }}
              className="border-2 border-art-black bg-art-black py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-art-orange"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 text-slate-400">
            <Loader2 size={40} className="animate-spin text-slate-900" />
            <p className="animate-pulse">Loading Inventory...</p>
          </div>
        ) : filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                onViewDetails={setSelectedCar}
                whatsappNumber={settings?.whatsappNumber}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-slate-100 p-6 text-slate-400">
              <CarIcon size={48} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No vehicles found</h3>
            <p className="mt-2 text-slate-500">Try adjusting your search or check back later.</p>
          </div>
        )}
      </main>

      <footer className="border-t border-[#e5e0d8] py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-medium text-slate-400">
            {settings?.footerText || "© 2024 AutoTrade Inventory. Professional Grade Vehicles."}
          </p>
        </div>
      </footer>

      {selectedCar && <CarDetailsModal car={selectedCar} onClose={() => setSelectedCar(null)} />}
    </div>
  );
}