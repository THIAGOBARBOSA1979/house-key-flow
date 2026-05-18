export type SupabaseResponse<T> = {
  data: T | null;
  error: SupabaseError | null;
};

export type SupabaseError = {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
};

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface FilterParams {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'is' | 'in';
  value: any;
}

export interface UploadOptions {
  bucket: string;
  path: string;
  file: File | Blob;
  maxSizeInBytes?: number;
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
  upsert?: boolean;
}

