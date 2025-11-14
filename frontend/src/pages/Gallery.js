// frontend/src/pages/Gallery.js
import React, { useEffect, useState } from "react";
import "../styles/Gallery.css";
import apiClient from "../utils/apiClient";

const Gallery = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        setError("");

        apiClient
            .get("/photos")
            .then((res) => {
                const list = res.data || [];

                // newest first based on uploadedAt if available
                const sorted = [...list].sort((a, b) => {
                    if (!a.uploadedAt || !b.uploadedAt) return 0;
                    return new Date(b.uploadedAt) - new Date(a.uploadedAt);
                });

                setPhotos(sorted);
            })
            .catch((err) => {
                console.error("Error loading photos:", err);
                setError("Could not load photos. Please try again later.");
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="gallery-container">
            <h1>📸  Race Gallery  📸</h1>
            <p>Browse photos from our past events and relive the fun!</p>

            {loading && <p className="loading">Loading photos...</p>}
            {error && <p className="error-text">{error}</p>}

            {!loading && !error && photos.length === 0 && (
                <p>No photos have been uploaded yet. Check back soon!</p>
            )}

            {!loading && !error && photos.length > 0 && (
                <div className="event-gallery">
                    <h2>All Photos</h2>
                    <div className="photo-grid">
                        {photos.map((photo) => (
                            <div key={photo.id} className="photo-wrapper">
                                <img
                                    src={photo.imageUrl}
                                    alt={photo.title || photo.caption || "Race photo"}
                                    className="gallery-photo"
                                />
                                {(photo.title || photo.caption) && (
                                    <p className="photo-caption">
                                        {photo.title || photo.caption}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;