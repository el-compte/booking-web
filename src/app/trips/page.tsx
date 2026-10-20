import { CircleCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { type Booking, getBooking } from '@/lib/api';
import { formatDay, formatTime, hoursLabel, money } from '@/lib/format';
import { getListing, type Listing } from '@/lib/listings';
import { getTripIds } from '@/lib/trips';
import { CancelButton } from './cancel-button';

export default function TripsPage({ searchParams }: PageProps<'/trips'>) {
  return (
    <div className="mx-auto max-w-4xl pt-10">
      <h1 className="text-3xl font-semibold">Your trips</h1>
      <Suspense fallback={<TripsSkeleton />}>
        <Trips searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

interface Trip {
  booking: Booking;
  listing: Listing | null;
}

async function Trips({ searchParams }: Pick<PageProps<'/trips'>, 'searchParams'>) {
  const [ids, params] = await Promise.all([getTripIds(), searchParams]);
  const booked = typeof params.booked === 'string' ? params.booked : null;

  const trips = (
    await Promise.all(
      ids.map(async (id): Promise<Trip | null> => {
        const booking = await getBooking(id);
        return booking ? { booking, listing: await getListing(booking.resourceId) } : null;
      }),
    )
  ).filter((trip): trip is Trip => trip !== null);

  await connection(); // "upcoming" depends on the current time
  const { upcoming, past } = splitTrips(trips);

  if (trips.length === 0) {
    return (
      <div className="mt-8 border-y border-line py-10">
        <h2 className="text-xl font-semibold">No trips booked... yet!</h2>
        <p className="mt-2 text-muted">Time to find a space for your next shoot, meeting or party.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg border border-ink px-5 py-3 font-semibold hover:bg-neutral-100"
        >
          Start searching
        </Link>
      </div>
    );
  }

  return (
    <>
      {booked && trips.some((t) => t.booking.id === booked) && (
        <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-900">
          <CircleCheck className="size-6 shrink-0" />
          <p>
            <span className="font-semibold">You’re booked!</span> Your reservation is confirmed and
            the time is held just for you.
          </p>
        </div>
      )}
      <TripList title="Upcoming" trips={upcoming} highlight={booked} cancellable />
      <TripList title="Past and cancelled" trips={past} highlight={null} />
    </>
  );
}

/** Upcoming confirmed bookings, soonest first; everything else is past or cancelled. */
function splitTrips(trips: Trip[]) {
  const now = Date.now();
  const upcoming = trips
    .filter((t) => t.booking.status === 'confirmed' && new Date(t.booking.end).getTime() > now)
    .sort((a, b) => a.booking.start.localeCompare(b.booking.start));
  return { upcoming, past: trips.filter((t) => !upcoming.includes(t)) };
}

function TripList({
  title,
  trips,
  highlight,
  cancellable = false,
}: {
  title: string;
  trips: Trip[];
  highlight: string | null;
  cancellable?: boolean;
}) {
  if (trips.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      <ul className="space-y-4">
        {trips.map(({ booking, listing }) => {
          const timezone = listing?.timezone ?? 'UTC';
          const minutes = (new Date(booking.end).getTime() - new Date(booking.start).getTime()) / 60_000;
          const cancelled = booking.status === 'cancelled';
          return (
            <li
              key={booking.id}
              className={`flex gap-4 rounded-2xl border p-4 ${
                booking.id === highlight ? 'border-ink shadow-md' : 'border-line'
              }`}
            >
              <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-neutral-200 sm:size-28">
                {listing?.images[0] && (
                  <Image src={listing.images[0]} alt="" fill sizes="112px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm text-muted">{listing ? `${listing.city}, ${listing.country}` : 'Listing removed'}</p>
                    <Link
                      href={listing ? `/listings/${listing.id}` : '/'}
                      className="block truncate font-semibold hover:underline"
                    >
                      {listing?.name ?? 'Unavailable space'}
                    </Link>
                  </div>
                  {cancelled && (
                    <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-muted">
                      Cancelled
                    </span>
                  )}
                </div>
                <p className="mt-2">
                  {formatDay(booking.start, timezone)} · {formatTime(booking.start, timezone)}–
                  {formatTime(booking.end, timezone)}
                  <span className="text-muted"> ({hoursLabel(minutes)})</span>
                </p>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <p className="text-sm text-muted">
                    {listing && `${money((minutes / 60) * listing.pricePerHour, listing.currency)} total · `}
                    Booked for {booking.customer.name}
                  </p>
                  {cancellable && !cancelled && <CancelButton bookingId={booking.id} />}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function TripsSkeleton() {
  return (
    <div className="mt-10 space-y-4">
      {[0, 1].map((i) => (
        <div key={i} className="h-32 animate-pulse rounded-2xl bg-neutral-100" />
      ))}
    </div>
  );
}
