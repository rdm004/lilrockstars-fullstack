import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import "./styles/main.css";

// Public pages
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterRacers from "./pages/RegisterRacers";
import RaceList from "./pages/RaceList";
import Results from "./pages/Results";
import Gallery from "./pages/Gallery";
import Sponsors from "./pages/Sponsors";
import Racers from "./pages/Racers";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AccountRegister from "./pages/AccountRegister";
import ResetPassword from "./pages/ResetPassword";

// ADA
import Accessibility from "./pages/Accessibility";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

// Parent dashboard
import ParentDashboard from "./pages/ParentDashboard";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import RacersManagement from "./pages/RacersManagement";
import RegistrationsManagement from "./pages/RegistrationsManagement";
import ResultsManagement from "./pages/ResultsManagement";
import AdminRacesManagement from "./pages/AdminRacesManagement";
import AdminAuditLog from "./pages/AdminAuditLog";

function AppContent() {
    const location = useLocation();

    const hideHeroRoutes = ["/login", "/register", "/accountregister", "/dashboard", "/admin"];
    const shouldShowHero = !hideHeroRoutes.some((route) => location.pathname.startsWith(route));

    return (
        <>
            {/* Skip link */}
            <button
                type="button"
                className="skip-link"
                onClick={() => {
                    const el = document.getElementById("main-content");
                    if (el) el.focus();
                }}
            >
                Skip to main content
            </button>

            {shouldShowHero && <HeroSection />}
            <Navbar />

            <main id="main-content" tabIndex={-1}>
                <Routes>
                    {/* Public */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterRacers />} />
                    <Route path="/accountregister" element={<AccountRegister />} />
                    <Route path="/races" element={<RaceList />} />
                    <Route path="/racers" element={<Racers />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/sponsors" element={<Sponsors />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* ADA */}
                    <Route path="/accessibility" element={<Accessibility />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />

                    {/* Parent */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <ParentDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin (ADMIN only) */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="/admin/races/manage"
                        element={
                            <AdminRoute>
                                <AdminRacesManagement />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="/admin/racers/manage"
                        element={
                            <AdminRoute>
                                <RacersManagement />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="/admin/results/manage"
                        element={
                            <AdminRoute>
                                <ResultsManagement />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="/admin/registrations/manage"
                        element={
                            <AdminRoute>
                                <RegistrationsManagement />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="/admin/audit"
                        element={
                            <AdminRoute>
                                <AdminAuditLog />
                            </AdminRoute>
                        }
                    />

                    {/* Fallback */}
                    <Route path="*" element={<LoginPage />} />
                </Routes>
            </main>

            <Footer />
        </>
    );
}

export default function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}