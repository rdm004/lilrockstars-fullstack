import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav style={{ background: '#ff7f11', padding: '1rem', textAlign: 'center' }}>
            <Link to="/" style={{ margin: '0 1rem', color: 'white' }}>Home</Link>
            <Link to="/races" style={{ margin: '0 1rem', color: 'white' }}>Races</Link>
            <Link to="/results" style={{ margin: '0 1rem', color: 'white' }}>Results</Link>
            <Link to="/gallery" style={{ margin: '0 1rem', color: 'white' }}>Gallery</Link>
            <Link to="/sponsors" style={{ margin: '0 1rem', color: 'white' }}>Sponsors</Link>
            <Link to="/login" style={{ margin: '0 1rem', color: 'white' }}>Login</Link>
            <Link to="/admin" style={{ margin: '0 1rem', color: 'white' }}>Admin</Link>
        </nav>
    );
}