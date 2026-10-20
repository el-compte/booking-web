import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-2xl font-semibold">This page doesn’t exist</h1>
      <Link href="/" className="mt-6 inline-block rounded-lg bg-ink px-5 py-3 font-semibold text-white">
        Back to home
      </Link>
    </div>
  );
}
