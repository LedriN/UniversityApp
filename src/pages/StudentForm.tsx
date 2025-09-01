import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Calculator, Plus, Euro } from 'lucide-react';
import { useToast } from '../components/ToastContainer';
import { apiService } from '../services/api';
import { useAsyncOperation } from '../hooks/useApi';
import { useApp } from '../context/AppContext';
import { Student, PaymentRecord } from '../types';
import PaymentRecordModal from '../components/PaymentRecordModal';
import PaymentRecordsList from '../components/PaymentRecordsList';

const StudentForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addStudent, updateStudent } = useApp();
  const { showToast } = useToast();
  const isEditing = Boolean(id);
  const { loading: apiLoading, execute } = useAsyncOperation();

  // Generate student ID in format 01/001/25 with auto-incrementing number
  const generateStudentID = async () => {
    try {
      const students = await apiService.getStudents();
      // Find the highest existing number
      let maxNumber = 0;
      
      students.forEach(student => {
        if (student.studentID && student.studentID.includes('/')) {
          const parts = student.studentID.split('/');
          if (parts.length === 3 && parts[1]) {
            const number = parseInt(parts[1], 10);
            if (!isNaN(number) && number > maxNumber) {
              maxNumber = number;
            }
          }
        }
      });
      
      // Increment and format with leading zeros
      const nextNumber = maxNumber + 1;
      const formattedNumber = nextNumber.toString().padStart(3, '0');
      const currentYear = new Date().getFullYear().toString().slice(-2);
      
      return `01/${formattedNumber}/${currentYear}`;
    } catch (error) {
      console.error('Error generating student ID:', error);
      // Fallback to current timestamp if API fails
      const timestamp = Date.now().toString().slice(-3);
      const currentYear = new Date().getFullYear().toString().slice(-2);
      return `01/${timestamp}/${currentYear}`;
    }
  };

  const [formData, setFormData] = useState({
    studentID: '',
    firstName: '',
    lastName: '',
    parentName: '',
    gender: 'M' as 'M' | 'F',
    dateOfBirth: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    previousSchool: '',
    previousSchoolAddress: '',
    program: '',
    academicYear: '2025-2026',
    totalAmount: 3000,
    paidAmount: null as number | null,
    comment: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [cities, setCities] = useState<Array<{
    id: string;
    name: string;
    nameAlbanian: string;
    region: string;
    population: number;
    isActive: boolean;
  }>>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const phoneValidationTimeoutRef = React.useRef<number | null>(null);

  const programs = [
    'Shkenca Kompjuterike',
    'Ekonomi e Pergjithshme',
    'Juridik i Pergjithshem',
    'Perkujdesje dhe Mireqenie Sociale',
  ];

  // Generate student ID when creating a new student
  useEffect(() => {
    if (!isEditing) {
      const loadStudentID = async () => {
        const newStudentID = await generateStudentID();
      setFormData(prev => ({
        ...prev,
          studentID: newStudentID
      }));
      };
      loadStudentID();
    }
  }, [isEditing]);

  // Load cities
  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoadingCities(true);
        const citiesData = await apiService.getCities();
        setCities(citiesData);
      } catch (error) {
        console.error('Error loading cities:', error);
      } finally {
        setLoadingCities(false);
      }
    };
    
    loadCities();
  }, []);

  // Trigger validation when form data changes to update submit button state
  useEffect(() => {
    // This will force a re-render of the submit button when form data changes
    // The actual validation is handled in handleInputChange and validateForm
  }, [formData, errors]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (phoneValidationTimeoutRef.current) {
        clearTimeout(phoneValidationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      const loadStudent = async () => {
        setLoading(true);
        const result = await execute(() => apiService.getStudentById(id));
        if (result) {
          setStudent(result);
          setFormData({
            studentID: result.studentID || '',
            firstName: result.firstName,
            lastName: result.lastName,
            parentName: result.parentName,
            gender: result.gender,
            dateOfBirth: result.dateOfBirth,
            address: result.address,
            city: result.city || '',
            phone: result.phone,
            email: result.email,
            previousSchool: result.previousSchool,
            previousSchoolAddress: result.previousSchoolAddress,
            program: result.program,
            academicYear: result.academicYear,
            totalAmount: result.totalAmount,
            paidAmount: result.paidAmount,
            comment: result.comment || ''
          });
          
          // Load payment records
          loadPaymentRecords(id);
        }
        setLoading(false);
      };
      
      loadStudent();
    }
  }, [isEditing, id]);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

         // Required field validations
     if (!formData.studentID.trim()) newErrors.studentID = 'ID-ja e studentit është e detyrueshme';
     if (!formData.firstName.trim()) newErrors.firstName = 'Emri është i detyrueshëm';
     if (!formData.lastName.trim()) newErrors.lastName = 'Mbiemri është i detyrueshëm';
     if (!formData.parentName.trim()) newErrors.parentName = 'Emri i prindit është i detyrueshëm';
     if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Data e lindjes është e detyrueshme';
     if (!formData.address.trim()) newErrors.address = 'Adresa është e detyrueshme';
     if (!formData.city.trim()) newErrors.city = 'Qyteti është i detyrueshëm';
     if (!formData.phone.trim()) newErrors.phone = 'Numri i telefonit është i detyrueshëm';
     if (!formData.email.trim()) newErrors.email = 'Email-i është i detyrueshëm';
     if (!formData.program || formData.program === '' || formData.program === 'Zgjidh programin') newErrors.program = 'Zgjedh programin';
    
    // Financial validations
    if (formData.totalAmount <= 0) newErrors.totalAmount = 'Shuma totale duhet të jetë më e madhe se 0';
     if (formData.paidAmount === null) newErrors.paidAmount = 'Shuma e paguar është e detyrueshme';
     if (formData.paidAmount !== null && formData.paidAmount < 0) newErrors.paidAmount = 'Shuma e paguar nuk mund të jetë negative';
     if (formData.paidAmount !== null && formData.paidAmount > formData.totalAmount) newErrors.paidAmount = 'Shuma e paguar nuk mund të jetë më e madhe se totali';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Format i pavlefshëm email-i';
    }

    // Phone validation - allow any format with numbers and +
    const phoneRegex = /^[\d+\s\-()]+$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Numri i telefonit mund të përmbajë vetëm numra, +, hapësira, vizat dhe kllapa';
    }

    // Date validation
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      
      // Calculate age more accurately
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (birthDate > today) {
        newErrors.dateOfBirth = 'Data e lindjes nuk mund të jetë në të ardhmen';
      } else if (age < 17) {
        newErrors.dateOfBirth = 'Studenti duhet të jetë së paku 17 vjeç për t\'u regjistruar';
      }
    }

    // Student ID validation
    if (formData.studentID && !/^\d{2}\/\d{3}\/\d{2}$/.test(formData.studentID)) {
      newErrors.studentID = 'ID-ja e studentit duhet të ketë formatin XX/XXX/XX';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkForDuplicates = async () => {
    if (!formData.email.trim() && !formData.phone.trim()) return true;
    
    setCheckingDuplicates(true);
    try {
      const students = await apiService.getStudents();
      const newErrors: Record<string, string> = { ...errors };
      
      // Check for duplicate email
      if (formData.email.trim()) {
        const existingEmail = students.find(s => 
          s.email.toLowerCase() === formData.email.toLowerCase() && 
          (!isEditing || s.id !== id)
        );
        if (existingEmail) {
          newErrors.email = 'Email-i tashme ekziston ne sistem, ju lutem provoni me nje email tjeter';
        } else {
          delete newErrors.email;
        }
      }
      
      // Check for duplicate phone
      if (formData.phone.trim()) {
        const existingPhone = students.find(s => 
          s.phone === formData.phone && 
          (!isEditing || s.id !== id)
        );
        if (existingPhone) {
          newErrors.phone = 'Numri i telefonit tashme ekziston ne sistem';
        } else {
          delete newErrors.phone;
        }
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return true; // Allow submission if check fails
    } finally {
      setCheckingDuplicates(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;



    // Check for duplicates before submitting
    if (!isEditing) {
      const noDuplicates = await checkForDuplicates();
      if (!noDuplicates) return;
    }

    try {
      setLoading(true);
      if (isEditing && id) {
         await updateStudent(id, {
           ...formData,
           paidAmount: formData.paidAmount ?? 0
         });
        showToast({
          type: 'success',
          title: 'Sukses!',
          message: 'Studenti u perditesua me sukses!',
          duration: 4000
        });
        navigate('/students');
      } else {
        // Create student directly through API service to get the response
        const newStudent = await apiService.createStudent({
          ...formData,
          paidAmount: formData.paidAmount ?? 0
        });
        
        // Add to context state
        addStudent({
          ...formData,
          paidAmount: formData.paidAmount ?? 0
        });
        
        // If student has an initial payment, create a payment record
        if (newStudent && formData.paidAmount && formData.paidAmount > 0) {
          try {
            await apiService.addPaymentRecord({
              studentId: newStudent.id,
              amount: formData.paidAmount,
              paymentDate: new Date().toISOString(),
              description: 'Pagesa fillestare',
              receiptNumber: 'INITIAL'
            });
          } catch (error) {
            console.error('Error creating initial payment record:', error);
            // Don't fail the student creation if payment record creation fails
          }
        }
        
        // Show success toast with login credentials for new students
        const username = `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}`;
        showToast({
          type: 'success',
          title: 'Studenti u shtua me sukses!',
          message: (
            <div className="space-y-1">
              <div><strong>🆔 Student ID:</strong> {formData.studentID}</div>
              <div><strong>👤 Username:</strong> {username}</div>
              <div><strong>📧 Email:</strong> {formData.email}</div>
              {formData.paidAmount && formData.paidAmount > 0 && (
                <div className="text-green-600 font-medium">
                  ✅ Pagesa fillestare prej €{formData.paidAmount.toLocaleString()} u regjistrua në historik
                </div>
              )}
              <div className="text-green-600 font-medium">
                ✅ Fjalekalimi u gjenerua dhe u dergua ne email-in e studentit.
              </div>
              <div className="text-orange-600 text-sm">
                💡 Kontrolloni email-in e studentit per kredencialet e hyrjes.
              </div>
            </div>
          ),
          duration: 6000
        });
        
        // Delay navigation to allow toast to be seen
        setTimeout(() => {
          navigate('/students');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error saving student:', error);
      console.error('Error response:', error.response?.data);
      
      // Handle field-specific errors from backend
      if (error.response?.data?.field) {
        const field = error.response.data.field;
        const message = error.response.data.message;
        setErrors(prev => ({ ...prev, [field]: message }));
        
        showToast({
          type: 'error',
          title: 'Gabim!',
          message: message,
          duration: 5000
        });
      } else if (error.response?.data?.errors) {
        // Handle validation errors array
        const validationErrors = error.response.data.errors;
        console.error('Validation errors:', validationErrors);
        
        const newErrors: Record<string, string> = {};
        validationErrors.forEach((err: any) => {
          if (err.path) {
            newErrors[err.path] = err.msg;
          }
        });
        
        setErrors(newErrors);
        
        showToast({
          type: 'error',
          title: 'Gabim!',
          message: 'Ju lutemi korrigjoni gabimet e mëposhtme',
          duration: 5000
        });
      } else {
        // Handle general errors
        const errorMessage = error.response?.data?.message || 'Gabim gjate ruajtjes se studentit. Ju lutemi provoni perseri.';
        showToast({
          type: 'error',
          title: 'Gabim!',
          message: errorMessage,
          duration: 5000
        });
      }
    } finally {
      setLoading(false);
    }
  };

     const handleInputChange = (field: string, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
     
     // Clear error for this field immediately
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Real-time validation for specific fields
    if (field === 'program') {
      const newErrors = { ...errors };
      if (!value || value === '' || value === 'Zgjidh programin') {
        newErrors.program = 'Zgjedh programin';
      } else {
        delete newErrors.program;
      }
      setErrors(newErrors);
    }
    
    // Real-time validation for city
    if (field === 'city') {
      const newErrors = { ...errors };
      if (!value || value === '' || value === 'Zgjidh qytetin') {
        newErrors.city = 'Zgjedh qytetin';
      } else {
        delete newErrors.city;
      }
      setErrors(newErrors);
    }
    
    // Real-time validation for date of birth
    if (field === 'dateOfBirth' && value) {
      const birthDate = new Date(value as string);
      const today = new Date();
      
      // Calculate age more accurately
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      const newErrors = { ...errors };
      if (birthDate > today) {
        newErrors.dateOfBirth = 'Data e lindjes nuk mund të jetë në të ardhmen';
      } else if (age < 17) {
        newErrors.dateOfBirth = 'Studenti duhet të jetë së paku 17 vjeç për t\'u regjistruar';
      } else {
        delete newErrors.dateOfBirth;
      }
      setErrors(newErrors);
    }
    
    // Real-time validation for paid amount
    if (field === 'paidAmount') {
      const newErrors = { ...errors };
      if (value === null) {
        newErrors.paidAmount = 'Shuma e paguar është e detyrueshme';
      } else if (typeof value === 'number' && value < 0) {
        newErrors.paidAmount = 'Shuma e paguar nuk mund të jetë negative';
      } else if (typeof value === 'number' && value > formData.totalAmount) {
        newErrors.paidAmount = 'Shuma e paguar nuk mund të jetë më e madhe se totali';
      } else {
        delete newErrors.paidAmount;
      }
      setErrors(newErrors);
    }
    
    // Real-time validation for total amount
    if (field === 'totalAmount') {
      const newErrors = { ...errors };
      if (typeof value === 'number' && value <= 0) {
        newErrors.totalAmount = 'Shuma totale duhet të jetë më e madhe se 0';
      } else {
        delete newErrors.totalAmount;
      }
      setErrors(newErrors);
    }
    
    // Debounced validation for phone number
    if (field === 'phone') {
      // Clear any existing phone error immediately when user starts typing
      if (errors.phone) {
        setErrors(prev => ({ ...prev, phone: '' }));
      }
      
      // Clear existing timeout
      if (phoneValidationTimeoutRef.current) {
        clearTimeout(phoneValidationTimeoutRef.current);
      }
      
      // Set up debounced validation
      phoneValidationTimeoutRef.current = setTimeout(() => {
        if (value && typeof value === 'string') {
          const phoneRegex = /^[\d+\s\-()]+$/;
          if (!phoneRegex.test(value)) {
            setErrors(prev => ({ ...prev, phone: 'Numri i telefonit mund të përmbajë vetëm numra, +, hapësira, vizat dhe kllapa' }));
          }
        }
      }, 3000); // 3 seconds delay
    }
  };

  // Handle phone number input - allow any format with numbers and +
  const handlePhoneChange = (value: string) => {
    // Allow only numbers, +, spaces, dashes, and parentheses
    const cleanedValue = value.replace(/[^\d+\s\-()]/g, '');
    
    handleInputChange('phone', cleanedValue);
    debouncedDuplicateCheck('phone', cleanedValue);
  };

  // Handle name input - auto-capitalize first letter of each word
  const handleNameChange = (field: 'firstName' | 'lastName' | 'parentName', value: string) => {
    // Capitalize first letter of each word
    const capitalizedValue = value
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    handleInputChange(field, capitalizedValue);
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    const requiredFields = [
      'studentID', 'firstName', 'lastName', 'parentName', 
      'dateOfBirth', 'address', 'city', 'phone', 'email', 'program'
    ];
    
    // Check required fields
    const requiredFieldsValid = requiredFields.every(field => {
      const value = formData[field as keyof typeof formData];
      if (typeof value === 'string') {
        return value.trim() !== '';
      }
      return value !== null && value !== undefined;
    });
    
    // Check financial fields
    const financialFieldsValid = 
    formData.totalAmount > 0 && 
      formData.paidAmount !== null && 
    formData.paidAmount >= 0 && 
      formData.paidAmount <= formData.totalAmount;
    
    // Check if there are any current validation errors
    const noValidationErrors = Object.keys(errors).length === 0;
    
    return requiredFieldsValid && financialFieldsValid && noValidationErrors;
  };

  // Debounced duplicate check for email and phone
  const debouncedDuplicateCheck = React.useCallback(
    React.useMemo(() => {
      let timeoutId: number;
      return (field: 'email' | 'phone', value: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (!value.trim() || isEditing) return;
          
          try {
            const students = await apiService.getStudents();
            const newErrors = { ...errors };
            
            if (field === 'email') {
              const existingEmail = students.find(s => 
                s.email.toLowerCase() === value.toLowerCase() && 
                (!isEditing || s.id !== id)
              );
              if (existingEmail) {
                newErrors.email = 'Email-i tashme ekziston ne sistem, ju lutem provoni me nje email tjeter';
              } else {
                delete newErrors.email;
              }
            } else if (field === 'phone') {
              const existingPhone = students.find(s => 
                s.phone === value && 
                (!isEditing || s.id !== id)
              );
              if (existingPhone) {
                newErrors.phone = 'Numri i telefonit tashme ekziston ne sistem';
              } else {
                delete newErrors.phone;
              }
            }
            
            setErrors(newErrors);
          } catch (error) {
            console.error('Error checking duplicates:', error);
          }
        }, 500);
      };
    }, [errors, isEditing, id]),
    [errors, isEditing, id]
  );

  const calculateDebt = () => {
     const paidAmount = formData.paidAmount ?? 0;
     return Math.max(0, formData.totalAmount - paidAmount);
  };

  const calculateProgress = () => {
    if (formData.totalAmount === 0) return 0;
     const paidAmount = formData.paidAmount ?? 0;
     return Math.min(100, (paidAmount / formData.totalAmount) * 100);
  };

  // Helper function to get field validation status
  const getFieldStatus = (fieldName: string) => {
    const hasError = errors[fieldName];
    const hasValue = formData[fieldName as keyof typeof formData];
    
    if (hasError) return 'error';
    if (hasValue && typeof hasValue === 'string' && hasValue.trim() !== '') return 'success';
    if (hasValue && typeof hasValue === 'number' && hasValue > 0) return 'success';
    return 'default';
  };

  // Helper function to get field border color
  const getFieldBorderColor = (fieldName: string) => {
    const status = getFieldStatus(fieldName);
    switch (status) {
      case 'error': return 'border-red-300 focus:border-red-500 focus:ring-red-500';
      default: return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    }
  };

  // Helper function to get field label for error messages
  const getFieldLabel = (fieldName: string) => {
    const labels: Record<string, string> = {
      studentID: 'ID e Studentit',
      firstName: 'Emri',
      lastName: 'Mbiemri',
      parentName: 'Emri i Prindit',
      dateOfBirth: 'Data e Lindjes',
      address: 'Adresa',
      phone: 'Numri i Telefonit',
      email: 'Email',
      program: 'Programi',
      totalAmount: 'Shuma Totale',
      paidAmount: 'Shuma e Paguar',
      comment: 'Koment'
    };
    return labels[fieldName] || fieldName;
  };

  const handleAddPaymentRecord = async (paymentData: {
    amount: number;
    paymentDate: string;
    description?: string;
    receiptNumber?: string;
  }) => {
    if (!id) return;
    
    try {
      const newRecord = await apiService.addPaymentRecord({
        studentId: id,
        ...paymentData
      });
      
      // Add to local state
      setPaymentRecords(prev => [newRecord, ...prev]);
      
      // Update student's paid amount
      setFormData(prev => ({
        ...prev,
         paidAmount: (prev.paidAmount ?? 0) + paymentData.amount
      }));
      
      // Update student state
      if (student) {
        setStudent(prev => prev ? {
          ...prev,
          paidAmount: prev.paidAmount + paymentData.amount
        } : null);
      }
      
      showToast({
        type: 'success',
        title: 'Sukses!',
        message: `Pagesa prej €${paymentData.amount.toLocaleString()} u shtua me sukses!`,
        duration: 4000
      });
    } catch (error: any) {
      console.error('Error adding payment record:', error);
      showToast({
        type: 'error',
        title: 'Gabim!',
        message: error.response?.data?.message || 'Gabim gjate shtimit te pageses',
        duration: 5000
      });
    }
  };

  const handleDeletePaymentRecord = async (recordId: string) => {
    // Don't allow deletion of initial payment record
    if (recordId === 'initial-payment') {
      showToast({
        type: 'error',
        title: 'Gabim!',
        message: 'Pagesa fillestare nuk mund të fshihet',
        duration: 4000
      });
      return;
    }

    try {
      await apiService.deletePaymentRecord(recordId);
      
      // Remove from local state
      const deletedRecord = paymentRecords.find(record => record.id === recordId);
      setPaymentRecords(prev => prev.filter(record => record.id !== recordId));
      
      if (deletedRecord) {
        // Update student's paid amount
        setFormData(prev => ({
          ...prev,
           paidAmount: Math.max(0, (prev.paidAmount ?? 0) - deletedRecord.amount)
        }));
        
        // Update student state
        if (student) {
          setStudent(prev => prev ? {
            ...prev,
            paidAmount: Math.max(0, prev.paidAmount - deletedRecord.amount)
          } : null);
        }
      }
      
      showToast({
        type: 'success',
        title: 'Sukses!',
        message: 'Pagesa u fshi me sukses!',
        duration: 4000
      });
    } catch (error: any) {
      console.error('Error deleting payment record:', error);
      showToast({
        type: 'error',
        title: 'Gabim!',
        message: error.response?.data?.message || 'Gabim gjate fshirjes se pageses',
        duration: 5000
      });
    }
  };

  if (isEditing && loading && !student) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Duke ngarkuar te dhenat e studentit...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/students')}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Modifiko Studentin' : 'Shto Student te Ri'}
        </h1>
      </div>

             {/* Information Note */}
       {!isEditing && (
         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
           <div className="flex items-start">
             <div className="flex-shrink-0">
               <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
               </svg>
             </div>
             <div className="ml-3">
               <h3 className="text-sm font-medium text-blue-800">
                 Automatike: Krijimi i llogarisë së përdoruesit
               </h3>
               <div className="mt-2 text-sm text-blue-700">
                 <p>Kur krijoni një student të ri, do të krijohet automatikisht një llogari përdoruesi dhe fjalëkalimi do të dërgohet në email-in e studentit.</p>
                 <p className="mt-1"><strong>Shënim:</strong> Email-i dhe numri i telefonit duhet të jenë unike në sistem.</p>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Validation Summary */}
       {Object.keys(errors).length > 0 && (
         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
           <div className="flex items-start">
             <div className="flex-shrink-0">
               <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
               </svg>
             </div>
             <div className="ml-3">
               <h3 className="text-sm font-medium text-red-800">
                 Ju lutemi korrigjoni gabimet e mëposhtme:
               </h3>
               <div className="mt-2 text-sm text-red-700">
                 <ul className="list-disc list-inside space-y-1">
                   {Object.entries(errors).map(([field, error]) => (
                     <li key={field}>
                       <span className="font-medium">{getFieldLabel(field)}:</span> {error}
                     </li>
                   ))}
                 </ul>
               </div>
             </div>
           </div>
         </div>
       )}
       <form onSubmit={handleSubmit} className="space-y-8">
         {/* Student ID */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
           <h3 className="text-lg font-medium text-gray-900 mb-6">ID e Studentit</h3>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Student ID <span className="text-red-500">*</span>
               </label>
               <input
                 type="text"
                 value={formData.studentID}
                 onChange={(e) => handleInputChange('studentID', e.target.value)}
                 className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                   getFieldBorderColor('studentID')
                 } ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                 placeholder="01/001/25"
                 readOnly={!isEditing}
                 maxLength={9}
               />
               {errors.studentID && <p className="mt-1 text-sm text-red-600">{errors.studentID}</p>}
               {!isEditing && (
                 <p className="mt-1 text-sm text-gray-500">ID-ja gjenerohet automatikisht</p>
               )}
             </div>
           </div>
         </div>

         {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Te Dhena Personale</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emri <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleNameChange('firstName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldBorderColor('firstName')
                }`}
                placeholder="Shkruani emrin"
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mbiemri <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleNameChange('lastName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldBorderColor('lastName')
                }`}
                placeholder="Shkruani mbiemrin"
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emri i Prindit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => handleNameChange('parentName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldBorderColor('parentName')
                }`}
                placeholder="Shkruani emrin e prindit"
              />
              {errors.parentName && <p className="mt-1 text-sm text-red-600">{errors.parentName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gjinia <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value as 'M' | 'F')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="M">Mashkull</option>
                <option value="F">Femër</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data e Lindjes <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldBorderColor('dateOfBirth')
                }`}
              />
              {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numri i Telefonit <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldBorderColor('phone')
                }`}
                placeholder="+355 44 123 456"
                maxLength={20}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                             <p className="mt-1 text-xs text-gray-500">Shkruani numrin e telefonit në çdo format të dëshiruar</p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldBorderColor('address')
                }`}
                placeholder="Rruga, Qyteti"
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qyteti <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldBorderColor('city')
                }`}
                disabled={loadingCities}
              >
                <option value="">Zgjidh qytetin</option>
                {cities.map(city => (
                  <option key={city.id} value={city.nameAlbanian}>
                    {city.nameAlbanian} ({city.region})
                  </option>
                ))}
              </select>
              {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
              {loadingCities && <p className="mt-1 text-sm text-gray-500">Duke ngarkuar qytetet...</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  handleInputChange('email', e.target.value);
                  debouncedDuplicateCheck('email', e.target.value);
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldBorderColor('email')
                }`}
                placeholder="student@email.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Education Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Te Dhena Arsimore</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shkolla e Meparshme
              </label>
              <input
                type="text"
                value={formData.previousSchool}
                onChange={(e) => handleInputChange('previousSchool', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Emri i shkolles se meparshme"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresa e Shkolles se Meparshme
              </label>
              <input
                type="text"
                value={formData.previousSchoolAddress}
                onChange={(e) => handleInputChange('previousSchoolAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Lokacioni i shkolles"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programi <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.program}
                onChange={(e) => handleInputChange('program', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldBorderColor('program')
                }`}
              >
                <option value="">Zgjidh programin</option>
                {programs.map(program => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>
              {errors.program && <p className="mt-1 text-sm text-red-600">{errors.program}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Viti Akademik <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.academicYear}
                onChange={(e) => handleInputChange('academicYear', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
                <option value="2027-2028">2027-2028</option>
              </select>
            </div>
          </div>
        </div>

        {/* Comment Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Koment</h3>
          
          <div className="grid grid-cols-1 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Koment (Opsional)
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Shkruani një koment për këtë student (opsional)..."
                rows={4}
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Maksimum 1000 karaktere
                </p>
                <p className="text-xs text-gray-500">
                  {formData.comment.length}/1000
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Te Dhena Financiare</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shuma Totale (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.totalAmount}
                onChange={(e) => handleInputChange('totalAmount', Number(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldBorderColor('totalAmount')
                }`}
                placeholder="3000"
              />
              {errors.totalAmount && <p className="mt-1 text-sm text-red-600">{errors.totalAmount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shuma e Paguar (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                max={formData.totalAmount}
                 value={formData.paidAmount ?? ''}
                 onChange={(e) => {
                   const value = e.target.value;
                   handleInputChange('paidAmount', value === '' ? null : Number(value));
                 }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldBorderColor('paidAmount')
                }`}
                 placeholder="Shkruani shumën e paguar"
                readOnly={isEditing}
              />
              {errors.paidAmount && <p className="mt-1 text-sm text-red-600">{errors.paidAmount}</p>}
              {isEditing && (
                <p className="mt-1 text-sm text-gray-500">Shuma e paguar perditesohet automatikisht me pagesat</p>
              )}
            </div>
          </div>

          {formData.totalAmount > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calculator className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Llogaritje Automatike</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                                  <span className="text-gray-600">Borxhi i mbetur:</span>
                <span className="ml-2 font-medium text-red-600">
                  €{calculateDebt().toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Progresi i pageses:</span>
                <span className="ml-2 font-medium text-blue-600">
                  {calculateProgress().toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">Statusi:</span>
                <span className={`ml-2 font-medium ${
                   (formData.paidAmount ?? 0) >= formData.totalAmount ? 'text-green-600' : 'text-orange-600'
                }`}>
                   {(formData.paidAmount ?? 0) >= formData.totalAmount ? 'I Paguar' : 'Me Borxh'}
                </span>
              </div>
              </div>

              {formData.totalAmount > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        calculateProgress() === 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Records Section - Only show when editing */}
          {isEditing && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">Historiku i Pagesave</h4>
                {calculateDebt() > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(true)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Shto Pagese
                  </button>
                )}
              </div>
              
              <PaymentRecordsList
                paymentRecords={paymentRecords}
                onDeleteRecord={handleDeletePaymentRecord}
                loading={loadingPayments}
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/students')}
            className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Anulo
          </button>
          <button
            type="submit"
            disabled={loading || apiLoading || checkingDuplicates || !isFormValid()}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {checkingDuplicates ? 'Duke kontrolluar...' : (loading || apiLoading) ? 'Duke ruajtur...' : (isEditing ? 'Ruaj Ndryshimet' : 'Shto Studentin')}
          </button>
        </div>
      </form>

      {/* Payment Record Modal */}
      {isEditing && (
        <PaymentRecordModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSubmit={handleAddPaymentRecord}
          studentName={`${formData.firstName} ${formData.lastName}`}
          remainingDebt={calculateDebt()}
          loading={loading}
        />
      )}
    </div>
  );
};

export default StudentForm;