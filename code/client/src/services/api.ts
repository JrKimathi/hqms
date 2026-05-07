/**
 * api.ts
 * Base HTTP client configuration.
 * Swap BASE_URL for your backend endpoint when ready.
 */

export const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  details?: string;
}

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  if (!res.ok) {
    const error: ApiError = {
      status: res.status,
      message: res.statusText,
    };
    try {
      const body = await res.json();
      error.message = body.message ?? res.statusText;
      error.details = body.details;
    } catch {
      // non-JSON error body
    }
    throw error;
  }
  const data = await res.json();
  return { data, success: true };
}

export async function get<T>(path: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<T>(res);
}

export async function post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function postForm<T>(path: string, form: FormData): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    body: form,
  });
  return handleResponse<T>(res);
}

export async function del<T>(path: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, { method: 'DELETE' });
  return handleResponse<T>(res);
}
