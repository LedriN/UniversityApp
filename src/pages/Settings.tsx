import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import { useAsyncOperation } from '../hooks/useApi';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ToastContainer';
import DeleteModal from '../components/DeleteModal';

const Settings: React.FC = () => {
  const { users, currentUser, addUser, deleteUser } = useApp();
  const { showToast } = useToast();
  const [showAddUser, setShowAddUser] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const { loading, execute } = useAsyncOperation();
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'student' as 'admin' | 'staff' | 'student'
  });

  const usersPerPage = 10;
  const totalPages = Math.ceil(users.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  // Reset to first page when users change
  useEffect(() => {
    setCurrentPage(1);
  }, [users.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await execute(() => addUser(formData));
      if (result) {
        showToast({
          type: 'success',
          title: 'Sukses!',
          message: 'Përdoruesi u krijua me sukses! Kredencialet u dërguan në email.',
          duration: 5000
        });
        setFormData({ username: '', email: '', role: 'student' });
        setShowAddUser(false);
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.message || 'Gabim gjatë krijimit të përdoruesit';
      showToast({
        type: 'error',
        title: 'Gabim!',
        message: errorMessage,
        duration: 5000
      });
    }
  };

  const handleDeleteClick = (user: any) => {
    console.log('User to delete:', user); // Debug log
    if (!user.id) {
      console.error('User ID is undefined:', user);
      showToast({
        type: 'error',
        title: 'Gabim!',
        message: 'ID-ja e përdoruesit nuk u gjet',
        duration: 5000
      });
      return;
    }
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      await execute(() => deleteUser(userToDelete.id));
      showToast({
        type: 'success',
        title: 'Sukses!',
        message: 'Përdoruesi u fshi me sukses!',
        duration: 3000
      });
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.message || 'Gabim gjatë fshirjes së përdoruesit';
      showToast({
        type: 'error',
        title: 'Gabim!',
        message: errorMessage,
        duration: 5000
      });
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <>
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cilësimet</h1>
        <p className="mt-2 text-gray-600">Menaxho përdoruesit dhe cilësimet e sistemit</p>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Menaxhimi i Përdoruesve</h3>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAddUser(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Shto Përdorues
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {!isAdmin && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-yellow-600 mr-3" />
                <p className="text-sm text-yellow-800">
                  Vetëm administratorët mund të menaxhojnë përdoruesit
                </p>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Përdoruesi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roli
                  </th>
                  
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Krijuar më

                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Veprimet
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 4 : 3} className="px-6 py-4 text-center text-sm text-gray-500">
                      {isAdmin ? 'Nuk ka përdorues' : 'Nuk keni qasje për të parë përdoruesit'}
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : user.role === 'staff'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'admin' ? 'Administrator' : user.role === 'staff' ? 'Staf' : 'Student'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('sq-AL')}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        <button
                          onClick={() => handleDeleteClick(user)}
                          disabled={user.id === currentUser?.id}
                          className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                          title={user.id === currentUser?.id ? 'Nuk mund të fshini llogarinë tuaj' : 'Fshi përdoruesin'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Duke shfaqur <span className="font-medium">{startIndex + 1}</span> deri{' '}
                <span className="font-medium">{Math.min(endIndex, users.length)}</span> nga{' '}
                <span className="font-medium">{users.length}</span> përdorues
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Paraardhës
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                        currentPage === page
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Pasardhës
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUser && isAdmin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center m-0">
          <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Shto Përdorues të Ri</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emri i Përdoruesit
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Shkruani emrin e përdoruesit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Shkruani email-in"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Roli
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'staff' | 'student' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="student">Student</option>
                    <option value="staff">Staf</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Anulo
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    {loading ? 'Duke shtuar...' : 'Shto Përdorues'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Fshi Përdoruesin"
        message="A jeni të sigurt që dëshironi të fshini këtë përdorues? Ky veprim nuk mund të zhbëhet."
        itemName={userToDelete ? `${userToDelete.username} (${userToDelete.email})` : ''}
        loading={loading}
      />
    </div>
    </>
  );
};

export default Settings;