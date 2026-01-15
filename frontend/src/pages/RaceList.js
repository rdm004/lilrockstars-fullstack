// frontend/src/pages/RaceList.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/RaceList.css";
import apiClient from "../utils/apiClient";
import { formatRaceDate } from "../utils/dateUtils";

const RaceList = () => {
    const [allRaces, setAllRaces] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const loadRaces = async () => {
            try {
                setLoading(true);

                const res = await apiClient.get("/races");

                const mapped = (res.data || []).map((race) => ({
                    id: race.id,
                    name: race.raceName,
                    date: race.raceDate,
                    location: race.location,
                    description: race.description,
                }));

                setAllRaces(mapped);
            } catch (error) {
                console.error("Error loading races:", error);
                setAllRaces([]);
            } finally {
                setLoading(false);
            }
        };

        void loadRaces();
    }, []);

    const { upcomingRaces, pastRaces } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const valid = (allRaces || []).filter((r) => {
            if (!r.date) return false;
            const d = new Date(r.date);
            return !Number.isNaN(d.getTime());
        });

        const upcoming = [];
        const past = [];

        valid.forEach((r) => {
            const d = new Date(r.date);
            d.setHours(0, 0, 0, 0);

            if (d >= today) upcoming.push(r);
            else past.push(r);
        });

        // Upcoming: soonest first
        upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Mark the next event
        const upcomingWithFlag = upcoming.map((r, idx) => ({
            ...r,
            isNextEvent: idx === 0,
        }));

        // Past: most recent first
        past.sort((a, b) => new Date(b.date) - new Date(a.date));

        return { upcomingRaces: upcomingWithFlag, pastRaces: past };
    }, [allRaces]);

    const handleRegisterClick = () => {
        const token = localStorage.getItem("token");
        if (!token) navigate("/login");
        else navigate("/dashboard");
    };

    const renderRaceGrid = (races) => (
        <div className="races-grid">
            {races.map((race) => (
                <div
                    key={race.id}
                    className={`race-card ${race.isNextEvent ? "next-event" : ""}`}
                >
                    <div className="race-content">
                        <h2>{race.name}</h2>

                        <p className="race-date">📅 {formatRaceDate(race.date)}</p>
                        <p className="race-location">📍 {race.location}</p>
                        <p className="race-desc">{race.description}</p>
                    </div>

                    <div className="card-divider"></div>

                    <div className="race-footer">
                        <button className="register-btn" onClick={handleRegisterClick}>
                            Register
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="races-container">
            <h1>🏎️ Races 🏎️</h1>
            <p className="races-intro">Check out our upcoming events and past races.</p>

            {loading ? (
                <p className="loading">Loading races...</p>
            ) : (
                <>
                    {/* ✅ UPCOMING */}
                    <h2 style={{ textAlign: "center", marginTop: "1rem" }}>Upcoming Races</h2>
                    {upcomingRaces.length === 0 ? (
                        <p>No upcoming races found.</p>
                    ) : (
                        renderRaceGrid(upcomingRaces)
                    )}

                    {/* ✅ PAST */}
                    <h2 style={{ textAlign: "center", marginTop: "2.25rem" }}>Past Races</h2>
                    {pastRaces.length === 0 ? (
                        <p>No past races found.</p>
                    ) : (
                        renderRaceGrid(pastRaces)
                    )}
                </>
            )}
        </div>
    );
};

export default RaceList;