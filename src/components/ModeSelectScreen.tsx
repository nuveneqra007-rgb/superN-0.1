// =============================================================
// ModeSelectScreen.tsx — Selección de Modo de Juego Retro Superfighters
// Estética Arcade minimalista: cajas rectangulares oscuras con bordes
// blancos sólidos, resaltado amarillo, tipografía pixelada en mayúsculas,
// fondo técnico industrial con rejilla, y navegación completa con teclado.
// =============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { sounds } from '../game/SoundEffects';
import { Volume2, VolumeX, Swords } from 'lucide-react';

export type GameMode = 'vsBot' | 'local1v1';

interface ModeSelectScreenProps {
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onConfirmMode: () => void;
  onBackToLanding: () => void;
}

export const ModeSelectScreen: React.FC<ModeSelectScreenProps> = ({
  selectedMode,
  onSelectMode,
  onConfirmMode,
  onBackToLanding,
}) => {
  const [muted, setMuted] = useState<boolean>(sounds.getMuted());

  const toggleSound = () => {
    const next = !muted;
    sounds.setMuted(next);
    setMuted(next);
  };

  const handleSelect = useCallback((mode: GameMode) => {
    sounds.playPickup();
    onSelectMode(mode);
  }, [onSelectMode]);

  const handleConfirm = useCallback(() => {
    sounds.playPickup();
    onConfirmMode();
  }, [onConfirmMode]);

  // Navegación con teclado estilo Arcade clásico (Flechas, Enter/Espacio, ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      if (key === 'Escape') {
        e.preventDefault();
        sounds.playPickup();
        onBackToLanding();
        return;
      }

      if (key === ' ' || key === 'Enter') {
        e.preventDefault();
        handleConfirm();
        return;
      }

      if (key === 'ArrowUp' || key === 'ArrowLeft' || key === 'w' || key === 'W' || key === 'a' || key === 'A') {
        e.preventDefault();
        handleSelect('vsBot');
      } else if (key === 'ArrowDown' || key === 'ArrowRight' || key === 's' || key === 'S' || key === 'd' || key === 'D') {
        e.preventDefault();
        handleSelect('local1v1');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelect, handleConfirm, onBackToLanding]);

  return (
    <div className="relative w-full h-full max-h-screen flex flex-col justify-between items-center bg-black text-white font-pixel overflow-hidden p-3 select-none">
      {/* ── FONDO PLANO TÉCNICO / BLUEPRINT INDUSTRIAL AZUL SUPERFIGHTERS ── */}
      <div
        className="absolute inset-0 pointer-events-none -z-20 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(37, 99, 235, 0.28) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(37, 99, 235, 0.28) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />
      {/* Resplandor radial oscuro en los bordes */}
      <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(circle_at_center,rgba(29,78,216,0.18)_0%,rgba(0,0,0,0.92)_78%)]" />

      {/* ── BARRA SUPERIOR ── */}
      <header className="w-full max-w-4xl flex items-center justify-between px-2 pt-1 pb-1 shrink-0">
        <button
          onClick={() => {
            sounds.playPickup();
            onBackToLanding();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-black border-2 border-white hover:bg-white hover:text-black transition text-[10px] cursor-pointer"
          title="Volver a la portada (ESC)"
        >
          <span>[ESC] BACK</span>
        </button>

        {/* Título superN */}
        <div className="text-center">
          <div className="border-t-2 border-b-2 border-white py-0.5 px-6 tracking-[0.25em] text-lg sm:text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(255,255,255,0.25)]">
            super<span className="text-red-500">N</span>
          </div>
          <div className="text-[8px] text-blue-400 tracking-[0.3em] mt-0.5 font-bold uppercase">
            GAME MODE SELECT
          </div>
        </div>

        <button
          onClick={toggleSound}
          className="p-1.5 bg-black border-2 border-white hover:bg-white hover:text-black transition text-white cursor-pointer"
          title={muted ? 'Activar sonido' : 'Silenciar'}
        >
          {muted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-green-400" />}
        </button>
      </header>

      {/* ── CUERPO PRINCIPAL: TÍTULO Y CAJAS RECTANGULARES DE SELECCIÓN ── */}
      <main className="w-full max-w-4xl flex-1 flex flex-col justify-center items-center py-2 px-1 min-h-0">
        {/* Título de sección rudimentario en mayúsculas */}
        <div className="mb-4 text-center">
          <div className="text-xs sm:text-sm font-black tracking-widest text-white uppercase border-b-2 border-white/60 pb-1 inline-block">
            ELIGE CÓMO JUGAR
          </div>
          <div className="text-[8px] text-neutral-400 tracking-wider mt-1 uppercase">
            USA LAS FLECHAS ◄ ► ▲ ▼ PARA SELECCIONAR
          </div>
        </div>

        {/* Cajas Rectangulares de los 2 Modos */}
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* MODO 1: CONTRA EL BOT (1 PLAYER) */}
          <div
            onClick={() => handleSelect('vsBot')}
            onDoubleClick={handleConfirm}
            className={`bg-[#0a0a0f] border-2 p-4 flex flex-col justify-between transition cursor-pointer text-left ${
              selectedMode === 'vsBot'
                ? 'border-yellow-400 shadow-[0_0_18px_rgba(250,204,21,0.45)] ring-1 ring-yellow-400'
                : 'border-white hover:border-neutral-300'
            }`}
          >
            <div>
              {/* Indicador flecha clásica */}
              <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-3">
                <span className={`text-xs font-black tracking-wider ${
                  selectedMode === 'vsBot' ? 'text-yellow-300' : 'text-white'
                }`}>
                  {selectedMode === 'vsBot' ? '> 1 PLAYER' : '  1 PLAYER'}
                </span>
                <span className="text-[8px] border border-neutral-600 px-1 py-0.5 text-neutral-400">
                  SOLO
                </span>
              </div>

              <div className="text-sm font-black text-white tracking-wide mb-2 uppercase">
                CONTRA EL BOT
              </div>

              <p className="text-[9px] text-neutral-400 leading-relaxed uppercase mb-3">
                DUELO INDIVIDUAL CONTRA LA IA TÁCTICA. ENFRÉNTATE A LOS 15 BOTS CANÓNICOS O RIVAL RANDOM.
              </p>
            </div>

            <div className="border-t border-white/20 pt-2 flex items-center justify-between text-[8px] text-neutral-400">
              <span>PROTAGONISTA: NINJA</span>
              <span className={`font-bold ${selectedMode === 'vsBot' ? 'text-yellow-300' : 'text-neutral-500'}`}>
                {selectedMode === 'vsBot' ? '[ SELECCIONADO ]' : '[ SELECCIONAR ]'}
              </span>
            </div>
          </div>

          {/* MODO 2: 1 VS 1 LOCAL (2 PLAYERS) */}
          <div
            onClick={() => handleSelect('local1v1')}
            onDoubleClick={handleConfirm}
            className={`bg-[#0a0a0f] border-2 p-4 flex flex-col justify-between transition cursor-pointer text-left ${
              selectedMode === 'local1v1'
                ? 'border-yellow-400 shadow-[0_0_18px_rgba(250,204,21,0.45)] ring-1 ring-yellow-400'
                : 'border-white hover:border-neutral-300'
            }`}
          >
            <div>
              {/* Indicador flecha clásica */}
              <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-3">
                <span className={`text-xs font-black tracking-wider ${
                  selectedMode === 'local1v1' ? 'text-yellow-300' : 'text-white'
                }`}>
                  {selectedMode === 'local1v1' ? '> 2 PLAYERS' : '  2 PLAYERS'}
                </span>
                <span className="text-[8px] border border-neutral-600 px-1 py-0.5 text-neutral-400">
                  VERSUS
                </span>
              </div>

              <div className="text-sm font-black text-white tracking-wide mb-2 uppercase">
                1 VS 1 LOCAL
              </div>

              <p className="text-[9px] text-neutral-400 leading-relaxed uppercase mb-3">
                DOS JUGADORES COMPARTIENDO EL MISMO TECLADO FÍSICO. DUELO CARA A CARA DE NINJAS.
              </p>
            </div>

            <div className="border-t border-white/20 pt-2 flex items-center justify-between text-[8px] text-neutral-400">
              <span>DUELO EN TECLADO</span>
              <span className={`font-bold ${selectedMode === 'local1v1' ? 'text-yellow-300' : 'text-neutral-500'}`}>
                {selectedMode === 'local1v1' ? '[ SELECCIONADO ]' : '[ SELECCIONAR ]'}
              </span>
            </div>
          </div>
        </div>

        {/* Botón de Confirmación Principal */}
        <button
          onClick={handleConfirm}
          className="px-6 py-2.5 bg-black border-2 border-white hover:bg-white hover:text-black transition uppercase text-xs sm:text-sm font-black tracking-[0.2em] cursor-pointer shadow-[0_0_12px_rgba(255,255,255,0.3)] active:scale-95"
        >
          <span>[ SPACE ] ACCEPT : SELECCIONAR MODO ➔</span>
        </button>

        {/* ── CUADRO DE CONTROLES (BOTTOM) EN FORMA DE LISTA DE TEXTO SIMPLE ── */}
        <div className="w-full max-w-2xl bg-black border-2 border-white/80 p-2.5 mt-3 text-left">
          <div className="text-[9px] font-black text-yellow-300 tracking-widest uppercase mb-1.5 border-b border-white/20 pb-1">
            CONTROLES DE COMBATE:
          </div>
          <div className="space-y-1 text-[8px] sm:text-[9px] font-mono-code text-neutral-200 uppercase leading-relaxed">
            <div>
              <strong className="text-cyan-400 font-pixel">J1:</strong> WASD - N (MELEE) - M (DISPARO) - G (GRANADA)
            </div>
            <div>
              <strong className="text-amber-400 font-pixel">J2:</strong> FLECHAS - J (MELEE) - K (DISPARO) - L (GRANADA)
            </div>
          </div>
        </div>
      </main>

      {/* ── BARRA INFERIOR DE NAVEGACIÓN Y TECLAS (IMAGEN DE REFERENCIA) ── */}
      <footer className="w-full max-w-4xl border-t-2 border-white/60 pt-2 pb-1 px-2 flex flex-wrap items-center justify-between gap-3 text-[9px] text-neutral-300 shrink-0">
        <div className="flex items-center gap-2">
          <span className="border border-yellow-400 bg-black text-yellow-300 px-1.5 py-0.5 font-black">
            ◄ ► ▲ ▼
          </span>
          <span className="tracking-widest uppercase">NAVIGATE</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="border border-yellow-400 bg-black text-yellow-300 px-1.5 py-0.5 font-black">
            SPACE
          </span>
          <span className="tracking-widest uppercase">ACCEPT</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="border border-yellow-400 bg-black text-yellow-300 px-1.5 py-0.5 font-black">
            ESC
          </span>
          <span className="tracking-widest uppercase">BACK</span>
        </div>
      </footer>
    </div>
  );
};

export default ModeSelectScreen;
