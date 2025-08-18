import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, BookOpen, Search, Filter } from 'lucide-react';
import { useToast } from './ToastContainer';
import { apiService } from '../services/api';
import { Subject } from '../types';
import ConfirmModal from './ConfirmModal';

interface SubjectListProps {
  program: string;
  userRole?: string;
}

interface SubjectFormData {
  name: string;
  description: string;
  credits: number;
  semester: number;
}

const SubjectList: React.FC<SubjectListProps> = ({ program, userRole }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    subject: Subject | null;
  }>({
    isOpen: false,
    subject: null
  });

  const { showToast } = useToast();

  const [formData, setFormData] = useState<SubjectFormData>({
    name: '',
    description: '',
    credits: 6,
    semester: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load subjects
  useEffect(() => {
    loadSubjects();
  }, [program]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await apiService.getSubjects(program);
      setSubjects(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
      showToast({
        type: 'error',
        title: 'Gabim!',
        message: 'Gabim gjate ngarkimit te lendes',
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter subjects
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSemester = selectedSemester === 'all' || subject.semester.toString() === selectedSemester;
    return matchesSearch && matchesSemester;
  });

  // Group subjects by semester
  const subjectsBySemester = filteredSubjects.reduce((acc, subject) => {
    if (!acc[subject.semester]) {
      acc[subject.semester] = [];
    }
    acc[subject.semester].push(subject);
    return acc;
  }, {} as Record<number, Subject[]>);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Emri i lendes eshte i detyrueshem';
    }

    if (formData.credits < 1 || formData.credits > 30) {
      newErrors.credits = 'Kredite duhet te jene mes 1 dhe 30';
    }

    if (formData.semester < 1 || formData.semester > 8) {
      newErrors.semester = 'Semestri duhet te jete mes 1 dhe 8';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (editingSubject) {
        await apiService.updateSubject(editingSubject.id, {
          ...formData,
          program
        });
        showToast({
          type: 'success',
          title: 'Sukses!',
          message: 'Lenda u perditesua me sukses!',
          duration: 4000
        });
      } else {
        await apiService.addSubject({
          ...formData,
          program
        });
        showToast({
          type: 'success',
          title: 'Sukses!',
          message: 'Lenda u shtua me sukses!',
          duration: 4000
        });
      }

      setShowAddModal(false);
      setEditingSubject(null);
      resetForm();
      loadSubjects();
    } catch (error: any) {
      console.error('Error saving subject:', error);
      showToast({
        type: 'error',
        title: 'Gabim!',
        message: error.response?.data?.message || 'Gabim gjate ruajtjes se lendes',
        duration: 5000
      });
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description || '',
      credits: subject.credits,
      semester: subject.semester
    });
    setShowAddModal(true);
  };

  const handleDeleteClick = (subject: Subject) => {
    setConfirmModal({
      isOpen: true,
      subject
    });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmModal.subject) return;
    // Use id or _id for deletion
    const subjectId = confirmModal.subject.id || (confirmModal.subject as any)._id;
    if (!subjectId || subjectId === 'undefined') {
      showToast({
        type: 'error',
        title: 'Gabim!',
        message: 'ID e lendes mungon ose eshte e pavlefshme!',
        duration: 4000
      });
      console.error('Subject delete failed: invalid id', confirmModal.subject);
      setConfirmModal({ isOpen: false, subject: null });
      return;
    }
    try {
      await apiService.deleteSubject(subjectId);
      showToast({
        type: 'success',
        title: 'Sukses!',
        message: `Lenda "${confirmModal.subject.name}" u fshi me sukses!`,
        duration: 4000
      });
      loadSubjects();
      setConfirmModal({ isOpen: false, subject: null });
    } catch (error: any) {
      console.error('Error deleting subject:', error);
      showToast({
        type: 'error',
        title: 'Gabim!',
        message: error.response?.data?.message || 'Gabim gjate fshirjes se lendes',
        duration: 5000
      });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmModal({ isOpen: false, subject: null });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      credits: 6,
      semester: 1
    });
    setErrors({});
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingSubject(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Duke ngarkuar lendet...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lendet e {program}</h2>
          <p className="text-gray-600">Menaxhoni lendet e departamentit</p>
        </div>
        {userRole === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Shto Lende
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Kerko lendet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Te gjitha semestrat</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(semester => (
                <option key={semester} value={semester.toString()}>
                  Semestri {semester}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subjects List */}
      {Object.keys(subjectsBySemester).length > 0 ? (
        <div className="space-y-6">
          {Object.keys(subjectsBySemester)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(semester => (
              <div key={semester} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Semestri {semester} ({subjectsBySemester[parseInt(semester)].length} lende)
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {subjectsBySemester[parseInt(semester)].map((subject) => (
                    <div key={subject.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{subject.name}</h4>
                            {subject.description && (
                              <p className="text-sm text-gray-500 mt-1">{subject.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{subject.credits} kredite</span>
                              <span>•</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                subject.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {subject.isActive ? 'Aktive' : 'Jo aktive'}
                              </span>
                            </div>
                          </div>
                        </div>
                        {userRole === 'admin' && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(subject)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edito lenden"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(subject)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Fshi lenden"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm || selectedSemester !== 'all' ? 'Nuk u gjeten lende' : 'Nuk ka lende ne kete departament'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedSemester !== 'all' 
              ? 'Provo te ndryshosh kriteret e kerkes.' 
              : 'Lendet do te shfaqen ketu kur te shtohen.'
            }
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSubject ? 'Edito Lenden' : 'Shto Lende te Re'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emri i Lendes <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Shkruani emrin e lendes"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pershkrimi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Pershkrimi i lendes (opsional)"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kredite <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.credits}
                      onChange={(e) => setFormData(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.credits ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.credits && <p className="mt-1 text-sm text-red-600">{errors.credits}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semestri <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData(prev => ({ ...prev, semester: parseInt(e.target.value) }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.semester ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(semester => (
                        <option key={semester} value={semester}>
                          Semestri {semester}
                        </option>
                      ))}
                    </select>
                    {errors.semester && <p className="mt-1 text-sm text-red-600">{errors.semester}</p>}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Anulo
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    {editingSubject ? 'Ruaj Ndryshimet' : 'Shto Lenden'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Fshi Lenden"
        message={`A jeni të sigurt që dëshironi të fshini lendën "${confirmModal.subject?.name}"? Ky veprim nuk mund të anulohet.`}
        confirmText="Fshi"
        cancelText="Anulo"
        type="danger"
        loading={false}
      />
    </div>
  );
};

export default SubjectList;
