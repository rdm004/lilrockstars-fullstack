import axios from "axios";

// 🧭 Base URL setup
const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL ||
    (process.env.NODE_ENV === "production"
        ? "" // ✅ leave blank so rewrite handles `/api/*`
        : "http://localhost:8080/api"); // local backend for dev

// 🧠 Axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔐 Attach JWT if available
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;