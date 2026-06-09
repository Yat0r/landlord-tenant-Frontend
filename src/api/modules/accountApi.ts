import axios from 'axios';
import { httpClient } from '@/api/clients/httpClient';
import { ENDPOINTS } from '@/api/modules/endpoints';
import { ROLES, type AppRole } from '@/constants/roles/roles';

export interface AccountProfilePayload {
  firstName: string;
  lastName: string;
  displayName: string;
  phoneNumber: string;
}

export interface BackendAccountProfile {
  id?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  name?: string;
  phoneNumber?: string;
  phone?: string;
  email?: string;
  keycloakLinked?: boolean;
  linked?: boolean;
  status?: string;
  accountStatus?: string;
}

export type AccountProfileSupport =
  | { supported: true; endpoint: string; role: AppRole }
  | { supported: false; reason: string };

export class UnsupportedProfileEndpointError extends Error {
  constructor(message = 'Profile update requires backend support.') {
    super(message);
    this.name = 'UnsupportedProfileEndpointError';
  }
}

export function getAccountProfileSupport(roles: AppRole[]): AccountProfileSupport {
  if (roles.includes(ROLES.LANDLORD)) {
    return { supported: true, endpoint: ENDPOINTS.LANDLORD.PROFILE, role: ROLES.LANDLORD };
  }

  if (roles.includes(ROLES.TENANT)) {
    return { supported: true, endpoint: ENDPOINTS.TENANT.PROFILE, role: ROLES.TENANT };
  }

  return {
    supported: false,
    reason: 'Profile update requires backend support.',
  };
}

export async function fetchAccountProfile(roles: AppRole[]): Promise<BackendAccountProfile | null> {
  const support = getAccountProfileSupport(roles);
  if (!support.supported) return null;

  const response = await httpClient.get<BackendAccountProfile>(support.endpoint);
  return response.data;
}

export async function updateAccountProfile(
  roles: AppRole[],
  payload: AccountProfilePayload
): Promise<BackendAccountProfile> {
  const support = getAccountProfileSupport(roles);
  if (!support.supported) {
    throw new UnsupportedProfileEndpointError(support.reason);
  }

  try {
    const response = await httpClient.patch<BackendAccountProfile>(support.endpoint, payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 404 || status === 405 || status === 501) {
        throw new UnsupportedProfileEndpointError();
      }
    }

    throw error;
  }
}
