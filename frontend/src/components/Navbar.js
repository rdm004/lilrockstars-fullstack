// frontend/src/components/Navbar.js
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
    // ✅ If token exists, user is logged in (parent)
    const isLoggedIn = useMemo(() => {
        const token = localStorage.getItem("token");
        return !!token;
    }, []);

    const parentButtonText = isLoggedIn ? "Parent Dashboard" : "Login";
    const parentButtonLink = isLoggedIn ? "/dashboard" : "/login";

    return (
        <nav className="navbar">
            {/* LEFT: Facebook */}
            <div className="navbar-left">
                <a
                    href="https://www.facebook.com/profile.php?id=100091910351052"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-button facebook-btn"
                    aria-label="Visit Lil Rockstars Racing on Facebook"
                >
          <span className="facebook-icon" aria-hidden="true">
            f
          </span>
                    Facebook
                </a>
            </div>

            {/* CENTER: Main Nav Links */}
            <div className="navbar-center">
                <Link to="/" className="nav-link">
                    Home
                </Link>
                <Link to="/about" className="nav-link">
                    About
                </Link>
                <Link to="/races" className="nav-link">
                    Races
                </Link>
                <Link to="/results" className="nav-link">
                    Results
                </Link>
                <Link to="/gallery" className="nav-link">
                    Gallery
                </Link>
                <Link to="/sponsors" className="nav-link">
                    Sponsors
                </Link>
                <Link to="/contact" className="nav-link">
                    Contact
                </Link>
            </div>

            {/* RIGHT: Auth Buttons */}
            <div className="navbar-right">
                {/* ✅ Login becomes Parent Dashboard when logged in */}
                <Link to={parentButtonLink} className="nav-button">
                    {parentButtonText}
                </Link>

                {/* Admin stays */}
                <Link to="/admin" className="nav-button">
                    Admin
                </Link>
            </div>
        </nav>
    );
}