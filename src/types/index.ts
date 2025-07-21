export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  parentName: string;
  gender: 'M' | 'F';
  dateOfBirth: string;
  address: string;
  phone: string;
  email: string;
  previousSchool: string;
  previousSchoolAddress: string;
  program: string;
  academicYear: string;
  totalAmount: number;
  paidAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'staff';
  createdAt: string;
}

export interface StudentFilters {
  search: string;
  gender: string;
  ageRange: string;
  program: string;
  paymentStatus: string;
  location: string;
  isOnline?: boolean;
  usesMockData?: boolean;
}