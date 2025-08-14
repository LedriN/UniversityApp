import React, { useState, useEffect } from 'react';
import { Download, Trash2, Upload, FileText, Calendar, User, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { Lecture } from '../types';
import LectureUpload from './LectureUpload';

interface LectureListProps {
  program: string;
  userRole: string;
}

const LectureList: React.FC<LectureListProps> = ({ program, userRole }) => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchLectures = async () => {
    try {
      setLoading(true);
      const data = await apiService.getLecturesByProgram(program);
      setLectures(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch lectures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, [program]);

  const handleUploadSuccess = (lecture: Lecture) => {
    setLectures(prev => [lecture, ...prev]);
    setShowUpload(false);
  };

  const handleDownload = async (lecture: Lecture) => {
    // Check if lecture has a PDF file
    if (!lecture.filePath || !lecture.fileName) {
      alert('This lecture does not have a PDF file to download');
      return;
    }

    try {
      setDownloadingId(lecture.id);
      const blob = await apiService.downloadLecture(lecture.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = lecture.originalFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download failed:', err);
      alert('Failed to download lecture');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (lectureId: string) => {
    if (!confirm('Are you sure you want to delete this lecture?')) {
      return;
    }

    try {
      setDeletingId(lectureId);
      await apiService.deleteLecture(lectureId);
      setLectures(prev => prev.filter(l => l.id !== lectureId));
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert('Failed to delete lecture');
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sq-AL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Leksionet - {program}
          </h2>
          <p className="text-gray-600 mt-1">
            {lectures.length} leksion{lectures.length !== 1 ? 'e' : ''} në total
          </p>
        </div>
        
        {(userRole === 'admin' || userRole === 'staff') && (
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Upload size={20} />
            Ngarko Leksion
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Lectures List */}
      {lectures.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nuk ka leksione të ngarkuara
          </h3>
          <p className="text-gray-600">
            {userRole === 'admin' || userRole === 'staff' 
              ? 'Klikoni "Ngarko Leksion" për të shtuar leksione të reja'
              : 'Leksionet do të shfaqen këtu kur të ngarkohen nga stafi'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {lectures.map((lecture) => (
            <div
              key={lecture.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="text-blue-500" size={20} />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {lecture.title}
                    </h3>
                  </div>
                  
                  {lecture.description && (
                    <p className="text-gray-600 mb-3">
                      {lecture.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{formatDate(lecture.uploadedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={16} />
                      <span>{lecture.uploadedBy.username}</span>
                    </div>
                    {lecture.fileSize && (
                      <span>{formatFileSize(lecture.fileSize)}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {lecture.filePath && lecture.fileName ? (
                    <button
                      onClick={() => handleDownload(lecture)}
                      disabled={downloadingId === lecture.id}
                      className="flex items-center gap-1 px-3 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <Download size={16} />
                      {downloadingId === lecture.id ? 'Duke shkarkuar...' : 'Shkarko'}
                    </button>
                  ) : (
                    <span className="text-sm text-gray-500 px-3 py-2">
                      Nuk ka PDF
                    </span>
                  )}
                  
                  {(userRole === 'admin' || userRole === 'staff') && (
                    <button
                      onClick={() => handleDelete(lecture.id)}
                      disabled={deletingId === lecture.id}
                      className="flex items-center gap-1 px-3 py-2 text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      {deletingId === lecture.id ? 'Duke fshirë...' : 'Fshi'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <LectureUpload
          program={program}
          onUploadSuccess={handleUploadSuccess}
          onCancel={() => setShowUpload(false)}
        />
      )}
    </div>
  );
};

export default LectureList; 