import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import {
  fetchAllStaffAPI,
  fetchStaffByIdAPI,
  createStaffAPI,
  updateStaffAPI,
  deleteStaffAPI,
} from './staffAPI';

import {
  fetchStaffRequest,
  fetchStaffSuccess,
  fetchStaffFailure,
  fetchStaffByIdRequest,
  fetchStaffByIdSuccess,
  fetchStaffByIdFailure,
  createStaffRequest,
  createStaffSuccess,
  createStaffFailure,
  updateStaffRequest,
  updateStaffSuccess,
  updateStaffFailure,
  deleteStaffRequest,
  deleteStaffSuccess,
  deleteStaffFailure,
} from './staffSlice';

// ── Fetch All ────────────────────────────────────────────────────────────────
function* handleFetchStaff() {
  try {
    const envelope = yield call(fetchAllStaffAPI);
    const staff = envelope.data;
    yield put(fetchStaffSuccess(Array.isArray(staff) ? staff : []));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch staff.';
    yield put(fetchStaffFailure(message));
  }
}

// ── Fetch By ID ──────────────────────────────────────────────────────────────
function* handleFetchStaffById(action) {
  try {
    const envelope = yield call(fetchStaffByIdAPI, action.payload);
    yield put(fetchStaffByIdSuccess(envelope.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch staff member.';
    yield put(fetchStaffByIdFailure(message));
  }
}

// ── Create ───────────────────────────────────────────────────────────────────
function* handleCreateStaff(action) {
  try {
    yield call(createStaffAPI, action.payload.data);
    yield put(createStaffSuccess());
    // Refetch the full list to reflect the new member
    yield put(fetchStaffRequest());
    if (action.payload.onSuccess) action.payload.onSuccess();
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to create staff member.';
    yield put(createStaffFailure(message));
  }
}

// ── Update ───────────────────────────────────────────────────────────────────
function* handleUpdateStaff(action) {
  try {
    yield call(updateStaffAPI, { id: action.payload.id, data: action.payload.data });
    yield put(updateStaffSuccess());
    yield put(fetchStaffRequest());
    if (action.payload.onSuccess) action.payload.onSuccess();
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to update staff member.';
    yield put(updateStaffFailure(message));
  }
}

// ── Delete (soft) ─────────────────────────────────────────────────────────────
function* handleDeleteStaff(action) {
  try {
    yield call(deleteStaffAPI, action.payload.id);
    yield put(deleteStaffSuccess());
    yield put(fetchStaffRequest());
    if (action.payload.onSuccess) action.payload.onSuccess();
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to delete staff member.';
    yield put(deleteStaffFailure(message));
  }
}

// ── Root Staff Saga ───────────────────────────────────────────────────────────
export default function* staffSaga() {
  yield takeLatest(fetchStaffRequest.type, handleFetchStaff);
  yield takeLatest(fetchStaffByIdRequest.type, handleFetchStaffById);
  yield takeEvery(createStaffRequest.type, handleCreateStaff);
  yield takeEvery(updateStaffRequest.type, handleUpdateStaff);
  yield takeEvery(deleteStaffRequest.type, handleDeleteStaff);
}
