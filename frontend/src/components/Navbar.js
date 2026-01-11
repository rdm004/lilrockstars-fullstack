import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const navStyle = {
        background: '#ff7f11',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
    };

    const linkStyle = {
        margin: '0 1rem',
        color: 'white',
        textDecoration: 'none',
        fontWeight: 500,
        whiteSpace: 'nowrap',
    };

    const leftLinksStyle = {
        display: 'flex',
        justifyContent: 'center',
        flex: 1,
        flexWrap: 'wrap',
    };

    const rightLinksContainer = {
        display: 'flex',
        justifyContent: 'flex-end',
        flex: 1,                 // 🔑 MATCH left side
        gap: '0.6rem',
    };

    const buttonStyle = {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        transition: 'background-color 0.3s ease',
        display: 'flex',
        alignItems: 'center',
    };

    const buttonHoverStyle = {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    };

    return (
        <nav style={navStyle}>
            {/* LEFT NAV LINKS */}
            <div style={leftLinksStyle}>
                <Link to="/" style={linkStyle}>Home</Link>
                <Link to="/about" style={linkStyle}>About</Link>
                <Link to="/races" style={linkStyle}>Races</Link>
                <Link to="/results" style={linkStyle}>Results</Link>
                <Link to="/gallery" style={linkStyle}>Gallery</Link>
                <Link to="/sponsors" style={linkStyle}>Sponsors</Link>
                <Link to="/contact" style={linkStyle}>Contact</Link>
            </div>

            {/* RIGHT ACTIONS */}
            <div style={rightLinksContainer}>

                {/* FACEBOOK BUTTON */}
                <a
                    href="https://www.facebook.com/profile.php?id=100091910351052"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={buttonStyle}
                    aria-label="Follow Lil Rockstars Racing on Facebook"
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="white"
                        style={{ marginRight: '6px' }}
                    >
                        <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.325v21.351C0 23.4.6 24
                        1.325 24H12.82V14.706h-3.17v-3.622h3.17V8.413c0-3.13 1.91-4.832
                        4.7-4.832 1.34 0 2.493.099 2.829.144v3.28l-1.942.001c-1.524
                        0-1.819.724-1.819 1.787v2.344h3.637l-.474 3.622h-3.163V24h6.203
                        C23.4 24 24 23.4 24 22.675V1.325C24 .6 23.4 0 22.675 0z" />
                    </svg>
                    Facebook
                </a>

                {/* LOGIN */}
                <div
                    style={buttonStyle}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor}
                >
                    <Link to="/login" style={linkStyle}>Login</Link>
                </div>

                {/* ADMIN */}
                <div
                    style={buttonStyle}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor}
                >
                    <Link to="/admin" style={linkStyle}>Admin</Link>
                </div>

            </div>
        </nav>
    );
}