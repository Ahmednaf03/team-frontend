import { call, put, takeLatest } from 'redux-saga/effects';
import { jwtDecode } from 'jwt-decode';
import { loginAPI, logoutAPI, refreshTokenAPI, changePasswordAPI } from './authAPI';
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  logoutRequest,
  logoutSuccess,
  sessionCheckComplete,
  changePasswordRequest,
  changePasswordSuccess,
  changePasswordFailure,
} from './authSlice';

// ─── Login ────────────────────────────────────────────────────────────────────
function* handleLogin(action) {
  try {
    const { username, password } = action.payload;
    const responseData = yield call(loginAPI, { username, password });
    
    const { access_token, csrf_token } = responseData.data || responseData;

    // 2. Decode the token to guarantee we get the user data (including role)
    const decodedToken = jwtDecode(access_token);
    const user = {
      id: decodedToken.user_id,
      role: decodedToken.role, // e.g., "admin"
      tenant_id: decodedToken.tenant_id
    };

    localStorage.setItem('access_token', access_token);
    if (csrf_token) {
      sessionStorage.setItem('csrf_token', csrf_token);
    }

    // 3. Pass the extracted user into Redux
    yield put(loginSuccess({ access_token, csrf_token, user }));
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Login failed. Please check your credentials.';
    yield put(loginFailure(message));
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
function* handleLogout() {
  try {
    yield call(logoutAPI);
  } catch (_) {
    // Best-effort logout
  } finally {
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('csrf_token');
    yield put(logoutSuccess());
  }
}

// ─── Session Check (on app mount) ─────────────────────────────────────────────
// Inside src/modules/auth/authSaga.js

function* handleSessionCheck() {
  try {
    const storedToken = localStorage.getItem('access_token');
    const csrfToken = sessionStorage.getItem('csrf_token');

    // 1. If no token exists, they are definitely logged out
    if (!storedToken) {
      yield put(sessionCheckComplete());
      return;
    }

    // 2. Decode the token to check its expiration time
    const decodedToken = jwtDecode(storedToken);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp > currentTime) {
      // ==========================================
      // SCENARIO A: Token is still valid!
      // ==========================================
      const user = {
        id: decodedToken.user_id,
        role: decodedToken.role,
        tenant_id: decodedToken.tenant_id
      };
      
      // Instantly restore the session without hitting the backend
      yield put(loginSuccess({ access_token: storedToken, csrf_token: csrfToken, user }));
      
    } else {
      // ==========================================
      // SCENARIO B: Token expired, attempt refresh
      // ==========================================
      const response = yield call(refreshTokenAPI);
      const { access_token, csrf_token } = response.data;

      const newDecodedToken = jwtDecode(access_token);
      const user = {
        id: newDecodedToken.user_id,
        role: newDecodedToken.role,
        tenant_id: newDecodedToken.tenant_id
      };

      localStorage.setItem('access_token', access_token);
      if (csrf_token) sessionStorage.setItem('csrf_token', csrf_token);

      yield put(loginSuccess({ access_token, csrf_token, user }));
    }
  } catch (error) {
    // 3. Catch silent failures (e.g., refreshTokenAPI is broken or network is down)
    console.error("Session rehydration failed:", error);
    
    // Clear the bad tokens out so they don't get stuck in a loop
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('csrf_token');
    yield put(logoutSuccess());
  } finally {
    // 4. Always tell the AppRouter we are done loading!
    yield put(sessionCheckComplete());
  }
}

// ─── Change Password ──────────────────────────────────────────────────────────
function* handleChangePassword(action) {
  try {
    const { old_password, new_password } = action.payload;
    yield call(changePasswordAPI, { old_password, new_password });
    yield put(changePasswordSuccess());
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Failed to change password. Please try again.';
    yield put(changePasswordFailure(message));
  }
}

// ─── Root Auth Saga ───────────────────────────────────────────────────────────
export default function* authSaga() {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(logoutRequest.type, handleLogout);
  yield takeLatest('auth/sessionCheck', handleSessionCheck);
  yield takeLatest(changePasswordRequest.type, handleChangePassword);
}
