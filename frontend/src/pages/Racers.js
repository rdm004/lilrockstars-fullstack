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
        // parentEmail: "",  // ❌ no longer needed; parent comes from JWT
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("Fetching racers from API...");
        console.log("API_BASE_URL:", apiClient.defaults.baseURL);

        apiClient
            .get("/racers")  // ✅ hits http://localhost:8080/api/racers (with your baseURL)
            .then((res) => {
                console.log("API response:", res.data);
                setRacers(res.data);
            })
            .catch((err) => {
                console.error("Error fetching racers:", err);
                setError("Unable to load racers. Make sure you are logged in and the backend is running.");
            });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        // Build payload that matches Racer entity (no parentEmail; parent from JWT)
        const payload = {
            firstName: newRacer.firstName,
            lastName: newRacer.lastName,
            age: parseInt(newRacer.age, 10),
            carNumber: newRacer.carNumber,
        };

        apiClient
            .post("/racers", payload)
            .then((res) => {
                setRacers([...racers, res.data]);
                setNewRacer({
                    firstName: "",
                    lastName: "",
                    age: "",
                    carNumber: "",
                    // parentEmail: "",
                });
            })
            .catch((err) => {
                console.error("Error adding racer:", err);
                setError("Unable to add racer. Check that you are logged in.");
            });
    };

    return (
        <div className="page-container">
            <h1>Racers 🏎️</h1>

            {error && (
                <p style={{ color: "red", marginBottom: "1rem" }}>
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit}>
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
                    onChange={(e) =>
                        setNewRacer({ ...newRacer, age: e.target.value })
                    }
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

                {/* ❌ Removed Parent Email field – backend gets parent from JWT
                <input
                    type="email"
                    placeholder="Parent Email"
                    value={newRacer.parentEmail}
                    onChange={(e) =>
                        setNewRacer({ ...newRacer, parentEmail: e.target.value })
                    }
                    required
                />
                */}

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