// frontend/src/components/Footer.js
import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer
            role="contentinfo"
            style={{
                background: "#333",
                color: "white",
                padding: "1rem",
                textAlign: "center",
            }}
        >
            <p style={{ margin: 0 }}>
                © {year} Lil Rockstars Racing. Building Champions One Lap at a Time.
            </p>

            {/* Recommended footer links for accessibility + trust */}
            <nav
                aria-label="Footer"
                style={{
                    marginTop: "0.6rem",
                    display: "flex",
                    gap: "14px",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    fontSize: "0.95rem",
                }}
            >
                {/* If you don't have these pages yet, you can keep placeholders or remove until ready */}
                <Link to="/contact" style={{ color: "white", textDecoration: "underline" }}>
                    Contact
                </Link>

                {/* Strongly recommended to add an accessibility statement page later */}
                <a
                    href="/accessibility"
                    style={{ color: "white", textDecoration: "underline" }}
                >
                    Accessibility
                </a>

                {/* Optional, but common for public sites */}
                <a href="/privacy" style={{ color: "white", textDecoration: "underline" }}>
                    Privacy
                </a>
                <a href="/terms" style={{ color: "white", textDecoration: "underline" }}>
                    Terms
                </a>
            </nav>
        </footer>
    );
}