import { createSlice } from '@reduxjs/toolkit';
import { buildPaginationCacheKey } from '../../utils/paginationCache';

const PAGE_SIZE = 5;

const initialState = {
  invoices: [],
  filtered: [],
  summary: {
    total_invoices: 0,
    total_paid: 0,
    total_pending: 0,
  },
  currentInvoice: null,
  loading: false,
  summaryLoading: false,
  submitting: false,
  error: null,
  pageCache: {},
  paginationMetaByQuery: {},
  pagination: {
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
  statusFilter: 'ALL',
  searchQuery: '',
};

const buildPaginationState = (meta, page, fallbackPageSize) => {
  const pageSize = Number(meta?.perPage) || fallbackPageSize || PAGE_SIZE;
  const total = Number(meta?.totalRecords) || 0;
  const totalPages = Number(meta?.totalPages) || 1;

  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

const syncCachedPage = (state, page, queryKey) => {
  const cachedPage = state.pageCache[queryKey]?.[page];
  const meta = state.paginationMetaByQuery[queryKey];

  if (!cachedPage || !meta) {
    return;
  }

  state.invoices = cachedPage;
  state.filtered = cachedPage;
  state.pagination = buildPaginationState(meta, page, state.pagination.pageSize);
};

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    fetchInvoicesRequest: (state, action) => {
      if (action.payload?.prefetch) {
        return;
      }

      state.loading = true;
      state.error = null;
    },
    fetchInvoicesSuccess: (state, action) => {
      const { data, pagination, page, queryKey, prefetch = false } = action.payload;

      if (!state.pageCache[queryKey]) {
        state.pageCache[queryKey] = {};
      }

      state.pageCache[queryKey][page] = data;
      state.paginationMetaByQuery[queryKey] = {
        perPage: pagination?.perPage ?? state.pagination.pageSize,
        totalRecords: pagination?.totalRecords ?? state.pagination.total,
        totalPages: pagination?.totalPages ?? state.pagination.totalPages,
      };

      if (prefetch) {
        return;
      }

      state.loading = false;
      state.invoices = data;
      state.filtered = data;
      state.pagination = buildPaginationState(
        pagination,
        page,
        state.pagination.pageSize
      );
    },
    fetchInvoicesFailure: (state, action) => {
      if (action.payload?.prefetch) {
        return;
      }

      state.loading = false;
      state.error = action.payload?.message ?? action.payload;
    },
    hydrateInvoicesFromCache: (state, action) => {
      const { page, queryKey } = action.payload;
      syncCachedPage(state, page, queryKey);
      state.loading = false;
      state.error = null;
    },

    fetchSummaryRequest: (state) => {
      state.summaryLoading = true;
      state.error = null;
    },
    fetchSummarySuccess: (state, action) => {
      state.summaryLoading = false;
      state.summary = action.payload;
    },
    fetchSummaryFailure: (state, action) => {
      state.summaryLoading = false;
      state.error = action.payload;
    },

    generateInvoiceRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    generateInvoiceSuccess: (state) => {
      state.submitting = false;
      state.pageCache = {};
      state.paginationMetaByQuery = {};
    },
    generateInvoiceFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    markPaidRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    markPaidSuccess: (state) => {
      state.submitting = false;
      state.pageCache = {};
      state.paginationMetaByQuery = {};
    },
    markPaidFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
      state.pagination.page = 1;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.pagination.page = 1;
    },
    nextPage: (state) => {
      const next = state.pagination.page + 1;
      if (next > state.pagination.totalPages) {
        return;
      }

      state.pagination.page = next;
      const queryKey = buildPaginationCacheKey({
        search: state.searchQuery,
        status: state.statusFilter,
      });
      syncCachedPage(state, next, queryKey);
    },
    prevPage: (state) => {
      const prev = state.pagination.page - 1;
      if (prev < 1) {
        return;
      }

      state.pagination.page = prev;
      const queryKey = buildPaginationCacheKey({
        search: state.searchQuery,
        status: state.statusFilter,
      });
      syncCachedPage(state, prev, queryKey);
    },

    setCurrentInvoice: (state, action) => {
      state.currentInvoice = action.payload;
    },
    clearCurrentInvoice: (state) => {
      state.currentInvoice = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchInvoicesRequest,
  fetchInvoicesSuccess,
  fetchInvoicesFailure,
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
  setStatusFilter,
  setSearchQuery,
  nextPage,
  prevPage,
  setCurrentInvoice,
  clearCurrentInvoice,
  clearError,
} = billingSlice.actions;

export default billingSlice.reducer;
