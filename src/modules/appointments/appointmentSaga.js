import { all, call, put, takeLatest, select } from 'redux-saga/effects';
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
import { buildPaginationCacheKey } from '../../utils/paginationCache';
import { fetchAppointmentMessagesAPI } from '../chat/chatAPI';
import {
  fetchAppointmentsRequest,
  fetchAppointmentsSuccess,
  fetchAppointmentsFailure,
  hydrateAppointmentsFromCache,
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

const resolveLatestThreadNote = async (appointment) => {
  try {
    const response = await fetchAppointmentMessagesAPI(appointment.id);
    const messages = extractMessages(response);
    const latestMessage = messages[messages.length - 1];

    return latestMessage?.message
      ? { appointmentId: appointment.id, notes: latestMessage.message }
      : null;
  } catch (error) {
    return null;
  }
};

// ── Fetch all appointments (with current filters + pagination) ─────────────────
function* handleFetchAppointments(action) {
  try {
    const { filters, pagination } = yield select((state) => state.appointments);
    const requestedPage = action.payload?.page ?? pagination.currentPage;
    const prefetch = Boolean(action.payload?.prefetch);
    const force = Boolean(action.payload?.force);
    const queryKey = buildPaginationCacheKey(filters);
    const cachedPage = yield select(
      (state) => state.appointments.pageCache[queryKey]?.[requestedPage]
    );

    if (cachedPage && !force) {
      if (!prefetch) {
        yield put(hydrateAppointmentsFromCache({ page: requestedPage, queryKey }));
      }
      return;
    }

    const params = {
      page: requestedPage,
      per_page: pagination.perPage,
      ...(filters.status && { status: filters.status }),
      ...(filters.doctorId && { doctor_id: filters.doctorId }),
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
    const latestNotesByAppointment = yield all(
      enrichedData.map((appointment) => call(resolveLatestThreadNote, appointment))
    );
    const latestNotesMap = latestNotesByAppointment.reduce((acc, entry) => {
      if (entry?.appointmentId && typeof entry.notes === 'string') {
        acc[entry.appointmentId] = entry.notes;
      }
      return acc;
    }, {});
    const hydratedData = enrichedData.map((appointment) =>
      Object.prototype.hasOwnProperty.call(latestNotesMap, appointment.id)
        ? { ...appointment, notes: latestNotesMap[appointment.id] }
        : appointment
    );

    yield put(
      fetchAppointmentsSuccess({
        data: hydratedData,
        pagination: responseData.pagination ?? null,
        page: requestedPage,
        queryKey,
        prefetch,
      })
    );
  } catch (error) {
    console.log('Fetch error:', error);
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Failed to fetch appointments.';
    yield put(fetchAppointmentsFailure({ message, prefetch: action.payload?.prefetch }));
  }
}

// ── Fetch upcoming ────────────────────────────────────────────────────────────
function* handleFetchUpcoming() {
  try {
    const responseData = yield call(fetchUpcomingAppointmentsAPI);
    const data = extractCollection(responseData);
    const enrichedData = Array.isArray(data) ? data.map(enrichAppointment) : data;
    yield put(fetchUpcomingSuccess(enrichedData));
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
