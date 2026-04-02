import { getStorage } from '../utils/storage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  get: async (url, auth = false) => {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = getStorage('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${url}`, { headers });
    return response.json();
  },

  post: async (url, data, auth = false) => {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = getStorage('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    return response.json();
  },

  put: async (url, data, auth = false) => {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = getStorage('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${url}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
    return response.json();
  },

  delete: async (url, auth = false) => {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = getStorage('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${url}`, {
      method: 'DELETE',
      headers
    });
    return response.json();
  }
};