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


// ==========================================
// NEW: PATIENT SIGNUP MUTATION
// ==========================================
export const useSignupPatient = () => {
  return useMutation({
    mutationFn: async (patientData) => {
      // Sends registration data to your FastAPI backend
      const { data } = await api.post("/auth/signup", {
        email: patientData.email,
        password: patientData.password,
        name: patientData.name,
        role: "patient" // Forces the role to be patient
      });
      return data;
    },
  });
};



export default api;