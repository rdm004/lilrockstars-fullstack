import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import apiClient from "../utils/apiClient";
import "../styles/RacersManagement.css";
import DeleteRacerConfirmModal from "../components/DeleteRacerConfirmModal"; // ✅ NEW

const getDivisionFromAge = (ageRaw) => {
    const age = Number(ageRaw);

    if (age === 2 || age === 3) return "3 Year Old Division";
    if (age === 4) return "4 Year Old Division";
    if (age === 5) return "5 Year Old Division";
    if (age === 6 || age === 7) return "Snack Pack Division";
    return "N/A";
};

const RacersManagement = () => {
    const [racers, setRacers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // ✅ Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [racerToDelete, setRacerToDelete] = useState(null);

    const emptyForm = {
        id: null,
        firstName: "",
        lastName: "",
        age: "",
        carNumber: "",
    };

    const [formData, setFormData] = useState(emptyForm);

    const fetchRacers = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await apiClient.get("/racers"); // GET /api/racers
            setRacers(res.data || []);
        } catch (err) {
            console.error("Error loading racers:", err);
            setError("Could not load racers. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchRacers();
    }, []);

    // ✅ NEW: open delete modal (no window.confirm)
    const openDeleteRacer = (racer) => {
        setRacerToDelete(racer);
        setDeleteModalOpen(true);
    };

    // ✅ NEW: confirmed delete (checkbox checked)
    const confirmDeleteRacer = async (racerId) => {
        try {
            await apiClient.delete(`/racers/${racerId}`);
            // refresh list
            void fetchRacers();
        } catch (err) {
            console.error("Error deleting racer:", err);
            alert("❌ Failed to delete racer.");
        } finally {
            setDeleteModalOpen(false);
            setRacerToDelete(null);
        }
    };

    const handleOpenAdd = () => {
        setEditMode(false);
        setFormData(emptyForm);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (racer) => {
        setEditMode(true);
        setFormData({
            id: racer.id,
            firstName: racer.firstName || "",
            lastName: racer.lastName || "",
            age: racer.age ?? "",
            carNumber: racer.carNumber || "",
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        const payload = {
            firstName: formData.firstName?.trim(),
            lastName: formData.lastName?.trim(),
            age: Number(formData.age),
            carNumber: String(formData.carNumber).trim(),
        };

        if (!payload.firstName || !payload.lastName || !payload.carNumber || !payload.age) {
            alert("Please fill out First Name, Last Name, Age, and Car Number.");
            return;
        }

        try {
            if (editMode && formData.id) {
                await apiClient.put(`/racers/${formData.id}`, payload);
            } else {
                await apiClient.post("/racers", payload);
            }

            setIsModalOpen(false);
            setFormData(emptyForm);
            void fetchRacers();
        } catch (err) {
            console.error("Error saving racer:", err);
            alert("❌ Failed to save racer.");
        }
    };

    const racerToDeleteName = racerToDelete
        ? `${racerToDelete.firstName || ""} ${racerToDelete.lastName || ""}`.trim()
        : "this racer";

    return (
        <Layout title="Racers Management">
            {/* ✅ Delete confirmation modal */}
            <DeleteRacerConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDeleteRacer}
                racerId={racerToDelete?.id}
                racerName={racerToDeleteName}
            />

            <div className="racers-container">
                <div className="racers-header">
                    <h1>Racers Management</h1>
                    <button className="add-btn" onClick={handleOpenAdd}>
                        + Add Racer
                    </button>
                </div>

                {loading ? (
                    <p className="loading">Loading racers...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : racers.length === 0 ? (
                    <p>No racers found.</p>
                ) : (
                    <table className="racers-table">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Division</th>
                            <th>Car #</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {racers.map((racer, index) => (
                            <tr key={racer.id}>
                                <td>{index + 1}</td>
                                <td>
                                    {racer.firstName} {racer.lastName}
                                </td>
                                <td>{racer.age}</td>
                                <td>{getDivisionFromAge(racer.age)}</td>
                                <td>{racer.carNumber}</td>
                                <td>
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleOpenEdit(racer)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => openDeleteRacer(racer)} // ✅ UPDATED
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                title={editMode ? "Edit Racer" : "Add Racer"}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSave}
                submitLabel={editMode ? "Update Racer" : "Add Racer"}
            >
                <label>First Name</label>
                <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                    }
                    required
                />

                <label>Last Name</label>
                <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                    }
                    required
                />

                <label>Age</label>
                <input
                    type="number"
                    min="2"
                    max="7"
                    value={formData.age}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, age: e.target.value }))
                    }
                    required
                />

                <label>Car Number</label>
                <input
                    type="text"
                    value={formData.carNumber}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, carNumber: e.target.value }))
                    }
                    required
                />

                <p style={{ marginTop: "10px", fontSize: "0.9rem", color: "#666" }}>
                    Division will be calculated automatically:{" "}
                    <strong>{getDivisionFromAge(formData.age || 0)}</strong>
                </p>
            </Modal>
        </Layout>
    );
};

export default RacersManagement;