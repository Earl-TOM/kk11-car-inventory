import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react/adapters";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
};

type SessionState = {
  data: { user: SessionUser } | null;
  isPending: boolean;
};

const baseURL =
  typeof window !== "undefined"
    ? `${window.location.origin}/api/auth`
    : "http://localhost/api/auth";

export const authClient = createAuthClient(baseURL, {
  adapter: BetterAuthReactAdapter(),
});

export const useAuthSession = (): SessionState =>
  (authClient.useSession as unknown as () => SessionState)();