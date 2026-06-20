import { defineHandler } from "nitro";
import { createError, getRequestHeader } from "nitro/h3";
import { sql } from "../../../utils/db";
import { BOOTSTRAP_ADMIN_EMAIL } from "../../../utils/admin";
import { getSessionFromCookie } from "../../../utils/session";

export default defineHandler(async (event) => {
  const session = await getSessionFromCookie(getRequestHeader(event, "cookie") ?? null);

  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const email = session.user.email.trim().toLowerCase();

  if (email !== BOOTSTRAP_ADMIN_EMAIL) {
    throw createError({ statusCode: 403, statusMessage: "Only bootstrap admin email can self-register" });
  }

  await sql`
    INSERT INTO admins (uid, email)
    VALUES (${session.user.id}, ${email})
    ON CONFLICT (uid) DO UPDATE
      SET email = EXCLUDED.email
  `;

  return { ok: true };
});