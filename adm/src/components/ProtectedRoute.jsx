import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('adminToken'); // Check for the admin token

  // If authorized (token exists), return an outlet that will render child elements
  // If not, return element that will navigate to the admin login page
  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;