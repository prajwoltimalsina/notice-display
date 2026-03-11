import { useState, useEffect } from "react";

export function AnalogClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = hours * 30 + minutes * 0.5;

  return (
    <div className="relative w-full aspect-square">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Clock face */}
        <circle
          cx="100"
          cy="100"
          r="95"
          fill="#FFF8DC"
          stroke="#D4A574"
          strokeWidth="4"
        />

        {/* Hour markers */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x1 = 100 + 75 * Math.cos(angle);
          const y1 = 100 + 75 * Math.sin(angle);
          const x2 = 100 + 85 * Math.cos(angle);
          const y2 = 100 + 85 * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#333"
              strokeWidth={i % 3 === 0 ? 3 : 1}
            />
          );
        })}

        {/* Hour numbers */}
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x = 100 + 65 * Math.cos(angle);
          const y = 100 + 65 * Math.sin(angle);
          return (
            <text
              key={num}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-slate-800 font-semibold"
              fontSize="14"
            >
              {num}
            </text>
          );
        })}

        {/* Hour hand */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="55"
          stroke="#1e3a5f"
          strokeWidth="5"
          strokeLinecap="round"
          transform={`rotate(${hourDeg}, 100, 100)`}
        />

        {/* Minute hand */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="35"
          stroke="#1e3a5f"
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${minuteDeg}, 100, 100)`}
        />

        {/* Second hand */}
        <line
          x1="100"
          y1="110"
          x2="100"
          y2="25"
          stroke="#FF6B35"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${secondDeg}, 100, 100)`}
        />

        {/* Center dot */}
        <circle cx="100" cy="100" r="6" fill="#FF6B35" />
        <circle cx="100" cy="100" r="3" fill="#1e3a5f" />
      </svg>
    </div>
  );
}
