/**
 * Construct the API base URL from environment variables
 * In production, this will use the Azure-hosted backend API
 * In development, defaults to localhost:5000
 */
const getApiBase = (): string => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (apiBaseUrl) {
    return apiBaseUrl;
  }

  // Fallback: construct from host and port if available
  const apiHost = import.meta.env.VITE_API_HOST || 'localhost';
  const apiPort = import.meta.env.VITE_API_PORT || '5000';
  
  return `http://${apiHost}:${apiPort}/api`;
};

const API_BASE = getApiBase();

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath =
    API_BASE.endsWith('/api') && path.startsWith('/api/')
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
