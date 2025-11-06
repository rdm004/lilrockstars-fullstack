import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal"; // ✅ reusable modal
import "../styles/RacersManagement.css";

const RacersManagement = () => {
    const [racers, setRacers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        name: "",
        age: "",
        division: "",
        city: "",
    });

    useEffect(() => {
        // TODO: Replace with backend API call later
        const mockRacers = [
            { id: 1, name: "Liam Johnson", age: 3, division: "3 Year Old Division", city: "Rockford" },
            { id: 2, name: "Ava Martinez", age: 4, division: "4 Year Old Division", city: "Peoria" },
            { id: 3, name: "Noah Williams", age: 5, division: "5 Year Old Division", city: "Springfield" },
            { id: 4, name: "Olivia Brown", age: 6, division: "Snack Pack Division", city: "Champaign" },
            { id: 5, name: "Ethan Davis", age: 7, division: "Snack Pack Division", city: "Bloomington" },
        ];

        setTimeout(() => {
            setRacers(mockRacers);
            setLoading(false);
        }, 600);
    }, []);

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this racer?")) {
            setRacers(racers.filter((r) => r.id !== id));
        }
    };

    const handleOpenAdd = () => {
        setEditMode(false);
        setFormData({ id: null, name: "", age: "", division: "", city: "" });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (racer) => {
        setEditMode(true);
        setFormData(racer);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        const age = parseInt(formData.age);
        let division = "";

        if (age === 3) division = "3 Year Old Division";
        else if (age === 4) division = "4 Year Old Division";
        else if (age === 5) division = "5 Year Old Division";
        else if (age >= 6 && age <= 7) division = "Snack Pack Division";
        else division = "N/A";

        const updatedRacer = { ...formData, age, division };

        if (editMode) {
            setRacers(
                racers.map((r) => (r.id === formData.id ? updatedRacer : r))
            );
        } else {
            setRacers([
                ...racers,
                { ...updatedRacer, id: Date.now() },
            ]);
        }

        setIsModalOpen(false);
    };

    return (
        <Layout title="Racers Management">
            <div className="racers-container">
                <div className="racers-header">
                    <h1>Racers Management</h1>
                    <button className="add-btn" onClick={handleOpenAdd}>
                        + Add Racer
                    </button>
                </div>

                {loading ? (
                    <p className="loading">Loading racers...</p>
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
                            <th>City</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {racers.map((racer, index) => (
                            <tr key={racer.id}>
                                <td>{index + 1}</td>
                                <td>{racer.name}</td>
                                <td>{racer.age}</td>
                                <td>{racer.division}</td>
                                <td>{racer.city}</td>
                                <td>
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleOpenEdit(racer)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(racer.id)}
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

            {/* ✅ Reusable Modal */}
            <Modal
                title={editMode ? "Edit Racer" : "Add Racer"}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSave}
                submitLabel={editMode ? "Update Racer" : "Add Racer"}
            >
                <label>Name</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />

                <label>Age</label>
                <input
                    type="number"
                    min="3"
                    max="7"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    required
                />

                <label>City</label>
                <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                />
            </Modal>
        </Layout>
    );
};

export default RacersManagement;