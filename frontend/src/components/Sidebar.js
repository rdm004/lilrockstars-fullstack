import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    FaTachometerAlt,
    FaUserFriends,
    FaHandshake,
    FaClipboardList,
    FaCogs,
    FaImages,
    FaChartBar,      // 👈 NEW icon for Results
} from "react-icons/fa";
import "../styles/Sidebar.css";

const Sidebar = ({ isOpen = true }) => {
    const location = useLocation();

    const menuItems = [
        { path: "/admin", label: "Dashboard", icon: <FaTachometerAlt /> },
        { path: "/admin/racers/manage", label: "Racers", icon: <FaUserFriends /> },
        { path: "/admin/results/manage", label: "Results", icon: <FaChartBar /> },      // 👈 NEW
        { path: "/admin/sponsors/manage", label: "Sponsors", icon: <FaHandshake /> },
        { path: "/admin/photos/manage", label: "Photos", icon: <FaImages /> },
        { path: "/admin/registrations/manage", label: "Registrations", icon: <FaClipboardList /> },
        { path: "/admin/settings", label: "Settings", icon: <FaCogs /> },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">🏁 Lil Rockstars</div>
            </div>

            <ul className="sidebar-menu">
                {menuItems.map((item) => (
                    <li
                        key={item.path}
                        className={`sidebar-item ${
                            location.pathname === item.path ? "active" : ""
                        }`}
                    >
                        <Link to={item.path} className="sidebar-link">
                            <span className="icon">{item.icon}</span>
                            {isOpen && <span className="label">{item.label}</span>}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;