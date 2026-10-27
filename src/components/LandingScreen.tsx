// =============================================================
// LandingScreen.tsx — Pantalla de inicio previa minimalista
// Solo Logo, Frase y Botón ENTRAR con estética neón cian/verde
// =============================================================

import React, { useEffect, useCallback } from 'react';
import { Play } from 'lucide-react';
import { sounds } from '../game/SoundEffects';

interface LandingScreenProps {
  onEnter: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onEnter }) => {
  const handleEnter = useCallback(() => {
    // Desbloquear contexto de audio y reproducir sonido de interacción
    sounds.resumeAudio();
    sounds.playPickup();
    onEnter();
  }, [onEnter]);

  // Permitir avanzar pulsando Enter o Espacio
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleEnter]);

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-neutral-100 overflow-hidden select-none px-4">
      {/* Fondo con brillo ambiental cian/azul oscuro */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-950/40 via-neutral-950 to-neutral-950 -z-10 pointer-events-none" />

      {/* Contenedor central con animación de entrada sutil */}
      <div className="flex flex-col items-center justify-center text-center max-w-lg w-full animate-landing-enter">
        {/* 1. Logo superN (mismo diseño, más grande, con resplandor neón) */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/20 via-cyan-400/20 to-emerald-400/20 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition duration-500 pointer-events-none" />
          <h1 className="relative text-7xl sm:text-8xl md:text-9xl font-black tracking-tight bg-gradient-to-r from-sky-400 via-cyan-200 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]">
            super<span className="text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.7)]">N</span>
          </h1>
        </div>

        {/* 2. Frase corta debajo del logo con opacidad reducida */}
        <p className="mt-4 sm:mt-5 text-xs sm:text-sm tracking-[0.3em] uppercase text-neutral-400/75 font-mono-code font-semibold">
          Lucha. Esquiva. Sobrevive.
        </p>

        {/* 3. Botón principal ENTRAR con gradiente cian→verde y tamaño táctil cómodo */}
        <button
          onClick={handleEnter}
          className="mt-10 sm:mt-12 w-full max-w-xs min-h-[48px] h-12 sm:h-14 px-8 bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-neutral-950 font-black text-sm sm:text-base tracking-widest uppercase rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 cursor-pointer touch-manipulation"
        >
          <Play className="w-5 h-5 fill-current shrink-0" />
          <span>ENTRAR</span>
        </button>
      </div>
    </div>
  );
};
