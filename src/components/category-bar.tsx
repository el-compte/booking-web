import {
  Building2,
  Camera,
  ChefHat,
  Flower2,
  LayoutGrid,
  type LucideIcon,
  Mic,
  Music,
  Palette,
  Presentation,
} from 'lucide-react';
import Link from 'next/link';
import { CATEGORIES, type CategoryId } from '@/lib/categories';

const ICONS: Record<CategoryId, LucideIcon> = {
  studios: Camera,
  podcast: Mic,
  meetings: Presentation,
  rooftops: Building2,
  kitchens: ChefHat,
  wellness: Flower2,
  creative: Palette,
  music: Music,
};

function hrefFor(category: string | null, q: string, guests: string) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (q) params.set('q', q);
  if (guests) params.set('guests', guests);
  const query = params.toString();
  return query ? `/?${query}` : '/';
}

export function CategoryBar({
  active,
  q = '',
  guests = '',
}: {
  active: string | null;
  q?: string;
  guests?: string;
}) {
  const items = [
    { id: null, label: 'All spaces', Icon: LayoutGrid },
    ...CATEGORIES.map((c) => ({ id: c.id, label: c.label, Icon: ICONS[c.id] })),
  ];
  return (
    <nav className="no-scrollbar -mx-4 flex gap-8 overflow-x-auto px-4 pt-6 sm:mx-0 sm:px-0">
      {items.map(({ id, label, Icon }) => {
        const selected = id === active;
        return (
          <Link
            key={label}
            href={hrefFor(id, q, guests)}
            scroll={false}
            className={`flex shrink-0 flex-col items-center gap-2 border-b-2 pb-3 text-xs font-medium transition-colors ${
              selected
                ? 'border-ink text-ink'
                : 'border-transparent text-muted hover:border-line hover:text-ink'
            }`}
          >
            <Icon className="size-6" strokeWidth={1.6} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
