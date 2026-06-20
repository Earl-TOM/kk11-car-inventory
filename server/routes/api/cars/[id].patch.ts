import { defineHandler } from "nitro";
import { createError, getRequestHeader, getRouterParam, readBody } from "nitro/h3";
import { sql } from "../../../utils/db";
import { isAdminUser } from "../../../utils/admin";
import { getSessionFromCookie } from "../../../utils/session";
import { mapCarRow, sanitizeCarPayload, type CarRow } from "../../../utils/cars";

type UpdateCarBody = {
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
};

export default defineHandler(async (event) => {
  const session = await getSessionFromCookie(getRequestHeader(event, "cookie") ?? null);

  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const isAdmin = await isAdminUser(session.user);
  if (!isAdmin) {
    throw createError({ statusCode: 403, statusMessage: "Admin privileges required" });
  }

  const idParam = getRouterParam(event, "id");
  const id = Number(idParam);

  if (!idParam || !Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: "Invalid car id" });
  }

  const body = await readBody<UpdateCarBody>(event);
  const payload = sanitizeCarPayload(body);

  const existingRows = await sql<{ id: number; created_by: string; created_at: string | Date }[]>`
    SELECT id, created_by, created_at
    FROM cars
    WHERE id = ${id}
    LIMIT 1
  `;

  if (!existingRows.length) {
    throw createError({ statusCode: 404, statusMessage: "Car not found" });
  }

  const existing = existingRows[0];

  const rows = await sql<CarRow[]>`
    UPDATE cars
    SET
      make = COALESCE(${payload.make ?? null}, make),
      model = COALESCE(${payload.model ?? null}, model),
      year = COALESCE(${payload.year ?? null}, year),
      engine = COALESCE(${payload.engine ?? null}, engine),
      mileage = COALESCE(${payload.mileage ?? null}, mileage),
      original_colour = COALESCE(${payload.originalColour ?? null}, original_colour),
      photos = COALESCE(${payload.photos.length ? JSON.stringify(payload.photos) : null}, photos),
      price = COALESCE(${payload.price ?? null}, price),
      status = COALESCE(${payload.status ?? null}, status),
      description = COALESCE(${payload.description ?? null}, description),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING
      id, make, model, year, engine, mileage, original_colour, photos, price, status, description, created_by, created_at, updated_at
  `;

  if (!rows.length) {
    throw createError({ statusCode: 404, statusMessage: "Car not found" });
  }

  return mapCarRow({
    ...rows[0],
    created_by: existing.created_by,
    created_at: existing.created_at,
  });
});