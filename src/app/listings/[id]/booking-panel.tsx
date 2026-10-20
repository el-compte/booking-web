'use client';

import { useActionState, useMemo, useState } from 'react';
import { type BookingFormState, bookAction } from '@/app/actions';
import type { Slot } from '@/lib/api';
import { clock, hoursLabel, money } from '@/lib/format';

const MAX_BOOKING_MINUTES = 8 * 60;

interface Props {
  listingId: string;
  slots: Slot[];
  slotMinutes: number;
  pricePerHour: number;
  currency: string;
}

/** Longest run of back-to-back free slots starting at `index`. */
function consecutiveFrom(slots: Slot[], index: number, max: number): number {
  let count = 1;
  while (
    count < max &&
    index + count < slots.length &&
    slots[index + count]?.start === slots[index + count - 1]?.end
  ) {
    count += 1;
  }
  return count;
}

export function BookingPanel({ listingId, slots, slotMinutes, pricePerHour, currency }: Props) {
  const [startIndex, setStartIndex] = useState<number | null>(null);
  const [length, setLength] = useState(1);
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [state, formAction, pending] = useActionState<BookingFormState, FormData>(
    async (previous, formData) => {
      const result = await bookAction(previous, formData);
      if (result.slotTaken) {
        setStartIndex(null);
        setIdempotencyKey(crypto.randomUUID());
      }
      return result;
    },
    { error: null },
  );

  const maxLength = useMemo(
    () =>
      startIndex === null
        ? 1
        : consecutiveFrom(slots, startIndex, Math.floor(MAX_BOOKING_MINUTES / slotMinutes)),
    [slots, startIndex, slotMinutes],
  );

  const choose = (index: number) => {
    setStartIndex(index);
    setLength(1);
    setIdempotencyKey(crypto.randomUUID());
  };

  if (slots.length === 0) {
    return (
      <p className="rounded-xl bg-neutral-50 p-4 text-sm text-muted">
        No free times on this day. Try another date.
      </p>
    );
  }

  const start = startIndex === null ? null : slots[startIndex];
  const end = startIndex === null ? null : slots[startIndex + length - 1];
  const minutes = length * slotMinutes;
  const total = (minutes / 60) * pricePerHour;

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-semibold">Start time</p>
        <div className="grid grid-cols-4 gap-2">
          {slots.map((slot, i) => {
            const inRange = startIndex !== null && i >= startIndex && i < startIndex + length;
            return (
              <button
                key={slot.start}
                type="button"
                onClick={() => choose(i)}
                className={`rounded-lg border py-2 text-sm transition-colors ${
                  i === startIndex
                    ? 'border-ink bg-ink text-white'
                    : inRange
                      ? 'border-ink bg-neutral-100'
                      : 'border-line hover:border-ink'
                }`}
              >
                {clock(slot.start)}
              </button>
            );
          })}
        </div>
      </div>

      {start && end && (
        <>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Duration</span>
            <select
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full rounded-lg border border-line px-3 py-3 focus:border-ink focus:outline-none"
            >
              {Array.from({ length: maxLength }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {hoursLabel(n * slotMinutes)} · until {clock(slots[startIndex! + n - 1]?.end ?? '')}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3">
            <input
              name="name"
              required
              maxLength={100}
              placeholder="Your name"
              autoComplete="name"
              className="rounded-lg border border-line px-3 py-3 focus:border-ink focus:outline-none"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              autoComplete="email"
              className="rounded-lg border border-line px-3 py-3 focus:border-ink focus:outline-none"
            />
          </div>

          <input type="hidden" name="resourceId" value={listingId} />
          <input type="hidden" name="start" value={start.start} />
          <input type="hidden" name="end" value={end.end} />
          <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
        </>
      )}

      {state.error && (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-brand-dark">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={!start || pending}
        className="w-full rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 py-3.5 font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? 'Reserving…' : start ? 'Reserve' : 'Choose a start time'}
      </button>
      <p className="text-center text-sm text-muted">Demo booking: no payment is taken.</p>

      {start && (
        <div className="space-y-3 border-t border-line pt-4">
          <div className="flex justify-between text-muted">
            <span className="underline">
              {money(pricePerHour, currency)} × {hoursLabel(minutes)}
            </span>
            <span>{money(total, currency)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{money(total, currency)}</span>
          </div>
        </div>
      )}
    </form>
  );
}
