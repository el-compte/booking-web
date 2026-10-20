'use server';

import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { ApiError, cancelBooking, createBooking } from '@/lib/api';
import { addTripId, getTripIds } from '@/lib/trips';

export interface BookingFormState {
  error: string | null;
  /** True when the slot was taken by someone else, so the form should reload the slots. */
  slotTaken?: boolean;
}

const bookingForm = z.object({
  resourceId: z.string().regex(/^[a-f\d]{24}$/i),
  start: z.iso.datetime({ offset: true }),
  end: z.iso.datetime({ offset: true }),
  name: z.string().trim().min(1, 'Enter your name').max(100),
  email: z.email('Enter a valid email').max(254),
  idempotencyKey: z.uuid(),
});

export async function bookAction(
  _previous: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const parsed = bookingForm.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Please check the form' };
  }
  const { resourceId, start, end, name, email, idempotencyKey } = parsed.data;

  let bookingId: string;
  try {
    const booking = await createBooking(
      { resourceId, start, end, customer: { name, email } },
      idempotencyKey,
    );
    bookingId = booking.id;
  } catch (error) {
    if (error instanceof ApiError && error.code === 'slot_unavailable') {
      refresh();
      return { error: 'Someone just booked part of that time. Please pick another slot.', slotTaken: true };
    }
    if (error instanceof ApiError && error.status < 500) return { error: error.message };
    throw error;
  }

  await addTripId(bookingId);
  redirect(`/trips?booked=${bookingId}`);
}

export interface CancelState {
  error: string | null;
}

export async function cancelAction(_previous: CancelState, formData: FormData): Promise<CancelState> {
  const id = String(formData.get('bookingId') ?? '');
  // Only bookings made from this browser can be cancelled here.
  if (!(await getTripIds()).includes(id)) return { error: 'This booking is not in your trips' };
  try {
    await cancelBooking(id);
  } catch (error) {
    if (error instanceof ApiError && error.status < 500) return { error: error.message };
    throw error;
  }
  refresh();
  return { error: null };
}
