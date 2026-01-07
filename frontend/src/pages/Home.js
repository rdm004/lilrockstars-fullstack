// frontend/src/pages/Home.js
import React, { useEffect, useState } from "react";
import "../styles/Home.css";
import { Link } from "react-router-dom";
import apiClient from "../utils/apiClient";
import { formatRaceDate } from "../utils/dateUtils";
import sponsorsData from "../data/SponsorsData";

const Home = () => {
    // 🏁 Upcoming races
    const [upcomingRaces, setUpcomingRaces] = useState([]);
    const [loadingRaces, setLoadingRaces] = useState(true);
    const [raceError, setRaceError] = useState("");

    // 🏆 Championship standings
    const [standings, setStandings] = useState([]);
    const [loadingStandings, setLoadingStandings] = useState(true);
    const [standingsError, setStandingsError] = useState("");
    const getMedal = (place) => {
        if (place === 1) return "🥇";
        if (place === 2) return "🥈";
        if (place === 3) return "🥉";
        return "";
    };

    // 📸 Latest photos (home preview)
    const [homePhotos, setHomePhotos] = useState([]);
    const [loadingPhotos, setLoadingPhotos] = useState(true);
    const [photosError, setPhotosError] = useState("");



    // 🔄 Load upcoming races
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
                console.error("Error loading races:", err);
                setRaceError("Could not load upcoming races. Please try again later.");
            } finally {
                setLoadingRaces(false);
            }
        };

        void loadRaces();   // 👈 Fix IntelliJ warning
    }, []);

    // 🔄 Load standings
    useEffect(() => {
        const loadStandings = async () => {
            try {
                setLoadingStandings(true);
                setStandingsError("");

                const res = await apiClient.get("/results");
                const results = res.data || [];

                // ✅ Your scoring: 13 / 10 / 8, everyone else = 1
                const pointsByPlacement = { 1: 13, 2: 10, 3: 8 };
                const divisionMap = {};

                results.forEach((r) => {
                    if (!r.division || !r.racerName) return;

                    // make sure division bucket exists
                    if (!divisionMap[r.division]) {
                        divisionMap[r.division] = {};
                    }

                    // make sure racer entry exists
                    if (!divisionMap[r.division][r.racerName]) {
                        divisionMap[r.division][r.racerName] = {
                            name: r.racerName,
                            points: 0,
                        };
                    }

                    // ✅ compute points *inside* the loop using r
                    const pts = pointsByPlacement[r.placement] ?? 1;
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

        void loadStandings();
    }, []);
    // 🔄 Load latest photos for home preview
    useEffect(() => {
        const loadHomePhotos = async () => {
            try {
                setLoadingPhotos(true);
                setPhotosError("");

                const res = await apiClient.get("/photos");
                const photos = res.data || [];

                // Take the newest 8 photos by uploadedAt
                const latest = photos
                    .filter((p) => p.imageUrl)
                    .sort((a, b) => {
                        const da = a.uploadedAt ? new Date(a.uploadedAt) : 0;
                        const db = b.uploadedAt ? new Date(b.uploadedAt) : 0;
                        return db - da; // newest first
                    })
                    .slice(0, 8);

                setHomePhotos(latest);
            } catch (err) {
                console.error("Error loading home photos:", err);
                setPhotosError("Could not load photo highlights.");
            } finally {
                setLoadingPhotos(false);
            }
        };

        loadHomePhotos();
    }, []);


    return (
        <div className="home-container">
            <section className="home-intro">
                <h1>Welcome to Lil Rockstars Racing</h1>
            </section>

            {/* === UPCOMING RACES === */}
            <section className="home-section">
                <h2>🏁 Upcoming Races 🏁</h2>

                {loadingRaces && <p>Loading...</p>}
                {!loadingRaces && upcomingRaces.length === 0 && <p>No races found.</p>}

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

                <Link to="/races" className="view-all-link">View All Races →</Link>
            </section>

            {/* === STANDINGS === */}
            <section className="home-section standings-preview">
                <h2>🏆 Championship Leaders 🏆</h2>

                <div className="standings-grid">
                    {standings.map((s, idx) => (
                        <div key={idx} className="standing-card">
                            <h4 className="division-title">{s.division}</h4>
                            <ol className="leader-list">
                                {s.leaders.map((leader) => (
                                    <li key={leader.position}>
                                        <span style={{ marginRight: "6px" }}>{getMedal(leader.position)}</span>
                                        #{leader.position} {leader.name} — {leader.points} pts
                                    </li>
                                ))}
                            </ol>
                        </div>
                    ))}
                </div>

                <Link to="/results" className="view-all-link">View Full Standings →</Link>
            </section>

            {/* === PHOTO PREVIEW === */}
            <section className="home-section gallery-preview">
                <h2>📸 Race Day Highlights 📸</h2>

                <div className="photo-carousel">
                    {homePhotos.map((photo) => (
                        <img
                            key={photo.id}
                            src={photo.imageUrl}
                            alt={photo.title || "Race photo"}
                        />
                    ))}
                </div>

                <Link to="/gallery" className="view-all-link">See Full Gallery →</Link>
            </section>

            {/* === SPONSORS === */}
            <section className="home-section sponsors-preview">
                <h2>🤝 Thank You to Our Sponsors 🤝</h2>

                {sponsorsData.length === 0 ? (
                    <p>No sponsors yet. Interested in sponsoring? Contact us!</p>
                ) : (
                    <div className="sponsor-strip">
                        {sponsorsData.map((s) => (
                            <img
                                key={s.id}
                                src={s.logoUrl}
                                alt={s.name}
                                className="sponsor-logo"
                            />
                        ))}
                    </div>
                )}

                <Link to="/sponsors" className="view-all-link">
                    Meet All Sponsors →
                </Link>
            </section>
        </div>
    );
};

export default Home;