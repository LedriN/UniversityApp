import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  CreditCard, 
  FileText, 
  Calendar, 
  BookOpen,
  DollarSign,
  Download,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { Student } from '../types';
import StudentLayout from '../components/StudentLayout';

const DepartmentPage: React.FC = () => {
  const { currentUser } = useApp();
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudentData = async () => {
      if (currentUser?.role === 'student') {
        try {
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
      <StudentLayout title="Departamenti & Pagesat">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Duke ngarkuar të dhënat...</span>
        </div>
      </StudentLayout>
    );
  }

  if (!studentData) {
    return (
      <StudentLayout title="Departamenti & Pagesat">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Nuk u gjetën të dhëna</h2>
          <p className="text-gray-600">Të dhënat e studentit nuk u gjetën në sistem.</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Departamenti & Pagesat" subtitle="Informacione për departamentin dhe statusin e pagesave">
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Departamenti & Pagesat</h1>
              <p className="text-gray-600">Informacione për departamentin dhe statusin e pagesave</p>
            </div>
          </div>
        </div>

        {/* Department Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Informacione Departamenti</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Programi</p>
                  <p className="text-sm text-gray-900">{studentData.program}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Viti Akademik</p>
                  <p className="text-sm text-gray-900">{studentData.academicYear}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Shkolla e Mëparshme</p>
                  <p className="text-sm text-gray-900">{studentData.previousSchool || 'Nuk specifikuar'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Statusi i Regjistrimit</p>
                  <p className="text-sm text-green-600 font-medium">I Regjistruar</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Statusi i Dokumenteve</p>
                  <p className="text-sm text-green-600 font-medium">Të Plota</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Kredite të Marra</p>
                  <p className="text-sm text-gray-900">180 ECTS</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Përmbledhje e Pagesave</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Shuma Totale</p>
                  <p className="text-2xl font-bold text-blue-900">€{studentData.totalAmount.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">E Paguar</p>
                  <p className="text-2xl font-bold text-green-900">€{studentData.paidAmount.toLocaleString()}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Borxhi</p>
                  <p className="text-2xl font-bold text-red-900">€{calculateDebt().toLocaleString()}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Payment Progress */}
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progresi i pagesës</span>
              <span className="text-gray-600">{calculateProgress().toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-300 ${
                  calculateProgress() === 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Statusi: {studentData.paidAmount >= studentData.totalAmount ? 'I Paguar' : 'Me Borxh'}</span>
              <span className="text-gray-600">Mbetet: €{calculateDebt().toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Historia e Pagesave</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Përshkrimi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shuma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statusi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veprime
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentData.paidAmount > 0 ? (
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date().toLocaleDateString('sq-AL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Pagesa për vitin akademik {studentData.academicYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{studentData.paidAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        E Paguar
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nuk ka pagesa të regjistruara
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Payments */}
        {calculateDebt() > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Pagesat e Ardhshme</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Pagesa e mbetur: €{calculateDebt().toLocaleString()}
                  </p>
                  <p className="text-sm text-yellow-700">
                    Ju lutem paguani shumën e mbetur për të përfunduar regjistrimin
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Dokumentet</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Kontrata e Regjistrimit</p>
                  <p className="text-xs text-gray-500">PDF • 245 KB</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-900">
                <Download className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Fatura e Pagesës</p>
                  <p className="text-xs text-gray-500">PDF • 180 KB</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-900">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
              </div>
      </StudentLayout>
    );
  };

export default DepartmentPage; 