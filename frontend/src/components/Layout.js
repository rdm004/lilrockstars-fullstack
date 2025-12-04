// frontend/src/components/Layout.js
import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../styles/Layout.css";

const Layout = ({ children, title }) => {
    return (
        <div className="layout-container">
            <Sidebar />
            <div className="main-content">
                <Header title={title} />
                <div className="page-content">{children}</div>
            </div>
        </div>
    );
};

export default Layout;