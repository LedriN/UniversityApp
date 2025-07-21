import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Calculator } from 'lucide-react';
import { apiService } from '../services/api';
import { useAsyncOperation } from '../hooks/useApi';
import { useApp } from '../context/AppContext';
import { Student } from '../types';

const StudentForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addStudent, updateStudent } = useApp();
  const isEditing = Boolean(id);
  const { loading: apiLoading, execute } = useAsyncOperation();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    parentName: '',
    gender: 'M' as 'M' | 'F',
    dateOfBirth: '',
    address: '',
    phone: '',
    email: '',
    previousSchool: '',
    previousSchoolAddress: '',
    program: '',
    academicYear: '2024-2025',
    totalAmount: 0,
    paidAmount: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);

  const programs = [
    'Shkenca Kompjuterike',
    'Ekonomi e Përgjithshme',
    'Juridik i Përgjithshëm',
    'Përkujdesje dhe Mirëqenie Sociale',
  ];

  useEffect(() => {
    if (isEditing && id) {
      const loadStudent = async () => {
        setLoading(true);
        const result = await execute(() => apiService.getStudentById(id));
        if (result) {
          setStudent(result);
          setFormData({
            firstName: result.firstName,
            lastName: result.lastName,
            parentName: result.parentName,
            gender: result.gender,
            dateOfBirth: result.dateOfBirth,
            address: result.address,
            phone: result.phone,
            email: result.email,
            previousSchool: result.previousSchool,
            previousSchoolAddress: result.previousSchoolAddress,
            program: result.program,
            academicYear: result.academicYear,
            totalAmount: result.totalAmount,
            paidAmount: result.paidAmount
          });
        }
        setLoading(false);
      };
      
      loadStudent();
    }
  }, [isEditing, id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'Emri është i detyrueshëm';
    if (!formData.lastName.trim()) newErrors.lastName = 'Mbiemri është i detyrueshëm';
    if (!formData.parentName.trim()) newErrors.parentName = 'Emri i prindit është i detyrueshëm';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Data e lindjes është e detyrueshme';
    if (!formData.address.trim()) newErrors.address = 'Adresa është e detyrueshme';
    if (!formData.phone.trim()) newErrors.phone = 'Numri i telefonit është i detyrueshëm';
    if (!formData.email.trim()) newErrors.email = 'Email-i është i detyrueshëm';
    if (!formData.program) newErrors.program = 'Programi është i detyrueshëm';
    if (formData.totalAmount <= 0) newErrors.totalAmount = 'Shuma totale duhet të jetë më e madhe se 0';
    if (formData.paidAmount < 0) newErrors.paidAmount = 'Shuma e paguar nuk mund të jetë negative';
    if (formData.paidAmount > formData.totalAmount) newErrors.paidAmount = 'Shuma e paguar nuk mund të jetë më e madhe se totali';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Format i pavlefshëm email-i';
    }

    // Phone validation
    const phoneRegex = /^(\+355|0)[0-9]{8,9}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Format i pavlefshëm i numrit të telefonit';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      if (isEditing && id) {
        await updateStudent(id, formData);
      } else {
        await addStudent(formData);
      }
      
      navigate('/students');
    } catch (error) {
      console.error('Error saving student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateDebt = () => {
    return Math.max(0, formData.totalAmount - formData.paidAmount);
  };

  const calculateProgress = () => {
    if (formData.totalAmount === 0) return 0;
    return Math.min(100, (formData.paidAmount / formData.totalAmount) * 100);
  };

  if (isEditing && loading && !student) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Duke ngarkuar të dhënat e studentit...</span>
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
          {isEditing ? 'Modifiko Studentin' : 'Shto Student të Ri'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Të Dhëna Personale</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emri *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.firstName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Shkruani emrin"
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mbiemri *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.lastName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Shkruani mbiemrin"
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emri i Prindit *
              </label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => handleInputChange('parentName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.parentName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Shkruani emrin e prindit"
              />
              {errors.parentName && <p className="mt-1 text-sm text-red-600">{errors.parentName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gjinia *
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
                Data e Lindjes *
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numri i Telefonit *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+355 69 123 4567"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresa *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.address ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Rruga, Qyteti"
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="student@email.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Education Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Të Dhëna Arsimore</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shkolla e Mëparshme
              </label>
              <input
                type="text"
                value={formData.previousSchool}
                onChange={(e) => handleInputChange('previousSchool', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Emri i shkollës së mëparshme"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresa e Shkollës së Mëparshme
              </label>
              <input
                type="text"
                value={formData.previousSchoolAddress}
                onChange={(e) => handleInputChange('previousSchoolAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Lokacioni i shkollës"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programi *
              </label>
              <select
                value={formData.program}
                onChange={(e) => handleInputChange('program', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.program ? 'border-red-300' : 'border-gray-300'
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
                Viti Akademik *
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

        {/* Financial Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Të Dhëna Financiare</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shuma Totale (€) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.totalAmount}
                onChange={(e) => handleInputChange('totalAmount', Number(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.totalAmount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.totalAmount && <p className="mt-1 text-sm text-red-600">{errors.totalAmount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shuma e Paguar (€) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                max={formData.totalAmount}
                value={formData.paidAmount}
                onChange={(e) => handleInputChange('paidAmount', Number(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.paidAmount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.paidAmount && <p className="mt-1 text-sm text-red-600">{errors.paidAmount}</p>}
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
                  <span className="text-gray-600">Progresi i pagesës:</span>
                  <span className="ml-2 font-medium text-blue-600">
                    {calculateProgress().toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Statusi:</span>
                  <span className={`ml-2 font-medium ${
                    formData.paidAmount >= formData.totalAmount ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {formData.paidAmount >= formData.totalAmount ? 'I Paguar' : 'Me Borxh'}
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
            disabled={loading || apiLoading}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {(loading || apiLoading) ? 'Duke ruajtur...' : (isEditing ? 'Ruaj Ndryshimet' : 'Shto Studentin')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;