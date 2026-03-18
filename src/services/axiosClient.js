import axios from 'axios';

// ==========================================
// DYNAMIC BASE URL SETUP
// ==========================================
// 1. Grab the current hostname (e.g., 'demo-hospital.localhost')
const currentHostname = window.location.hostname;

// 2. Construct the dynamic backend URL to match the frontend's origin exactly.
// This guarantees that the browser will send the SameSite=Strict cookie.
const dynamicBaseUrl = `http://${currentHostname}/team-backend/api`;

const axiosClient = axios.create({
  baseURL: dynamicBaseUrl,
});

// ==========================================
// 1. REQUEST INTERCEPTOR 
// ==========================================
axiosClient.interceptors.request.use((config) => {
  // Define routes that do NOT need tokens (Public Routes)
  const publicRoutes = ['/login', '/resolve'];
  
  // Check if the outgoing request URL contains any of the public routes
  const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));

  if (isPublicRoute) {
    // ==========================================
    // PUBLIC ROUTES: Attach Slug ONLY
    // ==========================================
    const hostname = window.location.hostname;
    const slug = hostname.split('.')[0];
    
    if (slug && slug !== 'localhost') {
      config.headers['X-TENANT-SLUG'] = slug;
    }

    // Safety measure: Ensure no lingering tokens are attached
    delete config.headers['Authorization'];
    delete config.headers['X-CSRF-Token'];

  } else {
    // ==========================================
    // PROTECTED ROUTES: Attach Tokens ONLY
    // ==========================================
    const accessToken = localStorage.getItem('access_token'); 
    const csrfToken = sessionStorage.getItem('csrf_token'); 

    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// ==========================================
// 2. RESPONSE INTERCEPTOR (Handling 401s)
// ==========================================
axiosClient.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;
    console.log("Response interceptor is invoked for a 401");

    // Trigger refresh logic on 401 Unauthorized, but only once per request
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 

      try {
        // 1. Build the dynamic refresh URL
        const refreshUrl = `http://${currentHostname}/team-backend/api/refresh`;

        // 2. Call the backend using base axios to avoid an interceptor infinite loop
        const refreshResponse = await axios.post(
          refreshUrl, 
          { refresh: true }, // Dummy payload prevents Axios from dropping Content-Type header!
          { 
            withCredentials: true, // Required to send the HTTP-only cookie
            headers: {
              'Content-Type': 'application/json' 
            }
          } 
        );

        // Make sure this matches the exact JSON key your PHP backend returns 
        // (e.g., .access_token vs .accessToken)
        const newAccessToken = refreshResponse.data.access_token || refreshResponse.data.accessToken;

        // 3. Save the new token back to localStorage (Fixed key to match request interceptor)
        localStorage.setItem('access_token', newAccessToken);

        // 4. Update the failed request's header with the new token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // 5. Retry the original request seamlessly
        return axiosClient(originalRequest);
        
      } catch (refreshError) {
        // If the refresh token fails (expired/invalid/missing cookie), clear everything out
        localStorage.removeItem('access_token'); // Fixed key
        localStorage.removeItem('csrf_token');   // Fixed key
        
        // Force redirect to login page
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;