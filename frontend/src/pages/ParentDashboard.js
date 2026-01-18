// frontend/src/pages/ParentDashboard.js
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import "../styles/ParentDashboard.css";
import { formatRaceDate } from "../utils/dateUtils";
import DeleteRacerConfirmModal from "../components/DeleteRacerConfirmModal"; // ✅

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

    // ✅ Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [racerToDelete, setRacerToDelete] = useState(null);

    // 👥 Co-parent invite state
    const [coParentEmail, setCoParentEmail] = useState("");
    const [inviteStatus, setInviteStatus] = useState("");
    const [inviteLoading, setInviteLoading] = useState(false);

    const navigate = useNavigate();

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

                // 2) Racers for this parent
                const racersRes = await apiClient.get("/racers");
                setRacers(racersRes.data || []);

                // 3) Races
                // 3) Races (only ones that require registration)
                const racesRes = await apiClient.get("/races");

                const mappedRaces = (racesRes.data || []).map((race) => ({
                    id: race.id,
                    name: race.raceName,
                    date: race.raceDate,
                    location: race.location,
                    description: race.description,
                    requiresRegistration: race.requiresRegistration ?? true, // ✅ NEW
                }));

// ✅ Option A: remove info-only events from parent dashboard
                const registrationOnlyRaces = mappedRaces.filter((r) => r.requiresRegistration === true);

                setRaces(registrationOnlyRaces);

                // 4) Existing registrations
                try {
                    const regsRes = await apiClient.get("/registrations/mine");
                    const regMap = {};
                    (regsRes.data || []).forEach((reg) => {
                        const key = `${reg.racerId}|${reg.raceId}`;
                        regMap[key] = reg;
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

    // ✅ UX: Next upcoming race card
    const nextRace = useMemo(() => {
        if (!races || races.length === 0) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = races
            .filter((r) => r?.date && new Date(r.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        return upcoming[0] || null;
    }, [races]);

    // ✅ UX: Summary "You have X racers registered for Y events"
    const registrationSummary = useMemo(() => {
        const regValues = Object.values(registrations || {});
        const uniqueRacerIds = new Set();
        const uniqueRaceIds = new Set();

        regValues.forEach((reg) => {
            if (reg?.racerId) uniqueRacerIds.add(reg.racerId);
            if (reg?.raceId) uniqueRaceIds.add(reg.raceId);
        });

        return {
            registeredRacersCount: uniqueRacerIds.size,
            totalEventsCount: uniqueRaceIds.size,
        };
    }, [registrations]);

    // === Logout ===
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("firstName");
        navigate("/login");
    };

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
                const updated = racers.map((r) => (r.id === res.data.id ? res.data : r));
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

    // ✅ open delete modal instead of deleting immediately
    const openDeleteRacer = (racer) => {
        setRacerToDelete(racer);
        setDeleteModalOpen(true);
    };

    // ✅ confirmed delete (checkbox was checked)
    const confirmDeleteRacer = async (racerId) => {
        try {
            await apiClient.delete(`/racers/${racerId}`);

            // remove racer
            setRacers((prev) => prev.filter((r) => r.id !== racerId));

            // remove any registrations associated with this racer
            setRegistrations((prev) => {
                const copy = { ...prev };
                Object.keys(copy).forEach((key) => {
                    if (key.startsWith(`${racerId}|`)) delete copy[key];
                });
                return copy;
            });

            setStatusMessage("🗑️ Racer deleted.");
        } catch (err) {
            console.error("Error deleting racer:", err);
            setStatusMessage("❌ Error removing racer.");
        } finally {
            setDeleteModalOpen(false);
            setRacerToDelete(null);
            setTimeout(() => setStatusMessage(""), 2000);
        }
    };

    // === Race Registration ===
    const handleRaceRegistration = async (racerId, raceId, checked) => {
        const key = `${racerId}|${raceId}`;

        try {
            if (checked) {
                const res = await apiClient.post("/registrations", { racerId, raceId });
                setRegistrations((prev) => ({
                    ...prev,
                    [key]: res.data,
                }));
                setStatusMessage("🏁 Racer registered for race!");
            } else {
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
            await apiClient.post("/parents/invite", { email: coParentEmail });
            setInviteStatus(
                "✅ Invite sent! If they already have an account, they'll see your racers. If not, they can sign up with this email."
            );
            setCoParentEmail("");
        } catch (err) {
            console.error("Error sending co-parent invite:", err);
            const msg = err.response?.data?.message || "Sorry, we couldn't send that invite. Please try again.";
            setInviteStatus("❌ " + msg);
        } finally {
            setInviteLoading(false);
        }
    };

    // === Rendering ===
    if (loading || !parent) {
        return <p>Loading dashboard...</p>;
    }

    const racerToDeleteName = racerToDelete
        ? `${racerToDelete.firstName || ""} ${racerToDelete.lastName || ""}`.trim()
        : "this racer";

    return (
        <div className="dashboard-container">
            {/* ✅ Delete confirmation modal */}
            <DeleteRacerConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDeleteRacer}
                racerId={racerToDelete?.id}
                racerName={racerToDeleteName}
            />

            {/* Header with welcome + co-parent invite + logout */}
            <div className="dashboard-header">
                <div className="welcome-section">
                    <h1>
                        Welcome back, <span>{parent.firstName}</span>! 🏁
                    </h1>
                    <p className="tagline">Ready to build champions, one lap at a time.</p>
                </div>

                <div className="header-right">
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
                        <h7> Co-parent must be registered to receive invite.</h7>
                        {inviteStatus && <p className="coparent-status">{inviteStatus}</p>}
                    </div>

                    <button className="logout-button" onClick={handleLogout} title="Log out">
                        Logout
                    </button>
                </div>
            </div>

            {/* ✅ NEW: Next Race + Summary */}
            <div className="dashboard-top-row">
                <div className="next-race-card">
                    <h2 className="next-race-title">🏁 Next Upcoming Race</h2>

                    {nextRace ? (
                        <>
                            <div className="next-race-name">{nextRace.name}</div>
                            <div className="next-race-meta">
                                <span>📅 {formatRaceDate(nextRace.date)}</span>
                                {nextRace.location ? <span>📍 {nextRace.location}</span> : null}
                            </div>
                            {nextRace.description ? <p className="next-race-desc">{nextRace.description}</p> : null}
                        </>
                    ) : (
                        <p className="next-race-empty">No upcoming races scheduled yet.</p>
                    )}
                </div>

                <div className="registration-summary-card">
                    <h2 className="summary-title">📌 Quick Summary</h2>
                    <p className="summary-text">
                        You have <b>{registrationSummary.registeredRacersCount}</b> racer(s) registered for{" "}
                        <b>{registrationSummary.totalEventsCount}</b> total event(s).
                    </p>
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
                                        onChange={(e) => setEditingRacer({ ...editingRacer, firstName: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        value={editingRacer.lastName}
                                        onChange={(e) => setEditingRacer({ ...editingRacer, lastName: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        value={editingRacer.age}
                                        onChange={(e) => setEditingRacer({ ...editingRacer, age: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        value={editingRacer.carNumber}
                                        onChange={(e) => setEditingRacer({ ...editingRacer, carNumber: e.target.value })}
                                    />
                                    <div className="edit-buttons">
                                        <button className="save-btn" onClick={handleSaveEdit}>
                                            Save
                                        </button>
                                        <button className="cancel-btn" onClick={() => setEditingRacer(null)}>
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
                                        <button className="edit-btn" onClick={() => startEdit(racer)}>
                                            Edit
                                        </button>
                                        <button className="remove-btn" onClick={() => openDeleteRacer(racer)}>
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
                    <p className="age-note">* Age is determined as of January 1 of the race season.</p>

                    <input
                        type="text"
                        placeholder="First Name"
                        value={newRacer.firstName}
                        onChange={(e) => setNewRacer({ ...newRacer, firstName: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        value={newRacer.lastName}
                        onChange={(e) => setNewRacer({ ...newRacer, lastName: e.target.value })}
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
                        onChange={(e) => setNewRacer({ ...newRacer, carNumber: e.target.value })}
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
                                        <div key={race.id} className={`race-item ${isRegistered ? "registered" : ""}`}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={isRegistered}
                                                    onChange={(e) => handleRaceRegistration(racer.id, race.id, e.target.checked)}
                                                />
                                                {`${race.name} — ${formatRaceDate(race.date)}`}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </section>

            {statusMessage && <div className="status-message">{statusMessage}</div>}
        </div>
    );
}

export default ParentDashboard;