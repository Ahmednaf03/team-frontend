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
  success: null,
  pageCache: {},
  paginationMetaByQuery: {},
  prefetchingPages: {},
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
    fetchInvoicesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchInvoicesSuccess: (state, action) => {
      const { data, pagination, page, queryKey } = action.payload;

      if (!state.pageCache[queryKey]) {
        state.pageCache[queryKey] = {};
      }

      state.pageCache[queryKey][page] = data;
      state.paginationMetaByQuery[queryKey] = {
        perPage: pagination?.perPage ?? state.pagination.pageSize,
        totalRecords: pagination?.totalRecords ?? state.pagination.total,
        totalPages: pagination?.totalPages ?? state.pagination.totalPages,
      };

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
      state.loading = false;
      state.error = action.payload;
    },
    prefetchInvoicesRequest: (state, action) => {
      const { page, queryKey } = action.payload;
      if (!state.prefetchingPages[queryKey]) {
        state.prefetchingPages[queryKey] = {};
      }
      state.prefetchingPages[queryKey][page] = true;
    },
    prefetchInvoicesSuccess: (state, action) => {
      const { data, pagination, page, queryKey } = action.payload;

      if (!state.pageCache[queryKey]) {
        state.pageCache[queryKey] = {};
      }

      state.pageCache[queryKey][page] = data;
      state.paginationMetaByQuery[queryKey] = {
        perPage: pagination?.perPage ?? state.pagination.pageSize,
        totalRecords: pagination?.totalRecords ?? state.pagination.total,
        totalPages: pagination?.totalPages ?? state.pagination.totalPages,
      };

      if (state.prefetchingPages[queryKey]) {
        delete state.prefetchingPages[queryKey][page];
        if (Object.keys(state.prefetchingPages[queryKey]).length === 0) {
          delete state.prefetchingPages[queryKey];
        }
      }
    },
    prefetchInvoicesFailure: (state, action) => {
      const { page, queryKey } = action.payload || {};
      if (queryKey && state.prefetchingPages[queryKey]) {
        delete state.prefetchingPages[queryKey][page];
        if (Object.keys(state.prefetchingPages[queryKey]).length === 0) {
          delete state.prefetchingPages[queryKey];
        }
      }
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
      state.success = null;
    },
    generateInvoiceSuccess: (state, action) => {
      state.submitting = false;
      state.success = action.payload || null;
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
      state.success = null;
    },
    markPaidSuccess: (state, action) => {
      state.submitting = false;
      state.success = action.payload || null;
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
    clearSuccess: (state) => {
      state.success = null;
    },
  },
});

export const {
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
  setStatusFilter,
  setSearchQuery,
  nextPage,
  prevPage,
  setCurrentInvoice,
  clearCurrentInvoice,
  clearError,
  clearSuccess,
} = billingSlice.actions;

export default billingSlice.reducer;
