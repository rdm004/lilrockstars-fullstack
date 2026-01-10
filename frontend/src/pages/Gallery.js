// frontend/src/pages/Gallery.js
import React, { useState } from "react";
import "../styles/Gallery.css";
import GalleryData from "../data/GalleryData";
import "../styles/Shared-Buttons.css"


const Gallery = () => {
    const [activeImage, setActiveImage] = useState(null);

    return (
        <div className="gallery-container">
            <h1>📸 Race Gallery 📸</h1>

            <div className="gallery-fb">
                <p>
                    For the latest photos check out our Facebook!
                </p>
                <a
                    href="https://www.facebook.com/profile.php?id=100091910351052"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="facebook-button"
                >
                    <div className="facebook-icon-container">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            className="facebook-icon"
                        >
                            <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.325v21.351C0 23.4.6 24
      1.325 24H12.82V14.706h-3.17v-3.622h3.17V8.413c0-3.13 1.91-4.832
      4.7-4.832 1.34 0 2.493.099 2.829.144v3.28l-1.942.001c-1.524
      0-1.819.724-1.819 1.787v2.344h3.637l-.474 3.622h-3.163V24h6.203
      C23.4 24 24 23.4 24 22.675V1.325C24 .6 23.4 0 22.675 0z" />
                        </svg>
                    </div>
                    Lil Rockstars
                </a>
            </div>

            <div className="event-gallery">
                <h2>Lil Rockstars</h2>

                <div className="photo-grid">
                    {GalleryData.map((photo) => (
                        <img
                            key={photo.id}
                            src={photo.imageUrl}
                            alt={photo.title}
                            className="gallery-photo"
                            onClick={() => setActiveImage(photo.imageUrl)}
                        />
                    ))}
                </div>
            </div>

            {/* ✅ LIGHTBOX */}
            {activeImage && (
                <div className="lightbox" onClick={() => setActiveImage(null)}>
                    <img src={activeImage} alt="Enlarged race" />
                </div>
            )}
        </div>
    );
};

export default Gallery;