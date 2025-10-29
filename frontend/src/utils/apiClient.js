import axios from "axios";

// ✅ Create a pre-configured Axios instance
const apiClient = axios.create({
    baseURL: "http://localhost:8080", // adjust for prod later
    headers: {
        "Content-Type": "application/json",
    },
});

// ✅ Automatically attach JWT token if it exists
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;