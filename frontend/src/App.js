import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
import './styles/main.css';

function App() {
    return (
        <Router>
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
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/dashboard" element={<ParentDashboard />} />
            </Routes>
            <Footer />
        </Router>
    );
}

export default App;