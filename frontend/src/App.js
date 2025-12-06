// App.js
import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import ProtectedRoute from "./components/ProtectedRoute";

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

// Parent dashboard
import ParentDashboard from "./pages/ParentDashboard";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import RacersManagement from "./pages/RacersManagement";
import SponsorsManagement from "./pages/SponsorsManagement";
import RegistrationsManagement from "./pages/RegistrationsManagement";
import ResultsManagement from "./pages/ResultsManagement";
import GalleryManagement from "./pages/GalleryManagement";
import AdminSettings from "./pages/AdminSettings";

import "./styles/main.css";

function AppContent() {
    const location = useLocation();

    // 🚫 Hide the hero on auth/admin/parent routes
    const hideHeroRoutes = [
        "/login",
        "/register",
        "/accountregister",
        "/dashboard",
        "/admin",
        "/admin/racers/manage",
        "/admin/sponsors/manage",
        "/admin/registrations/manage",
        "/admin/results/manage",
        "/admin/photos/manage",
        "/admin/settings",
    ];

    const shouldShowHero = !hideHeroRoutes.some((route) =>
        location.pathname.startsWith(route)
    );

    return (
        <>
            {shouldShowHero && <HeroSection />}
            <Navbar />

            <Routes>
                {/* Public routes */}
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

                {/* Protected parent route */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <ParentDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Protected admin routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/racers/manage"
                    element={
                        <ProtectedRoute>
                            <RacersManagement />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/sponsors/manage"
                    element={
                        <ProtectedRoute>
                            <SponsorsManagement />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/registrations/manage"
                    element={
                        <ProtectedRoute>
                            <RegistrationsManagement />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/results/manage"
                    element={
                        <ProtectedRoute>
                            <ResultsManagement />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/photos/manage"
                    element={
                        <ProtectedRoute>
                            <GalleryManagement />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/settings"
                    element={
                        <ProtectedRoute>
                            <AdminSettings />
                        </ProtectedRoute>
                    }
                />

                {/* Fallback: anything unknown goes to login */}
                <Route path="*" element={<LoginPage />} />
            </Routes>

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