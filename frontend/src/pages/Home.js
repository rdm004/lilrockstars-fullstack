import React from "react";
import "../styles/Home.css";
import { Link } from "react-router-dom";

const Home = () => {
    const upcomingRaces = [
        {
            name: "Winter Classic!",
            date: "1/9/2026",
            location: "Bloomington Speedway",
            description: "Start the new year with the winter classic!",
        },
        {
            name: "Pumpkin Town ThrowDown!",
            date: "10/10/2026",
            location: "RockFish Speedway",
            description: "Fall festival race for all divisions!",
        },
        {
            name: "The Gobbler Gitty Up!",
            date: "11/31/2026",
            location: "RockFish Speedway",
            description: "Thanksgiving-themed showdown for racers.",
        },
    ];

    // 👇 removed emojis from leader text
    const standings = [
        { division: "3 Year Old Division", leader: "Liam Johnson" },
        { division: "4 Year Old Division", leader: "Noah Williams" },
        { division: "5 Year Old Division", leader: "Olivia Brown" },
        { division: "Snack Pack Division", leader: "Ethan Davis" },
    ];

    const sponsors = [
        { name: "Speedy Tires", logo: "/images/sponsors/speedy-tires.png" },
        { name: "GoFast Motors", logo: "/images/sponsors/gofast-motors.png" },
        { name: "Junior Gear", logo: "/images/sponsors/junior-gear.png" },
        { name: "PitStop Energy", logo: "/images/sponsors/pitstop-energy.png" },
    ];

    return (
        <div className="home-container">
            {/* Optional small intro under the navbar, not a full hero */}
            <section className="home-intro">
                <h1>Welcome to Lil Rockstars Racing</h1>
            </section>

            {/* === UPCOMING RACES PREVIEW === */}
            <section className="home-section">
                <h2>🏁 Upcoming Races  🏁</h2>
                <div className="race-preview-grid">
                    {upcomingRaces.map((race, idx) => (
                        <div key={idx} className="race-card">
                            <h3>{race.name}</h3>
                            <p>📅 {race.date}</p>
                            <p>📍 {race.location}</p>
                            <p className="desc">{race.description}</p>
                        </div>
                    ))}
                </div>
                <Link to="/races" className="view-all-link">View All Races →</Link>
            </section>

            {/* === CHAMPIONSHIP STANDINGS === */}
            <section className="home-section standings-preview">
                <h2>🏆 Championship Leaders  🏆</h2>
                <div className="standings-grid">
                    {standings.map((s, idx) => (
                        <div key={idx} className="standing-card">
                            <h4 className="division-title">
                                {/* 👇 same icon logic as Results.js */}
                                {s.division === "3 Year Old Division" && <span className="icon">⭐️</span>}
                                {s.division === "4 Year Old Division" && <span className="icon">🏁</span>}
                                {s.division === "5 Year Old Division" && <span className="icon">🏎️</span>}
                                {s.division === "Snack Pack Division" && <span className="icon">🧢</span>}

                                {s.division}

                                {s.division === "3 Year Old Division" && <span className="icon">⭐️</span>}
                                {s.division === "4 Year Old Division" && <span className="icon">🏁</span>}
                                {s.division === "5 Year Old Division" && <span className="icon">🏎️</span>}
                                {s.division === "Snack Pack Division" && <span className="icon">🧢</span>}
                            </h4>

                            {/* leader name without emoji */}
                            <p>{s.leader}</p>
                        </div>
                    ))}
                </div>
                <Link to="/results" className="view-all-link">View Full Standings →</Link>
            </section>

            {/* === PHOTO GALLERY PREVIEW === */}
            <section className="home-section gallery-preview">
                <h2>📸 Race Day Highlights  📸</h2>
                <div className="photo-carousel">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <img key={i} src={`/images/gallery/sample${i}.jpg`} alt={`Race ${i}`} />
                    ))}
                </div>
                <Link to="/gallery" className="view-all-link">See Full Gallery →</Link>
            </section>

            {/* === SPONSORS PREVIEW === */}
            <section className="home-section sponsors-preview">
                <h2>🤝 Thank You to Our Sponsors  🤝</h2>
                <div className="sponsor-strip">
                    {sponsors.map((s, idx) => (
                        <img key={idx} src={s.logo} alt={s.name} className="sponsor-logo" />
                    ))}
                </div>
                <Link to="/sponsors" className="view-all-link">Meet All Sponsors →</Link>
            </section>
        </div>
    );
};

export default Home;