# Hourstay

A marketplace for booking unique spaces by the hour (photo studios, podcast rooms, rooftops,
kitchens), built on top of my [Booking API](https://github.com/el-compte/booking-api).

Built with **Next.js 16 (App Router, Server Components, Server Actions), React 19, TypeScript and
Tailwind CSS**.

**Live demo:** https://YOUR-APP.vercel.app <!-- replace after deploying -->

## What it shows

- **A real booking flow.** Browse spaces, filter by category, city and group size, pick a day,
  see live free times, choose a duration and reserve. Bookings appear under **Your trips**, where
  they can be cancelled.
- **The API key stays on the server.** Every call to the Booking API happens in Server
  Components and Server Actions, so the key never reaches the browser.
- **No double bookings.** If someone else takes the slot first, the API answers
  `409 slot_unavailable`. The page explains what happened and reloads the free times.
- **Safe retries.** Each reservation sends an `Idempotency-Key`, so a double click or a retried
  request can't create two bookings.
- **Time zones.** Listings are in Paris, Lisbon, Berlin and more. Days and times always show in
  the space's local time.
- **Fast pages.** The page layout appears instantly with loading placeholders, and live data
  streams in (Cache Components and `<Suspense>`). Listing details are cached for a few minutes;
  availability is always fresh.

## Run it locally

1. Start the [Booking API](https://github.com/el-compte/booking-api) on port 4000 (see its README).
2. Then:

```bash
npm install
npm run seed   # creates a demo host, an API key and 8 listings, and writes .env.local
npm run dev
```

Open http://localhost:3000.

## How it uses the API

| Page | API calls |
| --- | --- |
| Home | `GET /v1/resources`. Photos, price and city come from each resource's `metadata` |
| Listing | `GET /v1/resources/{id}` and `GET /v1/resources/{id}/availability?date=` |
| Reserve | `POST /v1/bookings` with an `Idempotency-Key` |
| Your trips | `GET /v1/bookings/{id}` and `POST /v1/bookings/{id}/cancel` |

Guests don't have accounts in this demo. The browser remembers its bookings in an http-only
cookie.

## Project structure

```
src/
  app/
    page.tsx                  Home: categories and listing grid
    listings/[id]/page.tsx    Listing: gallery, details, day picker
    listings/[id]/booking-panel.tsx   Free times, duration, reservation form
    trips/page.tsx            Your bookings, with cancel
    actions.ts                Server Actions: book and cancel
  lib/
    api.ts                    Typed client for the Booking API (server only)
    listings.ts               Turns API resources into listings, with caching
scripts/
  seed.mts                    Loads the demo listings through the API
```

## Photos

Listing photos come from [Wikimedia Commons](https://commons.wikimedia.org) under free licenses.
Each listing page credits its photographers.

## Deploy (free)

1. Deploy the [Booking API](https://github.com/el-compte/booking-api) first (Render + MongoDB Atlas, see its README).
2. Load the demo listings into it. This prints an API key and leaves `.env.local` alone:

   ```bash
   BOOKING_API_URL=https://your-api.onrender.com npm run seed
   ```

3. Import this repository on [Vercel](https://vercel.com), add `BOOKING_API_URL` and
   `BOOKING_API_KEY` as environment variables, and deploy.

## License

MIT
