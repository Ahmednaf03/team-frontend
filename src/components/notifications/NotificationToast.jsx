import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { ToastWrapper, ToastItem, TypeIcon } from './NotificationPanel.styles';

const TYPE_ICONS = {
  appointment: '📅',
  payment:     '💳',
  system:      '🔔',
  maintenance: '🛠️',
};

const TOAST_DURATION = 4000; // ms

/**
 * NotificationToast
 *
 * Watches Redux notifications state.
 * When a new unread notification appears, shows a toast for TOAST_DURATION ms.
 * Max 3 toasts visible at once.
 */
const NotificationToast = () => {
  const notifications = useSelector((state) => state.notifications.notifications);
  const [toasts, setToasts] = useState([]);
  const prevIdsRef = useRef(new Set());

  useEffect(() => {
    if (notifications.length === 0) return;

    const currentIds = new Set(notifications.map((n) => n.id));
    const newOnes = notifications.filter(
      (n) => !prevIdsRef.current.has(n.id) && !n.read
    );

    prevIdsRef.current = currentIds;

    if (newOnes.length === 0) return;

    newOnes.forEach((n) => {
      setToasts((prev) => {
        const updated = [n, ...prev].slice(0, 3);
        return updated;
      });

      // Auto-dismiss after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== n.id));
      }, TOAST_DURATION);
    });
  }, [notifications]);

  const dismiss = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <ToastWrapper>
      {toasts.map((t) => (
        <ToastItem key={t.id} type={t.type}>
          <TypeIcon type={t.type} style={{ width: 28, height: 28, fontSize: 14 }}>
            {TYPE_ICONS[t.type] ?? '🔔'}
          </TypeIcon>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="toast-title">{t.title}</div>
            <div className="toast-msg">{t.message}</div>
          </div>
          <span className="toast-close" onClick={() => dismiss(t.id)}>✕</span>
        </ToastItem>
      ))}
    </ToastWrapper>
  );
};

export default NotificationToast;
