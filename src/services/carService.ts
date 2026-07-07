import type { RecordModel } from 'pocketbase';
import { pb } from '../lib/pocketbase';
import { Car, CarStatus } from '../types';

// ---------------------------------------------------------------------------
// Mapper: raw PocketBase record → Car
// ---------------------------------------------------------------------------
function mapCar(record: RecordModel): Car {
  return {
    id: record.id,
    collectionId: record.collectionId,
    collectionName: record.collectionName,
    make: record.make ?? '',
    model: record.model ?? '',
    year: record.year ?? 0,
    engine: record.engine ?? '',
    mileage: record.mileage ?? 0,
    originalColour: record.original_colour ?? '',
    status: (record.status as CarStatus) ?? 'Available',
    description: record.description ?? '',
    price: record.price ?? 0,
    // Map PB filenames → full URLs
    photos: (record.photos as string[] ?? []).map((filename) =>
      pb.files.getUrl(record, filename)
    ),
    created: record.created,
    updated: record.updated,
    createdBy: record.created_by ?? '',
  };
}

// ---------------------------------------------------------------------------
// carService
// ---------------------------------------------------------------------------
export const carService = {
  /** Fetch the full list of cars (sorted newest first). */
  async getAllCars(): Promise<Car[]> {
    const records = await pb
      .collection('cars')
      .getFullList({ sort: '-created' });
    return records.map(mapCar);
  },

  /**
   * Subscribe to realtime car updates.
   * Calls `callback` immediately with the initial list, then again on any
   * create / update / delete event.
   * Returns an unsubscribe function.
   */
  subscribeToCars(callback: (cars: Car[]) => void): () => void {
    let active = true;

    const refetch = async () => {
      if (!active) return;
      const records = await pb
        .collection('cars')
        .getFullList({ sort: '-created' });
      if (active) callback(records.map(mapCar));
    };

    // Initial fetch
    refetch();

    // Realtime subscription
    let unsubFn: (() => Promise<void>) | null = null;
    pb.collection('cars')
      .subscribe('*', () => { refetch(); })
      .then((fn) => { unsubFn = fn; })
      .catch(console.error);

    return () => {
      active = false;
      if (unsubFn) unsubFn();
    };
  },

  /** Get a single car by id. */
  async getCarById(id: string): Promise<Car | null> {
    try {
      const record = await pb.collection('cars').getOne(id);
      return mapCar(record);
    } catch {
      return null;
    }
  },

  /**
   * Create a new car listing.
   * `photoFiles` are new File objects to upload.
   */
  async createCar(
    carData: Partial<Car>,
    photoFiles: File[] = []
  ): Promise<string> {
    const fd = buildCarFormData(carData, photoFiles);
    if (pb.authStore.model?.id) {
      fd.append('created_by', pb.authStore.model.id);
    }
    const record = await pb.collection('cars').create(fd);
    return record.id;
  },

  /**
   * Update an existing car listing.
   * `photoFiles`  — new File objects to append.
   * `removePhotoFilenames` — existing PB filenames to delete.
   */
  async updateCar(
    id: string,
    carData: Partial<Car>,
    photoFiles: File[] = [],
    removePhotoFilenames: string[] = []
  ): Promise<void> {
    const fd = buildCarFormData(carData, photoFiles);
    for (const fn of removePhotoFilenames) {
      fd.append('photos-', fn);
    }
    await pb.collection('cars').update(id, fd);
  },

  async deleteCar(id: string): Promise<void> {
    await pb.collection('cars').delete(id);
  },
};

// ---------------------------------------------------------------------------
// Helper: build FormData from car fields
// ---------------------------------------------------------------------------
function buildCarFormData(carData: Partial<Car>, photoFiles: File[]): FormData {
  const fd = new FormData();

  if (typeof carData.make === 'string') fd.append('make', carData.make.trim());
  if (typeof carData.model === 'string') fd.append('model', carData.model.trim());
  if (typeof carData.year === 'number') fd.append('year', String(Math.trunc(carData.year)));
  if (typeof carData.price === 'number') fd.append('price', String(carData.price));
  if (typeof carData.status === 'string') fd.append('status', carData.status);
  if (typeof carData.engine === 'string') fd.append('engine', carData.engine.trim());
  if (typeof carData.originalColour === 'string')
    fd.append('original_colour', carData.originalColour.trim());
  if (typeof carData.description === 'string')
    fd.append('description', carData.description.trim());
  if (typeof carData.mileage === 'number')
    fd.append('mileage', String(Math.trunc(carData.mileage)));

  for (const file of photoFiles) {
    fd.append('photos', file);
  }

  return fd;
}