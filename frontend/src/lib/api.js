const API_URL = import.meta.env.VITE_API_URL || '';

class ApiClient {
  constructor() {
    this.baseUrl = API_URL;
    this.token = localStorage.getItem('token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  async request(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers = { ...options.headers };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      this.setToken(null);
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/';
      throw new Error('Session expired');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(err.detail || 'Request failed');
    }

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    }
    return res;
  }

  // Auth
  login(username, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    });
  }

  getMe() {
    return this.request('/api/auth/me');
  }

  // Dashboard
  getDashboardStats() {
    return this.request('/api/dashboard/stats');
  }

  getStorageStats() {
    return this.request('/api/dashboard/storage');
  }

  // Documents
  getDocuments(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/documents?${qs}`);
  }

  getDocument(id) {
    return this.request(`/api/documents/${id}`);
  }

  uploadDocument(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }

  updateDocument(id, data) {
    return this.request(`/api/documents/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  deleteDocument(id) {
    return this.request(`/api/documents/${id}`, {
      method: 'DELETE',
    });
  }

  bulkDeleteDocuments(ids) {
    return this.request('/api/documents/bulk-delete', {
      method: 'POST',
      body: { ids },
    });
  }

  // Categories
  getCategories() {
    return this.request('/api/categories');
  }

  createCategory(data) {
    return this.request('/api/categories', {
      method: 'POST',
      body: data,
    });
  }

  updateCategory(id, data) {
    return this.request(`/api/categories/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  deleteCategory(id) {
    return this.request(`/api/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Users
  getUsers() {
    return this.request('/api/users');
  }

  createUser(data) {
    return this.request('/api/users', {
      method: 'POST',
      body: data,
    });
  }

  updateUser(id, data) {
    return this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  deleteUser(id) {
    return this.request(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  // AI Model
  getAIModel() {
    return this.request('/api/ai/model');
  }

  retrainModel() {
    return this.request('/api/ai/retrain', { method: 'POST' });
  }

  getRetrainStatus() {
    return this.request('/api/ai/retrain/status');
  }

  updateThreshold(threshold) {
    return this.request('/api/ai/threshold', {
      method: 'PUT',
      body: { threshold },
    });
  }

  // Audit Logs
  getAuditLogs(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/audit-logs?${qs}`);
  }

  // Profile
  getProfile() {
    return this.request('/api/profile');
  }

  updateProfile(data) {
    return this.request('/api/profile', {
      method: 'PUT',
      body: data,
    });
  }

  // Export
  exportCSV() {
    return this.request('/api/export/csv', { method: 'POST' });
  }

  exportExcel() {
    return this.request('/api/export/excel', { method: 'POST' });
  }

  backupDatabase() {
    return this.request('/api/export/backup', { method: 'POST' });
  }

  getBackups() {
    return this.request('/api/export/backups');
  }
}

export const api = new ApiClient();
export default api;
