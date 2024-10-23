// src/App.js

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import ApartmentList from './components/ApartmentList';
import DashboardLayout from './components/DashboardLayout';
import LandingPage from './components/LandingPage';  // Import the new LandingPage component

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
                {/* Public Route: Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Public Route: Login */}
                <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />

                {/* Protected Routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    {/* Nested routes inside the protected dashboard */}
                    <Route path="apartments" element={<ApartmentList />} />
                    {/* Add other protected routes here */}
                </Route>

                {/* Fallback Route: Redirect to Landing Page or Apartments based on authentication */}
                <Route path="*" element={<Navigate to={isAuthenticated ? "/apartments" : "/"} />} />
            </Routes>
        </Router>
    );
}

export default App;
