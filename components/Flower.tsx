import { useState, useEffect } from "react";

interface FlowerLoaderProps {
  totalPetals?: number;
  stepMs?: number;
  pauseMs?: number;
  petalColor?: string;
  petalWidth?: number;
  size?: string;
  scale?: number;
}

export default function FlowerLoader({
  totalPetals = 16,
  stepMs = 120,
  pauseMs = 600,
  petalColor = "white",
  petalWidth = 2.5,
  size = "w-20 h-20",
  scale = 150,
}: FlowerLoaderProps) {
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (visibleCount < totalPetals) {
      timeout = setTimeout(() => setVisibleCount((v) => v + 1), stepMs);
    } else {
      timeout = setTimeout(() => setVisibleCount(1), pauseMs);
    }

    return () => clearTimeout(timeout);
  }, [visibleCount, totalPetals, stepMs, pauseMs]);

  return (
    <svg viewBox="0 0 500 500" className={`${size} scale-[${scale/100}]`}>
      <style>{`
        @keyframes petalPop {
          0%   { opacity: 0; transform: rotate(var(--r)) scale(0.3); }
          60%  { opacity: 1; transform: rotate(var(--r)) scale(1.1); }
          100% { opacity: 1; transform: rotate(var(--r)) scale(1); }
        }
        .petal {
          transform-origin: 250px 250px;
          animation: petalPop 0.3s ease-out forwards;
        }
      `}</style>
      <defs>
        <ellipse
          id="p"
          cx="340"
          cy="250"
          rx="90"
          ry="26"
          fill="none"
          stroke={petalColor}
          strokeWidth={petalWidth}
        />
      </defs>
      <g>
        {[...Array(visibleCount)].map((_, i) => (
          <use
            key={i}
            href="#p"
            className="petal"
            style={{
              "--r": `${i * (360 / totalPetals)}deg`,
            } as React.CSSProperties}
          />
        ))}
      </g>
    </svg>
  );
}