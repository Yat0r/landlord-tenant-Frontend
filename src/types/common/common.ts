export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface SelectOption {
  value: string;
  label: string;
}

export interface ApiListResponse<T> {
  data: T[];
  total: number;
}
