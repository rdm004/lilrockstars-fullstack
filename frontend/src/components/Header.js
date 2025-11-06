import React from "react";
import "../styles/Header.css";

const Header = ({ title = "Admin Panel" }) => {
    const firstName = localStorage.getItem("firstName");

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    return (
        <header className="admin-header">
            <h2>{title}</h2>
            <div className="header-right">
                <span>👋 Hi, {firstName || "Admin"}</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
        </header>
    );
};

export default Header;