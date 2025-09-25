// src/services/api.js
import axios from 'axios';

// Lê a URL base da variável de ambiente. Se não existir (em modo de desenvolvimento), 
// usa http://localhost:5000 como padrão.
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;