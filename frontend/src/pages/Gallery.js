// frontend/src/pages/Gallery.js
import React, { useEffect, useState } from "react";
import "../styles/Gallery.css";
import apiClient from "../utils/apiClient";

const Gallery = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadPhotos = async () => {
            try {
                setLoading(true);
                setError("");

                const res = await apiClient.get("/photos"); // GET /api/photos
                setPhotos(res.data || []);
            } catch (err) {
                console.error("Error loading photos:", err);
                setError("Could not load gallery photos. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadPhotos();
    }, []);

    const formatUploadedDate = (uploadedAt) => {
        if (!uploadedAt) return "";
        // uploadedAt will look like "2025-11-14T20:31:00"
        const [datePart] = uploadedAt.split("T");
        const date = new Date(datePart);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }); // e.g. "14 Mar 2026"
    };

    return (
        <div className="gallery-container">
            <h1>📸  Race Gallery  📸</h1>
            <p>Browse photos from our past events and relive the fun!</p>

            {loading && <p className="loading">Loading photos...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && !error && photos.length === 0 && (
                <p>No photos have been uploaded yet. Check back soon!</p>
            )}

            {!loading && !error && photos.length > 0 && (
                <div className="photo-grid">
                    {photos.map((photo) => (
                        <div key={photo.id} className="gallery-card">
                            <img
                                src={photo.imageUrl}
                                alt={photo.title || "Race photo"}
                                className="gallery-photo"
                            />
                            <div className="gallery-meta">
                                {photo.title && <h3>{photo.title}</h3>}
                                {photo.caption && <p>{photo.caption}</p>}
                                {photo.uploadedAt && (
                                    <p className="uploaded-date">
                                        Uploaded: {formatUploadedDate(photo.uploadedAt)}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Gallery;