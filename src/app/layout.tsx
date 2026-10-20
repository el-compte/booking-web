import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Header } from '@/components/header';
import './globals.css';

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hourstay · Unique spaces by the hour',
  description:
    'Book photo studios, meeting rooms, rooftops and more by the hour. A demo storefront for the Booking API.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased`}>
        <Header />
        <main className="mx-auto min-h-[70vh] max-w-7xl px-4 sm:px-6 lg:px-10">{children}</main>
        <footer className="mt-16 border-t border-line bg-neutral-50">
          <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-muted sm:px-6 lg:px-10">
            Hourstay is a demo project built on the Booking API. Listings, hosts and reviews are
            sample data, and no payment is ever taken. Photos from Wikimedia Commons; credits are
            on each listing.
          </div>
        </footer>
      </body>
    </html>
  );
}
