// frontend/src/pages/Sponsors.js
import React, { useEffect, useMemo, useState } from "react";
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
        () => FEATURED_TIERS.map((tier) => sponsors.find((s) => s.tier === tier) || null),
        [sponsors]
    );

    const seriesSponsors = useMemo(
        () => sponsors.filter((s) => s.tier === "Series Partner"),
        [sponsors]
    );

    // ✅ Lightbox state (Gallery-style)
    const [activeIndex, setActiveIndex] = useState(null);

    // We will lightbox ONLY sponsors that have a logoUrl (images)
    const lightboxList = useMemo(() => {
        // keep display order: featured (if present) first, then series
        const featured = featuredSponsors.filter(Boolean);
        const series = seriesSponsors;

        // Only include those with images in the lightbox carousel
        return [...featured, ...series].filter((s) => !!s.logoUrl);
    }, [featuredSponsors, seriesSponsors]);

    const openLightboxBySponsor = (sponsor) => {
        if (!sponsor?.logoUrl) return; // only expand if there is an image
        const idx = lightboxList.findIndex((x) => x.id === sponsor.id);
        if (idx >= 0) setActiveIndex(idx);
    };

    const closeLightbox = () => setActiveIndex(null);

    const prevImage = (e) => {
        e?.stopPropagation();
        setActiveIndex((prev) =>
            prev === null ? null : (prev - 1 + lightboxList.length) % lightboxList.length
        );
    };

    const nextImage = (e) => {
        e?.stopPropagation();
        setActiveIndex((prev) =>
            prev === null ? null : (prev + 1) % lightboxList.length
        );
    };

    // ✅ Keyboard controls when lightbox is open (same as Gallery)
    useEffect(() => {
        if (activeIndex === null) return;

        const onKeyDown = (e) => {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft") prevImage();
            if (e.key === "ArrowRight") nextImage();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeIndex, lightboxList.length]);

    const activeSponsor = activeIndex === null ? null : lightboxList[activeIndex];

    return (
        <div className="sponsors-container">
            <div className="sponsors-header">
                <h1>🤝 Sponsors 🤝</h1>
                <p className="sponsors-intro">
                    Thanks to our partners who make Lil Rockstars Racing possible.
                </p>
            </div>

            {sponsors.length === 0 ? (
                <p>No sponsors found yet. Check back soon!</p>
            ) : (
                <>
                    {/* Featured row */}
                    <section className="sponsors-section">
                        <h2 className="sponsors-section-title">Featured Partners</h2>

                        <div className="featured-grid">
                            {FEATURED_TIERS.map((tier, idx) => {
                                const sponsor = featuredSponsors[idx];

                                return (
                                    <div key={tier} className="sponsor-card featured">
                                        <div className="sponsor-tier">{tier}</div>

                                        {sponsor ? (
                                            <>
                                                {sponsor.logoUrl ? (
                                                    <img
                                                        src={sponsor.logoUrl}
                                                        alt={sponsor.name}
                                                        className="sponsor-logo sponsor-logo-click"
                                                        onClick={() => openLightboxBySponsor(sponsor)}
                                                        title="Click to enlarge"
                                                        loading="lazy"
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
                                                        onClick={(e) => e.stopPropagation()}
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

                    {/* Series grid */}
                    <section className="sponsors-section">
                        <h2 className="sponsors-section-title">Series Partners</h2>

                        {seriesSponsors.length === 0 ? (
                            <p className="muted">No series partners listed yet.</p>
                        ) : (
                            <div className="series-grid">
                                {seriesSponsors.map((s) => (
                                    <div key={s.id} className="sponsor-card">
                                        {s.logoUrl ? (
                                            <img
                                                src={s.logoUrl}
                                                alt={s.name}
                                                className="sponsor-logo sponsor-logo-click"
                                                onClick={() => openLightboxBySponsor(s)}
                                                title="Click to enlarge"
                                                loading="lazy"
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
                                                onClick={(e) => e.stopPropagation()}
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

            {/* ✅ LIGHTBOX (exact same structure/classes as Gallery) */}
            {activeSponsor && (
                <div className="lightbox" onClick={closeLightbox}>
                    <button
                        className="lightbox-btn lightbox-prev"
                        onClick={prevImage}
                        aria-label="Previous image"
                        type="button"
                    >
                        ‹
                    </button>

                    <img
                        src={activeSponsor.logoUrl}
                        alt={activeSponsor.name || "Sponsor"}
                        className="lightbox-image"
                        onClick={(e) => e.stopPropagation()}
                    />

                    <button
                        className="lightbox-btn lightbox-next"
                        onClick={nextImage}
                        aria-label="Next image"
                        type="button"
                    >
                        ›
                    </button>

                    <button
                        className="lightbox-close"
                        onClick={(e) => {
                            e.stopPropagation();
                            closeLightbox();
                        }}
                        aria-label="Close"
                        type="button"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
};

export default Sponsors;