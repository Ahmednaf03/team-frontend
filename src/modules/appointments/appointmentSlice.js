import { createSlice } from '@reduxjs/toolkit';
import { buildPaginationCacheKey } from '../../utils/paginationCache';

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
  pageCache: {},
  paginationMetaByQuery: {},
  prefetchingPages: {},
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    perPage: 5,
    hasNext: false,
    hasPrev: false,
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

const buildPaginationState = (meta, currentPage, fallbackPerPage) => {
  const totalPages = Number(meta?.totalPages) || 1;
  const perPage = Number(meta?.perPage) || fallbackPerPage || 5;
  const totalRecords = Number(meta?.totalRecords) || 0;

  return {
    currentPage,
    totalPages,
    totalRecords,
    perPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
};

const mergeAppointmentPatch = (appointment, patch = {}) => {
  if (!appointment || appointment.id !== patch.id) {
    return appointment;
  }

  return {
    ...appointment,
    ...Object.fromEntries(
      Object.entries({
        patient_id: patch.patient_id,
        doctor_id: patch.doctor_id,
        scheduled_at: patch.scheduled_at,
        notes: patch.notes,
        status: patch.status,
      }).filter(([, value]) => value !== undefined)
    ),
  };
};

const syncCachedPage = (state, page, queryKey) => {
  const cachedPage = state.pageCache[queryKey]?.[page];
  const meta = state.paginationMetaByQuery[queryKey];

  if (!cachedPage || !meta) {
    return;
  }

  state.list = cachedPage;
  state.pagination = buildPaginationState(
    meta,
    page,
    state.pagination.perPage
  );
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
      const { data, pagination, page, queryKey } = action.payload;

      if (!state.pageCache[queryKey]) {
        state.pageCache[queryKey] = {};
      }

      state.pageCache[queryKey][page] = data;
      state.paginationMetaByQuery[queryKey] = {
        totalPages: pagination?.totalPages ?? state.pagination.totalPages,
        totalRecords: pagination?.totalRecords ?? state.pagination.totalRecords,
        perPage: pagination?.perPage ?? state.pagination.perPage,
      };

      state.list = data;
      state.pagination = buildPaginationState(
        pagination,
        page,
        state.pagination.perPage
      );
      state.loading = false;
    },
    fetchAppointmentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    prefetchAppointmentsRequest: (state, action) => {
      const { page, queryKey } = action.payload;
      if (!state.prefetchingPages[queryKey]) {
        state.prefetchingPages[queryKey] = {};
      }
      state.prefetchingPages[queryKey][page] = true;
    },
    prefetchAppointmentsSuccess: (state, action) => {
      const { data, pagination, page, queryKey } = action.payload;

      if (!state.pageCache[queryKey]) {
        state.pageCache[queryKey] = {};
      }

      state.pageCache[queryKey][page] = data;
      state.paginationMetaByQuery[queryKey] = {
        totalPages: pagination?.totalPages ?? state.pagination.totalPages,
        totalRecords: pagination?.totalRecords ?? state.pagination.totalRecords,
        perPage: pagination?.perPage ?? state.pagination.perPage,
      };

      if (state.prefetchingPages[queryKey]) {
        delete state.prefetchingPages[queryKey][page];
        if (Object.keys(state.prefetchingPages[queryKey]).length === 0) {
          delete state.prefetchingPages[queryKey];
        }
      }
    },
    prefetchAppointmentsFailure: (state, action) => {
      const { page, queryKey } = action.payload || {};
      if (queryKey && state.prefetchingPages[queryKey]) {
        delete state.prefetchingPages[queryKey][page];
        if (Object.keys(state.prefetchingPages[queryKey]).length === 0) {
          delete state.prefetchingPages[queryKey];
        }
      }
    },
    hydrateAppointmentsFromCache: (state, action) => {
      const { page, queryKey } = action.payload;
      syncCachedPage(state, page, queryKey);
      state.loading = false;
      state.error = null;
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
      state.actionLoading = false;
      state.pageCache = {};
      state.paginationMetaByQuery = {};
      state.success = typeof action.payload === 'string'
        ? action.payload
        : 'Appointment created successfully.';
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
      state.pageCache = {};
      state.paginationMetaByQuery = {};
      const patch = action.payload?.updatedAppointment;

      if (patch?.id !== undefined) {
        state.list = state.list.map((appointment) =>
          mergeAppointmentPatch(appointment, patch)
        );
        state.upcoming = state.upcoming.map((appointment) =>
          mergeAppointmentPatch(appointment, patch)
        );

        if (state.selected?.id === patch.id) {
          state.selected = mergeAppointmentPatch(state.selected, patch);
        }
      }

      state.success =
        typeof action.payload === 'string'
          ? action.payload
          : action.payload?.message || 'Appointment updated successfully.';
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
      state.pageCache = {};
      state.paginationMetaByQuery = {};
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
      state.pageCache = {};
      state.paginationMetaByQuery = {};
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
      const queryKey = buildPaginationCacheKey(state.filters);
      syncCachedPage(state, action.payload, queryKey);
    },
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    resetAppointmentsState: () => initialState,
    updateAppointmentNotesPreview: (state, action) => {
      const { appointmentId, notes } = action.payload;
      state.list = state.list.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, notes }
          : appointment
      );

      if (state.selected?.id === appointmentId) {
        state.selected = {
          ...state.selected,
          notes,
        };
      }

      state.upcoming = state.upcoming.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, notes }
          : appointment
      );
    },
  },
});

export const {
  fetchAppointmentsRequest,
  fetchAppointmentsSuccess,
  fetchAppointmentsFailure,
  prefetchAppointmentsRequest,
  prefetchAppointmentsSuccess,
  prefetchAppointmentsFailure,
  hydrateAppointmentsFromCache,
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
  resetAppointmentsState,
  updateAppointmentNotesPreview,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;
