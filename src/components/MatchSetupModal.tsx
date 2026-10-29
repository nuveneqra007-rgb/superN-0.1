// =============================================================
// MatchSetupModal.tsx — Menú de Configuración de Partida Pop-up
// Estética retro Superfighters:
// - Fondo oscurecido con respecto a la selección de personajes
// - Caja central rectangular con borde blanco sólido
// - Caja superior pequeña con preview del mapa (? si es RANDOM)
// - Opciones: FIGHT!, MAP, GAME MODE, RESET
// - Cursor triángulo ◄ con navegación por flechas Arriba/Abajo
// - Cambio de valores con flechas Izquierda/Derecha
// - Enter en FIGHT! para iniciar la partida
// =============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { sounds } from '../game/SoundEffects';
import { WORLDS } from '../game/WorldData';

export type GameModeOption = 'INFINITE' | '5 ROUNDS' | '3 ROUNDS' | '7 ROUNDS' | '1 ROUND';

export interface MapOption {
  id: string; // 'RANDOM' | 'classic' | 'desert' | 'industrial'
  name: string;
  previewUrl?: string;
}

const MAP_OPTIONS: MapOption[] = [
  { id: 'RANDOM', name: 'RANDOM' },
  { id: 'classic', name: 'ARENA CLASICA', previewUrl: '/assets/backgrounds/warehouse.jpg' },
  { id: 'desert', name: 'DESIERTO', previewUrl: '/assets/aistudio/image_5f144f67.png' },
  { id: 'industrial', name: 'ZONA INDUSTRIAL', previewUrl: '/assets/aistudio/image_1d4241a8.png' },
];

const GAME_MODE_OPTIONS: GameModeOption[] = [
  'INFINITE',
  '5 ROUNDS',
  '3 ROUNDS',
  '7 ROUNDS',
  '1 ROUND',
];

interface MatchSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFight: (worldId: string, rounds: number, modeName: GameModeOption) => void;
}

export const MatchSetupModal: React.FC<MatchSetupModalProps> = ({
  isOpen,
  onClose,
  onStartFight,
}) => {
  // Cursor de selección (0: FIGHT!, 1: MAP, 2: GAME MODE, 3: RESET)
  const [selectedRow, setSelectedRow] = useState<number>(0);

  // Valores seleccionados
  const [mapIndex, setMapIndex] = useState<number>(0); // 0 = RANDOM
  const [gameModeIndex, setGameModeIndex] = useState<number>(0); // 0 = INFINITE

  const currentMap = MAP_OPTIONS[mapIndex];
  const currentGameMode = GAME_MODE_OPTIONS[gameModeIndex];

  // Cambiar de mapa
  const cycleMap = useCallback((delta: -1 | 1) => {
    sounds.playPickup();
    setMapIndex((prev) => (prev + delta + MAP_OPTIONS.length) % MAP_OPTIONS.length);
  }, []);

  // Cambiar modo de juego
  const cycleGameMode = useCallback((delta: -1 | 1) => {
    sounds.playPickup();
    setGameModeIndex((prev) => (prev + delta + GAME_MODE_OPTIONS.length) % GAME_MODE_OPTIONS.length);
  }, []);

  // Restablecer valores a por defecto (RANDOM / INFINITE)
  const handleReset = useCallback(() => {
    sounds.playPickup();
    setMapIndex(0);
    setGameModeIndex(0);
  }, []);

  // Iniciar combate
  const handleFight = useCallback(() => {
    sounds.playPickup();

    let finalWorldId = currentMap.id;
    if (finalWorldId === 'RANDOM') {
      const playableWorlds = WORLDS.map((w) => w.id);
      finalWorldId = playableWorlds[Math.floor(Math.random() * playableWorlds.length)];
    }

    let finalRounds = 999; // Modo infinito
    if (currentGameMode === '5 ROUNDS') finalRounds = 5;
    else if (currentGameMode === '3 ROUNDS') finalRounds = 3;
    else if (currentGameMode === '7 ROUNDS') finalRounds = 7;
    else if (currentGameMode === '1 ROUND') finalRounds = 1;

    onStartFight(finalWorldId, finalRounds, currentGameMode);
  }, [currentMap, currentGameMode, onStartFight]);

  // Manejo de teclado (Arriba/Abajo para cursor, Izquierda/Derecha para valores, Enter para acción)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si hay inputs de texto
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key;

      if (key === 'Escape') {
        e.preventDefault();
        sounds.playPickup();
        onClose();
        return;
      }

      // Mover cursor verticalmente
      if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        e.preventDefault();
        sounds.playPickup();
        setSelectedRow((prev) => (prev - 1 + 4) % 4);
        return;
      }

      if (key === 'ArrowDown' || key === 's' || key === 'S') {
        e.preventDefault();
        sounds.playPickup();
        setSelectedRow((prev) => (prev + 1) % 4);
        return;
      }

      // Modificar valores horizontalmente
      if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        e.preventDefault();
        if (selectedRow === 1) {
          cycleMap(-1);
        } else if (selectedRow === 2) {
          cycleGameMode(-1);
        }
        return;
      }

      if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        e.preventDefault();
        if (selectedRow === 1) {
          cycleMap(1);
        } else if (selectedRow === 2) {
          cycleGameMode(1);
        }
        return;
      }

      // Ejecutar opción seleccionada con Enter o Espacio
      if (key === 'Enter' || key === ' ') {
        e.preventDefault();
        if (selectedRow === 0) {
          handleFight();
        } else if (selectedRow === 1) {
          cycleMap(1);
        } else if (selectedRow === 2) {
          cycleGameMode(1);
        } else if (selectedRow === 3) {
          handleReset();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedRow, cycleMap, cycleGameMode, handleFight, handleReset, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 select-none">
      {/* ── FONDO OSCURECIDO (DARKENED OVERLAY) ── */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-[1px] transition-opacity duration-200"
        onClick={() => {
          sounds.playPickup();
          onClose();
        }}
      />

      {/* ── CAJA CENTRAL RECTANGULAR CON BORDE BLANCO SÓLIDO ── */}
      <div
        className="relative z-10 w-full max-w-[460px] bg-black border-2 border-white p-4 sm:p-5 text-white font-pixel shadow-[0_0_24px_rgba(0,0,0,0.95)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── CAJA SUPERIOR: VISTA PREVIA DEL MAPA (O ? SI ES RANDOM) ── */}
        <div className="w-full h-36 sm:h-40 border-2 border-white bg-black flex items-center justify-center relative overflow-hidden mb-5">
          {currentMap.id === 'RANDOM' ? (
            /* Icono de ? enmarcado en cuadrado con esquinas redondeadas estilo Superfighters */
            <div className="w-16 h-16 border-2 border-white rounded-xl flex items-center justify-center shadow-inner">
              <span className="text-4xl font-black text-white select-none animate-pulse">
                ?
              </span>
            </div>
          ) : currentMap.previewUrl ? (
            /* Miniatura del mapa seleccionado */
            <div className="w-full h-full relative flex items-center justify-center">
              <img
                src={currentMap.previewUrl}
                alt={currentMap.name}
                className="w-full h-full object-cover [image-rendering:pixelated]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-1.5 left-2 right-2 text-center text-[10px] text-yellow-300 font-black tracking-widest uppercase bg-black/60 py-0.5 border-t border-white/30">
                {currentMap.name}
              </div>
            </div>
          ) : (
            <div className="text-xs text-neutral-500">MAPA SIN PREVIEW</div>
          )}
        </div>

        {/* ── LISTA DE OPCIONES Y VALORES ── */}
        <div className="space-y-3.5 text-xs sm:text-sm tracking-widest uppercase">
          {/* 1. FIGHT! */}
          <div
            onClick={() => {
              setSelectedRow(0);
              handleFight();
            }}
            onMouseEnter={() => setSelectedRow(0)}
            className="flex items-center justify-between cursor-pointer py-1 px-1 transition hover:text-yellow-300"
          >
            <div className="flex items-center gap-2">
              <span className={selectedRow === 0 ? 'text-white font-black' : 'text-neutral-200'}>
                FIGHT!
              </span>
              {selectedRow === 0 && (
                <span className="text-white text-base font-black animate-pulse leading-none">
                  ◄
                </span>
              )}
            </div>
          </div>

          {/* 2. MAP */}
          <div
            onClick={() => setSelectedRow(1)}
            onMouseEnter={() => setSelectedRow(1)}
            className="flex items-center justify-between cursor-pointer py-1 px-1 transition"
          >
            <div className="flex items-center gap-2">
              <span className={selectedRow === 1 ? 'text-white font-black' : 'text-neutral-200'}>
                MAP
              </span>
              {selectedRow === 1 && (
                <span className="text-white text-base font-black animate-pulse leading-none">
                  ◄
                </span>
              )}
            </div>

            {/* Selector de Valor: ◀ NOMBRE ▶ */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRow(1);
                  cycleMap(-1);
                }}
                className="text-white hover:text-yellow-300 px-1 text-sm font-black transition cursor-pointer active:scale-125"
                title="Mapa anterior (Flecha Izq)"
              >
                ◀
              </button>

              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRow(1);
                  cycleMap(1);
                }}
                className="text-yellow-300 font-black tracking-wider text-xs sm:text-sm min-w-[120px] sm:min-w-[140px] text-center uppercase"
              >
                {currentMap.name}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRow(1);
                  cycleMap(1);
                }}
                className="text-white hover:text-yellow-300 px-1 text-sm font-black transition cursor-pointer active:scale-125"
                title="Siguiente mapa (Flecha Der)"
              >
                ▶
              </button>
            </div>
          </div>

          {/* 3. GAME MODE */}
          <div
            onClick={() => setSelectedRow(2)}
            onMouseEnter={() => setSelectedRow(2)}
            className="flex items-center justify-between cursor-pointer py-1 px-1 transition"
          >
            <div className="flex items-center gap-2">
              <span className={selectedRow === 2 ? 'text-white font-black' : 'text-neutral-200'}>
                GAME MODE
              </span>
              {selectedRow === 2 && (
                <span className="text-white text-base font-black animate-pulse leading-none">
                  ◄
                </span>
              )}
            </div>

            {/* Selector de Modo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRow(2);
                  cycleGameMode(-1);
                }}
                className="text-white hover:text-yellow-300 px-1 text-sm font-black transition cursor-pointer active:scale-125"
                title="Modo anterior (Flecha Izq)"
              >
                ◀
              </button>

              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRow(2);
                  cycleGameMode(1);
                }}
                className="text-white font-black tracking-wider text-xs sm:text-sm min-w-[120px] sm:min-w-[140px] text-center uppercase"
              >
                {currentGameMode}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRow(2);
                  cycleGameMode(1);
                }}
                className="text-white hover:text-yellow-300 px-1 text-sm font-black transition cursor-pointer active:scale-125"
                title="Siguiente modo (Flecha Der)"
              >
                ▶
              </button>
            </div>
          </div>

          {/* 4. RESET */}
          <div
            onClick={() => {
              setSelectedRow(3);
              handleReset();
            }}
            onMouseEnter={() => setSelectedRow(3)}
            className="flex items-center justify-between cursor-pointer py-1 px-1 transition hover:text-yellow-300"
          >
            <div className="flex items-center gap-2">
              <span className={selectedRow === 3 ? 'text-white font-black' : 'text-neutral-200'}>
                RESET
              </span>
              {selectedRow === 3 && (
                <span className="text-white text-base font-black animate-pulse leading-none">
                  ◄
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── GUÍA RÁPIDA DE TECLAS EN EL PIE DEL POP-UP ── */}
        <div className="mt-5 pt-3 border-t border-white/20 flex items-center justify-between text-[8px] text-neutral-400">
          <span>▲▼: SELECT</span>
          <span>◄►: CHANGE</span>
          <span>ENTER: OK</span>
          <span>ESC: CLOSE</span>
        </div>
      </div>
    </div>
  );
};

export default MatchSetupModal;
