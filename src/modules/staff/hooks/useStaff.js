import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useMemo } from 'react';
import {
  fetchStaffRequest,
  prefetchStaffRequest,
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
    prefetchingPages,
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
  const prefetchingForQuery = prefetchingPages[cacheKey] ?? {};

  useEffect(() => {
    const next = page + 1;

    if (!totalPages || next > totalPages || cachedPages[next] || prefetchingForQuery[next]) {
      return;
    }

    dispatch(prefetchStaffRequest({ page: next, queryKey: cacheKey }));
  }, [cacheKey, cachedPages, dispatch, page, prefetchingForQuery, totalPages]);

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

    dispatch(nextPage({ queryKey: cacheKey }));
    dispatch(fetchStaffRequest({ page: page + 1 }));
  }, [cacheKey, dispatch, hasNext, page]);

  const goPrev = useCallback(() => {
    if (!hasPrev) {
      return;
    }

    dispatch(prevPage({ queryKey: cacheKey }));
    dispatch(fetchStaffRequest({ page: page - 1 }));
  }, [cacheKey, dispatch, hasPrev, page]);

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
