import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSection from "./components/HeroSection";


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

    // 🚫 Hide the hero on these routes:
    const hideHeroRoutes = [
        "/login",
        "/admin",
        "/admin/racers/manage",
        "/admin/sponsors/manage",
        "/admin/registrations/manage",
        "/admin/settings",
        "/register"
    ];

    const shouldShowHero = !hideHeroRoutes.some(route =>
        location.pathname.startsWith(route)
    );

    return (
        <>
            {shouldShowHero && <HeroSection />}
            <Navbar />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterRacers />} />
                <Route path="/races" element={<RaceList />} />
                <Route path="/racers" element={<Racers />} />
                <Route path="/results" element={<Results />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/sponsors" element={<Sponsors />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/accountregister" element={<AccountRegister />} />

                <Route path="/dashboard" element={<ParentDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/racers/manage" element={<RacersManagement />} />
                <Route path="/admin/sponsors/manage" element={<SponsorsManagement />} />
                <Route path="/admin/registrations/manage" element={<RegistrationsManagement />} />
                <Route path="/admin/settings" element={<AdminSettings />} />

                <Route path="*" element={<LoginPage />} />
            </Routes>

            <Footer />
        </>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;