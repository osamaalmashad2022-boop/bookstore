import React from 'react';

interface CandleProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  state?: 'lit' | 'unlit';
  withPlate?: boolean;
  withGlow?: boolean;
  withEmbers?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Candle: React.FC<CandleProps> = ({
  size = 'md',
  state = 'lit',
  withPlate = true,
  withGlow = true,
  withEmbers = false,
  className = '',
  onClick,
}) => {
  const isLit = state === 'lit';

  const sizeDimensions = {
    xs: { width: 18, height: 26 },
    sm: { width: 26, height: 38 },
    md: { width: 44, height: 64 },
    lg: { width: 68, height: 96 },
    xl: { width: 96, height: 136 },
  };

  const { width, height } = sizeDimensions[size];

  // Unique IDs for SVG gradient uniqueness
  const uid = React.useId().replace(/:/g, '');

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width, height }}
    >
      <svg
        viewBox="0 0 60 90"
        width="100%"
        height="100%"
        className="overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Flame Gradient */}
          <linearGradient id={`flameGrad_${uid}`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="20%" stopColor="#FFF275" />
            <stop offset="55%" stopColor="#FF9E00" />
            <stop offset="85%" stopColor="#E63900" />
            <stop offset="100%" stopColor="#7A0900" />
          </linearGradient>

          {/* Candle Wax Shading */}
          <linearGradient id={`waxGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D9C9B0" />
            <stop offset="35%" stopColor="#FAF5EB" />
            <stop offset="70%" stopColor="#FFFDF8" />
            <stop offset="100%" stopColor="#D4C3A9" />
          </linearGradient>

          {/* Melted Top Wax Pool */}
          <linearGradient id={`meltGrad_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C2B295" />
            <stop offset="100%" stopColor="#EFE7D8" />
          </linearGradient>

          {/* Antique Gold Brass Plate */}
          <linearGradient id={`brassGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE8A3" />
            <stop offset="35%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#8C6D1F" />
            <stop offset="100%" stopColor="#4A370E" />
          </linearGradient>

          {/* Radial Ambient Glow */}
          <radialGradient id={`haloGrad_${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFB300" stopOpacity="0.75" />
            <stop offset="35%" stopColor="#FF7700" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#D4AF37" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Soft Glow Filter */}
          <filter id={`flameGlow_${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Volumetric Ambient Light Halo */}
        {isLit && withGlow && (
          <ellipse
            cx="30"
            cy="24"
            rx="36"
            ry="32"
            fill={`url(#haloGrad_${uid})`}
            className="candle-pulse-halo pointer-events-none"
          />
        )}

        {/* 2. Antique Brass Saucer / Plate Base */}
        {withPlate && (
          <g id="plate">
            {/* Saucer Rim Shadow */}
            <ellipse cx="30" cy="85" rx="26" ry="4" fill="#000000" opacity="0.4" />
            {/* Brass Plate Outer */}
            <path
              d="M 6,83 C 6,80 18,78 30,78 C 42,78 54,80 54,83 C 54,87 42,88 30,88 C 18,88 6,87 6,83 Z"
              fill={`url(#brassGrad_${uid})`}
              stroke="#594314"
              strokeWidth="0.8"
            />
            {/* Inner Plate Lip */}
            <ellipse cx="30" cy="82" rx="20" ry="2.5" fill="#523D10" opacity="0.5" />
            {/* Plate Highlight */}
            <path
              d="M 12,83 C 18,84.5 42,84.5 48,83"
              stroke="#FFF3B8"
              strokeWidth="0.7"
              fill="none"
              opacity="0.75"
            />
            {/* Small Victorian Finger Loop Handle (Left) */}
            <path
              d="M 10,81 C 4,80 1,73 4,68 C 7,64 12,67 12,71"
              fill="none"
              stroke={`url(#brassGrad_${uid})`}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* 3. Sculpted Wax Pillar */}
        <g id="waxPillar">
          {/* Main Wax Cylinder */}
          <path
            d="M 20,44 L 40,44 L 39,81 L 21,81 Z"
            fill={`url(#waxGrad_${uid})`}
            stroke="#9E8D74"
            strokeWidth="0.6"
          />

          {/* Natural Wax Drips */}
          <path
            d="M 20,44 C 20,53 23,55 22,62 C 21,65 19,63 19,58 Z"
            fill="#FFFDF8"
            opacity="0.9"
          />
          <path
            d="M 37,44 C 38,50 40,52 39,57 C 38,60 36,58 37,52 Z"
            fill="#EADBC3"
            opacity="0.8"
          />
          <path
            d="M 27,45 C 27,51 29,54 28,59 C 27,61 26,60 26,53 Z"
            fill="#FFFDF8"
            opacity="0.75"
          />

          {/* Wax Top Melt Rim Depression */}
          <ellipse
            cx="30"
            cy="44"
            rx="10"
            ry="3.2"
            fill={`url(#meltGrad_${uid})`}
            stroke="#8F7E66"
            strokeWidth="0.6"
          />
          {/* Liquid Molten Wax Core */}
          <ellipse cx="30" cy="44.2" rx="7" ry="1.8" fill="#FFF2BD" opacity="0.6" />
        </g>

        {/* 4. Wick */}
        <path
          d="M 30,44 Q 31,37 29.5,32"
          fill="none"
          stroke="#26190D"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* 5. Living Flame (When Lit) */}
        {isLit ? (
          <g
            id="flameGroup"
            className="candle-flame-anim"
            style={{ transformOrigin: '30px 32px' }}
            filter={`url(#flameGlow_${uid})`}
          >
            {/* Outer Radiant Flame Teardrop */}
            <path
              d="M 30,8 C 36,17 41,23 39,29 C 37,35 32,36 30,36 C 28,36 23,35 21,29 C 19,23 24,17 30,8 Z"
              fill={`url(#flameGrad_${uid})`}
            />

            {/* Inner Golden Core */}
            <path
              d="M 30,17 C 33,22 35,26 34,29 C 33,33 31,34 30,34 C 29,34 27,33 26,29 C 25,26 27,22 30,17 Z"
              fill="#FFFBE6"
            />

            {/* Pure White Incandescent Heart */}
            <ellipse cx="30" cy="28" rx="2" ry="4" fill="#FFFFFF" />

            {/* Base Blue Ignition Ember */}
            <ellipse cx="30.2" cy="33.5" rx="3.5" ry="1.5" fill="#38BDF8" opacity="0.65" />
          </g>
        ) : (
          /* 6. Realistic Smoke Ribbon (When Unlit) */
          <g id="smokeWisp" opacity="0.55">
            <path
              d="M 29.5,32 Q 26,24 32,18 T 28,8"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeDasharray="2 3"
              className="animate-pulse"
            />
            <circle cx="29" cy="32" r="1.5" fill="#52525B" />
          </g>
        )}

        {/* 7. Floating Rising Embers */}
        {isLit && withEmbers && (
          <g fill="#FDE047" opacity="0.85">
            <circle cx="27" cy="6" r="1" className="ember-particle" />
            <circle cx="33" cy="3" r="0.8" className="ember-particle" style={{ animationDelay: '0.6s' }} />
            <circle cx="30" cy="1" r="1.2" className="ember-particle" style={{ animationDelay: '1.2s' }} />
          </g>
        )}
      </svg>
    </div>
  );
};

