// src/routes/RoleBasedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../modules/auth/selectors';

export default function RoleBasedRoute({ roles = [] }) {
  const userRole = useSelector(selectUserRole);

  // Kick out immediately if they have no role at all
  if (!userRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // Make everything lowercase so "Admin" safely matches "admin"
  const lowerCaseRoles = roles.map(r => r.toLowerCase());
  const lowerCaseUserRole = String(userRole).toLowerCase();

  if (!lowerCaseRoles.includes(lowerCaseUserRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}