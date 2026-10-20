'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

/** Swipeable-looking photo strip for listing cards: arrows on hover and position dots. */
export function PhotoCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  if (count === 0) return <div className="aspect-[20/19] rounded-xl bg-neutral-200" />;

  const go = (event: React.MouseEvent, step: number) => {
    // The carousel sits inside a link; arrows should not open the listing.
    event.preventDefault();
    setIndex((i) => (i + step + count) % count);
  };

  return (
    <div className="group relative aspect-[20/19] overflow-hidden rounded-xl bg-neutral-200">
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={i === 0 ? alt : ''}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={`object-cover transition-opacity duration-300 ${i === index ? 'opacity-100' : 'opacity-0'}`}
          priority={false}
        />
      ))}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => go(e, -1)}
            aria-label="Previous photo"
            className="absolute top-1/2 left-3 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 opacity-0 shadow transition group-hover:opacity-100 hover:scale-105"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={(e) => go(e, 1)}
            aria-label="Next photo"
            className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 opacity-0 shadow transition group-hover:opacity-100 hover:scale-105"
          >
            <ChevronRight className="size-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((src, i) => (
              <span
                key={src}
                className={`size-1.5 rounded-full ${i === index ? 'bg-white' : 'bg-white/60'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
