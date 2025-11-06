import axios from "axios";

// 🧭 Base URL setup
// const API_BASE_URL =
//     process.env.REACT_APP_API_BASE_URL ||
//     (process.env.NODE_ENV === "production"
//         ? "" // ✅ leave blank for Render (proxy handles `/api/*`)
//         : "http://localhost:8080/api"); // local backend for dev


const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL ||
    (process.env.NODE_ENV === "production"
        ? "https://lilrockstars-fullstack-backend.onrender.com/api"
        : "http://localhost:8080/api");


// 🧠 Create Axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔐 Attach JWT token to all requests (if exists)
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ⚡ Optional: Handle expired or unauthorized tokens globally
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("firstName");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

export default apiClient;