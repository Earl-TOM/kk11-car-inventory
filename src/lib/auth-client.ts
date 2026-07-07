import { useState, useEffect } from 'react';
import { pb } from './pocketbase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type SessionUser = {
  id: string;
  email: string;
  name?: string;
};

type SessionState = {
  data: { user: SessionUser } | null;
  isPending: boolean;
};

// ---------------------------------------------------------------------------
// Hook: useAuthSession
// Reads from pb.authStore and re-renders whenever it changes.
// ---------------------------------------------------------------------------
export function useAuthSession(): SessionState {
  const getState = (): SessionState => ({
    data: pb.authStore.isValid && pb.authStore.model
      ? {
          user: {
            id: pb.authStore.model.id,
            email: pb.authStore.model.email ?? '',
            name: pb.authStore.model.name ?? pb.authStore.model.email ?? '',
          },
        }
      : null,
    isPending: false,
  });

  const [state, setState] = useState<SessionState>(getState);

  useEffect(() => {
    // pb.authStore.onChange returns an unsubscribe function
    const unsubscribe = pb.authStore.onChange(() => {
      setState(getState());
    });
    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}

// ---------------------------------------------------------------------------
// Auth actions (non-hook helpers used by components)
// ---------------------------------------------------------------------------

/** Sign in with email + password. */
export async function signIn(email: string, password: string) {
  return pb.collection('users').authWithPassword(email, password);
}

/** Register a new user account. */
export async function signUp(email: string, password: string, name?: string) {
  await pb.collection('users').create({
    email,
    password,
    passwordConfirm: password,
    name: name || email,
  });
  // Auto sign-in after registration
  return pb.collection('users').authWithPassword(email, password);
}

/** Sign out (clears the auth store). */
export function signOut() {
  pb.authStore.clear();
}

/** Request a password reset email. */
export async function requestPasswordReset(email: string) {
  return pb.collection('users').requestPasswordReset(email);
}

/** Confirm password reset using the token from the email link. */
export async function confirmPasswordReset(
  token: string,
  newPassword: string,
  newPasswordConfirm: string
) {
  return pb
    .collection('users')
    .confirmPasswordReset(token, newPassword, newPasswordConfirm);
}