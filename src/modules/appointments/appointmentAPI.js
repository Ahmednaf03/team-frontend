import axiosClient from '../../services/axiosClient';

/**
 * appointmentAPI
 *
 * Thin API layer — maps backend appointment endpoints to promise-returning functions.
 * Saga layer calls these, never axios directly.
 *
 * Backend routes:
 *   GET    /api/appointments            → list all (paginated + filters)
 *   GET    /api/appointments/:id        → single appointment
 *   GET    /api/appointments/upcoming   → upcoming appointments
 *   POST   /api/appointments            → create
 *   PUT    /api/appointments/:id        → full update (reschedule)
 *   PATCH  /api/appointments/:id        → cancel
 *   DELETE /api/appointments/:id        → soft delete (admin only)
 *
 * Roles allowed:
 *   GET    → Provider, Nurse, Admin
 *   POST   → Provider, Nurse, Admin
 *   PUT    → Provider, Admin
 *   PATCH  → Provider, Admin
 *   DELETE → Admin only
 */

export const fetchAppointmentsAPI = async (params = {}) => {
  const response = await axiosClient.get('/appointments', {
    params,           // ← pass filters, pagination, search to backend
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const fetchAppointmentByIdAPI = async (id) => {
  const response = await axiosClient.get(`/appointments/${id}`);
  return response.data;
};

export const fetchUpcomingAppointmentsAPI = async () => {
  const response = await axiosClient.get('/appointments/upcoming');
  return response.data;
};

export const createAppointmentAPI = async (payload) => {
  const response = await axiosClient.post('/appointments', payload, {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const updateAppointmentAPI = async ({ id, ...payload }) => {
  console.log("update appointment is being called", payload);
  // Full update — reschedule, change notes, etc.
  const response = await axiosClient.put(`/appointments/${id}`,
    payload,
    {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

export const cancelAppointmentAPI = async (id) => {
  // PATCH → sets status = 'cancelled'
  const response = await axiosClient.patch(`/appointments/${id}`,
    { status: 'cancelled' },
    {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

export const deleteAppointmentAPI = async (id) => {
  // Soft delete — admin only
  const response = await axiosClient.delete(`/appointments/${id}`,
    {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};
