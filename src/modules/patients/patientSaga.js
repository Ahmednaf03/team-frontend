import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import {
  fetchAllPatientsAPI,
  fetchPatientByIdAPI,
  createPatientAPI,
  updatePatientAPI,
  deletePatientAPI,
} from './patientAPI';

import {
  fetchPatientsRequest,
  fetchPatientsSuccess,
  fetchPatientsFailure,
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

// ── Fetch All ────────────────────────────────────────────────────────────────
function* handleFetchPatients() {
  try {
    // API returns envelope: { status: 200, message: null, data: [...patients] }
    const envelope = yield call(fetchAllPatientsAPI);
    const patients = envelope.data;
    yield put(fetchPatientsSuccess(Array.isArray(patients) ? patients : []));
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to fetch patients.';
    yield put(fetchPatientsFailure(message));
  }
}

// ── Fetch By ID ──────────────────────────────────────────────────────────────
function* handleFetchPatientById(action) {
  try {
    // envelope = { status: 200, message: 'Patient fetched successfully', data: { id, name, ... } }
    const envelope = yield call(fetchPatientByIdAPI, action.payload);
    const patient = envelope.data;
    yield put(fetchPatientByIdSuccess(patient));
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to fetch patient.';
    yield put(fetchPatientByIdFailure(message));
  }
}

// ── Create ───────────────────────────────────────────────────────────────────
function* handleCreatePatient(action) {
  try {
    // envelope = { status: 201, message: 'Patient created successfully', data: <newId> }
    yield call(createPatientAPI, action.payload.data);
    yield put(createPatientSuccess());
    yield put(fetchPatientsRequest());
    if (action.payload.onSuccess) action.payload.onSuccess();
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to create patient.';
    yield put(createPatientFailure(message));
  }
}

// ── Update ───────────────────────────────────────────────────────────────────
function* handleUpdatePatient(action) {
  try {
    // envelope = { status: 200, message: 'Patient updated successfully', data: <rowCount> }
    yield call(updatePatientAPI, { id: action.payload.id, data: action.payload.data });
    yield put(updatePatientSuccess());
    yield put(fetchPatientsRequest());
    if (action.payload.onSuccess) action.payload.onSuccess();
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to update patient.';
    yield put(updatePatientFailure(message));
  }
}

// ── Delete ───────────────────────────────────────────────────────────────────
function* handleDeletePatient(action) {
  try {
    // envelope = { status: 200, message: 'Patient deleted successfully', data: true }
    yield call(deletePatientAPI, action.payload.id);
    yield put(deletePatientSuccess());
    yield put(fetchPatientsRequest());
    if (action.payload.onSuccess) action.payload.onSuccess();
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to delete patient.';
    yield put(deletePatientFailure(message));
  }
}

// ── Root Patient Saga ────────────────────────────────────────────────────────
export default function* patientSaga() {
  yield takeLatest(fetchPatientsRequest.type, handleFetchPatients);
  yield takeLatest(fetchPatientByIdRequest.type, handleFetchPatientById);
  yield takeEvery(createPatientRequest.type, handleCreatePatient);
  yield takeEvery(updatePatientRequest.type, handleUpdatePatient);
  yield takeEvery(deletePatientRequest.type, handleDeletePatient);
}
