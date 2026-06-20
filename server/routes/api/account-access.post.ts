import { defineHandler } from "nitro";
import { createError, getRequestHeader, readBody } from "nitro/h3";
import { getSessionFromCookie } from "../../utils/session";
import { isAdminUser } from "../../utils/admin";
import { addAllowedAccount, normalizeEmail } from "../../utils/account-access";

type Body = {
  email?: unknown;
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

  const body = await readBody<Body>(event);
  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";

  if (!email || !email.includes("@")) {
    throw createError({ statusCode: 400, statusMessage: "Valid email is required" });
  }

  const account = await addAllowedAccount(email, session.user.id);

  return {
    id: account.id,
    email: account.email,
    createdAt: account.created_at,
  };
});