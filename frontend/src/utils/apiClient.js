import axios from "axios";

// 🌐 Base URL: env var first, then prod URL, then localhost
const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL ||
    (process.env.NODE_ENV === "production"
        ? "https://lilrockstars-fullstack-backend.onrender.com/api"
        : "http://localhost:8080/api");

// 🧠 One shared Axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    // timeout: 15000, // optional
});

// 🔐 Attach JWT to every request if present
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// 🌎 GLOBAL 401 handling: auto-logout + redirect to /login
apiClient.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err?.response?.status;
        if (status === 401) {
            // Optional: set a one-time message for the login page
            sessionStorage.setItem(
                "authMessage",
                "Your session expired. Please log in again."
            );
            localStorage.removeItem("token");
            localStorage.removeItem("firstName");
            window.location.href = "/login";
            return; // stop promise chain after redirect
        }
        return Promise.reject(err);
    }
);

export default apiClient;