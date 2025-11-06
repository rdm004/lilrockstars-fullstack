import React, { useEffect, useState } from "react";
import "../styles/Sponsors.css";

const Sponsors = () => {
    const [sponsors, setSponsors] = useState([]);

    useEffect(() => {
        // Mock sponsor data
        const mockSponsors = [
            {
                id: 1,
                name: "Speedy Tires",
                logoUrl: "/images/sponsors/speedy-tires.png",
                website: "https://speedytires.com",
                description: "Trusted tire provider for all Lil Rockstars events!",
            },
            {
                id: 2,
                name: "GoFast Motors",
                logoUrl: "/images/sponsors/gofast-motors.png",
                website: "https://gofastmotors.com",
                description: "Performance parts to help you cross the finish line first.",
            },
            {
                id: 3,
                name: "Junior Gear",
                logoUrl: "/images/sponsors/junior-gear.png",
                website: "https://juniorgear.com",
                description: "Official apparel sponsor for Lil Rockstars Racing.",
            },
            {
                id: 4,
                name: "PitStop Energy",
                logoUrl: "/images/sponsors/pitstop-energy.png",
                website: "https://pitstopenergy.com",
                description: "Fueling future champions on and off the track.",
            },
        ];

        setSponsors(mockSponsors);
    }, []);

    return (
        <div className="sponsors-container">
            <h1>🤝 Our Sponsors 🤝</h1>
            <p className="sponsors-intro">
                Big thanks to our amazing partners who support youth racing excellence!
            </p>

            <div className="sponsors-grid">
                {sponsors.map((sponsor) => (
                    <div key={sponsor.id} className="sponsor-card">
                        <img
                            src={sponsor.logoUrl}
                            alt={sponsor.name}
                            className="sponsor-logo"
                        />
                        <h3>{sponsor.name}</h3>
                        <p>{sponsor.description}</p>
                        <a
                            href={sponsor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="sponsor-button"
                        >
                            Visit Website
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sponsors;