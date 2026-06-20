import { defineHandler } from "nitro";
import { createError, readBody } from "nitro/h3";
import { createPasswordResetRequest, mapPasswordResetRow } from "../../utils/password-reset-requests";

type Body = {
  email?: unknown;
  reason?: unknown;
};

export default defineHandler(async (event) => {
  const body = await readBody<Body>(event);

  const created = await createPasswordResetRequest(body.email, body.reason);

  if (!created) {
    throw createError({ statusCode: 400, statusMessage: "Valid email is required" });
  }

  return mapPasswordResetRow(created);
});