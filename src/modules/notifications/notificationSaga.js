import { call, put, takeLatest, select } from 'redux-saga/effects';
import {
  fetchNotificationsAPI,
  markAsReadAPI,
  markAllAsReadAPI,
  clearAllNotificationsAPI,
  createBroadcastNotificationAPI,
} from './notificationAPI';
import { fetchAppointmentsAPI } from '../appointments/appointmentAPI';
import { extractCollection, enrichAppointment } from '../../utils/appointmentMapping';
import {
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
} from './notificationSlice';

const normalizeNotificationTitle = (notification) => {
  const type = String(notification?.type || '').toLowerCase();
  const title = String(notification?.title || '').trim();
  const message = String(notification?.message || '').trim().toLowerCase();

  if (type !== 'appointment') {
    return title;
  }

  const isGenericAppointmentTitle = title.toLowerCase() === 'new appointment';
  const isMessageStyleNotification =
    !message.startsWith('new appointment') &&
    ['message', 'note', 'communication', 'chat'].some((keyword) =>
      message.includes(keyword)
    );

  if (isGenericAppointmentTitle && isMessageStyleNotification) {
    return 'New Message in Appointment';
  }

  return title;
};

// ── Fetch notifications ───────────────────────────────────────────────────────
function* handleFetchNotifications() {
  try {
    const currentUser = yield select((state) => state.auth.user);
    const currentRole = String(currentUser?.role || '').toLowerCase();
    const responseData = yield call(fetchNotificationsAPI);
    const arrayList = extractCollection(responseData);
    // Map backend `is_read` to frontend `read`
    // Map backend `created_at` to frontend `timestamp`
    const mappedList = arrayList.map(n => ({
      ...n,
      title: normalizeNotificationTitle(n),
      read: n.is_read === 1 || n.is_read === true || n.read === true,
      timestamp: n.created_at || n.timestamp
    }));
    let scopedList = mappedList;

    if (currentRole === 'provider' && currentUser?.id) {
      const appointmentResponse = yield call(fetchAppointmentsAPI, {
        doctor_id: currentUser.id,
        per_page: 500,
      });
      const providerAppointments = extractCollection(appointmentResponse).map(enrichAppointment);
      const providerAppointmentIds = new Set(
        providerAppointments.map((appointment) => Number(appointment.id))
      );

      scopedList = mappedList.filter((notification) => {
        if (notification.type !== 'appointment') return true;
        const referenceId = Number(notification.reference_id);
        if (!Number.isFinite(referenceId)) return false;
        return providerAppointmentIds.has(referenceId);
      });
    }

    yield put(fetchNotificationsSuccess(scopedList));
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

function* handleCreateBroadcast(action) {
  try {
    const responseData = yield call(createBroadcastNotificationAPI, action.payload);
    yield put(createBroadcastSuccess(responseData));
    yield put(fetchNotificationsRequest());
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.data?.error ||
      'Failed to send maintenance notification.';
    yield put(createBroadcastFailure(message));
  }
}

// ── Root watcher ──────────────────────────────────────────────────────────────
export default function* notificationSaga() {
  yield takeLatest(fetchNotificationsRequest.type, handleFetchNotifications);
  yield takeLatest(createBroadcastRequest.type, handleCreateBroadcast);
  yield takeLatest(markAsReadRequest.type, handleMarkAsRead);
  yield takeLatest(markAllAsReadRequest.type, handleMarkAllAsRead);
  yield takeLatest(clearAllRequest.type, handleClearAll);
}
