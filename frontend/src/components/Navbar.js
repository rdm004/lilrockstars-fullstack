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
    };

    const leftLinksStyle = {
        display: 'flex',
        justifyContent: 'center',
        flex: 1,
    };

    const rightLinksContainer = {
        display: 'flex',
        justifyContent: 'flex-end',
        flexShrink: 0,
        gap: '0.5rem', // space between buttons
    };

    const buttonStyle = {
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // semi-transparent black
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        transition: 'background-color 0.3s ease',
    };

    const buttonHoverStyle = {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    };

    return (
        <nav style={navStyle}>
            <div style={leftLinksStyle}>
                <Link to="/" style={linkStyle}>Home</Link>
                <Link to="/about" style={linkStyle}>About</Link>
                <Link to="/races" style={linkStyle}>Races</Link>
                <Link to="/results" style={linkStyle}>Results</Link>
                <Link to="/gallery" style={linkStyle}>Gallery</Link>
                <Link to="/sponsors" style={linkStyle}>Sponsors</Link>
                <Link to="/contact" style={linkStyle}>Contact</Link>
            </div>

            <div style={rightLinksContainer}>
                <div
                    style={buttonStyle}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor}
                >
                    <Link to="/login" style={linkStyle}>Login</Link>
                </div>

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