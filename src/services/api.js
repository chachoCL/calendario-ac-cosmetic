/**
 * API Service
 * Handles all HTTP requests to the backend
 */

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

// Get stored auth token
const getToken = () => localStorage.getItem('salon_token');

// Set auth token
const setToken = (token) => localStorage.setItem('salon_token', token);

// Clear auth token
const clearToken = () => localStorage.removeItem('salon_token');

// Make authenticated request
async function request(endpoint, options = {}) {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Error de red');
    }

    return data;
}

// Auth API
export const authAPI = {
    getStatus: () => request('/auth/status'),

    setup: async (username, password) => {
        const data = await request('/auth/setup', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
        setToken(data.token);
        return data;
    },

    login: async (username, password) => {
        const data = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
        setToken(data.token);
        return data;
    },

    logout: () => {
        clearToken();
    },

    getMe: () => request('/auth/me'),

    register: (username, password, role) =>
        request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, role }),
        }),
};

// Users API (admin only)
export const usersAPI = {
    getAll: () => request('/users'),
    delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
    updatePassword: (id, password) =>
        request(`/users/${id}/password`, {
            method: 'PUT',
            body: JSON.stringify({ password })
        }),
};

// Services API
export const servicesAPI = {
    getAll: () => request('/services'),
    create: (data) => request('/services', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/services/${id}`, { method: 'DELETE' }),
};

// Staff API
export const staffAPI = {
    getAll: () => request('/staff'),
    create: (data) => request('/staff', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/staff/${id}`, { method: 'DELETE' }),
};

// Clients API
export const clientsAPI = {
    getAll: () => request('/clients'),
    create: (data) => request('/clients', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/clients/${id}`, { method: 'DELETE' }),
};

// Appointments API
export const appointmentsAPI = {
    getAll: (date) => request(`/appointments${date ? `?date=${date}` : ''}`),
    create: (data) => request('/appointments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/appointments/${id}`, { method: 'DELETE' }),
};

export { getToken, setToken, clearToken };
