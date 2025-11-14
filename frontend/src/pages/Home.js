// frontend/src/pages/Home.js
import React, { useEffect, useState } from "react";
import "../styles/Home.css";
import { Link } from "react-router-dom";
import apiClient from "../utils/apiClient";
import { formatRaceDate } from "../utils/dateUtils";

const Home = () => {
    // 🏁 Upcoming races state
    const [upcomingRaces, setUpcomingRaces] = useState([]);
    const [loadingRaces, setLoadingRaces] = useState(true);
    const [raceError, setRaceError] = useState("");

    // 🏆 Championship standings state (top 3 per division)
    // standings = [{ division, leaders: [{ position, name, points }] }]
    const [standings, setStandings] = useState([]);
    const [loadingStandings, setLoadingStandings] = useState(true);
    const [standingsError, setStandingsError] = useState("");

    const sponsors = [
        { name: "Speedy Tires", logo: "/images/sponsors/speedy-tires.png" },
        { name: "GoFast Motors", logo: "/images/sponsors/gofast-motors.png" },
        { name: "Junior Gear", logo: "/images/sponsors/junior-gear.png" },
        { name: "PitStop Energy", logo: "/images/sponsors/pitstop-energy.png" },
    ];

    // 🔄 Load races (from /api/races)
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

    // 🔄 Load standings (from /api/results, then compute top 3 per division)
    useEffect(() => {
        const loadStandings = async () => {
            try {
                setLoadingStandings(true);
                setStandingsError("");

                const res = await apiClient.get("/results");
                const results = res.data || [];

                // Simple points system (tweak if you want)
                const pointsByPlacement = {
                    1: 5,
                    2: 3,
                    3: 1,
                };

                // divisionMap[division][racerName] = { name, points }
                const divisionMap = {};

                results.forEach((r) => {
                    if (!r.division || !r.racerName) return;

                    if (!divisionMap[r.division]) {
                        divisionMap[r.division] = {};
                    }

                    if (!divisionMap[r.division][r.racerName]) {
                        divisionMap[r.division][r.racerName] = {
                            name: r.racerName,
                            points: 0,
                        };
                    }

                    const pts = pointsByPlacement[r.placement] || 0;
                    divisionMap[r.division][r.racerName].points += pts;
                });

                // Build standings array: [{ division, leaders: [ { position, name, points } ] }]
                const standingsArr = Object.keys(divisionMap).map((division) => {
                    const racersArr = Object.values(divisionMap[division])
                        .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name))
                        .slice(0, 3)
                        .map((racer, idx) => ({
                            position: idx + 1,
                            name: racer.name,
                            points: racer.points,
                        }));

                    return { division, leaders: racersArr };
                });

                // Optional: sort divisions in a nice order (alphabetical for now)
                standingsArr.sort((a, b) => a.division.localeCompare(b.division));

                setStandings(standingsArr);
            } catch (err) {
                console.error("Error loading standings:", err);
                setStandingsError("Could not load championship leaders right now.");
            } finally {
                setLoadingStandings(false);
            }
        };

        loadStandings();
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

                {loadingStandings && <p>Loading championship leaders...</p>}
                {standingsError && <p>{standingsError}</p>}
                {!loadingStandings && !standingsError && standings.length === 0 && (
                    <p>No standings available yet. Check back later!</p>
                )}

                <div className="standings-grid">
                    {standings.map((s, idx) => (
                        <div key={idx} className="standing-card">
                            <h4 className="division-title">
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

                            {/* 👇 Top 3 list for that division */}
                            <ol className="leader-list">
                                {s.leaders.map((leader) => (
                                    <li key={leader.position}>
                                        #{leader.position} {leader.name}
                                        {leader.points > 0 && ` — ${leader.points} pts`}
                                    </li>
                                ))}
                            </ol>
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