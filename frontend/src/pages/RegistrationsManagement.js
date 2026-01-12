// frontend/src/pages/RegistrationsManagement.js
import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import apiClient from "../utils/apiClient";
import "../styles/RegistrationsManagement.css";

const RegistrationsManagement = () => {
    const [rows, setRows] = useState([]); // flat rows from admin endpoint
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchAdminRegistrations = async () => {
        try {
            setLoading(true);
            setError("");

            // ✅ apiClient baseURL already includes "/api"
            const res = await apiClient.get("/admin/registrations");
            setRows(res.data || []);
        } catch (err) {
            console.error("Error loading admin registrations:", err);
            setError("Could not load registrations. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchAdminRegistrations();
    }, []);

    const formatRaceDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
        });
    };

    // Group rows by race so admin sees: Race -> Racers list
    const groupedByRace = useMemo(() => {
        const map = new Map();

        (rows || []).forEach((r) => {
            const key = String(r.raceId || r.raceName || "unknown");

            if (!map.has(key)) {
                map.set(key, {
                    raceId: r.raceId,
                    raceName: r.raceName || "Unknown Race",
                    raceDate: r.raceDate || null,
                    racers: [],
                });
            }

            map.get(key).racers.push(r);
        });

        // Sort races newest first
        const grouped = Array.from(map.values()).sort((a, b) => {
            const da = a.raceDate ? new Date(a.raceDate) : 0;
            const db = b.raceDate ? new Date(b.raceDate) : 0;
            return db - da;
        });

        // Sort racers inside each race (division, last, first)
        grouped.forEach((race) => {
            race.racers.sort((a, b) => {
                const divA = (a.racerDivision || "").toLowerCase();
                const divB = (b.racerDivision || "").toLowerCase();
                if (divA !== divB) return divA.localeCompare(divB);

                const lastA = (a.racerLastName || "").toLowerCase();
                const lastB = (b.racerLastName || "").toLowerCase();
                if (lastA !== lastB) return lastA.localeCompare(lastB);

                const firstA = (a.racerFirstName || "").toLowerCase();
                const firstB = (b.racerFirstName || "").toLowerCase();
                return firstA.localeCompare(firstB);
            });
        });

        return grouped;
    }, [rows]);

    const handleUnregister = async (registrationId) => {
        if (!window.confirm("Unregister this racer from this race?")) return;

        try {
            await apiClient.delete(`/admin/registrations/${registrationId}`);
            setRows((prev) => prev.filter((x) => x.registrationId !== registrationId));
        } catch (err) {
            console.error("Error deleting registration:", err);
            alert("❌ Failed to unregister racer.");
        }
    };

    return (
        <Layout title="Registrations Management">
            <div className="registrations-container">
                <div className="registrations-header">
                    <h1>Registrations (Admin)</h1>
                    <p>View each race and see which racers are registered.</p>
                </div>

                {loading && <p className="loading">Loading registrations...</p>}
                {error && <p className="error">{error}</p>}

                {!loading && !error && groupedByRace.length === 0 && (
                    <p>No registrations found.</p>
                )}

                {!loading &&
                    !error &&
                    groupedByRace.map((race) => (
                        <div key={race.raceId || race.raceName} className="race-reg-block">
                            <div className="race-reg-header">
                                <h2 className="race-title">{race.raceName}</h2>
                                {race.raceDate && (
                                    <p className="race-date">{formatRaceDate(race.raceDate)}</p>
                                )}
                            </div>

                            <table className="registrations-table">
                                <thead>
                                <tr>
                                    <th>Racer</th>
                                    <th>Car #</th>
                                    <th>Division</th>
                                    <th>Age</th>
                                    <th>Parent Email</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>

                                <tbody>
                                {race.racers.map((r) => (
                                    <tr key={r.registrationId}>
                                        <td>
                                            {r.racerFirstName} {r.racerLastName}
                                        </td>
                                        <td>{r.carNumber || "-"}</td>
                                        <td>{r.racerDivision || "-"}</td>
                                        <td>{r.racerAge ?? "-"}</td>
                                        <td>{r.parentEmail || "-"}</td>
                                        <td>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleUnregister(r.registrationId)}
                                            >
                                                Unregister
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {race.racers.length === 0 && (
                                    <tr>
                                        <td colSpan="6">No racers registered for this race.</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    ))}
            </div>
        </Layout>
    );
};

export default RegistrationsManagement;