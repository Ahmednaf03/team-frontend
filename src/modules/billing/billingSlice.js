import { createSlice } from '@reduxjs/toolkit';

/**
 * billingSlice
 *
 * State shape:
 *   invoices        → full list of invoices from API
 *   filtered        → invoices after client-side filter
 *   summary         → { total_invoices, total_paid, total_pending }
 *   currentInvoice  → single invoice for detail view
 *   loading         → fetching invoices/summary
 *   submitting      → generate invoice / mark paid in progress
 *   error           → error message string or null
 *   statusFilter    → 'ALL' | 'PENDING' | 'PAID'
 *   searchQuery     → search string against patient name / invoice id
 */

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
  statusFilter: 'ALL',
  searchQuery: '',
};

const applyFilters = (invoices, statusFilter, searchQuery) => {
  let result = invoices;

  if (statusFilter !== 'ALL') {
    result = result.filter((inv) => inv.status === statusFilter);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter(
      (inv) =>
        String(inv.id).includes(q) ||
        inv.patient_name?.toLowerCase().includes(q) ||
        String(inv.prescription_id).includes(q)
    );
  }

  return result;
};

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    // ── Fetch All Invoices ─────────────────────────────────────────────────
    fetchInvoicesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchInvoicesSuccess: (state, action) => {
      state.loading = false;
      state.invoices = action.payload;
      state.filtered = applyFilters(action.payload, state.statusFilter, state.searchQuery);
    },
    fetchInvoicesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ── Fetch Summary ──────────────────────────────────────────────────────
    fetchSummaryRequest: (state) => {
      state.summaryLoading = true;
      state.error = null;
    },
    fetchSummarySuccess: (state, action) => {
      console.log("Fetch summary slice",action.payload);
      state.summaryLoading = false;
      state.summary = action.payload;
    },
    fetchSummaryFailure: (state, action) => {
      state.summaryLoading = false;
      state.error = action.payload;
    },

    // ── Generate Invoice ───────────────────────────────────────────────────
    generateInvoiceRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    generateInvoiceSuccess: (state) => {
      state.submitting = false;
    },
    generateInvoiceFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    // ── Mark As Paid ───────────────────────────────────────────────────────
    markPaidRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    markPaidSuccess: (state, action) => {
      state.submitting = false;
      // Optimistically update local invoice status
      const id = action.payload;
      const updateList = (list) =>
        list.map((inv) =>
          inv.id === id ? { ...inv, status: 'PAID', paid_at: new Date().toISOString() } : inv
        );
      state.invoices = updateList(state.invoices);
      state.filtered = applyFilters(state.invoices, state.statusFilter, state.searchQuery);
    },
    markPaidFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    // ── Filters & Search ───────────────────────────────────────────────────
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
      state.filtered = applyFilters(state.invoices, action.payload, state.searchQuery);
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.filtered = applyFilters(state.invoices, state.statusFilter, action.payload);
    },

    // ── Current Invoice ────────────────────────────────────────────────────
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
  setCurrentInvoice,
  clearCurrentInvoice,
  clearError,
} = billingSlice.actions;

export default billingSlice.reducer;