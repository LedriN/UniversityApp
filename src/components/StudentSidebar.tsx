import React from 'react';
import { 
  GraduationCap,
  Home,
  BookOpen,
  Settings,
  LogOut,
  User,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '/assets/logo.svg';

interface StudentSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    {
      path: '/student/dashboard',
      icon: Home,
      label: 'Dashboard',
      active: location.pathname === '/student/dashboard'
    },
    {
      path: '/student/department',
      icon: BookOpen,
      label: 'Leksionet',
      active: location.pathname === '/student/department'
    },
    {
      path: '/student/settings',
      icon: Settings,
      label: 'Cilësimet',
      active: location.pathname === '/student/settings'
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full z-50 bg-white shadow-lg transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-64' : 'w-16'} 
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header with Toggle */}
          <div className="flex p-5 items-center justify-center border-b border-gray-200 relative">
            <img src={logo} alt="Logo" className="h-20 w-20" />
            {/* Mobile Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute top-4 left-4 lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5 text-gray-600" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    item.active
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-gray-200 p-2 rounded-full">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {currentUser?.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {currentUser?.email}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              {sidebarOpen && <span>Dil</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Toggle Button (when sidebar is closed) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-4 left-4 z-30 lg:hidden p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      )}
    </>
  );
};

export default StudentSidebar; 