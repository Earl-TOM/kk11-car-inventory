import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  photos: string[];
  alt: string;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1542362567-b05503f35259?auto=format&fit=crop&q=80&w=1200';

export default function ImageCarousel({ photos, alt }: ImageCarouselProps) {
  const images = useMemo(() => (photos.length > 0 ? photos : [FALLBACK_IMAGE]), [photos]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, [images.length]);

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="relative h-full w-full">
      <img
        src={images[currentIndex]}
        alt={alt}
        className="h-full w-full object-cover transition-all duration-500"
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 border-2 border-art-black bg-white/90 p-1 text-art-black hover:bg-art-orange hover:text-white"
            aria-label="Previous image"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 border-2 border-art-black bg-white/90 p-1 text-art-black hover:bg-art-orange hover:text-white"
            aria-label="Next image"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={idx === currentIndex ? 'h-1.5 w-5 bg-white' : 'h-1.5 w-3 bg-white/60'}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}