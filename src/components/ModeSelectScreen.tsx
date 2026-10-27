// =============================================================
// ModeSelectScreen.tsx — Pantalla de selección de modo de juego
// Contra el Bot (1J) o 1 vs 1 Local (2J en el mismo teclado)
// =============================================================

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bot, Users, CheckCircle2, Keyboard, ShieldAlert, Play } from 'lucide-react';
import { sounds } from '../game/SoundEffects';

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
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isCoarse = window.matchMedia('(pointer: coarse)').matches;
      setIsTouchDevice(isCoarse);
    }
  }, []);

  const handleModeClick = (mode: GameMode) => {
    if (mode === 'local1v1' && isTouchDevice) return;
    sounds.playPickup();
    onSelectMode(mode);
    onConfirmMode();
  };

  return (
    <div className="relative w-full h-screen flex flex-col justify-between items-center bg-neutral-950 text-neutral-100 overflow-y-auto p-4 select-none">
      {/* Fondo ambiental */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-950/40 via-neutral-950 to-neutral-950 -z-10 pointer-events-none" />

      {/* Barra superior con botón Volver */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-2 px-1">
        <button
          onClick={() => {
            sounds.playPickup();
            onBackToLanding();
          }}
          className="flex items-center gap-1.5 px-4 min-h-[48px] bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-xl text-xs sm:text-sm font-bold text-neutral-300 hover:text-white transition shadow-sm cursor-pointer touch-manipulation"
          title="Volver a la portada"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Volver</span>
        </button>

        <span className="text-xs font-mono-code text-neutral-500">
          superN • Modo de Juego
        </span>
      </div>

      {/* Encabezado */}
      <div className="text-center my-3">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-sky-400 via-cyan-200 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          ELIGE CÓMO JUGAR
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-neutral-400 tracking-wide font-medium">
          Selecciona tu experiencia de combate: individual contra IA o duelo en el mismo teclado
        </p>
      </div>

      {/* Grilla con 2 tarjetas de modo */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-5 my-auto py-2">
        {/* Modo 1: Contra el Bot */}
        <div
          onClick={() => handleModeClick('vsBot')}
          className={`relative flex flex-col justify-between rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden p-6 group touch-manipulation ${
            selectedMode === 'vsBot'
              ? 'bg-neutral-900/90 border-cyan-400 ring-2 ring-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.35)] -translate-y-1'
              : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/90 hover:-translate-y-0.5'
          }`}
        >
          {selectedMode === 'vsBot' && (
            <div className="absolute top-4 right-4 z-10 bg-cyan-500 text-neutral-950 rounded-full p-1 shadow-lg animate-bounce-short">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
          )}

          <div>
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Bot className="w-7 h-7" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-cyan-300 transition-colors mb-2">
              Contra el Bot
            </h3>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-4">
              Enfréntate a la IA táctica con múltiples arquetipos y estilos de combate en duelos multironda.
            </p>
          </div>

          <div className="space-y-2 pt-3 border-t border-neutral-800/80">
            <span className="text-[11px] font-mono-code font-bold uppercase text-neutral-400 block">
              Controles J1:
            </span>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono-code">
              <span className="px-2 py-1 rounded-md bg-neutral-950 border border-neutral-800 text-cyan-300">
                WASD / Flechas
              </span>
              <span className="px-2 py-1 rounded-md bg-neutral-950 border border-neutral-800 text-cyan-300">
                N / J: Melee
              </span>
              <span className="px-2 py-1 rounded-md bg-neutral-950 border border-neutral-800 text-cyan-300">
                M / K: Disparo
              </span>
              <span className="px-2 py-1 rounded-md bg-neutral-950 border border-neutral-800 text-cyan-300">
                G: Granada
              </span>
            </div>
          </div>
        </div>

        {/* Modo 2: 1 vs 1 Local */}
        <div
          onClick={() => handleModeClick('local1v1')}
          className={`relative flex flex-col justify-between rounded-2xl border transition-all duration-200 overflow-hidden p-6 group ${
            isTouchDevice
              ? 'bg-neutral-950/60 border-neutral-900 opacity-60 cursor-not-allowed'
              : selectedMode === 'local1v1'
              ? 'bg-neutral-900/90 border-cyan-400 ring-2 ring-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.35)] -translate-y-1 cursor-pointer touch-manipulation'
              : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/90 hover:-translate-y-0.5 cursor-pointer touch-manipulation'
          }`}
        >
          {selectedMode === 'local1v1' && !isTouchDevice && (
            <div className="absolute top-4 right-4 z-10 bg-cyan-500 text-neutral-950 rounded-full p-1 shadow-lg animate-bounce-short">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
          )}

          <div>
            <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400 group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Users className="w-7 h-7" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
                1 vs 1 Local
              </h3>
              {isTouchDevice && (
                <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800 text-[10px] font-mono-code font-bold text-rose-300 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  Requiere teclado
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-4">
              Dos jugadores cara a cara compartiendo el mismo teclado. Ambos eligen sus combatientes y se enfrentan en la arena.
            </p>
          </div>

          <div className="space-y-2 pt-3 border-t border-neutral-800/80">
            <span className="text-[11px] font-mono-code font-bold uppercase text-neutral-400 block">
              Controles Compartidos:
            </span>
            <div className="space-y-1.5 text-[11px] font-mono-code">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-cyan-400 font-bold">J1:</span>
                <span className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                  Flechas
                </span>
                <span className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                  N (Melee)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                  M (Tiro)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                  , (Granada)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                  . (Correr)
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-amber-400 font-bold">J2:</span>
                <span className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                  WASD
                </span>
                <span className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                  J (Melee)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                  K (Tiro)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                  L (Granada)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                  Q (Correr)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón inferior Continuar */}
      <div className="w-full max-w-4xl mt-3 flex justify-center">
        <button
          onClick={() => {
            sounds.playPickup();
            onConfirmMode();
          }}
          className="w-full max-w-sm min-h-[48px] h-12 sm:h-14 py-3.5 px-8 bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-neutral-950 font-black text-sm sm:text-base tracking-widest uppercase rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
        >
          <span>CONTINUAR A LA SELECCIÓN</span>
          <Play className="w-4 h-4 fill-current shrink-0" />
        </button>
      </div>
    </div>
  );
};
