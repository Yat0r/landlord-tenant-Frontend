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
  content?: T[];
  results?: T[];
  totalCount?: number;
  total?: number;
  totalElements?: number;
  pageNumber?: number;
  page?: number;
  currentPage?: number;
  pageSize?: number;
  limit?: number;
  totalPages?: number;
  pageCount?: number;
}

/**
 * Normalizes various paged response shapes from the ASP.NET Core API
 * into a consistent PagedResult<T>.
 */
export function normalizePagedResult<T>(raw: RawPagedResult<T>): PagedResult<T> {
  const items = raw.items ?? raw.data ?? raw.content ?? raw.results ?? [];
  const totalCount = raw.totalCount ?? raw.total ?? raw.totalElements ?? items.length;
  const pageNumber = raw.pageNumber ?? raw.page ?? raw.currentPage ?? 1;
  const pageSize = raw.pageSize ?? raw.limit ?? items.length;
  const totalPages =
    raw.totalPages ?? raw.pageCount ?? (pageSize > 0 ? Math.ceil(totalCount / pageSize) : 1);

  return { items, totalCount, pageNumber, pageSize, totalPages };
}
