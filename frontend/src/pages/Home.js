import React, { useEffect, useState } from "react";
import "../styles/Home.css";
import { formatRaceDate } from "../utils/dateUtils";
import { Link } from "react-router-dom";
import apiClient from "../utils/apiClient";

const Home = () => {
    const [upcomingRaces, setUpcomingRaces] = useState([]);
    const [loadingRaces, setLoadingRaces] = useState(true);
    const [raceError, setRaceError] = useState("");

    // 👇 standings unchanged
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

    // 🧠 Load races from the same API as RaceList
    useEffect(() => {
        const loadRaces = async () => {
            try {
                setLoadingRaces(true);
                setRaceError("");

                const res = await apiClient.get("/races");

                const mapped = (res.data || []).map((race) => ({
                    id: race.id,
                    name: race.raceName,
                    date: race.raceDate,
                    location: race.location,
                    description: race.description,
                }));

                // Sort by date & take first 3 as "upcoming"
                const sorted = mapped
                    .filter((r) => !!r.date)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, 3);

                setUpcomingRaces(sorted);
            } catch (err) {
                console.error("Error loading upcoming races:", err);
                setRaceError("Could not load upcoming races. Please try again later.");
            } finally {
                setLoadingRaces(false);
            }
        };

        loadRaces();
    }, []);

    return (
        <div className="home-container">
            {/* Optional small intro under the navbar, not a full hero */}
            <section className="home-intro">
                <h1>Welcome to Lil Rockstars Racing</h1>
            </section>

            {/* === UPCOMING RACES PREVIEW === */}
            <section className="home-section">
                <h2>🏁 Upcoming Races  🏁</h2>

                {loadingRaces && <p>Loading upcoming races...</p>}
                {raceError && <p>{raceError}</p>}
                {!loadingRaces && !raceError && upcomingRaces.length === 0 && (
                    <p>No upcoming races found. Check back soon!</p>
                )}

                <div className="race-preview-grid">
                    {upcomingRaces.map((race) => (
                        <div key={race.id} className="race-card">
                            <h3>{race.name}</h3>
                            <p>📅 {formatRaceDate(race.date)}</p>
                            <p>📍 {race.location}</p>
                            <p className="desc">{race.description}</p>
                        </div>
                    ))}
                </div>

                <Link to="/races" className="view-all-link">
                    View All Races →
                </Link>
            </section>

            {/* === CHAMPIONSHIP STANDINGS === */}
            <section className="home-section standings-preview">
                <h2>🏆 Championship Leaders  🏆</h2>
                <div className="standings-grid">
                    {standings.map((s, idx) => (
                        <div key={idx} className="standing-card">
                            <h4 className="division-title">
                                {/* 👇 same icon logic as Results.js */}
                                {s.division === "3 Year Old Division" && (
                                    <span className="icon">⭐️</span>
                                )}
                                {s.division === "4 Year Old Division" && (
                                    <span className="icon">🏁</span>
                                )}
                                {s.division === "5 Year Old Division" && (
                                    <span className="icon">🏎️</span>
                                )}
                                {s.division === "Snack Pack Division" && (
                                    <span className="icon">🧢</span>
                                )}

                                {s.division}

                                {s.division === "3 Year Old Division" && (
                                    <span className="icon">⭐️</span>
                                )}
                                {s.division === "4 Year Old Division" && (
                                    <span className="icon">🏁</span>
                                )}
                                {s.division === "5 Year Old Division" && (
                                    <span className="icon">🏎️</span>
                                )}
                                {s.division === "Snack Pack Division" && (
                                    <span className="icon">🧢</span>
                                )}
                            </h4>

                            {/* leader name without emoji */}
                            <p>{s.leader}</p>
                        </div>
                    ))}
                </div>
                <Link to="/results" className="view-all-link">
                    View Full Standings →
                </Link>
            </section>

            {/* === PHOTO GALLERY PREVIEW === */}
            <section className="home-section gallery-preview">
                <h2>📸 Race Day Highlights  📸</h2>
                <div className="photo-carousel">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <img
                            key={i}
                            src={`/images/gallery/sample${i}.jpg`}
                            alt={`Race ${i}`}
                        />
                    ))}
                </div>
                <Link to="/gallery" className="view-all-link">
                    See Full Gallery →
                </Link>
            </section>

            {/* === SPONSORS PREVIEW === */}
            <section className="home-section sponsors-preview">
                <h2>🤝 Thank You to Our Sponsors  🤝</h2>
                <div className="sponsor-strip">
                    {sponsors.map((s, idx) => (
                        <img
                            key={idx}
                            src={s.logo}
                            alt={s.name}
                            className="sponsor-logo"
                        />
                    ))}
                </div>
                <Link to="/sponsors" className="view-all-link">
                    Meet All Sponsors →
                </Link>
            </section>
        </div>
    );
};

export default Home;