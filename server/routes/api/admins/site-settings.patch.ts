import { defineHandler } from "nitro";
import { createError, getRequestHeader, readBody } from "nitro/h3";
import { getSessionFromCookie } from "../../../utils/session";
import { isAdminUser } from "../../../utils/admin";
import { updateSiteSettings } from "../../../utils/site-settings";

type Body = {
  siteName?: unknown;
  siteSubtitle?: unknown;
  heroKicker?: unknown;
  heroTitle?: unknown;
  heroDescription?: unknown;
  footerText?: unknown;
  logoUrl?: unknown;
  faviconUrl?: unknown;
  whatsappNumber?: unknown;
};

function normalizeWhatsAppNumber(value: string) {
  return value.trim().replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
}

function isInternationalNumber(value: string) {
  return /^\+[1-9]\d{7,14}$/.test(value);
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

  if (body.whatsappNumber !== undefined) {
    if (typeof body.whatsappNumber !== "string") {
      throw createError({ statusCode: 400, statusMessage: "whatsappNumber must be a string" });
    }

    const normalized = normalizeWhatsAppNumber(body.whatsappNumber);

    if (normalized.length > 0 && !isInternationalNumber(normalized)) {
      throw createError({
        statusCode: 400,
        statusMessage: "WhatsApp number must include country code (e.g. +260...)",
      });
    }

    body.whatsappNumber = normalized;
  }

  return updateSiteSettings(body);
});