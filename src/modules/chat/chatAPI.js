import axiosClient from '../../services/axiosClient';

const requestConfig = {
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
};

export const fetchAppointmentMessagesAPI = async (appointmentId) => {
  const response = await axiosClient.get(`/messages/appointment/${appointmentId}`, requestConfig);
  return response.data;
};

export const sendAppointmentMessageAPI = async (appointmentId, payload) => {
  const response = await axiosClient.post(`/messages/${appointmentId}`, payload, requestConfig);
  return response.data;
};

export const updateAppointmentMessageAPI = async (messageId, payload) => {
  const response = await axiosClient.put(`/messages/${messageId}`, payload, requestConfig);
  return response.data;
};
