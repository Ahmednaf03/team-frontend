import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import styled, { keyframes, useTheme } from 'styled-components';
import { HeartPulse, LogOut } from 'lucide-react';
import NotificationPanel from '../notifications/NotificationPanel';
import PatientSidebar from './PatientSidebar';

/* ─── Animations ─────────────────────────────────────────────────────────── */
const spin = keyframes`to { transform: rotate(360deg); }`;

/* ─── Shell ──────────────────────────────────────────────────────────────── */
const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${(p) => p.theme.colors.background};
  font-family: 'DM Sans', sans-serif;
`;

const TopBar = styled.header`
  background: ${(p) => p.theme.colors.surface};
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
  padding: 14px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  z-index: 10;
`;

const TopBarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.text};
`;

const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1.5px solid ${(p) => p.theme.colors.border};
  border-radius: 8px;
  padding: 7px 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: #ef4444; color: #ef4444; }
`;

const ContentArea = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
`;

const SpinnerWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid ${(p) => p.theme.colors.border};
  border-top-color: ${(p) => p.theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const ContentLoader = () => (
  <SpinnerWrap><Spinner /></SpinnerWrap>
);

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function PatientPortalLayout() {
  const theme = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('csrf_token');
    window.location.href = '/patient-login';
  };

  return (
    <LayoutContainer>
      {/* ── Top bar ── */}
      <TopBar>
        <Brand>
          <HeartPulse size={22} color={theme.colors.primary} />
          NexaCare — Patient Portal
        </Brand>
        <TopBarActions>
          <NotificationPanel />
          <LogoutBtn onClick={handleLogout}>
            <LogOut size={14} /> Sign Out
          </LogoutBtn>
        </TopBarActions>
      </TopBar>

      {/* ── Body area: sidebar + content ── */}
      <ContentArea>
        <PatientSidebar />
        <MainContent>
          <Suspense fallback={<ContentLoader />}>
            <Outlet />
          </Suspense>
        </MainContent>
      </ContentArea>
    </LayoutContainer>
  );
}
