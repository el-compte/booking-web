import { CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { Logo } from './logo';
import { SearchBar, SearchForm } from './search-bar';

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <div className="shrink-0 md:w-40">
          <Logo />
        </div>
        <div className="flex flex-1 justify-center">
          <Suspense fallback={<SearchForm />}>
            <SearchBar />
          </Suspense>
        </div>
        <Link
          href="/trips"
          className="flex shrink-0 items-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold hover:bg-neutral-100 md:w-40 md:justify-end"
        >
          <CalendarDays className="size-5" />
          <span className="hidden sm:inline">Your trips</span>
        </Link>
      </div>
    </header>
  );
}
