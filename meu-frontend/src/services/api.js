// src/services/api.js
import axios from 'axios';

// Defina a URL base do seu backend Flask.
// Certifique-se de que o backend esteja rodando em http://127.0.0.1:5000
const api = axios.create({
  baseURL: 'http://localhost:5000', // A URL base do seu backend
});

// Adicione um interceptador para incluir o token JWT em todas as requisições
// Isso será útil quando implementarmos a autenticação no frontend
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken'); // Assumindo que você salvará o token aqui
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;