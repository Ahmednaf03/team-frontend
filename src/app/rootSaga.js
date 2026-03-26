import { all } from 'redux-saga/effects';
import authSaga from '../modules/auth/authSaga';
import appointmentSaga from '../modules/appointments/appointmentSaga';
import calendarSaga from '../modules/calendar/calendarSaga';
import chatSaga from '../modules/chat/chatSaga';
import patientSaga from '../modules/patients/patientSaga';
import prescriptionSaga from '../modules/prescriptions/prescriptionSaga';
import billingSaga from '../modules/billing/billingSaga';
import staffSaga from '../modules/staff/staffSaga'; 
import notificationSaga from '../modules/notifications/notificationSaga';
export default function* rootSaga() {
  yield all([
     
    authSaga(),
     appointmentSaga(),
     calendarSaga(),
     chatSaga(),
    patientSaga(),
    prescriptionSaga(),
    billingSaga(),
    staffSaga(), 
    notificationSaga(),
  ]);
} 
