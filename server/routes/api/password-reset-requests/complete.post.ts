import { defineHandler } from "nitro";
import { createError, getRequestHeader, readBody } from "nitro/h3";
import { getSessionFromCookie } from "../../../utils/session";
import {
  completeApprovedPasswordResetRequest,
  getApprovedPasswordResetRequestByEmail,
} from "../../../utils/password-reset-requests";

type Body = {
  temporaryPassword?: unknown;
};

export default defineHandler(async (event) => {
  const session = await getSessionFromCookie(getRequestHeader(event, "cookie") ?? null);

  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const body = await readBody<Body>(event);
  const temporaryPassword =
    typeof body.temporaryPassword === "string" ? body.temporaryPassword.trim() : "";

  const request = await getApprovedPasswordResetRequestByEmail(session.user.email);

  if (!request) {
    return { ok: true };
  }

  const requiresTemporaryPassword = (request.temporary_password || "").trim().length > 0;

  if (requiresTemporaryPassword && temporaryPassword.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "temporaryPassword is required" });
  }

  const completed = await completeApprovedPasswordResetRequest(
    request.id,
    session.user.email,
    temporaryPassword,
  );

  if (!completed) {
    throw createError({ statusCode: 400, statusMessage: "Password reset completion failed" });
  }

  return { ok: true };
});