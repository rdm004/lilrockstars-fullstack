// frontend/src/pages/AdminRacesManagement.js
import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import apiClient from "../utils/apiClient";
import "../styles/AdminRacesManagement.css"; // optional (if you have it)

const EMPTY_FORM = {
    id: null,
    raceName: "",
    raceDate: "",
    location: "",
    description: "",
};

const startOfToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

const isPastRace = (raceDate) => {
    if (!raceDate) return false;
    const d = new Date(raceDate);
    if (Number.isNaN(d.getTime())) return false;
    d.setHours(0, 0, 0, 0);
    return d < startOfToday();
};

const AdminRacesManagement = () => {
    const [races, setRaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);

    const fetchRaces = async () => {
        try {
            setLoading(true);
            setError("");

            // apiClient baseURL already ends with /api
            const res = await apiClient.get("/races"); // GET /api/races
            const data = res.data || [];

            // Normalize fields (supports either your mapped UI shape or raw backend)
            const normalized = data.map((x) => ({
                id: x.id,
                raceName: x.raceName ?? x.raceName ?? x.name ?? "",
                raceDate: x.raceDate ?? x.date ?? "",
                location: x.location ?? "",
                description: x.description ?? "",
            }));

            // Sort by date ascending
            normalized.sort(
                (a, b) => new Date(a.raceDate || 0) - new Date(b.raceDate || 0)
            );

            setRaces(normalized);
        } catch (e) {
            console.error("Error loading races:", e);
            setError("Could not load races. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchRaces();
    }, []);

    const handleOpenAdd = () => {
        setEditMode(false);
        setForm(EMPTY_FORM);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (r) => {
        setEditMode(true);
        setForm({
            id: r.id,
            raceName: r.raceName || "",
            raceDate: r.raceDate || "",
            location: r.location || "",
            description: r.description || "",
        });
        setIsModalOpen(true);
    };

    const handleDeleteRace = async (id) => {
        if (!window.confirm("Delete this event?")) return;

        try {
            // DELETE /api/admin/races/{id}
            await apiClient.delete(`/admin/races/${id}`);
            setRaces((prev) => prev.filter((x) => x.id !== id));
        } catch (e) {
            console.error("Error deleting race:", e);
            alert("❌ Could not delete this event. (Check backend route / permissions)");
        }
    };

    const handleSave = async () => {
        const payload = {
            raceName: (form.raceName || "").trim(),
            raceDate: form.raceDate || null,
            location: (form.location || "").trim(),
            description: (form.description || "").trim(),
        };

        if (!payload.raceName || !payload.raceDate) {
            alert("Event Name and Event Date are required.");
            return;
        }

        try {
            if (editMode && form.id) {
                // PUT /api/races/{id}
                await apiClient.put(`/races/${form.id}`, payload);
            } else {
                // POST /api/races
                await apiClient.post("/races", payload);
            }

            setIsModalOpen(false);
            setForm(EMPTY_FORM);
            setEditMode(false);
            void fetchRaces();
        } catch (e) {
            console.error("Error saving race:", e);
            alert("❌ Failed to save event. (Check backend route / payload fields)");
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "2-digit",
        });
    };

    const upcomingRaces = useMemo(
        () => (races || []).filter((r) => !isPastRace(r.raceDate)),
        [races]
    );

    const pastRaces = useMemo(
        () => (races || []).filter((r) => isPastRace(r.raceDate)),
        [races]
    );

    const upcomingCount = useMemo(() => upcomingRaces.length, [upcomingRaces]);

    const renderRacesTable = ({ rows, allowDelete }) => {
        if (!rows || rows.length === 0) {
            return <p style={{ marginTop: "10px" }}>No events found.</p>;
        }

        return (
            <div style={{ overflowX: "auto" }}>
                <table
                    className="admin-races-table"
                    style={{ width: "100%", borderCollapse: "collapse" }}
                >
                    <thead>
                    <tr style={{ background: "#f8f9fa" }}>
                        <th style={thStyle}>Event</th>
                        <th style={thStyle}>Date</th>
                        <th style={thStyle}>Location</th>
                        <th style={thStyle}>Description</th>
                        <th style={thStyle}>Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {rows.map((r) => {
                        const past = isPastRace(r.raceDate);

                        return (
                            <tr key={r.id}>
                                <td style={tdStyle}>{r.raceName}</td>
                                <td style={tdStyle}>{formatDate(r.raceDate)}</td>
                                <td style={tdStyle}>{r.location || "-"}</td>
                                <td style={tdStyle}>{r.description || "-"}</td>

                                <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleOpenEdit(r)}
                                        style={{ marginRight: "8px" }}
                                    >
                                        Edit
                                    </button>

                                    {allowDelete ? (
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDeleteRace(r.id)}
                                            disabled={past}
                                            title={
                                                past
                                                    ? "Past events are archived to protect results/history."
                                                    : "Delete event"
                                            }
                                            style={{
                                                opacity: past ? 0.5 : 1,
                                                cursor: past ? "not-allowed" : "pointer",
                                            }}
                                        >
                                            Delete
                                        </button>
                                    ) : null}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <Layout title="Events Management">
            <div className="admin-races-page" style={{ padding: "2rem" }}>
                <div
                    className="admin-races-header"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "1rem",
                        marginBottom: "1.25rem",
                    }}
                >
                    <div>
                        <h1 style={{ margin: 0 }}>Events</h1>
                        <p style={{ margin: "0.5rem 0 0", color: "#1e63ff" }}>
                            Upcoming events: <b>{upcomingCount}</b>
                        </p>
                    </div>

                    <button className="add-btn" onClick={handleOpenAdd}>
                        + Add Event
                    </button>
                </div>

                {loading ? (
                    <p className="loading">Loading events...</p>
                ) : error ? (
                    <p className="error" style={{ color: "#d33" }}>
                        {error}
                    </p>
                ) : (
                    <>
                        {/* ✅ UPCOMING EVENTS */}
                        <h2 style={{ marginTop: "1rem" }}>Upcoming Events</h2>

                        <table className="admin-races-table">
                            <tbody>
                            {upcomingRaces.map((r) => (
                                <tr key={r.id}>
                                    <td>{r.raceName}</td>
                                    <td>{formatDate(r.raceDate)}</td>
                                    <td>{r.location || "-"}</td>
                                    <td>{r.description || "-"}</td>
                                    <td>
                                        <button className="edit-btn" onClick={() => handleOpenEdit(r)}>
                                            Edit
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDeleteRace(r.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        {/* ✅ PAST EVENTS */}
                        <div style={{ marginTop: "2rem" }}>
                            <h2 style={{ marginTop: "2.5rem", color: "#666" }}>Past Events</h2>
                            <p style={{ fontSize: "0.9rem", color: "#777" }}>
                                Past events are kept for historical results and cannot be deleted.
                            </p>

                            <table className="admin-races-table">
                                <tbody>
                                {pastRaces.map((r) => (
                                    <tr key={r.id} style={{ opacity: 0.6 }}>
                                        <td>{r.raceName}</td>
                                        <td>{formatDate(r.raceDate)}</td>
                                        <td>{r.location || "-"}</td>
                                        <td>{r.description || "-"}</td>
                                        <td>
                    <span style={{ fontSize: "0.85rem", color: "#999" }}>
                        Archived
                    </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                <Modal
                    title={editMode ? "Edit Event" : "Add Event"}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSave}
                    submitLabel={editMode ? "Update Event" : "Add Event"}
                >
                    <label>Event Name</label>
                    <input
                        type="text"
                        value={form.raceName}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, raceName: e.target.value }))
                        }
                        required
                    />

                    <label>Event Date</label>
                    <input
                        type="date"
                        value={form.raceDate}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, raceDate: e.target.value }))
                        }
                        required
                    />

                    <label>Location</label>
                    <input
                        type="text"
                        value={form.location}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, location: e.target.value }))
                        }
                    />

                    <label>Description</label>
                    <textarea
                        rows={3}
                        value={form.description}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, description: e.target.value }))
                        }
                    />
                </Modal>
            </div>
        </Layout>
    );
};

const thStyle = {
    textAlign: "left",
    padding: "12px",
    borderBottom: "1px solid #eee",
};

const tdStyle = {
    padding: "12px",
    borderBottom: "1px solid #f0f0f0",
};

export default AdminRacesManagement;