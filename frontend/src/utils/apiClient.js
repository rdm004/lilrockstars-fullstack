import axios from "axios";

// 🧭 Base URL setup
// - In production (Render), the frontend rewrite rule `/api/* → backend` handles routing.
//   So we can safely use a relative path "" for production.
// - In development (local), we point directly to the backend on localhost:8080.
const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL ||
    (process.env.NODE_ENV === "production"
        ? "" // ✅ relative path (Render rewrites /api/* to backend)
        : "http://localhost:8080"); // ✅ local Spring Boot backend for dev

// 🧠 Create Axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔐 Automatically attach JWT token if present
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;