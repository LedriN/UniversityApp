import React, { useState } from 'react';
import { Users, Plus, Shield, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import { useAsyncOperation } from '../hooks/useApi';
import { useApp } from '../context/AppContext';

const Settings: React.FC = () => {
  const { users, currentUser, addUser } = useApp();
  const [showAddUser, setShowAddUser] = useState(false);
  const { loading, execute } = useAsyncOperation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'staff' as 'admin' | 'staff'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await execute(() => addUser(formData));
    setFormData({ username: '', email: '', role: 'staff' });
    setShowAddUser(false);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Krijuar më
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Veprimet
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 4 : 3} className="px-6 py-4 text-center text-sm text-gray-500">
                      {isAdmin ? 'Nuk ka përdorues' : 'Nuk keni qasje për të parë përdoruesit'}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
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
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? 'Administrator' : 'Staf'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('sq-AL')}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {user.id !== currentUser?.id && (
                          <button className="text-red-600 hover:text-red-900 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && isAdmin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
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
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'staff' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
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

      {/* System Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <SettingsIcon className="h-6 w-6 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Informacione Sistemi</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Versioni i Sistemit</h4>
              <p className="text-sm text-gray-600">v1.0.0</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Përdoruesi Aktual</h4>
              <p className="text-sm text-gray-600">{currentUser?.username} ({currentUser?.role})</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Universiteti</h4>
              <p className="text-sm text-gray-600">Universiteti Privat</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Kontakti</h4>
              <p className="text-sm text-gray-600">info@university.edu.al</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;