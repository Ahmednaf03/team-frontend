import { call, put, takeLatest, takeEvery, select } from 'redux-saga/effects';
import {
  generateInvoiceAPI,
  markInvoicePaidAPI,
  fetchBillingSummaryAPI,
  fetchAllInvoicesAPI,
} from './billingAPI';
import { buildPaginationCacheKey } from '../../utils/paginationCache';
import {
  fetchInvoicesRequest,
  fetchInvoicesSuccess,
  fetchInvoicesFailure,
  prefetchInvoicesRequest,
  prefetchInvoicesSuccess,
  prefetchInvoicesFailure,
  hydrateInvoicesFromCache,
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

const applyFilters = (invoices, statusFilter, searchQuery) => {
  let result = invoices;

  if (statusFilter !== 'ALL') {
    result = result.filter((invoice) => invoice.status === statusFilter);
  }

  const q = searchQuery.toLowerCase().trim();
  if (!q) {
    return result;
  }

  return result.filter(
    (invoice) =>
      String(invoice.id).includes(q) ||
      invoice.patient_name?.toLowerCase().includes(q) ||
      String(invoice.prescription_id).includes(q)
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

function* handleFetchInvoices(action) {
  try {
    const { pagination, statusFilter, searchQuery } = yield select(
      (state) => state.billing
    );
    const requestedPage = action.payload?.page ?? pagination.page;
    const force = Boolean(action.payload?.force);
    const queryKey = buildPaginationCacheKey({
      search: searchQuery,
      status: statusFilter,
    });
    const cachedPage = yield select(
      (state) => state.billing.pageCache[queryKey]?.[requestedPage]
    );

    if (cachedPage && !force) {
      yield put(hydrateInvoicesFromCache({ page: requestedPage, queryKey }));
      return;
    }

    const params = {
      page: requestedPage,
      per_page: pagination.pageSize,
      ...(statusFilter !== 'ALL' && { status: statusFilter }),
      ...(searchQuery && { search: searchQuery }),
    };

    const envelope = yield call(fetchAllInvoicesAPI, params);
    const responseData = Array.isArray(envelope?.data) ? envelope.data : [];
    const paginatedPayload = envelope?.pagination
      ? {
          data: responseData,
          pagination: envelope.pagination,
        }
      : buildFallbackPage(
          applyFilters(responseData, statusFilter, searchQuery),
          requestedPage,
          pagination.pageSize
        );

    yield put(
      fetchInvoicesSuccess({
        data: paginatedPayload.data,
        pagination: paginatedPayload.pagination,
        page: requestedPage,
        queryKey,
      })
    );
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch invoices.';
    yield put(fetchInvoicesFailure(message));
  }
}

function* handlePrefetchInvoices(action) {
  try {
    const { pagination, statusFilter, searchQuery } = yield select(
      (state) => state.billing
    );
    const requestedPage = action.payload?.page;
    const queryKey = action.payload?.queryKey ?? buildPaginationCacheKey({
      search: searchQuery,
      status: statusFilter,
    });

    if (!requestedPage) {
      return;
    }

    const cachedPage = yield select(
      (state) => state.billing.pageCache[queryKey]?.[requestedPage]
    );

    if (cachedPage) {
      yield put(prefetchInvoicesFailure({ page: requestedPage, queryKey }));
      return;
    }

    const params = {
      page: requestedPage,
      per_page: pagination.pageSize,
      ...(statusFilter !== 'ALL' && { status: statusFilter }),
      ...(searchQuery && { search: searchQuery }),
    };

    const envelope = yield call(fetchAllInvoicesAPI, params);
    const responseData = Array.isArray(envelope?.data) ? envelope.data : [];
    const paginatedPayload = envelope?.pagination
      ? {
          data: responseData,
          pagination: envelope.pagination,
        }
      : buildFallbackPage(
          applyFilters(responseData, statusFilter, searchQuery),
          requestedPage,
          pagination.pageSize
        );

    yield put(
      prefetchInvoicesSuccess({
        data: paginatedPayload.data,
        pagination: paginatedPayload.pagination,
        page: requestedPage,
        queryKey,
      })
    );
  } catch (error) {
    yield put(
      prefetchInvoicesFailure({
        page: action.payload?.page,
        queryKey: action.payload?.queryKey,
      })
    );
  }
}

function* handleFetchSummary() {
  try {
    const envelope = yield call(fetchBillingSummaryAPI);
    yield put(fetchSummarySuccess(envelope.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch billing summary.';
    yield put(fetchSummaryFailure(message));
  }
}

function* handleGenerateInvoice(action) {
  try {
    const { pagination } = yield select((state) => state.billing);
    const envelope = yield call(generateInvoiceAPI, action.payload.prescriptionId);
    yield put(
      generateInvoiceSuccess({
        type: 'generateInvoice',
        data: envelope?.data ?? null,
      })
    );
    yield put(fetchInvoicesRequest({ page: pagination.page, force: true }));
    yield put(fetchSummaryRequest());
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to generate invoice.';
    yield put(generateInvoiceFailure(message));
  }
}

function* handleMarkPaid(action) {
  try {
    const { pagination } = yield select((state) => state.billing);
    yield call(markInvoicePaidAPI, action.payload.invoiceId);
    yield put(
      markPaidSuccess({
        type: 'markPaid',
        invoiceId: action.payload.invoiceId,
      })
    );
    yield put(fetchInvoicesRequest({ page: pagination.page, force: true }));
    yield put(fetchSummaryRequest());
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to mark invoice as paid.';
    yield put(markPaidFailure(message));
  }
}

export default function* billingSaga() {
  yield takeLatest(fetchInvoicesRequest.type, handleFetchInvoices);
  yield takeEvery(prefetchInvoicesRequest.type, handlePrefetchInvoices);
  yield takeLatest(fetchSummaryRequest.type, handleFetchSummary);
  yield takeEvery(generateInvoiceRequest.type, handleGenerateInvoice);
  yield takeEvery(markPaidRequest.type, handleMarkPaid);
}
