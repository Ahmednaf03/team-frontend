import { call, put, takeLatest, takeEvery, select } from 'redux-saga/effects';
import {
  generateInvoiceAPI,
  markInvoicePaidAPI,
  fetchBillingSummaryAPI,
  fetchAllInvoicesAPI,
} from './billingAPI';
import { fetchAllPatientsAPI } from '../patients/patientAPI';
import { buildPaginationCacheKey } from '../../utils/paginationCache';
import { getEntityDisplayName, matchesSearch } from '../../utils/entityDisplay';
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

const buildPatientLookup = (records = []) =>
  records.reduce((acc, patient) => {
    const id = Number(patient?.id);
    const name = getEntityDisplayName(patient);

    if (Number.isFinite(id) && name) {
      acc[id] = name;
    }

    return acc;
  }, {});

const fetchBillingLookups = async () => {
  const patientsEnvelope = await fetchAllPatientsAPI({ per_page: 500 }).catch(() => ({ data: [] }));
  const patientRecords = Array.isArray(patientsEnvelope?.data) ? patientsEnvelope.data : [];

  return {
    patients: buildPatientLookup(patientRecords),
  };
};

const enrichInvoice = (invoice, lookups = {}) => ({
  ...invoice,
  patient_name:
    invoice?.patient_name ||
    lookups?.patients?.[Number(invoice?.patient_id)] ||
    '',
});

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
      matchesSearch(invoice.patient_name, q) ||
      matchesSearch(invoice.patient_id, q) ||
      matchesSearch(invoice.prescription_id, q)
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
    const useLocalSearch = Boolean(searchQuery?.trim());
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
      page: useLocalSearch ? 1 : requestedPage,
      per_page: useLocalSearch ? 500 : pagination.pageSize,
      ...(statusFilter !== 'ALL' && { status: statusFilter }),
      ...(!useLocalSearch && searchQuery && { search: searchQuery }),
    };

    const envelope = yield call(fetchAllInvoicesAPI, params);
    const lookups = useLocalSearch ? yield call(fetchBillingLookups) : {};
    const responseData = Array.isArray(envelope?.data)
      ? envelope.data.map((invoice) => enrichInvoice(invoice, lookups))
      : [];
    const paginatedPayload = useLocalSearch
      ? buildFallbackPage(
          applyFilters(responseData, statusFilter, searchQuery),
          requestedPage,
          pagination.pageSize
        )
      : envelope?.pagination
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
    const useLocalSearch = Boolean(searchQuery?.trim());
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
      page: useLocalSearch ? 1 : requestedPage,
      per_page: useLocalSearch ? 500 : pagination.pageSize,
      ...(statusFilter !== 'ALL' && { status: statusFilter }),
      ...(!useLocalSearch && searchQuery && { search: searchQuery }),
    };

    const envelope = yield call(fetchAllInvoicesAPI, params);
    const lookups = useLocalSearch ? yield call(fetchBillingLookups) : {};
    const responseData = Array.isArray(envelope?.data)
      ? envelope.data.map((invoice) => enrichInvoice(invoice, lookups))
      : [];
    const paginatedPayload = useLocalSearch
      ? buildFallbackPage(
          applyFilters(responseData, statusFilter, searchQuery),
          requestedPage,
          pagination.pageSize
        )
      : envelope?.pagination
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
