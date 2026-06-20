const NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL;

if (!NEON_AUTH_BASE_URL) {
  throw new Error("NEON_AUTH_BASE_URL is not set");
}

export type Session = {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
  };
} | null;

export async function getSessionFromCookie(cookieHeader: string | null): Promise<Session> {
  if (!cookieHeader) {
    return null;
  }

  const cookie = cookieHeader
    .replaceAll("__Secure_", "__Secure-")
    .replaceAll("__Host_", "__Host-");

  if (!cookie.trim()) {
    return null;
  }

  const res = await fetch(`${NEON_AUTH_BASE_URL}/get-session`, {
    headers: { cookie },
  });

  if (!res.ok) {
    return null;
  }

  const session = (await res.json()) as Session;

  if (!session?.user) {
    return null;
  }

  return session;
}