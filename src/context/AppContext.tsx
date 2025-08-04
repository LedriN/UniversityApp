import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAsyncOperation } from '../hooks/useApi';
import { Student, User, StudentFilters } from '../types';
import { mockStudents, mockUsers } from '../data/mockData';

interface AppContextType {
  students: Student[];
  users: User[];
  currentUser: User | null;
  filters: StudentFilters;
  loading: boolean;
  error: string | null;
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  setFilters: (filters: Partial<StudentFilters>) => void;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  refreshStudents: () => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [usesMockData, setUsesMockData] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<StudentFilters>({
    search: '',
    gender: '',
    ageRange: '',
    program: '',
    paymentStatus: '',
    location: ''
  });

  const { execute } = useAsyncOperation();

  // Check if backend is available
  const checkBackendHealth = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/health`);
      setIsOnline(true);
    } catch {
      setIsOnline(false);
      setUsesMockData(true);
    }
  };

  useEffect(() => {
    checkBackendHealth();
    const savedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('authToken');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
              if (token) {
          if (isOnline) {
            // Verify token is still valid and refresh data
            refreshStudents();
            // Only refresh users if admin
            if (JSON.parse(savedUser).role === 'admin') {
              refreshUsers();
            }
          } else {
            // Use mock data when offline
            setStudents(mockStudents);
            setUsers(mockUsers);
          }
        }
    }
  }, [isOnline]);

  const refreshStudents = async () => {
    if (!isOnline) {
      setStudents(mockStudents);
      return;
    }
    const result = await execute(() => apiService.getStudents(filters));
    if (result) {
      setStudents(result);
    } else {
      // Fallback to mock data if API fails
      setStudents(mockStudents);
      setUsesMockData(true);
    }
  };

  const refreshUsers = async () => {
    if (!isOnline) {
      setUsers(mockUsers);
      return;
    }
    
    // Only fetch users if current user is admin
    if (currentUser?.role !== 'admin') {
      setUsers([]);
      return;
    }
    
    const result = await execute(() => apiService.getUsers());
    if (result) {
      setUsers(result);
    } else {
      // Fallback to mock data if API fails
      setUsers(mockUsers);
      setUsesMockData(true);
    }
  };

  const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!isOnline) {
      // Mock implementation for offline mode
      const newStudent: Student = {
        ...studentData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setStudents(prev => [newStudent, ...prev]);
      return;
    }
    
    const result = await execute(() => apiService.createStudent(studentData));
    if (result) {
      setStudents(prev => [result, ...prev]);
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    if (!isOnline) {
      // Mock implementation for offline mode
      setStudents(prev => prev.map(student => 
        student.id === id ? { ...student, ...updates, updatedAt: new Date().toISOString() } : student
      ));
      return;
    }
    
    const result = await execute(() => apiService.updateStudent(id, updates));
    if (result) {
      setStudents(prev => prev.map(student => 
        student.id === id ? result : student
      ));
    }
  };

  const deleteStudent = async (id: string) => {
    if (!isOnline) {
      // Mock implementation for offline mode
      setStudents(prev => prev.filter(student => student.id !== id));
      return;
    }
    
    const result = await execute(() => apiService.deleteStudent(id));
    if (result !== null) {
      setStudents(prev => prev.filter(student => student.id !== id));
    }
  };

  const setFilters = (newFilters: Partial<StudentFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  // Refresh students when filters change
  useEffect(() => {
    if (currentUser && isOnline) {
      refreshStudents();
    }
  }, [filters]);

  const login = async (username: string, password: string): Promise<boolean> => {
    if (!isOnline) {
      // Mock login for offline mode
      if ((username === 'admin' && password === 'admin123') || (username === 'staff' && password === 'staff123')) {
        const mockUser: User = {
          id: '1',
          username,
          email: `${username}@university.edu.al`,
          role: username === 'admin' ? 'admin' : 'staff',
          createdAt: new Date().toISOString()
        };
        setCurrentUser(mockUser);
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        localStorage.setItem('authToken', 'mock-token');
        setStudents(mockStudents);
        setUsers(mockUsers);
        return true;
      }
      return false;
    }
    
    const result = await execute(() => apiService.login(username, password));
    if (result) {
      const { user, token } = result;
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', token);
      
      // Load initial data
      await refreshStudents();
      // Only refresh users if admin
      if (user.role === 'admin') {
        await refreshUsers();
      }
      
      return true;
    }
    return false;
  };

  const logout = async () => {
    if (!isOnline) {
      // Mock logout for offline mode
      setCurrentUser(null);
      setStudents([]);
      setUsers([]);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      return;
    }
    
    await execute(() => apiService.logout());
    setCurrentUser(null);
    setStudents([]);
    setUsers([]);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    // Only allow admin users to add users
    if (currentUser?.role !== 'admin') {
      throw new Error('Access denied. Admin privileges required.');
    }
    
    if (!isOnline) {
      // Mock implementation for offline mode
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      setUsers(prev => [...prev, newUser]);
      return;
    }
    
    const result = await execute(() => apiService.createUser(userData));
    if (result) {
      setUsers(prev => [...prev, result]);
    }
  };

  return (
    <AppContext.Provider value={{
      students,
      users,
      isOnline,
      usesMockData,
      currentUser,
      filters,
      loading,
      error,
      addStudent,
      updateStudent,
      deleteStudent,
      setFilters,
      login,
      logout,
      addUser,
      refreshStudents,
      refreshUsers
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};