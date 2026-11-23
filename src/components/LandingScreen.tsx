// ==============================================================================
// LandingScreen.tsx — Portada Principal "SUPER N" (Estilo Superfighters Minimal)
// - Fondo: Almacén Clandestino 3D PBR (Three.js) con niebla, luces, lluvia y charcos
// - Parallax: Cámara 3D suavizada + micro-parallax del título con el ratón
// - Título: "SUPER N" pixel art desgastado con doble barra horizontal (ref. SF)
// - Botón: "PLAY" amarillo pequeño, nítido y discreto debajo del título
// - Transición: Fundido a negro de 500 ms al pulsar PLAY / Enter / Espacio
// ==============================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { sounds } from '../game/SoundEffects';
import { Warehouse3DCanvas } from './Warehouse3DCanvas';

interface LandingScreenProps {
  onEnter: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onEnter }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [webglUnavailable, setWebglUnavailable] = useState<boolean>(false);

  const titleLayerRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const titleOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleEnter = useCallback(() => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    sounds.resumeAudio();
    sounds.playPickup();

    setTimeout(() => {
      onEnter();
    }, 500);
  }, [isFadingOut, onEnter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleEnter]);

  // Micro-parallax sutil sobre la capa del título sincronizado con el puntero
  useEffect(() => {
    let rafId = 0;

    const tick = () => {
      const targetX = -pointerRef.current.x * 7;
      const targetY = -pointerRef.current.y * 4;
      const cur = titleOffsetRef.current;

      cur.x += (targetX - cur.x) * 0.08;
      cur.y += (targetY - cur.y) * 0.08;

      if (titleLayerRef.current) {
        titleLayerRef.current.style.transform = `translate3d(${cur.x.toFixed(2)}px, ${cur.y.toFixed(2)}px, 0)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    pointerRef.current = {
      x: Math.max(-1, Math.min(1, normX)),
      y: Math.max(-1, Math.min(1, normY)),
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    pointerRef.current = { x: 0, y: 0 };
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-screen bg-[#060a12] flex items-center justify-center font-pixel select-none overflow-hidden"
    >
      {/* Capa de Fondo 3D PBR (Three.js) con respaldo automático si WebGL no está disponible */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {!webglUnavailable ? (
          <Warehouse3DCanvas
            pointerRef={pointerRef}
            onUnavailable={() => setWebglUnavailable(true)}
          />
        ) : (
          <img
            src="/assets/backgrounds/warehouse.jpg"
            alt="Almacén Clandestino"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover select-none"
          />
        )}
      </div>

      {/* Oscurecimiento sutil y viñeta inferior para que el título y PLAY destaquen sobre la escena 3D */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(0, 0, 0, 0.08) 32%, rgba(0, 0, 0, 0.68) 100%), linear-gradient(to top, rgba(0, 0, 0, 0.82) 0%, rgba(0, 0, 0, 0.36) 28%, transparent 56%)',
        }}
      />

      {/* Bloque Central-Inferior Estilo Superfighters: Título "SUPER N" + Botón "PLAY" pequeño */}
      <div className="absolute bottom-[10%] sm:bottom-[12%] inset-x-0 z-20 flex flex-col items-center">
        <div ref={titleLayerRef} className="flex flex-col items-center will-change-transform">
          {/* Título "SUPER N" con doble barra horizontal y textura pixelada desgastada */}
          <svg
            viewBox="0 0 246 66"
            className="w-[230px] sm:w-[300px] md:w-[340px] h-auto overflow-visible"
            style={{
              shapeRendering: 'crispEdges',
              filter: 'drop-shadow(0 4px 0 #000000) drop-shadow(0 8px 18px rgba(0,0,0,0.95))',
            }}
            aria-label="SUPER N"
          >
            <defs>
              {/* Patrón de desgaste pixelado sobre las letras y barras */}
              <mask id="sfDistressMask">
                <rect x="0" y="0" width="246" height="66" fill="white" />
                <g fill="black">
                  <rect x="14" y="5" width="3" height="2" />
                  <rect x="48" y="4" width="2" height="1" />
                  <rect x="92" y="8" width="4" height="2" />
                  <rect x="141" y="5" width="3" height="2" />
                  <rect x="196" y="4" width="2" height="2" />
                  <rect x="224" y="8" width="4" height="2" />

                  <rect x="22" y="18" width="2" height="2" />
                  <rect x="34" y="29" width="2" height="3" />
                  <rect x="54" y="23" width="2" height="2" />
                  <rect x="67" y="39" width="3" height="2" />
                  <rect x="90" y="19" width="2" height="3" />
                  <rect x="105" y="35" width="2" height="2" />
                  <rect x="130" y="26" width="2" height="2" />
                  <rect x="147" y="42" width="3" height="2" />
                  <rect x="166" y="21" width="2" height="3" />
                  <rect x="200" y="21" width="2" height="3" />
                  <rect x="212" y="34" width="2" height="2" />
                  <rect x="226" y="25" width="2" height="3" />

                  <rect x="28" y="56" width="4" height="2" />
                  <rect x="77" y="61" width="3" height="1" />
                  <rect x="122" y="56" width="2" height="2" />
                  <rect x="168" y="60" width="4" height="2" />
                  <rect x="208" y="56" width="3" height="2" />
                </g>
              </mask>
            </defs>

            <g mask="url(#sfDistressMask)">
              {/* Doble barra superior */}
              <rect x="8" y="4" width="230" height="2" fill="#f5f5f5" />
              <rect x="8" y="8" width="230" height="3" fill="#f5f5f5" />

              {/* Letras pixeladas "SUPER" en blanco sólido */}
              <g fill="#f5f5f5">
                {/* S (14..38) */}
                <path d="M14 16 h24 v6 h-18 v5 h18 v19 h-24 v-6 h18 v-7 h-18 z" />
                {/* U (46..72) */}
                <path d="M46 16 h7 v24 h12 v-24 h7 v30 h-26 z" />
                {/* P (80..105) */}
                <path d="M80 16 h25 v19 h-18 v11 h-7 z M87 22 v7 h11 v-7 z" fillRule="evenodd" />
                {/* E (113..137) */}
                <path d="M113 16 h24 v6 h-17 v6 h14 v6 h-14 v6 h17 v6 h-24 z" />
                {/* R (145..170) */}
                <path d="M145 16 h25 v16 h-3 v3 h3 v11 h-8 v-12 h-10 v12 h-7 z M152 22 v6 h11 v-6 z" fillRule="evenodd" />
              </g>

              {/* Letra "N" (194..232) destacada en rojo carmesí con bloque pixel grueso */}
              <g fill="#ef4444">
                <path d="M194 16 h9 v6 h6 v4 h6 v4 h7 v-14 h10 v30 h-10 v-6 h-6 v-4 h-6 v-4 h-7 v14 h-9 z" />
              </g>

              {/* Doble barra inferior */}
              <rect x="8" y="55" width="230" height="3" fill="#f5f5f5" />
              <rect x="8" y="60" width="230" height="2" fill="#f5f5f5" />
            </g>
          </svg>

          {/* Botón "PLAY" pequeño amarillo estilo arcade justo debajo del logo */}
          <button
            type="button"
            disabled={isFadingOut}
            onClick={handleEnter}
            onMouseEnter={() => {
              if (!isFadingOut) {
                setIsHovered(true);
                sounds.playPickup();
              }
            }}
            onMouseLeave={() => setIsHovered(false)}
            className={`mt-5 sm:mt-6 px-3 py-1 font-pixel text-[11px] sm:text-xs font-bold tracking-[0.28em] uppercase cursor-pointer outline-none transition-all duration-150 ${
              isHovered
                ? 'scale-110 text-white'
                : 'text-[#facc15]'
            } ${isFadingOut ? 'pointer-events-none opacity-60' : ''}`}
            style={{
              textShadow: isHovered
                ? '0 0 12px rgba(250, 204, 21, 0.95), 2px 2px 0 #000, -1px -1px 0 #000'
                : '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
            }}
          >
            PLAY
          </button>
        </div>
      </div>

      {/* Fundido suave a negro de 500ms al pulsar PLAY */}
      <div
        className={`pointer-events-none fixed inset-0 bg-black z-50 transition-opacity duration-500 ${
          isFadingOut ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

export default LandingScreen;



