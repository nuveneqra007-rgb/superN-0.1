// ==============================================================================
// LandingScreen.tsx — Pantalla Principal (Portada Hero "SUPER N")
// Muestra la portada completa en modo "contain" sobre negro sólido (#000000),
// botón dorado "PLAY" pulsante en la parte inferior central y fundido a negro
// de 500 ms al iniciar.
// ==============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { sounds } from '../game/SoundEffects';

interface LandingScreenProps {
  onEnter: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onEnter }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

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

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center font-pixel select-none overflow-hidden">
      {/* Portada principal en modo "contain" sobre fondo negro sólido (sin recortes) */}
      <img
        src="/assets/aistudio/image_8637b8d4.png"
        onError={(e) => {
          const img = e.currentTarget;
          if (!img.dataset.fallback) {
            img.dataset.fallback = '1';
            img.src = '/assets/cover_super_n_final.jpg';
          }
        }}
        alt="SUPER N — Portada Principal"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain pointer-events-none select-none"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Scanlines CRT muy sutiles */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.05]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0px, rgba(0, 0, 0, 0.9) 1px, transparent 1px, transparent 3px)',
          backgroundSize: '100% 3px',
        }}
      />

      {/* Botón "PLAY" dorado en la parte inferior central */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1">
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
          className={`relative px-4 py-1 font-pixel text-base sm:text-xl md:text-2xl font-bold tracking-[0.2em] uppercase cursor-pointer outline-none transition-transform duration-150 ${
            isHovered
              ? 'scale-110 text-[#FFF4A3]'
              : 'animate-play-pulse text-[#FFD700]'
          } ${isFadingOut ? 'pointer-events-none scale-95 opacity-90' : ''}`}
          style={{
            textShadow: isHovered
              ? '-2px -2px 0 #7A1C00, 2px -2px 0 #7A1C00, -2px 2px 0 #7A1C00, 2px 2px 0 #7A1C00, 0 -2px 0 #7A1C00, 0 2px 0 #7A1C00, -2px 0 0 #7A1C00, 2px 0 0 #7A1C00, 0 5px 12px rgba(0,0,0,0.95), 0 0 16px rgba(255,215,0,0.7)'
              : '-2px -2px 0 #1A0500, 2px -2px 0 #1A0500, -2px 2px 0 #1A0500, 2px 2px 0 #1A0500, 0 -2px 0 #1A0500, 0 2px 0 #1A0500, -2px 0 0 #1A0500, 2px 0 0 #1A0500, 0 5px 10px rgba(0,0,0,0.95)',
          }}
        >
          PLAY
        </button>

        <button
          type="button"
          disabled={isFadingOut}
          onClick={handleEnter}
          className="text-[8px] sm:text-[9px] tracking-[0.2em] text-neutral-200 hover:text-[#FFD700] cursor-pointer transition-colors"
          style={{
            textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
          }}
        >
          [ENTER] PARA ENTRAR
        </button>
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

