import { call, put, takeLatest, select } from 'redux-saga/effects';
import {
  fetchAppointmentsAPI,
  fetchAppointmentByIdAPI,
  fetchUpcomingAppointmentsAPI,
  createAppointmentAPI,
  updateAppointmentAPI,
  cancelAppointmentAPI,
  deleteAppointmentAPI,
} from './appointmentAPI';
import { enrichAppointment, extractCollection, unwrapAppointment } from '../../utils/appointmentMapping';
import { fetchAppointmentMessageSummariesAPI } from '../chat/chatAPI';
import {
  fetchAppointmentsRequest,
  fetchAppointmentsSuccess,
  fetchAppointmentsFailure,
  fetchUpcomingRequest,
  fetchUpcomingSuccess,
  fetchUpcomingFailure,
  fetchAppointmentByIdRequest,
  fetchAppointmentByIdSuccess,
  fetchAppointmentByIdFailure,
  createAppointmentRequest,
  createAppointmentSuccess,
  createAppointmentFailure,
  updateAppointmentRequest,
  updateAppointmentSuccess,
  updateAppointmentFailure,
  cancelAppointmentRequest,
  cancelAppointmentSuccess,
  cancelAppointmentFailure,
  deleteAppointmentRequest,
  deleteAppointmentSuccess,
  deleteAppointmentFailure,
} from './appointmentSlice';

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

// ── Fetch all appointments (with current filters + pagination) ─────────────────
function* handleFetchAppointments() {
  try {
    const { filters, pagination } = yield select((state) => state.appointments);
    const currentUser = yield select((state) => state.auth.user);
    const currentRole = String(currentUser?.role || '').toLowerCase();
    const isProvider = currentRole === 'provider';

    const params = {
      page: pagination.currentPage,
      per_page: pagination.perPage,
      ...(filters.status && { status: filters.status }),
      ...((isProvider ? currentUser?.id : filters.doctorId) && {
        doctor_id: isProvider ? currentUser.id : filters.doctorId,
      }),
      ...(filters.patientId && { patient_id: filters.patientId }),
      ...(filters.dateFrom && { date_from: filters.dateFrom }),
      ...(filters.dateTo && { date_to: filters.dateTo }),
      ...(filters.search && { search: filters.search }),
    };

    const responseData = yield call(fetchAppointmentsAPI, params);
    console.log('API Response:', responseData);

    // Backend returns: { data: [...], pagination: { currentPage, totalPages, ... } }
    const enrichedData = extractCollection(responseData).map((appointment) =>
      enrichAppointment(appointment)
    );
    const appointmentIds = enrichedData.map((appointment) => appointment.id).filter(Boolean);
    const latestNotesResponse = appointmentIds.length
      ? yield call(fetchAppointmentMessageSummariesAPI, appointmentIds)
      : { data: [] };
    const latestNotesMap = buildLatestNotesMap(latestNotesResponse);
    const hydratedData = enrichedData.map((appointment) =>
      Object.prototype.hasOwnProperty.call(latestNotesMap, appointment.id)
        ? { ...appointment, notes: latestNotesMap[appointment.id] }
        : appointment
    );
    const scopedData = isProvider
      ? hydratedData.filter(
          (appointment) => Number(appointment.doctor_id) === Number(currentUser?.id)
        )
      : hydratedData;

    yield put(
      fetchAppointmentsSuccess({
        data: scopedData,
        pagination: responseData.pagination ?? null,
      })
    );
  } catch (error) {
    console.log('Fetch error:', error);
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Failed to fetch appointments.';
    yield put(fetchAppointmentsFailure(message));
  }
}

// ── Fetch upcoming ────────────────────────────────────────────────────────────
function* handleFetchUpcoming() {
  try {
    const currentUser = yield select((state) => state.auth.user);
    const currentRole = String(currentUser?.role || '').toLowerCase();
    const isProvider = currentRole === 'provider';
    const responseData = yield call(fetchUpcomingAppointmentsAPI);
    const data = extractCollection(responseData);
    const enrichedData = Array.isArray(data) ? data.map(enrichAppointment) : data;
    const scopedData = isProvider && Array.isArray(enrichedData)
      ? enrichedData.filter(
          (appointment) => Number(appointment.doctor_id) === Number(currentUser?.id)
        )
      : enrichedData;
    yield put(fetchUpcomingSuccess(scopedData));
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to fetch upcoming appointments.';
    yield put(fetchUpcomingFailure(message));
  }
}

// ── Fetch by ID ───────────────────────────────────────────────────────────────
function* handleFetchAppointmentById(action) {
  try {
    const responseData = yield call(fetchAppointmentByIdAPI, action.payload);
    const data = unwrapAppointment(responseData);
    yield put(fetchAppointmentByIdSuccess(enrichAppointment(data)));
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to fetch appointment.';
    yield put(fetchAppointmentByIdFailure(message));
  }
}

// ── Create ────────────────────────────────────────────────────────────────────
function* handleCreateAppointment(action) {
  try {
    const responseData = yield call(createAppointmentAPI, action.payload);
    const data = unwrapAppointment(responseData);
    yield put(createAppointmentSuccess(enrichAppointment(data)));

    // Refresh data to ensure UI is in sync
    yield put(fetchAppointmentsRequest());
    yield put(fetchUpcomingRequest());
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Failed to create appointment.';
    yield put(createAppointmentFailure(message));
  }
}

// ── Update (reschedule) ───────────────────────────────────────────────────────
function* handleUpdateAppointment(action) {
  try {
    const responseData = yield call(updateAppointmentAPI, action.payload);
    // Backend returns a success string, not the updated object
    yield put(updateAppointmentSuccess(responseData.message || responseData));

    // Refresh data to ensure UI is in sync
    yield put(fetchAppointmentsRequest());
    yield put(fetchUpcomingRequest());
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Failed to update appointment.';
    yield put(updateAppointmentFailure(message));
  }
}

// ── Cancel ────────────────────────────────────────────────────────────────────
function* handleCancelAppointment(action) {
  try {
    const responseData = yield call(cancelAppointmentAPI, action.payload);
    // Backend returns a success string
    yield put(cancelAppointmentSuccess(responseData.message || responseData));

    // Refresh data to ensure UI is in sync
    yield put(fetchAppointmentsRequest());
    yield put(fetchUpcomingRequest());
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to cancel appointment.';
    yield put(cancelAppointmentFailure(message));
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
function* handleDeleteAppointment(action) {
  try {
    console.log("action payload data: ", action.payload);
    yield call(deleteAppointmentAPI, action.payload);
    yield put(deleteAppointmentSuccess(action.payload)); // pass id for list removal
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to delete appointment.';
    yield put(deleteAppointmentFailure(message));
  }
}

// ── Root watcher ──────────────────────────────────────────────────────────────
export default function* appointmentSaga() {
  yield takeLatest(fetchAppointmentsRequest.type, handleFetchAppointments);
  yield takeLatest(fetchUpcomingRequest.type, handleFetchUpcoming);
  yield takeLatest(fetchAppointmentByIdRequest.type, handleFetchAppointmentById);
  yield takeLatest(createAppointmentRequest.type, handleCreateAppointment);
  yield takeLatest(updateAppointmentRequest.type, handleUpdateAppointment);
  yield takeLatest(cancelAppointmentRequest.type, handleCancelAppointment);
  yield takeLatest(deleteAppointmentRequest.type, handleDeleteAppointment);
}
