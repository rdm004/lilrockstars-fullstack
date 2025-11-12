import axios from "axios";

// 🌐 Base URL: uses env var if provided, otherwise defaults by environment.
const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL ||
    (process.env.NODE_ENV === "production"
        ? "https://lilrockstars-fullstack-backend.onrender.com/api"
        : "http://localhost:8080/api");

// 🧠 Create Axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    // timeout: 15000, // (optional) add a timeout if you want
});

// 🔐 Attach JWT token to all requests (if exists)
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ⚠️ Optional global 401 handler
// apiClient.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("firstName");
//       window.location.href = "/login";
//     }
//     return Promise.reject(err);
//   }
// );

export default apiClient;