// src/app/rootReducer.js
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../modules/auth/authSlice';
import patientReducer from '../modules/patients/patientSlice';
import prescriptionReducer from '../modules/prescriptions/prescriptionSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  patients: patientReducer,
  prescriptions: prescriptionReducer,
  // plug future modules here:
  // appointments: appointmentReducer,
  // billing: billingReducer,
  // staff: staffReducer,
});

export default rootReducer;
