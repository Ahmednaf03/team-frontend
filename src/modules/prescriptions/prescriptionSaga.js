// src/modules/prescriptions/prescriptionSaga.js
import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import {
  fetchAllPrescriptionsAPI,
  fetchPrescriptionByIdAPI,
  createPrescriptionAPI,
  addPrescriptionItemAPI,
  verifyPrescriptionAPI,
  dispensePrescriptionAPI,
} from './prescriptionAPI';
import {
  fetchPrescriptionsRequest,
  fetchPrescriptionsSuccess,
  fetchPrescriptionsFailure,
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
  prefetchPageRequest,
  prefetchPageSuccess,
  prefetchPageFailure,
} from './prescriptionSlice';

// ── Fetch All ─────────────────────────────────────────────────────────────────
function* handleFetchPrescriptions() {
  try {
    const envelope = yield call(fetchAllPrescriptionsAPI);
    const prescriptions = envelope.data;
    yield put(fetchPrescriptionsSuccess(Array.isArray(prescriptions) ? prescriptions : []));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch prescriptions.';
    yield put(fetchPrescriptionsFailure(message));
  }
}

// ── Fetch By ID ───────────────────────────────────────────────────────────────
function* handleFetchPrescriptionById(action) {
  try {
    const envelope = yield call(fetchPrescriptionByIdAPI, action.payload);
    yield put(fetchPrescriptionByIdSuccess(envelope.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch prescription.';
    yield put(fetchPrescriptionByIdFailure(message));
  }
}

// ── Create Prescription ───────────────────────────────────────────────────────
function* handleCreatePrescription(action) {
  try {
    const envelope = yield call(createPrescriptionAPI, action.payload.data);
    yield put(createPrescriptionSuccess());
    if (action.payload.onSuccess) {
      action.payload.onSuccess(envelope.data); // passes { prescription_id } back
    }
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create prescription.';
    yield put(createPrescriptionFailure(message));
  }
}

// ── Add Item ──────────────────────────────────────────────────────────────────
function* handleAddItem(action) {
  try {
    yield call(addPrescriptionItemAPI, action.payload.data);
    yield put(addItemSuccess());
    // Re-fetch the prescription so the items list updates in the detail view
    if (action.payload.prescriptionId) {
      yield put(fetchPrescriptionByIdRequest(action.payload.prescriptionId));
    }
    if (action.payload.onSuccess) action.payload.onSuccess();
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to add item.';
    yield put(addItemFailure(message));
  }
}

// ── Verify ────────────────────────────────────────────────────────────────────
function* handleVerify(action) {
  try {
    yield call(verifyPrescriptionAPI, action.payload.id);
    yield put(verifySuccess());
    // Refresh both the list and the detail view
    yield put(fetchPrescriptionsRequest());
    if (action.payload.onSuccess) action.payload.onSuccess();
  } catch (error) {
    const message = error.response?.data?.message || 'Verification failed.';
    yield put(verifyFailure(message));
  }
}

// ── Dispense ──────────────────────────────────────────────────────────────────
function* handleDispense(action) {
  try {
    yield call(dispensePrescriptionAPI, action.payload.id);
    yield put(dispenseSuccess());
    // Refresh list after dispense
    yield put(fetchPrescriptionsRequest());
    if (action.payload.onSuccess) action.payload.onSuccess();
  } catch (error) {
    const message = error.response?.data?.message || 'Dispense failed.';
    yield put(dispenseFailure(message));
  }
}

function* handlePrefetchPage(action) {
  try {
    // action.payload = { page, filtered, pageSize }
    const { page, filtered, pageSize } = action.payload;

    // slice the already-fetched filtered array — no extra API call needed
    const startIdx = (page - 1) * pageSize;
    const data = filtered.slice(startIdx, startIdx + pageSize);

    // small delay so it doesn't compete with current page render
    yield new Promise((resolve) => setTimeout(resolve, 100));

    yield put(prefetchPageSuccess({ page, data }));
  } catch (error) {
    yield put(prefetchPageFailure());
  }
}


// ── Root Saga ─────────────────────────────────────────────────────────────────
export default function* prescriptionSaga() {
  yield takeLatest(fetchPrescriptionsRequest.type, handleFetchPrescriptions);
  yield takeLatest(fetchPrescriptionByIdRequest.type, handleFetchPrescriptionById);
  yield takeEvery(createPrescriptionRequest.type, handleCreatePrescription);
  yield takeEvery(addItemRequest.type, handleAddItem);
  yield takeEvery(verifyRequest.type, handleVerify);
  yield takeEvery(dispenseRequest.type, handleDispense);
  yield takeEvery(prefetchPageRequest.type, handlePrefetchPage);
}