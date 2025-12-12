import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth';
import { USER_ROLES } from '../utils/constants';

/**
 * Protected Route Component
 * Implements role-based access control for route protection
 * Redirects to login if not authenticated
 * Redirects to appropriate dashboard if user has wrong role
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = getCurrentUser();

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has allowed role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user's actual role
    switch(user.role) {
      case USER_ROLES.ADMIN:
        return <Navigate to="/admin-dashboard" replace />;
      case USER_ROLES.MANAGER:
        return <Navigate to="/manager-dashboard" replace />;
      case USER_ROLES.STUDENT:
        return <Navigate to="/student-dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // User is authenticated and has correct role
  return children;
};

export default ProtectedRoute;
