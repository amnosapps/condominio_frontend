import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import ApartmentList from './components/ApartmentList';
import DashboardLayout from './components/DashboardLayout';
import LandingPage from './components/LandingPage';
import ReservationCalendar from './components/ReservationCalendar';
import CondominiumSelection from './components/CondominiumSelection';
import CondominiumReport from './components/CondominiumReport';
import ServicesPage from './pages/Services';
import Dashboard from './pages/Services/Dashboard';
import HomePage from './pages/Home/HomePage';
import Soon from './pages/Soon'

import api from './services/api';
import UserManagement from './pages/Users/User';
import ReservationsPage from './pages/Reserations/Reservations';
import VisitorsPage from './pages/Users/Visitors';
import GuestForm from './pages/Guest/GuestForm';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));
    const [selectedCondominium, setSelectedCondominium] = useState(null);
    const [profile, setProfile] = useState(null);
    const [condominiums, setCondominium] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const validateAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }
        
            try {
                const profileResponse = await api.get(`/api/profile/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
        
                const userData = profileResponse.data;
                setProfile(userData); // Save user data in profile state
                setIsAuthenticated(true);
                setCondominium(userData.condominiums || []);
        
                // Auto-select a condominium
                const currentCondo = window.location.pathname.split('/')[1];
                if (userData.condominiums.includes(currentCondo)) {
                    setSelectedCondominium(currentCondo);
                } else if (userData.condominiums.length === 1) {
                    setSelectedCondominium(userData.condominiums[0]);
                }
            } catch (error) {
                console.error('Error validating user:', error);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        validateAuth();
    }, []);

    const handleLoginSuccess = (userData) => {
        setIsAuthenticated(true);
        setCondominium(userData.condominiums || []);
        if (userData.condominiums.length === 1) {
            setSelectedCondominium(userData.condominiums[0]);
        }
    };

    const ProtectedRoute = ({ children }) => {
        if (loading) return <div>Loading...</div>;
        if (!isAuthenticated) return <Navigate to="/login" />;
        return children;
    };

    const CondoRoute = ({ children }) => {
        const { condominium } = useParams();

        useEffect(() => {
            if (condominiums.length > 0 && condominiums.includes(condominium)) {
                setSelectedCondominium(condominium);
            }
        }, [condominium, condominiums]);

        if (loading) return <div>Loading...</div>;
        if (!isAuthenticated) return <Navigate to="/login" />;
        if (!condominiums.includes(condominium)) {
            return <Navigate to="/select-condominium" />;
        }
        return children;
    };

    const [services, setServices] = useState([
        {
          id: 1,
          name: "Cleaning Service",
          baseCost: 100,
          bookedBy: [],
          date: "2024-11-20",
        },
        {
          id: 2,
          name: "Gardening Service",
          baseCost: 200,
          bookedBy: [],
          date: "2024-11-21",
        },
      ]);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
                <Route path="/guest-form" element={<GuestForm />} />

                {/* Condominium Selection */}
                <Route
                    path="/select-condominium"
                    element={
                        isAuthenticated ? (
                            <CondominiumSelection
                                condominiums={condominiums}
                                onSelect={setSelectedCondominium}
                            />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />

                {/* Protected Routes */}
                <Route
                    path="/:condominium"
                    element={
                        <ProtectedRoute>
                            <CondoRoute>
                                <DashboardLayout profile={profile} />
                            </CondoRoute>
                        </ProtectedRoute>
                    }
                >
                    <Route path="home" element={<HomePage profile={profile} />} />
                    <Route path="occupation" element={<ReservationCalendar profile={profile} />} />
                    <Route path="apartments" element={<ApartmentList profile={profile} />} />
                    <Route path="reports" element={<CondominiumReport profile={profile} />} />
                    <Route path="reservations" element={<ReservationsPage profile={profile} />} />
                    <Route
                        path="services"
                        element={<ServicesPage services={services} setServices={setServices} />}
                    />
                    <Route
                        path="dashboard"
                        element={<Dashboard services={services} profile={profile} />}
                    />
                    <Route path="soon" element={<Soon />} />
                    <Route path="users" element={<UserManagement profile={profile} />} />
                    <Route path="visitors" element={<VisitorsPage profile={profile} />} />
                </Route>

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to={isAuthenticated ? "/select-condominium" : "/"} />} />
            </Routes>
        </Router>
    );
}

export default App;
