import { defineHandler } from "nitro";
import { createError, getRequestHeaders, getRequestURL, readRawBody } from "nitro/h3";
import { isEmailAllowedForSignup, normalizeEmail } from "../../../utils/account-access";
import { BOOTSTRAP_ADMIN_EMAIL } from "../../../utils/admin";
import { getSignupsEnabled } from "../../../utils/signup-settings";

const RAW_NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL;

if (!RAW_NEON_AUTH_BASE_URL) {
  throw new Error("NEON_AUTH_BASE_URL is not set");
}

function trimTrailingSlashes(value: string) {
  let normalized = value;
  while (normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

const NEON_AUTH_BASE_URL = trimTrailingSlashes(RAW_NEON_AUTH_BASE_URL);

const FORWARDED_REQUEST_HEADERS = new Set([
  "accept",
  "accept-language",
  "authorization",
  "content-type",
  "cookie",
  "origin",
  "referer",
  "user-agent",
  "x-forwarded-for",
]);

function restoreUpstreamCookieNames(cookieHeader: string) {
  return cookieHeader.replaceAll("__Secure_", "__Secure-").replaceAll("__Host_", "__Host-");
}

function rewriteSetCookieForHttpDev(cookie: string) {
  let c = cookie.replaceAll("__Secure-", "__Secure_").replaceAll("__Host-", "__Host_");
  c = c
    .replaceAll("; Secure", "")
    .replaceAll(";Secure", "")
    .replaceAll("; Partitioned", "")
    .replaceAll(";Partitioned", "");
  c = c.replace(/;[ ]*Domain=[^;]*/gi, "");
  c = c
    .replaceAll("; SameSite=None", "; SameSite=Lax")
    .replaceAll(";SameSite=None", ";SameSite=Lax");
  return c;
}

function isSignupPath(path: string) {
  return path.startsWith("/sign-up") || path.includes("/sign-up");
}

export default defineHandler(async (event) => {
  const url = getRequestURL(event);
  const pathname = url.pathname;
  const upstreamPath = pathname.startsWith("/api/auth")
    ? pathname.slice("/api/auth".length) || "/"
    : pathname;
  const upstreamUrl = `${NEON_AUTH_BASE_URL}${upstreamPath}${url.search}`;

  const method = event.method;
  const bodyBuffer =
    method === "GET" || method === "HEAD" ? undefined : await readRawBody(event, false);

  if (method === "POST" && isSignupPath(upstreamPath)) {
    const signupsEnabled = await getSignupsEnabled();
    if (!signupsEnabled) {
      throw createError({ statusCode: 403, statusMessage: "Signups are currently disabled" });
    }

    if (!bodyBuffer) {
      throw createError({ statusCode: 403, statusMessage: "Account creation is restricted" });
    }

    const bodyText = new TextDecoder().decode(bodyBuffer);
    const parsed = JSON.parse(bodyText) as { email?: unknown };
    const email = typeof parsed.email === "string" ? normalizeEmail(parsed.email) : "";

    if (!email) {
      throw createError({ statusCode: 403, statusMessage: "Account creation is restricted" });
    }

    const isBootstrapEmail = email === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
    const allowed = isBootstrapEmail ? true : await isEmailAllowedForSignup(email);

    if (!allowed) {
      throw createError({ statusCode: 403, statusMessage: "This email is not approved for signup" });
    }
  }

  const forwardedHeaders = new Headers();
  const incomingHeaders = getRequestHeaders(event);

  for (const [key, value] of Object.entries(incomingHeaders)) {
    const headerName = key.toLowerCase();

    if (!value || !FORWARDED_REQUEST_HEADERS.has(headerName)) {
      continue;
    }

    forwardedHeaders.set(headerName, value);
  }

  const cookieHeader = forwardedHeaders.get("cookie");
  if (cookieHeader) {
    const restored = restoreUpstreamCookieNames(cookieHeader);
    if (restored.trim().length > 0) {
      forwardedHeaders.set("cookie", restored);
    } else {
      forwardedHeaders.delete("cookie");
    }
  }

  const upstream = await fetch(upstreamUrl, {
    method,
    headers: forwardedHeaders,
    body: bodyBuffer as BodyInit | undefined,
    redirect: "manual",
  });

  const responseHeaders = new Headers();

  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "set-cookie") {
      responseHeaders.append(key, value);
    }
  });

  const setCookies = upstream.headers.getSetCookie?.() ?? [];
  for (let c of setCookies) {
    if (url.protocol === "http:") {
      c = rewriteSetCookieForHttpDev(c);
    }
    responseHeaders.append("set-cookie", c);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
});