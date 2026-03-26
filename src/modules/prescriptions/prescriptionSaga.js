import { call, put, takeLatest, takeEvery, select } from 'redux-saga/effects';
import {
  fetchAllPrescriptionsAPI,
  fetchPrescriptionByIdAPI,
  createPrescriptionAPI,
  addPrescriptionItemAPI,
  verifyPrescriptionAPI,
  dispensePrescriptionAPI,
} from './prescriptionAPI';
import { buildPaginationCacheKey } from '../../utils/paginationCache';
import {
  fetchPrescriptionsRequest,
  fetchPrescriptionsSuccess,
  fetchPrescriptionsFailure,
  hydratePrescriptionsFromCache,
  fetchPrescriptionByIdRequest,
  fetchPrescriptionByIdSuccess,
  fetchPrescriptionByIdFailure,
  createPrescriptionRequest,
  createPrescriptionSuccess,
  createPrescriptionFailure,
  addItemRequest,
  addItemSuccess,
  addItemFailure,
  verifyRequest,
  verifySuccess,
  verifyFailure,
  dispenseRequest,
  dispenseSuccess,
  dispenseFailure,
} from './prescriptionSlice';

const applyFilters = (prescriptions, searchQuery, statusFilter) => {
  let result = prescriptions;

  if (statusFilter && statusFilter !== 'ALL') {
    result = result.filter((prescription) => prescription.status === statusFilter);
  }

  const q = searchQuery.toLowerCase().trim();

  if (!q) {
    return result;
  }

  return result.filter(
    (prescription) =>
      String(prescription.id).includes(q) ||
      String(prescription.patient_id).includes(q) ||
      String(prescription.doctor_id).includes(q) ||
      prescription.status?.toLowerCase().includes(q)
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

function* handleFetchPrescriptions(action) {
  try {
    const { pagination, searchQuery, statusFilter } = yield select(
      (state) => state.prescriptions
    );
    const requestedPage = action.payload?.page ?? pagination.page;
    const prefetch = Boolean(action.payload?.prefetch);
    const force = Boolean(action.payload?.force);
    const queryKey = buildPaginationCacheKey({
      search: searchQuery,
      status: statusFilter,
    });
    const cachedPage = yield select(
      (state) => state.prescriptions.pageCache[queryKey]?.[requestedPage]
    );

    if (cachedPage && !force) {
      if (!prefetch) {
        yield put(hydratePrescriptionsFromCache({ page: requestedPage, queryKey }));
      }
      return;
    }

    const params = {
      page: requestedPage,
      per_page: pagination.pageSize,
      ...(searchQuery && { search: searchQuery }),
      ...(statusFilter !== 'ALL' && { status: statusFilter }),
    };

    const envelope = yield call(fetchAllPrescriptionsAPI, params);
    const responseData = Array.isArray(envelope?.data) ? envelope.data : [];
    const paginatedPayload = envelope?.pagination
      ? {
          data: responseData,
          pagination: envelope.pagination,
        }
      : buildFallbackPage(
          applyFilters(responseData, searchQuery, statusFilter),
          requestedPage,
          pagination.pageSize
        );

    yield put(
      fetchPrescriptionsSuccess({
        data: paginatedPayload.data,
        pagination: paginatedPayload.pagination,
        page: requestedPage,
        queryKey,
        prefetch,
      })
    );
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch prescriptions.';
    yield put(fetchPrescriptionsFailure({ message, prefetch: action.payload?.prefetch }));
  }
}

function* handleFetchPrescriptionById(action) {
  try {
    const envelope = yield call(fetchPrescriptionByIdAPI, action.payload);
    yield put(fetchPrescriptionByIdSuccess(envelope.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch prescription.';
    yield put(fetchPrescriptionByIdFailure(message));
  }
}

function* handleCreatePrescription(action) {
  try {
    const envelope = yield call(createPrescriptionAPI, action.payload.data);
    yield put(createPrescriptionSuccess());
    yield put(fetchPrescriptionsRequest({ page: 1, force: true }));
    if (action.payload.onSuccess) {
      action.payload.onSuccess(envelope.data);
    }
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create prescription.';
    yield put(createPrescriptionFailure(message));
  }
}

function* handleAddItem(action) {
  try {
    yield call(addPrescriptionItemAPI, action.payload.data);
    yield put(addItemSuccess());
    if (action.payload.prescriptionId) {
      yield put(fetchPrescriptionByIdRequest(action.payload.prescriptionId));
    }
    yield put(fetchPrescriptionsRequest({ page: 1, force: true }));
    if (action.payload.onSuccess) action.payload.onSuccess();
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to add item.';
    yield put(addItemFailure(message));
  }
}

function* handleVerify(action) {
  try {
    yield call(verifyPrescriptionAPI, action.payload.id);
    yield put(verifySuccess());
    yield put(fetchPrescriptionsRequest({ page: 1, force: true }));
    if (action.payload.onSuccess) action.payload.onSuccess();
  } catch (error) {
    const message = error.response?.data?.message || 'Verification failed.';
    yield put(verifyFailure(message));
  }
}

function* handleDispense(action) {
  try {
    yield call(dispensePrescriptionAPI, action.payload.id);
    yield put(dispenseSuccess());
    yield put(fetchPrescriptionsRequest({ page: 1, force: true }));
    if (action.payload.onSuccess) action.payload.onSuccess();
  } catch (error) {
    const message = error.response?.data?.message || 'Dispense failed.';
    yield put(dispenseFailure(message));
  }
}

export default function* prescriptionSaga() {
  yield takeLatest(fetchPrescriptionsRequest.type, handleFetchPrescriptions);
  yield takeLatest(fetchPrescriptionByIdRequest.type, handleFetchPrescriptionById);
  yield takeEvery(createPrescriptionRequest.type, handleCreatePrescription);
  yield takeEvery(addItemRequest.type, handleAddItem);
  yield takeEvery(verifyRequest.type, handleVerify);
  yield takeEvery(dispenseRequest.type, handleDispense);
}
