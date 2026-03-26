import axiosClient from '../../services/axiosClient';

/**
 * patientAPI
 *
 * Backend always responds with this envelope:
 *   { status: 200, message: "...", data: <payload> }
 *
 * Axios wraps that inside response.data, so:
 *   axios response.data          = { status, message, data }
 *   axios response.data.data     = actual patient array / object
 *
 * These functions return the full axios response so sagas can
 * destructure { data: { data: patients } } cleanly.
 *
 * Routes:
 *   GET    /api/patients        → fetch all (admin, provider)
 *   GET    /api/patients/{id}   → fetch one (admin, provider)
 *   POST   /api/patients        → create   (admin only)
 *   PUT    /api/patients/{id}   → update   (admin only)
 *   DELETE /api/patients/{id}   → soft delete (admin only)
 */

export const fetchAllPatientsAPI = async (params = {}) => {
  // response.data = { status: 200, message: null, data: [...patients] }
  const response = await axiosClient.get('/patients', { params });
  return response.data; // return envelope: { status, message, data }
};

export const fetchPatientByIdAPI = async (id) => {
  const response = await axiosClient.get(`/patients/${id}`);
  return response.data; // { status, message, data: { id, name, ... } }
};

export const createPatientAPI = async (data) => {
  // Backend returns: { status: 201, message: 'Patient created successfully', data: <lastInsertId> }
  const response = await axiosClient.post('/patients', data);
  return response.data;
};

export const updatePatientAPI = async ({ id, data }) => {
  // Backend returns: { status: 200, message: 'Patient updated successfully', data: <rowCount> }
  const response = await axiosClient.put(`/patients/${id}`, data);
  return response.data;
};

export const deletePatientAPI = async (id) => {
  // Backend returns: { status: 200, message: 'Patient deleted successfully', data: true }
  const response = await axiosClient.delete(`/patients/${id}`);
  return response.data;
};
