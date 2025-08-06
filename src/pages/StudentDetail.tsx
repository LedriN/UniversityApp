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
          onClick={() => navigate('/admin/students')}
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

  const exportToPDF = async () => {
    const pdf = new jsPDF();
    
    // Professional color scheme
    const primaryColor = [31, 41, 55]; // Dark gray
    const secondaryColor = [107, 114, 128]; // Gray-500
    const accentColor = [59, 130, 246]; // Blue-600
    const lightGray = [249, 250, 251]; // Gray-50
    const borderColor = [229, 231, 235]; // Gray-200
    
    // Page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 25;
    const contentWidth = pageWidth - (margin * 2);
    
    // Professional header with gradient effect
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, pageWidth, 60, 'F');
    
    // University name in header
    pdf.setFontSize(28);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('UNIVERSITETI PRIVAT', pageWidth / 2, 30, { align: 'center' });
    
    // Subtitle
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Universiteti Fama', pageWidth / 2, 42, { align: 'center' });
    pdf.text('Rruga Selajdin Mullaabazi nr.7, Prishtinë', pageWidth / 2, 50, { align: 'center' });
    
    // Document title with elegant styling
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('KARTË E STUDENTIT', pageWidth / 2, 80, { align: 'center' });
    
    // Student name as main heading
    pdf.setFontSize(18);
    pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    pdf.text(`${student.firstName} ${student.lastName}`, pageWidth / 2, 95, { align: 'center' });
    
    // Student ID prominently displayed
    pdf.setFontSize(14);
    pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    pdf.text(`ID-ja e studentit: ${student.studentID}`, pageWidth / 2, 105, { align: 'center' });
    
    // Professional information sections
    let yPos = 120;
    
    // Personal Information Section
    pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.rect(margin, yPos, contentWidth, 100, 'F');
    pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, yPos, contentWidth, 100, 'S');
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('TË DHËNA PERSONALE', margin + 20, yPos + 20);
    
    yPos += 25;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    const addInfoRow = (label: string, value: string, x: number = margin + 20) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      pdf.text(label + ':', x, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text(value, x + 60, yPos);
      yPos += 10;
    };
    
    addInfoRow('Emri i Plotë', `${student.firstName} ${student.lastName}`);
    addInfoRow('Emri i Prindit', student.parentName);
    addInfoRow('Gjinia', student.gender === 'M' ? 'Mashkull' : 'Femër');
    addInfoRow('Mosha', `${calculateAge(student.dateOfBirth)} vjeç`);
    addInfoRow('Data e Lindjes', new Date(student.dateOfBirth).toLocaleDateString('sq-AL'));
    addInfoRow('Telefoni', student.phone);
    addInfoRow('Email', student.email);
    addInfoRow('Adresa', student.address);
    
    // Academic Information Section
    yPos += 20;
    pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.rect(margin, yPos, contentWidth, 60, 'F');
    pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    pdf.rect(margin, yPos, contentWidth, 60, 'S');
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('TË DHËNA ARSIMORE', margin + 20, yPos + 20);
    
    yPos += 25;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    addInfoRow('Programi', student.program);
    addInfoRow('Viti Akademik', student.academicYear);
    addInfoRow('Shkolla e Mëparshme', student.previousSchool);
    if (student.previousSchoolAddress) {
      addInfoRow('Adresa e Shkollës', student.previousSchoolAddress);
    }
    
    // Save the PDF
    pdf.save(`Karte_Studentit_${student.firstName}_${student.lastName}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const paymentStatus = getPaymentStatus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/students')}
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
            onClick={() => exportToPDF().catch(console.error)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Eksporto PDF
          </button>
          <Link
            to={`/admin/students/${student.id}/edit`}
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
              
              <div className="sm:col-span-2">
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
        <div className="space-y-4 lg:space-y-6">
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
                  €{(student.totalAmount / 100).toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">E Paguar:</span>
                <span className="text-sm font-medium text-green-600">
                  €{(student.paidAmount / 100).toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">E Mbetur:</span>
                <span className="text-sm font-medium text-red-600">
                  €{((student.totalAmount - student.paidAmount) / 100).toLocaleString()}
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
                to={`/admin/students/${student.id}/edit`}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifiko të Dhënat
              </Link>
              <button
                onClick={() => exportToPDF().catch(console.error)}
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