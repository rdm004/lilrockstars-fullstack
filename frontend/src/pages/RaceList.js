import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/RaceList.css";
import apiClient from "../utils/apiClient";
import { formatRaceDate } from "../utils/dateUtils";

const RaceList = () => {
    const [races, setRaces] = useState([]);
    const [nextRace, setNextRace] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    useEffect(() => {
        setLoading(true);

        apiClient
            .get("/races")
            .then((response) => {
                const apiRaces = response.data.map((race) => ({
                    id: race.id,
                    name: race.raceName,
                    date: race.raceDate,
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
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleRegisterClick = (raceId) => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
        } else {
            navigate("/dashboard");
        }
    };

    return (
        <div className="races-container">
            <h1>🏎️ Upcoming Races 🏎️</h1>
            <p className="races-intro">Check out our upcoming events and race dates!</p>

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

                                {/* 👉 Updated to clean date format */}
                                <p className="race-date">
                                    📅 {formatRaceDate(race.date)}
                                </p>

                                <p className="race-location">📍 {race.location}</p>
                                <p className="race-desc">{race.description}</p>
                            </div>

                            <div className="card-divider"></div>
                            <div className="race-footer">
                                <button
                                    className="register-btn"
                                    onClick={() => handleRegisterClick(race.id)}
                                >
                                    Register
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RaceList;