import { createSlice } from '@reduxjs/toolkit';

/**
 * appointmentSlice
 *
 * State shape:
 *   list         → array of all appointments (paginated)
 *   upcoming     → array of upcoming appointments (for dashboard / quick view)
 *   selected     → single appointment object (for detail/edit modal)
 *   pagination   → { currentPage, totalPages, totalRecords, perPage }
 *   filters      → { status, doctorId, patientId, dateFrom, dateTo, search }
 *   loading      → global loading flag
 *   actionLoading→ true while create / update / cancel / delete is in-flight
 *   error        → error message string | null
 *   success      → success message string | null (cleared after toast)
 */

const initialState = {
  list: [],
  upcoming: [],
  selected: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    perPage: 5,
  },
  filters: {
    status: '',
    doctorId: '',
    patientId: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  },
  loading: false,
  actionLoading: false,
  error: null,
  success: null,
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    // ── Fetch list ──────────────────────────────────────────────────────────
    fetchAppointmentsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAppointmentsSuccess: (state, action) => {
      const { data, pagination } = action.payload;
      state.list = data;
      state.pagination = pagination ?? state.pagination;
      state.loading = false;
    },
    fetchAppointmentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ── Fetch upcoming ──────────────────────────────────────────────────────
    fetchUpcomingRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUpcomingSuccess: (state, action) => {
      state.upcoming = action.payload;
      state.loading = false;
    },
    fetchUpcomingFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ── Fetch single ────────────────────────────────────────────────────────
    fetchAppointmentByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.selected = null;
    },
    fetchAppointmentByIdSuccess: (state, action) => {
      state.selected = action.payload;
      state.loading = false;
    },
    fetchAppointmentByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ── Create ──────────────────────────────────────────────────────────────
    createAppointmentRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
      state.success = null;
    },
    createAppointmentSuccess: (state, action) => {
      state.list = [action.payload, ...state.list];
      state.actionLoading = false;
      state.success = 'Appointment created successfully.';
    },
    createAppointmentFailure: (state, action) => {
      state.actionLoading = false;
      state.error = action.payload;
    },

    // ── Update (reschedule) ─────────────────────────────────────────────────
    updateAppointmentRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
      state.success = null;
    },
    updateAppointmentSuccess: (state, action) => {
      state.actionLoading = false;
      state.success = typeof action.payload === 'string' 
        ? action.payload 
        : 'Appointment updated successfully.';
    },
    updateAppointmentFailure: (state, action) => {
      state.actionLoading = false;
      state.error = action.payload;
    },

    // ── Cancel ──────────────────────────────────────────────────────────────
    cancelAppointmentRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
      state.success = null;
    },
    cancelAppointmentSuccess: (state, action) => {
      state.actionLoading = false;
      state.success = typeof action.payload === 'string'
        ? action.payload
        : 'Appointment cancelled.';
    },
    cancelAppointmentFailure: (state, action) => {
      state.actionLoading = false;
      state.error = action.payload;
    },

    // ── Delete ──────────────────────────────────────────────────────────────
    deleteAppointmentRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
      state.success = null;
    },
    deleteAppointmentSuccess: (state, action) => {
      state.list = state.list.filter((appt) => appt.id !== action.payload);
      state.actionLoading = false;
      state.success = 'Appointment deleted.';
    },
    deleteAppointmentFailure: (state, action) => {
      state.actionLoading = false;
      state.error = action.payload;
    },

    // ── UI helpers ──────────────────────────────────────────────────────────
    setSelected: (state, action) => {
      state.selected = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1; // reset to page 1 on filter change
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.currentPage = 1;
    },
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
  },
});

export const {
  fetchAppointmentsRequest,
  fetchAppointmentsSuccess,
  fetchAppointmentsFailure,
  fetchUpcomingRequest,
  fetchUpcomingSuccess,
  fetchUpcomingFailure,
  fetchAppointmentByIdRequest,
  fetchAppointmentByIdSuccess,
  fetchAppointmentByIdFailure,
  createAppointmentRequest,
  createAppointmentSuccess,
  createAppointmentFailure,
  updateAppointmentRequest,
  updateAppointmentSuccess,
  updateAppointmentFailure,
  cancelAppointmentRequest,
  cancelAppointmentSuccess,
  cancelAppointmentFailure,
  deleteAppointmentRequest,
  deleteAppointmentSuccess,
  deleteAppointmentFailure,
  setSelected,
  setFilters,
  clearFilters,
  setPage,
  clearMessages,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;
