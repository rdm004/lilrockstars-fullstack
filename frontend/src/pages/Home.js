// frontend/src/pages/Home.js
import React, { useEffect, useState } from "react";
import "../styles/Home.css";
import { Link } from "react-router-dom";
import apiClient from "../utils/apiClient";
import { formatRaceDate } from "../utils/dateUtils";

const Home = () => {
    // 🏁 Upcoming races
    const [upcomingRaces, setUpcomingRaces] = useState([]);
    const [loadingRaces, setLoadingRaces] = useState(true);
    const [raceError, setRaceError] = useState("");

    // 🏆 Championship standings
    const [standings, setStandings] = useState([]);
    const [loadingStandings, setLoadingStandings] = useState(true);
    const [standingsError, setStandingsError] = useState("");

    // 📸 Latest photos (home preview)
    const [homePhotos, setHomePhotos] = useState([]);
    const [loadingPhotos, setLoadingPhotos] = useState(true);
    const [photosError, setPhotosError] = useState("");

    // 🤝 Featured sponsors (home preview)
    const [featuredSponsors, setFeaturedSponsors] = useState([]);
    const [loadingSponsors, setLoadingSponsors] = useState(true);
    const [sponsorsError, setSponsorsError] = useState("");

    // 🔄 Load races
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

    // 🔄 Load standings (from /api/results)
    useEffect(() => {
        const loadStandings = async () => {
            try {
                setLoadingStandings(true);
                setStandingsError("");

                const res = await apiClient.get("/results");
                const results = res.data || [];

                const pointsByPlacement = { 1: 5, 2: 3, 3: 1 };
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

    // 🔄 Load latest photos for home preview
    useEffect(() => {
        const loadHomePhotos = async () => {
            try {
                setLoadingPhotos(true);
                setPhotosError("");

                const res = await apiClient.get("/photos/latest"); // GET /api/photos/latest
                setHomePhotos(res.data || []);
            } catch (err) {
                console.error("Error loading home photos:", err);
                setPhotosError("Could not load photo highlights.");
            } finally {
                setLoadingPhotos(false);
            }
        };

        loadHomePhotos();
    }, []);

    // 🔄 Load featured sponsors for home preview
    useEffect(() => {
        const loadFeaturedSponsors = async () => {
            try {
                setLoadingSponsors(true);
                setSponsorsError("");

                const res = await apiClient.get("/sponsors/featured"); // GET /api/sponsors/featured
                setFeaturedSponsors(res.data || []);
            } catch (err) {
                console.error("Error loading featured sponsors:", err);
                setSponsorsError("Could not load sponsors.");
            } finally {
                setLoadingSponsors(false);
            }
        };

        loadFeaturedSponsors();
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

                {loadingPhotos && <p>Loading highlights...</p>}
                {photosError && <p>{photosError}</p>}
                {!loadingPhotos && !photosError && homePhotos.length === 0 && (
                    <p>No photos yet. Check back soon!</p>
                )}

                <div className="photo-carousel">
                    {homePhotos.map((photo) => (
                        <img
                            key={photo.id}
                            src={photo.imageUrl}
                            alt={photo.title || "Race photo"}
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

                {loadingSponsors && <p>Loading sponsors...</p>}
                {sponsorsError && <p>{sponsorsError}</p>}
                {!loadingSponsors && !sponsorsError && featuredSponsors.length === 0 && (
                    <p>No sponsors yet. Interested in sponsoring? Contact us!</p>
                )}

                <div className="sponsor-strip">
                    {featuredSponsors.map((s) => (
                        <img
                            key={s.id}
                            src={s.logoUrl}
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