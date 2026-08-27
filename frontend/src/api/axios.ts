import axios from 'axios';

// Global state for tokens 
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

// User info from payload

export const getUserId = (): number | null => {
  const token = getAccessToken();
  if (!token) return null;

  try {
    // Decode the base64 payload part of the JWT
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));

    return payload.id ? Number(payload.id) : null; 
  } catch (error) {
    console.error("We couldn't get the user ID from token:", error);
    return null;
  }
};

export const getUserRole = (): string | null => {
  const token = getAccessToken();
  if (!token) return null;

  try {
    // Decode JWT
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    return payload.role || null;
  } catch (error) {
    console.error("We couldn't get the user role from token:", error);
    return null;
  }
};

// Axios instance setup

const api = axios.create({
    baseURL: 'http://localhost:80/api',
    withCredentials: true // Required to send cookies
});

// Automatically adding the access token to every request header
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Handle token expirations
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const prevRequest = error?.config;
    
    // Forbidden or expired and didn't tried refreshing yet
    if (error?.response?.status === 403 && !prevRequest?.sent) {
      prevRequest.sent = true;
      
      try {
        // Try to get a new access token using the refresh cookie
        const response = await axios.post('http://localhost:80/api/auth/refresh', {}, { withCredentials: true });
        const newAccessToken = response.data.accessToken;
        
        // Update local state and retry the failed request
        setAccessToken(newAccessToken);
        prevRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(prevRequest);
      } catch (refreshError) {
        // If refresh fails, user session is invalid
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;