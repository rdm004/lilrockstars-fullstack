import React, { useState, useEffect } from "react";
import apiClient from "../utils/apiClient";
import "../styles/ParentDashboard.css";

function ParentDashboard() {
    const [parent, setParent] = useState(null);
    const [racers, setRacers] = useState([]);
    const [races, setRaces] = useState([
        { id: 1, name: "Spring Speedway Showdown", date: "2026-04-11" },
        { id: 2, name: "Summer Nationals", date: "2026-07-18" },
        { id: 3, name: "Lil Rockstars Grand Prix", date: "2026-09-05" },
    ]);
    const [newRacer, setNewRacer] = useState({
        firstName: "",
        lastName: "",
        age: "",
        carNumber: "",
    });
    const [editingRacer, setEditingRacer] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");

    // ✅ Format date like “April 11th, 2026”
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const suffix =
            day % 10 === 1 && day !== 11
                ? "st"
                : day % 10 === 2 && day !== 12
                    ? "nd"
                    : day % 10 === 3 && day !== 13
                        ? "rd"
                        : "th";
        return date.toLocaleString("en-US", {
            month: "long",
            year: "numeric",
        }).replace(",", ` ${day}${suffix},`);
    };

    // ✅ Load parent info
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        apiClient
            .get("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => {
                setParent(res.data);
                fetchRacers(res.data.email);
            })
            .catch((err) => console.error("Error fetching parent:", err));
    }, []);

    // ✅ Load parent info
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        apiClient
            .get("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => {
                setParent(res.data);
                // Fetch racers after parent is set
                fetchRacers();
            })
            .catch((err) => console.error("Error fetching parent:", err));
    }, []);

// ✅ Fetch racers (no need to pass email, backend handles it)
    const fetchRacers = () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        console.log("🎯 Fetching racers from backend...");
        apiClient
            .get("/api/racers", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                console.log("✅ Racers fetched:", res.data);
                setRacers(res.data);
            })
            .catch((err) => console.error("❌ Error fetching racers:", err));
    };

    // ✅ Add Racer
    const handleAddRacer = (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const racerData = { ...newRacer, parentEmail: parent.email };

        apiClient
            .post("/api/racers", racerData, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setRacers([...racers, res.data]);
                setNewRacer({ firstName: "", lastName: "", age: "", carNumber: "" });
                setStatusMessage("✅ Racer added successfully!");
                setTimeout(() => setStatusMessage(""), 2500);
            })
            .catch((err) => console.error("Error adding racer:", err));
    };

    // ✅ Edit Racer
    const startEdit = (racer) => {
        setEditingRacer(racer);
    };

    const handleSaveEdit = () => {
        const token = localStorage.getItem("token");
        apiClient
            .put(`/api/racers/${editingRacer.id}`, editingRacer, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const updated = racers.map((r) =>
                    r.id === res.data.id ? res.data : r
                );
                setRacers(updated);
                setEditingRacer(null);
                setStatusMessage("✅ Racer updated!");
                setTimeout(() => setStatusMessage(""), 2000);
            })
            .catch((err) => console.error("Error saving racer:", err));
    };

    // ✅ Delete Racer
    const handleDeleteRacer = (id) => {
        const token = localStorage.getItem("token");
        apiClient
            .delete(`/api/racers/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => {
                setRacers(racers.filter((r) => r.id !== id));
                setStatusMessage("❌ Racer removed.");
                setTimeout(() => setStatusMessage(""), 2000);
            })
            .catch((err) => console.error("Error deleting racer:", err));
    };

    // ✅ Handle race registration
    const handleRaceRegistration = (racerId, raceId, checked) => {
        const updatedRacers = racers.map((r) => {
            if (r.id === racerId) {
                const updatedRegistrations = checked
                    ? [...(r.registrations || []), raceId]
                    : r.registrations.filter((id) => id !== raceId);
                return { ...r, registrations: updatedRegistrations };
            }
            return r;
        });
        setRacers(updatedRacers);
        setStatusMessage("🏁 Race registration updated!");
        setTimeout(() => setStatusMessage(""), 2000);
    };

    if (!parent) return <p>Loading dashboard...</p>;

    return (
        <div className="dashboard-container">
            <h1>
                Welcome back, <span>{parent.firstName}</span>! 🏁
            </h1>
            <p className="tagline">Ready to build champions, one lap at a time.</p>

            {/* === Racer Section === */}
            <section className="racer-section">
                <h2>Your Racers</h2>
                <ul className="racer-list">
                    {racers.map((racer) => (
                        <li key={racer.id} className="racer-item">
                            {editingRacer && editingRacer.id === racer.id ? (
                                <div className="edit-form">
                                    <input
                                        type="text"
                                        value={editingRacer.firstName}
                                        onChange={(e) =>
                                            setEditingRacer({
                                                ...editingRacer,
                                                firstName: e.target.value,
                                            })
                                        }
                                    />
                                    <input
                                        type="text"
                                        value={editingRacer.lastName}
                                        onChange={(e) =>
                                            setEditingRacer({
                                                ...editingRacer,
                                                lastName: e.target.value,
                                            })
                                        }
                                    />
                                    <input
                                        type="number"
                                        value={editingRacer.age}
                                        onChange={(e) =>
                                            setEditingRacer({
                                                ...editingRacer,
                                                age: e.target.value,
                                            })
                                        }
                                    />
                                    <input
                                        type="text"
                                        value={editingRacer.carNumber}
                                        onChange={(e) =>
                                            setEditingRacer({
                                                ...editingRacer,
                                                carNumber: e.target.value,
                                            })
                                        }
                                    />
                                    <div className="edit-buttons">
                                        <button className="save-btn" onClick={handleSaveEdit}>
                                            Save
                                        </button>
                                        <button
                                            className="cancel-btn"
                                            onClick={() => setEditingRacer(null)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="racer-info">
                                        <strong>
                                            {racer.firstName} {racer.lastName}
                                        </strong>{" "}
                                        — #{racer.carNumber} ({racer.age} yrs)
                                    </div>
                                    <div className="racer-actions">
                                        <button
                                            className="edit-btn"
                                            onClick={() => startEdit(racer)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="remove-btn"
                                            onClick={() => handleDeleteRacer(racer.id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>

                {/* === Add Racer Form === */}
                <form onSubmit={handleAddRacer} className="racer-form">
                    <h3>Add a New Racer</h3>
                    <p className="age-note">
                        * Age is determined as of January 1 of the race season.
                    </p>
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
                    <button type="submit">Add Racer</button>
                </form>
            </section>

            {/* === Race Registration Section === */}
            <section className="race-registration">
                <h2>Race Registrations</h2>
                {racers.map((racer) => (
                    <div key={racer.id} className="racer-card">
                        <h3>
                            {racer.firstName} {racer.lastName} — #{racer.carNumber}
                        </h3>
                        <div className="race-list">
                            {races.map((race) => (
                                <div
                                    key={race.id}
                                    className={`race-item ${
                                        racer.registrations?.includes(race.id) ? "registered" : ""
                                    }`}
                                >
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={racer.registrations?.includes(race.id) || false}
                                            onChange={(e) =>
                                                handleRaceRegistration(
                                                    racer.id,
                                                    race.id,
                                                    e.target.checked
                                                )
                                            }
                                        />
                                        {`${race.name} — ${formatDate(race.date)}`}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </section>

            {statusMessage && <div className="status-message">{statusMessage}</div>}
        </div>
    );
}

export default ParentDashboard;