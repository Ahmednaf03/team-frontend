import styled, { keyframes, css } from 'styled-components';

// ── Bell button (sits in Header) ──────────────────────────────────────────────
export const BellWrapper = styled.div`
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  margin-right: 12px;
  transition: background 0.15s;
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

export const BellIcon = styled.div`
  font-size: 18px;
  line-height: 1;
`;

export const UnreadBadge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  background: ${({ theme }) => theme.colors.danger};
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  line-height: 1;
`;

// ── Slide-in animation ────────────────────────────────────────────────────────
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ── Dropdown panel ────────────────────────────────────────────────────────────
export const PanelWrapper = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 360px;
  max-height: 520px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  animation: ${slideIn} 0.18s ease;
  overflow: hidden;
`;

// ── Panel header ──────────────────────────────────────────────────────────────
export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
`;

export const PanelTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const UnreadLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  background: ${({ theme }) => theme.colors.primary}22;
  color: ${({ theme }) => theme.colors.primary};
  padding: 2px 7px;
  border-radius: 10px;
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const TextButton = styled.button`
  background: none;
  border: none;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary}15;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

// ── Filter tabs ───────────────────────────────────────────────────────────────
export const FilterTabs = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
`;

export const FilterTab = styled.button`
  background: ${({ active, theme }) =>
    active ? theme.colors.primary + '18' : 'transparent'};
  color: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.textSecondary};
  border: ${({ active, theme }) =>
    active ? `1px solid ${theme.colors.primary}44` : '1px solid transparent'};
  font-size: 12px;
  font-weight: ${({ active }) => (active ? 600 : 400)};
  padding: 4px 10px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.colors.primary}10;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

// ── Notification list ─────────────────────────────────────────────────────────
export const NotificationList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
  }
`;

// ── Individual notification item ──────────────────────────────────────────────
const unreadPulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
`;

export const NotificationItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  background: ${({ unread, theme }) =>
    unread ? theme.colors.primary + '08' : 'transparent'};
  border-left: 3px solid ${({ unread, theme }) =>
    unread ? theme.colors.primary : 'transparent'};
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

// ── Type icon ─────────────────────────────────────────────────────────────────
const typeColors = {
  appointment: { bg: '#1a73c118', color: '#1a73c1' },
  payment:     { bg: '#1e7e3418', color: '#1e7e34' },
  system:      { bg: '#d35400 18', color: '#d35400' },
};

export const TypeIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: ${({ type }) =>
    type === 'appointment' ? '#1a73c118' :
    type === 'payment'     ? '#1e7e3418' : '#d3540018'};
  color: ${({ type }) =>
    type === 'appointment' ? '#1a73c1' :
    type === 'payment'     ? '#1e7e34' : '#d35400'};
`;

export const ItemBody = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ItemTitle = styled.div`
  font-size: 13px;
  font-weight: ${({ unread }) => (unread ? 600 : 400)};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ItemMessage = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const ItemTime = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
  white-space: nowrap;
`;

export const UnreadDot = styled.div`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
  margin-top: 5px;
`;

// ── Empty state ───────────────────────────────────────────────────────────────
export const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;

  .icon {
    font-size: 32px;
    margin-bottom: 8px;
    opacity: 0.4;
  }
`;

// ── Error banner ──────────────────────────────────────────────────────────────
export const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.danger}15;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.danger}30;
  flex-shrink: 0;
`;

// ── Panel footer ──────────────────────────────────────────────────────────────
export const PanelFooter = styled.div`
  padding: 8px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  text-align: center;
  flex-shrink: 0;
`;

// ── Polling indicator ─────────────────────────────────────────────────────────
export const PollingDot = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  margin-left: 6px;
  animation: ${unreadPulse} 1.5s ease-in-out infinite;
`;

// ── Toast notification ────────────────────────────────────────────────────────
const toastSlide = keyframes`
  from { opacity: 0; transform: translateX(100%); }
  to   { opacity: 1; transform: translateX(0); }
`;

export const ToastWrapper = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ToastItem = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 3px solid ${({ type, theme }) =>
    type === 'appointment' ? '#1a73c1' :
    type === 'payment'     ? '#1e7e34' : theme.colors.primary};
  border-radius: 8px;
  padding: 12px 14px;
  min-width: 280px;
  max-width: 340px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  animation: ${toastSlide} 0.25s ease;
  font-size: 13px;

  .toast-title {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 2px;
  }
  .toast-msg {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 12px;
    line-height: 1.4;
  }
  .toast-close {
    margin-left: auto;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 14px;
    line-height: 1;
    flex-shrink: 0;
  }
`;
