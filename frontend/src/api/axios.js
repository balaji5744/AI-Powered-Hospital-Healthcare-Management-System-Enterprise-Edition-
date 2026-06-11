import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // Ensure your backend is running here
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Attach token ONLY if we have one AND it's not a login request
    if (token && !config.url.includes("/auth/login")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
