import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useMemo } from 'react';
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
import { buildPaginationCacheKey } from '../../../utils/paginationCache';

export default function usePatients() {
  const dispatch = useDispatch();

  const {
    list: patients,
    pageCache,
    currentPatient,
    loading,
    submitting,
    error,
    pagination,
    searchQuery,
  } = useSelector((state) => state.patients);

  const { page, pageSize, total, totalPages, hasNext, hasPrev } = pagination;

  const cacheKey = useMemo(
    () => buildPaginationCacheKey({ search: searchQuery }),
    [searchQuery]
  );
  const cachedPages = useMemo(() => pageCache[cacheKey] ?? {}, [cacheKey, pageCache]);

  useEffect(() => {
    const next = page + 1;

    if (!totalPages || next > totalPages || cachedPages[next]) {
      return;
    }

    dispatch(fetchPatientsRequest({ page: next, prefetch: true }));
  }, [cachedPages, dispatch, page, totalPages]);

  const fetchPatients = useCallback((options = {}) => {
    dispatch(fetchPatientsRequest(options));
  }, [dispatch]);

  const viewPatient = useCallback(
    (id) => dispatch(fetchPatientByIdRequest(id)),
    [dispatch]
  );

  const createPatient = useCallback(
    (data, onSuccess) => dispatch(createPatientRequest({ data, onSuccess })),
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
    (query) => {
      dispatch(setSearchQuery(query));
      dispatch(fetchPatientsRequest({ page: 1 }));
    },
    [dispatch]
  );

  const goNext = useCallback(() => {
    if (!hasNext) {
      return;
    }

    dispatch(nextPage());
    dispatch(fetchPatientsRequest({ page: page + 1 }));
  }, [dispatch, hasNext, page]);

  const goPrev = useCallback(() => {
    if (!hasPrev) {
      return;
    }

    dispatch(prevPage());
    dispatch(fetchPatientsRequest({ page: page - 1 }));
  }, [dispatch, hasPrev, page]);

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
    patients,
    allPatients: patients,
    currentPatient,
    loading,
    submitting,
    error,
    searchQuery,
    page,
    pageSize,
    totalPages,
    hasNext,
    hasPrev,
    total,
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
