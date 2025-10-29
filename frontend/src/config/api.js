// frontend/src/config/api.js
const API_BASE_URL =
    process.env.NODE_ENV === "production"
        ? "https://lilrockstars-fullstack-1.onrender.com"
        : "http://localhost:8080";

export default API_BASE_URL;