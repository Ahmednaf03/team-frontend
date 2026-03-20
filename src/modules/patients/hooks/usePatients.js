import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchPatientsRequest,
  fetchPatientByIdRequest,
  createPatientRequest,
  updatePatientRequest,
  deletePatientRequest,
  setSearchQuery,
  nextPage,
  prevPage,
  setCurrentPatient,
  clearCurrentPatient,
  clearError,
} from '../patientSlice';

/**
 * usePatients()
 *
 * Central hook for all patient operations.
 * Components never touch the slice or API directly.
 *
 * Usage:
 *   const {
 *     patients, currentPage, totalPages, hasNext, hasPrev,
 *     loading, submitting, error,
 *     fetchPatients, createPatient, updatePatient, deletePatient,
 *     searchPatients, goNext, goPrev, viewPatient
 *   } = usePatients();
 */
export default function usePatients() {
  const dispatch = useDispatch();

  const {
    list,
    filtered,
    currentPatient,
    loading,
    submitting,
    error,
    pagination,
    searchQuery,
  } = useSelector((state) => state.patients);

  const { page, pageSize, total, hasNext, hasPrev } = pagination;

  // Paginated slice of filtered results
  const startIdx = (page - 1) * pageSize;
  const paginatedPatients = filtered.slice(startIdx, startIdx + pageSize);
  const totalPages = Math.ceil(total / pageSize) || 1;

  // ── Actions ──────────────────────────────────────────────────────────────

  const fetchPatients = useCallback(() => {
    dispatch(fetchPatientsRequest());
  }, [dispatch]);

  const viewPatient = useCallback(
    (id) => dispatch(fetchPatientByIdRequest(id)),
    [dispatch]
  );

  const createPatient = useCallback(
    (data, onSuccess) =>
      dispatch(createPatientRequest({ data, onSuccess })),
    [dispatch]
  );

  const updatePatient = useCallback(
    (id, data, onSuccess) =>
      dispatch(updatePatientRequest({ id, data, onSuccess })),
    [dispatch]
  );

  const deletePatient = useCallback(
    (id, onSuccess) =>
      dispatch(deletePatientRequest({ id, onSuccess })),
    [dispatch]
  );

  const searchPatients = useCallback(
    (query) => dispatch(setSearchQuery(query)),
    [dispatch]
  );

  const goNext = useCallback(() => dispatch(nextPage()), [dispatch]);
  const goPrev = useCallback(() => dispatch(prevPage()), [dispatch]);

  const selectPatient = useCallback(
    (patient) => dispatch(setCurrentPatient(patient)),
    [dispatch]
  );

  const clearPatient = useCallback(
    () => dispatch(clearCurrentPatient()),
    [dispatch]
  );

  const dismissError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    // data
    patients: paginatedPatients,
    allPatients: filtered,
    currentPatient,
    // status
    loading,
    submitting,
    error,
    // search
    searchQuery,
    // pagination
    page,
    totalPages,
    hasNext,
    hasPrev,
    total,
    // actions
    fetchPatients,
    viewPatient,
    createPatient,
    updatePatient,
    deletePatient,
    searchPatients,
    goNext,
    goPrev,
    selectPatient,
    clearPatient,
    dismissError,
  };
}
