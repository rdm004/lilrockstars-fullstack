import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requireRole }) {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Optional: check roles embedded in your JWT if you add them
    if (requireRole) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const roles = payload?.roles || payload?.authorities || [];
            if (!roles.includes(requireRole)) {
                return <Navigate to="/login" replace />;
            }
        } catch (_) {
            return <Navigate to="/login" replace />;
        }
    }

    return children;
}