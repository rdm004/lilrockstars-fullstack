import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// ✅ This wrapper protects all routes that require authentication
const PrivateRoute = () => {
    const token = localStorage.getItem("token");

    // if no token, redirect to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // otherwise, render the child route (Outlet = nested route content)
    return <Outlet />;
};

export default PrivateRoute;