import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useMemo } from 'react';
import {
  fetchPrescriptionsRequest,
  prefetchPrescriptionsRequest,
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
  clearSuccess,
} from '../prescriptionSlice';
import { buildPaginationCacheKey } from '../../../utils/paginationCache';

export default function usePrescriptions() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);

  const {
    list: prescriptions,
    pageCache,
    prefetchingPages,
    currentPrescription,
    loading,
    detailLoading,
    submitting,
    error,
    success,
    searchQuery,
    statusFilter,
    pagination,
  } = useSelector((state) => state.prescriptions);

  const { page, pageSize, total, totalPages, hasNext, hasPrev } = pagination;
  const currentRole = String(currentUser?.role || '').toLowerCase();

  const cacheKey = useMemo(
    () =>
      buildPaginationCacheKey({
        search: searchQuery,
        status: statusFilter,
        scopeRole: currentRole,
        scopeUserId: currentRole === 'provider' ? String(currentUser?.id || '') : '',
      }),
    [currentRole, currentUser?.id, searchQuery, statusFilter]
  );
  const cachedPages = useMemo(() => pageCache[cacheKey] ?? {}, [cacheKey, pageCache]);
  const prefetchingForQuery = prefetchingPages[cacheKey] ?? {};

  useEffect(() => {
    const next = page + 1;

    if (
      !totalPages ||
      next > totalPages ||
      cachedPages[next] ||
      prefetchingForQuery[next]
    ) {
      return;
    }

    dispatch(prefetchPrescriptionsRequest({ page: next, queryKey: cacheKey }));
  }, [cacheKey, cachedPages, dispatch, page, prefetchingForQuery, totalPages]);

  const fetchPrescriptions = useCallback((options = {}) => {
    dispatch(fetchPrescriptionsRequest(options));
  }, [dispatch]);

  const openPrescription = useCallback(
    (id) => dispatch(fetchPrescriptionByIdRequest(id)),
    [dispatch]
  );

  const closePrescription = useCallback(
    () => dispatch(clearCurrentPrescription()),
    [dispatch]
  );

  const createPrescription = useCallback(
    (data) => dispatch(createPrescriptionRequest({ data })),
    [dispatch]
  );

  const addItem = useCallback(
    (data, prescriptionId) =>
      dispatch(addItemRequest({ data, prescriptionId })),
    [dispatch]
  );

  const verify = useCallback(
    (id) => dispatch(verifyRequest({ id })),
    [dispatch]
  );

  const dispense = useCallback(
    (id) => dispatch(dispenseRequest({ id })),
    [dispatch]
  );

  const searchPrescriptions = useCallback(
    (query) => {
      dispatch(setSearchQuery(query));
      dispatch(fetchPrescriptionsRequest({ page: 1 }));
    },
    [dispatch]
  );

  const filterByStatus = useCallback(
    (status) => {
      dispatch(setStatusFilter(status));
      dispatch(fetchPrescriptionsRequest({ page: 1 }));
    },
    [dispatch]
  );

  const goNext = useCallback(() => {
    if (!hasNext) {
      return;
    }

    dispatch(nextPage({ queryKey: cacheKey }));
    dispatch(fetchPrescriptionsRequest({ page: page + 1 }));
  }, [cacheKey, dispatch, hasNext, page]);

  const goPrev = useCallback(() => {
    if (!hasPrev) {
      return;
    }

    dispatch(prevPage({ queryKey: cacheKey }));
    dispatch(fetchPrescriptionsRequest({ page: page - 1 }));
  }, [cacheKey, dispatch, hasPrev, page]);

  const dismissError = useCallback(() => dispatch(clearError()), [dispatch]);
  const dismissSuccess = useCallback(() => dispatch(clearSuccess()), [dispatch]);

  return {
    prescriptions,
    allPrescriptions: prescriptions,
    currentPrescription,
    loading,
    detailLoading,
    submitting,
    error,
    success,
    searchQuery,
    statusFilter,
    page,
    pageSize,
    totalPages,
    total,
    hasNext,
    hasPrev,
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
    dismissSuccess,
  };
}
