import axiosClient from '../../services/axiosClient';

/**
 * staffAPI
 *
 * Backend always responds with this envelope:
 *   { status: 200, message: "...", data: <payload> }
 *
 * Routes (all PROTECTED, Admin only except GET):
 *   GET    /api/staff        → fetch all staff in tenant
 *   GET    /api/staff/{id}   → fetch one staff member
 *   POST   /api/staff        → create staff  (Admin only)
 *   PUT    /api/staff/{id}   → update staff  (Admin only)
 *   DELETE /api/staff/{id}   → soft delete   (Admin only)
 *
 * Note: Staff is NOT a separate table — it operates on the users table
 * filtered by role. Password is required on create, optional on update.
 */

export const fetchAllStaffAPI = async () => {
  const response = await axiosClient.get('/staff');
  return response.data; // { status, message, data: [...staff] }
};

export const fetchStaffByIdAPI = async (id) => {
  const response = await axiosClient.get(`/staff/${id}`);
  return response.data; // { status, message, data: { id, name, role, status } }
};

export const createStaffAPI = async (data) => {
  // Required: name, email, password, role
  // Backend hashes email (blind index) and password (bcrypt) before storing
  const response = await axiosClient.post('/staff', data);
  return response.data; // { status: 201, message: '...', data: { id: <newId> } }
};

export const updateStaffAPI = async ({ id, data }) => {
  // Allowed fields: name, status (active/inactive)
  // Password update goes through /api/settings/change-password, not here
  const response = await axiosClient.put(`/staff/${id}`, data);
  return response.data; // { status: 200, message: '...', data: true }
};

export const deleteStaffAPI = async (id) => {
  // Soft delete — sets deleted_at = NOW() on the users table
  const response = await axiosClient.delete(`/staff/${id}`);
  return response.data; // { status: 200, message: '...', data: true }
};
