// src/pages/Dashboard/DashboardPage.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../../modules/auth/selectors';
import AdminDashboard from './AdminDashboard';
import ProviderDashboard from './ProviderDashboard';
import NurseDashboard from './NurseDashboard';
import ReceptionistDashboard from './ReceptionistDashboard';
import PharmacistDashboard from './PharmacistDashboard';

// Note: Styled components removed for now; add back if needed for role components

const DashboardPage = () => {
  const userRole = useSelector(selectUserRole);

  const renderDashboard = () => {
    switch (userRole?.toLowerCase()) {
      case 'admin':
        return <AdminDashboard />;
      case 'provider':
        return <ProviderDashboard />;
      case 'nurse':
        return <NurseDashboard />;
      case 'receptionist':
        return <ReceptionistDashboard />;
      case 'pharmacist':
        return <PharmacistDashboard />;
      default:
        return <div>Dashboard not available for your role</div>;
    }
  };

  return <div>{renderDashboard()}</div>;
};

export default DashboardPage;