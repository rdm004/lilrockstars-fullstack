import axios from "axios";

// 🧭 Base URL setup
// - In production (Render), we rely on the frontend rewrite rule (`/api/* → backend`)
// - In development, we point to your local Spring Boot server
const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL ||
    (process.env.NODE_ENV === "production"
        ? "/api" // ✅ use relative path — Render will proxy this
        : "http://localhost:8080/api"); // ✅ direct local backend for dev

// 🧠 Axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔐 Automatically attach JWT token (if exists)
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;