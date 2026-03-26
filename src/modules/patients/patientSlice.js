import { createSlice } from '@reduxjs/toolkit';
import { buildPaginationCacheKey } from '../../utils/paginationCache';

const PAGE_SIZE = 5;

const initialState = {
  list: [],
  filtered: [],
  currentPatient: null,
  loading: false,
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

  state.list = cachedPage;
  state.filtered = cachedPage;
  state.pagination = buildPaginationState(meta, page, state.pagination.pageSize);
};

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    fetchPatientsRequest: (state, action) => {
      if (action.payload?.prefetch) {
        return;
      }

      state.loading = true;
      state.error = null;
    },
    fetchPatientsSuccess: (state, action) => {
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
      state.list = data;
      state.filtered = data;
      state.pagination = buildPaginationState(
        pagination,
        page,
        state.pagination.pageSize
      );
    },
    fetchPatientsFailure: (state, action) => {
      if (action.payload?.prefetch) {
        return;
      }

      state.loading = false;
      state.error = action.payload?.message ?? action.payload;
    },
    hydratePatientsFromCache: (state, action) => {
      const { page, queryKey } = action.payload;
      syncCachedPage(state, page, queryKey);
      state.loading = false;
      state.error = null;
    },

    fetchPatientByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPatientByIdSuccess: (state, action) => {
      state.loading = false;
      state.currentPatient = action.payload;
    },
    fetchPatientByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    createPatientRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    createPatientSuccess: (state) => {
      state.submitting = false;
      state.pageCache = {};
      state.paginationMetaByQuery = {};
    },
    createPatientFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    updatePatientRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    updatePatientSuccess: (state) => {
      state.submitting = false;
      state.pageCache = {};
      state.paginationMetaByQuery = {};
    },
    updatePatientFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    deletePatientRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    deletePatientSuccess: (state) => {
      state.submitting = false;
      state.pageCache = {};
      state.paginationMetaByQuery = {};
    },
    deletePatientFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
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
      const queryKey = buildPaginationCacheKey({ search: state.searchQuery });
      syncCachedPage(state, next, queryKey);
    },
    prevPage: (state) => {
      const prev = state.pagination.page - 1;
      if (prev < 1) {
        return;
      }

      state.pagination.page = prev;
      const queryKey = buildPaginationCacheKey({ search: state.searchQuery });
      syncCachedPage(state, prev, queryKey);
    },

    setCurrentPatient: (state, action) => {
      state.currentPatient = action.payload;
    },
    clearCurrentPatient: (state) => {
      state.currentPatient = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchPatientsRequest,
  fetchPatientsSuccess,
  fetchPatientsFailure,
  hydratePatientsFromCache,
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
  setSearchQuery,
  nextPage,
  prevPage,
  setCurrentPatient,
  clearCurrentPatient,
  clearError,
} = patientSlice.actions;

export default patientSlice.reducer;
