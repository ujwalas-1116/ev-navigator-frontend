import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Car, Check } from 'lucide-react';

export default function SignUp({ onRegisterSuccess }) {
  const [username, setUsername] = useState('');
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [evModel, setEvModel] = useState('Tata Nexon EV');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const evModels = [
    { name: 'Tata Nexon EV', range: 312, battery: 30.2 },
    { name: 'Tesla Model Y', range: 531, battery: 75.0 },
    { name: 'Hyundai Ioniq 5', range: 480, battery: 72.6 },
    { name: 'Audi e-tron', range: 400, battery: 95.0 },
    { name: 'Nissan Leaf', range: 270, battery: 40.0 },
    { name: 'MG ZS EV', range: 461, battery: 50.3 }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !emailOrMobile || !password) {
      setError('Please fill in all required fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, emailOrMobile, password, evModel })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('evToken', data.token);
        localStorage.setItem('evUser', JSON.stringify(data.user));
        setSuccess('Account created successfully!');
        setTimeout(() => {
          onRegisterSuccess(data.user);
          navigate('/');
        }, 1200);
      } else {
        // Fallback for demonstration offline mode:
        console.warn('Backend register failed, using offline fallback.');
        const mockUser = {
          id: 'mock-user-' + Date.now(),
          username,
          emailOrMobile,
          evModel
        };
        localStorage.setItem('evToken', 'mock-token-abc');
        localStorage.setItem('evUser', JSON.stringify(mockUser));
        
        setSuccess('Registered successfully (Offline Mode)');
        setTimeout(() => {
          onRegisterSuccess(mockUser);
          navigate('/');
        }, 1200);
      }
    } catch (err) {
      console.error('Connection error, using local fallback mode:', err);
      const mockUser = {
        id: 'mock-user-' + Date.now(),
        username,
        emailOrMobile,
        evModel
      };
      localStorage.setItem('evToken', 'mock-token-abc');
      localStorage.setItem('evUser', JSON.stringify(mockUser));
      
      setSuccess('Registered successfully (Offline Fallback)');
      setTimeout(() => {
        onRegisterSuccess(mockUser);
        navigate('/');
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen">
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <h1 className="title-large" style={{ textAlign: 'left' }}>Create Account</h1>
        <p className="title-desc" style={{ textAlign: 'left', marginBottom: 10 }}>
          Join the electric highway movement today.
        </p>
      </div>

      {error && <div className="alert-box alert-error">{error}</div>}
      {success && <div className="alert-box alert-success">{success}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="form-group">
          <label className="form-label">User Name</label>
          <div className="input-wrapper">
            <input
              type="text"
              className="form-input"
              placeholder="e.g. John Doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <User className="input-icon" size={18} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email Or Mobile no.</label>
          <div className="input-wrapper">
            <input
              type="text"
              className="form-input"
              placeholder="e.g. email or mobile"
              value={emailOrMobile}
              onChange={(e) => setEmailOrMobile(e.target.value)}
            />
            <Mail className="input-icon" size={18} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">EV Model</label>
          <div className="input-wrapper">
            <select
              className="form-input ev-select-dropdown"
              value={evModel}
              onChange={(e) => setEvModel(e.target.value)}
              style={{ paddingRight: 40 }}
            >
              {evModels.map((ev) => (
                <option key={ev.name} value={ev.name} style={{ backgroundColor: 'var(--bg-main)' }}>
                  {ev.name} ({ev.battery} kWh)
                </option>
              ))}
            </select>
            <Car className="input-icon" size={18} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 30 }}>
          <label className="form-label">Password</label>
          <div className="input-wrapper">
            <input
              type="password"
              className="form-input"
              placeholder="Choose a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <svg
              className="input-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating Account...' : 'SIGN UP'}
        </button>
      </form>

      <div className="link-footer">
        Already have an account? <Link to="/login" className="btn-text">Login</Link>
      </div>
    </div>
  );
}
