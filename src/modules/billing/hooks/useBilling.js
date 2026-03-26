import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useMemo } from 'react';
import {
  fetchInvoicesRequest,
  fetchSummaryRequest,
  generateInvoiceRequest,
  markPaidRequest,
  setStatusFilter,
  setSearchQuery,
  nextPage,
  prevPage,
  setCurrentInvoice,
  clearCurrentInvoice,
  clearError,
} from '../billingSlice';
import { buildPaginationCacheKey } from '../../../utils/paginationCache';

export default function useBilling() {
  const dispatch = useDispatch();

  const {
    invoices,
    pageCache,
    summary,
    currentInvoice,
    loading,
    summaryLoading,
    submitting,
    error,
    statusFilter,
    searchQuery,
    pagination,
  } = useSelector((state) => state.billing);

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

    dispatch(fetchInvoicesRequest({ page: next, prefetch: true }));
  }, [cachedPages, dispatch, page, totalPages]);

  const fetchInvoices = useCallback((options = {}) => {
    dispatch(fetchInvoicesRequest(options));
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
    (status) => {
      dispatch(setStatusFilter(status));
      dispatch(fetchInvoicesRequest({ page: 1 }));
    },
    [dispatch]
  );

  const searchInvoices = useCallback(
    (query) => {
      dispatch(setSearchQuery(query));
      dispatch(fetchInvoicesRequest({ page: 1 }));
    },
    [dispatch]
  );

  const goNext = useCallback(() => {
    if (!hasNext) {
      return;
    }

    dispatch(nextPage());
    dispatch(fetchInvoicesRequest({ page: page + 1 }));
  }, [dispatch, hasNext, page]);

  const goPrev = useCallback(() => {
    if (!hasPrev) {
      return;
    }

    dispatch(prevPage());
    dispatch(fetchInvoicesRequest({ page: page - 1 }));
  }, [dispatch, hasPrev, page]);

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
    invoices,
    allInvoices: invoices,
    summary,
    currentInvoice,
    loading,
    summaryLoading,
    submitting,
    error,
    statusFilter,
    searchQuery,
    page,
    pageSize,
    total,
    totalPages,
    hasNext,
    hasPrev,
    fetchInvoices,
    fetchSummary,
    generateInvoice,
    markAsPaid,
    filterByStatus,
    searchInvoices,
    goNext,
    goPrev,
    selectInvoice,
    clearInvoice,
    dismissError,
  };
}
