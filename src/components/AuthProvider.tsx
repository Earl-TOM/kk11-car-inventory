import { useEffect, type ReactNode } from 'react';
import { pb } from '../lib/pocketbase';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    // Refresh the auth token on mount to keep the session alive.
    // If the token is invalid / expired, clear the store.
    if (pb.authStore.isValid) {
      pb.collection('users')
        .authRefresh()
        .catch(() => pb.authStore.clear());
    }
  }, []);

  return <>{children}</>;
}