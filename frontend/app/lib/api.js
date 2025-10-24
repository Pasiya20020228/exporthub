const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

const defaultHeaders = { 'Content-Type': 'application/json' };

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, token, headers, cache = 'no-store' } = options;
  const url = `${API_BASE}${path}`;
  const requestInit = {
    method,
    headers: { ...defaultHeaders, ...(headers || {}) },
    cache,
  };

  if (token) {
    requestInit.headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    requestInit.body = JSON.stringify(body);
  }

  const response = await fetch(url, requestInit);
  let payload = null;
  if (response.status !== 204) {
    try {
      payload = await response.json();
    } catch (error) {
      payload = null;
    }
  }

  if (!response.ok) {
    const message = payload?.detail || 'Unexpected API error';
    throw new Error(message);
  }

  return payload;
}

export function buildApiUrl(path) {
  return `${API_BASE}${path}`;
}
