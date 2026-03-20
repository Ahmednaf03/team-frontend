import axiosClient from '../../services/axiosClient';

/**
 * calendarAPI
 *
 * Backend routes used:
 *   GET  /api/appointments          → fetch all appointments (calendar uses same endpoint with date filters)
 *   PUT  /api/appointments/:id      → reschedule (update scheduled_at)
 */

export const fetchCalendarDataAPI = async (params = {}) => {
  // Fetch appointments for the given month range
   const response = await axiosClient.get('/appointments', {
    params,           // ← pass filters, pagination, search to backend
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const rescheduleAppointmentAPI = async ({ id, scheduled_at }) => {
  const response = await axiosClient.put(`/appointments/${id}`, { scheduled_at });
  return response.data;
};
