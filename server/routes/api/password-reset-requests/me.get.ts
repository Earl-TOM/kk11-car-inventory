import { defineHandler } from "nitro";
import { createError, getRequestHeader } from "nitro/h3";
import { getSessionFromCookie } from "../../../utils/session";
import { getApprovedPasswordResetRequestByEmail } from "../../../utils/password-reset-requests";

export default defineHandler(async (event) => {
  const session = await getSessionFromCookie(getRequestHeader(event, "cookie") ?? null);

  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const request = await getApprovedPasswordResetRequestByEmail(session.user.email);

  return {
    required: Boolean(request),
    requestId: request?.id ?? null,
  };
});