import { httpClient } from '@/api/clients/httpClient';
import { ENDPOINTS } from './endpoints';
import type { HealthResponse } from '@/types/domain/entities';

function normalizeHealth(raw: unknown): HealthResponse {
  if (typeof raw === 'string') {
    return { status: raw };
  }

  if (raw && typeof raw === 'object') {
    const value = raw as Record<string, unknown>;
    return {
      healthy: typeof value.healthy === 'boolean' ? value.healthy : undefined,
      status: typeof value.status === 'string' ? value.status : undefined,
      message: typeof value.message === 'string' ? value.message : undefined,
    };
  }

  return {};
}

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await httpClient.get<unknown>(ENDPOINTS.SYSTEM.HEALTH);
  return normalizeHealth(response.data);
}
