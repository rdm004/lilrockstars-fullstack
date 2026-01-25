import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    FaTachometerAlt,
    FaUserFriends,
    FaClipboardList,
    FaCogs,
    FaChartBar,
    FaCalendarAlt,
} from "react-icons/fa";
import "../styles/Sidebar.css";

const Sidebar = ({ isOpen = false, onClose }) => {
    const location = useLocation();

    const menuItems = [
        { path: "/admin", label: "Dashboard", icon: <FaTachometerAlt /> },
        { path: "/admin/racers/manage", label: "Racers", icon: <FaUserFriends /> },
        { path: "/admin/results/manage", label: "Results", icon: <FaChartBar /> },
        { path: "/admin/races/manage", label: "Events", icon: <FaCalendarAlt /> },
        { path: "/admin/registrations/manage", label: "Registrations", icon: <FaClipboardList /> },
        { path: "/admin/settings", label: "Settings", icon: <FaCogs /> },
    ];

    return (
        <aside
            id="admin-sidebar"
            className={`sidebar ${isOpen ? "open" : ""}`}
            aria-label="Admin navigation"
        >
            <div className="sidebar-header">
                <div className="sidebar-logo">🏁 Lil Rockstars</div>

                {/* Mobile close button */}
                <button
                    type="button"
                    className="sidebar-close"
                    aria-label="Close menu"
                    onClick={onClose}
                >
                    ✖
                </button>
            </div>

            <ul className="sidebar-menu">
                {menuItems.map((item) => (
                    <li
                        key={item.path}
                        className={`sidebar-item ${location.pathname === item.path ? "active" : ""}`}
                    >
                        <Link to={item.path} className="sidebar-link" onClick={onClose}>
                            <span className="icon" aria-hidden="true">{item.icon}</span>
                            <span className="label">{item.label}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default Sidebar;