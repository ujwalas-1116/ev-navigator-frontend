import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Navigation from './pages/Navigation';
import { Wifi, Battery as BatteryIcon, Signal } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [time, setTime] = useState('');

  // Clock in status bar
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      let hours = date.getHours();
      let minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0' + minutes : minutes;
      setTime(`${hours}:${minutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
        {/* Notch and Status Bar Frame */}
        <div className="notch-container">
          <span>{time}</span>
          <div className="notch-pill" />
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Signal size={12} />
            <Wifi size={12} />
            <BatteryIcon size={12} />
          </div>
        </div>

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
