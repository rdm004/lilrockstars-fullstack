import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import "../styles/SponsorsManagement.css";
import apiClient from "../utils/apiClient";

const SponsorsManagement = () => {
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const [formData, setFormData] = useState({
        id: null,
        name: "",
        website: "",
        description: "",
        logoUrl: "",   // <-- URL string
    });

    useEffect(() => {
        const loadSponsors = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get("/sponsors");
                setSponsors(res.data || []);
            } catch (err) {
                console.error("Error loading sponsors:", err);
            } finally {
                setLoading(false);
            }
        };
        loadSponsors();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this sponsor?")) return;
        try {
            await apiClient.delete(`/sponsors/${id}`);
            setSponsors((prev) => prev.filter((s) => s.id !== id));
        } catch (err) {
            console.error("Error deleting sponsor:", err);
        }
    };

    const handleOpenAdd = () => {
        setEditMode(false);
        setFormData({ id: null, name: "", website: "", description: "", logoUrl: "" });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (sponsor) => {
        setEditMode(true);
        setFormData({
            id: sponsor.id,
            name: sponsor.name || "",
            website: sponsor.website || "",
            description: sponsor.description || "",
            logoUrl: sponsor.logoUrl || "",
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            alert("Please provide a sponsor name.");
            return;
        }

        try {
            let saved;
            if (editMode && formData.id) {
                const res = await apiClient.put(`/sponsors/${formData.id}`, formData);
                saved = res.data;
            } else {
                const res = await apiClient.post("/sponsors", formData);
                saved = res.data;
            }

            setSponsors((prev) => {
                const exists = prev.some((s) => s.id === saved.id);
                return exists
                    ? prev.map((s) => (s.id === saved.id ? saved : s))
                    : [...prev, saved];
            });

            setIsModalOpen(false);
        } catch (err) {
            console.error("Error saving sponsor:", err);
            alert("Error saving sponsor.");
        }
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
                            <th>Logo</th>
                            <th>Company</th>
                            <th>Website</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sponsors.map((sponsor, index) => (
                            <tr key={sponsor.id}>
                                <td>{index + 1}</td>
                                <td>
                                    {sponsor.logoUrl ? (
                                        <img
                                            src={sponsor.logoUrl}
                                            alt={sponsor.name}
                                            className="admin-sponsor-logo"
                                        />
                                    ) : (
                                        <span className="no-logo">No logo</span>
                                    )}
                                </td>
                                <td>{sponsor.name}</td>
                                <td>
                                    {sponsor.website ? (
                                        <a
                                            href={sponsor.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {sponsor.website}
                                        </a>
                                    ) : (
                                        "-"
                                    )}
                                </td>
                                <td>{sponsor.description}</td>
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
                    onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                    }
                    required
                />

                <label>Website</label>
                <input
                    type="text"
                    value={formData.website}
                    onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                    }
                />

                <label>Description</label>
                <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                    }
                />

                <label>Logo URL</label>
                <input
                    type="text"
                    placeholder="https://..."
                    value={formData.logoUrl}
                    onChange={(e) =>
                        setFormData({ ...formData, logoUrl: e.target.value })
                    }
                />
                {formData.logoUrl && (
                    <div className="logo-preview">
                        <p>Preview:</p>
                        <img
                            src={formData.logoUrl}
                            alt={formData.name}
                            className="admin-sponsor-logo"
                        />
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default SponsorsManagement;