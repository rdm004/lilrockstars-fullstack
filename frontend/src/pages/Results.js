// frontend/src/pages/Results.js
import React, { useEffect, useMemo, useState } from "react";
import "../styles/Results.css";
import apiClient from "../utils/apiClient";

const divisions = [
    "3 Year Old Division",
    "4 Year Old Division",
    "5 Year Old Division",
    "Snack Pack Division",
];

const Results = () => {
    const [results, setResults] = useState([]); // grouped: [{ race, date, results:[{name,division,placement}] }]
    const [selectedRace, setSelectedRace] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError("");

                const res = await apiClient.get("/results"); // GET /api/results
                const flat = res.data || [];

                // Group by raceName
                const grouped = {};
                flat.forEach((row) => {
                    const key = row.raceName || "Unknown Race";

                    if (!grouped[key]) {
                        grouped[key] = {
                            race: row.raceName || "Unknown Race",
                            date: row.raceDate || "",
                            results: [],
                        };
                    }

                    grouped[key].results.push({
                        name: row.racerName,
                        division: row.division,
                        placement: row.placement,
                    });

                    // keep latest date if multiple rows have it
                    if (row.raceDate && (!grouped[key].date || new Date(row.raceDate) > new Date(grouped[key].date))) {
                        grouped[key].date = row.raceDate;
                    }
                });

                // Sort races by date desc (newest first)
                const groupedArr = Object.values(grouped).sort((a, b) => {
                    const da = a.date ? new Date(a.date) : 0;
                    const db = b.date ? new Date(b.date) : 0;
                    return db - da;
                });

                // Sort each race's results by division then placement
                groupedArr.forEach((race) => {
                    race.results.sort((a, b) => {
                        if (a.division !== b.division) return a.division.localeCompare(b.division);
                        return (a.placement ?? 999) - (b.placement ?? 999);
                    });
                });

                setResults(groupedArr);
            } catch (err) {
                console.error("Error loading results:", err);
                setError("Could not load results. Please try again later.");
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

    // 🏆 Championship Points Calculation
    const standings = useMemo(() => {
        const pointsTable = { 1: 13, 2: 10, 3: 8 };
        const totals = {};

        results.forEach((race) => {
            race.results.forEach((r) => {
                if (!r?.division || !r?.name) return;

                const pts = pointsTable[r.placement] ?? 1;
                const key = `${r.division}|||${r.name}`;

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

        const byDivision = {};
        divisions.forEach((div) => {
            const racers = Object.values(totals).filter((x) => x.division === div);
            byDivision[div] = racers.sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.wins !== a.wins) return b.wins - a.wins;
                if (b.seconds !== a.seconds) return b.seconds - a.seconds;
                if (b.thirds !== a.thirds) return b.thirds - a.thirds;
                return b.races - a.races;
            });
        });

        return byDivision;
    }, [results]);

    const formatRaceDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    };

    return (
        <div className="results-container">
            <h1>
                🏎️ Race Results 🏎️ <br /> & <br /> 🏁 Championship Standings 🏁
            </h1>
            <p>Track results by race and see who’s leading the championship!</p>

            {loading && <p className="loading">Loading results...</p>}
            {error && <p className="error">{error}</p>}

            {!loading && !error && (
                <>
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

                    {/* 🏆 Standings */}
                    <section className="standings-section">
                        <h2>🏆 Championship Standings</h2>

                        {divisions.map((div) => (
                            <div key={div} className="division-block">
                                <h3>{div}</h3>

                                {(!standings[div] || standings[div].length === 0) ? (
                                    <p>No standings yet.</p>
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
                                        {standings[div].map((r, idx) => (
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
                    </section>

                    {/* 🏁 Race Results */}
                    <section className="race-results-section">
                        <h2>🏁 Race Results</h2>

                        {filteredResults.length === 0 ? (
                            <p>No race results found.</p>
                        ) : (
                            filteredResults.map((race) => (
                                <div key={race.race} className="race-block">
                                    <h3>{race.race}</h3>
                                    {race.date && <p className="race-date">{formatRaceDate(race.date)}</p>}

                                    <table className="results-table">
                                        <thead>
                                        <tr>
                                            <th>Division</th>
                                            <th>Placement</th>
                                            <th>Racer</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {race.results.map((r, idx) => (
                                            <tr key={`${race.race}-${idx}-${r.name}`}>
                                                <td>{r.division}</td>
                                                <td>{r.placement}</td>
                                                <td>{r.name}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default Results;