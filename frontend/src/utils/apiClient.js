import axios from "axios";

// 🌎 Auto-detect or use .env override
const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL ||
    (process.env.NODE_ENV === "production"
        ? "https://lilrockstars-backend.onrender.com" // ✅ Replace with your Render backend
        : "http://localhost:8080"); // local backend for dev

// 🧠 Create Axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔐 Automatically attach token if it exists
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;