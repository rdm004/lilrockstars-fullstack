// frontend/src/components/Layout.js
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../styles/Layout.css";

const Layout = ({ children, title }) => {
    const location = useLocation();

    // Optional: on route change, ensure focus is not trapped on the skip link
    useEffect(() => {
        // You can uncomment this if you want to auto-focus main on navigation:
        // const main = document.getElementById("main-content");
        // if (main) main.focus();
    }, [location.pathname]);

    return (
        <div className="layout-container">
            {/* Skip link for keyboard users */}
            <a href="#main-content" className="skip-link">
                Skip to main content
            </a>

            <Sidebar />

            {/* IMPORTANT: Use <main> for semantics + the id target for skip link */}
            <main
                id="main-content"
                className="main-content"
                role="main"
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