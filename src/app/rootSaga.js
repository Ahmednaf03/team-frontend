import { all } from 'redux-saga/effects';
import authSaga from '../modules/auth/authSaga';
import appointmentSaga from '../modules/appointments/appointmentSaga';
import calendarSaga from '../modules/calendar/calendarSaga';
import chatSaga from '../modules/chat/chatSaga';
export default function* rootSaga() {
  yield all([
    authSaga(),
     appointmentSaga(),
     calendarSaga(),
     chatSaga(),
    // Future sagas plug in here:
    // tenantSaga(),
    // patientSaga(),
    // billingSaga(),
    // notificationSaga(),
  ]);
} 
