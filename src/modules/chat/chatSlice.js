import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeAppointmentId: null,
  messages: [],
  loading: false,
  sending: false,
  updating: false,
  error: null,
  success: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    fetchChatThreadRequest: (state, action) => {
      state.activeAppointmentId = action.payload;
      state.loading = true;
      state.error = null;
    },
    fetchChatThreadSuccess: (state, action) => {
      state.messages = action.payload.messages;
      state.loading = false;
    },
    fetchChatThreadFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    sendChatMessageRequest: (state) => {
      state.sending = true;
      state.error = null;
      state.success = null;
    },
    sendChatMessageSuccess: (state, action) => {
      state.sending = false;
      state.success = action.payload || 'Message sent successfully.';
    },
    sendChatMessageFailure: (state, action) => {
      state.sending = false;
      state.error = action.payload;
    },
    updateChatMessageRequest: (state) => {
      state.updating = true;
      state.error = null;
      state.success = null;
    },
    updateChatMessageSuccess: (state, action) => {
      state.updating = false;
      state.success = action.payload || 'Message updated successfully.';
    },
    updateChatMessageFailure: (state, action) => {
      state.updating = false;
      state.error = action.payload;
    },
    clearChatState: (state) => {
      state.activeAppointmentId = null;
      state.messages = [];
      state.loading = false;
      state.sending = false;
      state.updating = false;
      state.error = null;
      state.success = null;
    },
    clearChatMessages: (state) => {
      state.error = null;
      state.success = null;
    },
  },
});

export const {
  fetchChatThreadRequest,
  fetchChatThreadSuccess,
  fetchChatThreadFailure,
  sendChatMessageRequest,
  sendChatMessageSuccess,
  sendChatMessageFailure,
  updateChatMessageRequest,
  updateChatMessageSuccess,
  updateChatMessageFailure,
  clearChatState,
  clearChatMessages,
} = chatSlice.actions;

export default chatSlice.reducer;
