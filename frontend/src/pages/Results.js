import React, { useState, useEffect, useMemo } from "react";
import "../styles/Results.css";
import apiClient from "../utils/apiClient";

const DIVISIONS = [
    "3 Year Old Division",
    "4 Year Old Division",
    "5 Year Old Division",
    "Snack Pack Division",
];

const Results = () => {
    const [results, setResults] = useState([]); // [{ race, date, results: [{name, division, placement}] }]
    const [selectedRace, setSelectedRace] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError("");

                const res = await apiClient.get("/results");
                const flat = res.data || [];

                // Group by raceName
                const grouped = {};
                flat.forEach((row) => {
                    const key = row.raceName || "Unknown Race";

                    if (!grouped[key]) {
                        grouped[key] = {
                            race: row.raceName || "Unknown Race",
                            date: row.raceDate || null,
                            results: [],
                        };
                    }

                    grouped[key].results.push({
                        name: row.racerName,
                        division: row.division,
                        placement: Number(row.placement),
                    });
                });

                // Sort results by placement inside each race
                const racesArr = Object.values(grouped).map((raceObj) => ({
                    ...raceObj,
                    results: (raceObj.results || [])
                        .slice()
                        .sort((a, b) => a.placement - b.placement),
                }));

                // Sort races by date desc (newest first)
                racesArr.sort((a, b) => {
                    const da = a.date ? new Date(a.date) : 0;
                    const db = b.date ? new Date(b.date) : 0;
                    if (db - da !== 0) return db - da;
                    return (a.race || "").localeCompare(b.race || "");
                });

                setResults(racesArr);
            } catch (err) {
                console.error("Error loading results:", err);
                setError("Unable to load results right now. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, []);

    const races = useMemo(() => ["All", ...results.map((r) => r.race)], [results]);

    const filteredResults = useMemo(() => {
        return selectedRace === "All"
            ? results
            : results.filter((r) => r.race === selectedRace);
    }, [results, selectedRace]);

    const formatRaceDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const standings = useMemo(() => {
        const pointsTable = { 1: 13, 2: 10, 3: 8 };
        const totals = {};

        results.forEach((race) => {
            (race.results || []).forEach((r) => {
                const pts = pointsTable[r.placement] ?? 1;
                const key = `${r.division}-${r.name}`;

                if (!totals[key]) {
                    totals[key] = {
                        name: r.name,
                        division: r.division,
                        points: 0,
                        races: 0,
                        wins: 0,
                        seconds: 0,
                        thirds: 0,
                    };
                }

                totals[key].points += pts;
                totals[key].races += 1;
                if (r.placement === 1) totals[key].wins += 1;
                if (r.placement === 2) totals[key].seconds += 1;
                if (r.placement === 3) totals[key].thirds += 1;
            });
        });

        const out = {};
        DIVISIONS.forEach((div) => {
            const racers = Object.values(totals).filter((r) => r.division === div);
            out[div] = racers.sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.wins !== a.wins) return b.wins - a.wins;
                if (b.seconds !== a.seconds) return b.seconds - a.seconds;
                if (b.thirds !== a.thirds) return b.thirds - a.thirds;
                return b.races - a.races;
            });
        });

        return out;
    }, [results]);

    return (
        <div className="results-container">
            <h1>
                🏆 Championship Standings 🏆 <br /> & <br /> 🏁 Race Results 🏁
            </h1>
            <p>Track results by race and see who’s leading the championship!</p>

            {/* Filter */}
            <div className="filter-section">
                <label>Filter by Race:</label>
                <select value={selectedRace} onChange={(e) => setSelectedRace(e.target.value)}>
                    {races.map((race, idx) => (
                        <option key={idx} value={race}>
                            {race}
                        </option>
                    ))}
                </select>
            </div>

            {loading && <p className="loading">Loading results...</p>}
            {error && <p className="error">{error}</p>}

            {/* ✅ CHAMPIONSHIP STANDINGS (2 columns) */}
            {!loading && !error && (
                <section className="championship-standings">
                    <h2>🏆 Championship Standings 🏆</h2>

                    <div className="standings-grid">
                        {DIVISIONS.map((div) => (
                            <div key={div} className="division-block">
                                <h3>{div}</h3>

                                {!standings[div] || standings[div].length === 0 ? (
                                    <p className="no-results">No standings yet.</p>
                                ) : (
                                    <table className="standings-table">
                                        <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Racer</th>
                                            <th>Points</th>
                                            <th>Races</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {standings[div].slice(0, 10).map((r, idx) => (
                                            <tr key={`${div}-${r.name}`}>
                                                <td>{idx + 1}</td>
                                                <td>{r.name}</td>
                                                <td>{r.points}</td>
                                                <td>{r.races}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ✅ RACE RESULTS (2 columns per race) */}
            {!loading && !error && (
                <section className="race-results-section">
                    <h2>🏁 Race Results 🏁</h2>

                    {filteredResults.length === 0 ? (
                        <p className="no-results">No results yet.</p>
                    ) : (
                        filteredResults.map((race) => {
                            const byDivision = {};
                            DIVISIONS.forEach((d) => (byDivision[d] = []));

                            (race.results || []).forEach((r) => {
                                if (!byDivision[r.division]) byDivision[r.division] = [];
                                byDivision[r.division].push(r);
                            });

                            Object.keys(byDivision).forEach((d) => {
                                byDivision[d].sort((a, b) => a.placement - b.placement);
                            });

                            return (
                                <div key={race.race} className="race-block">
                                    <h3>{race.race}</h3>
                                    {race.date && <p className="race-date">{formatRaceDate(race.date)}</p>}

                                    <div className="race-division-grid">
                                        {DIVISIONS.map((div) => (
                                            <div key={`${race.race}-${div}`} className="race-division-block">
                                                <h4 style={{ textAlign: "center", margin: "0 0 0.75rem" }}>{div}</h4>

                                                {!byDivision[div] || byDivision[div].length === 0 ? (
                                                    <p className="no-results">No results in this division.</p>
                                                ) : (
                                                    <table className="results-table-clean">
                                                        <thead>
                                                        <tr>
                                                            <th>Place</th>
                                                            <th>Racer</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {byDivision[div].map((row) => (
                                                            <tr key={`${race.race}-${div}-${row.placement}-${row.name}`}>
                                                                <td>{row.placement}</td>
                                                                <td>{row.name}</td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </section>
            )}
        </div>
    );
};

export default Results;


