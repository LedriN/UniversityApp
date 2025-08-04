import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  User, 
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  CreditCard,
  DollarSign,
  X
} from 'lucide-react';
import { apiService } from '../services/api';
import { Lecture, Student } from '../types';
import { useApp } from '../context/AppContext';
import StudentLayout from '../components/StudentLayout';

const StudentDepartmentPage: React.FC = () => {
  const { currentUser } = useApp();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [studentProgram, setStudentProgram] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get student's program and data from database
  const getStudentData = async () => {
    if (currentUser?.role === 'student') {
      try {
        console.log('Current user:', currentUser);
        const students = await apiService.getStudents();
        console.log('All students:', students);
        const student = students.find(s => 
          s.email === currentUser.email
        );
        console.log('Found student:', student);
        if (student) {
          console.log('Student program:', student.program);
          setStudentProgram(student.program);
          setStudentData(student);
          return student.program;
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    }
    return null;
  };

  const fetchLectures = async () => {
    if (!studentProgram) {
      setError('Program not found for student');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await apiService.getLecturesByProgram(studentProgram);
      console.log('Fetched lectures:', data);
      console.log('Student program:', studentProgram);
      setLectures(data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching lectures:', err);
      setError(err.response?.data?.message || 'Failed to fetch lectures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await getStudentData();
    };
    
    initializeData();
  }, [currentUser]);

  useEffect(() => {
    if (studentProgram) {
      fetchLectures();
    }
  }, [studentProgram]);

  const handleDownload = async (lecture: Lecture) => {
    try {
      console.log('Downloading lecture:', lecture);
      console.log('Lecture ID:', lecture.id);
      
      if (!lecture.id) {
        alert('Lecture ID is missing. Please try again.');
        return;
      }
      
      setDownloadingId(lecture.id);
      const blob = await apiService.downloadLecture(lecture.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = lecture.originalFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download failed:', err);
      alert('Failed to download lecture');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleLectureClick = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLecture(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sq-AL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sq-AL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getPaymentStatus = () => {
    if (!studentData) return { status: 'Unknown', color: 'gray' };
    
    const remainingAmount = studentData.totalAmount - studentData.paidAmount;
    
    if (remainingAmount <= 0) {
      return { status: 'E Paguar Plotësisht', color: 'green' };
    } else if (studentData.paidAmount > 0) {
      return { status: 'E Paguar Pjesërisht', color: 'yellow' };
    } else {
      return { status: 'E Papaguar', color: 'red' };
    }
  };

  const filteredLectures = lectures.filter(lecture =>
    lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lecture.description && lecture.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paymentStatus = getPaymentStatus();

  if (loading) {
    return (
      <StudentLayout title="Leksionet e Mia" subtitle={studentProgram || ''}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Duke ngarkuar të dhënat...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!studentProgram) {
    return (
      <StudentLayout title="Leksionet e Mia">
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md mx-auto">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Programi juaj nuk u gjet
            </h3>
            <p className="text-gray-600">
              Ju lutemi kontaktoni administratorin për të konfirmuar programin tuaj.
            </p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Leksionet e Mia" subtitle={studentProgram}>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Leksione</p>
              <p className="text-3xl font-bold text-gray-900">{lectures.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Programi Aktual</p>
              <p className="text-lg font-semibold text-gray-900">{studentProgram}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Statusi i Regjistrimit</p>
              <p className="text-lg font-semibold text-green-600">I Regjistruar</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Statusi i Pagesës</p>
              <p className={`text-lg font-semibold text-${paymentStatus.color}-600`}>
                {paymentStatus.status}
              </p>
            </div>
            <div className={`bg-${paymentStatus.color}-100 p-3 rounded-lg`}>
              <CreditCard className={`h-6 w-6 text-${paymentStatus.color}-600`} />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      {studentData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Informacioni i Pagesës</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-1">Shuma Totale</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(studentData.totalAmount)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-1">E Paguar</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(studentData.paidAmount)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-1">E Mbetur</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(studentData.totalAmount - studentData.paidAmount)}
              </p>
            </div>
          </div>
          
          {studentData.totalAmount - studentData.paidAmount > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <p className="text-yellow-800">
                  Ju keni një shumë të papaguar. Ju lutemi kontaktoni zyrën e studentëve për të plotësuar pagesën.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Kërko leksione..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
            <Filter className="h-5 w-5" />
            <span>Filtro</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Lectures Grid */}
      {filteredLectures.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'Nuk u gjetën rezultate' : 'Nuk ka leksione të ngarkuara'}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Provoni të ndryshoni kriteret e kërkimit'
              : 'Leksionet do të shfaqen këtu kur të ngarkohen nga stafi'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLectures.map((lecture) => (
            <div
              key={lecture.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer"
              onClick={() => handleLectureClick(lecture)}
            >
              <div className="flex items-start space-x-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {lecture.title}
                  </h3>
                  {lecture.description && (
                    <p className="text-gray-600 mt-1 text-sm line-clamp-2">
                      {lecture.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-3 mb-4 flex-1">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span className="truncate">{formatDate(lecture.uploadedAt)}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  <span className="truncate">{lecture.uploadedBy.username}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded-md text-xs">
                    {formatFileSize(lecture.fileSize)}
                  </span>
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(lecture);
                }}
                disabled={downloadingId === lecture.id}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>
                  {downloadingId === lecture.id ? 'Duke shkarkuar...' : 'Shkarko'}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lecture Details Modal */}
      {isModalOpen && selectedLecture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedLecture.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedLecture.program}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Description */}
              {selectedLecture.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Përshkrimi</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedLecture.description}
                    </p>
                  </div>
                </div>
              )}

              {/* File Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informacioni i File</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">Emri i File</p>
                    <p className="text-gray-900">{selectedLecture.originalFileName}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">Madhësia</p>
                    <p className="text-gray-900">{formatFileSize(selectedLecture.fileSize)}</p>
                  </div>
                </div>
              </div>

              {/* Upload Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informacioni i Ngarkimit</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">Ngarkuar nga</p>
                    <p className="text-gray-900">{selectedLecture.uploadedBy.username}</p>
                    <p className="text-sm text-gray-500">{selectedLecture.uploadedBy.email}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">Data e Ngarkimit</p>
                    <p className="text-gray-900">{formatDate(selectedLecture.uploadedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Mbyll
                </button>
                <button
                  onClick={() => handleDownload(selectedLecture)}
                  disabled={downloadingId === selectedLecture.id}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>
                    {downloadingId === selectedLecture.id ? 'Duke shkarkuar...' : 'Shkarko'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default StudentDepartmentPage; 