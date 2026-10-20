'use client';

import { Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

/** The pill-shaped search in the header. Submits a plain GET form to the home page. */
export function SearchBar() {
  const params = useSearchParams();
  return <SearchForm q={params.get('q') ?? ''} guests={params.get('guests') ?? ''} />;
}

export function SearchForm({ q = '', guests = '' }: { q?: string; guests?: string }) {
  return (
    <form
      action="/"
      className="flex w-full max-w-xl items-center rounded-full border border-line bg-white py-1.5 pr-1.5 pl-6 shadow-[0_3px_12px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_3px_16px_rgba(0,0,0,0.14)]"
    >
      <label className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs font-semibold">Where</span>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search cities or spaces"
          className="truncate bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
        />
      </label>
      <span className="mx-4 h-8 w-px bg-line" aria-hidden="true" />
      <label className="flex w-24 flex-col sm:w-28">
        <span className="text-xs font-semibold">Who</span>
        <select
          name="guests"
          defaultValue={guests}
          className="bg-transparent text-sm text-muted focus:outline-none"
        >
          <option value="">Any size</option>
          {[2, 4, 6, 10, 20].map((n) => (
            <option key={n} value={n}>
              {n}+ people
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="ml-2 grid size-11 shrink-0 place-items-center rounded-full bg-brand text-white transition-colors hover:bg-brand-dark"
        aria-label="Search"
      >
        <Search className="size-4" strokeWidth={3} />
      </button>
    </form>
  );
}
