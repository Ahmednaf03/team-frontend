// src/modules/prescriptions/hooks/usePrescriptions.js
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchPrescriptionsRequest,
  fetchPrescriptionByIdRequest,
  createPrescriptionRequest,
  addItemRequest,
  verifyRequest,
  dispenseRequest,
  setSearchQuery,
  setStatusFilter,
  nextPage,
  prevPage,
  clearCurrentPrescription,
  clearError,
} from '../prescriptionSlice';

/**
 * usePrescriptions()
 *
 * Central hook for all prescription operations.
 * Components never touch the slice or API directly — they go through this hook.
 *
 * Usage:
 *   const {
 *     prescriptions, currentPrescription, loading, detailLoading, submitting, error,
 *     fetchPrescriptions, openPrescription, createPrescription, addItem,
 *     verify, dispense,
 *     searchPrescriptions, filterByStatus,
 *     page, totalPages, hasNext, hasPrev, goNext, goPrev
 *   } = usePrescriptions();
 */
export default function usePrescriptions() {
  const dispatch = useDispatch();

  const {
    list,
    filtered,
    currentPrescription,
    loading,
    detailLoading,
    submitting,
    error,
    searchQuery,
    statusFilter,
    pagination,
  } = useSelector((state) => state.prescriptions);

  const { page, pageSize, total, hasNext, hasPrev } = pagination;

  // Paginated slice of filtered results
  const startIdx = (page - 1) * pageSize;
  const prescriptions = filtered.slice(startIdx, startIdx + pageSize);
  const totalPages = Math.ceil(total / pageSize) || 1;

  // ── Actions ───────────────────────────────────────────────────────────────

  const fetchPrescriptions = useCallback(() => {
    dispatch(fetchPrescriptionsRequest());
  }, [dispatch]);

  /** Opens detail panel / modal for a prescription, loading its items */
  const openPrescription = useCallback(
    (id) => dispatch(fetchPrescriptionByIdRequest(id)),
    [dispatch]
  );

  const closePrescription = useCallback(
    () => dispatch(clearCurrentPrescription()),
    [dispatch]
  );

  /**
   * createPrescription(data, onSuccess)
   * data: { patient_id, doctor_id, appointment_id, notes }
   * onSuccess(responseData): receives { prescription_id } from backend
   */
  const createPrescription = useCallback(
    (data, onSuccess) => dispatch(createPrescriptionRequest({ data, onSuccess })),
    [dispatch]
  );

  /**
   * addItem(data, prescriptionId, onSuccess)
   * data: { prescription_id, medicine_id, dosage, frequency, duration_days, quantity, instructions? }
   */
  const addItem = useCallback(
    (data, prescriptionId, onSuccess) =>
      dispatch(addItemRequest({ data, prescriptionId, onSuccess })),
    [dispatch]
  );

  /** verify(id, onSuccess) — pharmacist only: PENDING → VERIFIED */
  const verify = useCallback(
    (id, onSuccess) => dispatch(verifyRequest({ id, onSuccess })),
    [dispatch]
  );

  /** dispense(id, onSuccess) — pharmacist only: VERIFIED → DISPENSED + reduces stock */
  const dispense = useCallback(
    (id, onSuccess) => dispatch(dispenseRequest({ id, onSuccess })),
    [dispatch]
  );

  const searchPrescriptions = useCallback(
    (query) => dispatch(setSearchQuery(query)),
    [dispatch]
  );

  const filterByStatus = useCallback(
    (status) => dispatch(setStatusFilter(status)),
    [dispatch]
  );

  const goNext = useCallback(() => dispatch(nextPage()), [dispatch]);
  const goPrev = useCallback(() => dispatch(prevPage()), [dispatch]);

  const dismissError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    // data
    prescriptions,
    allPrescriptions: filtered,
    currentPrescription,
    // status
    loading,
    detailLoading,
    submitting,
    error,
    // filters
    searchQuery,
    statusFilter,
    // pagination
    page,
    totalPages,
    total,
    hasNext,
    hasPrev,
    // actions
    fetchPrescriptions,
    openPrescription,
    closePrescription,
    createPrescription,
    addItem,
    verify,
    dispense,
    searchPrescriptions,
    filterByStatus,
    goNext,
    goPrev,
    dismissError,
  };
}