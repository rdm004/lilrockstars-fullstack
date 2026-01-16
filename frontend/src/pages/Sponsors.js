// frontend/src/pages/Sponsors.js
import React, { useMemo } from "react";
import Layout from "../components/Layout";
import SponsorsData from "../data/SponsorsData";
import "../styles/Sponsors.css";

const FEATURED_TIERS = [
    "Victory Lane Partner",
    "Pole Position Partner",
    "Green Flag Partner",
    "Pre-Race Tech Partner",
];

const Sponsors = () => {
    // -----------------------------
    // ✅ BLOCK: data grouping
    // -----------------------------
    const { featuredSponsors, seriesSponsors, sponsorsByTier } = useMemo(() => {
        const featured = [];
        const series = [];
        const byTier = {};

        (SponsorsData || []).forEach((s) => {
            const tier = s.tier || "Other";

            // bucket by tier (for optional future use)
            if (!byTier[tier]) byTier[tier] = [];
            byTier[tier].push(s);

            // featured row
            if (FEATURED_TIERS.includes(tier)) featured.push(s);

            // series partners row(s)
            if (tier === "Series Partner") series.push(s);
        });

        // Ensure featured row is in the same order as FEATURED_TIERS
        featured.sort((a, b) => FEATURED_TIERS.indexOf(a.tier) - FEATURED_TIERS.indexOf(b.tier));

        // Optional: sort series partners alphabetically
        series.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

        return { featuredSponsors: featured, seriesSponsors: series, sponsorsByTier: byTier };
    }, []);

    // -----------------------------
    // ✅ BLOCK: reusable sponsor card
    // -----------------------------
    const SponsorCard = ({ sponsor, variant = "normal" }) => {
        const CardTag = sponsor.website ? "a" : "div";
        const cardProps = sponsor.website
            ? { href: sponsor.website, target: "_blank", rel: "noopener noreferrer" }
            : {};

        return (
            <CardTag className={`sponsor-card ${variant}`} {...cardProps}>
                <div className="sponsor-tier">{sponsor.tier}</div>

                {sponsor.logoUrl ? (
                    <img className="sponsor-logo" src={sponsor.logoUrl} alt={sponsor.name} />
                ) : (
                    <div className="sponsor-logo placeholder">{sponsor.name?.[0] || "★"}</div>
                )}

                <div className="sponsor-name">{sponsor.name}</div>

                {sponsor.website ? (
                    <div className="sponsor-link">Visit Website →</div>
                ) : (
                    <div className="sponsor-link muted">Website coming soon</div>
                )}
            </CardTag>
        );
    };

    return (
        <Layout title="Sponsors">
            <div className="sponsors-page">
                {/* =============================
            ✅ BLOCK 1: Page header
           ============================= */}
                <header className="sponsors-header">
                    <h1>🤝 Sponsors</h1>
                    <p className="muted">
                        Thanks to our partners who make Lil Rockstars Racing possible.
                    </p>
                </header>

                {/* =============================
            ✅ BLOCK 2: Featured sponsors (top row)
            “top 4 sponsors across the first row”
           ============================= */}
                <section className="sponsors-block">
                    <div className="block-title-row">
                        <h2>Featured Partners</h2>
                        <span className="muted small">Top tiers</span>
                    </div>

                    {featuredSponsors.length === 0 ? (
                        <p className="muted">No featured sponsors yet.</p>
                    ) : (
                        <div className="featured-grid">
                            {featuredSponsors.map((s) => (
                                <SponsorCard key={s.id} sponsor={s} variant="featured" />
                            ))}
                        </div>
                    )}
                </section>

                {/* =============================
            ✅ BLOCK 3: Series partners (grid below)
           ============================= */}
                <section className="sponsors-block">
                    <div className="block-title-row">
                        <h2>Series Partners</h2>
                        <span className="muted small">{seriesSponsors.length} sponsor(s)</span>
                    </div>

                    {seriesSponsors.length === 0 ? (
                        <p className="muted">No series partners yet.</p>
                    ) : (
                        <div className="series-grid">
                            {seriesSponsors.map((s) => (
                                <SponsorCard key={s.id} sponsor={s} />
                            ))}
                        </div>
                    )}
                </section>

                {/* =============================
            ✅ BLOCK 4 (optional): Other tiers later
            If you add more tiers in SponsorsData, you can render them here.
           ============================= */}
                {/* Example:
        <section className="sponsors-block">
          <h2>More Sponsors</h2>
          {Object.keys(sponsorsByTier)
            .filter(t => !FEATURED_TIERS.includes(t) && t !== "Series Partner")
            .map(tier => (
              <div key={tier}>
                <h3>{tier}</h3>
                <div className="series-grid">
                  {sponsorsByTier[tier].map(s => <SponsorCard key={s.id} sponsor={s} />)}
                </div>
              </div>
            ))}
        </section>
        */}
            </div>
        </Layout>
    );
};

export default Sponsors;