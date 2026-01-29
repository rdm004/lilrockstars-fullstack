import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, requireRole }) {
    const token = localStorage.getItem("token");
    const location = useLocation();

    // Not logged in
    if (!token) {
        sessionStorage.setItem("authMessage", "Please log in to continue.");
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Optional role check (only useful if your JWT actually contains roles)
    if (requireRole) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const roles = payload?.roles || payload?.authorities || [];

            if (!Array.isArray(roles) || !roles.includes(requireRole)) {
                sessionStorage.setItem("authMessage", "You do not have access to that page.");
                return <Navigate to="/login" replace state={{ from: location }} />;
            }
        } catch (_) {
            sessionStorage.setItem("authMessage", "Your session expired. Please log in again.");
            localStorage.removeItem("token");
            localStorage.removeItem("firstName");
            localStorage.removeItem("role");
            return <Navigate to="/login" replace state={{ from: location }} />;
        }
    }

    return children;
}