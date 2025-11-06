import React, { useState, useEffect } from "react";
import "../styles/Results.css";
import apiClient from "../utils/apiClient";

const Results = () => {
    const [results, setResults] = useState([]);
    const [selectedRace, setSelectedRace] = useState("All");

    useEffect(() => {
        // 🧪 Mock data kept for reference / fallback
        // const mockResults = [
        //     {
        //         race: "Pumpkin Town ThrowDown",
        //         date: "2025-10-11",
        //         results: [
        //             { name: "Liam Johnson", division: "3 Year Old Division", placement: 1 },
        //             { name: "Ava Martinez", division: "3 Year Old Division", placement: 2 },
        //             { name: "Noah Williams", division: "4 Year Old Division", placement: 1 },
        //             { name: "Olivia Brown", division: "5 Year Old Division", placement: 1 },
        //             { name: "Ethan Davis", division: "Snack Pack Division", placement: 1 },
        //             { name: "Lucas White", division: "Snack Pack Division", placement: 2 },
        //         ],
        //     },
        //     {
        //         race: "The Gobbler Gitty Up!",
        //         date: "2025-11-01",
        //         results: [
        //             { name: "Noah King", division: "3 Year Old Division", placement: 1 },
        //             { name: "Liam Johnson", division: "3 Year Old Division", placement: 2 },
        //             { name: "Liam Stone", division: "4 Year Old Division", placement: 1 },
        //             { name: "Noah Williams", division: "4 Year Old Division", placement: 2 },
        //             { name: "Mia Fox", division: "5 Year Old Division", placement: 1 },
        //             { name: "Olivia Brown", division: "5 Year Old Division", placement: 2 },
        //             { name: "Ethan Davis", division: "Snack Pack Division", placement: 1 },
        //             { name: "Lucas White", division: "Snack Pack Division", placement: 2 },
        //         ],
        //     },
        // ];
        // setResults(mockResults);

        apiClient
            .get("/results") // -> http://localhost:8080/api/results
            .then((res) => {
                const flat = res.data; // [{ raceName, raceDate, racerName, division, placement }, ...]

                const grouped = {};

                flat.forEach((row) => {
                    const key = row.raceName;

                    if (!grouped[key]) {
                        grouped[key] = {
                            race: row.raceName,
                            date: row.raceDate,
                            results: [],
                        };
                    }

                    grouped[key].results.push({
                        name: row.racerName,
                        division: row.division,
                        placement: row.placement,
                    });
                });

                setResults(Object.values(grouped));
            })
            .catch((err) => {
                console.error("Error loading results:", err);
                // Optional: fallback to mockResults here if you want
                // setResults(mockResults);
            });
    }, []);

    const races = ["All", ...results.map((r) => r.race)];

    const filteredResults =
        selectedRace === "All"
            ? results
            : results.filter((r) => r.race === selectedRace);

    const divisions = [
        "3 Year Old Division",
        "4 Year Old Division",
        "5 Year Old Division",
        "Snack Pack Division",
    ];

    // 🏆 Championship Points Calculation
    const calculatePoints = () => {
        const pointsTable = { 1: 13, 2: 10, 3: 8 };

        const totals = {};

        results.forEach((race) => {
            race.results.forEach((r) => {
                const pts = pointsTable[r.placement] || 1; // 4th+ gets 1 point
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

        // Sort racers within each division
        const standings = {};
        divisions.forEach((div) => {
            const racers = Object.values(totals).filter((r) => r.division === div);
            standings[div] = racers.sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.wins !== a.wins) return b.wins - a.wins;
                if (b.seconds !== a.seconds) return b.seconds - a.seconds;
                if (b.thirds !== a.thirds) return b.thirds - a.thirds;
                return b.races - a.races;
            });
        });

        return standings;
    };

    const standings = calculatePoints();

    // ⬇️ ...your existing JSX stays the same from here down
    return (
        <div className="results-container">
            <h1>🏎️  Race Results  🏎️ <br/> & <br/>🏁 Championship Standings  🏁</h1>
            <p>Track results by race and see who’s leading the championship!</p>

            {/* Filter */}
            <div className="filter-section">
                <label>Filter by Race:</label>
                <select
                    value={selectedRace}
                    onChange={(e) => setSelectedRace(e.target.value)}
                >
                    {races.map((race, idx) => (
                        <option key={idx} value={race}>
                            {race}
                        </option>
                    ))}
                </select>
            </div>

            {/* 🏆 Championship Standings Section */}
            {/* ... (leave all your existing standings + race results JSX as-is) */}
            {/* I’m not repeating it here to keep this answer short. */}
        </div>
    );
};

export default Results;