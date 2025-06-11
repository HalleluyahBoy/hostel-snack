import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8001/api/', // Ensure this matches your backend API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token to headers
apiClient.interceptors.request.use(
  (config) => {
    // Check if window is defined (i.e., code is running in the browser)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
