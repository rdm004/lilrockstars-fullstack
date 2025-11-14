// frontend/src/pages/Sponsors.js
import React, { useEffect, useState } from "react";
import "../styles/Sponsors.css";
import apiClient from "../utils/apiClient";

const Sponsors = () => {
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        setError("");

        apiClient
            .get("/sponsors")
            .then((res) => {
                setSponsors(res.data || []);
            })
            .catch((err) => {
                console.error("Error loading sponsors:", err);
                setError("Could not load sponsors. Please try again later.");
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="sponsors-container">
            <h1>🤝 Our Sponsors 🤝</h1>
            <p className="sponsors-intro">
                Big thanks to our amazing partners who support youth racing excellence!
            </p>

            {loading && <p className="loading">Loading sponsors...</p>}
            {error && <p className="error-text">{error}</p>}

            {!loading && !error && sponsors.length === 0 && (
                <p>No sponsors have been added yet. Check back soon!</p>
            )}

            {!loading && !error && sponsors.length > 0 && (
                <div className="sponsors-grid">
                    {sponsors.map((sponsor) => (
                        <div key={sponsor.id} className="sponsor-card">
                            {sponsor.logoUrl && (
                                <img
                                    src={sponsor.logoUrl}
                                    alt={sponsor.name}
                                    className="sponsor-logo"
                                />
                            )}
                            <h3>{sponsor.name}</h3>
                            {sponsor.description && <p>{sponsor.description}</p>}
                            {sponsor.website && (
                                <a
                                    href={sponsor.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="sponsor-button"
                                >
                                    Visit Website
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Sponsors;