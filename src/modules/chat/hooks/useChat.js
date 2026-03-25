import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearChatMessages,
  clearChatState,
  fetchChatThreadRequest,
  sendChatMessageRequest,
} from '../chatSlice';

export default function useChat() {
  const dispatch = useDispatch();
  const chat = useSelector((state) => state.chat);

  const fetchThread = useCallback(
    (appointmentId) => {
      dispatch(fetchChatThreadRequest(appointmentId));
    },
    [dispatch]
  );

  const sendMessage = useCallback(
    (appointmentId, message) => {
      dispatch(sendChatMessageRequest({ appointmentId, message }));
    },
    [dispatch]
  );

  const clearThread = useCallback(() => {
    dispatch(clearChatState());
  }, [dispatch]);

  const dismissMessages = useCallback(() => {
    dispatch(clearChatMessages());
  }, [dispatch]);

  return {
    ...chat,
    fetchThread,
    sendMessage,
    clearThread,
    dismissMessages,
  };
}
