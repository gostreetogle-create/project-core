// ========================================
// API Response — единый формат ответов
// ========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function success<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, data, ...(message && { message }) };
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

export function error(message: string): ApiResponse<null> {
  return { success: false, data: null, message };
}
