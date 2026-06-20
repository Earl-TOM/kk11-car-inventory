import { defineHandler } from "nitro";
import { createError, getRequestHeader } from "nitro/h3";
import { getSessionFromCookie } from "../../utils/session";
import { isAdminUser } from "../../utils/admin";
import { listAllowedAccounts } from "../../utils/account-access";

export default defineHandler(async (event) => {
  const session = await getSessionFromCookie(getRequestHeader(event, "cookie") ?? null);

  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const isAdmin = await isAdminUser(session.user);
  if (!isAdmin) {
    throw createError({ statusCode: 403, statusMessage: "Admin privileges required" });
  }

  const accounts = await listAllowedAccounts();

  return accounts.map((row) => ({
    id: row.id,
    email: row.email,
    createdAt: row.created_at,
  }));
});