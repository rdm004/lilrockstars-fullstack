// frontend/src/pages/GalleryManagement.js
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import "../styles/AdminGallery.css"; // 👈 use the CSS you showed earlier
import apiClient from "../utils/apiClient";

const GalleryManagement = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const emptyForm = {
        id: null,
        title: "",
        imageUrl: "",
        caption: "",
    };

    const [formVisible, setFormVisible] = useState(false);
    const [editingPhoto, setEditingPhoto] = useState(null);
    const [form, setForm] = useState(emptyForm);

    // 🔄 Load photos from backend
    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await apiClient.get("/photos"); // → /api/photos on backend
                setPhotos(res.data || []);
            } catch (err) {
                console.error("Error loading photos:", err);
                setError("Unable to load gallery photos.");
            } finally {
                setLoading(false);
            }
        };

        fetchPhotos();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddClick = () => {
        setEditingPhoto(null);
        setForm(emptyForm);
        setFormVisible(true);
    };

    const handleEdit = (photo) => {
        setEditingPhoto(photo);
        setForm({
            id: photo.id,
            title: photo.title || "",
            imageUrl: photo.imageUrl || "",
            caption: photo.caption || "",
        });
        setFormVisible(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this photo?")) return;

        try {
            await apiClient.delete(`/photos/${id}`);
            setPhotos((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            console.error("Error deleting photo:", err);
            alert("Failed to delete photo.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title || !form.imageUrl) {
            alert("Please at least provide a title and image URL.");
            return;
        }

        try {
            if (editingPhoto && form.id != null) {
                // ✏️ Update existing
                const res = await apiClient.put(`/photos/${form.id}`, {
                    title: form.title,
                    imageUrl: form.imageUrl,
                    caption: form.caption,
                });

                setPhotos((prev) =>
                    prev.map((p) => (p.id === form.id ? res.data : p))
                );
            } else {
                // ➕ Create new
                const res = await apiClient.post("/photos", {
                    title: form.title,
                    imageUrl: form.imageUrl,
                    caption: form.caption,
                });

                setPhotos((prev) => [...prev, res.data]);
            }

            setFormVisible(false);
            setEditingPhoto(null);
            setForm(emptyForm);
        } catch (err) {
            console.error("Error saving photo:", err);
            alert("Failed to save photo.");
        }
    };

    return (
        <Layout title="Gallery Management">
            <div className="gallery-admin-page">
                <div className="gallery-admin-header">
                    <h2>Gallery</h2>
                    <button className="btn-primary" onClick={handleAddClick}>
                        {formVisible ? "Close Form" : "Add Photo"}
                    </button>
                </div>

                {loading && <p>Loading photos...</p>}
                {error && <p>{error}</p>}

                {formVisible && (
                    <form className="gallery-admin-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="title"
                            placeholder="Photo Title / Event"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="imageUrl"
                            placeholder="Image URL"
                            value={form.imageUrl}
                            onChange={handleChange}
                            required
                        />
                        <textarea
                            name="caption"
                            placeholder="Caption (optional)"
                            value={form.caption}
                            onChange={handleChange}
                            rows={3}
                        />
                        <button type="submit" className="btn-save">
                            {editingPhoto ? "Update Photo" : "Save Photo"}
                        </button>
                    </form>
                )}

                <div className="gallery-grid-admin">
                    {!loading && !error && photos.length === 0 && (
                        <p>No photos added yet.</p>
                    )}

                    {photos.map((photo) => (
                        <div key={photo.id} className="gallery-card-admin">
                            <img
                                src={photo.imageUrl}
                                alt={photo.title || "Gallery photo"}
                            />
                            <div className="gallery-card-body">
                                <div className="gallery-card-title">
                                    {photo.title || "(Untitled Photo)"}
                                </div>
                                {photo.caption && (
                                    <div className="gallery-card-caption">
                                        {photo.caption}
                                    </div>
                                )}
                                {/* Optional: show uploadedAt if backend returns it */}
                                {photo.uploadedAt && (
                                    <div className="gallery-card-meta">
                                        Uploaded: {new Date(photo.uploadedAt).toLocaleString()}
                                    </div>
                                )}
                                <div className="gallery-card-actions">
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleEdit(photo)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(photo.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default GalleryManagement;