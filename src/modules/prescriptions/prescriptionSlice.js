// src/modules/prescriptions/prescriptionSlice.js
import { createSlice } from '@reduxjs/toolkit';

/**
 * prescriptionSlice
 *
 * State shape:
 *   list              → all prescriptions from API
 *   filtered          → after client-side search filter
 *   currentPrescription → single prescription with items[], for detail/modal view
 *   loading           → fetching list
 *   detailLoading     → fetching single prescription details
 *   submitting        → create / addItem / verify / dispense in progress
 *   error             → error message or null
 *   searchQuery       → current filter string
 *   statusFilter      → 'ALL' | 'PENDING' | 'VERIFIED' | 'DISPENSED' | 'CANCELLED'
 *   pagination        → { page, pageSize, total, hasNext, hasPrev }
 */

const PAGE_SIZE = 5;

const initialState = {
  list: [],
  filtered: [],
  prefetchedPages: {},
  currentPrescription: null,
  loading: false,
  prefetching: false,
  detailLoading: false,
  submitting: false,
  error: null,
  searchQuery: '',
  statusFilter: 'ALL',
  pagination: {
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    hasNext: false,
    hasPrev: false,
  },
};

const computePagination = (total, page, pageSize) => ({
  page,
  pageSize,
  total,
  hasNext: page * pageSize < total,
  hasPrev: page > 1,
});

// Apply both search + status filters
const applyFilters = (list, searchQuery, statusFilter) => {
  let result = list;

  if (statusFilter && statusFilter !== 'ALL') {
    result = result.filter((p) => p.status === statusFilter);
  }

  const q = searchQuery.toLowerCase().trim();
  if (q) {
    result = result.filter(
      (p) =>
        String(p.id).includes(q) ||
        String(p.patient_id).includes(q) ||
        String(p.doctor_id).includes(q) ||
        p.status?.toLowerCase().includes(q)
    );
  }

  return result;
};

const prescriptionSlice = createSlice({
  name: 'prescriptions',
  initialState,
  reducers: {
    // ── Fetch All ──────────────────────────────────────────────────────────
    fetchPrescriptionsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPrescriptionsSuccess: (state, action) => {
      state.loading = false;
      state.list = action.payload;
      const filtered = applyFilters(action.payload, state.searchQuery, state.statusFilter);
      state.filtered = filtered;
      state.pagination = computePagination(
      filtered.length,  // ← use local variable, not state.filtered
      1,
      state.pagination.pageSize
    );
    },
    fetchPrescriptionsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

prefetchPageRequest: (state) => {
  state.prefetching = true;
},
prefetchPageSuccess: (state, action) => {
  const { page, data } = action.payload;
  state.prefetching = false;
  state.prefetchedPages[page] = data; // cache it
},
prefetchPageFailure: (state) => {
  state.prefetching = false;
},

// ── Clear prefetch cache when filters/search change ────────────────────────
clearPrefetchCache: (state) => {
  state.prefetchedPages = {};
},

    // ── Fetch By ID ────────────────────────────────────────────────────────
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

    // ── Create Prescription ────────────────────────────────────────────────
    createPrescriptionRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    createPrescriptionSuccess: (state) => {
      state.submitting = false;
    },
    createPrescriptionFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    // ── Add Item ───────────────────────────────────────────────────────────
    addItemRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    addItemSuccess: (state) => {
      state.submitting = false;
    },
    addItemFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    // ── Verify ─────────────────────────────────────────────────────────────
    verifyRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    verifySuccess: (state) => {
      state.submitting = false;
    },
    verifyFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    // ── Dispense ───────────────────────────────────────────────────────────
    dispenseRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    dispenseSuccess: (state) => {
      state.submitting = false;
    },
    dispenseFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

   setSearchQuery: (state, action) => {
  state.searchQuery = action.payload;
  state.prefetchedPages = {}; // ← ADD: clear cache on search
  const filtered = applyFilters(state.list, action.payload, state.statusFilter);
  state.filtered = filtered;
  state.pagination = computePagination(filtered.length, 1, state.pagination.pageSize);
},
setStatusFilter: (state, action) => {
  state.statusFilter = action.payload;
  state.prefetchedPages = {}; // ← ADD: clear cache on filter
  const filtered = applyFilters(state.list, state.searchQuery, action.payload);
  state.filtered = filtered;
  state.pagination = computePagination(filtered.length, 1, state.pagination.pageSize);
},setSearchQuery: (state, action) => {
  state.searchQuery = action.payload;
  state.prefetchedPages = {}; // ←  clear cache on search
  const filtered = applyFilters(state.list, action.payload, state.statusFilter);
  state.filtered = filtered;
  state.pagination = computePagination(filtered.length, 1, state.pagination.pageSize);
},
setStatusFilter: (state, action) => {
  state.statusFilter = action.payload;
  state.prefetchedPages = {}; // ←  clear cache on filter
  const filtered = applyFilters(state.list, state.searchQuery, action.payload);
  state.filtered = filtered;
  state.pagination = computePagination(filtered.length, 1, state.pagination.pageSize);
},

    // ── Pagination ─────────────────────────────────────────────────────────
    nextPage: (state) => {
      const { page, pageSize, total } = state.pagination;
      if (page * pageSize < total) {
        state.pagination = computePagination(total, page + 1, pageSize);
      }
    },
    prevPage: (state) => {
      const { page, pageSize, total } = state.pagination;
      if (page > 1) {
        state.pagination = computePagination(total, page - 1, pageSize);
      }
    },

    // ── Misc ───────────────────────────────────────────────────────────────
    setCurrentPrescription: (state, action) => {
      state.currentPrescription = action.payload;
    },
    clearCurrentPrescription: (state) => {
      state.currentPrescription = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchPrescriptionsRequest,
  fetchPrescriptionsSuccess,
  fetchPrescriptionsFailure,
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
  prefetchPageRequest,
  prefetchPageSuccess,
  prefetchPageFailure,
  clearPrefetchCache,
} = prescriptionSlice.actions;

export default prescriptionSlice.reducer;