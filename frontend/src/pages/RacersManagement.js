// frontend/src/pages/RacersManagement.js
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import apiClient from "../utils/apiClient";
import "../styles/RacersManagement.css";
import DeleteRacerConfirmModal from "../components/DeleteRacerConfirmModal";

const DIVISIONS = {
    THREE: "3 Year Old Division",
    FOUR: "4 Year Old Division",
    FIVE: "5 Year Old Division",
    SNACK: "Snack Pack Division",
    STINGERS: "Lil Stingers",
};

const getDivisionFromAge = (ageRaw) => {
    const age = Number(ageRaw);

    if (age === 2 || age === 3) return DIVISIONS.THREE;
    if (age === 4) return DIVISIONS.FOUR;
    if (age === 5) return DIVISIONS.FIVE;
    if (age === 6) return DIVISIONS.SNACK;

    // ✅ default for age 7 if admin doesn’t choose
    if (age === 7) return DIVISIONS.SNACK;

    // ✅ ages 8–9 must be Lil Stingers
    if (age === 8 || age === 9) return DIVISIONS.STINGERS;

    return "N/A";
};

const getDivisionForSave = (ageRaw, selectedDivisionRaw) => {
    const age = Number(ageRaw);
    const selected = (selectedDivisionRaw || "").trim();

    // Age 7: allow Snack Pack OR Lil Stingers
    if (age === 7) {
        if (selected === DIVISIONS.STINGERS) return DIVISIONS.STINGERS;
        return DIVISIONS.SNACK; // default
    }

    // Age 8–9: force Lil Stingers
    if (age === 8 || age === 9) return DIVISIONS.STINGERS;

    // Under 7: force computed (and prevents stingers)
    return getDivisionFromAge(age);
};

// ✅ Guardian Email helper (safe fallbacks)
const getGuardianEmail = (racer) => {
    return (
        racer?.parentEmail ||      // AdminRacersController returns this
        racer?.guardianEmail ||    // future-proof
        racer?.parent?.email ||    // if you ever return nested parent
        racer?.guardian?.email ||  // future-proof
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
        guardianEmail: "", // ✅ ADMIN ONLY (required on Add)
        firstName: "",
        lastName: "",
        nickname: "",
        age: "",
        carNumber: "",
        division: "", // ✅ NEW (only used when age === 7)
    };

    const [formData, setFormData] = useState(emptyForm);

    // ✅ ADMIN: load racers from admin endpoint
    const fetchRacers = async () => {
        try {
            setLoading(true);
            setError("");

            // returns RacerSearchDto: { id, firstName, lastName, carNumber, age, parentEmail }
            const res = await apiClient.get("/admin/racers");
            setRacers(res.data || []);
        } catch (err) {
            console.error("Error loading admin racers:", err);
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

    // ✅ ADMIN: delete via admin endpoint
    const confirmDeleteRacer = async (racerId) => {
        try {
            await apiClient.delete(`/admin/racers/${racerId}`);
            void fetchRacers();
        } catch (err) {
            console.error("Error deleting racer:", err);
            const msg = err?.response?.data?.message || "❌ Failed to delete racer.";
            alert(typeof msg === "string" ? msg : "❌ Failed to delete racer.");
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
            guardianEmail: getGuardianEmail(racer) === "-" ? "" : getGuardianEmail(racer),
            firstName: racer.firstName || "",
            lastName: racer.lastName || "",
            nickname: racer.nickname || "",
            age: racer.age ?? "",
            carNumber: racer.carNumber || "",
            division: racer.division || "", // ✅ NEW
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        const ageNum = Number(formData.age);

        const base = {
            firstName: (formData.firstName || "").trim(),
            lastName: (formData.lastName || "").trim(),
            nickname: (formData.nickname || "").trim(),
            age: ageNum,
            carNumber: String(formData.carNumber || "").trim(),
            division: getDivisionForSave(ageNum, formData.division), // ✅ NEW
        };

        if (!base.firstName || !base.lastName || !base.age || !base.carNumber) {
            alert("Please fill out First Name, Last Name, Age, and Car Number.");
            return;
        }

        // ✅ guardrails (UI) — backend will also enforce
        if (ageNum < 7 && base.division === DIVISIONS.STINGERS) {
            alert("Under age 7 cannot be in Lil Stingers.");
            return;
        }
        if ((ageNum === 8 || ageNum === 9) && base.division !== DIVISIONS.STINGERS) {
            alert("Age 8–9 must be in Lil Stingers.");
            return;
        }
        if (ageNum === 7 && ![DIVISIONS.SNACK, DIVISIONS.STINGERS].includes(base.division)) {
            alert("Age 7 must be Snack Pack or Lil Stingers.");
            return;
        }

        try {
            if (editMode && formData.id) {
                await apiClient.put(`/admin/racers/${formData.id}`, { ...base });
            } else {
                const guardianEmail = (formData.guardianEmail || "").trim().toLowerCase();
                if (!guardianEmail) {
                    alert("Guardian Email is required when adding a racer as admin.");
                    return;
                }

                await apiClient.post("/admin/racers", {
                    guardianEmail,
                    ...base,
                });
            }

            setIsModalOpen(false);
            setFormData(emptyForm);
            void fetchRacers();
        } catch (err) {
            console.error("Error saving racer:", err);
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                "❌ Failed to save racer.";
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

                                    <td>{racer.age}</td>

                                    <td>{racer.division || getDivisionFromAge(racer.age)}</td>

                                    <td>{racer.carNumber}</td>

                                    <td className="guardian-email-cell" title={getGuardianEmail(racer)}>
                                        {getGuardianEmail(racer)}
                                    </td>

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
                {/* ✅ Only show Guardian Email on ADD.
                    On edit, show it read-only (optional), but don't allow changing ownership. */}
                {!editMode ? (
                    <>
                        <label htmlFor="guardianEmail">Guardian Email</label>
                        <input
                            id="guardianEmail"
                            type="email"
                            value={formData.guardianEmail}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, guardianEmail: e.target.value }))
                            }
                            placeholder="guardian@example.com"
                            required
                        />
                        <p className="help-note">
                            Must match an existing registered account. This links the racer to that guardian.
                        </p>
                    </>
                ) : (
                    <>
                        <label htmlFor="guardianEmail">Guardian Email</label>
                        <input
                            id="guardianEmail"
                            type="email"
                            value={formData.guardianEmail || ""}
                            readOnly
                            className="read-only"
                        />
                        <p className="help-note">
                            Guardian ownership can’t be changed here.
                        </p>
                    </>
                )}

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
                    max="9"
                    value={formData.age}
                    onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                    required
                />
                {Number(formData.age) === 7 ? (
                    <>
                        <label htmlFor="division">Division</label>
                        <select
                            id="division"
                            value={getDivisionForSave(formData.age, formData.division)}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, division: e.target.value }))
                            }
                            required
                        >
                            <option value={DIVISIONS.SNACK}>Snack Pack Division</option>
                            <option value={DIVISIONS.STINGERS}>Lil Stingers</option>
                        </select>

                        <p className="help-note">
                            Age 7 may choose Snack Pack or Lil Stingers.
                        </p>
                    </>
                ) : null}

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
                    <strong>{getDivisionForSave(formData.age || 0, formData.division)}</strong>
                </p>
            </Modal>
        </Layout>
    );
};

export default RacersManagement;