import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer'; 
import rootSaga from './rootSaga';
import sagaMiddleware from './sagaMiddleware';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export default store;
