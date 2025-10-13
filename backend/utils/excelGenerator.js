const XLSX = require('xlsx');
const Student = require('../models/Student');

/**
 * Generate Excel file with all student data
 * @returns {Buffer} Excel file buffer
 */
const generateStudentsExcel = async () => {
  try {
    // Fetch all students from database
    const students = await Student.find({}).sort({ createdAt: -1 });
    
    if (students.length === 0) {
      throw new Error('No students found in database');
    }

    // Define Excel headers
    const headers = [
      'ID e Studentit',
      'Emri',
      'Mbiemri',
      'Emri i Prindit',
      'Email',
      'Telefon',
      'Gjinia',
      'Data e Lindjes',
      'Mosha',
      'Adresa',
      'Qyteti',
      'Programi',
      'Viti Akademik',
      'Shuma Totale (€)',
      'Shuma e Paguar (€)',
      'Borxhi (€)',
      'Statusi i Pagesës',
      'Shkolla e Mëparshme',
      'Adresa e Shkollës',
      'Komenti',
      'Data e Regjistrimit'
    ];

    // Convert students to Excel rows
    const excelData = [headers];

    students.forEach(student => {
      const age = calculateAge(student.dateOfBirth);
      const paymentStatus = getPaymentStatus(student);
      const debt = Math.max(0, student.totalAmount - student.paidAmount);
      
      const row = [
        student.studentID,
        student.firstName,
        student.lastName,
        student.parentName || '',
        student.email || '',
        student.phone || '',
        student.gender === 'M' ? 'Mashkull' : 'Femër',
        new Date(student.dateOfBirth).toLocaleDateString('sq-AL'),
        age.toString(),
        student.address || '',
        student.city || '',
        student.program || '',
        student.academicYear || '',
        student.totalAmount.toFixed(2),
        student.paidAmount.toFixed(2),
        debt.toFixed(2),
        paymentStatus.label,
        student.previousSchool || '',
        student.previousSchoolAddress || '',
        student.comment || '',
        new Date(student.createdAt).toLocaleDateString('sq-AL')
      ];

      excelData.push(row);
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 15 }, // Student ID
      { wch: 15 }, // First Name
      { wch: 15 }, // Last Name
      { wch: 20 }, // Parent Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 10 }, // Gender
      { wch: 12 }, // Date of Birth
      { wch: 8 },  // Age
      { wch: 30 }, // Address
      { wch: 15 }, // City
      { wch: 20 }, // Program
      { wch: 12 }, // Academic Year
      { wch: 12 }, // Total Amount
      { wch: 12 }, // Paid Amount
      { wch: 12 }, // Debt
      { wch: 15 }, // Payment Status
      { wch: 25 }, // Previous School
      { wch: 30 }, // Previous School Address
      { wch: 30 }, // Comment
      { wch: 15 }  // Registration Date
    ];
    
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Studentët');

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true
    });

    return excelBuffer;
  } catch (error) {
    console.error('Error generating Excel file:', error);
    throw error;
  }
};

/**
 * Calculate age from date of birth
 * @param {Date|string} dateOfBirth 
 * @returns {number} Age in years
 */
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  return today.getFullYear() - birthDate.getFullYear();
};

/**
 * Get payment status for a student
 * @param {Object} student 
 * @returns {Object} Payment status object
 */
const getPaymentStatus = (student) => {
  const paid = student.paidAmount;
  const total = student.totalAmount;
  if (paid >= total) return { status: 'paid', label: 'I Paguar' };
  if (paid > 0) return { status: 'partial', label: 'Pjesërisht' };
  return { status: 'unpaid', label: 'Pa Paguar' };
};

/**
 * Generate Excel filename with current date
 * @returns {string} Filename
 */
const generateExcelFilename = () => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  return `studentet_${dateStr}.xlsx`;
};

module.exports = {
  generateStudentsExcel,
  generateExcelFilename
};
