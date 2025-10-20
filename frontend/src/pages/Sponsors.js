import React, { useEffect, useState } from "react";
import apiClient from "../utils/apiClient";

function Sponsors() {
    const [sponsors, setSponsors] = useState([]);

    useEffect(() => {
        apiClient.get("/api/sponsors").then((res) => setSponsors(res.data));
    }, []);

    return (
        <div className="page-container">
            <h1>Our Sponsors 🤝</h1>
            <div className="sponsor-grid">
                {sponsors.map((sponsor) => (
                    <div key={sponsor.id} className="sponsor-card">
                        <img src={sponsor.logoUrl} alt={sponsor.name} width="150" />
                        <h3>{sponsor.name}</h3>
                        <p>{sponsor.description}</p>
                        <a href={sponsor.website} target="_blank" rel="noreferrer">
                            Visit Website
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Sponsors;