type RequiredEnvKey =
  | 'VITE_API_BASE_URL'
  | 'VITE_OIDC_AUTHORITY'
  | 'VITE_OIDC_CLIENT_ID'
  | 'VITE_OIDC_REDIRECT_URI'
  | 'VITE_OIDC_POST_LOGOUT_REDIRECT_URI';

const requiredEnvKeys: RequiredEnvKey[] = [
  'VITE_API_BASE_URL',
  'VITE_OIDC_AUTHORITY',
  'VITE_OIDC_CLIENT_ID',
  'VITE_OIDC_REDIRECT_URI',
  'VITE_OIDC_POST_LOGOUT_REDIRECT_URI',
];

function getRequiredEnv(key: RequiredEnvKey): string {
  const value = import.meta.env[key];

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      `Missing required environment variable ${key}. Add it to your Vite environment file. Do not commit secrets.`
    );
  }

  return value.trim();
}

function getOptionalEnv(key: string): string | undefined {
  const value = import.meta.env[key];
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

export const appEnv = {
  apiBaseUrl: getRequiredEnv('VITE_API_BASE_URL'),
  oidcAuthority: getRequiredEnv('VITE_OIDC_AUTHORITY'),
  oidcClientId: getRequiredEnv('VITE_OIDC_CLIENT_ID'),
  oidcRedirectUri: getRequiredEnv('VITE_OIDC_REDIRECT_URI'),
  oidcPostLogoutRedirectUri: getRequiredEnv('VITE_OIDC_POST_LOGOUT_REDIRECT_URI'),
  keycloakRegistrationUrl: getOptionalEnv('VITE_KEYCLOAK_REGISTRATION_URL'),
  keycloakAccountConsoleUrl: getOptionalEnv('VITE_KEYCLOAK_ACCOUNT_CONSOLE_URL'),
  appEnvironment: getOptionalEnv('VITE_APP_ENV'),
};

requiredEnvKeys.forEach((key) => getRequiredEnv(key));
