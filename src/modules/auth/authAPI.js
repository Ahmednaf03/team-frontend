import axiosClient from '../../services/axiosClient';
import axios from 'axios';
/**
 * authAPI
 *
 * Thin layer that maps backend auth endpoints to promise-returning functions.
 * Saga / hook layer calls these — never calls axios directly.
 *
 * Backend routes (all under ResolveTenant middleware):
 *   POST /api/auth/login
 *   POST /api/auth/refresh
 *   POST /api/auth/logout
 *   GET  /api/auth/csrf-token
 *   GET  /api/auth/me
 */

export const loginAPI = async ({ username, password }) => {
  const response = await axiosClient.post('/login', {
    email: username, // <-- CRITICAL: Map frontend 'username' to backend 'email'
    password: password,
  },{withCredentials: true}

);
  return response.data; 
};

export const PatientloginAPI = async ({ username, password }) => {
  const response = await axiosClient.post('/patient-login', {
    email: username, // <-- CRITICAL: Map frontend 'username' to backend 'email'
    password: password,
  },{withCredentials: true}

);
  return response.data; 
};

export const refreshTokenAPI = async () => {
  // 1. Grab the current hostname and extract the tenant slug
  const currentHostname = window.location.hostname;
  const slug = currentHostname.split('.')[0]; // e.g., 'demo-hospital'
  
  const refreshUrl = `http://${currentHostname}/team-backend/api/refresh`;

  const response = await axios.post(
    refreshUrl, 
    { refresh: true }, 
    { 
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'X-TENANT-SLUG': slug //  THE MISSING PIECE! Tell PHP which database to use.
      }
    }
  );
  
  return response.data;
};

export const logoutAPI = async () => {
  const response = await axiosClient.post('/logout',
    { action: 'logout' }, 
    {
      withCredentials: true, // 👈 ADD THIS BACK IN!
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

export const fetchCsrfTokenAPI = async () => {
  const response = await axiosClient.get('/api/auth/csrf-token', 
    
  );
  return response.data; // { data: { csrf_token, expires_in } }
};

export const fetchMeAPI = async () => {
  const response = await axiosClient.get('/api/auth/me');
  return response.data;
};

export const changePasswordAPI = async ({ old_password, new_password }) => {
  const response = await axiosClient.post(
    '/change-password',
    { old_password, new_password },
    {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return response.data;
};