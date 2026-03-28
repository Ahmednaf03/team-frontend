import { createSlice } from '@reduxjs/toolkit';

/**
 * notificationSlice
 *
 * State shape:
 *   notifications  → full list of notification objects
 *   unreadCount    → number of unread notifications
 *   activeFilter   → 'all' | 'appointment' | 'payment' | 'system'
 *   loading        → fetching in-flight
 *   polling        → background polling active
 *   error          → error message | null
 *
 * Notification object shape:
 *   { id, type, title, message, read, timestamp, meta? }
 *   type: 'appointment' | 'payment' | 'system'
 */

const initialState = {
  notifications: [],
  unreadCount: 0,
  activeFilter: 'all',
  loading: false,
  creating: false,
  success: null,
  error: null,
};

// ── Helper: recount unread ────────────────────────────────────────────────────
const recountUnread = (notifications) =>
  notifications.filter((n) => !n.read).length;

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // ── Fetch ────────────────────────────────────────────────────────────────
    fetchNotificationsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchNotificationsSuccess: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = recountUnread(action.payload);
      state.loading = false;
    },
    fetchNotificationsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createBroadcastRequest: (state) => {
      state.creating = true;
      state.error = null;
      state.success = null;
    },
    createBroadcastSuccess: (state, action) => {
      state.creating = false;
      state.success =
        action.payload?.message || 'Maintenance notification sent successfully.';
    },
    createBroadcastFailure: (state, action) => {
      state.creating = false;
      state.error = action.payload;
    },

    // ── Mark single as read ──────────────────────────────────────────────────
    markAsReadRequest: (state, action) => {
      // Optimistic update
      const n = state.notifications.find((n) => n.id === action.payload);
      if (n && !n.read) {
        n.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAsReadFailure: (state, action) => {
      // Rollback — mark unread again
      const n = state.notifications.find((n) => n.id === action.payload.id);
      if (n) {
        n.read = false;
        state.unreadCount = recountUnread(state.notifications);
      }
      state.error = action.payload.message;
    },

    // ── Mark all as read ─────────────────────────────────────────────────────
    markAllAsReadRequest: (state) => {
      state.notifications.forEach((n) => { n.read = true; });
      state.unreadCount = 0;
    },
    markAllAsReadFailure: (state, action) => {
      state.error = action.payload;
      // Re-fetch will restore correct state — handled by saga
    },

    // ── Clear all ────────────────────────────────────────────────────────────
    clearAllRequest: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    clearAllFailure: (state, action) => {
      state.error = action.payload;
    },

    // ── UI controls ──────────────────────────────────────────────────────────
    setFilter: (state, action) => {
      state.activeFilter = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
  },
});

export const {
  fetchNotificationsRequest,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  createBroadcastRequest,
  createBroadcastSuccess,
  createBroadcastFailure,
  markAsReadRequest,
  markAsReadFailure,
  markAllAsReadRequest,
  markAllAsReadFailure,
  clearAllRequest,
  clearAllFailure,
  setFilter,
  clearError,
  clearSuccess,
} = notificationSlice.actions;

export default notificationSlice.reducer;
