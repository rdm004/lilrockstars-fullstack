import React, { useState } from "react";
import "../styles/Gallery.css";
import "react-image-lightbox/style.css";
import Lightbox from "react-image-lightbox";

const Gallery = () => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [currentImages, setCurrentImages] = useState([]);

    // Mock event galleries
    const galleryData = [
        {
            event: "Pumpkin Town ThrowDown",
            date: "October 11, 2025",
            images: [
                "/images/pumpkin1.jpg",
                "/images/pumpkin2.jpg",
                "/images/pumpkin3.jpg",
                "/images/pumpkin4.jpg",
            ],
        },
        {
            event: "The Gobbler Gitty Up!",
            date: "November 1, 2025",
            images: [
                "/images/gobbler1.jpg",
                "/images/gobbler2.jpg",
                "/images/gobbler3.jpg",
            ],
        },
    ];

    const openLightbox = (images, index) => {
        setCurrentImages(images);
        setPhotoIndex(index);
        setLightboxOpen(true);
    };

    return (
        <div className="gallery-container">
            <h1>📸  Race Gallery  📸</h1>
            <p>Browse photos from our past events and relive the fun!</p>

            {galleryData.map((event, idx) => (
                <div key={idx} className="event-gallery">
                    <h2>{event.event}</h2>
                    <p className="event-date">{event.date}</p>
                    <div className="photo-grid">
                        {event.images.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt={`${event.event} ${index + 1}`}
                                className="gallery-photo"
                                onClick={() => openLightbox(event.images, index)}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {lightboxOpen && (
                <Lightbox
                    mainSrc={currentImages[photoIndex]}
                    nextSrc={currentImages[(photoIndex + 1) % currentImages.length]}
                    prevSrc={
                        currentImages[
                        (photoIndex + currentImages.length - 1) % currentImages.length
                            ]
                    }
                    onCloseRequest={() => setLightboxOpen(false)}
                    onMovePrevRequest={() =>
                        setPhotoIndex(
                            (photoIndex + currentImages.length - 1) % currentImages.length
                        )
                    }
                    onMoveNextRequest={() =>
                        setPhotoIndex((photoIndex + 1) % currentImages.length)
                    }
                />
            )}
        </div>
    );
};

export default Gallery;