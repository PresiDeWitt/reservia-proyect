const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('reservia_token');
}

function getRefreshToken(): string | null {
  return localStorage.getItem('reservia_refresh');
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch(`${BASE}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const newToken = data.access;
    if (newToken) {
      localStorage.setItem('reservia_token', newToken);
      return newToken;
    }
    return null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (res.status === 401 && token) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken();
    }
    const newToken = await refreshPromise;
    refreshPromise = null;

    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${BASE}${path}`, { ...options, headers });
      const retryData = await res.json();
      if (!res.ok) {
        throw new Error(retryData.error || 'Request failed');
      }
      return retryData as T;
    }

    localStorage.removeItem('reservia_token');
    localStorage.removeItem('reservia_user');
    localStorage.removeItem('reservia_refresh');
    window.location.reload();
    throw new Error('Session expired');
  }
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
