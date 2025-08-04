import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  GraduationCap, 
  CreditCard, 
  Settings, 
  LogOut, 
  User,
  Calendar,
  BookOpen,
  DollarSign,
  FileText,
  Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { Student } from '../types';

interface StudentDashboardProps {
  children?: React.ReactNode;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useApp();
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  // Navigation items for student
  const navigation = [
    { name: 'Dashboard', href: '/student', icon: Home },
    { name: 'Departamenti & Pagesat', href: '/student/department', icon: GraduationCap },
    { name: 'Cilësimet', href: '/student/settings', icon: Settings },
  ];

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const calculateDebt = () => {
    if (!studentData) return 0;
    return Math.max(0, studentData.totalAmount - studentData.paidAmount);
  };

  const calculateProgress = () => {
    if (!studentData || studentData.totalAmount === 0) return 0;
    return Math.min(100, (studentData.paidAmount / studentData.totalAmount) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Duke ngarkuar të dhënat...</span>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Nuk u gjetën të dhëna</h2>
          <p className="text-gray-600">Të dhënat e studentit nuk u gjetën në sistem.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white shadow-lg">
          {/* Header */}
          <div className="flex p-6 items-center justify-center border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Portali i Studentit</h1>
                <p className="text-xs text-gray-500">Universiteti Privat</p>
              </div>
            </div>
          </div>
          
          {/* Student Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {studentData.firstName} {studentData.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{studentData.email}</p>
                <p className="text-xs text-blue-600 font-medium">Student</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="mt-6 px-4 flex-1">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Dil</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">Portali i Studentit</span>
            </div>
            <button
              onClick={() => {
                const sidebar = document.getElementById('mobile-sidebar');
                sidebar?.classList.toggle('-translate-x-full');
              }}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto py-6 px-4 sm:py-8 sm:px-6 lg:py-10 lg:px-8">
          {children || <StudentDashboardContent student={studentData} />}
        </main>
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform -translate-x-full transition-transform duration-300 ease-in-out" id="mobile-sidebar">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">Portali i Studentit</span>
          </div>
        </div>
        
        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Dil</span>
          </button>
        </div>
      </div>
    </div>
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
          <div className="flex items-center space-x-2">
            <Bell className="h-6 w-6 text-gray-400" />
            <span className="text-sm text-gray-500">Nuk ka njoftime të reja</span>
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