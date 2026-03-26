import axiosClient from '../../services/axiosClient';

/**
 * billingAPI
 *
 * Backend envelope: { status, message, data: <payload> }
 * These functions return the full envelope so sagas can destructure cleanly.
 *
 * Routes:
 *   POST   /api/billing/{prescriptionId}  → generate invoice
 *   PATCH  /api/billing/{invoiceId}       → mark as paid
 *   GET    /api/billing/summary           → fetch billing summary
 *   GET    /api/billing                   → fetch all invoices (if available)
 */

export const generateInvoiceAPI = async (prescriptionId) => {
  const response = await axiosClient.post(`/billing/${prescriptionId}`, {}, {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });
  //const response = await axiosClient.post('/billing', { prescription_id: prescriptionId });
  return response.data;
};

export const markInvoicePaidAPI = async (invoiceId) => {
  const response = await axiosClient.patch(`/billing/${invoiceId}`, {}, {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const fetchBillingSummaryAPI = async () => {
  const response = await axiosClient.get('/billing/summary', {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });
  console.log("summary api",response.data);
  return response.data;
};

export const fetchAllInvoicesAPI = async (params = {}) => {
  const response = await axiosClient.get('/billing', {
    params,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  return response.data;
};
