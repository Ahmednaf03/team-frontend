import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchCalendarDataRequest,
  rescheduleAppointmentRequest,
  setSelectedDate,
  setViewMode,
  setSelectedDoctor,
  clearMessages,
} from '../calendarSlice';

/**
 * useCalendar()
 *
 * Provides components with:
 *   - All calendar state
 *   - Action dispatchers
 *
 * Usage:
 *   const {
 *     appointments, selectedDate, viewMode, selectedDoctor,
 *     loading, rescheduling, error, success,
 *     fetchCalendarData, rescheduleAppointment,
 *     changeDate, changeView, changeDoctor, dismissMessages,
 *   } = useCalendar();
 */
export default function useCalendar() {
  const dispatch = useDispatch();

  const {
    appointments,
    selectedDate,
    viewMode,
    selectedDoctor,
    loading,
    rescheduling,
    error,
    success,
  } = useSelector((state) => state.calendar);

  const fetchCalendarData = useCallback(() => {
    dispatch(fetchCalendarDataRequest());
  }, [dispatch]);

  const rescheduleAppointment = useCallback(
    ({ id, newDate, newTime }) => {
      dispatch(rescheduleAppointmentRequest({ id, newDate, newTime }));
    },
    [dispatch]
  );

  const changeDate = useCallback(
    (date) => {
      dispatch(setSelectedDate(date));
    },
    [dispatch]
  );

  const changeView = useCallback(
    (mode) => {
      dispatch(setViewMode(mode));
    },
    [dispatch]
  );

  const changeDoctor = useCallback(
    (doctorId) => {
      dispatch(setSelectedDoctor(doctorId));
      dispatch(fetchCalendarDataRequest()); // auto-refetch on doctor change
    },
    [dispatch]
  );

  const dismissMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  return {
    appointments,
    selectedDate,
    viewMode,
    selectedDoctor,
    loading,
    rescheduling,
    error,
    success,
    fetchCalendarData,
    rescheduleAppointment,
    changeDate,
    changeView,
    changeDoctor,
    dismissMessages,
  };
}
