import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role"); // set on login

    if (!token) return <Navigate to="/login" replace />;
    if (role !== "ADMIN") return <Navigate to="/dashboard" replace />;

    return children;
}