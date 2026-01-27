// frontend/src/pages/RacersManagement.js
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import apiClient from "../utils/apiClient";
import "../styles/RacersManagement.css";
import DeleteRacerConfirmModal from "../components/DeleteRacerConfirmModal";

const getDivisionFromAge = (ageRaw) => {
    const age = Number(ageRaw);
    if (age === 2 || age === 3) return "3 Year Old Division";
    if (age === 4) return "4 Year Old Division";
    if (age === 5) return "5 Year Old Division";
    if (age === 6 || age === 7) return "Snack Pack Division";
    return "N/A";
};

// ✅ Guardian Email helper (safe fallbacks)
const getGuardianEmail = (racer) => {
    return (
        racer?.guardianEmail ||     // if you add this later
        racer?.parentEmail ||       // common flat property
        racer?.parent?.email ||     // nested parent object
        racer?.guardian?.email ||   // nested guardian object (future-proof)
        "-"
    );
};

const RacersManagement = () => {
    const [racers, setRacers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [racerToDelete, setRacerToDelete] = useState(null);

    const emptyForm = {
        id: null,
        firstName: "",
        lastName: "",
        nickname: "",
        age: "",
        carNumber: "",
    };

    const [formData, setFormData] = useState(emptyForm);

    const fetchRacers = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await apiClient.get("/racers");
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

    const openDeleteRacer = (racer) => {
        setRacerToDelete(racer);
        setDeleteModalOpen(true);
    };

    const confirmDeleteRacer = async (racerId) => {
        try {
            await apiClient.delete(`/racers/${racerId}`);
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
            nickname: racer.nickname || "",
            age: racer.age ?? "",
            carNumber: racer.carNumber || "",
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        const payload = {
            firstName: (formData.firstName || "").trim(),
            lastName: (formData.lastName || "").trim(),
            nickname: (formData.nickname || "").trim() || null,
            age: Number(formData.age),
            carNumber: String(formData.carNumber || "").trim(),
            division: getDivisionFromAge(formData.age || 0),
        };

        if (!payload.firstName || !payload.lastName || !payload.age || !payload.carNumber) {
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
            const msg = err?.response?.data?.message || "❌ Failed to save racer.";
            alert(typeof msg === "string" ? msg : "❌ Failed to save racer.");
        }
    };

    const racerToDeleteName = racerToDelete
        ? `${racerToDelete.firstName || ""} ${racerToDelete.lastName || ""}`.trim()
        : "this racer";

    return (
        <Layout title="Racers Management">
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
                    <div className="table-scroll" role="region" aria-label="Racers table" tabIndex={0}>
                        <table className="racers-table">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Nickname</th>
                                <th>Age</th>
                                <th>Division</th>
                                <th>Car #</th>
                                <th>Guardian Email</th>
                                <th style={{ minWidth: 160 }}>Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {racers.map((racer, index) => (
                                <tr key={racer.id}>
                                    <td>{index + 1}</td>

                                    <td>
                                        {racer.firstName} {racer.lastName}
                                    </td>

                                    <td>{racer.nickname || "-"}</td>

                                    <td>{racer.age}</td>

                                    <td>{getDivisionFromAge(racer.age)}</td>

                                    <td>{racer.carNumber}</td>

                                    {/* ✅ NEW: Guardian Email cell */}
                                    <td className="guardian-email-cell" title={getGuardianEmail(racer)}>
                                        {getGuardianEmail(racer)}
                                    </td>

                                    {/* ✅ Actions cell */}
                                    <td>
                                        <button className="edit-btn" onClick={() => handleOpenEdit(racer)}>
                                            Edit
                                        </button>
                                        <button className="delete-btn" onClick={() => openDeleteRacer(racer)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal
                title={editMode ? "Edit Racer" : "Add Racer"}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSave}
                submitLabel={editMode ? "Update Racer" : "Add Racer"}
            >
                <label htmlFor="firstName">First Name</label>
                <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                    required
                />

                <label htmlFor="lastName">Last Name</label>
                <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                    required
                />

                <label htmlFor="nickname">Nickname (optional)</label>
                <input
                    id="nickname"
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nickname: e.target.value }))}
                    placeholder="Optional"
                />

                <label htmlFor="age">Age</label>
                <input
                    id="age"
                    type="number"
                    min="2"
                    max="7"
                    value={formData.age}
                    onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                    required
                />

                <label htmlFor="carNumber">Car Number</label>
                <input
                    id="carNumber"
                    type="text"
                    value={formData.carNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, carNumber: e.target.value }))}
                    required
                />

                <p className="division-note">
                    Division will be calculated automatically:{" "}
                    <strong>{getDivisionFromAge(formData.age || 0)}</strong>
                </p>
            </Modal>
        </Layout>
    );
};

export default RacersManagement;