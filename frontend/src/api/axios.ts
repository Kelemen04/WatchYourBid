import axios from 'axios';

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const prevRequest = error?.config;
    
    if (error?.response?.status === 403 && !prevRequest?.sent) {
      prevRequest.sent = true;
      
      try {
        const response = await axios.post('http://localhost:8000/api/auth/refresh', {}, { withCredentials: true });
        const newAccessToken = response.data.accessToken;
        
        setAccessToken(newAccessToken);
        
        prevRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(prevRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;