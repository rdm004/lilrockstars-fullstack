// frontend/src/components/Navbar.js
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
    const location = useLocation();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState("USER");

    // Re-evaluate auth state on navigation (login/logout)
    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedRole = (localStorage.getItem("role") || "USER").toUpperCase();

        setIsLoggedIn(!!token);
        setRole(storedRole);
    }, [location.pathname]);

    const isAdmin = isLoggedIn && role === "ADMIN";

    return (
        <nav className="navbar">
            {/* LEFT */}
            <div className="navbar-left">
                <a
                    href="https://www.facebook.com/profile.php?id=100091910351052"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-button facebook-btn"
                >
                    <span className="facebook-icon">f</span>
                    Facebook
                </a>
            </div>

            {/* CENTER */}
            <div className="navbar-center">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/about" className="nav-link">About</Link>
                <Link to="/races" className="nav-link">Races</Link>
                <Link to="/results" className="nav-link">Results</Link>
                <Link to="/gallery" className="nav-link">Gallery</Link>
                <Link to="/sponsors" className="nav-link">Sponsors</Link>
                <Link to="/contact" className="nav-link">Contact</Link>
            </div>

            {/* RIGHT */}
            <div className="navbar-right">
                {/* Not logged in → Login */}
                {!isLoggedIn && (
                    <Link to="/login" className="nav-button">
                        Login
                    </Link>
                )}

                {/* Logged in → Parent Dashboard */}
                {isLoggedIn && (
                    <Link to="/dashboard" className="nav-button">
                        Parent Dashboard
                    </Link>
                )}

                {/* Logged in ADMIN only → Admin Dashboard */}
                {isAdmin && (
                    <Link to="/admin" className="nav-button">
                        Admin Dashboard
                    </Link>
                )}
            </div>
        </nav>
    );
}