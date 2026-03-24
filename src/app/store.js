import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import appointmentReducer from '../modules/appointments/appointmentSlice';
import authReducer from '../modules/auth/authSlice';
import rootSaga from './rootSaga';
import calendarReducer from '../modules/calendar/calendarSlice';
import chatReducer from '../modules/chat/chatSlice';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentReducer,
    calendar: calendarReducer,
    chat: chatReducer,
    // Future modules plug in here:
    // tenant:       tenantReducer,
    // patients:     patientReducer,
    // billing:      billingReducer,
    // notifications:notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export default store;
