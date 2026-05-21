
export type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string; details?: any };

export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

export function failure<T>(error: string, code?: string, details?: any): Result<T> {
  return { success: false, error, code, details };
}
