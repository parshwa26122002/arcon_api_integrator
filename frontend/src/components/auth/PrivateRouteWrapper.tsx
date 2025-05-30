// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from './useAuth';
interface Props {
  children: React.ReactNode;
}

export default function PrivateRouteWrapper({ children }: Props) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/" />;
}
