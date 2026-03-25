import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './rootReducer'; 
import rootSaga from './rootSaga';
import calendarReducer from '../modules/calendar/calendarSlice';
import chatReducer from '../modules/chat/chatSlice';
import notificationReducer from '../modules/notifications/notificationSlice';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export default store;
