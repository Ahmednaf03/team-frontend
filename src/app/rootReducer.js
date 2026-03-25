// src/app/rootReducer.js
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../modules/auth/authSlice';
import patientReducer from '../modules/patients/patientSlice';
import prescriptionReducer from '../modules/prescriptions/prescriptionSlice';
import billingReducer from '../modules/billing/billingSlice';
import appointmentReducer from '../modules/appointments/appointmentSlice';
import calendarReducer from '../modules/calendar/calendarSlice';
import staffReducer from '../modules/staff/staffSlice';
import chatReducer from '../modules/chat/chatSlice';
import notificationReducer from '../modules/notifications/notificationSlice';
const rootReducer = combineReducers({
  auth: authReducer,
  patients: patientReducer,
  prescriptions: prescriptionReducer,
  billing: billingReducer,
  calendar:calendarReducer,
  appointments: appointmentReducer,
  staff: staffReducer,
  chat: chatReducer,
  notifications: notificationReducer,
  // billing: billingReducer,
  // staff: staffReducer,
});

export default rootReducer;
