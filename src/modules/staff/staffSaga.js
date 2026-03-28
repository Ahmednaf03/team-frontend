import { call, put, takeLatest, takeEvery, select } from 'redux-saga/effects';
import {
  fetchAllStaffAPI,
  fetchStaffByIdAPI,
  createStaffAPI,
  updateStaffAPI,
  deleteStaffAPI,
} from './staffAPI';
import { buildPaginationCacheKey } from '../../utils/paginationCache';
import {
  fetchStaffRequest,
  fetchStaffSuccess,
  fetchStaffFailure,
  prefetchStaffRequest,
  prefetchStaffSuccess,
  prefetchStaffFailure,
  hydrateStaffFromCache,
  fetchStaffByIdRequest,
  fetchStaffByIdSuccess,
  fetchStaffByIdFailure,
  createStaffRequest,
  createStaffSuccess,
  createStaffFailure,
  updateStaffRequest,
  updateStaffSuccess,
  updateStaffFailure,
  deleteStaffRequest,
  deleteStaffSuccess,
  deleteStaffFailure,
} from './staffSlice';
import { getEntityDisplayName, matchesSearch, normalizeNamedEntity } from '../../utils/entityDisplay';

const applyFilters = (staff, searchQuery, roleFilter, statusFilter) => {
  const q = searchQuery.toLowerCase().trim();

  return staff.filter((member) => {
    const matchSearch =
      !q ||
      matchesSearch(getEntityDisplayName(member), q) ||
      matchesSearch(member.email, q) ||
      matchesSearch(member.role, q);
    const matchRole = roleFilter === 'all' || member.role === roleFilter;
    const matchStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });
};

const buildFallbackPage = (items, page, pageSize) => {
  const totalRecords = items.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startIdx = (page - 1) * pageSize;

  return {
    data: items.slice(startIdx, startIdx + pageSize),
    pagination: {
      currentPage: page,
      totalPages,
      totalRecords,
      perPage: pageSize,
    },
  };
};

function* handleFetchStaff(action) {
  try {
    const { pagination, searchQuery, roleFilter, statusFilter } = yield select(
      (state) => state.staff
    );
    const requestedPage = action.payload?.page ?? pagination.page;
    const force = Boolean(action.payload?.force);
    const useLocalSearch = Boolean(searchQuery?.trim());
    const queryKey = buildPaginationCacheKey({
      search: searchQuery,
      role: roleFilter,
      status: statusFilter,
    });
    const cachedPage = yield select(
      (state) => state.staff.pageCache[queryKey]?.[requestedPage]
    );

    if (cachedPage && !force) {
      yield put(hydrateStaffFromCache({ page: requestedPage, queryKey }));
      return;
    }

    const params = {
      page: useLocalSearch ? 1 : requestedPage,
      per_page: useLocalSearch ? 500 : pagination.pageSize,
      ...(!useLocalSearch && searchQuery && { search: searchQuery }),
      ...(roleFilter !== 'all' && { role: roleFilter }),
      ...(statusFilter !== 'all' && { status: statusFilter }),
    };

    const envelope = yield call(fetchAllStaffAPI, params);
    const responseData = Array.isArray(envelope?.data)
      ? envelope.data.map(normalizeNamedEntity)
      : [];
    const paginatedPayload = useLocalSearch
      ? buildFallbackPage(
          applyFilters(responseData, searchQuery, roleFilter, statusFilter),
          requestedPage,
          pagination.pageSize
        )
      : envelope?.pagination
      ? {
          data: responseData,
          pagination: envelope.pagination,
        }
      : buildFallbackPage(
          applyFilters(responseData, searchQuery, roleFilter, statusFilter),
          requestedPage,
          pagination.pageSize
        );

    yield put(
      fetchStaffSuccess({
        data: paginatedPayload.data,
        pagination: paginatedPayload.pagination,
        page: requestedPage,
        queryKey,
      })
    );
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch staff.';
    yield put(fetchStaffFailure(message));
  }
}

function* handlePrefetchStaff(action) {
  try {
    const { pagination, searchQuery, roleFilter, statusFilter } = yield select(
      (state) => state.staff
    );
    const requestedPage = action.payload?.page;
    const useLocalSearch = Boolean(searchQuery?.trim());
    const queryKey =
      action.payload?.queryKey ??
      buildPaginationCacheKey({
        search: searchQuery,
        role: roleFilter,
        status: statusFilter,
      });

    if (!requestedPage) {
      return;
    }

    const cachedPage = yield select(
      (state) => state.staff.pageCache[queryKey]?.[requestedPage]
    );

    if (cachedPage) {
      yield put(prefetchStaffFailure({ page: requestedPage, queryKey }));
      return;
    }

    const params = {
      page: useLocalSearch ? 1 : requestedPage,
      per_page: useLocalSearch ? 500 : pagination.pageSize,
      ...(!useLocalSearch && searchQuery && { search: searchQuery }),
      ...(roleFilter !== 'all' && { role: roleFilter }),
      ...(statusFilter !== 'all' && { status: statusFilter }),
    };

    const envelope = yield call(fetchAllStaffAPI, params);
    const responseData = Array.isArray(envelope?.data)
      ? envelope.data.map(normalizeNamedEntity)
      : [];
    const paginatedPayload = useLocalSearch
      ? buildFallbackPage(
          applyFilters(responseData, searchQuery, roleFilter, statusFilter),
          requestedPage,
          pagination.pageSize
        )
      : envelope?.pagination
      ? {
          data: responseData,
          pagination: envelope.pagination,
        }
      : buildFallbackPage(
          applyFilters(responseData, searchQuery, roleFilter, statusFilter),
          requestedPage,
          pagination.pageSize
        );

    yield put(
      prefetchStaffSuccess({
        data: paginatedPayload.data,
        pagination: paginatedPayload.pagination,
        page: requestedPage,
        queryKey,
      })
    );
  } catch (error) {
    yield put(
      prefetchStaffFailure({
        page: action.payload?.page,
        queryKey: action.payload?.queryKey,
      })
    );
  }
}

function* handleFetchStaffById(action) {
  try {
    const envelope = yield call(fetchStaffByIdAPI, action.payload);
    yield put(fetchStaffByIdSuccess(normalizeNamedEntity(envelope.data)));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch staff member.';
    yield put(fetchStaffByIdFailure(message));
  }
}

function* handleCreateStaff(action) {
  try {
    yield call(createStaffAPI, action.payload.data);
    yield put(createStaffSuccess());
    yield put(fetchStaffRequest({ page: 1, force: true }));
    if (action.payload.onSuccess) action.payload.onSuccess();
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to create staff member.';
    yield put(createStaffFailure(message));
  }
}

function* handleUpdateStaff(action) {
  try {
    yield call(updateStaffAPI, { id: action.payload.id, data: action.payload.data });
    yield put(updateStaffSuccess());
    yield put(fetchStaffRequest({ page: 1, force: true }));
    if (action.payload.onSuccess) action.payload.onSuccess();
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to update staff member.';
    yield put(updateStaffFailure(message));
  }
}

function* handleDeleteStaff(action) {
  try {
    yield call(deleteStaffAPI, action.payload.id);
    yield put(deleteStaffSuccess());
    yield put(fetchStaffRequest({ page: 1, force: true }));
    if (action.payload.onSuccess) action.payload.onSuccess();
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to delete staff member.';
    yield put(deleteStaffFailure(message));
  }
}

export default function* staffSaga() {
  yield takeLatest(fetchStaffRequest.type, handleFetchStaff);
  yield takeEvery(prefetchStaffRequest.type, handlePrefetchStaff);
  yield takeLatest(fetchStaffByIdRequest.type, handleFetchStaffById);
  yield takeEvery(createStaffRequest.type, handleCreateStaff);
  yield takeEvery(updateStaffRequest.type, handleUpdateStaff);
  yield takeEvery(deleteStaffRequest.type, handleDeleteStaff);
}
