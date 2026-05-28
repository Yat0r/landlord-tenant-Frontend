export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface RawPagedResult<T> {
  items?: T[];
  data?: T[];
  totalCount?: number;
  total?: number;
  pageNumber?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

/**
 * Normalizes various paged response shapes from the ASP.NET Core API
 * into a consistent PagedResult<T>.
 */
export function normalizePagedResult<T>(raw: RawPagedResult<T>): PagedResult<T> {
  const items = raw.items ?? raw.data ?? [];
  const totalCount = raw.totalCount ?? raw.total ?? items.length;
  const pageNumber = raw.pageNumber ?? raw.page ?? 1;
  const pageSize = raw.pageSize ?? items.length;
  const totalPages = raw.totalPages ?? (pageSize > 0 ? Math.ceil(totalCount / pageSize) : 1);

  return { items, totalCount, pageNumber, pageSize, totalPages };
}
