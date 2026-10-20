import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-1.5 text-brand" aria-label="Hourstay home">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
        <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="3" />
        <path
          d="M16 8.5V16l5 3"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="hidden text-xl font-bold tracking-tight md:inline">hourstay</span>
    </Link>
  );
}
