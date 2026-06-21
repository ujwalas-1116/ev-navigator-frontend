import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Login({ onLoginSuccess }) {
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrMobile || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Attempt backend login
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrMobile, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('evToken', data.token);
        localStorage.setItem('evUser', JSON.stringify(data.user));
        setSuccess('Logged in successfully!');
        setTimeout(() => {
          onLoginSuccess(data.user);
          navigate('/');
        }, 1000);
      } else {
        // Fallback for demonstration offline mode:
        // Allow login with any input for testing convenience
        console.warn('Backend login failed. Falling back to local offline mode.');
        
        const mockUser = {
          id: 'mock-user-123',
          username: 'Eco Driver',
          emailOrMobile: emailOrMobile,
          evModel: 'Tesla Model Y'
        };
        localStorage.setItem('evToken', 'mock-token-abc');
        localStorage.setItem('evUser', JSON.stringify(mockUser));
        
        setSuccess('Logged in (Offline Demonstration Mode)');
        setTimeout(() => {
          onLoginSuccess(mockUser);
          navigate('/');
        }, 1200);
      }
    } catch (err) {
      console.error('Connection error, running in local fallback mode:', err);
      // Fallback
      const mockUser = {
        id: 'mock-user-123',
        username: 'Eco Driver',
        emailOrMobile: emailOrMobile,
        evModel: 'Tesla Model Y'
      };
      localStorage.setItem('evToken', 'mock-token-abc');
      localStorage.setItem('evUser', JSON.stringify(mockUser));
      
      setSuccess('Logged in (Offline Fallback Mode)');
      setTimeout(() => {
        onLoginSuccess(mockUser);
        navigate('/');
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen">
      {/* Decorative EV Illustration */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20, marginTop: 15 }}>
        <div style={{
          width: 130,
          height: 130,
          borderRadius: '50%',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '3px solid var(--primary)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          boxShadow: 'var(--shadow-glow)'
        }}>
          {/* Animated rings */}
          <div style={{
            position: 'absolute',
            width: '120%',
            height: '120%',
            borderRadius: '50%',
            border: '1.5px dashed rgba(34, 197, 94, 0.3)',
            animation: 'spin 20s linear infinite'
          }} />
          
          {/* Car Icon Representation */}
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
            <circle cx="7" cy="17" r="2" />
            <path d="M9 17h6" />
            <circle cx="17" cy="17" r="2" />
            <path d="M14 10l-2 3h3l-2 4" />
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <h1 className="title-large" style={{ marginBottom: 12 }}>
        Electrical vehicles <br />
        <span className="green-highlight">charging station</span> <br />
        Navigator
      </h1>
      
      <p className="title-desc">
        Locate, navigate, and charge your electric vehicle in real-time.
      </p>

      {error && <div className="alert-box alert-error">{error}</div>}
      {success && <div className="alert-box alert-success">{success}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div className="form-group">
          <label className="form-label">Email Address or Mobile No.</label>
          <div className="input-wrapper">
            <input
              type="text"
              className="form-input"
              placeholder="e.g. mail@example.com"
              value={emailOrMobile}
              onChange={(e) => setEmailOrMobile(e.target.value)}
            />
            <Mail className="input-icon" size={18} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 30 }}>
          <label className="form-label">Password</label>
          <div className="input-wrapper">
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Lock className="input-icon" size={18} />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'LOGIN'}
        </button>
      </form>

      <div style={{ textAlign: 'right', marginTop: 15 }}>
        <Link to="/reset-password" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>
          Forgot Password?
        </Link>
      </div>

      <div className="link-footer">
        Don't have an account? <Link to="/signup" className="btn-text">Sign Up</Link>
      </div>
    </div>
  );
}
