import React, { useEffect, useState } from "react";
import "../styles/RaceList.css";
import apiClient from "../utils/apiClient";

const RaceList = () => {
    const [races, setRaces] = useState([]);
    const [nextRace, setNextRace] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        // 🧪 Temporary mock data for local testing (kept here, but commented out)
        // const mockRaces = [
        //     { id: 1, name: "Pumpkin Town ThrowDown!", date: "2026-10-11", location: "RockFish Speedway", description: "Fall festival race for all divisions!" },
        //     { id: 2, name: "The Gobbler Gitty Up!", date: "2026-11-01", location: "RockFish Speedway", description: "Thanksgiving-themed showdown for racers." },
        //     { id: 3, name: "Winter Classic!", date: "2026-01-10", location: "Bloomington Speedway", description: "Start the new year with the winter classic!" },
        // ];
        //
        // const todayMock = new Date();
        // const upcomingMock = mockRaces.filter(r => new Date(r.date) >= todayMock);
        // upcomingMock.sort((a, b) => new Date(a.date) - new Date(b.date));
        //
        // if (upcomingMock.length > 0) {
        //     upcomingMock[0].isNextEvent = true;
        //     setNextRace(upcomingMock[0]);
        // }
        //
        // setTimeout(() => {
        //     setRaces(upcomingMock);
        //     setLoading(false);
        // }, 400);

        // 🚀 Live data from backend
        apiClient
            .get("/races") // hits http://localhost:8080/api/races because of your baseURL
            .then((response) => {
                // Map backend fields (raceName, raceDate) into the shape this component expects (name, date)
                const apiRaces = response.data.map((race) => ({
                    id: race.id,
                    name: race.raceName,
                    date: race.raceDate,      // should be ISO string like "2025-06-10"
                    location: race.location,
                    description: race.description,
                }));

                const today = new Date();
                const upcoming = apiRaces.filter(r => new Date(r.date) >= today);
                upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));

                if (upcoming.length > 0) {
                    upcoming[0].isNextEvent = true;
                    setNextRace(upcoming[0]);
                }

                setRaces(upcoming);
            })
            .catch((error) => {
                console.error("Error loading races:", error);
                // 🧯 Optional: fallback to mock data if backend fails
                // setRaces(mockRaces);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <div className="races-container">
            <h1>🏎️  Upcoming Races  🏎️</h1>
            <p>Check out our upcoming events and race dates!</p>

            {/* ✅ Next Event Highlight Box */}
            {/* If you want this back, just uncomment this block */}
            {/*{nextRace && (*/}
            {/*    <div className="next-event-banner">*/}
            {/*        <h2>*/}
            {/*            Next Event:{" "}*/}
            {/*            <span className="highlight">{nextRace.name}</span>*/}
            {/*        </h2>*/}
            {/*        <p>*/}
            {/*            📅 {new Date(nextRace.date).toLocaleDateString()} — 📍{" "}*/}
            {/*            {nextRace.location}*/}
            {/*        </p>*/}
            {/*    </div>*/}
            {/*)}*/}

            {loading ? (
                <p className="loading">Loading races...</p>
            ) : races.length === 0 ? (
                <p>No upcoming races found.</p>
            ) : (
                <div className="races-grid">
                    {races.map((race) => (
                        <div
                            key={race.id}
                            className={`race-card ${race.isNextEvent ? "next-event" : ""}`}
                        >
                            <div className="race-content">
                                <h2>{race.name}</h2>
                                <p className="race-date">
                                    📅 {new Date(race.date).toLocaleDateString()}
                                </p>
                                <p className="race-location">📍 {race.location}</p>
                                <p className="race-desc">{race.description}</p>
                            </div>

                            <div className="card-divider"></div>
                            <div className="race-footer">
                                <button className="register-btn">Register</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RaceList;