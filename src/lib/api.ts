import 'server-only';

/**
 * Client for the booking API. It only runs on the server, so the API key never
 * reaches the browser.
 */

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type MetadataValue = string | number | boolean | string[];

export interface Resource {
  id: string;
  name: string;
  description: string | null;
  timezone: string;
  slotMinutes: number;
  openingHours: Record<Weekday, { from: string; to: string }[]>;
  metadata: Record<string, MetadataValue>;
}

export interface Slot {
  /** ISO 8601 with the resource's UTC offset, e.g. 2026-11-02T10:00:00+01:00 */
  start: string;
  end: string;
}

export interface Availability {
  resourceId: string;
  date: string;
  timezone: string;
  slotMinutes: number;
  slots: Slot[];
}

export interface Booking {
  id: string;
  resourceId: string;
  start: string;
  end: string;
  status: 'confirmed' | 'cancelled';
  customer: { name: string; email: string | null; phone: string | null };
  notes: string | null;
  createdAt: string;
  cancelledAt: string | null;
}

interface Page<T> {
  data: T[];
  nextCursor: string | null;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_URL = process.env.BOOKING_API_URL ?? 'http://localhost:4000';

async function request<T>(
  path: string,
  { idempotencyKey, ...init }: RequestInit & { idempotencyKey?: string } = {},
): Promise<T> {
  const apiKey = process.env.BOOKING_API_KEY;
  if (!apiKey) throw new Error('BOOKING_API_KEY is not set. Run `npm run seed` first.');

  const response = await fetch(`${API_URL}/v1${path}`, {
    ...init,
    headers: {
      'x-api-key': apiKey,
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...(idempotencyKey ? { 'idempotency-key': idempotencyKey } : {}),
    },
  });
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.error?.code ?? 'unknown_error',
      body?.error?.message ?? `Booking API returned ${response.status}`,
    );
  }
  return body as T;
}

export async function listResources(): Promise<Resource[]> {
  const resources: Resource[] = [];
  let cursor: string | null = null;
  do {
    const query: string = cursor ? `&cursor=${encodeURIComponent(cursor)}` : '';
    const page: Page<Resource> = await request(`/resources?limit=100${query}`);
    resources.push(...page.data);
    cursor = page.nextCursor;
  } while (cursor);
  return resources;
}

export async function getResource(id: string): Promise<Resource | null> {
  try {
    return await request<Resource>(`/resources/${id}`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

export function getAvailability(id: string, date: string): Promise<Availability> {
  return request(`/resources/${id}/availability?date=${date}`);
}

export function createBooking(
  input: {
    resourceId: string;
    start: string;
    end: string;
    customer: { name: string; email: string };
  },
  idempotencyKey: string,
): Promise<Booking> {
  return request('/bookings', { method: 'POST', body: JSON.stringify(input), idempotencyKey });
}

export async function getBooking(id: string): Promise<Booking | null> {
  try {
    return await request<Booking>(`/bookings/${id}`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

export function cancelBooking(id: string): Promise<Booking> {
  return request(`/bookings/${id}/cancel`, { method: 'POST' });
}
