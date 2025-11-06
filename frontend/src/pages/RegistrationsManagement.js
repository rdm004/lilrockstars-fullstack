import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import "../styles/RegistrationsManagement.css";

const RegistrationsManagement = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        racer: "",
        parent: "",
        race: "",
        status: "Pending",
    });

    useEffect(() => {
        // TODO: Replace with real backend API call
        const mockRegistrations = [
            { id: 1, racer: "Liam Johnson", parent: "Sarah Johnson", race: "Peoria Cup", status: "Confirmed" },
            { id: 2, racer: "Olivia Brown", parent: "Tom Brown", race: "Rockford Sprint", status: "Pending" },
            { id: 3, racer: "Noah Williams", parent: "Amy Williams", race: "State Finals", status: "Confirmed" },
        ];

        setTimeout(() => {
            setRegistrations(mockRegistrations);
            setLoading(false);
        }, 600);
    }, []);

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this registration?")) {
            setRegistrations(registrations.filter((r) => r.id !== id));
        }
    };

    const handleOpenAdd = () => {
        setEditMode(false);
        setFormData({
            id: null,
            racer: "",
            parent: "",
            race: "",
            status: "Pending",
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (registration) => {
        setEditMode(true);
        setFormData(registration);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.racer || !formData.parent || !formData.race) {
            alert("Please fill out all fields.");
            return;
        }

        if (editMode) {
            setRegistrations(
                registrations.map((r) =>
                    r.id === formData.id ? formData : r
                )
            );
        } else {
            const newRegistration = { ...formData, id: Date.now() };
            setRegistrations([...registrations, newRegistration]);
        }

        setIsModalOpen(false);
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
                    <span
                        className={`status-badge ${
                            reg.status.toLowerCase() === "confirmed"
                                ? "confirmed"
                                : "pending"
                        }`}
                    >
                      {reg.status}
                    </span>
                                </td>
                                <td>
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleOpenEdit(reg)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(reg.id)}
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
                </select>
            </Modal>
        </Layout>
    );
};

export default RegistrationsManagement;