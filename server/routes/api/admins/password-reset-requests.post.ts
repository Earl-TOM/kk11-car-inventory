import { defineHandler } from "nitro";
import { createError, getRequestHeader, readBody } from "nitro/h3";
import { isAdminUser } from "../../../utils/admin";
import { getSessionFromCookie } from "../../../utils/session";
import {
  createPasswordResetRequest,
  mapPasswordResetRow,
  updatePasswordResetRequest,
} from "../../../utils/password-reset-requests";

type Body = {
  email?: unknown;
  reason?: unknown;
  adminNote?: unknown;
};

function normalizeEmailInput(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
}

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
  const email = normalizeEmailInput(body.email);

  if (!email || !email.includes("@")) {
    throw createError({ statusCode: 400, statusMessage: "Valid email is required" });
  }

  const reason = typeof body.reason === "string" ? body.reason : "Created by admin";
  const adminNote =
    typeof body.adminNote === "string" && body.adminNote.trim().length > 0
      ? body.adminNote
      : "Password reset required by admin.";

  const created = await createPasswordResetRequest(email, reason);

  if (!created) {
    throw createError({ statusCode: 400, statusMessage: "Unable to create reset request" });
  }

  const approved = await updatePasswordResetRequest(created.id, {
    status: "approved",
    adminNote,
    handledBy: session.user.id,
  });

  if (!approved) {
    throw createError({ statusCode: 500, statusMessage: "Unable to approve reset request" });
  }

  return mapPasswordResetRow(approved);
});
