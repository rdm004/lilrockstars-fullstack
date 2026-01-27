import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../styles/Layout.css";

const Layout = ({ children, title }) => {
    return (
        <div className="layout-container">
            {/* ✅ Skip link */}
            <a href="#admin-main-content" className="skip-link">
                Skip to main content
            </a>

            {/* Desktop sidebar / Mobile bottom nav (CSS handles behavior) */}
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