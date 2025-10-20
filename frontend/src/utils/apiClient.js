// frontend/src/utils/apiClient.js
import axios from "axios";
import API_BASE_URL from "../config/api";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export default apiClient;