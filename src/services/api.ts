import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { apiConfig, endpoints } from '../config/api';
import { Student, User, StudentFilters } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // or your backend URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create(apiConfig);
    
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.api.post(endpoints.login, { username, password });
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post(endpoints.logout);
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get(endpoints.me);
    return response.data;
  }

  // Student methods
  async getStudents(filters?: Partial<StudentFilters>): Promise<Student[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await this.api.get(`${endpoints.students}?${params}`);
    return response.data;
  }

  async getStudentById(id: string): Promise<Student> {
    const response = await this.api.get(endpoints.studentById(id));
    return response.data;
  }

  async createStudent(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<Student> {
    const response = await this.api.post(endpoints.students, student);
    return response.data;
  }

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    const response = await this.api.put(endpoints.studentById(id), updates);
    return response.data;
  }

  async deleteStudent(id: string): Promise<void> {
    await this.api.delete(endpoints.studentById(id));
  }

  // User methods
  async getUsers(): Promise<User[]> {
    const response = await this.api.get(endpoints.users);
    return response.data;
  }

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const response = await this.api.post(endpoints.users, user);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.api.delete(endpoints.userById(id));
  }

  // Statistics methods
  async getStatistics(): Promise<{
    totalStudents: number;
    paidStudents: number;
    debtStudents: number;
    totalRevenue: number;
    totalOutstanding: number;
    programStats: Array<{ program: string; count: number }>;
  }> {
    const response = await this.api.get(endpoints.stats);
    return response.data;
  }
}

export const apiService = new ApiService();