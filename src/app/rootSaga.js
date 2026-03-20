import { all } from 'redux-saga/effects';
import authSaga from '../modules/auth/authSaga';
import appointmentSaga from '../modules/appointments/appointmentSaga';
import calendarSaga from '../modules/calendar/calendarSaga';
export default function* rootSaga() {
  yield all([
    authSaga(),
     appointmentSaga(),
     calendarSaga(),
    // Future sagas plug in here:
    // tenantSaga(),
    // patientSaga(),
    // billingSaga(),
    // notificationSaga(),
  ]);
} 