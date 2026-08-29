import React from 'react';

interface RadarChartProps {
  data: { name: string; score: number }[];
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, size = 320 }) => {
  if (!data || data.length === 0) return null;

  const center = size / 2;
  const radius = size * 0.38;
  const totalAxes = data.length;
  const angleStep = (2 * Math.PI) / totalAxes;

  // Grid concentric circles
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  // Helper to convert polar to cartesian
  const getCoordinates = (valueRatio: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * valueRatio;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Polygon points string
  const polygonPoints = data.map((d, i) => {
    const ratio = Math.max(d.score, 5) / 100;
    const { x, y } = getCoordinates(ratio, i);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Grid Rings */}
        {gridLevels.map((level, lvlIdx) => (
          <circle
            key={lvlIdx}
            cx={center}
            cy={center}
            r={radius * level}
            fill="none"
            stroke="#374151"
            strokeWidth="1"
            strokeDasharray={lvlIdx < 3 ? '4,4' : 'none'}
          />
        ))}

        {/* Axes Lines & Labels */}
        {data.map((item, i) => {
          const { x, y } = getCoordinates(1.0, i);
          const labelCoords = getCoordinates(1.18, i);
          return (
            <g key={i}>
              <line
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#4B5563"
                strokeWidth="1"
              />
              <text
                x={labelCoords.x}
                y={labelCoords.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-300 text-[11px] font-semibold tracking-wide"
              >
                {item.name}
              </text>
            </g>
          );
        })}

        {/* Filled Data Polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(99, 102, 241, 0.35)"
          stroke="#6366F1"
          strokeWidth="2.5"
          className="drop-shadow-glow transition-all duration-500"
        />

        {/* Data Vertices Nodes */}
        {data.map((item, i) => {
          const ratio = Math.max(item.score, 5) / 100;
          const { x, y } = getCoordinates(ratio, i);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4.5"
              className="fill-emerald-400 stroke-dark-900 stroke-2"
            />
          );
        })}
      </svg>
    </div>
  );
};
