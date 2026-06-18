export interface Landlord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  nationalId: string | null;
  /** True when this landlord record is linked to a Keycloak account. */
  keycloakLinked: boolean;
  /** Number of properties owned by this landlord. */
  propertyCount: number;
  /** Number of active tenants across all their properties. */
  tenantCount: number;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CreateLandlordRequest {
  fullName: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  keycloakUserId?: string;
}

export interface CreateLandlordResponse {
  id: string;
  fullName: string;
  email: string;
}

export interface UpdateLandlordRequest {
  fullName: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  keycloakUserId?: string;
}

export interface LandlordDetails {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  address?: string | null;
  keycloakUserId?: string | null;
  createdAt: string;
  propertyCount: number;
}
