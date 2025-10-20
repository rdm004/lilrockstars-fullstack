// frontend/src/pages/Racers.js
import React, { useEffect, useState } from "react";
import apiClient from "../utils/apiClient";

function Racers() {
    const [racers, setRacers] = useState([]);
    const [newRacer, setNewRacer] = useState({
        firstName: "",
        lastName: "",
        age: "",
        carNumber: "",
        parentEmail: "",
    });

    useEffect(() => {
        console.log("Fetching racers from API...");
        console.log("API_BASE_URL:", apiClient.defaults.baseURL);

        apiClient
            .get("/api/racers")
            .then((res) => {
                console.log("API response:", res.data);
                setRacers(res.data);
            })
            .catch((err) => {
                console.error("Error fetching racers:", err);
            });
    }, []);

    return (
        <div className="page-container">
            <h1>Racers 🏎️</h1>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    apiClient.post("/api/racers", newRacer).then((res) => {
                        setRacers([...racers, res.data]);
                        setNewRacer({
                            firstName: "",
                            lastName: "",
                            age: "",
                            carNumber: "",
                            parentEmail: "",
                        });
                    });
                }}
            >
                <input
                    type="text"
                    placeholder="First Name"
                    value={newRacer.firstName}
                    onChange={(e) =>
                        setNewRacer({ ...newRacer, firstName: e.target.value })
                    }
                    required
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={newRacer.lastName}
                    onChange={(e) =>
                        setNewRacer({ ...newRacer, lastName: e.target.value })
                    }
                    required
                />
                <input
                    type="number"
                    placeholder="Age"
                    value={newRacer.age}
                    onChange={(e) => setNewRacer({ ...newRacer, age: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Car Number"
                    value={newRacer.carNumber}
                    onChange={(e) =>
                        setNewRacer({ ...newRacer, carNumber: e.target.value })
                    }
                    required
                />
                <input
                    type="email"
                    placeholder="Parent Email"
                    value={newRacer.parentEmail}
                    onChange={(e) =>
                        setNewRacer({ ...newRacer, parentEmail: e.target.value })
                    }
                    required
                />
                <button type="submit">Add Racer</button>
            </form>

            <ul>
                {racers.map((racer) => (
                    <li key={racer.id}>
                        {racer.firstName} {racer.lastName} — #{racer.carNumber} ({racer.age} yrs)
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Racers;