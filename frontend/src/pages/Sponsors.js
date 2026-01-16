// frontend/src/pages/Sponsors.js
import React, { useMemo } from "react";
import "../styles/Sponsors.css";
import SponsorsData from "../data/SponsorsData";

const FEATURED_TIERS = [
    "Victory Lane Partner",
    "Pole Position Partner",
    "Green Flag Partner",
    "Pre-Race Tech Partner",
];

const Sponsors = () => {
    const sponsors = SponsorsData || [];

    const featuredSponsors = useMemo(
        () => sponsors.filter((s) => FEATURED_TIERS.includes(s.tier)),
        [sponsors]
    );

    const seriesSponsors = useMemo(
        () => sponsors.filter((s) => s.tier === "Series Partner"),
        [sponsors]
    );

    return (
        <div className="sponsors-container">
            <h1>🤝 Sponsors 🤝</h1>
            <p className="sponsors-intro">
                Thanks to our partners who make Lil Rockstars Racing possible.
            </p>

            {sponsors.length === 0 ? (
                <p>No sponsors found yet. Check back soon!</p>
            ) : (
                <>
                    {/* Featured row (top 4 across) */}
                    <section className="sponsors-section">
                        <h2 className="sponsors-section-title">Featured Partners</h2>

                        <div className="featured-grid">
                            {FEATURED_TIERS.map((tier) => {
                                const sponsor = featuredSponsors.find((s) => s.tier === tier);

                                return (
                                    <div key={tier} className="sponsor-card featured">
                                        <div className="sponsor-tier">{tier}</div>

                                        {sponsor ? (
                                            <>
                                                {sponsor.logoUrl ? (
                                                    <img
                                                        src={sponsor.logoUrl}
                                                        alt={sponsor.name}
                                                        className="sponsor-logo"
                                                    />
                                                ) : (
                                                    <div className="sponsor-logo placeholder">
                                                        {sponsor.name?.[0] || "S"}
                                                    </div>
                                                )}

                                                <h3 className="sponsor-name">{sponsor.name}</h3>

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
                                            </>
                                        ) : (
                                            <p className="muted">Coming soon</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Series partners (grid) */}
                    <section className="sponsors-section">
                        <h2 className="sponsors-section-title">Series Partners</h2>

                        {seriesSponsors.length === 0 ? (
                            <p className="muted">No series partners listed yet.</p>
                        ) : (
                            <div className="sponsors-grid">
                                {seriesSponsors.map((s) => (
                                    <div key={s.id} className="sponsor-card">
                                        {s.logoUrl ? (
                                            <img
                                                src={s.logoUrl}
                                                alt={s.name}
                                                className="sponsor-logo"
                                            />
                                        ) : (
                                            <div className="sponsor-logo placeholder">
                                                {s.name?.[0] || "S"}
                                            </div>
                                        )}

                                        <h3 className="sponsor-name">{s.name}</h3>

                                        {s.website && (
                                            <a
                                                href={s.website}
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
                    </section>
                </>
            )}
        </div>
    );
};

export default Sponsors;