export type CarRow = {
  id: number;
  make: string;
  model: string;
  year: number;
  engine: string | null;
  mileage: number | null;
  original_colour: string | null;
  photos: unknown;
  price: string | number;
  status: 'Available' | 'Sold' | 'Reserved';
  description: string | null;
  created_by: string;
  created_at: string | Date;
  updated_at: string | Date;
};

type CarPayload = {
  make?: unknown;
  model?: unknown;
  year?: unknown;
  engine?: unknown;
  mileage?: unknown;
  originalColour?: unknown;
  photos?: unknown;
  price?: unknown;
  status?: unknown;
  description?: unknown;
  createdBy?: unknown;
};

const VALID_STATUSES = new Set(['Available', 'Sold', 'Reserved']);

function normalizePhotos(photos: unknown): string[] {
  if (Array.isArray(photos)) {
    return photos.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  if (typeof photos === 'string') {
    try {
      const parsed = JSON.parse(photos);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
      }
    } catch {
      return [];
    }
  }

  return [];
}

export function mapCarRow(row: CarRow) {
  return {
    id: String(row.id),
    make: row.make,
    model: row.model,
    year: row.year,
    engine: row.engine ?? '',
    mileage: row.mileage ?? undefined,
    originalColour: row.original_colour ?? '',
    photos: normalizePhotos(row.photos),
    price: Number(row.price),
    status: row.status,
    description: row.description ?? '',
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function cleanString(value: unknown, max = 255) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

function cleanInteger(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.trunc(value);
}

function cleanNumber(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return value;
}

export function sanitizeCarPayload(input: CarPayload) {
  const make = cleanString(input.make, 100);
  const model = cleanString(input.model, 100);
  const year = cleanInteger(input.year);
  const engine = cleanString(input.engine, 100);
  const mileage = cleanInteger(input.mileage);
  const originalColour = cleanString(input.originalColour, 60);
  const photos = normalizePhotos(input.photos);
  const price = cleanNumber(input.price);
  const status = typeof input.status === 'string' && VALID_STATUSES.has(input.status) ? input.status : undefined;
  const description = cleanString(input.description, 4000);
  const createdBy = cleanString(input.createdBy, 200);

  return {
    make,
    model,
    year,
    engine,
    mileage,
    originalColour,
    photos,
    price,
    status,
    description,
    createdBy,
  };
}