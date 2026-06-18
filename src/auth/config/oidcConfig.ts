import type { AuthProviderProps } from 'react-oidc-context';
import { appEnv } from '@/app/config/env';

export const oidcConfig: AuthProviderProps = {
  authority: appEnv.oidcAuthority,
  client_id: appEnv.oidcClientId,
  redirect_uri: appEnv.oidcRedirectUri,
  post_logout_redirect_uri: appEnv.oidcPostLogoutRedirectUri,
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: true,
  loadUserInfo: true,
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};
