import { createSlice } from '@reduxjs/toolkit';

/**
 * staffSlice
 *
 * State shape:
 *   list          → full fetched list from API (source of truth)
 *   filtered      → list after client-side search/filter applied
 *   currentStaff  → single staff member for view/edit modal
 *   loading       → global loading (fetch all)
 *   submitting    → loading for create/update/delete operations
 *   error         → error message string or null
 *   pagination    → { page, pageSize, total, hasNext, hasPrev }
 *   searchQuery   → current search string
 *   roleFilter    → current role filter ('all' | 'provider' | 'nurse' | 'pharmacist' | 'admin')
 *   statusFilter  → current status filter ('all' | 'active' | 'inactive')
 */

const PAGE_SIZE = 5;

const initialState = {
  list: [],
  filtered: [],
  currentStaff: null,
  loading: false,
  submitting: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    hasNext: false,
    hasPrev: false,
  },
  searchQuery: '',
  roleFilter: 'all',
  statusFilter: 'all',
};

const computePagination = (total, page, pageSize) => ({
  page,
  pageSize,
  total,
  hasNext: page * pageSize < total,
  hasPrev: page > 1,
});

/**
 * Apply search + role + status filters to the full list
 */
const applyFilters = (list, searchQuery, roleFilter, statusFilter) => {
  const q = searchQuery.toLowerCase().trim();
  return list.filter((s) => {
    const matchSearch =
      !q ||
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.role?.toLowerCase().includes(q);
    const matchRole = roleFilter === 'all' || s.role === roleFilter;
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });
};

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    // ── Fetch All ──────────────────────────────────────────────────────────
    fetchStaffRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchStaffSuccess: (state, action) => {
      state.loading = false;
      state.list = action.payload;
      state.filtered = applyFilters(
        action.payload,
        state.searchQuery,
        state.roleFilter,
        state.statusFilter
      );
      state.pagination = computePagination(
        state.filtered.length,
        1,
        state.pagination.pageSize
      );
    },
    fetchStaffFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ── Fetch By ID ────────────────────────────────────────────────────────
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

    // ── Create ─────────────────────────────────────────────────────────────
    createStaffRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    createStaffSuccess: (state) => {
      state.submitting = false;
    },
    createStaffFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    // ── Update ─────────────────────────────────────────────────────────────
    updateStaffRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    updateStaffSuccess: (state) => {
      state.submitting = false;
    },
    updateStaffFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    // ── Delete (soft) ─────────────────────────────────────────────────────
    deleteStaffRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    deleteStaffSuccess: (state) => {
      state.submitting = false;
    },
    deleteStaffFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    // ── Search ─────────────────────────────────────────────────────────────
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.filtered = applyFilters(
        state.list,
        action.payload,
        state.roleFilter,
        state.statusFilter
      );
      state.pagination = computePagination(
        state.filtered.length,
        1,
        state.pagination.pageSize
      );
    },

    // ── Role Filter ────────────────────────────────────────────────────────
    setRoleFilter: (state, action) => {
      state.roleFilter = action.payload;
      state.filtered = applyFilters(
        state.list,
        state.searchQuery,
        action.payload,
        state.statusFilter
      );
      state.pagination = computePagination(
        state.filtered.length,
        1,
        state.pagination.pageSize
      );
    },

    // ── Status Filter ──────────────────────────────────────────────────────
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
      state.filtered = applyFilters(
        state.list,
        state.searchQuery,
        state.roleFilter,
        action.payload
      );
      state.pagination = computePagination(
        state.filtered.length,
        1,
        state.pagination.pageSize
      );
    },

    // ── Pagination ─────────────────────────────────────────────────────────
    nextPage: (state) => {
      const { page, pageSize, total } = state.pagination;
      const nextPage = page + 1;
      if (nextPage * pageSize - pageSize < total) {
        state.pagination = computePagination(total, nextPage, pageSize);
      }
    },
    prevPage: (state) => {
      const { page, pageSize, total } = state.pagination;
      if (page > 1) {
        state.pagination = computePagination(total, page - 1, pageSize);
      }
    },

    // ── Current staff ──────────────────────────────────────────────────────
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
