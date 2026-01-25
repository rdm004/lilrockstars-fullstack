import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../styles/Layout.css";

const Layout = ({ children, title }) => {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar on route change (mobile UX)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Close on ESC
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === "Escape") setSidebarOpen(false);
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, []);

    // Prevent background scrolling when the drawer is open
    useEffect(() => {
        document.body.style.overflow = sidebarOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [sidebarOpen]);

    return (
        <div className="layout-container">
            {/* ✅ Admin-layout skip link */}
            <a href="#admin-main-content" className="skip-link">
                Skip to main content
            </a>

            {/* Overlay (mobile only) */}
            {sidebarOpen && (
                <button
                    type="button"
                    className="sidebar-overlay"
                    aria-label="Close menu"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main
                id="admin-main-content"
                className="main-content"
                tabIndex={-1}
                aria-label={title ? `${title} - Main Content` : "Main Content"}
            >
                {/* Mobile top bar w/ menu button */}
                <div className="admin-topbar">
                    <button
                        type="button"
                        className="sidebar-toggle"
                        aria-label="Open menu"
                        aria-controls="admin-sidebar"
                        aria-expanded={sidebarOpen}
                        onClick={() => setSidebarOpen(true)}
                    >
                        ☰ Menu
                    </button>
                </div>

                <Header title={title} />
                <div className="page-content">{children}</div>
            </main>
        </div>
    );
};

export default Layout;