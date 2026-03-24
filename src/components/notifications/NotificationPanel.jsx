import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Spin, Tooltip } from 'antd';
import useNotification from '../../modules/notifications/hooks/useNotification';
import NotificationToast from './NotificationToast';
import {
  BellWrapper,
  BellIcon,
  UnreadBadge,
  PanelWrapper,
  PanelHeader,
  PanelTitle,
  UnreadLabel,
  HeaderActions,
  TextButton,
  FilterTabs,
  FilterTab,
  NotificationList,
  NotificationItem,
  TypeIcon,
  ItemBody,
  ItemTitle,
  ItemMessage,
  ItemTime,
  UnreadDot,
  EmptyState,
  ErrorBanner,
  PanelFooter,
} from './NotificationPanel.styles';

// ── Relative time formatter ───────────────────────────────────────────────────
const timeAgo = (isoString) => {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60)  return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ── Type icon mapping ─────────────────────────────────────────────────────────
const TYPE_ICONS = {
  appointment: '📅',
  payment:     '💳',
  system:      '🔔',
};

const FILTER_OPTIONS = [
  { key: 'all',         label: 'All' },
  { key: 'appointment', label: 'Appointments' },
  { key: 'payment',     label: 'Payments' },
  { key: 'system',      label: 'System' },
];

// ── Component ─────────────────────────────────────────────────────────────────
const NotificationPanel = () => {
  const {
    filteredNotifications,
    unreadCount,
    activeFilter,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
    changeFilter,
    dismissError,
  } = useNotification();

  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // ── Fetch on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ── Close on outside click ──────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleItemClick = useCallback(
    (notification) => {
      if (!notification.read) markAsRead(notification.id);
    },
    [markAsRead]
  );

  return (
    <>
      {/* ── Bell button ── */}
      <div style={{ position: 'relative' }} ref={panelRef}>
        <Tooltip title="Notifications">
          <BellWrapper onClick={() => setOpen((v) => !v)}>
            <BellIcon>🔔</BellIcon>
            {unreadCount > 0 && (
              <UnreadBadge>{unreadCount > 99 ? '99+' : unreadCount}</UnreadBadge>
            )}
          </BellWrapper>
        </Tooltip>

        {/* ── Dropdown panel ── */}
        {open && (
          <PanelWrapper>
            {/* Header */}
            <PanelHeader>
              <PanelTitle>
                Notifications
                {unreadCount > 0 && (
                  <UnreadLabel>{unreadCount} new</UnreadLabel>
                )}
              </PanelTitle>
              <HeaderActions>
                <TextButton
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  title="Mark all as read"
                >
                  Mark all read
                </TextButton>
                <TextButton
                  onClick={() => { clearAll(); }}
                  disabled={filteredNotifications.length === 0}
                  title="Clear all notifications"
                >
                  Clear all
                </TextButton>
              </HeaderActions>
            </PanelHeader>

            {/* Error banner */}
            {error && (
              <ErrorBanner>
                <span>{error}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <TextButton onClick={fetchNotifications}>Retry</TextButton>
                  <TextButton onClick={dismissError}>✕</TextButton>
                </div>
              </ErrorBanner>
            )}

            {/* Filter tabs */}
            <FilterTabs>
              {FILTER_OPTIONS.map((f) => (
                <FilterTab
                  key={f.key}
                  active={activeFilter === f.key}
                  onClick={() => changeFilter(f.key)}
                >
                  {f.label}
                </FilterTab>
              ))}
            </FilterTabs>

            {/* Notification list */}
            <NotificationList>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <Spin size="small" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <EmptyState>
                  <div className="icon">🔕</div>
                  <div>No {activeFilter === 'all' ? '' : activeFilter} notifications</div>
                </EmptyState>
              ) : (
                filteredNotifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    unread={!n.read}
                    onClick={() => handleItemClick(n)}
                  >
                    <TypeIcon type={n.type}>
                      {TYPE_ICONS[n.type] ?? '🔔'}
                    </TypeIcon>
                    <ItemBody>
                      <ItemTitle unread={!n.read}>{n.title}</ItemTitle>
                      <ItemMessage>{n.message}</ItemMessage>
                      <ItemTime>{timeAgo(n.timestamp)}</ItemTime>
                    </ItemBody>
                    {!n.read && <UnreadDot />}
                  </NotificationItem>
                ))
              )}
            </NotificationList>

            {/* Footer */}
            <PanelFooter>
              <TextButton onClick={fetchNotifications} disabled={loading}>
                {loading ? 'Loading...' : '↺ Refresh'}
              </TextButton>
            </PanelFooter>
          </PanelWrapper>
        )}
      </div>

      {/* ── Toast popup for new notifications ── */}
      <NotificationToast />
    </>
  );
};

export default NotificationPanel;
