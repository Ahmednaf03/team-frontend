import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import {
  generateInvoiceAPI,
  markInvoicePaidAPI,
  fetchBillingSummaryAPI,
  fetchAllInvoicesAPI,
} from './billingAPI';
import {
  fetchInvoicesRequest,
  fetchInvoicesSuccess,
  fetchInvoicesFailure,
  fetchSummaryRequest,
  fetchSummarySuccess,
  fetchSummaryFailure,
  generateInvoiceRequest,
  generateInvoiceSuccess,
  generateInvoiceFailure,
  markPaidRequest,
  markPaidSuccess,
  markPaidFailure,
} from './billingSlice';

// ── Fetch All Invoices ────────────────────────────────────────────────────────
function* handleFetchInvoices() {
  try {
    const envelope = yield call(fetchAllInvoicesAPI);
    const invoices = envelope.data;
    yield put(fetchInvoicesSuccess(Array.isArray(invoices) ? invoices : []));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch invoices.';
    yield put(fetchInvoicesFailure(message));
  }
}

// ── Fetch Summary ─────────────────────────────────────────────────────────────
function* handleFetchSummary() {
  try {
    const envelope = yield call(fetchBillingSummaryAPI);
    console.log("billing saga",envelope.data);
    yield put(fetchSummarySuccess(envelope.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch billing summary.';
    yield put(fetchSummaryFailure(message));
  }
}

// ── Generate Invoice ──────────────────────────────────────────────────────────
function* handleGenerateInvoice(action) {
  try {
    // action.payload = { prescriptionId, onSuccess }
    yield call(generateInvoiceAPI, action.payload.prescriptionId);
    yield put(generateInvoiceSuccess());
    // Refresh invoices + summary after generating
    yield put(fetchInvoicesRequest());
    yield put(fetchSummaryRequest());
    console.log("invoice",action.payload);
    if (action.payload.onSuccess) action.payload.onSuccess();
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to generate invoice.';
    yield put(generateInvoiceFailure(message));
  }
}

// ── Mark As Paid ──────────────────────────────────────────────────────────────
function* handleMarkPaid(action) {
  try {
    // action.payload = { invoiceId, onSuccess }
    yield call(markInvoicePaidAPI, action.payload.invoiceId);
    yield put(markPaidSuccess(action.payload.invoiceId));
    // Refresh summary counts
    yield put(fetchSummaryRequest());
    if (action.payload.onSuccess) action.payload.onSuccess();
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to mark invoice as paid.';
    yield put(markPaidFailure(message));
  }
}

// ── Root Billing Saga ─────────────────────────────────────────────────────────
export default function* billingSaga() {
  yield takeLatest(fetchInvoicesRequest.type, handleFetchInvoices);
  yield takeLatest(fetchSummaryRequest.type, handleFetchSummary);
  yield takeEvery(generateInvoiceRequest.type, handleGenerateInvoice);
  yield takeEvery(markPaidRequest.type, handleMarkPaid);
}