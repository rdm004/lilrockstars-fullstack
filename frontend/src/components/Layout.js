import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../styles/Layout.css";

const Layout = ({ children, title }) => {
    return (
        <div className="layout-container">
            {/* ✅ Admin-layout skip link (different target from App.js) */}
            <a href="#admin-main-content" className="skip-link">
                Skip to main content
            </a>

            <Sidebar />

            <main
                id="admin-main-content"
                className="main-content"
                tabIndex={-1}
                aria-label={title ? `${title} - Main Content` : "Main Content"}
            >
                <Header title={title} />
                <div className="page-content">{children}</div>
            </main>
        </div>
    );
};

export default Layout;