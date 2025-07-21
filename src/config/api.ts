const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const endpoints = {
  // Auth endpoints
  login: '/auth/login',
  logout: '/auth/logout',
  me: '/auth/me',
  
  // Student endpoints
  students: '/students',
  studentById: (id: string) => `/students/${id}`,
  
  // User endpoints
  users: '/users',
  userById: (id: string) => `/users/${id}`,
  
  // Statistics endpoints
  stats: '/stats',
};