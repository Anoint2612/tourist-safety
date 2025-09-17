import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const createEfir = async (efirData) => {
  try {
    const response = await api.post('/efir', {
      filedBy: efirData.filedBy,
      description: efirData.description,
      phone: efirData.phone,
      useRandomLocation: true // This will trigger coordinate generation
    });
    return response.data;
  } catch (error) {
    console.error('Error creating EFIR:', error);
    throw error;
  }
};
export const endpoints = {
  alerts: "/alerts",
  efirPending: "/efir/pending",
  efirVerify: (id) => `/efir/verify/${id}`,
  efirAssign: (id) => `/efir/assign/${id}`,
  efirSend: (id) => `/efir/send/${id}`,
  efirDelete: (id) => `/efir/${id}`,
  inspectors: "/inspectors",
};

export default api;


