import type { PagedResponse } from '@/api/helpers/apiHelpers';

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

export type PagedResponseLike<T> = RawPagedResult<T> | PagedResponse<T> | T[];

/**
 * Normalizes various paged response shapes from the ASP.NET Core API
 * into a consistent PagedResult<T>.
 */
export function normalizePagedResult<T>(raw: PagedResponseLike<T>): PagedResult<T> {
  if (Array.isArray(raw)) {
    return {
      items: raw,
      totalCount: raw.length,
      pageNumber: 1,
      pageSize: raw.length,
      totalPages: 1,
    };
  }

  const page = raw as RawPagedResult<T> & Partial<PagedResponse<T>>;
  const items = page.items ?? page.data ?? page.content ?? page.results ?? [];
  const totalCount = page.totalCount ?? page.total ?? page.totalElements ?? items.length;
  const pageNumber = page.pageNumber ?? page.page ?? page.currentPage ?? 1;
  const pageSize = page.pageSize ?? page.limit ?? items.length;
  const totalPages =
    page.totalPages ?? page.pageCount ?? (pageSize > 0 ? Math.ceil(totalCount / pageSize) : 1);

  return { items, totalCount, pageNumber, pageSize, totalPages };
}
