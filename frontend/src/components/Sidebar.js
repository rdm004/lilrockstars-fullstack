import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    FaTachometerAlt,
    FaUserFriends,
    FaClipboardList,
    FaChartBar,
    FaCalendarAlt,
    FaShieldAlt,
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
        // { path: "/admin/audit", label: "Audit", icon: <FaShieldAlt /> },
    ];

    return (
        <nav className="sidebar" aria-label="Admin navigation">
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
                            <Link
                                to={item.path}
                                className="sidebar-link"
                                aria-current={isActive ? "page" : undefined}
                            >
                <span className="icon" aria-hidden="true">
                  {item.icon}
                </span>
                                <span className="label">{item.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default Sidebar;