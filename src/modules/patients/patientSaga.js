import { call, put, takeLatest, takeEvery, select } from 'redux-saga/effects';
import {
  fetchAllPatientsAPI,
  fetchPatientByIdAPI,
  createPatientAPI,
  updatePatientAPI,
  deletePatientAPI,
} from './patientAPI';
import { buildPaginationCacheKey } from '../../utils/paginationCache';
import {
  fetchPatientsRequest,
  fetchPatientsSuccess,
  fetchPatientsFailure,
  hydratePatientsFromCache,
  fetchPatientByIdRequest,
  fetchPatientByIdSuccess,
  fetchPatientByIdFailure,
  createPatientRequest,
  createPatientSuccess,
  createPatientFailure,
  updatePatientRequest,
  updatePatientSuccess,
  updatePatientFailure,
  deletePatientRequest,
  deletePatientSuccess,
  deletePatientFailure,
} from './patientSlice';

const applySearch = (patients, searchQuery) => {
  const q = searchQuery.toLowerCase().trim();

  if (!q) {
    return patients;
  }

  return patients.filter(
    (patient) =>
      patient.name?.toLowerCase().includes(q) ||
      patient.phone?.toLowerCase().includes(q) ||
      patient.diagnosis?.toLowerCase().includes(q) ||
      patient.gender?.toLowerCase().includes(q)
  );
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

function* handleFetchPatients(action) {
  try {
    const { pagination, searchQuery } = yield select((state) => state.patients);
    const requestedPage = action.payload?.page ?? pagination.page;
    const prefetch = Boolean(action.payload?.prefetch);
    const force = Boolean(action.payload?.force);
    const queryKey = buildPaginationCacheKey({ search: searchQuery });
    const cachedPage = yield select(
      (state) => state.patients.pageCache[queryKey]?.[requestedPage]
    );

    if (cachedPage && !force) {
      if (!prefetch) {
        yield put(hydratePatientsFromCache({ page: requestedPage, queryKey }));
      }
      return;
    }

    const params = {
      page: requestedPage,
      per_page: pagination.pageSize,
      ...(searchQuery && { search: searchQuery }),
    };

    const envelope = yield call(fetchAllPatientsAPI, params);
    const responseData = Array.isArray(envelope?.data) ? envelope.data : [];
    const paginatedPayload = envelope?.pagination
      ? {
          data: responseData,
          pagination: envelope.pagination,
        }
      : buildFallbackPage(applySearch(responseData, searchQuery), requestedPage, pagination.pageSize);

    yield put(
      fetchPatientsSuccess({
        data: paginatedPayload.data,
        pagination: paginatedPayload.pagination,
        page: requestedPage,
        queryKey,
        prefetch,
      })
    );
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to fetch patients.';
    yield put(fetchPatientsFailure({ message, prefetch: action.payload?.prefetch }));
  }
}

function* handleFetchPatientById(action) {
  try {
    const envelope = yield call(fetchPatientByIdAPI, action.payload);
    const patient = envelope.data;
    yield put(fetchPatientByIdSuccess(patient));
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to fetch patient.';
    yield put(fetchPatientByIdFailure(message));
  }
}

function* handleCreatePatient(action) {
  try {
    yield call(createPatientAPI, action.payload.data);
    yield put(createPatientSuccess());
    yield put(fetchPatientsRequest({ page: 1, force: true }));
    if (action.payload.onSuccess) action.payload.onSuccess();
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to create patient.';
    yield put(createPatientFailure(message));
  }
}

function* handleUpdatePatient(action) {
  try {
    yield call(updatePatientAPI, { id: action.payload.id, data: action.payload.data });
    yield put(updatePatientSuccess());
    yield put(fetchPatientsRequest({ page: 1, force: true }));
    if (action.payload.onSuccess) action.payload.onSuccess();
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to update patient.';
    yield put(updatePatientFailure(message));
  }
}

function* handleDeletePatient(action) {
  try {
    yield call(deletePatientAPI, action.payload.id);
    yield put(deletePatientSuccess());
    yield put(fetchPatientsRequest({ page: 1, force: true }));
    if (action.payload.onSuccess) action.payload.onSuccess();
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to delete patient.';
    yield put(deletePatientFailure(message));
  }
}

export default function* patientSaga() {
  yield takeLatest(fetchPatientsRequest.type, handleFetchPatients);
  yield takeLatest(fetchPatientByIdRequest.type, handleFetchPatientById);
  yield takeEvery(createPatientRequest.type, handleCreatePatient);
  yield takeEvery(updatePatientRequest.type, handleUpdatePatient);
  yield takeEvery(deletePatientRequest.type, handleDeletePatient);
}
