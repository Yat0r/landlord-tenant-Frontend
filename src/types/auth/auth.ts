import type { AppRole } from '@/constants/roles/roles';

export interface AuthUser {
  sub: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  roles: AppRole[];
}
