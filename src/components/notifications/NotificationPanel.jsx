import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Modal, Spin, Tooltip } from 'antd';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import useNotification from '../../modules/notifications/hooks/useNotification';
import { selectIsAdmin } from '../../modules/auth/selectors';
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
  maintenance: '🛠️',
};

const FILTER_OPTIONS = [
  { key: 'all',         label: 'All' },
  { key: 'appointment', label: 'Appointments' },
  { key: 'payment',     label: 'Payments' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'system',      label: 'System' },
];

const EMPTY_FORM = {
  title: '',
  message: '',
  starts_at: '',
  ends_at: '',
};

// ── Component ─────────────────────────────────────────────────────────────────
const NotificationPanel = () => {
  const isAdmin = useSelector(selectIsAdmin);
  const {
    filteredNotifications,
    unreadCount,
    activeFilter,
    loading,
    creating,
    success,
    error,
    fetchNotifications,
    createBroadcastNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    changeFilter,
    dismissError,
    dismissSuccess,
  } = useNotification();

  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const panelRef = useRef(null);

  // ── Fetch on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!success) return;
    toast.success(success, { id: 'maintenance-broadcast-success' });
    dismissSuccess();
    setModalOpen(false);
    setForm(EMPTY_FORM);
    setFormError('');
  }, [dismissSuccess, success]);

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

  const handleOpenModal = useCallback(() => {
    setModalOpen(true);
    setFormError('');
  }, []);

  const handleCloseModal = useCallback(() => {
    if (creating) return;
    setModalOpen(false);
    setForm(EMPTY_FORM);
    setFormError('');
  }, [creating]);

  const handleSubmit = useCallback(() => {
    if (!form.title.trim() || !form.message.trim() || !form.starts_at || !form.ends_at) {
      setFormError('All fields are required.');
      return;
    }

    if (new Date(form.ends_at) <= new Date(form.starts_at)) {
      setFormError('End time must be after start time.');
      return;
    }

    setFormError('');
    createBroadcastNotification({
      type: 'maintenance',
      audience: 'staff',
      title: form.title.trim(),
      message: form.message.trim(),
      starts_at: form.starts_at,
      ends_at: form.ends_at,
    });
  }, [createBroadcastNotification, form]);

  const formatWindow = useCallback((notification) => {
    const startValue = notification.starts_at || notification.startsAt;
    const endValue = notification.ends_at || notification.endsAt;

    if (!startValue || !endValue) {
      return timeAgo(notification.timestamp);
    }

    const startText = new Date(startValue).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });
    const endText = new Date(endValue).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });

    return `${startText} - ${endText}`;
  }, []);

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
                {isAdmin && (
                  <TextButton
                    onClick={handleOpenModal}
                    title="Send maintenance notification"
                  >
                    Send notice
                  </TextButton>
                )}
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
                      <ItemTime>{formatWindow(n)}</ItemTime>
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

      <Modal
        open={modalOpen}
        title="Broadcast Maintenance Notice"
        onCancel={handleCloseModal}
        onOk={handleSubmit}
        okText={creating ? 'Sending...' : 'Send notice'}
        okButtonProps={{ loading: creating }}
        cancelButtonProps={{ disabled: creating }}
        destroyOnClose
      >
        <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Title</span>
            <input
              type="text"
              value={form.title}
              maxLength={120}
              onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
              placeholder="Scheduled Maintenance"
              style={{ height: 38, borderRadius: 8, border: '1px solid #d9d9d9', padding: '0 12px' }}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Message</span>
            <textarea
              value={form.message}
              rows={4}
              onChange={(e) => setForm((current) => ({ ...current, message: e.target.value }))}
              placeholder="From 8 PM to 10 PM, the service will be unavailable."
              style={{ borderRadius: 8, border: '1px solid #d9d9d9', padding: '10px 12px', resize: 'vertical' }}
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Start Time</span>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm((current) => ({ ...current, starts_at: e.target.value }))}
                style={{ height: 38, borderRadius: 8, border: '1px solid #d9d9d9', padding: '0 12px' }}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>End Time</span>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => setForm((current) => ({ ...current, ends_at: e.target.value }))}
                style={{ height: 38, borderRadius: 8, border: '1px solid #d9d9d9', padding: '0 12px' }}
              />
            </label>
          </div>

          {formError ? (
            <div style={{ color: '#dc2626', fontSize: 12 }}>{formError}</div>
          ) : (
            <div style={{ color: '#64748b', fontSize: 12 }}>
              This notice will be sent to all active staff in the current tenant.
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default NotificationPanel;
