import Link from 'next/link';
import { Suspense } from 'react';
import { CategoryBar } from '@/components/category-bar';
import { ListingCard, ListingCardSkeleton } from '@/components/listing-card';
import { isCategoryId } from '@/lib/categories';
import { getListings } from '@/lib/listings';

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default function Home({ searchParams }: PageProps<'/'>) {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <Listings searchParams={searchParams} />
    </Suspense>
  );
}

async function Listings({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const rawCategory = first(params.category) ?? '';
  const category = isCategoryId(rawCategory) ? rawCategory : null;
  const q = (first(params.q) ?? '').trim();
  const guests = Number(first(params.guests)) || 0;

  const needle = q.toLowerCase();
  const listings = (await getListings()).filter(
    (l) =>
      (!category || l.category === category) &&
      l.capacity >= guests &&
      (!needle || `${l.city} ${l.country} ${l.name}`.toLowerCase().includes(needle)),
  );

  return (
    <>
      <CategoryBar active={category} q={q} guests={guests ? String(guests) : ''} />
      {listings.length === 0 ? (
        <div className="py-24 text-center">
          <h2 className="text-xl font-semibold">No exact matches</h2>
          <p className="mt-2 text-muted">Try changing or removing some of your filters.</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg border border-ink px-5 py-3 font-semibold hover:bg-neutral-100"
          >
            Remove all filters
          </Link>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-x-6 gap-y-10 pt-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </section>
      )}
    </>
  );
}

function HomeSkeleton() {
  return (
    <>
      <div className="flex gap-8 pt-6 pb-3">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-12 w-16 animate-pulse rounded bg-neutral-100" />
        ))}
      </div>
      <section className="grid grid-cols-1 gap-x-6 gap-y-10 pt-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </section>
    </>
  );
}
