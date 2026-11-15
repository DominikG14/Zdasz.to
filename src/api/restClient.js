/**
 * Centralized REST API client for Zdasz.to
 * Handles JWT authentication, request options, and standardized error parsing.
 */

const TOKEN_KEY = 'accessToken';

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

function formatErrorMessage(errorBody) {
  const details = Array.isArray(errorBody?.details) ? errorBody.details : [];
  const detailText = details
    .map(detail => {
      const field = detail.field && detail.field !== '_root' ? `${detail.field}: ` : '';
      return `${field}${detail.message}`;
    })
    .join('; ');

  if (!detailText) return errorBody?.message || 'Wystąpił nieoczekiwany błąd';
  return `${errorBody?.message || 'Dane wejściowe są niepoprawne.'} ${detailText}`;
}

export async function request(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // If body is an object and not FormData, stringify it
  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const response = await fetch(url, { ...options, headers, body });

  let data = {};
  try {
    data = await response.json();
  } catch {
    // Response body is empty or not JSON
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
    }
    const message = formatErrorMessage(data.error);
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  auth: {
    me: () => request('/api/me'),
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
    register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },
  fields: {
    getAll: () => request('/api/fields'),
  },
  exercises: {
    getByField: (fieldId, limit = 10) => request(`/exercises/field/${fieldId}?limit=${limit}`),
    getRandom: (limit = 10) => request(`/exercises/random?limit=${limit}`),
    saveProgress: (payload) => request('/exercises/save', { method: 'POST', body: payload }),
  },
  progress: {
    getDashboard: () => request('/dashboard'),
  },
  admin: {
    getUsers: (search = '') => request(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    deleteUser: (userId) => request(`/admin/users/${userId}`, { method: 'DELETE' }),
    getUserProgress: (userId) => request(`/admin/users/${userId}/progress`),
    getExercises: () => request('/admin/exercises'),
    addExercise: (formData) => request('/admin/exercises', { method: 'POST', body: formData }),
    deleteExercise: (exerciseId) => request(`/admin/exercises/${exerciseId}`, { method: 'DELETE' }),
  },
};
