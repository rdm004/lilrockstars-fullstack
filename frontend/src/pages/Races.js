import React, { useEffect, useState } from "react";
import apiClient from "../utils/apiClient";

function Races() {
    const [races, setRaces] = useState([]);

    useEffect(() => {
        apiClient.get("/api/races").then((res) => setRaces(res.data));
    }, []);

    return (
        <div className="page-container">
            <h1>Upcoming Races 🗓️</h1>
            <ul className="list">
                {races.map((race) => (
                    <li key={race.id}>
                        {race.raceName} — {race.location} ({race.raceDate})
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Races;