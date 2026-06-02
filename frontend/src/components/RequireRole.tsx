import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { STORAGE_KEYS, storage } from '../api/storage';
import type { UserRole } from '../api/auth';

interface Props {
  role: UserRole;
  children: React.ReactNode;
}

const RequireRole: React.FC<Props> = ({ role, children }) => {
  const { user, isAuthenticated } = useAuth();

  const staffRole = storage.get(STORAGE_KEYS.STAFF_ROLE);
  const staffToken = storage.get(STORAGE_KEYS.STAFF_TOKEN);
  const isStaff = !!staffToken && staffRole === role;

  if (isStaff) return <>{children}</>;
  if (!isAuthenticated) return <Navigate to="/staff" replace />;
  if (user?.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default RequireRole;
