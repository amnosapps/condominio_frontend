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

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));
    const [selectedCondominium, setSelectedCondominium] = useState(null);
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
                const profileResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const userData = profileResponse.data;
                setIsAuthenticated(true);
                setCondominium(userData.condominiums || []);

                // Auto-select a condominium if there's only one or use the current URL
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

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />

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
                                <DashboardLayout />
                            </CondoRoute>
                        </ProtectedRoute>
                    }
                >
                    <Route path="occupation" element={<ReservationCalendar />} />
                    <Route path="apartments" element={<ApartmentList />} />
                    <Route path="reports" element={<CondominiumReport />} />
                </Route>

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to={isAuthenticated ? "/select-condominium" : "/"} />} />
            </Routes>
        </Router>
    );
}

export default App;
