import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const searchAPI = {
  search: async (query, type) => {
    const response = await api.post('/search', { query, type });
    return response.data;
  },

  getPerson: async (id) => {
    const response = await api.get(`/people/${id}`);
    return response.data;
  },

  getFilm: async (id) => {
    const response = await api.get(`/films/${id}`);
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/statistics');
    return response.data;
  },
};

export default api;
