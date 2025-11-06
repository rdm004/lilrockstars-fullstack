import React, { useEffect, useState } from "react";
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

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalRacers: 0,
        totalSponsors: 0,
        totalRegistrations: 0,
        upcomingRaces: 0,
    });
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // --- MOCK DATA (replace later with backend API) ---
                const mockRacers = [
                    { age: 3 },
                    { age: 3 },
                    { age: 4 },
                    { age: 5 },
                    { age: 6 },
                    { age: 7 },
                    { age: 7 },
                    { age: 4 },
                    { age: 5 },
                    { age: 6 },
                ];

                // 🧮 Group racers into your divisions
                const divisionCounts = {
                    "3 Year Old": 0,
                    "4 Year Old": 0,
                    "5 Year Old": 0,
                    "Snack Pack": 0,
                };

                mockRacers.forEach((r) => {
                    if (r.age === 3) divisionCounts["3 Year Old"]++;
                    else if (r.age === 4) divisionCounts["4 Year Old"]++;
                    else if (r.age === 5) divisionCounts["5 Year Old"]++;
                    else if (r.age === 6 || r.age === 7)
                        divisionCounts["Snack Pack"]++;
                });

                // 🧠 Set up chart data
                setChartData({
                    labels: Object.keys(divisionCounts),
                    datasets: [
                        {
                            label: "Racers by Division",
                            data: Object.values(divisionCounts),
                            backgroundColor: [
                                "#1E63FF",
                                "#FF9F1C",
                                "#2ECC71",
                                "#E74C3C",
                            ],
                            borderRadius: 6,
                        },
                    ],
                });

                // --- Mock dashboard stats ---
                setTimeout(() => {
                    setStats({
                        totalRacers: mockRacers.length,
                        totalSponsors: 12,
                        totalRegistrations: 102,
                        upcomingRaces: 3,
                    });
                    setLoading(false);
                }, 500);
            } catch (error) {
                console.error("Failed to fetch admin stats:", error);
                setLoading(false);
            }
        };

        fetchStats();
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
                                <h3>Total Sponsors</h3>
                                <p>{stats.totalSponsors}</p>
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

                        {/* --- Chart Section --- */}
                        <div className="chart-section">
                            <h3>Racers by Division</h3>
                            {chartData ? (
                                <Bar
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { display: false },
                                            title: {
                                                display: false,
                                            },
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: { stepSize: 1 },
                                            },
                                        },
                                    }}
                                />
                            ) : (
                                <p>Loading chart...</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default AdminDashboard;