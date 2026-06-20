import { defineHandler } from "nitro";
import { getRequestHeader } from "nitro/h3";
import { isAdminUser } from "../../../utils/admin";
import { getSessionFromCookie } from "../../../utils/session";

export default defineHandler(async (event) => {
  const session = await getSessionFromCookie(getRequestHeader(event, "cookie") ?? null);

  if (!session?.user) {
    return { isAdmin: false };
  }

  const isAdmin = await isAdminUser(session.user);

  return { isAdmin };
});