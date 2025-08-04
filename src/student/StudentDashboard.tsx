import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar,
  BookOpen,
  DollarSign,
  Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { Student } from '../types';
import StudentLayout from '../components/StudentLayout';

interface StudentDashboardProps {
  children?: React.ReactNode;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ children }) => {
  const { currentUser } = useApp();
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudentData = async () => {
      if (currentUser?.role === 'student') {
        try {
          // Find student by username (which should match the user's username)
          const students = await apiService.getStudents();
          const student = students.find(s => 
            `${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}` === currentUser.username
          );
          setStudentData(student || null);
        } catch (error) {
          console.error('Error loading student data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadStudentData();
  }, [currentUser]);

  if (loading) {
    return (
      <StudentLayout title="Dashboard">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Duke ngarkuar të dhënat...</span>
        </div>
      </StudentLayout>
    );
  }

  if (!studentData) {
    return (
      <StudentLayout title="Dashboard">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Nuk u gjetën të dhëna</h2>
            <p className="text-gray-600">Të dhënat e studentit nuk u gjetën në sistem.</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Dashboard" subtitle={`Mirë se vini, ${studentData.firstName}!`}>
      {children || <StudentDashboardContent student={studentData} />}
    </StudentLayout>
  );
};

// Dashboard Content Component
const StudentDashboardContent: React.FC<{ student: Student }> = ({ student }) => {
  const calculateDebt = () => {
    return Math.max(0, student.totalAmount - student.paidAmount);
  };

  const calculateProgress = () => {
    if (student.totalAmount === 0) return 0;
    return Math.min(100, (student.paidAmount / student.totalAmount) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Mirë se vini, {student.firstName}!
            </h1>
            <p className="mt-2 text-gray-600">
              Këtu mund të shihni të gjitha informacionet tuaja si student
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Programi</p>
              <p className="text-lg font-semibold text-gray-900">{student.program}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Viti Akademik</p>
              <p className="text-lg font-semibold text-gray-900">{student.academicYear}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Shuma Totale</p>
              <p className="text-lg font-semibold text-gray-900">€{student.totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCard className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Borxhi</p>
              <p className="text-lg font-semibold text-gray-900">€{calculateDebt().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Progresi i Pagesës</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shuma e paguar: €{student.paidAmount.toLocaleString()}</span>
            <span className="text-gray-600">{calculateProgress().toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                calculateProgress() === 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Statusi: {student.paidAmount >= student.totalAmount ? 'I Paguar' : 'Me Borxh'}</span>
            <span className="text-gray-600">Mbetet: €{calculateDebt().toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informacione Personale</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Emri i plotë</p>
            <p className="text-sm text-gray-900">{student.firstName} {student.lastName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Emri i prindit</p>
            <p className="text-sm text-gray-900">{student.parentName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-sm text-gray-900">{student.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Telefon</p>
            <p className="text-sm text-gray-900">{student.phone}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Adresa</p>
            <p className="text-sm text-gray-900">{student.address}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Gjinia</p>
            <p className="text-sm text-gray-900">{student.gender === 'M' ? 'Mashkull' : 'Femër'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;