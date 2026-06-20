import { defineHandler } from "nitro";
import { createError, getRequestHeader } from "nitro/h3";
import { getSessionFromCookie } from "../../../utils/session";
import {
  completeApprovedPasswordResetRequest,
  getApprovedPasswordResetRequestByEmail,
} from "../../../utils/password-reset-requests";

export default defineHandler(async (event) => {
  const session = await getSessionFromCookie(getRequestHeader(event, "cookie") ?? null);

  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const request = await getApprovedPasswordResetRequestByEmail(session.user.email);

  if (!request) {
    return { ok: true };
  }

  const completed = await completeApprovedPasswordResetRequest(
    request.id,
    session.user.email,
  );

  if (!completed) {
    throw createError({ statusCode: 400, statusMessage: "Password reset completion failed" });
  }

  return { ok: true };
});