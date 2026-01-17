import React, { useEffect, useState } from "react";
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
    requiresRegistration: true,
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

            const res = await apiClient.get("/races"); // GET /api/races
            const data = res.data || [];

            const normalized = data.map((x) => ({
                id: x.id,
                raceName: x.raceName ?? x.name ?? "",
                raceDate: x.raceDate ?? x.date ?? "",
                location: x.location ?? "",
                description: x.description ?? "",
                requiresRegistration: x.requiresRegistration ?? true,
            }));

            normalized.sort((a, b) => new Date(a.raceDate || 0) - new Date(b.raceDate || 0));
            setRaces(normalized);
        } catch (e) {
            console.error("Error loading races:", e);
            setError("Could not load events. Please try again.");
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
            requiresRegistration: r.requiresRegistration ?? true,
        });
        setIsModalOpen(true);
    };

    const handleDeleteRace = async (id) => {
        if (!window.confirm("Delete this event?")) return;

        try {
            await apiClient.delete(`/races/${id}`);
            setRaces((prev) => prev.filter((x) => x.id !== id));
        } catch (e) {
            console.error("Error deleting race:", e);
            alert("❌ Could not delete this event.");
        }
    };

    const handleSave = async () => {
        const payload = {
            raceName: (form.raceName || "").trim(),
            raceDate: form.raceDate || null,
            location: (form.location || "").trim(),
            description: (form.description || "").trim(),
            requiresRegistration: !!form.requiresRegistration,
        };

        if (!payload.raceName || !payload.raceDate) {
            alert("Event Name and Event Date are required.");
            return;
        }

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
            console.error("Error saving race:", e);
            alert("❌ Failed to save event.");
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "2-digit" });
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
                        {/* ✅ Removed "Upcoming events: X" */}
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
                ) : races.length === 0 ? (
                    <p>No events found.</p>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className="admin-races-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                            <tr style={{ background: "#f8f9fa" }}>
                                <th style={{ textAlign: "left", padding: "12px", borderBottom: "1px solid #eee" }}>Event</th>
                                <th style={{ textAlign: "left", padding: "12px", borderBottom: "1px solid #eee" }}>Date</th>
                                <th style={{ textAlign: "left", padding: "12px", borderBottom: "1px solid #eee" }}>Location</th>
                                <th style={{ textAlign: "left", padding: "12px", borderBottom: "1px solid #eee" }}>Type</th>
                                <th style={{ textAlign: "left", padding: "12px", borderBottom: "1px solid #eee" }}>Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {races.map((r) => (
                                <tr key={r.id}>
                                    <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0" }}>{r.raceName}</td>
                                    <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0" }}>{formatDate(r.raceDate)}</td>
                                    <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0" }}>{r.location || "-"}</td>
                                    <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0" }}>
                                        {r.requiresRegistration ? "Race (Registration Required)" : "Info Only (No Registration)"}
                                    </td>
                                    <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" }}>
                                        <button className="edit-btn" onClick={() => handleOpenEdit(r)} style={{ marginRight: "8px" }}>
                                            Edit
                                        </button>
                                        <button className="delete-btn" onClick={() => handleDeleteRace(r.id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
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

                    <label style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                        <input
                            type="checkbox"
                            checked={!!form.requiresRegistration}
                            onChange={(e) => setForm((p) => ({ ...p, requiresRegistration: e.target.checked }))}
                        />
                        Requires registration (uncheck for info-only events)
                    </label>
                </Modal>
            </div>
        </Layout>
    );
};

export default AdminRacesManagement;