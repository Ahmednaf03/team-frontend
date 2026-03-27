import { createSlice } from '@reduxjs/toolkit';

const PAGE_SIZE = 5;

const initialState = {
  list: [],
  filtered: [],
  currentPrescription: null,
  loading: false,
  detailLoading: false,
  submitting: false,
  error: null,
  success: null,
  pageCache: {},
  paginationMetaByQuery: {},
  prefetchingPages: {},
  searchQuery: '',
  statusFilter: 'ALL',
  pagination: {
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
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

  state.list = cachedPage;
  state.filtered = cachedPage;
  state.pagination = buildPaginationState(meta, page, state.pagination.pageSize);
};

const prescriptionSlice = createSlice({
  name: 'prescriptions',
  initialState,
  reducers: {
    fetchPrescriptionsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPrescriptionsSuccess: (state, action) => {
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
      state.list = data;
      state.filtered = data;
      state.pagination = buildPaginationState(
        pagination,
        page,
        state.pagination.pageSize
      );
    },
    fetchPrescriptionsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    prefetchPrescriptionsRequest: (state, action) => {
      const { page, queryKey } = action.payload;
      if (!state.prefetchingPages[queryKey]) {
        state.prefetchingPages[queryKey] = {};
      }
      state.prefetchingPages[queryKey][page] = true;
    },
    prefetchPrescriptionsSuccess: (state, action) => {
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
    prefetchPrescriptionsFailure: (state, action) => {
      const { page, queryKey } = action.payload || {};
      if (queryKey && state.prefetchingPages[queryKey]) {
        delete state.prefetchingPages[queryKey][page];
        if (Object.keys(state.prefetchingPages[queryKey]).length === 0) {
          delete state.prefetchingPages[queryKey];
        }
      }
    },
    hydratePrescriptionsFromCache: (state, action) => {
      const { page, queryKey } = action.payload;
      syncCachedPage(state, page, queryKey);
      state.loading = false;
      state.error = null;
    },

    fetchPrescriptionByIdRequest: (state) => {
      state.detailLoading = true;
      state.error = null;
    },
    fetchPrescriptionByIdSuccess: (state, action) => {
      state.detailLoading = false;
      state.currentPrescription = action.payload;
    },
    fetchPrescriptionByIdFailure: (state, action) => {
      state.detailLoading = false;
      state.error = action.payload;
    },

    createPrescriptionRequest: (state) => {
      state.submitting = true;
      state.error = null;
      state.success = null;
    },
    createPrescriptionSuccess: (state, action) => {
      state.submitting = false;
      state.success = action.payload || null;
      state.pageCache = {};
      state.paginationMetaByQuery = {};
    },
    createPrescriptionFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    addItemRequest: (state) => {
      state.submitting = true;
      state.error = null;
      state.success = null;
    },
    addItemSuccess: (state, action) => {
      state.submitting = false;
      state.success = action.payload || null;
      state.pageCache = {};
      state.paginationMetaByQuery = {};
    },
    addItemFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    verifyRequest: (state) => {
      state.submitting = true;
      state.error = null;
      state.success = null;
    },
    verifySuccess: (state, action) => {
      state.submitting = false;
      state.success = action.payload || null;
      state.pageCache = {};
      state.paginationMetaByQuery = {};
    },
    verifyFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    dispenseRequest: (state) => {
      state.submitting = true;
      state.error = null;
      state.success = null;
    },
    dispenseSuccess: (state, action) => {
      state.submitting = false;
      state.success = action.payload || null;
      state.pageCache = {};
      state.paginationMetaByQuery = {};
    },
    dispenseFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.pagination.page = 1;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
      state.pagination.page = 1;
    },

    nextPage: (state, action) => {
      const next = state.pagination.page + 1;
      if (next > state.pagination.totalPages) {
        return;
      }

      state.pagination.page = next;
      const queryKey = action.payload?.queryKey;
      if (!queryKey) {
        return;
      }
      syncCachedPage(state, next, queryKey);
    },
    prevPage: (state, action) => {
      const prev = state.pagination.page - 1;
      if (prev < 1) {
        return;
      }

      state.pagination.page = prev;
      const queryKey = action.payload?.queryKey;
      if (!queryKey) {
        return;
      }
      syncCachedPage(state, prev, queryKey);
    },

    setCurrentPrescription: (state, action) => {
      state.currentPrescription = action.payload;
    },
    clearCurrentPrescription: (state) => {
      state.currentPrescription = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    resetPrescriptionsState: () => initialState,
  },
});

export const {
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
  setSearchQuery,
  setStatusFilter,
  nextPage,
  prevPage,
  setCurrentPrescription,
  clearCurrentPrescription,
  clearError,
  clearSuccess,
  resetPrescriptionsState,
} = prescriptionSlice.actions;

export default prescriptionSlice.reducer;
