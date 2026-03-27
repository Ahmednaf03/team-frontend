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
  prefetchPrescriptionsRequest,
  prefetchPrescriptionsSuccess,
  prefetchPrescriptionsFailure,
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

const buildPrescriptionQueryKey = (searchQuery, statusFilter, currentUser) => {
  const currentRole = String(currentUser?.role || '').toLowerCase();

  return buildPaginationCacheKey({
    search: searchQuery,
    status: statusFilter,
    scopeRole: currentRole,
    scopeUserId: currentRole === 'provider' ? String(currentUser?.id || '') : '',
  });
};

function* handleFetchPrescriptions(action) {
  try {
    const { pagination, searchQuery, statusFilter } = yield select(
      (state) => state.prescriptions
    );
    const currentUser = yield select((state) => state.auth.user);
    const currentRole = String(currentUser?.role || '').toLowerCase();
    const isProvider = currentRole === 'provider';
    const requestedPage = action.payload?.page ?? pagination.page;
    const force = Boolean(action.payload?.force);
    const queryKey = buildPrescriptionQueryKey(searchQuery, statusFilter, currentUser);
    const cachedPage = yield select(
      (state) => state.prescriptions.pageCache[queryKey]?.[requestedPage]
    );

    if (cachedPage && !force) {
      yield put(hydratePrescriptionsFromCache({ page: requestedPage, queryKey }));
      return;
    }

    const params = {
      page: isProvider ? 1 : requestedPage,
      per_page: isProvider ? 500 : pagination.pageSize,
      ...(searchQuery && { search: searchQuery }),
      ...(statusFilter !== 'ALL' && { status: statusFilter }),
      ...(isProvider && currentUser?.id && { doctor_id: currentUser.id }),
    };

    const envelope = yield call(fetchAllPrescriptionsAPI, params);
    const responseData = Array.isArray(envelope?.data) ? envelope.data : [];
    const scopedData = isProvider
      ? responseData.filter(
          (prescription) => Number(prescription?.doctor_id) === Number(currentUser?.id)
        )
      : responseData;
    const paginatedPayload = isProvider
      ? buildFallbackPage(
          applyFilters(scopedData, searchQuery, statusFilter),
          requestedPage,
          pagination.pageSize
        )
      : envelope?.pagination
      ? {
          data: scopedData,
          pagination: envelope.pagination,
        }
      : buildFallbackPage(
          applyFilters(scopedData, searchQuery, statusFilter),
          requestedPage,
          pagination.pageSize
        );

    yield put(
      fetchPrescriptionsSuccess({
        data: paginatedPayload.data,
        pagination: paginatedPayload.pagination,
        page: requestedPage,
        queryKey,
      })
    );
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch prescriptions.';
    yield put(fetchPrescriptionsFailure(message));
  }
}

function* handlePrefetchPrescriptions(action) {
  try {
    const { pagination, searchQuery, statusFilter } = yield select(
      (state) => state.prescriptions
    );
    const currentUser = yield select((state) => state.auth.user);
    const currentRole = String(currentUser?.role || '').toLowerCase();
    const isProvider = currentRole === 'provider';
    const requestedPage = action.payload?.page;
    const queryKey =
      action.payload?.queryKey ??
      buildPrescriptionQueryKey(searchQuery, statusFilter, currentUser);

    if (!requestedPage) {
      return;
    }

    const cachedPage = yield select(
      (state) => state.prescriptions.pageCache[queryKey]?.[requestedPage]
    );

    if (cachedPage) {
      yield put(prefetchPrescriptionsFailure({ page: requestedPage, queryKey }));
      return;
    }

    const params = {
      page: isProvider ? 1 : requestedPage,
      per_page: isProvider ? 500 : pagination.pageSize,
      ...(searchQuery && { search: searchQuery }),
      ...(statusFilter !== 'ALL' && { status: statusFilter }),
      ...(isProvider && currentUser?.id && { doctor_id: currentUser.id }),
    };

    const envelope = yield call(fetchAllPrescriptionsAPI, params);
    const responseData = Array.isArray(envelope?.data) ? envelope.data : [];
    const scopedData = isProvider
      ? responseData.filter(
          (prescription) => Number(prescription?.doctor_id) === Number(currentUser?.id)
        )
      : responseData;
    const paginatedPayload = isProvider
      ? buildFallbackPage(
          applyFilters(scopedData, searchQuery, statusFilter),
          requestedPage,
          pagination.pageSize
        )
      : envelope?.pagination
      ? {
          data: scopedData,
          pagination: envelope.pagination,
        }
      : buildFallbackPage(
          applyFilters(scopedData, searchQuery, statusFilter),
          requestedPage,
          pagination.pageSize
        );

    yield put(
      prefetchPrescriptionsSuccess({
        data: paginatedPayload.data,
        pagination: paginatedPayload.pagination,
        page: requestedPage,
        queryKey,
      })
    );
  } catch (error) {
    yield put(
      prefetchPrescriptionsFailure({
        page: action.payload?.page,
        queryKey: action.payload?.queryKey,
      })
    );
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
    yield put(
      createPrescriptionSuccess({
        type: 'createPrescription',
        data: envelope.data,
      })
    );
    yield put(fetchPrescriptionsRequest({ page: 1, force: true }));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create prescription.';
    yield put(createPrescriptionFailure(message));
  }
}

function* handleAddItem(action) {
  try {
    const { pagination } = yield select((state) => state.prescriptions);
    yield call(addPrescriptionItemAPI, action.payload.data);
    yield put(
      addItemSuccess({
        type: 'addItem',
      })
    );
    if (action.payload.prescriptionId) {
      yield put(fetchPrescriptionByIdRequest(action.payload.prescriptionId));
    }
    yield put(fetchPrescriptionsRequest({ page: pagination.page, force: true }));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to add item.';
    yield put(addItemFailure(message));
  }
}

function* handleVerify(action) {
  try {
    const { pagination } = yield select((state) => state.prescriptions);
    yield call(verifyPrescriptionAPI, action.payload.id);
    yield put(
      verifySuccess({
        type: 'verify',
      })
    );
    yield put(fetchPrescriptionsRequest({ page: pagination.page, force: true }));
  } catch (error) {
    const message = error.response?.data?.message || 'Verification failed.';
    yield put(verifyFailure(message));
  }
}

function* handleDispense(action) {
  try {
    const { pagination } = yield select((state) => state.prescriptions);
    yield call(dispensePrescriptionAPI, action.payload.id);
    yield put(
      dispenseSuccess({
        type: 'dispense',
      })
    );
    yield put(fetchPrescriptionsRequest({ page: pagination.page, force: true }));
  } catch (error) {
    const message = error.response?.data?.message || 'Dispense failed.';
    yield put(dispenseFailure(message));
  }
}

export default function* prescriptionSaga() {
  yield takeLatest(fetchPrescriptionsRequest.type, handleFetchPrescriptions);
  yield takeEvery(prefetchPrescriptionsRequest.type, handlePrefetchPrescriptions);
  yield takeLatest(fetchPrescriptionByIdRequest.type, handleFetchPrescriptionById);
  yield takeEvery(createPrescriptionRequest.type, handleCreatePrescription);
  yield takeEvery(addItemRequest.type, handleAddItem);
  yield takeEvery(verifyRequest.type, handleVerify);
  yield takeEvery(dispenseRequest.type, handleDispense);
}
