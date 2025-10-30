import React, { useEffect, useState } from "react";
import apiClient from "../utils/apiClient";

function RegisterRacers() {
    const [racers, setRacers] = useState([]);
    const [races, setRaces] = useState([]);
    const [registration, setRegistration] = useState({
        racerId: "",
        raceId: "",
    });

    // Fetch available racers and races
    useEffect(() => {
        apiClient.get("/api/racers").then((res) => setRacers(res.data));
        apiClient.get("/api/races").then((res) => setRaces(res.data));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            racer: { id: registration.racerId },
            race: { id: registration.raceId },
            status: "Registered",
        };

        apiClient.post("/api/registrations", payload).then(() => {
            alert("✅ Racer registered successfully!");
            setRegistration({ racerId: "", raceId: "" });
        });
    };

    return (
        <div className="page-container">
            <h1>Register for a Race 🏁</h1>

            <form onSubmit={handleSubmit} className="form">
                <label>Racer:</label>
                <select
                    value={registration.racerId}
                    onChange={(e) =>
                        setRegistration({ ...registration, racerId: e.target.value })
                    }
                    required
                >
                    <option value="">-- Select Racer --</option>
                    {racers.map((r) => (
                        <option key={r.id} value={r.id}>
                            {r.firstName} {r.lastName} (#{r.carNumber})
                        </option>
                    ))}
                </select>

                <label>Race:</label>
                <select
                    value={registration.raceId}
                    onChange={(e) =>
                        setRegistration({ ...registration, raceId: e.target.value })
                    }
                    required
                >
                    <option value="">-- Select Race --</option>
                    {races.map((race) => (
                        <option key={race.id} value={race.id}>
                            {race.raceName} ({race.raceDate})
                        </option>
                    ))}
                </select>

                <button type="submit">Register Racer</button>
            </form>
        </div>
    );
}

export default RegisterRacers;