import { call, put, takeLatest, takeEvery, select } from 'redux-saga/effects';
import {
  fetchAllPrescriptionsAPI,
  fetchPrescriptionByIdAPI,
  createPrescriptionAPI,
  addPrescriptionItemAPI,
  verifyPrescriptionAPI,
  dispensePrescriptionAPI,
} from './prescriptionAPI';
import { fetchAllPatientsAPI } from '../patients/patientAPI';
import { fetchAllStaffAPI } from '../staff/staffAPI';
import { buildPaginationCacheKey } from '../../utils/paginationCache';
import { extractCollection } from '../../utils/appointmentMapping';
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
import { getEntityDisplayName, matchesSearch } from '../../utils/entityDisplay';

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

const fetchPrescriptionLookups = async () => {
  const [patientsEnvelope, staffEnvelope] = await Promise.all([
    fetchAllPatientsAPI({ per_page: 500 }).catch(() => ({ data: [] })),
    fetchAllStaffAPI({ per_page: 500 }).catch(() => ({ data: [] })),
  ]);

  const patientRecords = Array.isArray(patientsEnvelope?.data) ? patientsEnvelope.data : [];
  const staffRecords = Array.isArray(staffEnvelope?.data) ? staffEnvelope.data : [];

  return {
    patients: buildLookup(patientRecords),
    doctors: buildLookup(staffRecords.filter(isDoctorRecord)),
  };
};

const getPrescriptionPatientId = (prescription) =>
  Number(
    prescription?.patient_id ??
      prescription?.patient?.id ??
      prescription?.appointment?.patient_id
  );

const getPrescriptionDoctorId = (prescription) =>
  Number(
    prescription?.doctor_id ??
      prescription?.doctor?.id ??
      prescription?.provider?.id ??
      prescription?.staff?.id ??
      prescription?.appointment?.doctor_id
  );

const getPrescriptionPatientName = (prescription, lookups = {}) =>
  prescription?.patient_name ||
  prescription?.patientName ||
  getEntityDisplayName(prescription?.patient) ||
  getEntityDisplayName(prescription?.appointment?.patient) ||
  lookups?.patients?.[getPrescriptionPatientId(prescription)] ||
  '';

const getPrescriptionDoctorName = (prescription, lookups = {}) =>
  prescription?.doctor_name ||
  prescription?.doctorName ||
  getEntityDisplayName(prescription?.doctor) ||
  getEntityDisplayName(prescription?.provider) ||
  getEntityDisplayName(prescription?.staff) ||
  getEntityDisplayName(prescription?.appointment?.doctor) ||
  lookups?.doctors?.[getPrescriptionDoctorId(prescription)] ||
  '';

const enrichPrescription = (prescription, lookups = {}) => ({
  ...prescription,
  patient_name: getPrescriptionPatientName(prescription, lookups),
  doctor_name: getPrescriptionDoctorName(prescription, lookups),
});

const getProviderScopeId = (currentUser) => Number(currentUser?.id);

const scopeProviderPrescriptions = (prescriptions, currentUser) => {
  if (!Array.isArray(prescriptions)) {
    return [];
  }

  const providerId = getProviderScopeId(currentUser);

  if (!Number.isFinite(providerId)) {
    return prescriptions;
  }

  return prescriptions.filter(
    (prescription) => getPrescriptionDoctorId(prescription) === providerId
  );
};

function* fetchPrescriptionsEnvelope(params, isProvider) {
  const primaryEnvelope = yield call(fetchAllPrescriptionsAPI, params);

  if (!isProvider || Array.isArray(primaryEnvelope?.data) && primaryEnvelope.data.length > 0) {
    return primaryEnvelope;
  }

  const { doctor_id, ...fallbackParams } = params;
  return yield call(fetchAllPrescriptionsAPI, fallbackParams);
}

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
      String(getPrescriptionPatientId(prescription) || '').includes(q) ||
      String(getPrescriptionDoctorId(prescription) || '').includes(q) ||
      matchesSearch(getPrescriptionPatientName(prescription), q) ||
      matchesSearch(getPrescriptionDoctorName(prescription), q) ||
      matchesSearch(prescription.status, q) ||
      matchesSearch(prescription.notes, q)
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
    const providerScopeId = getProviderScopeId(currentUser);
    const requestedPage = action.payload?.page ?? pagination.page;
    const force = Boolean(action.payload?.force);
    const useLocalSearch = Boolean(searchQuery?.trim());
    const queryKey = buildPrescriptionQueryKey(searchQuery, statusFilter, currentUser);
    const cachedPage = yield select(
      (state) => state.prescriptions.pageCache[queryKey]?.[requestedPage]
    );

    if (cachedPage && !force) {
      yield put(hydratePrescriptionsFromCache({ page: requestedPage, queryKey }));
      return;
    }

    const params = {
      page: isProvider || useLocalSearch ? 1 : requestedPage,
      per_page: isProvider || useLocalSearch ? 500 : pagination.pageSize,
      ...(!useLocalSearch && searchQuery && { search: searchQuery }),
      ...(statusFilter !== 'ALL' && { status: statusFilter }),
      ...(isProvider && Number.isFinite(providerScopeId) && { doctor_id: providerScopeId }),
    };

    const envelope = yield call(fetchPrescriptionsEnvelope, params, isProvider);
    const lookups = useLocalSearch ? yield call(fetchPrescriptionLookups) : {};
    const responseData = extractCollection(envelope).map((item) =>
      enrichPrescription(item, lookups)
    );
    const scopedData = isProvider
      ? scopeProviderPrescriptions(responseData, currentUser)
      : responseData;
    const paginatedPayload = isProvider || useLocalSearch
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
    const providerScopeId = getProviderScopeId(currentUser);
    const requestedPage = action.payload?.page;
    const useLocalSearch = Boolean(searchQuery?.trim());
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
      page: isProvider || useLocalSearch ? 1 : requestedPage,
      per_page: isProvider || useLocalSearch ? 500 : pagination.pageSize,
      ...(!useLocalSearch && searchQuery && { search: searchQuery }),
      ...(statusFilter !== 'ALL' && { status: statusFilter }),
      ...(isProvider && Number.isFinite(providerScopeId) && { doctor_id: providerScopeId }),
    };

    const envelope = yield call(fetchPrescriptionsEnvelope, params, isProvider);
    const lookups = useLocalSearch ? yield call(fetchPrescriptionLookups) : {};
    const responseData = extractCollection(envelope).map((item) =>
      enrichPrescription(item, lookups)
    );
    const scopedData = isProvider
      ? scopeProviderPrescriptions(responseData, currentUser)
      : responseData;
    const paginatedPayload = isProvider || useLocalSearch
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
    const lookups = yield call(fetchPrescriptionLookups);
    yield put(fetchPrescriptionByIdSuccess(enrichPrescription(envelope.data, lookups)));
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
