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

    if (age === 2 || age === 3) return "3 Year Old Division";
    if (age === 4) return "4 Year Old Division";
    if (age === 5) return "5 Year Old Division";
    if (age === 6) return "Snack Pack Division";

    // Age 7 defaults to Snack Pack unless racer.division is explicitly set
    if (age === 7) return "Snack Pack Division";

    // Age 8–9 = Lil Stingers
    if (age === 8 || age === 9) return "Lil Stingers";

    return "Unknown";
};

const DIVISION_LABELS = [
    "3 Year Old Division",
    "4 Year Old Division",
    "5 Year Old Division",
    "Snack Pack Division",
    "Lil Stingers",
];

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalRacers: 0,
        totalRegistrations: 0,
        upcomingRaces: 0,
    });

    // ✅ keys match DB/app strings
    const [divisionCounts, setDivisionCounts] = useState(() => ({
        "3 Year Old Division": 0,
        "4 Year Old Division": 0,
        "5 Year Old Division": 0,
        "Snack Pack Division": 0,
        "Lil Stingers": 0,
    }));

    const [loading, setLoading] = useState(true);

    // chartData derived from divisionCounts (stable ordering)
    const chartData = useMemo(() => {
        const data = DIVISION_LABELS.map((k) => divisionCounts[k] ?? 0);

        return {
            labels: DIVISION_LABELS,
            datasets: [
                {
                    label: "Racers by Division",
                    data,
                    // ✅ 5 colors; Lil Stingers = yellow (last)
                    backgroundColor: ["#1E63FF", "#FF9F1C", "#2ECC71", "#E74C3C", "#FFD700"],
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
                const racersRes = await apiClient.get("/admin/racers"); // GET /api/admin/racers
                const racers = racersRes.data || [];

                // Count divisions (match your DB / app strings)
                const counts = {
                    "3 Year Old Division": 0,
                    "4 Year Old Division": 0,
                    "5 Year Old Division": 0,
                    "Snack Pack Division": 0,
                    "Lil Stingers": 0,
                };

                racers.forEach((r) => {
                    // Prefer stored division if present (especially for age 7 selection)
                    const stored = r?.division ? String(r.division).trim() : "";
                    const div = stored ? stored : getDivisionFromAge(r?.age);

                    if (counts[div] !== undefined) {
                        counts[div] += 1;
                    }
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

                // --- Load registrations ---
                let registrationsCount = 0;
                try {
                    const regRes = await apiClient.get("/admin/registrations"); // GET /api/admin/registrations
                    registrationsCount = (regRes.data || []).length;
                } catch (err) {
                    // If endpoint doesn't exist or fails, don't break dashboard
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
                                <h3>Upcoming Events</h3>
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