import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { logoutRequest } from '../modules/auth/authSlice';

// If you have toast library, e.g. react-toastify:
import { toast } from 'react-toastify';

export default function useIdleLogout(
  isLoggedIn,
  timeoutMs =  60 * 1000,
  warningMs = 10 * 1000,
  onWarning = () => {
    toast.warn('Inactive, you will be logged out shortly');
  }
) {
  const dispatch = useDispatch();
  const logoutTimerRef = useRef(null);
  const warningTimerRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  const scheduleTimers = useCallback(() => {
    clearTimers();

    const warningDelay = Math.max(0,  warningMs);
    warningTimerRef.current = setTimeout(() => {
      onWarning(); // e.g. toast.warn('Inactive, you will be logged out shortly');
    }, warningDelay);

    logoutTimerRef.current = setTimeout(() => {
      dispatch(logoutRequest());
      clearTimers();
    }, timeoutMs);
  }, [clearTimers, dispatch, onWarning, timeoutMs, warningMs]);

  useEffect(() => {
    if (!isLoggedIn) {
      clearTimers();
      return;
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((name) => window.addEventListener(name, scheduleTimers, { passive: true }));

    scheduleTimers();

    return () => {
      events.forEach((name) => window.removeEventListener(name, scheduleTimers));
      clearTimers();
    };
  }, [isLoggedIn, scheduleTimers, clearTimers]);
}