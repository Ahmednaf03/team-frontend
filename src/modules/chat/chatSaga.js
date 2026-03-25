import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchAppointmentMessagesAPI,
  sendAppointmentMessageAPI,
  updateAppointmentMessageAPI,
} from './chatAPI';
import {
  fetchChatThreadRequest,
  fetchChatThreadSuccess,
  fetchChatThreadFailure,
  sendChatMessageRequest,
  sendChatMessageSuccess,
  sendChatMessageFailure,
  updateChatMessageRequest,
  updateChatMessageSuccess,
  updateChatMessageFailure,
} from './chatSlice';
import {
  fetchAppointmentsRequest,
  updateAppointmentNotesPreview,
} from '../appointments/appointmentSlice';

const extractMessages = (response) => {
  const payload = response?.data ?? response;
  return Array.isArray(payload) ? payload : [];
};

function* handleFetchThread(action) {
  try {
    const appointmentId = action.payload;
    const response = yield call(fetchAppointmentMessagesAPI, appointmentId);
    const messages = extractMessages(response);
    const latestMessage = messages.length > 0 ? messages[messages.length - 1]?.message ?? '' : '';

    yield put(
      fetchChatThreadSuccess({
        appointmentId,
        messages,
      })
    );
    yield put(updateAppointmentNotesPreview({ appointmentId, notes: latestMessage }));
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Unable to load the chat thread.';
    yield put(fetchChatThreadFailure(message));
  }
}

function* handleSendMessage(action) {
  try {
    const { appointmentId, message } = action.payload;
    yield call(sendAppointmentMessageAPI, appointmentId, { message });
    yield put(sendChatMessageSuccess('Message sent successfully.'));
    yield put(fetchAppointmentsRequest());
    yield put(fetchChatThreadRequest(appointmentId));
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Unable to send the message.';
    yield put(sendChatMessageFailure(message));
  }
}

function* handleUpdateMessage(action) {
  try {
    const { appointmentId, messageId, message } = action.payload;
    yield call(updateAppointmentMessageAPI, messageId, { message });
    yield put(updateChatMessageSuccess('Message updated successfully.'));
    yield put(fetchChatThreadRequest(appointmentId));
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Unable to update the message.';
    yield put(updateChatMessageFailure(message));
  }
}

export default function* chatSaga() {
  yield takeLatest(fetchChatThreadRequest.type, handleFetchThread);
  yield takeLatest(sendChatMessageRequest.type, handleSendMessage);
  yield takeLatest(updateChatMessageRequest.type, handleUpdateMessage);
}
