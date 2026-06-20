import React from 'react';

export default function Map({ stations, userLocation, selectedStation, activeRoute, animatedProgress = 0, onSelectStation }) {
  // SVG size is 370 x 380
  const width = 370;
  const height = 380;

  // Grid/Roads definitions to make it look like a real stylized map
  const roads = [
    // Vertical Roads
    { x1: 50, y1: 0, x2: 50, y2: 380 },
    { x1: 185, y1: 0, x2: 185, y2: 380 },
    { x1: 320, y1: 0, x2: 320, y2: 380 },
    // Horizontal Roads
    { x1: 0, y1: 70, x2: 370, y2: 70 },
    { x1: 0, y1: 190, x2: 370, y2: 190 },
    { x1: 0, y1: 310, x2: 370, y2: 310 },
    // Diagonal/Curves for detail
    { x1: 50, y1: 70, x2: 185, y2: 190 },
    { x1: 185, y1: 190, x2: 320, y2: 310 }
  ];

  // Map stations to local coordinates in the SVG grid
  // Stations: Tata, Jio, Zeon, Relux, Shell
  const getStationCoords = (name) => {
    switch (name) {
      case 'Tata Power Charging Station':
        return { x: 185, y: 70, color: '#22c55e' };
      case 'Jio-bp pulse Charging Station':
        return { x: 320, y: 190, color: '#3b82f6' };
      case 'Zeon Charging Station':
        return { x: 50, y: 310, color: '#eab308' };
      case 'Relux Charging Station':
        return { x: 50, y: 70, color: '#ec4899' };
      case 'Shell Recharge Station':
        return { x: 320, y: 70, color: '#a855f7' };
      default:
        return { x: 185, y: 190, color: '#22c55e' };
    }
  };

  // User starting point coordinates (matching Figma Start Screen)
  const userX = 185;
  const userY = 310;

  // Calculate route path if active
  const renderRoutePath = () => {
    if (!selectedStation) return null;
    const dest = getStationCoords(selectedStation.name);
    
    // Draw route along grid lines
    // Path: start from userX,userY (185, 310) -> move to destination
    let pathD = `M ${userX} ${userY} `;
    
    if (selectedStation.name === 'Tata Power Charging Station') {
      // 185,310 -> 185,70
      pathD += `L 185 70`;
    } else if (selectedStation.name === 'Jio-bp pulse Charging Station') {
      // 185,310 -> 185,190 -> 320,190
      pathD += `L 185 190 L 320 190`;
    } else if (selectedStation.name === 'Zeon Charging Station') {
      // 185,310 -> 50,310
      pathD += `L 50 310`;
    } else if (selectedStation.name === 'Relux Charging Station') {
      // 185,310 -> 50,190 -> 50,70
      pathD += `L 50 310 L 50 70`;
    } else if (selectedStation.name === 'Shell Recharge Station') {
      // 185,310 -> 185,70 -> 320,70
      pathD += `L 185 70 L 320 70`;
    }

    // Dynamic dot projection along the route for drive simulation
    return (
      <>
        {/* Background static route line */}
        <path
          d={pathD}
          fill="none"
          stroke="#1e3a8a"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Pulsing active route line */}
        <path
          d={pathD}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="8 6"
          className="route-dash"
          style={{
            animation: 'dash 30s linear infinite'
          }}
        />
      </>
    );
  };

  // Find exact position of vehicle during driving simulation
  const getCarPosition = () => {
    if (!selectedStation) return { x: userX, y: userY };
    const dest = getStationCoords(selectedStation.name);
    
    // Linearly interpolate between User position and Destination position based on animatedProgress (0 to 1)
    let segments = [];
    if (selectedStation.name === 'Tata Power Charging Station') {
      segments = [
        { x1: userX, y1: userY, x2: 185, y2: 70 }
      ];
    } else if (selectedStation.name === 'Jio-bp pulse Charging Station') {
      segments = [
        { x1: userX, y1: userY, x2: 185, y2: 190 },
        { x1: 185, y1: 190, x2: 320, y2: 190 }
      ];
    } else if (selectedStation.name === 'Zeon Charging Station') {
      segments = [
        { x1: userX, y1: userY, x2: 50, y2: 310 }
      ];
    } else if (selectedStation.name === 'Relux Charging Station') {
      segments = [
        { x1: userX, y1: userY, x2: 50, y2: 310 },
        { x1: 50, y1: 310, x2: 50, y2: 70 }
      ];
    } else if (selectedStation.name === 'Shell Recharge Station') {
      segments = [
        { x1: userX, y1: userY, x2: 185, y2: 70 },
        { x1: 185, y1: 70, x2: 320, y2: 70 }
      ];
    }

    // Calculate total path length
    let totalLength = 0;
    const segLengths = segments.map(s => {
      const len = Math.sqrt(Math.pow(s.x2 - s.x1, 2) + Math.pow(s.y2 - s.y1, 2));
      totalLength += len;
      return len;
    });

    const targetDist = animatedProgress * totalLength;
    let currentDist = 0;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const len = segLengths[i];
      if (currentDist + len >= targetDist) {
        const segRatio = (targetDist - currentDist) / len;
        return {
          x: seg.x1 + segRatio * (seg.x2 - seg.x1),
          y: seg.y1 + segRatio * (seg.y2 - seg.y1)
        };
      }
      currentDist += len;
    }

    return { x: dest.x, y: dest.y };
  };

  const carPos = activeRoute ? getCarPosition() : { x: userX, y: userY };

  return (
    <div className="map-canvas-container">
      {/* Dynamic Keyframe style for route animation */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -1000;
          }
        }
        .route-dash {
          filter: drop-shadow(0 0 4px #3b82f6);
        }
      `}</style>

      <svg viewBox={`0 0 ${width} ${height}`} className="map-svg">
        {/* Grid lines in background */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* City Parks / Greeneries */}
        <rect x="75" y="100" width="80" height="60" rx="10" fill="#0c2d1b" opacity="0.4" />
        <rect x="210" y="100" width="85" height="60" rx="10" fill="#0c2d1b" opacity="0.4" />
        <rect x="75" y="210" width="80" height="85" rx="10" fill="#0c2d1b" opacity="0.4" />
        <rect x="210" y="210" width="85" height="85" rx="10" fill="#0c2d1b" opacity="0.4" />

        {/* Roads drawing */}
        {roads.map((road, idx) => (
          <line
            key={idx}
            x1={road.x1}
            y1={road.y1}
            x2={road.x2}
            y2={road.y2}
            stroke="#1e293b"
            strokeWidth="20"
            strokeLinecap="round"
          />
        ))}

        {/* Inner lane markers */}
        {roads.map((road, idx) => (
          <line
            key={`inner-${idx}`}
            x1={road.x1}
            y1={road.y1}
            x2={road.x2}
            y2={road.y2}
            stroke="#334155"
            strokeWidth="2"
            strokeDasharray="4 6"
          />
        ))}

        {/* Active Route drawing */}
        {renderRoutePath()}

        {/* Station Markers */}
        {stations.map((st) => {
          const coords = getStationCoords(st.name);
          const isSelected = selectedStation && selectedStation.name === st.name;
          return (
            <g
              key={st._id || st.name}
              onClick={() => onSelectStation && onSelectStation(st)}
              style={{ cursor: 'pointer' }}
            >
              {/* Outer pulsing ring for selected station */}
              {isSelected && (
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r="22"
                  fill="none"
                  stroke={coords.color}
                  strokeWidth="2"
                  opacity="0.6"
                >
                  <animate attributeName="r" values="14;25;14" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Station body glow */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r="13"
                fill={coords.color}
                opacity={isSelected ? "0.3" : "0.15"}
              />

              {/* Station core */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r="7"
                fill={coords.color}
                stroke="#0f172a"
                strokeWidth="2"
              />

              {/* Text label */}
              <text
                x={coords.x}
                y={coords.y - 12}
                fill="#ffffff"
                fontSize="8.5"
                fontWeight="700"
                textAnchor="middle"
                style={{
                  textShadow: '0px 1px 3px rgba(0,0,0,0.9)',
                  pointerEvents: 'none'
                }}
              >
                {st.name.split(' ')[0]}
              </text>
            </g>
          );
        })}

        {/* User Vehicle Pin */}
        <g transform={`translate(${carPos.x}, ${carPos.y})`}>
          {/* Pulse ring under car */}
          <circle cx="0" cy="0" r="14" fill="#3b82f6" opacity="0.3">
            <animate attributeName="r" values="8;16;8" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
          </circle>
          
          {/* Outer Ring */}
          <circle cx="0" cy="0" r="7.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
          {/* Inner core */}
          <circle cx="0" cy="0" r="3.5" fill="#0f172a" />
        </g>
      </svg>

      {/* Floating map controls */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: '600',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          +
        </div>
        <div
          style={{
            width: 32,
            height: 32,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: '600',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          -
        </div>
      </div>
    </div>
  );
}
