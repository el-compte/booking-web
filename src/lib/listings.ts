import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { getResource, listResources, type Resource } from './api';
import { type CategoryId, isCategoryId } from './categories';

/** A resource from the booking API, plus the storefront details kept in its metadata. */
export interface Listing {
  id: string;
  name: string;
  description: string;
  timezone: string;
  slotMinutes: number;
  openingHours: Resource['openingHours'];
  category: CategoryId;
  city: string;
  country: string;
  pricePerHour: number;
  currency: string;
  capacity: number;
  rating: number;
  reviews: number;
  images: string[];
  amenities: string[];
  hostName: string;
  hostYears: number;
  photoCredits: string[];
}

const text = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);
const num = (value: unknown, fallback = 0) => (typeof value === 'number' ? value : fallback);
const list = (value: unknown) =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

export function toListing(resource: Resource): Listing {
  const m = resource.metadata;
  const category = text(m.category);
  return {
    id: resource.id,
    name: resource.name,
    description: resource.description ?? '',
    timezone: resource.timezone,
    slotMinutes: resource.slotMinutes,
    openingHours: resource.openingHours,
    category: isCategoryId(category) ? category : 'studios',
    city: text(m.city, 'Unknown city'),
    country: text(m.country),
    pricePerHour: num(m.pricePerHour),
    currency: text(m.currency, 'EUR'),
    capacity: num(m.capacity, 1),
    rating: num(m.rating),
    reviews: num(m.reviews),
    images: list(m.images),
    amenities: list(m.amenities),
    hostName: text(m.hostName, 'Your host'),
    hostYears: num(m.hostYears, 1),
    photoCredits: list(m.photoCredits),
  };
}

export async function getListings(): Promise<Listing[]> {
  'use cache';
  cacheLife('minutes');
  cacheTag('listings');
  return (await listResources()).map(toListing);
}

export async function getListing(id: string): Promise<Listing | null> {
  'use cache';
  cacheLife('minutes');
  cacheTag('listings');
  if (!/^[a-f\d]{24}$/i.test(id)) return null;
  const resource = await getResource(id);
  return resource ? toListing(resource) : null;
}
