import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useMemo } from 'react';
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
import { buildPaginationCacheKey } from '../../../utils/paginationCache';

export default function usePrescriptions() {
  const dispatch = useDispatch();

  const {
    list: prescriptions,
    pageCache,
    currentPrescription,
    loading,
    detailLoading,
    submitting,
    error,
    searchQuery,
    statusFilter,
    pagination,
  } = useSelector((state) => state.prescriptions);

  const { page, pageSize, total, totalPages, hasNext, hasPrev } = pagination;

  const cacheKey = useMemo(
    () =>
      buildPaginationCacheKey({
        search: searchQuery,
        status: statusFilter,
      }),
    [searchQuery, statusFilter]
  );
  const cachedPages = useMemo(() => pageCache[cacheKey] ?? {}, [cacheKey, pageCache]);

  useEffect(() => {
    const next = page + 1;

    if (!totalPages || next > totalPages || cachedPages[next]) {
      return;
    }

    dispatch(fetchPrescriptionsRequest({ page: next, prefetch: true }));
  }, [cachedPages, dispatch, page, totalPages]);

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
    (data, onSuccess) => dispatch(createPrescriptionRequest({ data, onSuccess })),
    [dispatch]
  );

  const addItem = useCallback(
    (data, prescriptionId, onSuccess) =>
      dispatch(addItemRequest({ data, prescriptionId, onSuccess })),
    [dispatch]
  );

  const verify = useCallback(
    (id, onSuccess) => dispatch(verifyRequest({ id, onSuccess })),
    [dispatch]
  );

  const dispense = useCallback(
    (id, onSuccess) => dispatch(dispenseRequest({ id, onSuccess })),
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

    dispatch(nextPage());
    dispatch(fetchPrescriptionsRequest({ page: page + 1 }));
  }, [dispatch, hasNext, page]);

  const goPrev = useCallback(() => {
    if (!hasPrev) {
      return;
    }

    dispatch(prevPage());
    dispatch(fetchPrescriptionsRequest({ page: page - 1 }));
  }, [dispatch, hasPrev, page]);

  const dismissError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    prescriptions,
    allPrescriptions: prescriptions,
    currentPrescription,
    loading,
    detailLoading,
    submitting,
    error,
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
  };
}
