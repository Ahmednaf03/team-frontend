import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useMemo } from 'react';
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
import { buildPaginationCacheKey } from '../../../utils/paginationCache';

export default function useStaff() {
  const dispatch = useDispatch();

  const {
    list: staff,
    pageCache,
    currentStaff,
    loading,
    submitting,
    error,
    pagination,
    searchQuery,
    roleFilter,
    statusFilter,
  } = useSelector((state) => state.staff);

  const { page, pageSize, total, totalPages, hasNext, hasPrev } = pagination;

  const cacheKey = useMemo(
    () =>
      buildPaginationCacheKey({
        search: searchQuery,
        role: roleFilter,
        status: statusFilter,
      }),
    [roleFilter, searchQuery, statusFilter]
  );
  const cachedPages = useMemo(() => pageCache[cacheKey] ?? {}, [cacheKey, pageCache]);

  useEffect(() => {
    const next = page + 1;

    if (!totalPages || next > totalPages || cachedPages[next]) {
      return;
    }

    dispatch(fetchStaffRequest({ page: next, prefetch: true }));
  }, [cachedPages, dispatch, page, totalPages]);

  const fetchStaff = useCallback((options = {}) => {
    dispatch(fetchStaffRequest(options));
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
    (query) => {
      dispatch(setSearchQuery(query));
      dispatch(fetchStaffRequest({ page: 1 }));
    },
    [dispatch]
  );

  const filterByRole = useCallback(
    (role) => {
      dispatch(setRoleFilter(role));
      dispatch(fetchStaffRequest({ page: 1 }));
    },
    [dispatch]
  );

  const filterByStatus = useCallback(
    (status) => {
      dispatch(setStatusFilter(status));
      dispatch(fetchStaffRequest({ page: 1 }));
    },
    [dispatch]
  );

  const goNext = useCallback(() => {
    if (!hasNext) {
      return;
    }

    dispatch(nextPage());
    dispatch(fetchStaffRequest({ page: page + 1 }));
  }, [dispatch, hasNext, page]);

  const goPrev = useCallback(() => {
    if (!hasPrev) {
      return;
    }

    dispatch(prevPage());
    dispatch(fetchStaffRequest({ page: page - 1 }));
  }, [dispatch, hasPrev, page]);

  const selectStaff = useCallback(
    (member) => dispatch(setCurrentStaff(member)),
    [dispatch]
  );

  const clearStaff = useCallback(() => dispatch(clearCurrentStaff()), [dispatch]);

  const dismissError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    staff,
    allStaff: staff,
    currentStaff,
    loading,
    submitting,
    error,
    searchQuery,
    roleFilter,
    statusFilter,
    page,
    pageSize,
    totalPages,
    hasNext,
    hasPrev,
    total,
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
