// src/App.js

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import ApartmentList from './components/ApartmentList';
import DashboardLayout from './components/DashboardLayout';
import LandingPage from './components/LandingPage';
import ReservationCalendar from './components/ReservationCalendar';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const ProtectedRoute = ({ children }) => {
        return isAuthenticated ? children : <Navigate to="/login" />;
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="occupation" element={<ReservationCalendar />} />
                    <Route path="apartments" element={<ApartmentList />} />
                    <Route path="services" element={<ApartmentList />} />
                </Route>

                <Route path="*" element={<Navigate to={isAuthenticated ? "/occupation" : "/"} />} />
            </Routes>
        </Router>
    );
}

export default App;
