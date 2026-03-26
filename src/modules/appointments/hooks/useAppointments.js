import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useMemo } from 'react';
import {
  fetchAppointmentsRequest,
  fetchUpcomingRequest,
  fetchAppointmentByIdRequest,
  createAppointmentRequest,
  updateAppointmentRequest,
  cancelAppointmentRequest,
  deleteAppointmentRequest,
  setSelected,
  setFilters,
  clearFilters,
  setPage,
  clearMessages,
} from '../appointmentSlice';
import { buildPaginationCacheKey } from '../../../utils/paginationCache';

/**
 * useAppointments()
 *
 * Provides components with:
 *   - All appointment state from Redux
 *   - Action dispatchers — components never touch slice actions directly
 *
 * Usage:
 *   const {
 *     appointments, upcoming, selected, pagination, filters,
 *     loading, actionLoading, error, success,
 *     fetchAppointments, fetchUpcoming, fetchById,
 *     createAppointment, updateAppointment, cancelAppointment, deleteAppointment,
 *     selectAppointment, applyFilters, resetFilters, goToPage, clearMessages,
 *   } = useAppointments();
 */
export default function useAppointments() {
  const dispatch = useDispatch();

  const {
    list: appointments,
    pageCache,
    upcoming,
    selected,
    pagination,
    filters,
    loading,
    actionLoading,
    error,
    success,
  } = useSelector((state) => state.appointments);

  const cacheKey = useMemo(() => buildPaginationCacheKey(filters), [filters]);
  const cachedPages = useMemo(() => pageCache[cacheKey] ?? {}, [cacheKey, pageCache]);

  useEffect(() => {
    const nextPage = pagination.currentPage + 1;

    if (
      !pagination.totalPages ||
      nextPage > pagination.totalPages ||
      cachedPages[nextPage]
    ) {
      return;
    }

    dispatch(fetchAppointmentsRequest({ page: nextPage, prefetch: true }));
  }, [
    cachedPages,
    dispatch,
    pagination.currentPage,
    pagination.totalPages,
  ]);

  // ── Data fetching ───────────────────────────────────────────────────────────
  const fetchAppointments = useCallback((options = {}) => {
    dispatch(fetchAppointmentsRequest(options));
  }, [dispatch]);

  const fetchUpcoming = useCallback(() => {
    dispatch(fetchUpcomingRequest());
  }, [dispatch]);

  const fetchById = useCallback(
    (id) => {
      dispatch(fetchAppointmentByIdRequest(id));
    },
    [dispatch]
  );

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const createAppointment = useCallback(
  (payload) => {
    console.log('Dispatching createAppointmentRequest:', payload);
    dispatch(createAppointmentRequest(payload));
  },
  [dispatch]
);

  const updateAppointment = useCallback(
    (payload) => {
      // payload: { id, patient_id?, doctor_id?, scheduled_at?, notes? }
      dispatch(updateAppointmentRequest(payload));
    },
    [dispatch]
  );

  const cancelAppointment = useCallback(
    (id) => {
      dispatch(cancelAppointmentRequest(id));
    },
    [dispatch]
  );

  const deleteAppointment = useCallback(
    (id) => {
      dispatch(deleteAppointmentRequest(id));
    },
    [dispatch]
  );

  // ── UI helpers ──────────────────────────────────────────────────────────────
  const selectAppointment = useCallback(
    (appointment) => {
      dispatch(setSelected(appointment));
    },
    [dispatch]
  );

  const applyFilters = useCallback(
    (newFilters) => {
      dispatch(setFilters(newFilters));
      dispatch(fetchAppointmentsRequest({ page: 1 })); // auto-refetch on filter change
    },
    [dispatch]
  );

  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
    dispatch(fetchAppointmentsRequest({ page: 1 }));
  }, [dispatch]);

  const goToPage = useCallback(
    (page) => {
      dispatch(setPage(page));
      dispatch(fetchAppointmentsRequest({ page }));
    },
    [dispatch]
  );

  const dismissMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  return {
    // State
    appointments,
    upcoming,
    selected,
    pagination,
    filters,
    loading,
    actionLoading,
    error,
    success,

    // Actions
    fetchAppointments,
    fetchUpcoming,
    fetchById,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    deleteAppointment,
    selectAppointment,
    applyFilters,
    resetFilters,
    goToPage,
    dismissMessages,
  };
}
