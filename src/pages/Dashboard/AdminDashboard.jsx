import React from 'react';
import { Alert, Spin } from 'antd';
import BentoDashboard from './BentoDashboard';
import useDashboardConfig from './useDashboardConfig';

const AdminDashboard = () => {
  const { config, loading, error } = useDashboardConfig('admin');

  if (loading && !config) {
    return (
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {error && (
        <div style={{ padding: '24px', paddingBottom: config ? 0 : '24px' }}>
          <Alert
            type="warning"
            showIcon
            title="Dashboard data could not be loaded"
            description={error}
          />
        </div>
      )}
      {config ? <BentoDashboard config={config} /> : null}
    </>
  );
};

export default AdminDashboard;
