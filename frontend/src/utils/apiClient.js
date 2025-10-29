// frontend/src/utils/apiClient.js
import axios from "axios";
import API_BASE_URL from "../config/api";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

<<<<<<< HEAD
export default apiClient; // ✅ must use default export
=======
export default apiClient;
>>>>>>> 917952875e7a7d0b1831f67d8ef8afb31e438123
