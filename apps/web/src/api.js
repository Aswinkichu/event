export const API_BASE = 'http://localhost:5000/api/v1';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function getUserRole() {
  return localStorage.getItem('role');
}

export function setUserRole(role) {
  localStorage.setItem('role', role);
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  window.location.hash = '';
  window.location.reload();
}

/**
 * Enhanced fetch wrapper that handles auth headers, JSON parsing,
 * and converts API/validation errors into human-readable messages.
 */
export async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  
  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (networkErr) {
    throw new Error('Network error. Please check your connection and try again.');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Server error (${response.status}). Please try again later.`);
  }
  
  if (!response.ok) {
    // Parse Zod validation errors into friendly messages
    if (data.errors && Array.isArray(data.errors)) {
      const messages = data.errors.map(e => {
        const field = e.path ? e.path.replace(/^body\./, '') : '';
        return field ? `${capitalizeFirst(field)}: ${e.message}` : e.message;
      });
      throw new Error(messages.join('\n'));
    }
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  
  return data;
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
