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
};


