import { defineHandler } from "nitro";
import { createError, getRequestHeader } from "nitro/h3";
import { getSessionFromCookie } from "../../../utils/session";
import { isAdminUser } from "../../../utils/admin";
import { listPasswordResetRequests, mapPasswordResetRow } from "../../../utils/password-reset-requests";

export default defineHandler(async (event) => {
  const session = await getSessionFromCookie(getRequestHeader(event, "cookie") ?? null);

  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const isAdmin = await isAdminUser(session.user);
  if (!isAdmin) {
    throw createError({ statusCode: 403, statusMessage: "Admin privileges required" });
  }

  const rows = await listPasswordResetRequests();
  return rows.map(mapPasswordResetRow);
});