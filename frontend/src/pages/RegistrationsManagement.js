// frontend/src/pages/RegistrationsManagement.js
import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import apiClient from "../utils/apiClient";
import "../styles/RegistrationsManagement.css";

const EMPTY_FORM = {
    id: null,
    racerId: "",
    raceId: "",
    status: "Pending",
};

const RegistrationsManagement = () => {
    const [registrations, setRegistrations] = useState([]);
    const [racers, setRacers] = useState([]);
    const [races, setRaces] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);

    // -------- helpers --------
    const badgeClass = (status) => {
        const s = String(status || "").toLowerCase();
        if (s === "confirmed" || s === "approved") return "confirmed";
        if (s === "rejected") return "rejected";
        if (s === "canceled" || s === "cancelled") return "canceled";
        return "pending";
    };

    const formatRaceDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
        });
    };

    const getRacerDisplay = (r) => {
        const first = r?.firstName || "";
        const last = r?.lastName || "";
        const name = `${first} ${last}`.trim();
        return name || r?.name || `Racer #${r?.id ?? "?"}`;
    };

    const getRaceDisplay = (race) => {
        const name = race?.raceName || race?.name || "Unknown Race";
        const date = race?.raceDate ? ` (${formatRaceDate(race.raceDate)})` : "";
        return `${name}${date}`;
    };

    // maps for quick lookup
    const racersById = useMemo(() => {
        const m = new Map();
        (racers || []).forEach((r) => m.set(Number(r.id), r));
        return m;
    }, [racers]);

    const racesById = useMemo(() => {
        const m = new Map();
        (races || []).forEach((r) => m.set(Number(r.id), r));
        return m;
    }, [races]);

    // -------- fetch everything --------
    const fetchAll = async () => {
        try {
            setLoading(true);
            setError("");

            // Pull all three in parallel
            const [regsRes, racersRes, racesRes] = await Promise.all([
                apiClient.get("/admin/registrations"), // ✅ admin list (DB)
                apiClient.get("/racers"),              // ✅ racers list (DB)
                apiClient.get("/races"),               // ✅ races list (DB)
            ]);

            setRacers(racersRes.data || []);
            setRaces(racesRes.data || []);

            // Normalize registrations regardless of backend shape
            const raw = regsRes.data || [];
            const normalized = raw.map((row) => {
                // If backend returns nested entity:
                const nestedRacerId = row?.racer?.id;
                const nestedRaceId = row?.race?.id;

                return {
                    id: row.id,
                    racerId: row.racerId ?? nestedRacerId ?? row.racer_id ?? "",
                    raceId: row.raceId ?? nestedRaceId ?? row.race_id ?? "",
                    status: row.status ?? "Pending",

                    // Optional display fields if your backend already sends them:
                    racerName: row.racerName ?? row.racer_name ?? null,
                    parentName: row.parentName ?? row.parent_name ?? null,
                    parentEmail: row.parentEmail ?? row.parent_email ?? null,
                    raceName: row.raceName ?? row.race_name ?? null,
                    raceDate: row.raceDate ?? row.race_date ?? null,
                };
            });

            setRegistrations(normalized);
        } catch (err) {
            console.error("Error loading registrations:", err);
            setError("Could not load registrations. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchAll();
    }, []);

    // -------- CRUD --------
    const handleOpenAdd = () => {
        setEditMode(false);
        setFormData(EMPTY_FORM);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (reg) => {
        setEditMode(true);
        setFormData({
            id: reg.id,
            racerId: String(reg.racerId ?? ""),
            raceId: String(reg.raceId ?? ""),
            status: reg.status || "Pending",
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this registration?")) return;

        try {
            await apiClient.delete(`/admin/registrations/${id}`);
            setRegistrations((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            console.error("Error deleting registration:", err);
            alert("❌ Failed to delete registration.");
        }
    };

    const handleSave = async () => {
        const racerIdNum = Number(formData.racerId);
        const raceIdNum = Number(formData.raceId);

        if (!racerIdNum || !raceIdNum) {
            alert("Please select a Racer and a Race.");
            return;
        }

        const payload = {
            racerId: racerIdNum,
            raceId: raceIdNum,
            status: formData.status || "Pending",
        };

        try {
            if (editMode && formData.id) {
                // Many systems only allow status updates after creation.
                // If your backend requires full payload, keep payload as-is.
                await apiClient.put(`/admin/registrations/${formData.id}`, payload);
            } else {
                await apiClient.post("/admin/registrations", payload);
            }

            setIsModalOpen(false);
            setFormData(EMPTY_FORM);
            setEditMode(false);
            void fetchAll();
        } catch (err) {
            console.error("Error saving registration:", err);
            alert("❌ Failed to save registration.");
        }
    };

    // -------- UI derived rows --------
    const rowsForTable = useMemo(() => {
        return (registrations || []).map((reg) => {
            const racer = racersById.get(Number(reg.racerId));
            const race = racesById.get(Number(reg.raceId));

            const racerName =
                reg.racerName ||
                (racer ? getRacerDisplay(racer) : `Racer #${reg.racerId || "?"}`);

            const parentEmail =
                reg.parentEmail ||
                racer?.parentEmail ||
                racer?.parent?.email ||
                "";

            const raceName =
                reg.raceName ||
                (race ? (race.raceName || race.name) : `Race #${reg.raceId || "?"}`);

            const raceDate =
                reg.raceDate ||
                race?.raceDate ||
                "";

            return {
                ...reg,
                _racerName: racerName,
                _parentEmail: parentEmail,
                _raceName: raceName,
                _raceDate: raceDate,
            };
        });
    }, [registrations, racersById, racesById]);

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
                ) : rowsForTable.length === 0 ? (
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
                        {rowsForTable.map((reg, index) => (
                            <tr key={reg.id}>
                                <td>{index + 1}</td>
                                <td>{reg._racerName}</td>
                                <td>{reg._parentEmail || "-"}</td>
                                <td>
                                    {reg._raceName}
                                    {reg._raceDate ? (
                                        <span style={{ color: "#666" }}>
                        {" "}
                                            ({formatRaceDate(reg._raceDate)})
                      </span>
                                    ) : null}
                                </td>
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

            {/* Modal */}
            <Modal
                title={editMode ? "Edit Registration" : "Add Registration"}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSave}
                submitLabel={editMode ? "Update Registration" : "Add Registration"}
            >
                <label>Racer</label>
                <select
                    value={formData.racerId}
                    onChange={(e) => setFormData((p) => ({ ...p, racerId: e.target.value }))}
                    required
                >
                    <option value="">-- Select Racer --</option>
                    {racers.map((r) => (
                        <option key={r.id} value={r.id}>
                            {getRacerDisplay(r)} {r?.carNumber ? `(#${r.carNumber})` : ""}{" "}
                            {r?.age ? `- Age ${r.age}` : ""}
                        </option>
                    ))}
                </select>

                <label>Race</label>
                <select
                    value={formData.raceId}
                    onChange={(e) => setFormData((p) => ({ ...p, raceId: e.target.value }))}
                    required
                >
                    <option value="">-- Select Race --</option>
                    {races
                        .slice()
                        .sort((a, b) => new Date(a.raceDate || 0) - new Date(b.raceDate || 0))
                        .map((race) => (
                            <option key={race.id} value={race.id}>
                                {getRaceDisplay(race)}
                            </option>
                        ))}
                </select>

                <label>Status</label>
                <select
                    value={formData.status}
                    onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Canceled">Canceled</option>
                </select>

                <p style={{ marginTop: "10px", fontSize: "0.85rem", color: "#666" }}>
                    Tip: For a real-world flow, set new registrations to <b>Pending</b> and confirm after review.
                </p>
            </Modal>
        </Layout>
    );
};

export default RegistrationsManagement;