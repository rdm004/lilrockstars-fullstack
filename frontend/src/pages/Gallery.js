// frontend/src/pages/Gallery.js
import React from "react";
import "../styles/Gallery.css";
import GalleryData from "../data/GalleryData";

const Gallery = () => {
    return (
        <div className="gallery-container">
            <h1>📸 Race Gallery 📸</h1>
            <p>Photos from Lil Rockstars Racing events</p>

            <div className="event-gallery">
                <h2>Lil Rockstars Racing</h2>

                <div className="photo-grid">
                    {GalleryData.map((photo) => (
                        <img
                            key={photo.id}
                            src={photo.imageUrl}
                            alt={photo.title}
                            className="gallery-photo"
                            loading="lazy"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Gallery;