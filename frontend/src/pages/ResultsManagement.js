import React, { useState } from "react";
import Layout from "../components/Layout";
// import "../styles/ResultsManagement.css";
// import apiClient from "../utils/apiClient"; // 🔒 use later when wiring to backend

const ResultsManagement = () => {
    // For now: mock data only (local state)
    const [results, setResults] = useState([
        {
            id: 1,
            raceName: "Spring Opener 2026",
            raceDate: "2026-03-14",
            division: "3 Year Old Division",
            racerName: "Liam Johnson",
            placement: 1,
        },
        {
            id: 2,
            raceName: "Spring Opener 2026",
            raceDate: "2026-03-14",
            division: "4 Year Old Division",
            racerName: "Noah Williams",
            placement: 1,
        },
    ]);

    const emptyForm = {
        id: null,
        raceName: "",
        raceDate: "",
        division: "",
        racerName: "",
        placement: "",
    };

    const [formVisible, setFormVisible] = useState(false);
    const [editingResult, setEditingResult] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddClick = () => {
        setEditingResult(null);
        setForm(emptyForm);
        setFormVisible(true);
    };

    const handleEdit = (result) => {
        setEditingResult(result);
        setForm(result);
        setFormVisible(true);
    };

    const handleDelete = (id) => {
        if (!window.confirm("Delete this result?")) return;
        setResults((prev) => prev.filter((r) => r.id !== id));

        // 🔒 later: await apiClient.delete(`/results/${id}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.raceName || !form.raceDate || !form.division || !form.racerName || !form.placement) {
            alert("Please fill in all fields.");
            return;
        }

        if (editingResult) {
            // update existing
            setResults((prev) =>
                prev.map((r) => (r.id === editingResult.id ? { ...editingResult, ...form } : r))
            );

            // 🔒 later:
            // await apiClient.put(`/results/${editingResult.id}`, form);
        } else {
            const newResult = {
                ...form,
                id: Date.now(),
            };
            setResults((prev) => [...prev, newResult]);

            // 🔒 later:
            // const res = await apiClient.post("/results", form);
            // setResults(prev => [...prev, res.data]);
        }

        setFormVisible(false);
        setEditingResult(null);
        setForm(emptyForm);
    };

    return (
        <Layout title="Results Management">
            <div className="results-page">
                <div className="results-header">
                    <h2>Race Results</h2>
                    <button className="btn-primary" onClick={handleAddClick}>
                        {formVisible ? "Close Form" : "Add Result"}
                    </button>
                </div>

                {formVisible && (
                    <form className="results-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <input
                                type="text"
                                name="raceName"
                                placeholder="Race Name"
                                value={form.raceName}
                                onChange={handleChange}
                                required
                            />
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
                            <input
                                type="text"
                                name="division"
                                placeholder="Division"
                                value={form.division}
                                onChange={handleChange}
                                required
                            />
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
                                placeholder="Placement (1–3)"
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
            </div>
        </Layout>
    );
};

export default ResultsManagement;