import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import apiClient from "../utils/apiClient";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import "../styles/AdminDashboard.css";

// Register Chart.js modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Division mapping (matches your app rules)
const getDivisionFromAge = (ageRaw) => {
    const age = Number(ageRaw);
    if (age === 2 || age === 3) return "3 Year Old";
    if (age === 4) return "4 Year Old";
    if (age === 5) return "5 Year Old";
    if (age === 6 || age === 7) return "Snack Pack";
    return "Unknown";
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalRacers: 0,
        totalRegistrations: 0,
        upcomingRaces: 0,
    });

    const [divisionCounts, setDivisionCounts] = useState({
        "3 Year Old": 0,
        "4 Year Old": 0,
        "5 Year Old": 0,
        "Snack Pack": 0,
    });

    const [loading, setLoading] = useState(true);

    // chartData derived from divisionCounts
    const chartData = useMemo(() => {
        return {
            labels: Object.keys(divisionCounts),
            datasets: [
                {
                    label: "Racers by Division",
                    data: Object.values(divisionCounts),
                    backgroundColor: ["#1E63FF", "#FF9F1C", "#2ECC71", "#E74C3C"],
                    borderRadius: 6,
                },
            ],
        };
    }, [divisionCounts]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);

                // --- Load racers ---
                const racersRes = await apiClient.get("/racers"); // GET /api/racers
                const racers = racersRes.data || [];

                // Count divisions
                const counts = {
                    "3 Year Old": 0,
                    "4 Year Old": 0,
                    "5 Year Old": 0,
                    "Snack Pack": 0,
                };

                racers.forEach((r) => {
                    const div = getDivisionFromAge(r.age);
                    if (counts[div] !== undefined) counts[div] += 1;
                });

                // --- Load races (for upcoming count) ---
                const racesRes = await apiClient.get("/races"); // GET /api/races
                const races = racesRes.data || [];

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const upcomingCount = races.filter((race) => {
                    if (!race.raceDate) return false;
                    const d = new Date(race.raceDate);
                    d.setHours(0, 0, 0, 0);
                    return d >= today;
                }).length;

                // --- Load registrations (if endpoint exists) ---
                let registrationsCount = 0;
                try {
                    const regRes = await apiClient.get("/admin/registrations"); // GET /api/registrations
                    registrationsCount = (regRes.data || []).length;
                } catch (err) {
                    // If you don't have this endpoint yet, don't break dashboard
                    registrationsCount = 0;
                }

                // Set state
                setDivisionCounts(counts);
                setStats({
                    totalRacers: racers.length,
                    totalRegistrations: registrationsCount,
                    upcomingRaces: upcomingCount,
                });
            } catch (error) {
                console.error("Failed to fetch admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        void fetchStats();
    }, []);

    return (
        <Layout title="Admin Dashboard">
            <div className="dashboard-container">
                <h1>Welcome to the Admin Dashboard</h1>
                <p>Overview of key statistics and racing divisions.</p>

                {loading ? (
                    <p className="loading">Loading stats...</p>
                ) : (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Total Racers</h3>
                                <p>{stats.totalRacers}</p>
                            </div>

                            <div className="stat-card">
                                <h3>Total Registrations</h3>
                                <p>{stats.totalRegistrations}</p>
                            </div>

                            <div className="stat-card">
                                <h3>Upcoming Races</h3>
                                <p>{stats.upcomingRaces}</p>
                            </div>
                        </div>

                        <div className="chart-section">
                            <h3>Racers by Division</h3>

                            <Bar
                                data={chartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { display: false },
                                        title: { display: false },
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: { stepSize: 1 },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default AdminDashboard;