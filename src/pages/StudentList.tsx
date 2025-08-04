import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye, Edit, Trash2, Plus, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';

const StudentList: React.FC = () => {
  const { students, filters, setFilters, deleteStudent } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !student.firstName.toLowerCase().includes(searchLower) &&
          !student.lastName.toLowerCase().includes(searchLower) &&
          !student.email.toLowerCase().includes(searchLower) &&
          !student.program.toLowerCase().includes(searchLower) &&
          !student.studentID.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Gender filter
      if (filters.gender && student.gender !== filters.gender) {
        return false;
      }

      // Program filter
      if (filters.program && student.program !== filters.program) {
        return false;
      }

      // Payment status filter
      if (filters.paymentStatus) {
        const isPaid = student.paidAmount >= student.totalAmount;
        if (filters.paymentStatus === 'paid' && !isPaid) return false;
        if (filters.paymentStatus === 'debt' && isPaid) return false;
      }

      // Location filter
      if (filters.location) {
        if (!student.address.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
      }

      // Age range filter
      if (filters.ageRange) {
        const today = new Date();
        const birthDate = new Date(student.dateOfBirth);
        const age = today.getFullYear() - birthDate.getFullYear();
        
        switch (filters.ageRange) {
          case '18-20':
            if (age < 18 || age > 20) return false;
            break;
          case '21-23':
            if (age < 21 || age > 23) return false;
            break;
          case '24+':
            if (age < 24) return false;
            break;
        }
      }

      return true;
    });
  }, [students, filters]);

  const programs = Array.from(new Set(students.map(s => s.program)));

  const handleDelete = async (id: string) => {
    if (window.confirm('Jeni i sigurt që dëshironi të fshini këtë student?')) {
      setLoading(true);
      try {
        await deleteStudent(id);
      } finally {
        setLoading(false);
      }
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Lista e Studentëve</h1>
        <Link
          to="/admin/students/add"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Shto Student
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Kërko sipas emrit, email ose programit..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtrat
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gjinia</label>
                <select
                  value={filters.gender}
                  onChange={(e) => setFilters({ gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Të gjitha</option>
                  <option value="M">Mashkull</option>
                  <option value="F">Femër</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mosha</label>
                <select
                  value={filters.ageRange}
                  onChange={(e) => setFilters({ ageRange: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Të gjitha</option>
                  <option value="18-20">18-20 vjeç</option>
                  <option value="21-23">21-23 vjeç</option>
                  <option value="24+">24+ vjeç</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Programi</label>
                <select
                  value={filters.program}
                  onChange={(e) => setFilters({ program: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Të gjitha</option>
                  {programs.map(program => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pagesa</label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) => setFilters({ paymentStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Të gjitha</option>
                  <option value="paid">I Paguar</option>
                  <option value="debt">Me Borxh</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokacioni</label>
                <input
                  type="text"
                  placeholder="Qyteti..."
                  value={filters.location}
                  onChange={(e) => setFilters({ location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Shfaqen {filteredStudents.length} nga {students.length} studentë</span>
        <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
          <Download className="h-4 w-4 mr-2" />
          Eksporto
        </button>
      </div>

      {/* Students Table */}
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
                  Programi
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
                      {student.program}
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
                        €{(student.paidAmount / 100).toLocaleString()}/€{(student.totalAmount / 100).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/students/${student.id}`}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Shiko detajet"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/students/${student.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="Modifiko"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Fshi"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            {/* Users icon was removed from imports, so this will cause an error */}
            {/* <Users className="mx-auto h-12 w-12 text-gray-400" /> */}
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nuk u gjetën studentë</h3>
            <p className="mt-1 text-sm text-gray-500">Provo të ndryshosh filtrat ose shto një student të ri.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentList;