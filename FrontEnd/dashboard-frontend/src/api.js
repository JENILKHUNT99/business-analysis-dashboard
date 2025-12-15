import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

const api = axios.create({ baseURL });

// attach token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token"); // <-- must be this key
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
