import axios from "axios";

const localBackend = import.meta.env.VITE_API_URL_LOCAL;
const remoteBackend = import.meta.env.VITE_API_URL_REMOTE;
const useLocal = import.meta.env.VITE_USE_LOCAL_BACKEND !== "false";
const baseURL =
  (useLocal && localBackend) ||
  remoteBackend ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const api = axios.create({
  baseURL,
});

if (import.meta.env.DEV) {
  console.log("[api] baseURL", baseURL);
}

// attach token automatically
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
