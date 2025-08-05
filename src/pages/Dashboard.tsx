import React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, CreditCard, AlertTriangle, TrendingUp, BookOpen } from 'lucide-react';
import { apiService } from '../services/api';
import { useAsyncOperation } from '../hooks/useApi';
import { useApp } from '../context/AppContext';

const Dashboard: React.FC = () => {
  const { students, loading: contextLoading } = useApp();
  const [stats, setStats] = useState({
    totalStudents: 0,
    paidStudents: 0,
    debtStudents: 0,
    totalRevenue: 0,
    totalOutstanding: 0,
    programStats: [] as Array<{ program: string; count: number }>
  });
  const { loading: statsLoading, execute } = useAsyncOperation();

  useEffect(() => {
    const loadStats = async () => {
      const result = await execute(() => apiService.getStatistics());
      if (result) {
        setStats(result);
      } else {
        // Fallback to client-side calculation if API fails
        const totalStudents = students.length;
        const paidStudents = students.filter(s => s.paidAmount >= s.totalAmount).length;
        const debtStudents = students.filter(s => s.paidAmount < s.totalAmount).length;
        const totalRevenue = students.reduce((sum, s) => sum + s.paidAmount, 0);
        const totalOutstanding = students.reduce((sum, s) => sum + (s.totalAmount - s.paidAmount), 0);
        
        const programs = Array.from(new Set(students.map(s => s.program)));
        const programStats = programs.map(program => ({
          program,
          count: students.filter(s => s.program === program).length
        }));
        
        setStats({
          totalStudents,
          paidStudents,
          debtStudents,
          totalRevenue,
          totalOutstanding,
          programStats
        });
      }
    };
    
    loadStats();
  }, [students]);

  const recentStudents = students.slice(0, 5);
  const loading = contextLoading || statsLoading;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/admin/students/add"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Shto Student
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Duke ngarkuar të dhënat...</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Totali Studentë</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Studentë të Paguar</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.paidStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Me Borxh</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.debtStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Të Ardhura</p>
              <p className="text-2xl font-semibold text-gray-900">€{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Students */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Studentë të Fundit</h3>
              <Link
                to="/admin/students"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Shiko të gjithë
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentStudents.map((student) => (
              <div key={student.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{student.program}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.paidAmount >= student.totalAmount
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {student.paidAmount >= student.totalAmount ? 'I Paguar' : 'Me Borxh'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Program Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Statistika sipas Programit</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.programStats.map((stat) => (
                <div key={stat.program} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{stat.program}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{stat.count} studentë</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Përmbledhje Financiare</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Të Ardhura Totale</p>
              <p className="text-2xl font-semibold text-green-600">€{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Borxhe të Mbetura</p>
              <p className="text-2xl font-semibold text-orange-600">€{stats.totalOutstanding.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Totali i Pritshëm</p>
              <p className="text-2xl font-semibold text-blue-600">€{(stats.totalRevenue + stats.totalOutstanding).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;