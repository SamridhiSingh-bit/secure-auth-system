import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../utils/useAuth';

export const ProtectedRoute = ({ children, requiredRoles = null }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
