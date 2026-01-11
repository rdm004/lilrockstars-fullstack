import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import apiClient from "../utils/apiClient";
import "../styles/RegistrationsManagement.css";

const emptyForm = {
    id: null,
    racer: "",
    parent: "",
    race: "",
    status: "Pending",
};

const RegistrationsManagement = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState(emptyForm);

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await apiClient.get("/registrations"); // GET /api/registrations
            const data = res.data || [];

            // Normalize keys so UI works even if backend field names differ slightly
            const normalized = data.map((row) => ({
                id: row.id,
                racer: row.racer ?? row.racerName ?? row.racer_full_name ?? "",
                parent: row.parent ?? row.parentName ?? row.parent_full_name ?? "",
                race: row.race ?? row.raceName ?? "",
                status: row.status ?? "Pending",
            }));

            setRegistrations(normalized);
        } catch (err) {
            console.error("Error loading registrations:", err);
            setError("Could not load registrations. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchRegistrations();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this registration?")) return;

        try {
            await apiClient.delete(`/registrations/${id}`);
            setRegistrations((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            console.error("Error deleting registration:", err);
            alert("❌ Failed to delete registration.");
        }
    };

    const handleOpenAdd = () => {
        setEditMode(false);
        setFormData(emptyForm);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (registration) => {
        setEditMode(true);
        setFormData({
            id: registration.id,
            racer: registration.racer || "",
            parent: registration.parent || "",
            race: registration.race || "",
            status: registration.status || "Pending",
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        const payload = {
            racer: formData.racer?.trim(),
            parent: formData.parent?.trim(),
            race: formData.race?.trim(),
            status: formData.status,
        };

        if (!payload.racer || !payload.parent || !payload.race) {
            alert("Please fill out all fields.");
            return;
        }

        try {
            if (editMode && formData.id) {
                await apiClient.put(`/registrations/${formData.id}`, payload);
            } else {
                // Default new registrations to Pending unless you explicitly choose Confirmed
                await apiClient.post("/registrations", { ...payload, status: payload.status || "Pending" });
            }

            setIsModalOpen(false);
            setFormData(emptyForm);
            setEditMode(false);
            void fetchRegistrations();
        } catch (err) {
            console.error("Error saving registration:", err);
            alert("❌ Failed to save registration.");
        }
    };

    const badgeClass = (status) => {
        const s = String(status || "").toLowerCase();
        if (s === "confirmed") return "confirmed";
        if (s === "rejected") return "rejected";
        if (s === "canceled" || s === "cancelled") return "canceled";
        return "pending";
    };

    return (
        <Layout title="Registrations Management">
            <div className="registrations-container">
                <div className="registrations-header">
                    <h1>Registrations Management</h1>
                    <button className="add-btn" onClick={handleOpenAdd}>
                        + Add Registration
                    </button>
                </div>

                {loading ? (
                    <p className="loading">Loading registrations...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : registrations.length === 0 ? (
                    <p>No registrations found.</p>
                ) : (
                    <table className="registrations-table">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Racer</th>
                            <th>Parent</th>
                            <th>Race</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {registrations.map((reg, index) => (
                            <tr key={reg.id}>
                                <td>{index + 1}</td>
                                <td>{reg.racer}</td>
                                <td>{reg.parent}</td>
                                <td>{reg.race}</td>
                                <td>
                    <span className={`status-badge ${badgeClass(reg.status)}`}>
                      {reg.status}
                    </span>
                                </td>
                                <td>
                                    <button className="edit-btn" onClick={() => handleOpenEdit(reg)}>
                                        Edit
                                    </button>
                                    <button className="delete-btn" onClick={() => handleDelete(reg.id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal
                title={editMode ? "Edit Registration" : "Add Registration"}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSave}
                submitLabel={editMode ? "Update Registration" : "Add Registration"}
            >
                <label>Racer Name</label>
                <input
                    type="text"
                    value={formData.racer}
                    onChange={(e) => setFormData({ ...formData, racer: e.target.value })}
                    required
                />

                <label>Parent Name</label>
                <input
                    type="text"
                    value={formData.parent}
                    onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                    required
                />

                <label>Race</label>
                <input
                    type="text"
                    value={formData.race}
                    onChange={(e) => setFormData({ ...formData, race: e.target.value })}
                    required
                />

                <label>Status</label>
                <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>

                    {/* Optional future statuses */}
                    <option value="Rejected">Rejected</option>
                    <option value="Canceled">Canceled</option>
                </select>
            </Modal>
        </Layout>
    );
};

export default RegistrationsManagement;