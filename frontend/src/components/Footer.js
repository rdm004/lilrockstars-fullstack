// frontend/src/components/Footer.js
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="site-footer" role="contentinfo">
            <div className="footer-inner">
                <p className="footer-copy">
                    © {year} Lil Rockstars Racing. Building Champions One Lap at a Time.
                </p>

                <nav className="footer-nav" aria-label="Footer">
                    <Link className="footer-link" to="/accessibility">
                        Accessibility
                    </Link>

                    <span className="footer-sep" aria-hidden="true">
                        |
                    </span>

                    <Link className="footer-link" to="/privacy">
                        Privacy
                    </Link>

                    <span className="footer-sep" aria-hidden="true">
                        |
                    </span>

                    <Link className="footer-link" to="/terms">
                        Terms
                    </Link>

                    {/*
                    <span className="footer-sep" aria-hidden="true">|</span>
                    <Link className="footer-link" to="/contact">Contact</Link>
                    */}
                </nav>
            </div>
        </footer>
    );
}