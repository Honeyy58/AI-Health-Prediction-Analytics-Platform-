import axios from 'axios';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In browser, using /api lets Vite dev server proxy requests directly to port 8000
  // eliminating any CORS or Private Network Access restrictions
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Response interceptor to extract clean error messages
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'An unexpected error occurred while communicating with the health API.';
    if (error.response) {
      if (error.response.data) {
        if (error.response.data.message) {
          message = error.response.data.message;
        } else if (error.response.data.details && Array.isArray(error.response.data.details) && error.response.data.details.length > 0) {
          message = error.response.data.details.join('; ');
        } else if (error.response.data.detail) {
          message = typeof error.response.data.detail === 'string'
            ? error.response.data.detail
            : JSON.stringify(error.response.data.detail);
        }
      }
      if (error.response.status === 503) {
        message = 'Database or ML service is currently initializing or unreachable. Please verify MySQL service.';
      }
    } else if (error.request) {
      message = 'Unable to connect to the backend server at ' + API_BASE_URL + '. Is FastAPI running on port 8000?';
    }
    return Promise.reject(new Error(message));
  }
);

export const healthApi = {
  // Check backend and ML status
  checkStatus: () => apiClient.get('/'),
  checkHealth: () => apiClient.get('/health'),

  // Prediction endpoint
  predict: (patientData) => apiClient.post('/predict', patientData),

  // History endpoints
  getHistory: (params = {}) => apiClient.get('/predictions', { params }),
  getPredictionById: (id) => apiClient.get(`/predictions/${id}`),
  deletePrediction: (id) => apiClient.delete(`/predictions/${id}`),

  // Analytics endpoint
  getAnalytics: () => apiClient.get('/analytics'),
};

export default healthApi;
