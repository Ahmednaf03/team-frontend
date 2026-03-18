// src/App.jsx
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux'; 
import store from './app/store'; 

import { getTenantSlug } from './utils/getTenantFromDomain';
import axiosClient from './services/axiosClient';

import AppRouter from './routes/AppRouter'; 
import { CustomThemeProvider } from './context/ThemeContext'; 
import ErrorBoundary from './components/layout/ErrorBoundary'; // <-- 1. Import it

const App = () => {
  const tenantSlug = getTenantSlug();
  const [tenantConfig, setTenantConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(!!tenantSlug); 
  const [error, setError] = useState(null);
 

  useEffect(() => {
    const fetchTenantDetails = async () => {
      try {
        const response = await axiosClient.get('/resolve');
        setTenantConfig(response.data);
      } catch (err) {
        setError('Workspace not found or inactive.');
      } finally {
        setIsLoading(false);
      }
    };

    if (tenantSlug) {
      fetchTenantDetails();
    }
  }, [tenantSlug]);

  if (!tenantSlug) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Welcome to the Healthcare SaaS</h1>
        <p>Please enter your hospital's specific URL to log in.</p>
      </div>
    );
  }

  if (isLoading) return <div>Loading workspace...</div>;
  if (error) return <div><h1>404</h1><p>{error}</p></div>;

  return (
    <Provider store={store}>
      <CustomThemeProvider initialTheme={tenantConfig?.theme}>
        {/* 2. Wrap the Router in the global Error Boundary */}
        <ErrorBoundary>
          <AppRouter tenantConfig={tenantConfig} />
        </ErrorBoundary>
      </CustomThemeProvider>
    </Provider>
  );
};

export default App;