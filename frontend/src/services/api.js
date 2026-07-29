import axios from "axios";

// When deployed to Cloud Run, VITE_API_BASE_URL will be injected
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

export default api;
