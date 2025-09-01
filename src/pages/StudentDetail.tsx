import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Download, Phone, Mail, MapPin, Calendar, User, GraduationCap, CreditCard, Euro, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { apiService } from '../services/api';
import { useAsyncOperation } from '../hooks/useApi';
import { Student, PaymentRecord } from '../types';

const StudentDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const { loading, execute } = useAsyncOperation();

  useEffect(() => {
    if (id) {
      const loadStudent = async () => {
        const result = await execute(() => apiService.getStudentById(id));
        if (result) {
          setStudent(result);
          // Load payment records
          loadPaymentRecords(id);
        }
      };
      
      loadStudent();
    }
  }, [id]);

  const loadPaymentRecords = async (studentId: string) => {
    try {
      setLoadingPayments(true);
      const records = await apiService.getPaymentRecords(studentId);
      
      // If student has paid amount but no payment records, create a virtual initial payment record
      if (student && student.paidAmount > 0 && records.length === 0) {
        const initialPaymentRecord: PaymentRecord = {
          id: 'initial-payment',
          studentId: studentId,
          amount: student.paidAmount,
          paymentDate: student.createdAt,
          description: 'Pagesa fillestare',
          receiptNumber: 'INITIAL',
          recordedBy: {
            id: 'system',
            username: 'Sistemi'
          },
          createdAt: student.createdAt,
          updatedAt: student.createdAt,
          formattedPaymentDate: new Date(student.createdAt).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        };
        setPaymentRecords([initialPaymentRecord]);
      } else {
        setPaymentRecords(records);
      }
    } catch (error) {
      console.error('Error loading payment records:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

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

  const exportPaymentsToCSV = () => {
    if (paymentRecords.length === 0) return;

    // CSV headers
    const headers = [
      'Data e Pagesës',
      'Shuma (€)',
      'Përshkrimi',
      'Numri i Faturës',
      'Regjistruar nga',
      'Data e Regjistrimit'
    ];

    // CSV data rows
    const csvData = paymentRecords.map(record => [
      new Date(record.paymentDate).toLocaleDateString('sq-AL'),
      record.amount.toFixed(2),
      record.description || '',
      record.receiptNumber || '',
      record.recordedBy.username,
      new Date(record.createdAt).toLocaleDateString('sq-AL')
    ]);

    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pagesat_${student?.firstName}_${student?.lastName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    const pdf = new jsPDF();
    
    // Page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Add FAMA logo from local assets
    try {
      const logoPath = '/assets/logo.png'; // Local PNG image from public/assets/
      const response = await fetch(logoPath);
      const imageBlob = await response.blob();
      const imageArrayBuffer = await imageBlob.arrayBuffer();
      const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageArrayBuffer)));
      
      // Calculate logo dimensions to maintain aspect ratio (assuming 1:1 aspect ratio)
      const logoSize = 25; // Fixed size to prevent stretching
      
      // Add logo to top left
      pdf.addImage(`data:image/png;base64,${imageBase64}`, 'PNG', margin, 15, logoSize, logoSize);
      
      // Add logo to top right
      pdf.addImage(`data:image/png;base64,${imageBase64}`, 'PNG', pageWidth - margin - logoSize, 15, logoSize, logoSize);
    } catch (error) {
      console.warn('Could not load logo from local assets, using fallback:', error);
      // Fallback to simple text-based logo
      const logoBase64 = 'data:image/svg+xml;base64,' + btoa(`
        <svg width="100" height="80" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="80" fill="#f8f9fa" stroke="#000" stroke-width="1"/>
          <text x="50" y="25" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#000">FAMA</text>
          <text x="50" y="45" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="#666">INTERNATIONAL</text>
          <text x="50" y="60" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="#666">COLLEGE</text>
        </svg>
      `);
      
      // Add fallback logo on left side
      pdf.addImage(logoBase64, 'SVG', margin, 15, 25, 20);
      // Add fallback logo on right side
      pdf.addImage(logoBase64, 'SVG', pageWidth - margin - 25, 15, 25, 20);
    }
    
        // Header with college name
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    
    // College name centered
    pdf.text('KOLEGJI INTERNACIONAL FAMA', pageWidth / 2, 20, { align: 'center' });
    pdf.text('FAMA INTERNATIONAL COLLEGE', pageWidth / 2, 26, { align: 'center' });
    
    // Ministry info
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Republika e Kosovës / Ministria e Arsimit, Shkencës dhe Teknologjisë', pageWidth / 2, 34, { align: 'center' });
    pdf.text('Nr I Akreditimit (010/25)', pageWidth / 2, 40, { align: 'center' });

     pdf.setFontSize(7);
     pdf.setFont('helvetica', 'bold');
     pdf.text('Kolegji Internacional Fama', margin + 25, 50);
     pdf.setFont('helvetica', 'normal');
     pdf.text('Rruga Selajdin Mulla Abazi nr.7,', margin + 5, 56);
     pdf.text('Prishtinë', margin + 5, 61);
     pdf.text('Tel: +383 44622127', margin + 5, 66);
     pdf.text('info@fama-edu.org', margin + 5, 71);
     pdf.text('www.fama-edu.org', margin + 5, 76);
     
     // Student ID (top-right)
     pdf.setFontSize(7);
     pdf.setFont('helvetica', 'bold');
     pdf.text(`ID ${student.studentID}`, pageWidth - margin - 5, 52, { align: 'right' });
     
           // Main title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('VËRTETIM', pageWidth / 2, 85, { align: 'center' });
      
      // Student name in blue
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 255);
      pdf.text(`${student.firstName} ${student.lastName}`, pageWidth / 2, 98, { align: 'center' });
      
      let yPos = 110;
     
     // Personal Data Section
     pdf.setFontSize(12);
     pdf.setFont('helvetica', 'bold');
     pdf.setTextColor(0, 0, 0);
     pdf.text('TË DHËNA PERSONALE', margin + 10, yPos);
     
     yPos += 12;
     pdf.setFontSize(9);
     pdf.setFont('helvetica', 'normal');
     
     const addInfoRow = (label: string, value: string, x: number = margin + 10) => {
       pdf.setFont('helvetica', 'bold');
       pdf.text(label + ':', x, yPos);
       pdf.setFont('helvetica', 'normal');
       pdf.text(value, x + 50, yPos);
       yPos += 7;
     };
    
    addInfoRow('Emri i Plotë', `${student.firstName} ${student.lastName}`);
    addInfoRow('Emri i Prindit', student.parentName);
    addInfoRow('Gjinia', student.gender === 'M' ? 'Mashkull' : 'Femër');
    addInfoRow('Mosha', `${calculateAge(student.dateOfBirth)} vjeç`);
    addInfoRow('Data e Lindjes', new Date(student.dateOfBirth).toLocaleDateString('en-GB'));
    addInfoRow('Telefoni', student.phone);
    addInfoRow('Email', student.email);
    addInfoRow('Adresa', student.address);
    
         // Educational Data Section
     yPos += 8;
     pdf.setFontSize(12);
     pdf.setFont('helvetica', 'bold');
     pdf.text('TË DHËNA ARSIMORE', margin + 10, yPos);
     
     yPos += 12;
     pdf.setFontSize(9);
     pdf.setFont('helvetica', 'normal');
     
     addInfoRow('Programi', student.program);
     addInfoRow('Viti Akademik', student.academicYear);
     addInfoRow('Forma e studimeve', 'E rregullt');
     addInfoRow('Shkolla e Mëparshme', student.previousSchool);
     addInfoRow('Adresa e Shkollës', student.previousSchoolAddress || '');
     
     // Comment Section (if exists)
     if (student.comment) {
       yPos += 8;
       pdf.setFontSize(12);
       pdf.setFont('helvetica', 'bold');
       pdf.text('KOMENT', margin + 10, yPos);
       
       yPos += 12;
       pdf.setFontSize(9);
       pdf.setFont('helvetica', 'normal');
       
       // Split comment into lines if it's too long
       const maxLineLength = 80;
       const commentLines = [];
       let currentLine = '';
       
       const words = student.comment.split(' ');
       for (const word of words) {
         if ((currentLine + word).length <= maxLineLength) {
           currentLine += (currentLine ? ' ' : '') + word;
         } else {
           if (currentLine) commentLines.push(currentLine);
           currentLine = word;
         }
       }
       if (currentLine) commentLines.push(currentLine);
       
       commentLines.forEach(line => {
         pdf.text(line, margin + 10, yPos);
         yPos += 7;
       });
     }
     
     // User Credentials Section (if available)
     if (student.userCredentials) {
       yPos += 8;
       pdf.setFontSize(12);
       pdf.setFont('helvetica', 'bold');
       pdf.text('KREDENCIALET E HYRJES', margin + 10, yPos);
       
       yPos += 12;
       pdf.setFontSize(9);
       pdf.setFont('helvetica', 'normal');
       
       addInfoRow('Username', student.userCredentials.username);
       addInfoRow('Email', student.email);
     }
     
     // Footer
     yPos += 15;
     pdf.setFontSize(9);
     pdf.setFont('helvetica', 'normal');
     
     // Get current date in DD.MM.YYYY format
     const currentDate = new Date();
     const day = currentDate.getDate().toString().padStart(2, '0');
     const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
     const year = currentDate.getFullYear();
     const formattedDate = `${day}.${month}.${year}`;
     
     pdf.text('Data e lëshimit: ' + formattedDate, margin + 10, yPos);
     pdf.text('Prishtinë', pageWidth / 2, yPos, { align: 'center' });
     
     yPos += 12;
     pdf.text('Sekretari Akademik ose Dekani', pageWidth / 2, yPos, { align: 'center' });
     
     // Signature line
     yPos += 8;
     pdf.setDrawColor(0, 0, 0);
     pdf.setLineWidth(0.5);
     pdf.line(pageWidth / 2 - 50, yPos, pageWidth / 2 + 50, yPos);
    
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
          <button
            onClick={exportPaymentsToCSV}
            disabled={paymentRecords.length === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Eksporto Pagesat CSV
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

          {/* Comment Section */}
          {student.comment && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">Koment</h3>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{student.comment}</p>
              </div>
            </div>
          )}

          {/* Payment Records Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Euro className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">Historiku i Pagesave</h3>
              </div>
              <button
                onClick={exportPaymentsToCSV}
                disabled={paymentRecords.length === 0}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Eksporto CSV
              </button>
            </div>
            
            {loadingPayments ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Duke ngarkuar pagesat...</span>
              </div>
            ) : paymentRecords.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                  <Euro className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nuk ka pagesa</h3>
                <p className="text-gray-500">Nuk u gjetën pagesa për këtë student.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Shuma
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Përshkrimi
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Regjistruar nga
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paymentRecords.map((record) => (
                          <tr key={record.id} className={`hover:bg-gray-50 ${record.id === 'initial-payment' ? 'bg-blue-50' : ''}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">
                                  {new Date(record.paymentDate).toLocaleDateString('sq-AL')}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-green-600">
                                €{record.amount.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {record.description ? (
                                  <div className="flex items-start">
                                    <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="truncate max-w-xs">{record.description}</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                                {record.receiptNumber && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Fatura: {record.receiptNumber}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">{record.recordedBy.username}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Totali i pagesave:</span>
                      <span className="ml-2 font-medium text-green-600">
                        €{paymentRecords.reduce((sum, record) => sum + record.amount, 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Numri i pagesave:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {paymentRecords.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Pagesa e fundit:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {paymentRecords.length > 0 ? new Date(paymentRecords[0].paymentDate).toLocaleDateString('sq-AL') : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                  €{student.totalAmount.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">E Paguar:</span>
                <span className="text-sm font-medium text-green-600">
                  €{student.paidAmount.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">E Mbetur:</span>
                <span className="text-sm font-medium text-red-600">
                  €{(student.totalAmount - student.paidAmount).toLocaleString()}
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
              <div className='flex flex-row gap-2'>
              <button
                onClick={() => exportToPDF().catch(console.error)}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Shkarko PDF
              </button>
              <button
                onClick={() => exportToPDF().catch(console.error)}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Shkarko Kontraten
              </button>
              </div>
              <button
                onClick={exportPaymentsToCSV}
                disabled={paymentRecords.length === 0}
                className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4 mr-2" />
                Eksporto Pagesat CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;