'use client';

import { useActionState } from 'react';
import { type CancelState, cancelAction } from '@/app/actions';

export function CancelButton({ bookingId }: { bookingId: string }) {
  const [state, formAction, pending] = useActionState<CancelState, FormData>(cancelAction, {
    error: null,
  });
  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm('Cancel this booking? The time will be released to other guests.')) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="bookingId" value={bookingId} />
      <button
        type="submit"
        disabled={pending}
        className="text-sm font-semibold underline disabled:opacity-50"
      >
        {pending ? 'Cancelling…' : 'Cancel booking'}
      </button>
      {state.error && <p className="mt-1 text-sm text-brand-dark">{state.error}</p>}
    </form>
  );
}
