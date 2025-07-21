import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Download, Phone, Mail, MapPin, Calendar, User, GraduationCap, CreditCard } from 'lucide-react';
import jsPDF from 'jspdf';
import { apiService } from '../services/api';
import { useAsyncOperation } from '../hooks/useApi';
import { Student } from '../types';

const StudentDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const { loading, execute } = useAsyncOperation();

  useEffect(() => {
    if (id) {
      const loadStudent = async () => {
        const result = await execute(() => apiService.getStudentById(id));
        if (result) {
          setStudent(result);
        }
      };
      
      loadStudent();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Duke ngarkuar të dhënat e studentit...</span>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">Studenti nuk u gjet</p>
        <button
          onClick={() => navigate('/students')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Kthehu te lista
        </button>
      </div>
    );
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    return today.getFullYear() - birthDate.getFullYear();
  };

  const getPaymentStatus = () => {
    const paid = student.paidAmount;
    const total = student.totalAmount;
    if (paid >= total) return { status: 'paid', label: 'I Paguar', color: 'green' };
    if (paid > 0) return { status: 'partial', label: 'Pjesërisht i Paguar', color: 'yellow' };
    return { status: 'unpaid', label: 'Pa Paguar', color: 'red' };
  };

  const calculateProgress = () => {
    if (student.totalAmount === 0) return 0;
    return Math.min(100, (student.paidAmount / student.totalAmount) * 100);
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.text('Universiteti Privat', 20, 30);
    pdf.setFontSize(16);
    pdf.text('Te dhenat e Studentit', 20, 45);
    
    // Student Info
    pdf.setFontSize(12);
    let yPos = 70;
    
    const addLine = (label: string, value: string) => {
      pdf.text(`${label}: ${value}`, 20, yPos);
      yPos += 10;
    };
    
    addLine('Emri i plote', `${student.firstName} ${student.lastName}`);
    addLine('Emri i prindit', student.parentName);
    addLine('Gjinia', student.gender === 'M' ? 'Mashkull' : 'Femer');
    addLine('Mosha', `${calculateAge(student.dateOfBirth)} vjec`);
    addLine('Data e lindjes', new Date(student.dateOfBirth).toLocaleDateString('sq-AL'));
    addLine('Adresa', student.address);
    addLine('Telefoni', student.phone);
    addLine('Email', student.email);
    addLine('Shkolla e meparshme', student.previousSchool);
    addLine('Adresa e shkolles se meparshme', student.previousSchoolAddress);
    addLine('Programi', student.program);
    addLine('Viti akademik', student.academicYear);
    
    yPos += 10;
    pdf.setFontSize(14);
    pdf.text('Te dhena financiare:', 20, yPos);
    yPos += 15;
    
    pdf.setFontSize(12);
    addLine('Shuma totale', `${student.totalAmount.toLocaleString()} ALL`);
    addLine('Shuma e paguar', `${student.paidAmount.toLocaleString()} ALL`);
    addLine('Borxhi i mbetur', `${(student.totalAmount - student.paidAmount).toLocaleString()} ALL`);
    addLine('Statusi i pageses', getPaymentStatus().label);
    
    // Footer
    yPos += 20;
    pdf.setFontSize(10);
    pdf.text(`Gjeneruar me: ${new Date().toLocaleDateString('sq-AL')}`, 20, yPos);
    
    pdf.save(`student-${student.firstName}-${student.lastName}.pdf`);
  };

  const paymentStatus = getPaymentStatus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/students')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {student.firstName} {student.lastName}
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToPDF}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Eksporto PDF
          </button>
          <Link
            to={`/students/${student.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifiko
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <User className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Të Dhëna Personale</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Emri i Plotë</label>
                <p className="mt-1 text-sm text-gray-900">{student.firstName} {student.lastName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Emri i Prindit</label>
                <p className="mt-1 text-sm text-gray-900">{student.parentName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Gjinia</label>
                <p className="mt-1 text-sm text-gray-900">{student.gender === 'M' ? 'Mashkull' : 'Femër'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Mosha</label>
                <p className="mt-1 text-sm text-gray-900">{calculateAge(student.dateOfBirth)} vjeç</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Data e Lindjes</label>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">
                    {new Date(student.dateOfBirth).toLocaleDateString('sq-AL')}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Adresa</label>
                <div className="flex items-center mt-1">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">{student.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Phone className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">Të Dhëna Kontakti</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Numri i Telefonit</label>
                <div className="flex items-center mt-1">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <a href={`tel:${student.phone}`} className="text-sm text-blue-600 hover:text-blue-800">
                    {student.phone}
                  </a>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <div className="flex items-center mt-1">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <a href={`mailto:${student.email}`} className="text-sm text-blue-600 hover:text-blue-800">
                    {student.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <GraduationCap className="h-6 w-6 text-indigo-600" />
              <h3 className="text-lg font-medium text-gray-900">Të Dhëna Arsimore</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Programi</label>
                <p className="mt-1 text-sm text-gray-900">{student.program}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Viti Akademik</label>
                <p className="mt-1 text-sm text-gray-900">{student.academicYear}</p>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500">Shkolla e Mëparshme</label>
                <p className="mt-1 text-sm text-gray-900">{student.previousSchool}</p>
                {student.previousSchoolAddress && (
                  <p className="text-sm text-gray-500">{student.previousSchoolAddress}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Student Avatar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="mx-auto h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-blue-600">
                {student.firstName.charAt(0)}{student.lastName.charAt(0)}
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-900">{student.firstName} {student.lastName}</h3>
            <p className="text-sm text-gray-500">{student.program}</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
              paymentStatus.color === 'green' ? 'bg-green-100 text-green-800' :
              paymentStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {paymentStatus.label}
            </span>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <CreditCard className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">Statusi i Pagesës</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Shuma Totale:</span>
                <span className="text-sm font-medium text-gray-900">
                  {student.totalAmount.toLocaleString()} ALL
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">E Paguar:</span>
                <span className="text-sm font-medium text-green-600">
                  {student.paidAmount.toLocaleString()} ALL
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">E Mbetur:</span>
                <span className="text-sm font-medium text-red-600">
                  {(student.totalAmount - student.paidAmount).toLocaleString()} ALL
                </span>
              </div>
              
              <div className="pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Progresi:</span>
                  <span className="text-sm font-medium text-blue-600">
                    {calculateProgress().toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      calculateProgress() === 100 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Veprime të Shpejta</h3>
            <div className="space-y-3">
              <Link
                to={`/students/${student.id}/edit`}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifiko të Dhënat
              </Link>
              <button
                onClick={exportToPDF}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Shkarko PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;