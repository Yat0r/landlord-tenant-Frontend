import { httpClient } from '@/api/clients/httpClient';
import { unwrapApiResponse, type ApiResponse } from '@/api/helpers/apiHelpers';
import { ENDPOINTS } from '@/api/modules/endpoints';
import type { AppRole } from '@/constants/roles/roles';

export interface AccountProfilePayload {
  firstName: string;
  lastName: string;
  displayName: string;
  phoneNumber: string;
}

export interface CurrentUserProfileResponse {
  keycloakUserId: string;
  username?: string | null;
  email?: string | null;
  roles: string[];
  displayName?: string;
  phoneNumber?: string;
  avatarUrl?: string | null;
  preferredLanguage?: string | null;
  timeZone?: string | null;
  updatedAt?: string | null;
  linkedEntityType?: string | null;
  linkedEntityId?: string | null;
  accountLinked: boolean;
}

export interface UpdateCurrentUserProfileRequest {
  displayName: string;
  phoneNumber: string;
  avatarUrl?: string | null;
  preferredLanguage?: string | null;
  timeZone?: string | null;
}

export type BackendAccountProfile = CurrentUserProfileResponse;

export type AccountProfileSupport =
  | { supported: true; endpoint: string; role?: AppRole }
  | { supported: false; reason: string };

export class UnsupportedProfileEndpointError extends Error {
  constructor(message = 'Profile update requires backend support.') {
    super(message);
    this.name = 'UnsupportedProfileEndpointError';
  }
}

export function getAccountProfileSupport(roles: AppRole[]): AccountProfileSupport {
  return { supported: true, endpoint: ENDPOINTS.ME.PROFILE, role: roles[0] };
}

export async function fetchAccountProfile(roles: AppRole[]): Promise<BackendAccountProfile | null> {
  const support = getAccountProfileSupport(roles);
  if (!support.supported) return null;

  const response = await httpClient.get<ApiResponse<CurrentUserProfileResponse>>(support.endpoint);
  return unwrapApiResponse(response.data);
}

export async function updateAccountProfile(
  roles: AppRole[],
  payload: AccountProfilePayload
): Promise<BackendAccountProfile> {
  const support = getAccountProfileSupport(roles);
  if (!support.supported) {
    throw new UnsupportedProfileEndpointError(support.reason);
  }

  const request: UpdateCurrentUserProfileRequest = {
    displayName: payload.displayName,
    phoneNumber: payload.phoneNumber,
  };

  const response = await httpClient.put<ApiResponse<CurrentUserProfileResponse>>(
    ENDPOINTS.ME.PROFILE,
    request
  );
  return unwrapApiResponse(response.data);
}
