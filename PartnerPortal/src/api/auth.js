import { getApi, getApiBaseUrl, partnerTokenKey } from './client';

// PUBLIC_INTERFACE
export async function login(email, password) {
  /** Performs login via the Gateway. Stores token in localStorage on success.
   * Returns: { success: boolean, message?: string }
   */
  const apiBase = getApiBaseUrl();
  // If no API base URL, mock a successful login
  if (!apiBase) {
    localStorage.setItem(partnerTokenKey, 'mock-partner-token');
    return { success: true };
  }
  try {
    const api = getApi();
    const res = await api.post('/auth/login', { email, password });
    const token = res?.data?.access_token;
    if (token) {
      localStorage.setItem(partnerTokenKey, token);
      return { success: true };
    }
    return { success: false, message: 'Invalid response from server' };
  } catch (err) {
    // Network or 4xx/5xx -> allow mock for local dev if needed
    if (err.message && err.message.includes('Network')) {
      localStorage.setItem(partnerTokenKey, 'mock-partner-token');
      return { success: true, message: 'Using mocked login (network error detected)' };
    }
    const message = err?.response?.data?.detail || 'Login failed';
    return { success: false, message };
  }
}

// PUBLIC_INTERFACE
export function logout() {
  /** Clears auth token. */
  localStorage.removeItem(partnerTokenKey);
}

// PUBLIC_INTERFACE
export function isAuthenticated() {
  /** Returns true if a token is present. */
  return !!localStorage.getItem(partnerTokenKey);
}
