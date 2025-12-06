// frontend/src/pages/GalleryManagement.js
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import apiClient from "../utils/apiClient";
// import "../styles/GalleryManagement.css";

const emptyForm = {
    id: null,
    title: "",
    caption: "",
    imageUrl: "", // optional manual URL if no file chosen
};

const GalleryManagement = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPhoto, setEditingPhoto] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [file, setFile] = useState(null);

    useEffect(() => {
        const loadPhotos = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get("/photos");
                setPhotos(res.data || []);
                setError("");
            } catch (err) {
                console.error("Error loading photos:", err);
                setError("Could not load photos.");
            } finally {
                setLoading(false);
            }
        };

        loadPhotos();
    }, []);

    const openAddModal = () => {
        setEditingPhoto(null);
        setForm(emptyForm);
        setFile(null);
        setIsModalOpen(true);
    };

    const openEditModal = (photo) => {
        setEditingPhoto(photo);
        setForm({
            id: photo.id,
            title: photo.title || "",
            caption: photo.caption || "",
            imageUrl: photo.imageUrl || "",
        });
        setFile(null); // editing existing: keep URL unless they upload new file
        setIsModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const chosen = e.target.files?.[0] || null;
        setFile(chosen);
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

        try {
            if (!editingPhoto) {
                // ➕ ADD NEW
                let savedPhoto;

                if (file) {
                    // 📤 Upload file via /photos/upload
                    const data = new FormData();
                    data.append("file", file);
                    data.append("title", form.title);
                    data.append("caption", form.caption || "");

                    const res = await apiClient.post("/photos/upload", data, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });
                    savedPhoto = res.data;
                } else {
                    // Fallback: manual URL only
                    const res = await apiClient.post("/photos", {
                        title: form.title,
                        caption: form.caption,
                        imageUrl: form.imageUrl,
                    });
                    savedPhoto = res.data;
                }

                setPhotos((prev) => [...prev, savedPhoto]);
            } else {
                // ✏️ EDIT EXISTING
                let updatedPayload = {
                    title: form.title,
                    caption: form.caption,
                    imageUrl: form.imageUrl,
                };

                if (file) {
                    // If they upload a new file while editing, upload and replace URL
                    const data = new FormData();
                    data.append("file", file);
                    data.append("title", form.title);
                    data.append("caption", form.caption || "");

                    const resUpload = await apiClient.post("/photos/upload", data, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });

                    // re-use URL from upload result
                    updatedPayload.imageUrl = resUpload.data.imageUrl;
                }

                const res = await apiClient.put(`/photos/${editingPhoto.id}`, updatedPayload);
                const updated = res.data;

                setPhotos((prev) =>
                    prev.map((p) => (p.id === editingPhoto.id ? updated : p))
                );
            }

            setIsModalOpen(false);
            setEditingPhoto(null);
            setForm(emptyForm);
            setFile(null);
        } catch (err) {
            console.error("Error saving photo:", err);
            alert("Failed to save photo. Please try again.");
        }
    };

    return (
        <Layout title="Gallery Management">
            <div className="gallery-admin-page">
                <div className="gallery-admin-header">
                    <h2>Gallery Management</h2>
                    <button className="add-btn" onClick={openAddModal}>
                        + Add Photo
                    </button>
                </div>

                {loading && <p>Loading photos...</p>}
                {error && <p className="error">{error}</p>}

                {!loading && !error && (
                    <div className="gallery-grid-admin">
                        {photos.length === 0 ? (
                            <p>No photos added yet.</p>
                        ) : (
                            photos.map((photo) => (
                                <div key={photo.id} className="gallery-card-admin">
                                    <img src={photo.imageUrl} alt={photo.title || "Race"} />
                                    <div className="gallery-card-body">
                                        <div className="gallery-card-title">{photo.title}</div>
                                        {photo.caption && (
                                            <div className="gallery-card-caption">
                                                {photo.caption}
                                            </div>
                                        )}
                                        <div className="gallery-card-actions">
                                            <button
                                                className="btn-edit"
                                                onClick={() => openEditModal(photo)}
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
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Modal for Add/Edit Photo */}
            <Modal
                title={editingPhoto ? "Edit Photo" : "Add Photo"}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                submitLabel={editingPhoto ? "Update Photo" : "Save Photo"}
            >
                <label>Title</label>
                <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                />

                <label>Caption (optional)</label>
                <textarea
                    name="caption"
                    value={form.caption}
                    onChange={handleChange}
                    rows={3}
                />

                <label>Upload Image</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                />

                <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.4rem" }}>
                    If you prefer, you can paste an existing image URL instead:
                </p>
                <input
                    type="text"
                    name="imageUrl"
                    placeholder="https://..."
                    value={form.imageUrl}
                    onChange={handleChange}
                />
            </Modal>
        </Layout>
    );
};

export default GalleryManagement;