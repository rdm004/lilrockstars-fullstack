// frontend/src/components/Layout.js
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../styles/Layout.css";

const Layout = ({ children, title }) => {
    // This is mainly for mobile overlay; desktop is always "expanded"
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    return (
        <div className="layout-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="main-content">
                <Header title={title} />
                <div className="page-content">{children}</div>
            </div>
        </div>
    );
};

export default Layout;