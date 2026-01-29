import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function AdminRoute({ children }) {
    const token = localStorage.getItem("token");
    const role = (localStorage.getItem("role") || "").toUpperCase();
    const location = useLocation();

    // Not logged in
    if (!token) {
        sessionStorage.setItem("authMessage", "Please log in to continue.");
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Logged in but not admin
    if (role !== "ADMIN") {
        sessionStorage.setItem("authMessage", "Admin access required.");
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}