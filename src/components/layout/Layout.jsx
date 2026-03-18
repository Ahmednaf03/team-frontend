// src/components/layout/Layout.jsx
import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import Header from './Header'; 
import Footer from './Footer'; 
import ErrorBoundary from '../layout/ErrorBoundary'; // <-- 1. Import it

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh; 
  background-color: ${(props) => props.theme.colors.background};
  overflow: hidden; 
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden; 
`;

const MainContent = styled.main`
  flex: 1;
  padding: 30px;
  overflow-y: auto; 
`;

const ContentLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px', color: '#7a8694' }}>
    Loading page content...
  </div>
);

const Layout = () => {
  return (
    <LayoutContainer>
      <Sidebar />
      
      <ContentWrapper>
        <Header />
        
        <MainContent>
          {/* 2. Wrap the Suspense and Outlet inside the Error Boundary */}
          <ErrorBoundary>
            <Suspense fallback={<ContentLoader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </MainContent>

        <Footer />
      </ContentWrapper>
      
    </LayoutContainer>
  );
};

export default Layout;