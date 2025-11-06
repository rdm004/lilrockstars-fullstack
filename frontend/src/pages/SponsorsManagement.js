import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import "../styles/SponsorsManagement.css";

const SponsorsManagement = () => {
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        name: "",
        contact: "",
        email: "",
        city: "",
    });

    useEffect(() => {
        // TODO: Replace with backend call later
        const mockSponsors = [
            { id: 1, name: "Speedy Tires", contact: "John Smith", email: "john@speedy.com", city: "Peoria" },
            { id: 2, name: "GoFast Motors", contact: "Emily Johnson", email: "emily@gofast.com", city: "Rockford" },
            { id: 3, name: "Junior Gear", contact: "Mike Davis", email: "mike@juniorgear.com", city: "Springfield" },
        ];

        setTimeout(() => {
            setSponsors(mockSponsors);
            setLoading(false);
        }, 600);
    }, []);

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this sponsor?")) {
            setSponsors(sponsors.filter((s) => s.id !== id));
        }
    };

    const handleOpenAdd = () => {
        setEditMode(false);
        setFormData({ id: null, name: "", contact: "", email: "", city: "" });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (sponsor) => {
        setEditMode(true);
        setFormData(sponsor);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.contact || !formData.email || !formData.city) {
            alert("Please fill out all fields.");
            return;
        }

        if (editMode) {
            setSponsors(sponsors.map((s) => (s.id === formData.id ? formData : s)));
        } else {
            const newSponsor = { ...formData, id: Date.now() };
            setSponsors([...sponsors, newSponsor]);
        }

        setIsModalOpen(false);
    };

    return (
        <Layout title="Sponsors Management">
            <div className="sponsors-container">
                <div className="sponsors-header">
                    <h1>Sponsors Management</h1>
                    <button className="add-btn" onClick={handleOpenAdd}>
                        + Add Sponsor
                    </button>
                </div>

                {loading ? (
                    <p className="loading">Loading sponsors...</p>
                ) : sponsors.length === 0 ? (
                    <p>No sponsors found.</p>
                ) : (
                    <table className="sponsors-table">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Company</th>
                            <th>Contact</th>
                            <th>Email</th>
                            <th>City</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sponsors.map((sponsor, index) => (
                            <tr key={sponsor.id}>
                                <td>{index + 1}</td>
                                <td>{sponsor.name}</td>
                                <td>{sponsor.contact}</td>
                                <td>{sponsor.email}</td>
                                <td>{sponsor.city}</td>
                                <td>
                                    <button className="edit-btn" onClick={() => handleOpenEdit(sponsor)}>
                                        Edit
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(sponsor.id)}
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

            {/* 🧱 Reusable Modal */}
            <Modal
                title={editMode ? "Edit Sponsor" : "Add Sponsor"}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSave}
                submitLabel={editMode ? "Update Sponsor" : "Add Sponsor"}
            >
                <label>Company Name</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />

                <label>Contact Person</label>
                <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    required
                />

                <label>Email</label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

export default SponsorsManagement;