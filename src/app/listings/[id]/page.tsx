import {
  Accessibility,
  AirVent,
  Armchair,
  Camera,
  Check,
  ChefHat,
  Clock,
  Coffee,
  Lightbulb,
  type LucideIcon,
  Mic,
  Music,
  Piano,
  Presentation,
  Projector,
  Speaker,
  Star,
  Sun,
  Users,
  Utensils,
  Wifi,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { getAvailability } from '@/lib/api';
import { type CalendarDay, money, upcomingDays } from '@/lib/format';
import { getListing, type Listing } from '@/lib/listings';
import { BookingPanel } from './booking-panel';

const DAYS_SHOWN = 14;

export default function ListingPage({ params, searchParams }: PageProps<'/listings/[id]'>) {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <ListingContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ListingContent({
  params,
  searchParams,
}: Pick<PageProps<'/listings/[id]'>, 'params' | 'searchParams'>) {
  const [{ id }, { date: requested }] = await Promise.all([params, searchParams]);
  const listing = await getListing(id);
  if (!listing) notFound();

  // The day picker starts from today, so it must be computed per request, not prerendered.
  await connection();

  const days = upcomingDays(listing.timezone, DAYS_SHOWN);
  const isOpen = (day: CalendarDay) => listing.openingHours[day.weekday].length > 0;
  const date =
    days.find((d) => d.date === requested && isOpen(d))?.date ??
    days.find(isOpen)?.date ??
    days[0]?.date ??
    '';

  return (
    <article className="mx-auto max-w-6xl pt-6">
      <h1 className="text-2xl font-semibold sm:text-[26px]">{listing.name}</h1>
      <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm">
        {listing.rating > 0 && (
          <span className="flex items-center gap-1 font-semibold">
            <Star className="size-3.5 fill-current" /> {listing.rating.toFixed(2)}
            <span className="font-normal text-muted">· {listing.reviews} reviews</span>
          </span>
        )}
        <span className="font-semibold underline">
          {listing.city}, {listing.country}
        </span>
      </p>

      <Gallery listing={listing} />

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div>
          <section className="flex items-center justify-between border-b border-line pb-6">
            <div>
              <h2 className="text-xl font-semibold">
                {categoryNoun(listing)} hosted by {listing.hostName}
              </h2>
              <p className="mt-1 text-muted">
                Up to {listing.capacity} people · Book in {listing.slotMinutes}-minute steps
              </p>
            </div>
            <div className="grid size-14 shrink-0 place-items-center rounded-full bg-ink text-xl font-semibold text-white">
              {listing.hostName.charAt(0)}
            </div>
          </section>

          <section className="space-y-5 border-b border-line py-8">
            <Highlight icon={Users} title={`Room for ${listing.capacity}`}>
              Comfortable for groups up to {listing.capacity} people.
            </Highlight>
            <Highlight icon={Clock} title="Flexible hours">
              Book as little as {listing.slotMinutes} minutes, up to 8 hours in one go.
            </Highlight>
            <Highlight icon={Star} title={`Hosting for ${listing.hostYears} years`}>
              {listing.hostName} has welcomed guests here for {listing.hostYears} years.
            </Highlight>
          </section>

          <section className="border-b border-line py-8">
            <p className="leading-relaxed whitespace-pre-line">{listing.description}</p>
          </section>

          <section className="border-b border-line py-8">
            <h2 className="mb-5 text-xl font-semibold">What this space offers</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {listing.amenities.map((amenity) => {
                const Icon = amenityIcon(amenity);
                return (
                  <li key={amenity} className="flex items-center gap-4">
                    <Icon className="size-6 shrink-0" strokeWidth={1.5} />
                    {amenity}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="py-8">
            <h2 className="mb-5 text-xl font-semibold">Opening hours</h2>
            <dl className="grid max-w-md grid-cols-[120px_1fr] gap-y-2">
              {(Object.keys(listing.openingHours) as (keyof Listing['openingHours'])[]).map(
                (day) => (
                  <div key={day} className="contents">
                    <dt className="capitalize text-muted">{day}</dt>
                    <dd>
                      {listing.openingHours[day].length === 0
                        ? 'Closed'
                        : listing.openingHours[day].map((i) => `${i.from}–${i.to}`).join(', ')}
                    </dd>
                  </div>
                ),
              )}
            </dl>
            <p className="mt-3 text-sm text-muted">Times are local ({listing.timezone}).</p>
          </section>

          {listing.photoCredits.length > 0 && (
            <p className="border-t border-line pt-6 text-xs text-muted">
              Photos: {listing.photoCredits.join(' · ')}, via Wikimedia Commons.
            </p>
          )}
        </div>

        <aside>
          <div className="sticky top-28 rounded-2xl border border-line p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
            <p className="mb-5">
              <span className="text-[22px] font-semibold">
                {money(listing.pricePerHour, listing.currency)}
              </span>{' '}
              <span className="text-muted">/ hour</span>
            </p>
            <DateStrip listingId={listing.id} days={days} selected={date} isOpen={isOpen} />
            <Suspense key={date} fallback={<SlotsSkeleton />}>
              <Slots listing={listing} date={date} />
            </Suspense>
          </div>
        </aside>
      </div>
    </article>
  );
}

async function Slots({ listing, date }: { listing: Listing; date: string }) {
  const availability = await getAvailability(listing.id, date);
  return (
    <BookingPanel
      listingId={listing.id}
      slots={availability.slots}
      slotMinutes={availability.slotMinutes}
      pricePerHour={listing.pricePerHour}
      currency={listing.currency}
    />
  );
}

function DateStrip({
  listingId,
  days,
  selected,
  isOpen,
}: {
  listingId: string;
  days: CalendarDay[];
  selected: string;
  isOpen: (day: CalendarDay) => boolean;
}) {
  return (
    <div className="no-scrollbar -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1">
      {days.map((day) => {
        const open = isOpen(day);
        const classes = `flex w-14 shrink-0 flex-col items-center rounded-xl border py-2 text-xs ${
          day.date === selected
            ? 'border-ink bg-ink text-white'
            : open
              ? 'border-line hover:border-ink'
              : 'border-transparent text-neutral-300 line-through'
        }`;
        const label = (
          <>
            <span>{day.label.weekday}</span>
            <span className="text-lg font-semibold">{day.label.day}</span>
            <span>{day.label.month}</span>
          </>
        );
        return open ? (
          <Link
            key={day.date}
            href={`/listings/${listingId}?date=${day.date}`}
            scroll={false}
            replace
            className={classes}
            aria-current={day.date === selected ? 'date' : undefined}
          >
            {label}
          </Link>
        ) : (
          <span key={day.date} className={classes} title="Closed">
            {label}
          </span>
        );
      })}
    </div>
  );
}

function Gallery({ listing }: { listing: Listing }) {
  const [main, ...rest] = listing.images;
  if (!main) return <div className="mt-6 aspect-[2/1] rounded-2xl bg-neutral-200" />;
  const side = rest.slice(0, 3);
  return (
    <div className="mt-6 grid aspect-[2/1] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
      <div className="relative col-span-4 row-span-2 sm:col-span-2">
        <Image src={main} alt={listing.name} fill priority sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
      </div>
      {side.map((src, i) => (
        <div
          key={src}
          className={`relative hidden sm:block ${i === 0 ? 'col-span-2' : 'col-span-1'}`}
        >
          <Image src={src} alt="" fill sizes="25vw" className="object-cover transition hover:brightness-90" />
        </div>
      ))}
    </div>
  );
}

function Highlight({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-5">
      <Icon className="mt-0.5 size-6 shrink-0" strokeWidth={1.5} />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted">{children}</p>
      </div>
    </div>
  );
}

const NOUNS: Record<Listing['category'], string> = {
  studios: 'Photo studio',
  podcast: 'Podcast room',
  meetings: 'Meeting room',
  rooftops: 'Rooftop',
  kitchens: 'Kitchen',
  wellness: 'Studio',
  creative: 'Atelier',
  music: 'Music room',
};
const categoryNoun = (listing: Listing) => NOUNS[listing.category];

const AMENITY_ICONS: [RegExp, LucideIcon][] = [
  [/wifi/i, Wifi],
  [/coffee|tea|bar/i, Coffee],
  [/light|skylight|window/i, Lightbulb],
  [/sound|speaker|amplifier/i, Speaker],
  [/microphone|mixer|headphone/i, Mic],
  [/piano/i, Piano],
  [/drum|music|stand/i, Music],
  [/screen|video|projector/i, Projector],
  [/whiteboard/i, Presentation],
  [/cook|kitchen|chef/i, ChefHat],
  [/dining|table|dishwasher/i, Utensils],
  [/air conditioning/i, AirVent],
  [/access|lift/i, Accessibility],
  [/view|sun/i, Sun],
  [/seating|lounge|easel/i, Armchair],
  [/cyclorama|camera/i, Camera],
];
const amenityIcon = (amenity: string) =>
  AMENITY_ICONS.find(([pattern]) => pattern.test(amenity))?.[1] ?? Check;

function SlotsSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-4 gap-2">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="h-9 rounded-lg bg-neutral-100" />
      ))}
    </div>
  );
}

function ListingSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse pt-6">
      <div className="h-7 w-2/3 rounded bg-neutral-200" />
      <div className="mt-3 h-4 w-1/3 rounded bg-neutral-200" />
      <div className="mt-6 aspect-[2/1] rounded-2xl bg-neutral-200" />
    </div>
  );
}
