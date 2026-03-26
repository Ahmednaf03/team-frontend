import { createSlice } from '@reduxjs/toolkit';
import { buildPaginationCacheKey } from '../../utils/paginationCache';

const PAGE_SIZE = 5;

const initialState = {
  list: [],
  filtered: [],
  currentStaff: null,
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
  roleFilter: 'all',
  statusFilter: 'all',
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

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    fetchStaffRequest: (state, action) => {
      if (action.payload?.prefetch) {
        return;
      }

      state.loading = true;
      state.error = null;
    },
    fetchStaffSuccess: (state, action) => {
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
    fetchStaffFailure: (state, action) => {
      if (action.payload?.prefetch) {
        return;
      }

      state.loading = false;
      state.error = action.payload?.message ?? action.payload;
    },
    hydrateStaffFromCache: (state, action) => {
      const { page, queryKey } = action.payload;
      syncCachedPage(state, page, queryKey);
      state.loading = false;
      state.error = null;
    },

    fetchStaffByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchStaffByIdSuccess: (state, action) => {
      state.loading = false;
      state.currentStaff = action.payload;
    },
    fetchStaffByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    createStaffRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    createStaffSuccess: (state) => {
      state.submitting = false;
      state.pageCache = {};
      state.paginationMetaByQuery = {};
    },
    createStaffFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    updateStaffRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    updateStaffSuccess: (state) => {
      state.submitting = false;
      state.pageCache = {};
      state.paginationMetaByQuery = {};
    },
    updateStaffFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    deleteStaffRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    deleteStaffSuccess: (state) => {
      state.submitting = false;
      state.pageCache = {};
      state.paginationMetaByQuery = {};
    },
    deleteStaffFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.pagination.page = 1;
    },
    setRoleFilter: (state, action) => {
      state.roleFilter = action.payload;
      state.pagination.page = 1;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
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
        role: state.roleFilter,
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
        role: state.roleFilter,
        status: state.statusFilter,
      });
      syncCachedPage(state, prev, queryKey);
    },

    setCurrentStaff: (state, action) => {
      state.currentStaff = action.payload;
    },
    clearCurrentStaff: (state) => {
      state.currentStaff = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchStaffRequest,
  fetchStaffSuccess,
  fetchStaffFailure,
  hydrateStaffFromCache,
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
  setSearchQuery,
  setRoleFilter,
  setStatusFilter,
  nextPage,
  prevPage,
  setCurrentStaff,
  clearCurrentStaff,
  clearError,
} = staffSlice.actions;

export default staffSlice.reducer;
