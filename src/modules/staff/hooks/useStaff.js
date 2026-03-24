import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchStaffRequest,
  fetchStaffByIdRequest,
  createStaffRequest,
  updateStaffRequest,
  deleteStaffRequest,
  setSearchQuery,
  setRoleFilter,
  setStatusFilter,
  nextPage,
  prevPage,
  setCurrentStaff,
  clearCurrentStaff,
  clearError,
} from '../staffSlice';

/**
 * useStaff()
 *
 * Central hook for all staff operations.
 * Components never touch the slice or API directly.
 *
 * Usage:
 *   const {
 *     staff, total, loading, submitting, error,
 *     searchQuery, roleFilter, statusFilter,
 *     page, totalPages, hasNext, hasPrev,
 *     fetchStaff, createStaff, updateStaff, deleteStaff,
 *     searchStaff, filterByRole, filterByStatus,
 *     goNext, goPrev, dismissError
 *   } = useStaff();
 */
export default function useStaff() {
  const dispatch = useDispatch();

  const {
    list,
    filtered,
    currentStaff,
    loading,
    submitting,
    error,
    pagination,
    searchQuery,
    roleFilter,
    statusFilter,
  } = useSelector((state) => state.staff);

  const { page, pageSize, total, hasNext, hasPrev } = pagination;

  // Paginated slice of filtered results
  const startIdx = (page - 1) * pageSize;
  const paginatedStaff = filtered.slice(startIdx, startIdx + pageSize);
  const totalPages = Math.ceil(total / pageSize) || 1;

  // ── Actions ────────────────────────────────────────────────────────────────

  const fetchStaff = useCallback(() => {
    dispatch(fetchStaffRequest());
  }, [dispatch]);

  const viewStaff = useCallback(
    (id) => dispatch(fetchStaffByIdRequest(id)),
    [dispatch]
  );

  const createStaff = useCallback(
    (data, onSuccess) => dispatch(createStaffRequest({ data, onSuccess })),
    [dispatch]
  );

  const updateStaff = useCallback(
    (id, data, onSuccess) => dispatch(updateStaffRequest({ id, data, onSuccess })),
    [dispatch]
  );

  const deleteStaff = useCallback(
    (id, onSuccess) => dispatch(deleteStaffRequest({ id, onSuccess })),
    [dispatch]
  );

  const searchStaff = useCallback(
    (query) => dispatch(setSearchQuery(query)),
    [dispatch]
  );

  const filterByRole = useCallback(
    (role) => dispatch(setRoleFilter(role)),
    [dispatch]
  );

  const filterByStatus = useCallback(
    (status) => dispatch(setStatusFilter(status)),
    [dispatch]
  );

  const goNext = useCallback(() => dispatch(nextPage()), [dispatch]);
  const goPrev = useCallback(() => dispatch(prevPage()), [dispatch]);

  const selectStaff = useCallback(
    (member) => dispatch(setCurrentStaff(member)),
    [dispatch]
  );

  const clearStaff = useCallback(() => dispatch(clearCurrentStaff()), [dispatch]);

  const dismissError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    // data
    staff: paginatedStaff,
    allStaff: filtered,
    currentStaff,
    // status
    loading,
    submitting,
    error,
    // filters
    searchQuery,
    roleFilter,
    statusFilter,
    // pagination
    page,
    totalPages,
    hasNext,
    hasPrev,
    total,
    // actions
    fetchStaff,
    viewStaff,
    createStaff,
    updateStaff,
    deleteStaff,
    searchStaff,
    filterByRole,
    filterByStatus,
    goNext,
    goPrev,
    selectStaff,
    clearStaff,
    dismissError,
  };
}
