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

        // ✅ If the failing call is the login endpoint, DO NOT treat it as "session expired"
        // Let LoginPage show "Invalid email or password"
        const url = err?.config?.url || "";
        const isLoginCall = url.includes("/auth/login");

        if (isLoginCall && (status === 401 || status === 400)) {
            return Promise.reject(err);
        }

        // ✅ For all other 401s: treat as expired/invalid token
        if (status === 401) {
            sessionStorage.setItem(
                "authMessage",
                "Your session expired. Please log in again."
            );

            localStorage.removeItem("token");
            localStorage.removeItem("firstName");
            localStorage.removeItem("role");

            // Avoid looping if already on /login
            if (!window.location.pathname.startsWith("/login")) {
                window.location.href = "/login";
            }

            return Promise.reject(err);
        }

        return Promise.reject(err);
    }
);

export default apiClient;