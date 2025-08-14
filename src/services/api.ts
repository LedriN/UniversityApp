import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { apiConfig, endpoints } from '../config/api';
import { Student, User, StudentFilters, Lecture, PaymentRecord, PaymentStats, Subject } from '../types';

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

  // Lecture methods
  async getLecturesByProgram(program: string): Promise<Lecture[]> {
    const response = await this.api.get(endpoints.lecturesByProgram(program));
    return response.data;
  }

  async uploadLecture(formData: FormData): Promise<{ message: string; lecture: Lecture }> {
    const response = await this.api.post(endpoints.uploadLecture, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async downloadLecture(id: string): Promise<Blob> {
    const response = await this.api.get(endpoints.downloadLecture(id), {
      responseType: 'blob',
    });
    return response.data;
  }

  async deleteLecture(id: string): Promise<void> {
    await this.api.delete(endpoints.deleteLecture(id));
  }

  // Payment Record methods
  async getPaymentRecords(studentId: string): Promise<PaymentRecord[]> {
    const response = await this.api.get(`/payment-records/student/${studentId}`);
    return response.data;
  }

  async addPaymentRecord(paymentData: {
    studentId: string;
    amount: number;
    paymentDate?: string;
    paymentMethod?: 'cash' | 'bank_transfer' | 'card' | 'other';
    description?: string;
    receiptNumber?: string;
  }): Promise<PaymentRecord> {
    const response = await this.api.post('/payment-records', paymentData);
    return response.data;
  }

  async deletePaymentRecord(id: string): Promise<void> {
    await this.api.delete(`/payment-records/${id}`);
  }

  async getPaymentStats(studentId: string): Promise<PaymentStats> {
    const response = await this.api.get(`/payment-records/student/${studentId}/stats`);
    return response.data;
  }

  // Subject methods
  async getSubjects(program?: string): Promise<Subject[]> {
    const params = program ? `?program=${encodeURIComponent(program)}` : '';
    const response = await this.api.get(`/subjects${params}`);
    return response.data;
  }

  async getSubjectById(id: string): Promise<Subject> {
    const response = await this.api.get(`/subjects/${id}`);
    return response.data;
  }

  async addSubject(subjectData: {
    name: string;
    program: string;
    description?: string;
    credits: number;
    semester: number;
  }): Promise<Subject> {
    const response = await this.api.post('/subjects', subjectData);
    return response.data;
  }

  async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject> {
    const response = await this.api.put(`/subjects/${id}`, updates);
    return response.data;
  }

  async deleteSubject(id: string): Promise<void> {
    await this.api.delete(`/subjects/${id}`);
  }
}

export const apiService = new ApiService();