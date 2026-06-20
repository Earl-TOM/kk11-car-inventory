import { defineHandler } from "nitro";
import { createError, getRequestHeader, getRouterParam, readBody } from "nitro/h3";
import { getSessionFromCookie } from "../../../../utils/session";
import { isAdminUser } from "../../../../utils/admin";
import { mapPasswordResetRow, updatePasswordResetRequest, type PasswordResetStatus } from "../../../../utils/password-reset-requests";

type Body = {
  status?: unknown;
  adminNote?: unknown;
  generateTemporaryPassword?: unknown;
};

const VALID_STATUSES = new Set<PasswordResetStatus>(["pending", "approved", "completed", "rejected"]);

export default defineHandler(async (event) => {
  const session = await getSessionFromCookie(getRequestHeader(event, "cookie") ?? null);

  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const isAdmin = await isAdminUser(session.user);
  if (!isAdmin) {
    throw createError({ statusCode: 403, statusMessage: "Admin privileges required" });
  }

  const idParam = getRouterParam(event, "id");
  const id = Number(idParam);

  if (!idParam || !Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: "Invalid request id" });
  }

  const body = await readBody<Body>(event);

  if (body.status !== undefined && (typeof body.status !== "string" || !VALID_STATUSES.has(body.status as PasswordResetStatus))) {
    throw createError({ statusCode: 400, statusMessage: "Invalid status" });
  }

  if (body.adminNote !== undefined && typeof body.adminNote !== "string") {
    throw createError({ statusCode: 400, statusMessage: "adminNote must be a string" });
  }

  if (body.generateTemporaryPassword !== undefined && typeof body.generateTemporaryPassword !== "boolean") {
    throw createError({ statusCode: 400, statusMessage: "generateTemporaryPassword must be a boolean" });
  }

  const updated = await updatePasswordResetRequest(id, {
    status: body.status as PasswordResetStatus | undefined,
    adminNote: body.adminNote,
    handledBy: session.user.id,
    generateTemporaryPassword: body.generateTemporaryPassword === true,
  });

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: "Reset request not found" });
  }

  return mapPasswordResetRow(updated);
});