// frontend/src/components/Sidebar.js
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    FaTachometerAlt,
    FaUserFriends,
    FaClipboardList,
    FaChartBar,
    FaCalendarAlt,
} from "react-icons/fa";
import "../styles/Sidebar.css";

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { path: "/admin", label: "Dashboard", icon: <FaTachometerAlt /> },
        { path: "/admin/racers/manage", label: "Racers", icon: <FaUserFriends /> },
        { path: "/admin/results/manage", label: "Results", icon: <FaChartBar /> },
        { path: "/admin/races/manage", label: "Events", icon: <FaCalendarAlt /> },
        { path: "/admin/registrations/manage", label: "Registrations", icon: <FaClipboardList /> },
    ];

    return (
        <aside className="sidebar" aria-label="Admin Navigation">
            <div className="sidebar-header">
                <div className="sidebar-logo">🏁 Lil Rockstars</div>
            </div>

            <ul className="sidebar-menu">
                {menuItems.map((item) => {
                    const isActive =
                        location.pathname === item.path ||
                        (item.path !== "/admin" && location.pathname.startsWith(item.path));

                    return (
                        <li key={item.path} className={`sidebar-item ${isActive ? "active" : ""}`}>
                            <Link to={item.path} className="sidebar-link">
                <span className="icon" aria-hidden="true">
                  {item.icon}
                </span>

                                {/* ✅ Always show label */}
                                <span className="label">{item.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
};

export default Sidebar;