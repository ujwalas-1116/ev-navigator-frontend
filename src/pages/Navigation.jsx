import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import { ArrowLeft, Navigation as NavIcon, Battery, Clock, Zap, DollarSign, ShieldAlert, Award } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Navigation({ user }) {
  const { stationId } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulation states
  const [mode, setMode] = useState('driving'); // 'driving' | 'arrived' | 'charging' | 'completed'
  const [progress, setProgress] = useState(0); // 0 to 1
  const [speed, setSpeed] = useState(0); // km/h
  const [distanceRemaining, setDistanceRemaining] = useState(0); // km
  const [etaSeconds, setEtaSeconds] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(18.0); // low starting battery for maximum drama!
  
  // Charging states
  const [targetCharge, setTargetCharge] = useState(80);
  const [chargePower, setChargePower] = useState(0); // kW
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);
  const [costAccumulated, setCostAccumulated] = useState(0);
  const [kwhDelivered, setKwhDelivered] = useState(0);

  // Animation ticks references
  const driveTimerRef = useRef(null);
  const chargeTimerRef = useRef(null);

  const mockStations = [
    {
      _id: '1',
      name: 'Tata Power Charging Station',
      address: 'Near Central Highway Plaza, Sector 12',
      lat: 12.9716,
      lng: 77.5946,
      rating: 4.5,
      reviewsCount: 120,
      chargerTypes: ['CCS2', 'Type 2'],
      chargingSpeed: 'Fast',
      pricingPerKwh: 18.5,
      slotsTotal: 4,
      slotsOccupied: 2,
      distanceKm: 2.0,
      openHours: 'Open 24 Hours'
    },
    {
      _id: '2',
      name: 'Jio-bp pulse Charging Station',
      address: 'Downtown Petrol Pump complex, Main Rd',
      lat: 12.9650,
      lng: 77.6010,
      rating: 4.2,
      reviewsCount: 90,
      chargerTypes: ['CCS2', 'CHAdeMO'],
      chargingSpeed: 'Fast',
      pricingPerKwh: 16.0,
      slotsTotal: 6,
      slotsOccupied: 5,
      distanceKm: 3.5,
      openHours: 'Open 24 Hours'
    },
    {
      _id: '3',
      name: 'Zeon Charging Station',
      address: 'Tech Park Gate 3 Parking, Ring Road',
      lat: 12.9850,
      lng: 77.5850,
      rating: 4.6,
      reviewsCount: 150,
      chargerTypes: ['CCS2', 'GB/T'],
      chargingSpeed: 'Ultra-Fast',
      pricingPerKwh: 22.0,
      slotsTotal: 4,
      slotsOccupied: 1,
      distanceKm: 5.0,
      openHours: 'Open 24 Hours'
    },
    {
      _id: '4',
      name: 'Relux Charging Station',
      address: 'Metro Station Level 1 Basement, North End',
      lat: 12.9590,
      lng: 77.5890,
      rating: 3.9,
      reviewsCount: 45,
      chargerTypes: ['Type 2'],
      chargingSpeed: 'Slow',
      pricingPerKwh: 12.5,
      slotsTotal: 2,
      slotsOccupied: 2,
      distanceKm: 1.2,
      openHours: 'Open 24 Hours'
    },
    {
      _id: '5',
      name: 'Shell Recharge Station',
      address: 'Shell Fuel Station, East Expressway',
      lat: 12.9910,
      lng: 77.6150,
      rating: 4.7,
      reviewsCount: 80,
      chargerTypes: ['CCS2'],
      chargingSpeed: 'Ultra-Fast',
      pricingPerKwh: 24.0,
      slotsTotal: 8,
      slotsOccupied: 4,
      distanceKm: 6.8,
      openHours: 'Open 24 Hours'
    }
  ];

  // Fetch station details
  useEffect(() => {
    const fetchStation = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/stations/${stationId}`);
        if (response.ok) {
          const data = await response.json();
          setStation(data);
          setDistanceRemaining(data.distanceKm);
          setEtaSeconds(data.distanceKm * 60); // 1 minute per km driving simulation
        } else {
          // Local fallback matching by ID or name
          const found = mockStations.find(s => s._id === stationId || s.name.includes(stationId));
          if (found) {
            setStation(found);
            setDistanceRemaining(found.distanceKm);
            setEtaSeconds(found.distanceKm * 60);
          }
        }
      } catch (err) {
        console.warn('API error, using local fallback for navigation');
        const found = mockStations.find(s => s._id === stationId || s.name.includes(stationId));
        if (found) {
          setStation(found);
          setDistanceRemaining(found.distanceKm);
          setEtaSeconds(found.distanceKm * 60);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStation();

    return () => {
      clearInterval(driveTimerRef.current);
      clearInterval(chargeTimerRef.current);
    };
  }, [stationId]);

  // Start driving simulation
  const handleStartDriving = () => {
    if (!station) return;
    
    // Reset parameters
    setProgress(0);
    setMode('driving');
    setBatteryLevel(18.0);
    setDistanceRemaining(station.distanceKm);
    
    // Simulate navigation driving
    const durationMs = 15000; // 15 seconds driving simulation
    const intervalMs = 100;
    const steps = durationMs / intervalMs;
    let stepCount = 0;

    clearInterval(driveTimerRef.current);
    
    driveTimerRef.current = setInterval(() => {
      stepCount++;
      const currentProgress = stepCount / steps;
      setProgress(currentProgress);

      // Speed simulation (km/h)
      const currentSpeed = 50 + Math.sin(stepCount / 5) * 12;
      setSpeed(Math.round(currentSpeed));

      // Calculate distance remaining
      const dist = station.distanceKm * (1 - currentProgress);
      setDistanceRemaining(Math.max(0, parseFloat(dist.toFixed(2))));

      // ETA remaining (starts at total distance * 60s, counts down)
      const secondsLeft = Math.round(station.distanceKm * 60 * (1 - currentProgress));
      setEtaSeconds(Math.max(0, secondsLeft));

      // Battery level depletion (e.g. from 18% down to 17.1%)
      const batteryDrop = currentProgress * 0.9;
      setBatteryLevel(parseFloat((18.0 - batteryDrop).toFixed(1)));

      if (stepCount >= steps) {
        clearInterval(driveTimerRef.current);
        setMode('arrived');
        setSpeed(0);
        setDistanceRemaining(0);
        setEtaSeconds(0);
      }
    }, intervalMs);
  };

  // Start charging simulation
  const handleStartCharging = () => {
    setMode('charging');
    
    // Determine charging speed based on station spec
    let power = 50; // standard Fast CCS2 (50kW)
    if (station.chargingSpeed === 'Ultra-Fast') {
      power = 120; // 120kW
    } else if (station.chargingSpeed === 'Slow') {
      power = 7.4; // 7.4kW Type 2 AC
    }
    setChargePower(power);

    // Initial estimation of seconds required (scaled down for demo speed: 1% battery takes 150ms)
    const targetKwh = (targetCharge - batteryLevel) / 100 * 50; // assuming a 50kWh battery
    
    clearInterval(chargeTimerRef.current);

    chargeTimerRef.current = setInterval(() => {
      setBatteryLevel(prev => {
        if (prev >= targetCharge) {
          clearInterval(chargeTimerRef.current);
          setMode('completed');
          setChargePower(0);
          return targetCharge;
        }

        const nextBattery = prev + 0.8; // charge rate
        
        // Calculate dynamic energy delivered & cost
        const addedKwh = (0.8 / 100) * 50;
        setKwhDelivered(kwh => parseFloat((kwh + addedKwh).toFixed(2)));
        setCostAccumulated(cost => parseFloat((cost + addedKwh * station.pricingPerKwh).toFixed(1)));

        // Simulated time remaining
        const percentLeft = targetCharge - nextBattery;
        setTimeRemainingSeconds(Math.ceil(percentLeft * 1.5)); // 1.5s per remaining %

        return parseFloat(nextBattery.toFixed(1));
      });
    }, 150); // Fast interval for beautiful progress charging
  };

  // Format seconds to MM:SS
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="screen" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Initializing navigation systems...</div>
      </div>
    );
  }

  // Ring parameters for charging circle
  const radius = 60;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (batteryLevel / 100) * circumference;

  return (
    <div className="screen navigation-screen">
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center', cursor: 'pointer', paddingRight: 10 }}>
          <ArrowLeft size={20} />
        </button>
        <span style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>Navigation Panel</span>
      </div>

      {/* Map simulation frame */}
      <div style={{ marginBottom: 15 }}>
        <Map
          stations={[station]}
          userLocation={{ lat: 12.96, lng: 77.59 }}
          selectedStation={station}
          activeRoute={mode === 'driving'}
          animatedProgress={progress}
        />
      </div>

      {/* Simulator Interface with Functional Time */}
      <div className="navigator-dashboard" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {mode === 'driving' && (
          /* Driving mode console */
          <div className="glass-panel" style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Heading to</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'white' }}>{station.name}</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'rgba(3b, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '4px 10px', borderRadius: 8 }}>
                <NavIcon size={14} className="route-dash" style={{ color: '#3b82f6' }} />
                <span style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: '600' }}>Active Route</span>
              </div>
            </div>

            {/* Simulated Live telemetry dials */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, margin: '20px 0' }}>
              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 10, borderRadius: 8, textAlign: 'center', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Live Speed</span>
                <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white' }}>{speed} <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-secondary)' }}>km/h</span></span>
              </div>
              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 10, borderRadius: 8, textAlign: 'center', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Remaining</span>
                <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white' }}>{distanceRemaining} <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-secondary)' }}>km</span></span>
              </div>
              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 10, borderRadius: 8, textAlign: 'center', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>ETA Countdown</span>
                <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)' }}>{formatTime(etaSeconds)}</span>
              </div>
            </div>

            {/* Battery state warnings */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: 10, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Battery size={18} style={{ color: '#f87171' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Battery Critical!</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#f87171' }}>{batteryLevel}% Remaining</span>
                </div>
              </div>
              <ShieldAlert size={18} style={{ color: '#f87171' }} />
            </div>

            <button
              onClick={handleStartDriving}
              className="btn-primary"
              style={{ padding: 14 }}
            >
              Simulate Drive Mode
            </button>
          </div>
        )}

        {mode === 'arrived' && (
          /* Arrived Screen */
          <div className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>
            <div>
              <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: 16, border: '2px solid var(--primary)', alignSelf: 'center' }}>
                <Award size={32} style={{ color: 'var(--primary)' }} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'white', marginBottom: 6 }}>Arrived at Destination!</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                You have reached <strong>{station.name}</strong>. Charger cable has been plugged in successfully.
              </p>
            </div>

            <div style={{ margin: '20px 0', padding: 16, backgroundColor: 'rgba(15, 23, 42, 0.4)', border: '1px solid var(--border-light)', borderRadius: 12 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 10, textTransform: 'uppercase', fontWeight: '600' }}>Select Target Charge Level</span>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                {[80, 90, 100].map(level => (
                  <button
                    key={level}
                    onClick={() => setTargetCharge(level)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: targetCharge === level ? 'var(--primary)' : 'var(--bg-main)',
                      border: targetCharge === level ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                      borderRadius: 8,
                      color: 'white',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    {level}%
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartCharging}
              className="btn-primary"
              style={{ padding: 14 }}
            >
              Start Charging Session
            </button>
          </div>
        )}

        {mode === 'charging' && (
          /* Charging simulator with gauges */
          <div className="glass-panel" style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Charging Session at</span>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>{station.name}</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '4px 10px', borderRadius: 8 }}>
                <Zap size={14} style={{ color: 'var(--primary)', animation: 'pulse 1s infinite' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700' }}>Charging</span>
              </div>
            </div>

            {/* Circular Progress Gauge */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '15px 0', position: 'relative' }}>
              <svg height={radius * 2} width={radius * 2} className="charging-ring-svg">
                <circle
                  className="charging-circle-bg"
                  cx={radius}
                  cy={radius}
                  r={normalizedRadius}
                />
                <circle
                  className="charging-circle-progress"
                  cx={radius}
                  cy={radius}
                  r={normalizedRadius}
                  strokeDasharray={`${circumference} ${circumference}`}
                  style={{ strokeDashoffset }}
                />
              </svg>
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white', lineHeight: 1 }}>{batteryLevel}%</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Current Charge</span>
              </div>
            </div>

            {/* Dynamic statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: 10, borderRadius: 8, border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Charging Power</span>
                <span style={{ fontSize: '1rem', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Zap size={12} style={{ color: 'var(--accent)' }} /> {chargePower} kW
                </span>
              </div>
              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: 10, borderRadius: 8, border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Time to {targetCharge}%</span>
                <span style={{ fontSize: '1rem', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} style={{ color: 'var(--primary)' }} /> {formatTime(timeRemainingSeconds)}
                </span>
              </div>
              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: 10, borderRadius: 8, border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Energy Added</span>
                <span style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
                  {kwhDelivered} kWh
                </span>
              </div>
              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: 10, borderRadius: 8, border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Session Cost</span>
                <span style={{ fontSize: '1rem', fontWeight: '700', color: '#4ade80', display: 'flex', alignItems: 'center', gap: 2 }}>
                  ₹{costAccumulated}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
              Real-time calculations updated via Functional Time loops.
            </div>
          </div>
        )}

        {mode === 'completed' && (
          /* Session Completed Summary Screen */
          <div className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>
            <div>
              <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: 16, border: '2px solid var(--primary)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'white', marginBottom: 6 }}>Charging Complete!</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Your electric vehicle has successfully charged to the target limit.
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', border: '1px solid var(--border-light)', borderRadius: 12, padding: 18 }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>Session Invoice</h4>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Target Charge Reached:</span>
                <strong style={{ color: 'white' }}>{targetCharge}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Energy:</span>
                <strong style={{ color: 'white' }}>{kwhDelivered} kWh</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Price per kWh:</span>
                <strong style={{ color: 'white' }}>₹{station.pricingPerKwh}</strong>
              </div>
              
              <hr style={{ border: 'none', borderBottom: '1px solid var(--border-light)', margin: '12px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem' }}>
                <span style={{ fontWeight: '600', color: 'white' }}>Total Cost:</span>
                <strong style={{ color: '#4ade80' }}>₹{costAccumulated}</strong>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="btn-primary"
              style={{ padding: 14 }}
            >
              Return to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
