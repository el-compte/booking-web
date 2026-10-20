'use client';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const apiDown = /fetch failed|ECONNREFUSED|BOOKING_API_KEY/.test(error.message);
  return (
    <div className="py-24 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mx-auto mt-2 max-w-md text-muted">
        {apiDown
          ? "We couldn't reach the booking service. Check that the API is running and that npm run seed has been run."
          : 'Please try again in a moment.'}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-ink px-5 py-3 font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
