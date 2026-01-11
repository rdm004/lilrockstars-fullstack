import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
    const navStyle = {
        background: "#ff7f11",
        padding: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        flexWrap: "wrap",
    };

    // Left spacer balances the right buttons so center is truly centered
    const leftSpacer = {
        flex: 1,
        minWidth: 0,
    };

    // Center nav links
    const centerLinksStyle = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "1.5rem",
        flexWrap: "wrap",
    };

    // Right buttons (Facebook/Login/Admin)
    const rightLinksContainer = {
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "0.6rem",
        flex: 1,
        minWidth: 0,
    };

    const linkStyle = {
        color: "white",
        textDecoration: "none",
        fontWeight: 500,
    };

    const buttonStyle = {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        padding: "0.5rem 1rem",
        borderRadius: "8px",
        transition: "background-color 0.3s ease",
        whiteSpace: "nowrap",
    };

    const buttonHoverStyle = {
        backgroundColor: "rgba(0, 0, 0, 0.6)",
    };

    const fbIconBox = {
        width: 26,
        height: 26,
        borderRadius: 4,
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    const fbIcon = {
        width: 14,
        height: 14,
        fill: "#1877f2",
        display: "block",
    };

    return (
        <nav style={navStyle}>
            {/* ✅ Left spacer to keep center links truly centered */}
            <div style={leftSpacer} />

            {/* ✅ Center links */}
            <div style={centerLinksStyle}>
                <Link to="/" style={linkStyle}>Home</Link>
                <Link to="/about" style={linkStyle}>About</Link>
                <Link to="/races" style={linkStyle}>Races</Link>
                <Link to="/results" style={linkStyle}>Results</Link>
                <Link to="/gallery" style={linkStyle}>Gallery</Link>
                <Link to="/sponsors" style={linkStyle}>Sponsors</Link>
                <Link to="/contact" style={linkStyle}>Contact</Link>
            </div>

            {/* ✅ Right buttons */}
            <div style={rightLinksContainer}>
                {/* Facebook */}
                <a
                    href="https://www.facebook.com/profile.php?id=100091910351052"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={buttonStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor)}
                >
          <span style={fbIconBox}>
            <svg viewBox="0 0 24 24" style={fbIcon} aria-hidden="true">
              <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.325v21.351C0 23.4.6 24 1.325 24H12.82V14.706h-3.17v-3.622h3.17V8.413c0-3.13 1.91-4.832 4.7-4.832 1.34 0 2.493.099 2.829.144v3.28l-1.942.001c-1.524 0-1.819.724-1.819 1.787v2.344h3.637l-.474 3.622h-3.163V24h6.203C23.4 24 24 23.4 24 22.675V1.325C24 .6 23.4 0 22.675 0z" />
            </svg>
          </span>
                    <span style={{ color: "white", fontWeight: 600, textDecoration: "none" }}>Facebook</span>
                </a>

                {/* Login */}
                <div
                    style={buttonStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor)}
                >
                    <Link to="/login" style={linkStyle}>Login</Link>
                </div>

                {/* Admin */}
                <div
                    style={buttonStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor)}
                >
                    <Link to="/admin" style={linkStyle}>Admin</Link>
                </div>
            </div>
        </nav>
    );
}