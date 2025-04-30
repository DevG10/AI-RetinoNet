import axios from "axios";

// Create a configurable API base URL for different environments
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  "https://58e4-52-210-233-217.ngrok-free.app";

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// API functions using the instance
export const checkModelStatus = async () => {
  return apiClient.get('/status');
};

export const uploadImage = async (file: File, isLiveCapture = false) => {
  const formData = new FormData();
  formData.append("file", file);
  
  // For live capture, we need the response as a blob to display the processed image
  if (isLiveCapture || file.name === "live_captured_image.jpg") {
    return axios.post(`${API_BASE_URL}/predict/`, formData, {
      responseType: 'blob',
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  
  // For regular upload, we want the predictions as JSON
  return apiClient.post('/predict/', formData);
};

export const generateReport = async (file: File, predictions: Record<string, string>) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("predictions", JSON.stringify(predictions));
  
  return apiClient.post('/generate_report/', formData, {
    responseType: 'blob',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const sendReportEmail = async (email: string, file: File, predictions: Record<string, string>) => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("file", file);
  formData.append("predictions", JSON.stringify(predictions));
  
  return apiClient.post('/send_report/', formData);
};
