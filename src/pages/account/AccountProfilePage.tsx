import axios from 'axios';
import { useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  Camera,
  ExternalLink,
  KeyRound,
  Save,
  ShieldCheck,
  UserCircle,
} from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';
import {
  fetchAccountProfile,
  getAccountProfileSupport,
  UnsupportedProfileEndpointError,
  updateAccountProfile,
  type BackendAccountProfile,
} from '@/api/modules/accountApi';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/feedback/LoadingState';

interface ProfileFormState {
  firstName: string;
  lastName: string;
  displayName: string;
  phoneNumber: string;
}

type ProfileFormErrors = Partial<Record<keyof ProfileFormState, string>>;
type ClaimMap = Record<string, unknown>;

const accountConsoleUrl = import.meta.env.VITE_KEYCLOAK_ACCOUNT_CONSOLE_URL as string | undefined;

function getString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function getBooleanLabel(value: unknown): string {
  if (typeof value !== 'boolean') return 'Not available';
  return value ? 'Yes' : 'No';
}

function getInitials(name: string, fallback: string): string {
  const source = name.trim() || fallback.trim() || 'User';
  const parts = source.split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  return initials || 'U';
}

function splitName(name: string): Pick<ProfileFormState, 'firstName' | 'lastName'> {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}

function formatDateTimeFromEpochSeconds(value: unknown): string {
  if (typeof value !== 'number') return 'Not available';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value * 1000));
}

function normalizeStatus(value: unknown): string {
  const status = getString(value);
  return status || 'Authenticated';
}

function buildInitialForm(profile: ClaimMap | undefined, backendProfile: BackendAccountProfile | null): ProfileFormState {
  const name = getString(profile?.name);
  const split = splitName(name);
  const backendName = splitName(getString(backendProfile?.displayName));

  return {
    firstName: getString(profile?.given_name) || backendName.firstName || split.firstName,
    lastName: getString(profile?.family_name) || backendName.lastName || split.lastName,
    displayName: getString(backendProfile?.displayName) || name,
    phoneNumber: getString(backendProfile?.phoneNumber) || getString(profile?.phone_number),
  };
}

function validateForm(form: ProfileFormState): ProfileFormErrors {
  const errors: ProfileFormErrors = {};

  if (form.firstName.length > 60) {
    errors.firstName = 'First name must be 60 characters or fewer.';
  }

  if (form.lastName.length > 60) {
    errors.lastName = 'Last name must be 60 characters or fewer.';
  }

  if (!form.displayName.trim()) {
    errors.displayName = 'Display name is required.';
  } else if (form.displayName.length > 120) {
    errors.displayName = 'Display name must be 120 characters or fewer.';
  }

  if (form.phoneNumber && !/^[+()\d\s.-]{7,24}$/.test(form.phoneNumber)) {
    errors.phoneNumber = 'Use a valid phone number.';
  }

  return errors;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof UnsupportedProfileEndpointError) {
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401) return 'Session expired. Please sign in again before saving changes.';
    if (status === 403) return 'Access denied. Your current role cannot update this profile.';

    const responseMessage = error.response?.data;
    if (typeof responseMessage === 'string' && responseMessage.trim()) return responseMessage;
    if (responseMessage && typeof responseMessage === 'object') {
      const message = (responseMessage as Record<string, unknown>).message;
      if (typeof message === 'string' && message.trim()) return message;
    }
  }

  return 'Profile update failed. Please try again.';
}

function keycloakLink(path = ''): string {
  const base = (accountConsoleUrl ?? '').replace(/\/$/, '');
  return `${base}${path}`;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-0 dark:border-slate-800">
      <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="max-w-[65%] break-words text-right text-sm font-medium text-slate-900 dark:text-slate-100">{value}</dd>
    </div>
  );
}

export default function AccountProfilePage() {
  const { isLoading, user, roles } = useAuth();
  const profile = user?.profile as ClaimMap | undefined;
  const rolesKey = roles.join('|');
  const support = getAccountProfileSupport(roles);

  const [backendProfile, setBackendProfile] = useState<BackendAccountProfile | null>(null);
  const [isBackendLoading, setIsBackendLoading] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileFormState>(() => buildInitialForm(profile, null));
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadBackendProfile() {
      setBackendProfile(null);
      setBackendError(null);

      if (!support.supported) {
        setForm(buildInitialForm(profile, null));
        return;
      }

      setIsBackendLoading(true);

      try {
        const data = await fetchAccountProfile(roles);
        if (cancelled) return;
        setBackendProfile(data);
        setForm(buildInitialForm(profile, data));
      } catch (error) {
        if (cancelled) return;
        setForm(buildInitialForm(profile, null));
        setBackendError(getErrorMessage(error));
      } finally {
        if (!cancelled) setIsBackendLoading(false);
      }
    }

    void loadBackendProfile();

    return () => {
      cancelled = true;
    };
  }, [profile, roles, rolesKey, support.supported]);

  if (isLoading) {
    return <LoadingState message="Loading profile..." />;
  }

  const username = getString(profile?.preferred_username) || getString(profile?.sub);
  const email = getString(profile?.email) || getString(backendProfile?.email);
  const fullName = form.displayName || getString(profile?.name) || username || 'Current user';
  const roleLabel = roles.length ? roles.join(', ') : 'No role detected';
  const accountStatus = normalizeStatus(backendProfile ? 'Authenticated' : undefined);
  const linkedValue = backendProfile?.accountLinked;
  const linkedStatus = typeof linkedValue === 'boolean' ? (linkedValue ? 'Linked' : 'Unlinked') : 'Not available';
  const hasAccountConsole = Boolean(accountConsoleUrl?.trim());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveMessage(null);
    setApiError(null);

    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (!support.supported) {
      setApiError(support.reason);
      return;
    }

    setIsSaving(true);

    try {
      const updated = await updateAccountProfile(roles, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        displayName: form.displayName.trim(),
        phoneNumber: form.phoneNumber.trim(),
      });
      setBackendProfile(updated);
      setForm(buildInitialForm(profile, updated));
      setSaveMessage('Profile saved successfully.');
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="My Profile"
        description="View your Keycloak identity and manage app profile details."
      />

      <div className="space-y-5">
        {saveMessage && (
          <Alert variant="success" title="Saved">
            {saveMessage}
          </Alert>
        )}

        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 bg-gradient-to-r from-brand-panel via-white to-brand-soft p-6 dark:border-slate-800 dark:from-blue-950/30 dark:via-slate-900 dark:to-blue-950/30">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0B7CC1] to-[#2563eb] text-2xl font-bold text-white shadow-sm">
                  {getInitials(fullName, username)}
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-bold text-slate-950 dark:text-slate-100">{fullName}</h1>
                  <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">{email || 'Email not available'}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant={roles.length ? 'info' : 'warning'}>{roleLabel}</Badge>
                    <Badge variant="success">{accountStatus}</Badge>
                    <Badge variant={linkedStatus === 'Linked' ? 'success' : 'neutral'}>{linkedStatus}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white/80 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400">
                <Camera className="h-5 w-5" />
                Avatar upload not supported yet
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Editable Profile</CardTitle>
            </CardHeader>

            {isBackendLoading && (
              <Alert className="mb-4" variant="info">
                Loading backend profile details...
              </Alert>
            )}

            {backendError && (
              <Alert className="mb-4" variant="warning" title="Backend profile unavailable">
                {backendError}
              </Alert>
            )}

            {apiError && (
              <Alert className="mb-4" variant="danger" title="Profile not saved">
                {apiError}
              </Alert>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="First name"
                  value={form.firstName}
                  error={errors.firstName}
                  onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
                />
                <Input
                  label="Last name"
                  value={form.lastName}
                  error={errors.lastName}
                  onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
                />
                <Input
                  label="Display name"
                  value={form.displayName}
                  error={errors.displayName}
                  onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                />
                <Input
                  label="Phone number"
                  value={form.phoneNumber}
                  error={errors.phoneNumber}
                  placeholder="+254 700 000 000"
                  onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                />
                <Input
                  label="Email address"
                  value={email}
                  readOnly
                  hint="Email comes from Keycloak and is read-only here."
                />
                <Input
                  label="Role"
                  value={roleLabel}
                  readOnly
                  hint="Roles are assigned through Keycloak."
                />
              </div>

              {!support.supported && (
                <Alert variant="warning" title="Backend support required">
                  {support.reason}
                </Alert>
              )}

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Passwords and raw access tokens are never stored or displayed by the frontend.
                </p>
                <Button type="submit" isLoading={isSaving}>
                  <Save className="h-4 w-4" />
                  Save profile
                </Button>
              </div>
            </form>
          </Card>

          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-brand-primary" />
                  Keycloak Identity
                </CardTitle>
              </CardHeader>
              <dl>
                <DetailRow label="Username" value={username || 'Not available'} />
                <DetailRow label="Email" value={email || 'Not available'} />
                <DetailRow label="Email verified" value={getBooleanLabel(profile?.email_verified)} />
                <DetailRow label="Token expires" value={formatDateTimeFromEpochSeconds(user?.expires_at)} />
              </dl>

              <div className="mt-5 space-y-3">
                {hasAccountConsole ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <a
                      href={keycloakLink()}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      <UserCircle className="h-4 w-4" />
                      Manage login details
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href={keycloakLink('/#/security/signingin')}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Change password
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ) : (
                  <Alert variant="info">
                    Managed by Keycloak. Account console link not configured yet.
                  </Alert>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  Backend Profile
                </CardTitle>
              </CardHeader>
              <dl>
                <DetailRow label="Endpoint" value={support.supported ? support.endpoint : 'Not configured'} />
                <DetailRow label="Update support" value={support.supported ? 'Available for this role' : 'Unsupported'} />
                <DetailRow label="Linked status" value={linkedStatus} />
              </dl>
              <div className="mt-4">
                {support.supported ? (
                  <Alert variant="info">
                    Saves use /api/me/profile for the current authenticated user.
                  </Alert>
                ) : (
                  <Alert variant="warning">Profile update requires backend support.</Alert>
                )}
              </div>
            </Card>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Raw tokens are never displayed. If roles or identity details changed in Keycloak, sign out and sign in again.
        </div>

        <span className="sr-only" aria-live="polite">
          {saveMessage ?? apiError ?? ''}
        </span>
        <span className="sr-only" aria-live="assertive">
          {Object.values(errors).join(' ')}
        </span>
      </div>
    </div>
  );
}
