import { call, put, takeLatest, select, race, delay } from 'redux-saga/effects';
import { enrichAppointment } from '../../utils/appointmentMapping';
import { fetchCalendarDataAPI, rescheduleAppointmentAPI } from './calendarAPI';
import axiosClient from '../../services/axiosClient';
import {
  fetchCalendarDataRequest,
  fetchCalendarDataSuccess,
  fetchCalendarDataFailure,
  rescheduleAppointmentRequest,
  rescheduleAppointmentSuccess,
  rescheduleAppointmentFailure,
  updateCalendarNotesPreview,
} from './calendarSlice';
import {
  createAppointmentSuccess,
  updateAppointmentSuccess,
  cancelAppointmentSuccess,
  deleteAppointmentSuccess,
} from '../appointments/appointmentSlice';

const extractMessages = (payload) => {
  const data = payload?.data ?? payload;
  return Array.isArray(data) ? data : [];
};

const buildLatestNotesMap = (payload) =>
  extractMessages(payload).reduce((acc, item) => {
    const appointmentId = Number(item?.appointment_id);
    const latestMessage = item?.latest_message;

    if (Number.isFinite(appointmentId) && typeof latestMessage === 'string') {
      acc[appointmentId] = latestMessage;
    }

    return acc;
  }, {});

const fetchAppointmentMessageSummariesAPI = async (appointmentIds = []) => {
  const params = Array.isArray(appointmentIds) && appointmentIds.length > 0
    ? { appointment_ids: appointmentIds.join(',') }
    : {};

  const response = await axiosClient.get('/messages', {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
    params,
  });

  return response.data;
};

// ── Fetch calendar data ───────────────────────────────────────────────────────
function* handleFetchCalendarData() {
  try {
    const { selectedDoctor } = yield select((state) => state.calendar);
    const currentUser = yield select((state) => state.auth.user);
    const currentRole = String(currentUser?.role || '').toLowerCase();
    const isProvider = currentRole === 'provider';

    const params = {
      per_page: 200, // get all for calendar view
      ...((isProvider ? currentUser?.id : selectedDoctor) && {
        doctor_id: isProvider ? currentUser.id : selectedDoctor,
      }),
    };

    // race() — timeout after 10 seconds
    const { response, timeout } = yield race({
      response: call(fetchCalendarDataAPI, params),
      timeout: delay(10000),
    });

    if (timeout) {
      yield put(fetchCalendarDataFailure('Request timed out. Please try again.'));
      return;
    }

    const raw = response.data ?? response;
    const enriched = Array.isArray(raw) ? raw.map(enrichAppointment) : [];
    const appointmentIds = enriched.map((appointment) => appointment.id).filter(Boolean);
    const latestNotesResponse = appointmentIds.length
      ? yield call(fetchAppointmentMessageSummariesAPI, appointmentIds)
      : { data: [] };
    const latestNotesMap = buildLatestNotesMap(latestNotesResponse);
    const hydrated = enriched.map((appointment) =>
      Object.prototype.hasOwnProperty.call(latestNotesMap, appointment.id)
        ? { ...appointment, notes: latestNotesMap[appointment.id] }
        : appointment
    );
    const scoped = isProvider
      ? hydrated.filter(
          (appointment) => Number(appointment.doctor_id) === Number(currentUser?.id)
        )
      : hydrated;

    yield put(fetchCalendarDataSuccess(scoped));
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to load calendar data.';
    yield put(fetchCalendarDataFailure(message));
  }
}

// ── Reschedule (drag & drop) ──────────────────────────────────────────────────
function* handleRescheduleAppointment(action) {
  try {
    const { id, newDate, newTime } = action.payload;
    const scheduled_at = `${newDate} ${newTime}`;

    const { response, timeout } = yield race({
      response: call(rescheduleAppointmentAPI, { id, scheduled_at }),
      timeout: delay(10000),
    });

    if (timeout) {
      yield put(rescheduleAppointmentFailure('Reschedule timed out. Please try again.'));
      yield put(fetchCalendarDataRequest()); // rollback
      return;
    }

    // Success! 
    // If backend returns the object, use it. If not, use our local state + payload.
    const responseData = response.data ?? response;
    
    if (typeof responseData === 'object' && responseData.id) {
      yield put(rescheduleAppointmentSuccess(enrichAppointment(responseData)));
    } else {
      // If backend just says "Success", we pass the ID and new data to success action
      // so the slice can finalize the update.
      yield put(rescheduleAppointmentSuccess({ 
        id, 
        scheduled_at,
        message: typeof responseData === 'string' ? responseData : 'Rescheduled successfully'
      }));
    }

    // Refresh data to ensure UI is in sync
    yield put(fetchCalendarDataRequest());
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to reschedule appointment.';
    yield put(rescheduleAppointmentFailure(message));
    yield put(fetchCalendarDataRequest()); // rollback on error
  }
}

// ── Root watcher ──────────────────────────────────────────────────────────────
export default function* calendarSaga() {
  yield takeLatest(fetchCalendarDataRequest.type, handleFetchCalendarData);
  yield takeLatest(rescheduleAppointmentRequest.type, handleRescheduleAppointment);

  // Sync calendar when appointments change anywhere in the app
  // Note: takeLatest does not reliably support arrays — use separate calls
  yield takeLatest(createAppointmentSuccess.type, handleFetchCalendarData);
  yield takeLatest(updateAppointmentSuccess.type, handleFetchCalendarData);
  yield takeLatest(cancelAppointmentSuccess.type, handleFetchCalendarData);
  yield takeLatest(deleteAppointmentSuccess.type, handleFetchCalendarData);
}
