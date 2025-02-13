import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import api from './services/api';

import Login from './components/Login';
import CondominiumSelection from './components/CondominiumSelection';
import DashboardLayout from './components/DashboardLayout';
import LandingPage from './components/LandingPage';
import ApartmentList from './components/ApartmentList';
import ReservationCalendar from './components/ReservationCalendar';
import CondominiumReport from './components/CondominiumReport';
import ServicesPage from './pages/Services';
import Dashboard from './pages/Services/Dashboard';
import HomePage from './pages/Home/HomePage';
import Soon from './pages/Soon';
import UserManagement from './pages/Users/User';
import ReservationsPage from './pages/Reserations/Reservations';
import VisitorsPage from './pages/Users/Visitors';
import GuestForm from './pages/Guest/GuestForm';
import DeviceManagement from './pages/Access/Devices';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));
    const [selectedCondominium, setSelectedCondominium] = useState(null);
    const [profile, setProfile] = useState(null);
    const [condominiums, setCondominiums] = useState([]);
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
                setProfile(userData);
                setCondominiums(userData.condominiums || []);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        validateAuth();
    }, []);

    const handleLoginSuccess = (userData) => {
        setIsAuthenticated(true);
        setProfile(userData);
        setCondominiums(userData.condominiums || []);
    };

    const handleSelectCondominium = (condo) => {
        setSelectedCondominium(condo);
    };

    const ProtectedRoute = ({ children }) => {
        if (loading) return <div>Loading...</div>;
        if (!isAuthenticated) return <Navigate to="/login" />;
        return children;
    };

    const CondoRoute = ({ children }) => {
        const { condominium } = useParams();
        
        useEffect(() => {
            if (condominium && condominiums.length > 0) {
                const foundCondo = condominiums.find(condo => condo.name === condominium);
                if (foundCondo) {
                    setSelectedCondominium(foundCondo);
                }
            }
        }, [condominium, condominiums]);

        if (loading) return <div>Loading...</div>;
        if (!isAuthenticated) return <Navigate to="/login" />;
        return children;
    };

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
                                onSelect={handleSelectCondominium}
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
                                <DashboardLayout profile={profile} condominium={selectedCondominium} />
                            </CondoRoute>
                        </ProtectedRoute>
                    }
                >
                    <Route path="home" element={<HomePage profile={profile} condominium={selectedCondominium} />} />
                    <Route path="occupation" element={<ReservationCalendar profile={profile} condominium={selectedCondominium} />} />
                    <Route path="apartments" element={<ApartmentList profile={profile} condominium={selectedCondominium} />} />
                    <Route path="reports" element={<CondominiumReport profile={profile} condominium={selectedCondominium} />} />
                    <Route path="reservations" element={<ReservationsPage profile={profile} condominium={selectedCondominium} />} />
                    <Route path="services" element={<ServicesPage condominium={selectedCondominium} />} />
                    <Route path="dashboard" element={<Dashboard condominium={selectedCondominium} />} />
                    <Route path="soon" element={<Soon />} />
                    <Route path="users" element={<UserManagement profile={profile} condominium={selectedCondominium} />} />
                    <Route path="visitors" element={<VisitorsPage profile={profile} condominium={selectedCondominium} />} />
                    <Route path="access/devices" element={<DeviceManagement profile={profile} condominium={selectedCondominium} />} />
                </Route>

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to={isAuthenticated ? "/select-condominium" : "/"} />} />
            </Routes>
        </Router>
    );
}

export default App;
