import axios from 'axios';

// Create an axios instance with the correct backend URL
const API = axios.create({
  baseURL: 'https://facilityprofilingupdated.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API error:', error);
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Inspection API calls
export const fetchInspections = () => API.get('/inspections/');
export const fetchInspection = (id) => API.get(`/inspections/${id}`);
export const createInspection = (inspectionData) => API.post('/inspections/', inspectionData);
export const updateInspection = (id, inspectionData) => API.put(`/inspections/${id}`, inspectionData);
export const deleteInspection = (id) => API.delete(`/inspections/${id}`);

export default API;