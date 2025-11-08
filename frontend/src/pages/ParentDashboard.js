// frontend/src/pages/ParentDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import "../styles/ParentDashboard.css";

function ParentDashboard() {
    const [parent, setParent] = useState(null);
    const [racers, setRacers] = useState([]);
    const [races, setRaces] = useState([]);
    const [newRacer, setNewRacer] = useState({
        firstName: "",
        lastName: "",
        age: "",
        carNumber: "",
    });
    const [editingRacer, setEditingRacer] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [registrations, setRegistrations] = useState({});
    // key: `${racerId}|${raceId}` -> { id, racerId, raceId }

    // 👥 Co-parent invite state
    const [coParentEmail, setCoParentEmail] = useState("");
    const [inviteStatus, setInviteStatus] = useState("");
    const [inviteLoading, setInviteLoading] = useState(false);

    const navigate = useNavigate();

    // Format date like “April 11th, 2026”
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

        const month = date.toLocaleString("en-US", { month: "long" });
        const year = date.getFullYear();

        return `${month} ${day}${suffix}, ${year}`;
    };

    // 🔄 Load parent, racers, races, and registrations
    useEffect(() => {
        const token = localStorage.getItem("token");

        // If not logged in, go back to login
        if (!token) {
            navigate("/login");
            return;
        }

        const loadDashboard = async () => {
            try {
                setLoading(true);
                setStatusMessage("");

                // 1) Who is the logged-in parent?
                const parentRes = await apiClient.get("/auth/me");
                setParent(parentRes.data);

                // 2) Racers for this parent (backend already filters by token/household)
                const racersRes = await apiClient.get("/racers");
                setRacers(racersRes.data || []);

                // 3) Races from backend
                const racesRes = await apiClient.get("/races");
                const mappedRaces = (racesRes.data || []).map((race) => ({
                    id: race.id,
                    name: race.raceName,
                    date: race.raceDate,
                    location: race.location,
                    description: race.description,
                }));
                setRaces(mappedRaces);

                // 4) Existing registrations for this parent's racers
                try {
                    const regsRes = await apiClient.get("/registrations/mine");
                    const regMap = {};
                    (regsRes.data || []).forEach((reg) => {
                        const key = `${reg.racerId}|${reg.raceId}`;
                        regMap[key] = reg; // store whole registration
                    });
                    setRegistrations(regMap);
                } catch (regErr) {
                    console.warn("No /registrations/mine endpoint yet or it failed.", regErr);
                }
            } catch (err) {
                console.error("Error loading dashboard:", err);
                const status = err.response?.status;
                if (status === 401 || status === 403) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("firstName");
                    navigate("/login");
                } else {
                    setStatusMessage("❌ Could not load dashboard. Please try again.");
                }
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [navigate]);

    // === Racer CRUD ===

    const handleAddRacer = (e) => {
        e.preventDefault();

        apiClient
            .post("/racers", newRacer)
            .then((res) => {
                setRacers([...racers, res.data]);
                setNewRacer({ firstName: "", lastName: "", age: "", carNumber: "" });
                setStatusMessage("✅ Racer added successfully!");
                setTimeout(() => setStatusMessage(""), 2500);
            })
            .catch((err) => {
                console.error("Error adding racer:", err);
                setStatusMessage("❌ Error adding racer.");
                setTimeout(() => setStatusMessage(""), 2500);
            });
    };

    const startEdit = (racer) => {
        setEditingRacer(racer);
    };

    const handleSaveEdit = () => {
        apiClient
            .put(`/racers/${editingRacer.id}`, editingRacer)
            .then((res) => {
                const updated = racers.map((r) =>
                    r.id === res.data.id ? res.data : r
                );
                setRacers(updated);
                setEditingRacer(null);
                setStatusMessage("✅ Racer updated!");
                setTimeout(() => setStatusMessage(""), 2000);
            })
            .catch((err) => {
                console.error("Error saving racer:", err);
                setStatusMessage("❌ Error updating racer.");
                setTimeout(() => setStatusMessage(""), 2000);
            });
    };

    const handleDeleteRacer = (id) => {
        apiClient
            .delete(`/racers/${id}`)
            .then(() => {
                setRacers(racers.filter((r) => r.id !== id));
                // Also remove any registrations associated with this racer
                setRegistrations((prev) => {
                    const copy = { ...prev };
                    Object.keys(copy).forEach((key) => {
                        if (key.startsWith(`${id}|`)) {
                            delete copy[key];
                        }
                    });
                    return copy;
                });
                setStatusMessage("❌ Racer removed.");
                setTimeout(() => setStatusMessage(""), 2000);
            })
            .catch((err) => {
                console.error("Error deleting racer:", err);
                setStatusMessage("❌ Error removing racer.");
                setTimeout(() => setStatusMessage(""), 2000);
            });
    };

    // === Race Registration ===

    const handleRaceRegistration = async (racerId, raceId, checked) => {
        const key = `${racerId}|${raceId}`;

        try {
            if (checked) {
                // Register racer for race
                const res = await apiClient.post("/registrations", { racerId, raceId });
                setRegistrations((prev) => ({
                    ...prev,
                    [key]: res.data,
                }));
                setStatusMessage("🏁 Racer registered for race!");
            } else {
                // Unregister racer from race
                const existing = registrations[key];
                if (!existing) return;

                await apiClient.delete(`/registrations/${existing.id}`);

                setRegistrations((prev) => {
                    const copy = { ...prev };
                    delete copy[key];
                    return copy;
                });
                setStatusMessage("❌ Racer unregistered from race.");
            }
        } catch (err) {
            console.error("Error updating race registration:", err);
            setStatusMessage("❌ Error updating registration.");
        } finally {
            setTimeout(() => setStatusMessage(""), 2000);
        }
    };

    // === Co-parent invite ===

    const handleInviteSubmit = async (e) => {
        e.preventDefault();
        setInviteStatus("");
        setInviteLoading(true);

        try {
            // POST /api/parents/invite  { email: "coparent@example.com" }
            await apiClient.post("/parents/invite", { email: coParentEmail });

            setInviteStatus(
                "✅ Invite sent! If they already have an account, they'll see your racers. If not, they can sign up with this email."
            );
            setCoParentEmail("");
        } catch (err) {
            console.error("Error sending co-parent invite:", err);
            const msg =
                err.response?.data?.message ||
                "Sorry, we couldn't send that invite. Please try again.";
            setInviteStatus("❌ " + msg);
        } finally {
            setInviteLoading(false);
        }
    };

    // === Rendering ===

    if (loading || !parent) {
        return <p>Loading dashboard...</p>;
    }

    return (
        <div className="dashboard-container">
            {/* Header with welcome + co-parent invite */}
            <div className="dashboard-header">
                <div className="welcome-section">
                    <h1>
                        Welcome back, <span>{parent.firstName}</span>! 🏁
                    </h1>
                    <p className="tagline">
                        Ready to build champions, one lap at a time.
                    </p>
                </div>

                <div className="coparent-inline">
                    <h3>👥 Invite a Co-Parent</h3>
                    <form className="coparent-form-inline" onSubmit={handleInviteSubmit}>
                        <input
                            type="email"
                            placeholder="Co-parent's email"
                            value={coParentEmail}
                            onChange={(e) => setCoParentEmail(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={inviteLoading}>
                            {inviteLoading ? "Sending..." : "Send Invite"}
                        </button>
                    </form>
                    {inviteStatus && (
                        <p className="coparent-status">{inviteStatus}</p>
                    )}
                </div>
            </div>

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
                    <button type="submit">Add Racer</button>
                </form>
            </section>

            {/* === Race Registration Section === */}
            <section className="race-registration">
                <h2>Race Registrations</h2>
                {racers.length === 0 ? (
                    <p>Add a racer above to start registering for events.</p>
                ) : races.length === 0 ? (
                    <p>No races available yet. Check back soon!</p>
                ) : (
                    racers.map((racer) => (
                        <div key={racer.id} className="racer-card">
                            <h3>
                                {racer.firstName} {racer.lastName} — #{racer.carNumber}
                            </h3>
                            <div className="race-list">
                                {races.map((race) => {
                                    const key = `${racer.id}|${race.id}`;
                                    const isRegistered = !!registrations[key];

                                    return (
                                        <div
                                            key={race.id}
                                            className={`race-item ${
                                                isRegistered ? "registered" : ""
                                            }`}
                                        >
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={isRegistered}
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
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </section>

            {statusMessage && (
                <div className="status-message">{statusMessage}</div>
            )}
        </div>
    );
}

export default ParentDashboard;