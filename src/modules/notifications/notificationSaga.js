import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchNotificationsAPI,
  markAsReadAPI,
  markAllAsReadAPI,
  clearAllNotificationsAPI,
} from './notificationAPI';
import {
  fetchNotificationsRequest,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  markAsReadRequest,
  markAsReadFailure,
  markAllAsReadRequest,
  markAllAsReadFailure,
  clearAllRequest,
  clearAllFailure,
} from './notificationSlice';

// ── Fetch notifications ───────────────────────────────────────────────────────
function* handleFetchNotifications() {
  try {
    const responseData = yield call(fetchNotificationsAPI);
    const list = responseData.data ?? responseData;
    const arrayList = Array.isArray(list) ? list : [];
    // Map backend `is_read` to frontend `read`
    // Map backend `created_at` to frontend `timestamp`
    const mappedList = arrayList.map(n => ({
      ...n,
      read: n.is_read === 1 || n.is_read === true || n.read === true,
      timestamp: n.created_at || n.timestamp
    }));
    yield put(fetchNotificationsSuccess(mappedList));
  } catch (error) {
    const message =
      error.response?.data?.data?.error || error.response?.data?.message || 'Failed to load notifications.';
    yield put(fetchNotificationsFailure(message));
  }
}

// ── Mark single as read ───────────────────────────────────────────────────────
function* handleMarkAsRead(action) {
  try {
    // Optimistic update already applied in slice reducer
    yield call(markAsReadAPI, action.payload);
  } catch (error) {
    // Rollback
    yield put(markAsReadFailure({
      id: action.payload,
      message: 'Failed to mark notification as read.',
    }));
  }
}

// ── Mark all as read ──────────────────────────────────────────────────────────
function* handleMarkAllAsRead() {
  try {
    yield call(markAllAsReadAPI);
  } catch (error) {
    yield put(markAllAsReadFailure('Failed to mark all as read.'));
    // Re-fetch to restore correct state
    yield put(fetchNotificationsRequest());
  }
}

// ── Clear all notifications ───────────────────────────────────────────────────
function* handleClearAll() {
  try {
    yield call(clearAllNotificationsAPI);
  } catch (error) {
    yield put(clearAllFailure('Failed to clear notifications.'));
    yield put(fetchNotificationsRequest());
  }
}

// ── Root watcher ──────────────────────────────────────────────────────────────
export default function* notificationSaga() {
  yield takeLatest(fetchNotificationsRequest.type, handleFetchNotifications);
  yield takeLatest(markAsReadRequest.type, handleMarkAsRead);
  yield takeLatest(markAllAsReadRequest.type, handleMarkAllAsRead);
  yield takeLatest(clearAllRequest.type, handleClearAll);
}
