import type { AuthProviderProps } from 'react-oidc-context';

const authority = import.meta.env.VITE_KEYCLOAK_AUTHORITY as string;
const client_id = import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string;
const redirect_uri = import.meta.env.VITE_KEYCLOAK_REDIRECT_URI as string;
const post_logout_redirect_uri = import.meta.env.VITE_KEYCLOAK_POST_LOGOUT_REDIRECT_URI as string;

if (!authority || !client_id || !redirect_uri) {
  console.error(
    '[oidcConfig] Missing OIDC environment variables. Check your .env.development file.'
  );
}

export const oidcConfig: AuthProviderProps = {
  authority,
  client_id,
  redirect_uri,
  post_logout_redirect_uri,
  scope: 'openid profile email',
  automaticSilentRenew: true,
  loadUserInfo: true,
  onSigninCallback: () => {
    // Clean OIDC params from URL after callback is handled
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};
