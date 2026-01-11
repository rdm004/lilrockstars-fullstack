// frontend/src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
    return (
        <nav className="navbar">
            {/* LEFT: Facebook */}
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

            {/* CENTER: Main Nav Links */}
            <div className="navbar-center">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/about" className="nav-link">About</Link>
                <Link to="/races" className="nav-link">Races</Link>
                <Link to="/results" className="nav-link">Results</Link>
                <Link to="/gallery" className="nav-link">Gallery</Link>
                <Link to="/sponsors" className="nav-link">Sponsors</Link>
                <Link to="/contact" className="nav-link">Contact</Link>
            </div>

            {/* RIGHT: Auth Buttons */}
            <div className="navbar-right">
                <Link to="/login" className="nav-button">Login</Link>
                <Link to="/admin" className="nav-button">Admin</Link>
            </div>
        </nav>
    );
}