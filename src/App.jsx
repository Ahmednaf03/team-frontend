// src/App.jsx
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux'; 
import store from './app/store'; 

import { getTenantSlug } from './utils/getTenantFromDomain';
import axiosClient from './services/axiosClient';

import AppRouter from './routes/AppRouter'; 
import { CustomThemeProvider } from './context/ThemeContext'; 
import ErrorBoundary from './components/layout/ErrorBoundary'; // <-- 1. Import it
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingPage from './pages/Auth/LandingPage';
import { Activity } from 'lucide-react';

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
      <Provider store={store}>
        <CustomThemeProvider initialTheme="default">
          <ErrorBoundary>
            <LandingPage />
          </ErrorBoundary>
        </CustomThemeProvider>
      </Provider>
    );
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#f4f6f8',
        color: '#2c3e50',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '420px', width: '100%', background: '#fff', borderRadius: '14px', padding: '2rem', boxShadow: '0 14px 40px rgba(0,0,0,0.08)' }}>
          <Activity size={38} color="#3498db" style={{ marginBottom: '0.8rem' }} />
          <h2>Loading your workspace...</h2>
          <p style={{ color: '#7f8c8d', marginTop: '0.5rem', lineHeight: 1.5 }}>
            We are validating your hospital domain and getting everything ready. This may take a moment.
          </p>
          <div style={{ marginTop: '1.1rem', height: '6px', width: '100%', borderRadius: '999px', background: '#e0e0e0', overflow: 'hidden' }}>
            <div style={{ width: '58%', height: '100%', background: '#3498db' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#fdf0ef',
        color: '#c0392b',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '440px', width: '100%', background: '#fff', borderRadius: '14px', padding: '2rem', boxShadow: '0 14px 40px rgba(0,0,0,0.08)' }}>
          <h1>404</h1>
          <p style={{ color: '#2c3e50', margin: '0.5rem 0 0' }}>{error}</p>
          <p style={{ marginTop: '1rem', color: '#7f8c8d' }}>Check your subdomain or use the landing form to find the correct workspace.</p>
        </div>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <CustomThemeProvider initialTheme={tenantConfig?.theme}>
        {/* 2. Wrap the Router in the global Error Boundary */}
        <ErrorBoundary>
          <AppRouter tenantConfig={tenantConfig} />
           <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
        </ErrorBoundary>
      </CustomThemeProvider>
    </Provider>
  );
};

export default App;