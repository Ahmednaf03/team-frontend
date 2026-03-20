import { createSlice } from '@reduxjs/toolkit';

/**
 * patientSlice
 *
 * State shape:
 *   list          → full fetched list from API (source of truth)
 *   filtered      → list after client-side search filter applied
 *   currentPatient → single patient for view/edit modal
 *   loading       → global loading (fetch all)
 *   submitting    → loading for create/update/delete operations
 *   error         → error message string or null
 *   pagination    → { page, pageSize, total, hasNext, hasPrev }
 *   searchQuery   → current search string
 */

const PAGE_SIZE = 8;

const initialState = {
  list: [],
  filtered: [],
  currentPatient: null,
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
  // prefetch: store next page patients locally
  prefetchedNext: [],
};

const computePagination = (total, page, pageSize) => ({
  page,
  pageSize,
  total,
  hasNext: page * pageSize < total,
  hasPrev: page > 1,
});

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    // ── Fetch All ──────────────────────────────────────────────────────────
    fetchPatientsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPatientsSuccess: (state, action) => {
      state.loading = false;
      state.list = action.payload;
      // Apply existing search filter to new data
      const q = state.searchQuery.toLowerCase().trim();
      state.filtered = q
        ? action.payload.filter(
            (p) =>
              p.name?.toLowerCase().includes(q) ||
              p.phone?.toLowerCase().includes(q) ||
              p.diagnosis?.toLowerCase().includes(q) ||
              p.gender?.toLowerCase().includes(q)
          )
        : action.payload;
      state.pagination = computePagination(
        state.filtered.length,
        1,
        state.pagination.pageSize
      );
    },
    fetchPatientsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ── Fetch By ID ────────────────────────────────────────────────────────
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

    // ── Create ─────────────────────────────────────────────────────────────
    createPatientRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    createPatientSuccess: (state) => {
      state.submitting = false;
    },
    createPatientFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    // ── Update ─────────────────────────────────────────────────────────────
    updatePatientRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    updatePatientSuccess: (state) => {
      state.submitting = false;
    },
    updatePatientFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    // ── Delete ─────────────────────────────────────────────────────────────
    deletePatientRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    deletePatientSuccess: (state) => {
      state.submitting = false;
    },
    deletePatientFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    // ── Search ─────────────────────────────────────────────────────────────
    setSearchQuery: (state, action) => {
      const q = action.payload.toLowerCase().trim();
      state.searchQuery = action.payload;
      state.filtered = q
        ? state.list.filter(
            (p) =>
              p.name?.toLowerCase().includes(q) ||
              p.phone?.toLowerCase().includes(q) ||
              p.diagnosis?.toLowerCase().includes(q) ||
              p.gender?.toLowerCase().includes(q)
          )
        : state.list;
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

    // ── Current patient ────────────────────────────────────────────────────
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
