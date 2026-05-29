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

export interface CreateLandlordPayload {
  name: string;
  email: string;
  phone: string;
  nationalId: string;
}

export interface CreateLandlordResponse {
  id: string;
  name: string;
  email: string;
}
