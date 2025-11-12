import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSection from "./components/HeroSection";
import ProtectedRoute from "./components/ProtectedRoute"; // ⬅️ make sure this file exists

// Pages
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterRacers from './pages/RegisterRacers';
import RaceList from './pages/RaceList';
import AdminDashboard from './pages/AdminDashboard';
import Results from './pages/Results';
import Gallery from './pages/Gallery';
import Sponsors from './pages/Sponsors';
import Racers from './pages/Racers';
import ParentDashboard from './pages/ParentDashboard';
import RacersManagement from './pages/RacersManagement';
import SponsorsManagement from './pages/SponsorsManagement';
import RegistrationsManagement from './pages/RegistrationsManagement';
import AdminSettings from './pages/AdminSettings';
import About from './pages/About';
import Contact from "./pages/Contact";
import AccountRegister from './pages/AccountRegister';

import './styles/main.css';

function AppContent() {
    const location = useLocation();

    // 🚫 Hide the hero on admin/parent auth pages
    const hideHeroRoutes = [
        "/login",
        "/register",
        "/dashboard",                 // ⬅️ added: hide hero on parent dashboard
        "/admin",                     // this will also match /admin/*
        "/admin/racers/manage",
        "/admin/sponsors/manage",
        "/admin/registrations/manage",
        "/admin/settings",
    ];

    const shouldShowHero = !hideHeroRoutes.some(route =>
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

                {/* Protected (token required) */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <ParentDashboard />
                        </ProtectedRoute>
                    }
                />

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
                    path="/admin/settings"
                    element={
                        <ProtectedRoute>
                            <AdminSettings />
                        </ProtectedRoute>
                    }
                />

                {/* Fallback */}
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