import React from 'react';
import { 
  GraduationCap,
  Home,
  BookOpen,
  Settings,
  LogOut,
  User,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../public/assets/logo.svg';

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
    <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 ease-in-out`}>
      <div className="flex flex-col h-full">
        <div className="flex p-5 items-center justify-center border-b border-gray-200 relative">
              <img src={logo} alt="Logo" className="h-20 w-20" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
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
  );
};

export default StudentSidebar; 