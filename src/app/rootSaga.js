import { all } from 'redux-saga/effects';
import authSaga from '../modules/auth/authSaga';
import appointmentSaga from '../modules/appointments/appointmentSaga';
import calendarSaga from '../modules/calendar/calendarSaga';
import patientSaga from '../modules/patients/patientSaga';
import prescriptionSaga from '../modules/prescriptions/prescriptionSaga';
import billingSaga from '../modules/billing/billingSaga';
export default function* rootSaga() {
  yield all([
    authSaga(),
     appointmentSaga(),
     calendarSaga(),
    patientSaga(),
    prescriptionSaga(),
   billingSaga(),
    // Future sagas plug in here:
    // tenantSaga(),
    // patientSaga(),

    // notificationSaga(),
  ]);
} 