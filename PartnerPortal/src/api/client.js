import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export const partnerTokenKey = 'partner_access_token';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(partnerTokenKey);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// PUBLIC_INTERFACE
export function getApi() {
  /** Returns the configured axios instance for making API requests. */
  return api;
}

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns the configured API base URL from env. */
  return API_BASE_URL;
}
