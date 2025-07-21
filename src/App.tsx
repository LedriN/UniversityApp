import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './components/LoginForm';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/StudentList';
import StudentForm from './pages/StudentForm';
import StudentDetail from './pages/StudentDetail';
import Settings from './pages/Settings';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/students" element={
            <ProtectedRoute>
              <Layout>
                <StudentList />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/students/add" element={
            <ProtectedRoute>
              <Layout>
                <StudentForm />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/students/:id" element={
            <ProtectedRoute>
              <Layout>
                <StudentDetail />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/students/:id/edit" element={
            <ProtectedRoute>
              <Layout>
                <StudentForm />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;