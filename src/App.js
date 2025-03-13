import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ResetPassword from './components/ResetPassword';
import NavBar from './components/NavBar';
import Logout from './components/Logout';
import Home from './components/Home';
import VehicleForm from './components/VehicleForm';
import PoliciesPage from './components/PoliciesPage'; // Import the PoliciesPage component
import TravelPolicies from './components/TravelPolicies';
import TravelForm from './components/TravelForm';

function App() {
    // Check if user is logged in through local storage access token
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));

    // Update authentication state based on the stored token
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setIsAuthenticated(!!token);
    }, []);

    // Login function
    const handleLogin = (accessToken, idToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('idToken', idToken);
        setIsAuthenticated(true);
    };

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        setIsAuthenticated(false);
    };

    return (
        <Router>
            <div>
                <NavBar />
                <Routes>
                    {/* Redirects the root path to the login page */}
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ResetPassword />} />
                    <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
                    <Route path="/home" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <Home />
                        </ProtectedRoute>
                    }/>
                    <Route path="/vehicleform" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <VehicleForm />
                        </ProtectedRoute>
                    }/>
                    {/* New route for Policies page */}
                    <Route path="/policies" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <PoliciesPage />
                        </ProtectedRoute>
                    }/>
                    <Route path="/travel-policies" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <TravelPolicies />
                        </ProtectedRoute>
                    }/>
                    <Route path="/travelform" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <TravelForm />
                        </ProtectedRoute>
                    }/>

                </Routes>
            </div>
        </Router>
    );
}

export default App;
