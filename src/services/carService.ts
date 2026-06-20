import { Car, OperationType, FirestoreErrorInfo } from "../types";

const COLLECTION_NAME = "cars";

function handleServiceError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
    },
    operationType,
    path,
  };
  console.error("Service Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function sanitizeCarData(carData: Partial<Car>) {
  const payload: Record<string, unknown> = {};

  if (typeof carData.make === "string") payload.make = carData.make.trim();
  if (typeof carData.model === "string") payload.model = carData.model.trim();

  if (typeof carData.year === "number" && Number.isFinite(carData.year)) {
    payload.year = Math.trunc(carData.year);
  }

  if (typeof carData.price === "number" && Number.isFinite(carData.price)) {
    payload.price = carData.price;
  }

  if (typeof carData.status === "string") {
    payload.status = carData.status;
  }

  if (typeof carData.engine === "string") payload.engine = carData.engine.trim();
  if (typeof carData.originalColour === "string") payload.originalColour = carData.originalColour.trim();
  if (typeof carData.description === "string") payload.description = carData.description.trim();

  if (typeof carData.mileage === "number" && Number.isFinite(carData.mileage)) {
    payload.mileage = Math.trunc(carData.mileage);
  }

  if (Array.isArray(carData.photos)) {
    payload.photos = carData.photos.filter((p): p is string => typeof p === "string" && p.length > 0);
  }

  return payload;
}

export const carService = {
  async getAllCars(): Promise<Car[]> {
    try {
      return await requestJson<Car[]>("/api/cars");
    } catch (error) {
      handleServiceError(error, OperationType.LIST, COLLECTION_NAME);
      return [];
    }
  },

  subscribeToCars(callback: (cars: Car[]) => void) {
    let active = true;

    const poll = async () => {
      if (!active) return;

      try {
        const cars = await requestJson<Car[]>("/api/cars");
        callback(cars);
      } catch {
        callback([]);
      }
    };

    poll();
    const interval = window.setInterval(poll, 5000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  },

  async getCarById(id: string): Promise<Car | null> {
    try {
      const cars = await requestJson<Car[]>("/api/cars");
      return cars.find((car) => car.id === id) ?? null;
    } catch (error) {
      handleServiceError(error, OperationType.GET, `${COLLECTION_NAME}/${id}`);
      return null;
    }
  },

  async createCar(carData: Partial<Car>): Promise<string> {
    const payload = sanitizeCarData(carData);

    try {
      const created = await requestJson<Car>("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return created.id;
    } catch (error) {
      handleServiceError(error, OperationType.CREATE, COLLECTION_NAME);
      return "";
    }
  },

  async updateCar(id: string, carData: Partial<Car>): Promise<void> {
    const payload = sanitizeCarData(carData);

    try {
      await requestJson(`/api/cars/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      handleServiceError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    }
  },

  async deleteCar(id: string): Promise<void> {
    try {
      await requestJson(`/api/cars/${id}`, { method: "DELETE" });
    } catch (error) {
      handleServiceError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    }
  },

  async checkIfAdmin(): Promise<boolean> {
    try {
      const result = await requestJson<{ isAdmin: boolean }>("/api/admins/me");
      return result.isAdmin;
    } catch {
      return false;
    }
  },

  async bootstrapAdmin(): Promise<void> {
    await requestJson("/api/admins/bootstrap", {
      method: "POST",
    });
  },
};