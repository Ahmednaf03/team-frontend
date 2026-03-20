// src/modules/prescriptions/prescriptionAPI.js
import axiosClient from '../../services/axiosClient';

/**
 * prescriptionAPI
 *
 * All functions return the full backend envelope:
 *   { status, message, data }
 *
 * Backend Routes:
 *   GET    /api/prescriptions           → getAll  (provider, admin, pharmacist)
 *   GET    /api/prescriptions/{id}      → getById (provider, admin, pharmacist)
 *   POST   /api/prescriptions           → create  (provider, admin)
 *   POST   /api/prescriptions/items     → addItem (provider, admin)
 *   PATCH  /api/prescriptions/verify/{id}  → verify   (pharmacist)
 *   PATCH  /api/prescriptions/dispense/{id} → dispense (pharmacist)
 */

// ── Fetch All ─────────────────────────────────────────────────────────────────
export const fetchAllPrescriptionsAPI = async () => {
  const response = await axiosClient.get('/prescriptions');
  return response.data; // { status, message, data: [...prescriptions] }
};

// ── Fetch By ID (includes items array) ───────────────────────────────────────
export const fetchPrescriptionByIdAPI = async (id) => {
  const response = await axiosClient.get(`/prescriptions/${id}`);
  return response.data; // { status, message, data: { ...prescription, items: [...] } }
};

// ── Create Prescription Header ────────────────────────────────────────────────
// Body: { patient_id, doctor_id, appointment_id, notes }
export const createPrescriptionAPI = async (data) => {
  const response = await axiosClient.post('/prescriptions', data);
  return response.data; // { status: 201, message, data: { prescription_id } }
};

// ── Add Item to Prescription ──────────────────────────────────────────────────
// Body: { prescription_id, medicine_id, dosage, frequency, duration_days, quantity, instructions? }
export const addPrescriptionItemAPI = async (data) => {
  console.log("Prescription Item",data);
  const response = await axiosClient.post('/prescriptions/items', data);
  return response.data; // { status: 201, message: 'Item added successfully' }
};

// ── Pharmacist: Verify Prescription ──────────────────────────────────────────
// PENDING → VERIFIED
export const verifyPrescriptionAPI = async (id) => {
  const response = await axiosClient.patch(`/prescriptions/verify/${id}`);
  return response.data; // { status: 200, message: 'Prescription verified successfully' }
};

// ── Pharmacist: Dispense Prescription ────────────────────────────────────────
// VERIFIED → DISPENSED  (reduces stock for every item)
export const dispensePrescriptionAPI = async (id) => {
  const response = await axiosClient.patch(`/prescriptions/dispense/${id}`);
  return response.data; // { status: 200, message: 'Prescription dispensed successfully' }
};