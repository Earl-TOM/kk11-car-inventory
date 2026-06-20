import { defineHandler } from "nitro";
import { createError, getRequestHeader, readBody } from "nitro/h3";
import { sql } from "../../utils/db";
import { isAdminUser } from "../../utils/admin";
import { getSessionFromCookie } from "../../utils/session";
import { mapCarRow, sanitizeCarPayload, type CarRow } from "../../utils/cars";

type CreateCarBody = {
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

  const body = await readBody<CreateCarBody>(event);
  const payload = sanitizeCarPayload(body);

  if (!payload.make || !payload.model || !payload.year || payload.price === undefined || !payload.status) {
    throw createError({ statusCode: 400, statusMessage: "Missing required car fields" });
  }

  const rows = await sql<CarRow[]>`
    INSERT INTO cars (
      make, model, year, engine, mileage, original_colour, photos, price, status, description, created_by, updated_at
    )
    VALUES (
      ${payload.make},
      ${payload.model},
      ${payload.year},
      ${payload.engine ?? null},
      ${payload.mileage ?? null},
      ${payload.originalColour ?? null},
      ${JSON.stringify(payload.photos)},
      ${payload.price},
      ${payload.status},
      ${payload.description ?? null},
      ${session.user.id},
      NOW()
    )
    RETURNING
      id, make, model, year, engine, mileage, original_colour, photos, price, status, description, created_by, created_at, updated_at
  `;

  return mapCarRow(rows[0]);
});