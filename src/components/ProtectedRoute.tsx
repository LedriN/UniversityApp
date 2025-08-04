import React from 'react';
import { Navigate } from 'react-router-dom';
import { isTokenValid } from '../services/token';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isTokenValid(token)) {
    localStorage.removeItem('authToken');
    return <Navigate to="/login" replace />;
  }

  // Check if user is a student and trying to access admin routes
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const user = JSON.parse(currentUser);
    const isStudent = user.role === 'student';
    const currentPath = window.location.pathname;
    
    // Define student routes (routes that start with /student)
    const isStudentRoute = currentPath.startsWith('/student');
    
    // Define admin routes (routes that start with /admin)
    const isAdminRoute = currentPath.startsWith('/admin');

    // If student tries to access admin routes, redirect to student dashboard
    if (isStudent && isAdminRoute) {
      return <Navigate to="/student" replace />;
    }

    // If admin/staff tries to access student routes, redirect to admin dashboard
    if (!isStudent && isStudentRoute) {
      return <Navigate to="/admin" replace />;
    }
  }
  
  return children;
};

export default ProtectedRoute;