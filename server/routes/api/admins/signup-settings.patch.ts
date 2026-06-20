import { defineHandler } from "nitro";
import { createError, getRequestHeader, readBody } from "nitro/h3";
import { getSessionFromCookie } from "../../../utils/session";
import { isAdminUser } from "../../../utils/admin";
import { setSignupsEnabled } from "../../../utils/signup-settings";

type Body = {
  enabled?: unknown;
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

  if (typeof body.enabled !== "boolean") {
    throw createError({ statusCode: 400, statusMessage: "enabled must be a boolean" });
  }

  const enabled = await setSignupsEnabled(body.enabled);

  return { enabled };
});