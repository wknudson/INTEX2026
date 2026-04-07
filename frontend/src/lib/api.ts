const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath =
    API_BASE === '/api' && path.startsWith('/api/')
      ? path.replace(/^\/api/, '')
      : path;

  const response = await fetch(`${API_BASE}${normalizedPath}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const raw = await response.text();
  if (!raw) {
    return undefined as T;
  }

  return JSON.parse(raw) as T;
}
