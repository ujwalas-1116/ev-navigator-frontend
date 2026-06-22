import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import { Search, SlidersHorizontal, MapPin, Star, Clock, Battery, LogOut } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Dashboard({ user, onLogout }) {
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeed, setSelectedSpeed] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Mock data as immediate fallback
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

  // Fetch stations on mount
  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/stations`);
        if (response.ok) {
          const data = await response.json();
          setStations(data);
        } else {
          setStations(mockStations);
        }
      } catch (err) {
        console.warn('API connection failed, loading mock local stations.');
        setStations(mockStations);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  // Filter stations logic
  useEffect(() => {
    let result = stations;

    if (searchQuery) {
      result = result.filter(st =>
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSpeed) {
      result = result.filter(st => st.chargingSpeed === selectedSpeed);
    }

    if (selectedType) {
      result = result.filter(st => st.chargerTypes.includes(selectedType));
    }

    setFilteredStations(result);
  }, [stations, searchQuery, selectedSpeed, selectedType]);

  const handleSelectStation = (station) => {
    setSelectedStation(station);
  };

  const handleStartNavigation = () => {
    if (selectedStation) {
      navigate(`/navigation/${selectedStation._id || selectedStation.name}`);
    }
  };

  const clearFilters = () => {
    setSelectedSpeed('');
    setSelectedType('');
    setSearchQuery('');
  };

  return (
    <div className="screen dashboard-screen">
      
      {/* Header section with User Profile */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Current Vehicle</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{user?.username || 'Guest'}</span>
            <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border-active)', fontWeight: '600' }}>
              {user?.evModel || 'Standard EV'}
            </span>
          </div>
        </div>
        
        <button onClick={onLogout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 8 }} title="Logout">
          <LogOut size={18} />
        </button>
      </div>

      {/* Map Segment */}
      <div className="dashboard-map" style={{ marginBottom: 15 }}>
        <Map
          stations={filteredStations}
          userLocation={{ lat: 12.96, lng: 77.59 }}
          selectedStation={selectedStation}
          activeRoute={false}
          onSelectStation={handleSelectStation}
        />
      </div>

      {/* Search Input Bar */}
      <div className="dashboard-search" style={{ position: 'relative', marginBottom: 12 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search EV charging station..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '12px 12px 12px 42px', borderRadius: '12px' }}
        />
        <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
      </div>

      {/* Filters Segment */}
      <div className="dashboard-filters" style={{ display: 'flex', gap: 8, marginBottom: 15, overflowX: 'auto', paddingBottom: 4 }}>
        <select
          value={selectedSpeed}
          onChange={(e) => setSelectedSpeed(e.target.value)}
          style={{
            background: selectedSpeed ? 'var(--primary)' : 'var(--bg-card)',
            color: selectedSpeed ? 'white' : 'var(--text-secondary)',
            border: '1px solid var(--border-light)',
            padding: '6px 12px',
            borderRadius: '10px',
            fontSize: '0.8rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="" style={{ background: 'var(--bg-main)' }}>Speed: All</option>
          <option value="Slow" style={{ background: 'var(--bg-main)' }}>Slow</option>
          <option value="Fast" style={{ background: 'var(--bg-main)' }}>Fast</option>
          <option value="Ultra-Fast" style={{ background: 'var(--bg-main)' }}>Ultra-Fast</option>
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{
            background: selectedType ? 'var(--primary)' : 'var(--bg-card)',
            color: selectedType ? 'white' : 'var(--text-secondary)',
            border: '1px solid var(--border-light)',
            padding: '6px 12px',
            borderRadius: '10px',
            fontSize: '0.8rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="" style={{ background: 'var(--bg-main)' }}>Charger: All</option>
          <option value="CCS2" style={{ background: 'var(--bg-main)' }}>CCS2</option>
          <option value="Type 2" style={{ background: 'var(--bg-main)' }}>Type 2</option>
          <option value="CHAdeMO" style={{ background: 'var(--bg-main)' }}>CHAdeMO</option>
        </select>

        {(selectedSpeed || selectedType || searchQuery) && (
          <button
            onClick={clearFilters}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Interactive Bottom Sheet */}
      <div className="dashboard-list" style={{ display: 'flex', flexDirection: 'column' }}>
        {selectedStation ? (
          /* Detailed view for selected station */
          <div className="glass-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1, animation: 'fadeIn 0.25s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'white' }}>{selectedStation.name}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <MapPin size={12} /> {selectedStation.address}
                </p>
              </div>
              <button
                onClick={() => setSelectedStation(null)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Star size={14} fill="#eab308" stroke="#eab308" />
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{selectedStation.rating}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({selectedStation.reviewsCount} reviews)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--primary)' }}>
                <Clock size={12} />
                <span>{selectedStation.openHours}</span>
              </div>
            </div>

            {/* Detailed specs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: 10, borderRadius: 8, border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Charger Slots</span>
                <span style={{ fontSize: '0.95rem', fontWeight: '700', color: selectedStation.slotsTotal - selectedStation.slotsOccupied > 0 ? '#4ade80' : '#f87171' }}>
                  {selectedStation.slotsTotal - selectedStation.slotsOccupied} / {selectedStation.slotsTotal} Available
                </span>
              </div>
              
              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: 10, borderRadius: 8, border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Charging Price</span>
                <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'white' }}>
                  ₹{selectedStation.pricingPerKwh}/kWh
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Plug Types</span>
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  {selectedStation.chargerTypes.map((type) => (
                    <span key={type} style={{ fontSize: '0.7rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-light)', padding: '2px 8px', borderRadius: '4px', color: 'white' }}>
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Speed</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: selectedStation.chargingSpeed === 'Slow' ? '#3b82f6' : '#22c55e', textTransform: 'uppercase' }}>
                  {selectedStation.chargingSpeed}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
              <button
                onClick={() => setSelectedStation(null)}
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 10,
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Back
              </button>
              
              <button
                onClick={handleStartNavigation}
                className="btn-primary"
                style={{ flex: 2, padding: 12, borderRadius: 10 }}
              >
                Start Navigation ({selectedStation.distanceKm} km)
              </button>
            </div>
          </div>
        ) : (
          /* Lists of stations (Direction Screen 1 in Figma) */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 }}>Nearby Stations ({filteredStations.length})</div>
            
            {filteredStations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                No charging stations found matching the filters.
              </div>
            ) : (
              filteredStations.map((st) => (
                <div
                  key={st._id || st.name}
                  onClick={() => handleSelectStation(st)}
                  className="glass-panel"
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                    border: '1px solid var(--border-light)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-active)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'white' }}>{st.name}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.75rem', color: '#eab308' }}>
                        <Star size={10} fill="#eab308" /> {st.rating}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {st.distanceKm} km away</span>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      color: st.slotsTotal - st.slotsOccupied > 0 ? '#4ade80' : '#f87171',
                      fontWeight: '600',
                      backgroundColor: st.slotsTotal - st.slotsOccupied > 0 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {st.slotsTotal - st.slotsOccupied} / {st.slotsTotal} slots
                    </span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      ₹{st.pricingPerKwh}/kWh
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
