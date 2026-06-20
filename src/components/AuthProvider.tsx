import type { ReactNode, ComponentProps } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { NeonAuthUIProvider } from "@neondatabase/auth/react";
import { authClient } from "../lib/auth-client";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      defaultTheme="light"
      navigate={(href) => navigate(href)}
      replace={(href) => navigate(href, { replace: true })}
      Link={({ href, ...props }: { href: string } & ComponentProps<"a">) => (
        <RouterLink to={href} {...props} />
      )}
    >
      {children}
    </NeonAuthUIProvider>
  );
}