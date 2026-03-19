import axios from 'axios';

const currentHostname = window.location.hostname;
const dynamicBaseUrl = `http://${currentHostname}/team-backend/api`;

const axiosClient = axios.create({
  baseURL: dynamicBaseUrl,
});

// ==========================================
// 1. REQUEST INTERCEPTOR
// ==========================================
axiosClient.interceptors.request.use((config) => {
  const publicRoutes = ['/login', '/resolve'];
  const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));

  if (isPublicRoute) {
    const hostname = window.location.hostname;
    const slug = hostname.split('.')[0];
    
    if (slug && slug !== 'localhost') {
      config.headers['X-TENANT-SLUG'] = slug;
    }

    delete config.headers['Authorization'];
    delete config.headers['X-CSRF-Token'];
  } else {
    const accessToken = localStorage.getItem('access_token'); 
    const csrfToken = sessionStorage.getItem('csrf_token'); 

    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    console.log("csrf token attached ", config.headers['X-CSRF-Token']);
    
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// ==========================================
// 2. RESPONSE INTERCEPTOR & QUEUE LOGIC
// ==========================================

// These variables act as the "traffic light" for multiple requests
let isRefreshing = false;
let failedQueue = [];

// Helper function to process the waiting line of requests
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;
    
    // If it's a 401 and we haven't already retried this exact request
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      
      // If a refresh is ALREADY happening, just join the queue and wait
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axiosClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      // If we are the FIRST request to fail, lock the traffic light
      originalRequest._retry = true;
      isRefreshing = true;

try {
        const refreshUrl = `http://${currentHostname}/team-backend/api/refresh`;
        
        // 1. Grab the current Tenant Slug and CSRF Token manually
        const slug = currentHostname.split('.')[0];
        const currentCsrf = sessionStorage.getItem('csrf_token');

        // 2. Attach them to the raw axios call so PHP accepts it
        const refreshResponse = await axios.post(
          refreshUrl, 
          { refresh: true }, 
          { 
            withCredentials: true,
            headers: { 
              'Content-Type': 'application/json',
              'X-TENANT-SLUG': slug !== 'localhost' ? slug : '', // Add the slug!
              'X-CSRF-Token': currentCsrf // Add the current CSRF token!
            }
          } 
        );

        // Extract the new tokens
        const newAccessToken = refreshResponse.data.data.access_token;
        const newCsrfToken = refreshResponse.data.data.csrf_token;

        // Save tokens immediately
        localStorage.setItem('access_token', newAccessToken);
        sessionStorage.setItem('csrf_token', newCsrfToken); 

        // 3. Update the failing request's headers with BOTH new tokens
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['X-CSRF-Token'] = newCsrfToken;

        // Unlock the traffic light and release the queued requests
        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Finally, retry the original request
        return axiosClient(originalRequest);
        
      } catch (refreshError) {
        // If the refresh ACTUALLY fails, kill the queue and log out
        processQueue(refreshError, null);
        isRefreshing = false;
        
        localStorage.removeItem('access_token'); 
        sessionStorage.removeItem('csrf_token'); 
        
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;