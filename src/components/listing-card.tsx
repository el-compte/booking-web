import { Star } from 'lucide-react';
import Link from 'next/link';
import { money } from '@/lib/format';
import type { Listing } from '@/lib/listings';
import { PhotoCarousel } from './photo-carousel';

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <PhotoCarousel images={listing.images} alt={listing.name} />
      <div className="mt-3 flex items-start justify-between gap-2">
        <h3 className="font-semibold">
          {listing.city}, {listing.country}
        </h3>
        {listing.rating > 0 && (
          <span className="flex shrink-0 items-center gap-1 text-sm">
            <Star className="size-3.5 fill-current" />
            {listing.rating.toFixed(2)}
          </span>
        )}
      </div>
      <p className="truncate text-muted">{listing.name}</p>
      <p className="text-muted">Up to {listing.capacity} people</p>
      <p className="mt-1">
        <span className="font-semibold">{money(listing.pricePerHour, listing.currency)}</span> / hour
      </p>
    </Link>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[20/19] rounded-xl bg-neutral-200" />
      <div className="mt-3 h-4 w-2/3 rounded bg-neutral-200" />
      <div className="mt-2 h-4 w-1/2 rounded bg-neutral-200" />
      <div className="mt-2 h-4 w-1/3 rounded bg-neutral-200" />
    </div>
  );
}
