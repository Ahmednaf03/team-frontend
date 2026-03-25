import axiosClient from '../../services/axiosClient';

/**
 * notificationAPI
 *
 * Backend routes (to be implemented):
 *   GET    /api/notifications          → fetch all notifications
 *   PATCH  /api/notifications/:id/read → mark one as read
 *   PATCH  /api/notifications/read-all → mark all as read
 *   DELETE /api/notifications          → clear all
 *
 * NOTE: Until backend is ready, fetchNotificationsAPI returns
 * simulated data so the UI works independently.
 */

// ── API functions ─────────────────────────────────────────────────────────────

export const fetchNotificationsAPI = async (params = {}) => {
  const response = await axiosClient.get('/notifications', {
    params,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const markAsReadAPI = async (id) => {
  const response = await axiosClient.patch(`/notifications/read/${id}`, {}, {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const markAllAsReadAPI = async () => {
  const response = await axiosClient.patch('/notifications/read-all', {}, {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const clearAllNotificationsAPI = async () => {
  const response = await axiosClient.delete('/notifications', {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};
