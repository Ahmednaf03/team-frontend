import { createSlice } from '@reduxjs/toolkit';

/**
 * calendarSlice
 *
 * State shape:
 *   appointments   → enriched appointment list for calendar rendering
 *   selectedDate   → currently selected date string (YYYY-MM-DD)
 *   viewMode       → 'month' | 'week' | 'day'
 *   selectedDoctor → doctor_id filter | null = all doctors
 *   loading        → fetching calendar data
 *   rescheduling   → drag-drop API call in-flight
 *   error          → error message | null
 *   success        → success message | null
 */

const initialState = {
  appointments: [],
  selectedDate: new Date().toISOString().split('T')[0], // today YYYY-MM-DD
  viewMode: 'month',
  selectedDoctor: null,
  loading: false,
  rescheduling: false,
  error: null,
  success: null,
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    // ── Fetch calendar appointments ─────────────────────────────────────────
    fetchCalendarDataRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCalendarDataSuccess: (state, action) => {
      state.appointments = action.payload;
      state.loading = false;
    },
    fetchCalendarDataFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ── Reschedule (drag & drop) ────────────────────────────────────────────
    rescheduleAppointmentRequest: (state, action) => {
      state.rescheduling = true;
      state.error = null;
      state.success = null;
      // Optimistic update — move appointment in local state immediately
      const { id, newDate, newTime } = action.payload;
      const idx = state.appointments.findIndex((a) => a.id === id);
      if (idx !== -1) {
        state.appointments[idx] = {
          ...state.appointments[idx],
          scheduled_at: `${newDate} ${newTime}`,
          _optimistic: true,
        };
      }
    },
    rescheduleAppointmentSuccess: (state, action) => {
      const updated = action.payload;
      const idx = state.appointments.findIndex((a) => a.id === updated.id);
      if (idx !== -1) {
        // Spread existing appointment data to avoid losing fields like patient_name
        state.appointments[idx] = { 
          ...state.appointments[idx], 
          ...updated, 
          _optimistic: false 
        };
      }
      state.rescheduling = false;
      state.success = 'Appointment rescheduled successfully.';
    },
    rescheduleAppointmentFailure: (state, action) => {
      state.rescheduling = false;
      state.error = action.payload;
      // Rollback optimistic update — re-fetch will correct state
    },

    // ── UI controls ─────────────────────────────────────────────────────────
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setSelectedDoctor: (state, action) => {
      state.selectedDoctor = action.payload;
    },
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    // We rely on calendarSaga synchronization to trigger re-fetches
    // when appointments are created/updated/deleted elsewhere.
  },
});

export const {
  fetchCalendarDataRequest,
  fetchCalendarDataSuccess,
  fetchCalendarDataFailure,
  rescheduleAppointmentRequest,
  rescheduleAppointmentSuccess,
  rescheduleAppointmentFailure,
  setSelectedDate,
  setViewMode,
  setSelectedDoctor,
  clearMessages,
} = calendarSlice.actions;

export default calendarSlice.reducer;
