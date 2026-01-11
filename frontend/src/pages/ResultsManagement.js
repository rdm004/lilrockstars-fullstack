import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import apiClient from "../utils/apiClient";
import "../styles/ResultsManagement.css";

const DIVISIONS = [
    "3 Year Old Division",
    "4 Year Old Division",
    "5 Year Old Division",
    "Snack Pack Division",
];

const emptyForm = {
    id: null,
    raceName: "",
    raceDate: "",
    division: "",
    racerName: "",
    placement: "",
};

const ResultsManagement = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [formVisible, setFormVisible] = useState(false);
    const [editingResult, setEditingResult] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const fetchResults = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await apiClient.get("/results"); // GET /api/results
            const data = res.data || [];

            // Normalize so the UI doesn't break if field names vary slightly
            const normalized = data.map((row) => ({
                id: row.id,
                raceName: row.raceName ?? row.race ?? "",
                raceDate: row.raceDate ?? row.date ?? "",
                division: row.division ?? "",
                racerName: row.racerName ?? row.name ?? "",
                placement: Number(row.placement),
            }));

            // Sort: newest race first, then division, then placement
            normalized.sort((a, b) => {
                const da = a.raceDate ? new Date(a.raceDate) : 0;
                const db = b.raceDate ? new Date(b.raceDate) : 0;
                if (db - da !== 0) return db - da;
                if ((a.raceName || "").localeCompare(b.raceName || "") !== 0)
                    return (a.raceName || "").localeCompare(b.raceName || "");
                if ((a.division || "").localeCompare(b.division || "") !== 0)
                    return (a.division || "").localeCompare(b.division || "");
                return a.placement - b.placement;
            });

            setResults(normalized);
        } catch (err) {
            console.error("Error loading results:", err);
            setError("Could not load results. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchResults();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddClick = () => {
        setEditingResult(null);
        setForm(emptyForm);
        setFormVisible((v) => !v);
    };

    const handleEdit = (result) => {
        setEditingResult(result);
        setForm({
            id: result.id,
            raceName: result.raceName || "",
            raceDate: result.raceDate || "",
            division: result.division || "",
            racerName: result.racerName || "",
            placement: result.placement ?? "",
        });
        setFormVisible(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this result?")) return;

        try {
            await apiClient.delete(`/results/${id}`);
            // optimistic remove
            setResults((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            console.error("Error deleting result:", err);
            alert("❌ Failed to delete result.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            raceName: form.raceName?.trim(),
            raceDate: form.raceDate,
            division: form.division,
            racerName: form.racerName?.trim(),
            placement: Number(form.placement),
        };

        if (
            !payload.raceName ||
            !payload.raceDate ||
            !payload.division ||
            !payload.racerName ||
            !payload.placement
        ) {
            alert("Please fill in all fields.");
            return;
        }

        if (payload.placement < 1) {
            alert("Placement must be 1 or higher.");
            return;
        }

        try {
            if (editingResult?.id) {
                await apiClient.put(`/results/${editingResult.id}`, payload);
            } else {
                await apiClient.post("/results", payload);
            }

            setFormVisible(false);
            setEditingResult(null);
            setForm(emptyForm);

            // Refresh from DB so you stay in sync
            void fetchResults();
        } catch (err) {
            console.error("Error saving result:", err);
            alert("❌ Failed to save result.");
        }
    };

    // Optional: build drop-down lists from DB values
    const raceOptions = useMemo(() => {
        const map = new Map(); // raceName -> raceDate
        results.forEach((r) => {
            if (r.raceName && r.raceDate && !map.has(r.raceName)) map.set(r.raceName, r.raceDate);
        });
        return Array.from(map.entries()).map(([name, date]) => ({ name, date }));
    }, [results]);

    return (
        <Layout title="Results Management">
            <div className="results-page">
                <div className="results-header">
                    <h2>Race Results</h2>
                    <button className="btn-primary" onClick={handleAddClick}>
                        {formVisible ? "Close Form" : "Add Result"}
                    </button>
                </div>

                {loading && <p className="loading">Loading results...</p>}
                {error && <p className="error">{error}</p>}

                {formVisible && (
                    <form className="results-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            {/* Race Name (typed or from dropdown) */}
                            <div style={{ flex: 1 }}>
                                <input
                                    type="text"
                                    name="raceName"
                                    placeholder="Race Name"
                                    value={form.raceName}
                                    onChange={handleChange}
                                    list="raceNames"
                                    required
                                />
                                <datalist id="raceNames">
                                    {raceOptions.map((r) => (
                                        <option key={r.name} value={r.name} />
                                    ))}
                                </datalist>
                            </div>

                            <input
                                type="date"
                                name="raceDate"
                                placeholder="Race Date"
                                value={form.raceDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            {/* Division dropdown (prevents typos breaking standings) */}
                            <select name="division" value={form.division} onChange={handleChange} required>
                                <option value="">Select Division</option>
                                {DIVISIONS.map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="text"
                                name="racerName"
                                placeholder="Racer Name"
                                value={form.racerName}
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="number"
                                min="1"
                                name="placement"
                                placeholder="Placement (1+)"
                                value={form.placement}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-save">
                            {editingResult ? "Update Result" : "Save Result"}
                        </button>
                    </form>
                )}

                {!loading && !error && (
                    <table className="results-table">
                        <thead>
                        <tr>
                            <th>Race</th>
                            <th>Date</th>
                            <th>Division</th>
                            <th>Racer</th>
                            <th>Placement</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {results.length === 0 ? (
                            <tr>
                                <td colSpan="6">No results yet.</td>
                            </tr>
                        ) : (
                            results.map((r) => (
                                <tr key={r.id}>
                                    <td>{r.raceName}</td>
                                    <td>{r.raceDate}</td>
                                    <td>{r.division}</td>
                                    <td>{r.racerName}</td>
                                    <td>{r.placement}</td>
                                    <td>
                                        <button className="btn-edit" onClick={() => handleEdit(r)}>
                                            Edit
                                        </button>
                                        <button className="btn-delete" onClick={() => handleDelete(r.id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                )}
            </div>
        </Layout>
    );
};

export default ResultsManagement;