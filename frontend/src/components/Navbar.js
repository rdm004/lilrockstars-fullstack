import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
    const navStyle = {
        background: "#ff7f11",
        padding: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
    };

    const leftContainer = {
        flex: 1,
        display: "flex",
        alignItems: "center",
    };

    const centerLinksStyle = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "1.5rem",
        whiteSpace: "nowrap",
    };

    const rightLinksContainer = {
        flex: 1,
        display: "flex",
        justifyContent: "flex-end",
        gap: "0.6rem",
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
    };

    const hover = (e, val) => (e.currentTarget.style.backgroundColor = val);

    return (
        <nav style={navStyle}>
            {/* LEFT: Facebook */}
            <div style={leftContainer}>
                <a
                    href="https://www.facebook.com/profile.php?id=100091910351052"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={buttonStyle}
                    onMouseEnter={(e) => hover(e, "rgba(0,0,0,0.6)")}
                    onMouseLeave={(e) => hover(e, "rgba(0,0,0,0.4)")}
                >
          <span
              style={{
                  width: 26,
                  height: 26,
                  background: "#fff",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
              }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="#1877f2">
              <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.325v21.351C0 23.4.6 24 1.325 24H12.82V14.706h-3.17v-3.622h3.17V8.413c0-3.13 1.91-4.832 4.7-4.832 1.34 0 2.493.099 2.829.144v3.28l-1.942.001c-1.524 0-1.819.724-1.819 1.787v2.344h3.637l-.474 3.622h-3.163V24h6.203C23.4 24 24 23.4 24 22.675V1.325C24 .6 23.4 0 22.675 0z" />
            </svg>
          </span>
                    <span style={{ color: "#fff", fontWeight: 600 }}>Facebook</span>
                </a>
            </div>

            {/* CENTER: Nav links */}
            <div style={centerLinksStyle}>
                <Link to="/" style={linkStyle}>Home</Link>
                <Link to="/about" style={linkStyle}>About</Link>
                <Link to="/races" style={linkStyle}>Races</Link>
                <Link to="/results" style={linkStyle}>Results</Link>
                <Link to="/gallery" style={linkStyle}>Gallery</Link>
                <Link to="/sponsors" style={linkStyle}>Sponsors</Link>
                <Link to="/contact" style={linkStyle}>Contact</Link>
            </div>

            {/* RIGHT: Admin actions */}
            <div style={rightLinksContainer}>
                <div style={buttonStyle}>
                    <Link to="/login" style={linkStyle}>Login</Link>
                </div>
                <div style={buttonStyle}>
                    <Link to="/admin" style={linkStyle}>Admin</Link>
                </div>
            </div>
        </nav>
    );
}