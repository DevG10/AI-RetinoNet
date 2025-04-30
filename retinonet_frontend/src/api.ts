import axios from "axios";

const API_BASE_URL = "https://58-52-210-233-217.ngrok-free.app"; // Change if backend is hosted

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post(`${API_BASE_URL}/predict`, formData);
};

export const getReport = async () => {
  return axios.get(`${API_BASE_URL}/generate_report`);
};

export const sendReportEmail = async (email: string, imageId: string) => {
  return axios.post(`${API_BASE_URL}/send_report`, { email, imageId });
};
