// ==============================================================================
// GameBackdrop.tsx — Fondo Atmosférico Unificado "Urban Noir" de superN
// Reutilizable en Landing, ModeSelect, MainMenu, WorldSelect y Arena.
// Incluye: degradado radial profundo, parallax urbano (3 capas), vigas/tuberías,
// viñeta arcade y scanlines CRT optimizadas (< 1ms por frame).
// ==============================================================================

import React from 'react';

interface GameBackdropProps {
  skyColors?: string[];
  opacity?: number;
  showParallaxCity?: boolean;
  showIndustrialPipes?: boolean;
  className?: string;
}

export const GameBackdrop: React.FC<GameBackdropProps> = ({
  skyColors,
  opacity = 1,
  showParallaxCity = true,
  showIndustrialPipes = true,
  className = '',
}) => {
  // Gradiente dinámico adaptable al cielo del mundo activo o por defecto Noir carmesí
  const backgroundStyle = skyColors && skyColors.length >= 2
    ? `radial-gradient(ellipse at 50% 35%, ${skyColors[0]} 0%, ${skyColors[1]} 55%, #050510 100%)`
    : 'radial-gradient(ellipse at 50% 35%, #1A0505 0%, #120409 38%, #090614 72%, #050510 100%)';

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none -z-30 ${className}`}
      style={{
        background: backgroundStyle,
        opacity,
      }}
    >
      {/* ── SCANLINES CRT HORIZONTALES (6% OPACIDAD) ── */}
      <div
        className="absolute inset-0 opacity-[0.06] z-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.95) 0px, rgba(0, 0, 0, 0.95) 1px, transparent 1px, transparent 3px)',
          backgroundSize: '100% 3px',
        }}
      />

      {/* ── VIÑETA MONITOR ARCADE NOIR ── */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 40%, rgba(5, 5, 16, 0.55) 75%, rgba(0, 0, 0, 0.92) 100%)',
        }}
      />

      {/* ── BRUMA / NIEBLA CARMESÍ AMBIENTAL EN EL HORIZONTE ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-96 z-10 opacity-30"
        style={{
          background:
            'linear-gradient(to top, rgba(220, 38, 38, 0.15) 0%, rgba(20, 5, 10, 0.05) 50%, transparent 100%)',
        }}
      />

      {/* ── PARALLAX ESTÁTICO DE CIUDAD NOIR (SVG CRISP) ── */}
      {showParallaxCity && (
        <svg
          className="absolute bottom-0 left-0 w-full h-[52vh] min-h-[280px] max-h-[480px] z-0 opacity-80"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
          style={{ shapeRendering: 'crispEdges' }}
        >
          <defs>
            <linearGradient id="backdropFarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0e0a18" />
              <stop offset="100%" stopColor="#06050e" />
            </linearGradient>
            <linearGradient id="backdropMidGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14070c" />
              <stop offset="100%" stopColor="#080408" />
            </linearGradient>
            <linearGradient id="backdropNearGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c0a0f" />
              <stop offset="100%" stopColor="#060204" />
            </linearGradient>
          </defs>

          {/* Rascacielos lejanos con balizas rojas */}
          <g fill="url(#backdropFarGrad)">
            <rect x="0" y="90" width="75" height="310" />
            <rect x="65" y="140" width="60" height="260" />
            <line x1="38" y1="30" x2="38" y2="90" stroke="#1f182f" strokeWidth="2" />
            <circle cx="38" cy="30" r="3" fill="#ef4444" className="animate-beacon" />

            <rect x="150" y="60" width="95" height="340" />
            <polygon points="150,60 197,35 245,60" fill="#171128" />
            <line x1="197" y1="15" x2="197" y2="35" stroke="#251c3d" strokeWidth="2" />
            <circle cx="197" cy="15" r="3" fill="#ef4444" className="animate-beacon" />

            <rect x="270" y="120" width="80" height="280" />
            <rect x="365" y="80" width="110" height="320" />
            <rect x="410" y="55" width="20" height="25" />

            <rect x="520" y="40" width="160" height="360" />
            <rect x="560" y="20" width="80" height="20" />
            <line x1="600" y1="0" x2="600" y2="20" stroke="#2a1f45" strokeWidth="2" />
            <circle cx="600" cy="2" r="3.5" fill="#ef4444" className="animate-beacon" />

            <rect x="720" y="110" width="90" height="290" />
            <rect x="830" y="75" width="105" height="325" />
            <rect x="955" y="130" width="85" height="270" />
            <rect x="1055" y="50" width="145" height="350" />
            <line x1="1120" y1="20" x2="1120" y2="50" stroke="#1f182f" strokeWidth="2" />
            <circle cx="1120" cy="20" r="3" fill="#ef4444" className="animate-beacon" />
          </g>

          {/* Ventanas ámbar parpadeantes */}
          <g fill="#f59e0b">
            <rect x="14" y="110" width="4" height="6" opacity="0.6" />
            <rect x="44" y="130" width="4" height="6" opacity="0.7" className="animate-window-flicker" />
            <rect x="165" y="90" width="5" height="8" opacity="0.75" />
            <rect x="210" y="120" width="5" height="8" opacity="0.65" />
            <rect x="165" y="150" width="5" height="8" opacity="0.8" className="animate-window-flicker" />
            <rect x="380" y="110" width="6" height="6" opacity="0.5" />
            <rect x="400" y="110" width="6" height="6" opacity="0.8" />
            <rect x="540" y="80" width="6" height="8" opacity="0.4" />
            <rect x="580" y="80" width="6" height="8" opacity="0.7" />
            <rect x="560" y="120" width="6" height="8" opacity="0.75" className="animate-window-flicker" />
            <rect x="740" y="140" width="5" height="7" opacity="0.6" />
            <rect x="850" y="100" width="6" height="8" opacity="0.7" />
            <rect x="910" y="160" width="6" height="8" opacity="0.75" className="animate-window-flicker" />
            <rect x="1075" y="90" width="5" height="8" opacity="0.6" />
            <rect x="1105" y="120" width="5" height="8" opacity="0.7" />
          </g>

          {/* Fábricas y almacenes intermedios */}
          <g fill="url(#backdropMidGrad)">
            <rect x="85" y="210" width="40" height="28" rx="2" />
            <polygon points="85,210 105,198 125,210" />
            <line x1="90" y1="238" x2="90" y2="260" stroke="#0e0408" strokeWidth="3" />
            <line x1="120" y1="238" x2="120" y2="260" stroke="#0e0408" strokeWidth="3" />
            <polygon points="230,280 255,245 255,280 280,245 280,280 305,245 305,280 305,370 230,370" />
            <rect x="470" y="230" width="90" height="170" />
            <rect x="480" y="180" width="16" height="50" />
            <rect x="780" y="220" width="120" height="180" />
            <polygon points="780,220 840,195 900,220" />
            <rect x="980" y="240" width="85" height="160" />
          </g>

          {/* Grúas industriales y tuberías de presión */}
          {showIndustrialPipes && (
            <g fill="url(#backdropNearGrad)" stroke="#1c0a0f">
              {/* Grúa de pórtico izquierda */}
              <g strokeWidth="3">
                <line x1="30" y1="360" x2="70" y2="160" />
                <line x1="110" y1="360" x2="70" y2="160" />
                <line x1="42" y1="300" x2="98" y2="300" strokeWidth="2" />
                <line x1="52" y1="240" x2="88" y2="240" strokeWidth="2" />
                <line x1="20" y1="160" x2="165" y2="160" strokeWidth="4" />
                <line x1="70" y1="130" x2="70" y2="160" strokeWidth="3" />
                <rect x="80" y="162" width="16" height="14" fill="#2d0b13" stroke="none" />
                <line x1="140" y1="160" x2="140" y2="230" stroke="#fca5a5" strokeWidth="1.5" strokeDasharray="3 3" />
                <rect x="135" y="230" width="10" height="12" fill="#ef4444" stroke="none" />
              </g>

              {/* Grúa derecha */}
              <g strokeWidth="2.5">
                <line x1="1060" y1="360" x2="1080" y2="150" />
                <line x1="1100" y1="360" x2="1080" y2="150" />
                <line x1="1020" y1="150" x2="1170" y2="150" strokeWidth="3.5" />
                <line x1="1080" y1="125" x2="1080" y2="150" strokeWidth="3" />
                <line x1="1140" y1="150" x2="1140" y2="220" stroke="#fca5a5" strokeWidth="1.5" strokeDasharray="3 3" />
                <polygon points="1136,220 1144,220 1140,230" fill="#f59e0b" stroke="none" />
              </g>

              {/* Tuberías industriales */}
              <path
                d="M 280 390 L 280 340 L 340 340 L 340 310 L 400 310 L 400 390"
                fill="none"
                stroke="#2d0b13"
                strokeWidth="7"
              />
              <circle cx="340" cy="325" r="5" fill="#ef4444" stroke="none" />
              <path
                d="M 870 390 L 870 330 L 920 330 L 920 390"
                fill="none"
                stroke="#2d0b13"
                strokeWidth="6"
              />
              {/* Cornisa inferior */}
              <rect x="0" y="375" width="1200" height="25" fill="#0c0407" stroke="none" />
              <line x1="0" y1="375" x2="1200" y2="375" stroke="#3b0f19" strokeWidth="3" />
            </g>
          )}
        </svg>
      )}
    </div>
  );
};

export default GameBackdrop;
