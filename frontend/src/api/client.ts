const BASE = '/api';

const MAX_RETRIES = 6;
const INITIAL_RETRY_MS = 1000;

const RETRYABLE_STATUSES = new Set([502, 503, 504]);

function extractErrorMessage(data: Record<string, unknown>): string {
  if (typeof data.error === 'string' && data.error) return data.error;
  if (typeof data.detail === 'string' && data.detail) return data.detail;
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') return val[0];
    if (typeof val === 'string' && val) return val;
  }
  return 'Request failed';
}

async function fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok || !RETRYABLE_STATUSES.has(res.status)) {
        return res;
      }
      // 502/503/504: backend still starting, retry
      const delay = INITIAL_RETRY_MS * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        const delay = INITIAL_RETRY_MS * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  if (lastError instanceof TypeError) {
    throw new Error('No se puede conectar al servidor. Comprueba tu conexión.');
  }
  throw lastError ?? new Error('Request failed after retries');
}

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
    const res = await fetchWithRetry(`${BASE}/auth/token/refresh/`, {
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

async function request<T>(path: string, options: RequestInit = {}, noRetry = false, timeoutMs?: number): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const doFetch = (url: string, opts: RequestInit) => {
    if (!timeoutMs) return (noRetry ? fetch(url, opts) : fetchWithRetry(url, opts));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const fetchOpts = { ...opts, signal: controller.signal };
    const promise = noRetry ? fetch(url, fetchOpts) : fetchWithRetry(url, fetchOpts);
    return promise.finally(() => clearTimeout(timer));
  };

  let res = await doFetch(`${BASE}${path}`, { ...options, headers });
  let data: Record<string, unknown>;
  try {
    data = await res.json() as Record<string, unknown>;
  } catch {
    throw new Error(res.status >= 500 ? 'Server error' : 'Invalid response');
  }

  if (res.status === 401 && token) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken();
    }
    const newToken = await refreshPromise;
    refreshPromise = null;

    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await doFetch(`${BASE}${path}`, { ...options, headers });
      let retryData: Record<string, unknown>;
      try {
        retryData = await res.json();
      } catch {
        throw new Error('Server error');
      }
      if (!res.ok) {
        throw new Error(extractErrorMessage(retryData));
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
    throw new Error(extractErrorMessage(data));
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown, noRetry?: boolean, timeoutMs?: number) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }, noRetry, timeoutMs),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
