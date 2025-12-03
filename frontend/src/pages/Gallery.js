// frontend/src/pages/Gallery.js
import React, { useEffect, useState } from "react";
import "../styles/Gallery.css";
import apiClient from "../utils/apiClient";

const Gallery = () => {
    const [events, setEvents] = useState([]); // [{ event, date, images: [url] }]
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadPhotos = async () => {
            try {
                setLoading(true);
                setError("");

                // Hits /api/photos on the backend
                const res = await apiClient.get("/photos");
                const photos = res.data || [];

                const eventMap = {};
                photos.forEach((photo) => {
                    const title = photo.title || "Untitled Event";
                    const uploadedAt = photo.uploadedAt || null;

                    if (!eventMap[title]) {
                        eventMap[title] = {
                            event: title,
                            date: uploadedAt,
                            images: [],
                        };
                    }

                    // keep the newest uploadedAt as the event date
                    if (
                        uploadedAt &&
                        (!eventMap[title].date ||
                            new Date(uploadedAt) > new Date(eventMap[title].date))
                    ) {
                        eventMap[title].date = uploadedAt;
                    }

                    if (photo.imageUrl) {
                        eventMap[title].images.push(photo.imageUrl);
                    }
                });

                const groupedEvents = Object.values(eventMap).sort((a, b) => {
                    if (!a.date && !b.date) return 0;
                    if (!a.date) return 1;
                    if (!b.date) return -1;
                    return new Date(b.date) - new Date(a.date);
                });

                setEvents(groupedEvents);
            } catch (err) {
                console.error("Error loading gallery photos:", err);
                setError("Unable to load gallery right now. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadPhotos();
    }, []);

    const formatEventDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="gallery-container">
            <h1>📸  Race Gallery  📸</h1>
            <p>Browse photos from our past events and relive the fun!</p>

            {loading && <p className="loading">Loading gallery...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && !error && events.length === 0 && (
                <p>No photos have been uploaded yet.</p>
            )}

            {events.map((event, idx) => (
                <div key={idx} className="event-gallery">
                    <h2>{event.event}</h2>
                    {event.date && (
                        <p className="event-date">{formatEventDate(event.date)}</p>
                    )}
                    <div className="photo-grid">
                        {event.images.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt={`${event.event} ${index + 1}`}
                                className="gallery-photo"
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Gallery;