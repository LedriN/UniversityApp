import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ToastContainer from './components/ToastContainer';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './components/LoginForm';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/StudentList';
import StudentForm from './pages/StudentForm';
import StudentDetail from './pages/StudentDetail';
import Settings from './pages/Settings';
import Departments from './pages/Departments';
import StudentDashboard from './student/StudentDashboard';
import DepartmentPage from './student/DepartmentPage';
import StudentDepartmentPage from './student/StudentDepartmentPage';
import StudentSettings from './student/StudentSettings';

function App() {
  return (
    <AppProvider>
      <ToastContainer>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            
            {/* Root route - redirects based on user role */}
            <Route path="/" element={
              <ProtectedRoute>
                <RoleBasedRedirect />
              </ProtectedRoute>
            } />
            
            {/* Admin/Staff Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/students" element={
              <ProtectedRoute>
                <Layout>
                  <StudentList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/students/add" element={
              <ProtectedRoute>
                <Layout>
                  <StudentForm />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/students/:id" element={
              <ProtectedRoute>
                <Layout>
                  <StudentDetail />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/students/:id/edit" element={
              <ProtectedRoute>
                <Layout>
                  <StudentForm />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/departments" element={
              <ProtectedRoute>
                <Layout>
                  <Departments />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Student Routes */}
            <Route path="/student" element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/department" element={
              <ProtectedRoute>
                <StudentDepartmentPage />
              </ProtectedRoute>
            } />
            <Route path="/student/settings" element={
              <ProtectedRoute>
                <StudentSettings />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastContainer>
    </AppProvider>
  );
}

// Component to handle role-based redirects
const RoleBasedRedirect: React.FC = () => {
  const currentUser = localStorage.getItem('currentUser');
  
  if (currentUser) {
    const user = JSON.parse(currentUser);
    if (user.role === 'admin' || user.role === 'staff') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/student" replace />;
    }
  }
  
  // Fallback to admin dashboard if user data is not available
  return <Navigate to="/admin" replace />;
};

export default App;