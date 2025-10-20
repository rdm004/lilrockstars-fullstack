import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import RegisterRacer from './pages/RegisterRacer';
import RaceList from './pages/RaceList';
import AdminDashboard from './pages/AdminDashboard';
import Results from './pages/Results';
import Gallery from './pages/Gallery';
import Sponsors from './pages/Sponsors';
import Racers from './pages/Racers';
import './styles/main.css';

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<RegisterRacer />} />
                <Route path="/races" element={<RaceList />} />
                <Route path="/racers" element={<Racers />} />
                <Route path="/results" element={<Results />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/sponsors" element={<Sponsors />} />
                <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
            <Footer />
        </Router>
    );
}

export default App;