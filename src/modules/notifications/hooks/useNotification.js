import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  fetchNotificationsRequest,
  markAsReadRequest,
  markAllAsReadRequest,
  clearAllRequest,
  setFilter,
  clearError,
} from '../notificationSlice';

/**
 * useNotification()
 *
 * Provides components with all notification state + actions.
 * Components never import slice actions directly.
 *
 * Usage:
 *   const {
 *     notifications, filteredNotifications, unreadCount,
 *     activeFilter, loading, polling, error,
 *     fetchNotifications, markAsRead, markAllAsRead,
 *     clearAll, changeFilter, dismissError,
 *   } = useNotification();
 */
export default function useNotification() {
  const dispatch = useDispatch();

  const {
    notifications,
    unreadCount,
    activeFilter,
    loading,
    error,
  } = useSelector((state) => state.notifications);

  // ── Filtered list (derived — no extra Redux state needed) ─────────────────
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications;
    return notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(() => {
    dispatch(fetchNotificationsRequest());
  }, [dispatch]);

  const markAsRead = useCallback(
    (id) => dispatch(markAsReadRequest(id)),
    [dispatch]
  );

  const markAllAsRead = useCallback(
    () => dispatch(markAllAsReadRequest()),
    [dispatch]
  );

  const clearAll = useCallback(
    () => dispatch(clearAllRequest()),
    [dispatch]
  );

  const changeFilter = useCallback(
    (filter) => dispatch(setFilter(filter)),
    [dispatch]
  );

  const dismissError = useCallback(
    () => dispatch(clearError()),
    [dispatch]
  );

  return {
    notifications,
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
  };
}
