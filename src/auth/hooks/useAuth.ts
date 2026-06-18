import { useAuth as useOidcAuth } from 'react-oidc-context';
import { useMemo } from 'react';
import { extractRolesFromUser, getRoleRedirectPath } from '@/auth/utils/authHelpers';
import type { AppRole } from '@/constants/roles/roles';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: ReturnType<typeof useOidcAuth>['user'];
  roles: AppRole[];
  redirectPath: string;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Wraps react-oidc-context with role extraction and app-level auth state.
 * Does NOT expose raw tokens.
 */
export function useAuth(): AuthState {
  const auth = useOidcAuth();

  const roles = useMemo(() => extractRolesFromUser(auth.user ?? null), [auth.user]);
  const redirectPath = useMemo(() => getRoleRedirectPath(roles), [roles]);

  async function signOut() {
    const idToken = auth.user?.id_token;

    await auth.removeUser();
    await auth.signoutRedirect({ id_token_hint: idToken });
  }

  return {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
    roles,
    redirectPath,
    signIn: () => auth.signinRedirect(),
    signOut,
  };
}
