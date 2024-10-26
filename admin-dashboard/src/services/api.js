// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true, // Send cookies with requests
});

// Optional: Add interceptors for request/response
api.interceptors.request.use(
  config => config,
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
);

export default api;
