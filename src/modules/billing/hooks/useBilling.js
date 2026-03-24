import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchInvoicesRequest,
  fetchSummaryRequest,
  generateInvoiceRequest,
  markPaidRequest,
  setStatusFilter,
  setSearchQuery,
  setCurrentInvoice,
  clearCurrentInvoice,
  clearError,
} from '../billingSlice';

/**
 * useBilling()
 *
 * Central hook for all billing operations.
 * Components never touch the slice or API directly.
 *
 * Usage:
 *   const {
 *     invoices, summary, currentInvoice,
 *     loading, submitting, error,
 *     statusFilter, searchQuery,
 *     fetchInvoices, fetchSummary,
 *     generateInvoice, markAsPaid,
 *     filterByStatus, searchInvoices,
 *   } = useBilling();
 */
export default function useBilling() {
  const dispatch = useDispatch();

  const {
    invoices,
    filtered,
    summary,
    currentInvoice,
    loading,
    summaryLoading,
    submitting,
    error,
    statusFilter,
    searchQuery,
  } = useSelector((state) => state.billing);

  // ── Actions ────────────────────────────────────────────────────────────────

  const fetchInvoices = useCallback(() => {
    dispatch(fetchInvoicesRequest());
  }, [dispatch]);

  const fetchSummary = useCallback(() => {
    dispatch(fetchSummaryRequest());
  }, [dispatch]);

  const generateInvoice = useCallback(
    (prescriptionId, onSuccess) =>
      dispatch(generateInvoiceRequest({ prescriptionId, onSuccess })),
    [dispatch]
  );

  const markAsPaid = useCallback(
    (invoiceId, onSuccess) =>
      dispatch(markPaidRequest({ invoiceId, onSuccess })),
    [dispatch]
  );

  const filterByStatus = useCallback(
    (status) => dispatch(setStatusFilter(status)),
    [dispatch]
  );

  const searchInvoices = useCallback(
    (query) => dispatch(setSearchQuery(query)),
    [dispatch]
  );

  const selectInvoice = useCallback(
    (invoice) => dispatch(setCurrentInvoice(invoice)),
    [dispatch]
  );

  const clearInvoice = useCallback(
    () => dispatch(clearCurrentInvoice()),
    [dispatch]
  );

  const dismissError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    // data
    invoices: filtered,
    allInvoices: invoices,
    summary,
    currentInvoice,
    // status
    loading,
    summaryLoading,
    submitting,
    error,
    // filters
    statusFilter,
    searchQuery,
    // actions
    fetchInvoices,
    fetchSummary,
    generateInvoice,
    markAsPaid,
    filterByStatus,
    searchInvoices,
    selectInvoice,
    clearInvoice,
    dismissError,
  };
}