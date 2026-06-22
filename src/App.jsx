import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Navigation from './pages/Navigation';

export default function App() {
  const [user, setUser] = useState(null);

  // Retrieve user session on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem('evUser');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (err) {
        localStorage.removeItem('evUser');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('evUser');
    localStorage.removeItem('evToken');
    setUser(null);
  };

  return (
    <Router>
      <div className="app-container">
        {/* Dynamic Route views */}
        <Routes>
          <Route
            path="/login"
            element={
              user ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
            }
          />
          <Route
            path="/signup"
            element={
              user ? <Navigate to="/" replace /> : <SignUp onRegisterSuccess={handleLoginSuccess} />
            }
          />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/"
            element={
              user ? (
                <Dashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/navigation/:stationId"
            element={
              user ? (
                <Navigation user={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
