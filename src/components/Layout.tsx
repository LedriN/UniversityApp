import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, Plus, Settings, LogOut, GraduationCap, Home, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, isOnline, usesMockData } = useApp();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Studentët', href: '/students', icon: Users },
    { name: 'Shto Student', href: '/students/add', icon: Plus },
    { name: 'Cilësimet', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          {/* Connection Status */}
          <div className="absolute top-4 right-4">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" title="Online - Connected to backend" />
            ) : (
              <WifiOff className="h-4 w-4 text-orange-500" title="Offline - Using demo data" />
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Universiteti</span>
          </div>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href === '/students' && location.pathname.startsWith('/students') && location.pathname !== '/students/add');
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          {/* Demo Mode Warning */}
          {usesMockData && (
            <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
              <div className="flex items-center">
                <WifiOff className="h-3 w-3 mr-1" />
                Demo Mode - Data won't persist
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {currentUser?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{currentUser?.username}</p>
                <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Dil"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <main className="py-8 px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;