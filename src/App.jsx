import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminViewUsers from './pages/AdminViewUsers';
import ManagerDashboard from './pages/ManagerDashboard';
import StudentDashboard from './pages/StudentDashboard';
import RequestEquipment from './pages/RequestEquipment';
import StudentEquipments from './pages/StudentEquipments';
import ManagerRequests from './pages/ManagerRequests';
import Equipments from './pages/Equipments';
import Issue from './pages/Issue';
import Issued from './pages/Issued';
import Overdue from './pages/Overdue';
import Logs from './pages/Logs';
import AdminFeedback from './pages/AdminFeedback';
import SportSelectionFeedback from './pages/SportSelectionFeedback';
import DamagedEquipment from './pages/DamagedEquipment';
import ProcurementList from './pages/ProcurementList';

import { getCurrentUser } from './utils/auth';

/**
 * Main App Component
 * Handles routing and authentication flow for the Sports Inventory Management System
 * Implements role-based access control and protected routes
 */
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const user = getCurrentUser();
    setIsAuthenticated(!!user);
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50 transition-colors duration-200">
        <Navbar />
        
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Admin Routes */}
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-view-users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminViewUsers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-feedback" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminFeedback />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Manager Routes */}
            <Route 
              path="/manager-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/equipments" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <Equipments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/issue" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <Issue />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/issued" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <Issued />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/overdue" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <Overdue />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/logs" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <Logs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/damaged-equipment" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <DamagedEquipment />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Student Routes */}
            <Route 
              path="/student-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student-equipments" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentEquipments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/request-equipment" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <RequestEquipment />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sport-selection-feedback" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <SportSelectionFeedback />
                </ProtectedRoute>
              } 
            />

            
            {/* Manager Requests Route */}
            <Route 
              path="/manager-requests" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <ManagerRequests />
                </ProtectedRoute>
              } 
            />
            
            {/* Procurement List Route */}
            <Route 
              path="/procurement-list" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <ProcurementList />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#FFFFFF',
              color: '#1F2937',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;