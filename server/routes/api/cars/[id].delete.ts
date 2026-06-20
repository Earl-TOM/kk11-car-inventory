import { defineHandler } from "nitro";
import { createError, getRequestHeader, getRouterParam } from "nitro/h3";
import { sql } from "../../../utils/db";
import { isAdminUser } from "../../../utils/admin";
import { getSessionFromCookie } from "../../../utils/session";

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

  const rows = await sql<{ id: number }[]>`
    DELETE FROM cars
    WHERE id = ${id}
    RETURNING id
  `;

  if (!rows.length) {
    throw createError({ statusCode: 404, statusMessage: "Car not found" });
  }

  return { ok: true };
});