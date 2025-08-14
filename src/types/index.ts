export interface Student {
  id: string;
  studentID: string;
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
  comment?: string;
  createdAt: string;
  updatedAt: string;
  userCredentials?: {
    username: string;
    password: string;
  };
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  amount: number;
  paymentDate: string;
  description?: string;
  receiptNumber?: string;
  recordedBy: {
    id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
  formattedPaymentDate?: string;
}

export interface PaymentStats {
  totalPaid: number;
  remainingDebt: number;
  paymentProgress: number;
  totalPayments: number;
  monthlyPayments: Record<string, number>;
  lastPayment: string | null;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'staff' | 'student';
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

export interface Lecture {
  id: string;
  title: string;
  description?: string;
  program: string;
  fileName?: string;
  originalFileName?: string;
  filePath?: string;
  fileSize?: number;
  uploadedBy: {
    id: string;
    username: string;
    email: string;
  };
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  program: string;
  description?: string;
  credits: number;
  semester: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}