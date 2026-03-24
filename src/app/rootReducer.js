// src/app/rootReducer.js
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../modules/auth/authSlice';
import patientReducer from '../modules/patients/patientSlice';
import prescriptionReducer from '../modules/prescriptions/prescriptionSlice';
import billingReducer from '../modules/billing/billingSlice';
import appointmentReducer from '../modules/appointments/appointmentSlice';
import calendarReducer from '../modules/calendar/calendarSlice';
import staffReducer from '../modules/staff/staffSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  patients: patientReducer,
  prescriptions: prescriptionReducer,
  billing: billingReducer,
  calendar:calendarReducer,
  appointments: appointmentReducer,
  staff: staffReducer,
  // billing: billingReducer,
  // staff: staffReducer,
});

export default rootReducer;
