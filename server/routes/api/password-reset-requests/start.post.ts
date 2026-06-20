import { defineHandler } from "nitro";
import { createError, readBody } from "nitro/h3";
import {
  createPasswordResetRequest,
  getApprovedPasswordResetRequestByEmail,
} from "../../utils/password-reset-requests";

type Body = {
  email?: unknown;
  reason?: unknown;
};

function normalizeEmailInput(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
}

export default defineHandler(async (event) => {
  const body = await readBody<Body>(event);
  const email = normalizeEmailInput(body.email);

  if (!email || !email.includes("@")) {
    throw createError({ statusCode: 400, statusMessage: "Valid email is required" });
  }

  const approved = await getApprovedPasswordResetRequestByEmail(email);

  if (approved) {
    return {
      approved: true,
      requestCreated: false,
    };
  }

  const created = await createPasswordResetRequest(email, body.reason);

  if (!created) {
    throw createError({ statusCode: 400, statusMessage: "Valid email is required" });
  }

  return {
    approved: false,
    requestCreated: true,
  };
});