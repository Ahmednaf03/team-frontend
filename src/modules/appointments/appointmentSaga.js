import { call, put, takeLatest, takeEvery, select } from 'redux-saga/effects';
import {
  fetchAppointmentsAPI,
  fetchAppointmentByIdAPI,
  fetchUpcomingAppointmentsAPI,
  createAppointmentAPI,
  updateAppointmentAPI,
  cancelAppointmentAPI,
  deleteAppointmentAPI,
} from './appointmentAPI';

import {
  enrichAppointment,
  extractCollection,
  unwrapAppointment,
} from '../../utils/appointmentMapping';
import { buildPaginationCacheKey } from '../../utils/paginationCache';
import { getEntityDisplayName, matchesSearch } from '../../utils/entityDisplay';
import axiosClient from '../../services/axiosClient';
import { fetchAllPatientsAPI } from '../patients/patientAPI';
import { fetchAllStaffAPI } from '../staff/staffAPI';

import {
  fetchAppointmentsRequest,
  fetchAppointmentsSuccess,
  fetchAppointmentsFailure,
  prefetchAppointmentsRequest,
  prefetchAppointmentsSuccess,
  prefetchAppointmentsFailure,
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

const buildFallbackPage = (items, page, pageSize) => {
  const totalRecords = items.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startIdx = (page - 1) * pageSize;

  return {
    data: items.slice(startIdx, startIdx + pageSize),
    pagination: {
      currentPage: page,
      totalPages,
      totalRecords,
      perPage: pageSize,
    },
  };
};

const buildLookup = (records = []) =>
  records.reduce((acc, record) => {
    const id = Number(record?.id);
    const name = getEntityDisplayName(record);

    if (Number.isFinite(id) && name) {
      acc[id] = name;
    }

    return acc;
  }, {});

const isDoctorRecord = (record) => {
  const roleValue = `${record?.role || record?.staff_role || record?.designation || ''}`.toLowerCase();
  return (
    roleValue === 'provider' ||
    roleValue.includes('doctor') ||
    roleValue.includes('physician')
  );
};

const fetchAppointmentLookups = async () => {
  const [patientsEnvelope, staffEnvelope] = await Promise.all([
    fetchAllPatientsAPI({ per_page: 500 }).catch(() => ({ data: [] })),
    fetchAllStaffAPI({ per_page: 500 }).catch(() => ({ data: [] })),
  ]);

  const patientRecords = Array.isArray(patientsEnvelope?.data) ? patientsEnvelope.data : [];
  const staffRecords = Array.isArray(staffEnvelope?.data) ? staffEnvelope.data : [];
  const doctorRecords = staffRecords.filter(isDoctorRecord);

  return {
    patients: buildLookup(patientRecords),
    doctors: buildLookup(doctorRecords),
  };
};

const applyAppointmentSearch = (appointments, searchQuery) => {
  const q = String(searchQuery || '').trim().toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);

  if (!q) {
    return appointments;
  }

  return appointments.filter((appointment) => {
    const searchableFields = [
      appointment?.patient_name,
      appointment?.doctor_name,
      appointment?.patient_id,
      appointment?.doctor_id,
      appointment?.id,
    ];

    return tokens.every((token) =>
      searchableFields.some((value) => matchesSearch(value, token))
    );
  });
};

const applyAppointmentDateFilters = (appointments, dateFrom, dateTo) => {
  if (!dateFrom && !dateTo) {
    return appointments;
  }

  const start = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
  const end = dateTo ? new Date(`${dateTo}T23:59:59.999`) : null;

  return appointments.filter((appointment) => {
    if (!appointment?.scheduled_at) {
      return false;
    }

    const scheduledAt = new Date(appointment.scheduled_at);

    if (Number.isNaN(scheduledAt.getTime())) {
      return false;
    }

    if (start && scheduledAt < start) {
      return false;
    }

    if (end && scheduledAt > end) {
      return false;
    }

    return true;
  });
};

const applyAppointmentFilters = (appointments, filters) => {
  let result = appointments;

  if (filters.status) {
    result = result.filter((appointment) => appointment?.status === filters.status);
  }

  result = applyAppointmentDateFilters(result, filters.dateFrom, filters.dateTo);

  if (filters.search?.trim()) {
    result = applyAppointmentSearch(result, filters.search);
  }

  return result;
};

const scopeAppointments = (appointments, isProvider, currentUser) =>
  isProvider
    ? appointments.filter(
        (appointment) =>
          Number(appointment.doctor_id) === Number(currentUser?.id)
      )
    : appointments;

function* buildAppointmentPayload({
  apiParams,
  requestedPage,
  pageSize,
  isProvider,
  currentUser,
  useLocalFiltering,
  filters,
}) {
  const responseData = yield call(fetchAppointmentsAPI, apiParams);
  const lookups = useLocalFiltering
    ? yield call(fetchAppointmentLookups)
    : {};

  const enrichedData = extractCollection(responseData).map((appointment) =>
    enrichAppointment(appointment, lookups)
  );

  const appointmentIds = enrichedData
    .map((appointment) => appointment.id)
    .filter(Boolean);

  const latestNotesResponse = appointmentIds.length
    ? yield call(fetchAppointmentMessageSummariesAPI, appointmentIds)
    : { data: [] };

  const latestNotesMap = buildLatestNotesMap(latestNotesResponse);

  const hydratedData = enrichedData.map((appointment) =>
    Object.prototype.hasOwnProperty.call(latestNotesMap, appointment.id)
      ? { ...appointment, notes: latestNotesMap[appointment.id] }
      : appointment
  );

  const scopedData = scopeAppointments(hydratedData, isProvider, currentUser);
  const finalData = useLocalFiltering
    ? applyAppointmentFilters(scopedData, filters)
    : scopedData;

  const paginatedPayload =
    useLocalFiltering || !responseData.pagination
      ? buildFallbackPage(finalData, requestedPage, pageSize)
      : {
          data: finalData,
          pagination: responseData.pagination,
        };

  return paginatedPayload;
}

// ── Fetch all appointments ────────────────────────────────────────────────
function* handleFetchAppointments(action) {
  try {
    const { filters, pagination } = yield select((state) => state.appointments);
    const currentUser = yield select((state) => state.auth.user);
    const currentRole = String(currentUser?.role || '').toLowerCase();
    const isProvider = currentRole === 'provider';

    const requestedPage = action.payload?.page ?? pagination.currentPage;
    const force = Boolean(action.payload?.force);
    const useLocalFiltering = Boolean(
      filters.search?.trim() || filters.dateFrom || filters.dateTo
    );

    const queryKey = buildPaginationCacheKey(filters);

    const cachedPage = yield select(
      (state) => state.appointments.pageCache[queryKey]?.[requestedPage]
    );

    if (cachedPage && !force) {
      yield put(hydrateAppointmentsFromCache({ page: requestedPage, queryKey }));
      return;
    }

    const apiParams = {
      page: useLocalFiltering ? 1 : requestedPage,
      per_page: useLocalFiltering ? 500 : pagination.perPage,
      ...(!useLocalFiltering && filters.status && { status: filters.status }),
      ...((isProvider ? currentUser?.id : filters.doctorId) && {
        doctor_id: isProvider ? currentUser.id : filters.doctorId,
      }),
      ...(filters.patientId && { patient_id: filters.patientId }),
      ...(!useLocalFiltering && filters.dateFrom && { date_from: filters.dateFrom }),
      ...(!useLocalFiltering && filters.dateTo && { date_to: filters.dateTo }),
      ...(!useLocalFiltering && filters.search && { search: filters.search }),
    };

    const paginatedPayload = yield call(buildAppointmentPayload, {
      apiParams,
      requestedPage,
      pageSize: pagination.perPage,
      isProvider,
      currentUser,
      useLocalFiltering,
      filters,
    });

    yield put(
      fetchAppointmentsSuccess({
        data: paginatedPayload.data,
        pagination: paginatedPayload.pagination,
        page: requestedPage,
        queryKey,
      })
    );
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Failed to fetch appointments.';
    yield put(fetchAppointmentsFailure(message));
  }
}

function* handlePrefetchAppointments(action) {
  try {
    const { filters, pagination } = yield select((state) => state.appointments);
    const currentUser = yield select((state) => state.auth.user);
    const currentRole = String(currentUser?.role || '').toLowerCase();
    const isProvider = currentRole === 'provider';

    const requestedPage = action.payload?.page;
    const queryKey = action.payload?.queryKey ?? buildPaginationCacheKey(filters);
    const useLocalFiltering = Boolean(
      filters.search?.trim() || filters.dateFrom || filters.dateTo
    );

    if (!requestedPage) {
      return;
    }

    const cachedPage = yield select(
      (state) => state.appointments.pageCache[queryKey]?.[requestedPage]
    );

    if (cachedPage) {
      yield put(prefetchAppointmentsFailure({ page: requestedPage, queryKey }));
      return;
    }

    const apiParams = {
      page: useLocalFiltering ? 1 : requestedPage,
      per_page: useLocalFiltering ? 500 : pagination.perPage,
      ...(!useLocalFiltering && filters.status && { status: filters.status }),
      ...((isProvider ? currentUser?.id : filters.doctorId) && {
        doctor_id: isProvider ? currentUser.id : filters.doctorId,
      }),
      ...(filters.patientId && { patient_id: filters.patientId }),
      ...(!useLocalFiltering && filters.dateFrom && { date_from: filters.dateFrom }),
      ...(!useLocalFiltering && filters.dateTo && { date_to: filters.dateTo }),
      ...(!useLocalFiltering && filters.search && { search: filters.search }),
    };

    const paginatedPayload = yield call(buildAppointmentPayload, {
      apiParams,
      requestedPage,
      pageSize: pagination.perPage,
      isProvider,
      currentUser,
      useLocalFiltering,
      filters,
    });

    yield put(
      prefetchAppointmentsSuccess({
        data: paginatedPayload.data,
        pagination: paginatedPayload.pagination,
        page: requestedPage,
        queryKey,
      })
    );
  } catch (error) {
    yield put(
      prefetchAppointmentsFailure({
        page: action.payload?.page,
        queryKey: action.payload?.queryKey,
      })
    );
  }
}

// ── Fetch upcoming ────────────────────────────────────────────────────────
function* handleFetchUpcoming() {
  try {
    const currentUser = yield select((state) => state.auth.user);
    const currentRole = String(currentUser?.role || '').toLowerCase();
    const isProvider = currentRole === 'provider';

    const responseData = yield call(fetchUpcomingAppointmentsAPI);
    const data = extractCollection(responseData);

    const enrichedData = Array.isArray(data)
      ? data.map(enrichAppointment)
      : data;

    const scopedData =
      isProvider && Array.isArray(enrichedData)
        ? enrichedData.filter(
            (appointment) =>
              Number(appointment.doctor_id) === Number(currentUser?.id)
          )
        : enrichedData;

    yield put(fetchUpcomingSuccess(scopedData));
  } catch (error) {
    const message =
      error.response?.data?.message ||
      'Failed to fetch upcoming appointments.';
    yield put(fetchUpcomingFailure(message));
  }
}

// ── Fetch by ID ───────────────────────────────────────────────────────────
function* handleFetchAppointmentById(action) {
  try {
    const responseData = yield call(fetchAppointmentByIdAPI, action.payload);
    const data = unwrapAppointment(responseData);
    yield put(fetchAppointmentByIdSuccess(enrichAppointment(data)));
  } catch (error) {
    const message =
      error.response?.data?.message ||
      'Failed to fetch appointment.';
    yield put(fetchAppointmentByIdFailure(message));
  }
}

// ── Create ────────────────────────────────────────────────────────────────
function* handleCreateAppointment(action) {
  try {
    const responseData = yield call(createAppointmentAPI, action.payload);
    const data = unwrapAppointment(responseData);
    yield put(createAppointmentSuccess(enrichAppointment(data)));

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

// ── Update ────────────────────────────────────────────────────────────────
function* handleUpdateAppointment(action) {
  try {
    const { pagination } = yield select((state) => state.appointments);
    const responseData = yield call(updateAppointmentAPI, action.payload);
    yield put(
      updateAppointmentSuccess({
        message: responseData.message || responseData,
        updatedAppointment: action.payload,
      })
    );

    yield put(
      fetchAppointmentsRequest({
        page: pagination.currentPage,
        force: true,
      })
    );
    yield put(fetchUpcomingRequest());
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Failed to update appointment.';
    yield put(updateAppointmentFailure(message));
  }
}

// ── Cancel ────────────────────────────────────────────────────────────────
function* handleCancelAppointment(action) {
  try {
    const { pagination } = yield select((state) => state.appointments);
    const responseData = yield call(cancelAppointmentAPI, action.payload);
    yield put(cancelAppointmentSuccess(responseData.message || responseData));

    yield put(
      fetchAppointmentsRequest({
        page: pagination.currentPage,
        force: true,
      })
    );
    yield put(fetchUpcomingRequest());
  } catch (error) {
    const message =
      error.response?.data?.message ||
      'Failed to cancel appointment.';
    yield put(cancelAppointmentFailure(message));
  }
}

// ── Delete ────────────────────────────────────────────────────────────────
function* handleDeleteAppointment(action) {
  try {
    yield call(deleteAppointmentAPI, action.payload);
    yield put(deleteAppointmentSuccess(action.payload));
  } catch (error) {
    const message =
      error.response?.data?.message ||
      'Failed to delete appointment.';
    yield put(deleteAppointmentFailure(message));
  }
}

// ── Root watcher ──────────────────────────────────────────────────────────
export default function* appointmentSaga() {
  yield takeLatest(fetchAppointmentsRequest.type, handleFetchAppointments);
  yield takeEvery(prefetchAppointmentsRequest.type, handlePrefetchAppointments);
  yield takeLatest(fetchUpcomingRequest.type, handleFetchUpcoming);
  yield takeLatest(fetchAppointmentByIdRequest.type, handleFetchAppointmentById);
  yield takeLatest(createAppointmentRequest.type, handleCreateAppointment);
  yield takeLatest(updateAppointmentRequest.type, handleUpdateAppointment);
  yield takeLatest(cancelAppointmentRequest.type, handleCancelAppointment);
  yield takeLatest(deleteAppointmentRequest.type, handleDeleteAppointment);
}
