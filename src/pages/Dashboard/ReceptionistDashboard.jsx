import React from 'react';
import { Alert, Spin } from 'antd';
import BentoDashboard from './BentoDashboard';
import useDashboardConfig from './useDashboardConfig';

const ReceptionistDashboard = () => {
  const { config, loading, error } = useDashboardConfig('receptionist');

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: 320 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error && !config) {
    return (
      <Alert
        type="error"
        title="Dashboard data could not be loaded."
        description={error}
        showIcon
      />
    );
  }

  return <BentoDashboard config={config} />;
};

export default ReceptionistDashboard;
