import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const toImageUrl = (webPath) => {
  if (!webPath) return null;
  if (webPath.startsWith('http://') || webPath.startsWith('https://')) return webPath;
  return API_BASE_URL + webPath;
};

export const SponsorsAPI = {
  create: (formData) => apiClient.post('/sponsors', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  list: () => apiClient.get('/sponsors'),
  byId: (id) => apiClient.get(`/sponsors/${id}`),
  update: (id, formData) => apiClient.put(`/sponsors/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  remove: (id) => apiClient.delete(`/sponsors/${id}`),
  approve: (id) => apiClient.put(`/sponsors/${id}/approve`),
  reject: (id) => apiClient.put(`/sponsors/${id}/reject`),
  uploadAd: (id, file) => {
    const fd = new FormData();
    fd.append('adImage', file);
    return apiClient.post(`/sponsors/${id}/upload-ad`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  byStatus: (status) => apiClient.get(`/sponsors/status/${status}`),
  managerPending: () => apiClient.get('/sponsors/manager/pending'),
  managerActive: () => apiClient.get('/sponsors/manager/active'),
  managerPast: () => apiClient.get('/sponsors/manager/past'),
  homepageActiveAds: () => apiClient.get('/sponsors/homepage/active-ads'),
  // New filtering and summary endpoints
  getFiltered: (params) => apiClient.get('/sponsors/filter/data', { params }),
  getSummary: () => apiClient.get('/sponsors/summary/stats'),
};

export const DonationsAPI = {
  getAll: () => apiClient.get('/donations'),
  create: (data) => apiClient.post('/donations', data),
  add: (data) => apiClient.post('/donations/add', data),
  getById: (id) => apiClient.get(`/donations/${id}`),
  update: (id, data) => apiClient.put(`/donations/${id}`, data),
  delete: (id) => apiClient.delete(`/donations/${id}`),
  uploadSlip: (id, file) => {
    const fd = new FormData();
    fd.append('slip', file);
    return apiClient.post(`/donations/${id}/upload-slip`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  markCompleted: (id) => apiClient.put(`/donations/${id}/complete`),
  getByStatus: (status) => apiClient.get(`/donations/status/${status}`),
  getPending: () => apiClient.get('/donations/manager/pending'),
  getCompleted: () => apiClient.get('/donations/manager/completed'),
  // New filtering and summary endpoints
  getFiltered: (params) => apiClient.get('/donations/filter/data', { params }),
  getSummary: () => apiClient.get('/donations/summary/stats'),
};

