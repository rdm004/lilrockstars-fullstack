// frontend/src/pages/Sponsors.js
import React from "react";
import "../styles/Sponsors.css";
import SponsorsData from "../data/SponsorsData";

const Sponsors = () => {
    const sponsors = SponsorsData;

    return (
        <div className="sponsors-container">
            <h1>🤝 Our Sponsors 🤝</h1>
            <p className="sponsors-intro">
                Big thanks to our amazing partners who support youth racing excellence!
            </p>

            {sponsors.length === 0 ? (
                <p>No sponsors found yet. Check back soon!</p>
            ) : (
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