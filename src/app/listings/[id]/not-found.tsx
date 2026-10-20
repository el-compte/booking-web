import Link from 'next/link';

export default function ListingNotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-2xl font-semibold">We can’t find that space</h1>
      <p className="mt-2 text-muted">It may have been removed by its host.</p>
      <Link href="/" className="mt-6 inline-block rounded-lg bg-ink px-5 py-3 font-semibold text-white">
        Explore other spaces
      </Link>
    </div>
  );
}
