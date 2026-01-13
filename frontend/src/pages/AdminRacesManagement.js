import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import apiClient from "../utils/apiClient";
import "../styles/AdminRacesManagement.css";

const EMPTY_FORM = {
    id: null,
    raceName: "",
    raceDate: "",
    location: "",
    description: "",
};

const toInputDate = (dateStr) => {
    if (!dateStr) return "";
    // handles "2026-03-14" or ISO strings
    return String(dateStr).slice(0, 10);
};

const AdminRacesManagement = () => {
    const [races, setRaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);

    const sortedRaces = useMemo(() => {
        const copy = [...(races || [])];
        copy.sort((a, b) => new Date(a.raceDate || 0) - new Date(b.raceDate || 0));
        return copy;
    }, [races]);

    const fetchRaces = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await apiClient.get("/races"); // backend: /api/races
            const data = res.data || [];

            const normalized = data.map((r) => ({
                id: r.id,
                raceName: r.raceName ?? r.name ?? "",
                raceDate: toInputDate(r.raceDate),
                location: r.location ?? "",
                description: r.description ?? "",
            }));

            setRaces(normalized);
        } catch (e) {
            console.error("Failed to load races:", e);
            setError("Could not load races. Check console/network for details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchRaces();
    }, []);

    const openAdd = () => {
        setEditMode(false);
        setForm(EMPTY_FORM);
        setIsModalOpen(true);
    };

    const openEdit = (race) => {
        setEditMode(true);
        setForm({
            id: race.id,
            raceName: race.raceName || "",
            raceDate: toInputDate(race.raceDate),
            location: race.location || "",
            description: race.description || "",
        });
        setIsModalOpen(true);
    };

    const handleDeleteRace = async (id) => {
        if (!window.confirm("Delete this event?")) return;

        try {
            await apiClient.delete(`/admin/races/${id}`);  // ✅ IMPORTANT
            setRaces((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            console.error("Delete failed:", err);
            alert("❌ Could not delete event.");
        }
    };

    const handleSave = async () => {
        if (!form.raceName?.trim() || !form.raceDate) {
            alert("Race Name and Race Date are required.");
            return;
        }

        const payload = {
            raceName: form.raceName.trim(),
            raceDate: form.raceDate, // yyyy-mm-dd
            location: form.location?.trim() || "",
            description: form.description?.trim() || "",
        };

        try {
            if (editMode && form.id) {
                await apiClient.put(`/races/${form.id}`, payload);
            } else {
                await apiClient.post("/races", payload);
            }

            setIsModalOpen(false);
            setForm(EMPTY_FORM);
            setEditMode(false);
            void fetchRaces();
        } catch (e) {
            console.error("Failed to save race:", e);
            alert("Failed to save. Check console/network.");
        }
    };

    return (
        <Layout title="Events (Races) Management">
            <div className="admin-races-page">
                <div className="admin-races-header">
                    <div>
                        <h1>Events</h1>
                        <p className="subtext">Add and manage upcoming races/events.</p>
                    </div>

                    <button className="btn-primary" onClick={openAdd}>
                        + Add Event
                    </button>
                </div>

                {loading && <p className="loading">Loading races...</p>}
                {!loading && error && <p className="error">{error}</p>}

                {!loading && !error && (
                    <div className="admin-races-table-wrap">
                        <table className="admin-races-table">
                            <thead>
                            <tr>
                                <th>Date</th>
                                <th>Event</th>
                                <th>Location</th>
                                <th>Description</th>
                                <th style={{ width: 180 }}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortedRaces.length === 0 ? (
                                <tr>
                                    <td colSpan="5">No races found.</td>
                                </tr>
                            ) : (
                                sortedRaces.map((r) => (
                                    <tr key={r.id}>
                                        <td>{r.raceDate || "-"}</td>
                                        <td style={{ fontWeight: 700 }}>{r.raceName}</td>
                                        <td>{r.location || "-"}</td>
                                        <td>{r.description || "-"}</td>
                                        <td>
                                            <button className="btn-edit" onClick={() => openEdit(r)}>
                                                Edit
                                            </button>
                                            <button className="delete-btn" onClick={() => handleDeleteRace(race.id)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                )}

                <Modal
                    title={editMode ? "Edit Event" : "Add Event"}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSave}
                    submitLabel={editMode ? "Update Event" : "Create Event"}
                >
                    <label>Event Name</label>
                    <input
                        type="text"
                        value={form.raceName}
                        onChange={(e) => setForm((p) => ({ ...p, raceName: e.target.value }))}
                        required
                    />

                    <label>Event Date</label>
                    <input
                        type="date"
                        value={form.raceDate}
                        onChange={(e) => setForm((p) => ({ ...p, raceDate: e.target.value }))}
                        required
                    />

                    <label>Location</label>
                    <input
                        type="text"
                        value={form.location}
                        onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    />

                    <label>Description</label>
                    <textarea
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    />
                </Modal>
            </div>
        </Layout>
    );
};

export default AdminRacesManagement;