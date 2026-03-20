import { all } from 'redux-saga/effects';
import authSaga from '../modules/auth/authSaga';
import patientSaga from '../modules/patients/patientSaga';
import prescriptionSaga from '../modules/prescriptions/prescriptionSaga';

export default function* rootSaga() {
  yield all([
    authSaga(),
    patientSaga(),
    prescriptionSaga(),
    // Future sagas plug in here:
    // tenantSaga(),
    // patientSaga(),
    // appointmentSaga(),
    // billingSaga(),
    // notificationSaga(),
  ]);
} 

