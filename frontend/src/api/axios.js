import axios from "axios";

const api = axios.create({
  baseURL: "https://mern-chat-app-8oxm.onrender.com/",
});

// attach token automatically
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
