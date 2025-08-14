import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, GraduationCap, ArrowLeft, Search, FileText, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import LectureList from '../components/LectureList';
import SubjectList from '../components/SubjectList';

const Departments: React.FC = () => {
  const { students, currentUser } = useApp();
  const navigate = useNavigate();
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'students' | 'lectures' | 'subjects'>('students');

  // Define all available programs
  const allPrograms = [
    'Shkenca Kompjuterike',
    'Ekonomi e Pergjithshme',
    'Juridik i Pergjithshem',
    'Perkujdesje dhe Mireqenie Sociale'
  ];

  // Group students by program
  const studentsByProgram = useMemo(() => {
    const grouped: Record<string, Student[]> = {};
    
    allPrograms.forEach(program => {
      grouped[program] = students.filter(student => student.program === program);
    });
    
    return grouped;
  }, [students]);

  // Get students for selected program with search filter
  const filteredStudents = useMemo(() => {
    if (!selectedProgram) return [];
    
    const programStudents = studentsByProgram[selectedProgram] || [];
    
    if (!searchTerm) return programStudents;
    
    return programStudents.filter(student => {
      const searchLower = searchTerm.toLowerCase();
      return (
        student.firstName.toLowerCase().includes(searchLower) ||
        student.lastName.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.studentID.toLowerCase().includes(searchLower)
      );
    });
  }, [selectedProgram, studentsByProgram, searchTerm]);

  // Calculate statistics for each program
  const programStats = useMemo(() => {
    const stats: Record<string, { total: number; paid: number; debt: number }> = {};
    
    allPrograms.forEach(program => {
      const programStudents = studentsByProgram[program];
      const total = programStudents.length;
      const paid = programStudents.filter(s => s.paidAmount >= s.totalAmount).length;
      const debt = total - paid;
      
      stats[program] = { total, paid, debt };
    });
    
    return stats;
  }, [studentsByProgram]);

  const getPaymentStatus = (student: Student) => {
    const paid = student.paidAmount;
    const total = student.totalAmount;
    if (paid >= total) return { status: 'paid', label: 'I Paguar', color: 'green' };
    if (paid > 0) return { status: 'partial', label: 'Pjesërisht', color: 'yellow' };
    return { status: 'unpaid', label: 'Pa Paguar', color: 'red' };
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    return today.getFullYear() - birthDate.getFullYear();
  };

  if (selectedProgram) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedProgram(null)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{selectedProgram}</h1>
            <p className="text-gray-600">
              {activeTab === 'students' ? `${filteredStudents.length} studentë` : 
               activeTab === 'lectures' ? 'Leksionet' : 'Lendet'} në këtë program
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('students')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'students'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users size={20} />
                  Studentët ({filteredStudents.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('lectures')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'lectures'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText size={20} />
                  Leksionet
                </div>
              </button>
              <button
                onClick={() => setActiveTab('subjects')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'subjects'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={20} />
                  Lendet
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'students' ? (
          <>
            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Kërko studentët..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Students List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mosha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lokacioni
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statusi i Pagesës
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veprimet
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => {
                  const paymentStatus = getPaymentStatus(student);
                  const age = calculateAge(student.dateOfBirth);
                  
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {student.studentID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {age} vjeç
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.address.split(',').pop()?.trim()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          paymentStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                          paymentStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {paymentStatus.label}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          €{student.paidAmount.toLocaleString()}/€{student.totalAmount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/admin/students/${student.id}`}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Shiko detajet"
                        >
                          Shiko detajet
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'Nuk u gjetën studentë' : 'Nuk ka studentë në këtë program'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Provo të ndryshosh kriteret e kërkimit.' : 'Studentët do të shfaqen këtu kur të regjistrohen.'}
              </p>
            </div>
          )}
            </div>
          </>
        ) : activeTab === 'lectures' ? (
          <LectureList 
            program={selectedProgram} 
            userRole={currentUser?.role || 'student'} 
          />
        ) : (
          <SubjectList 
            program={selectedProgram} 
            userRole={currentUser?.role || 'student'} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Departamentet</h1>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Përmbledhje e Departamenteve</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {allPrograms.length}
            </div>
            <div className="text-sm text-gray-500">Departamente</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {students.length}
            </div>
            <div className="text-sm text-gray-500">Totali Studentë</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {students.filter(s => s.paidAmount >= s.totalAmount).length}
            </div>
            <div className="text-sm text-gray-500">Studentë të Paguar</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allPrograms.map((program) => {
          const stats = programStats[program];
          const studentCount = stats.total;
          
          return (
            <div
              key={program}
              onClick={() => setSelectedProgram(program)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">{program}</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{studentCount}</div>
                  <div className="text-sm text-gray-500">studentë</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">I paguar:</span>
                  <span className="font-medium text-green-600">{stats.paid}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Me borxh:</span>
                  <span className="font-medium text-red-600">{stats.debt}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                  <span>Shiko studentët</span>
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Departments; 