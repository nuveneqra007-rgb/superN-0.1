// =============================================================
// MainMenu.tsx — Menú de Selección Estilo SUPERFIGHTERS Clásico
// Cajas rectangulares negras con bordes blancos gruesos, fondo oscuro
// con rejilla táctica retro, fuente pixelada en mayúsculas,
// navegación con teclado (flechas + espacio + escape) y ratón.
// SIN SCROLL: 100% encajado en viewport.
// =============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { BotFaction, BotArchetypeDatabase, getBotArchetype, CANONICAL_BOT_FACTIONS } from '../game/BotData';
import { sounds } from '../game/SoundEffects';
import { Swords, Volume2, VolumeX } from 'lucide-react';
import { GameMode } from './ModeSelectScreen';

import { MatchSetupModal, GameModeOption } from './MatchSetupModal';

interface MainMenuProps {
  gameMode: GameMode;
  selectedPlayerFaction: BotFaction;
  onSelectPlayerFaction: (faction: BotFaction) => void;
  selectedBotFaction: BotFaction;
  onSelectBotFaction: (faction: BotFaction) => void;
  rounds: number;
  onSelectRounds: (rounds: number) => void;
  onGoToWorldSelect: (playerFaction: BotFaction, botFaction: BotFaction, rounds: number) => void;
  onStartFightWithConfig?: (playerFaction: BotFaction, botFaction: BotFaction, worldId: string, rounds: number) => void;
  initialShowMatchSetup?: boolean;
  onOpenArsenal: () => void;
  onBackToLanding: () => void;
}

// Lista de selección para el panel COM: 'RANDOM' + las 15 facciones canónicas
type ComOption = 'RANDOM' | BotFaction;
const COM_OPTIONS: ComOption[] = ['RANDOM', ...CANONICAL_BOT_FACTIONS];
const AVAILABLE_ROUNDS = [1, 3, 5, 7];

export const MainMenu: React.FC<MainMenuProps> = ({
  gameMode,
  selectedPlayerFaction,
  onSelectPlayerFaction,
  selectedBotFaction,
  onSelectBotFaction,
  rounds,
  onSelectRounds,
  onGoToWorldSelect,
  onStartFightWithConfig,
  initialShowMatchSetup = false,
  onOpenArsenal,
  onBackToLanding,
}) => {
  const isLocal1v1 = gameMode === 'local1v1';
  const [muted, setMuted] = useState<boolean>(sounds.getMuted());
  const [showMatchSetup, setShowMatchSetup] = useState<boolean>(initialShowMatchSetup);

  // Índice de selección en el panel COM
  const initialComIndex = CANONICAL_BOT_FACTIONS.indexOf(selectedBotFaction);
  const [comIndex, setComIndex] = useState<number>(initialComIndex >= 0 ? initialComIndex + 1 : 0);

  // Panel enfocado por teclado: 'p1' | 'com' | 'rounds' | 'accept'
  const [focusedPanel, setFocusedPanel] = useState<'p1' | 'com' | 'rounds' | 'accept'>('com');

  const currentComOption = COM_OPTIONS[comIndex];
  const isRandomSelected = currentComOption === 'RANDOM';
  const effectiveBotFaction = isRandomSelected ? selectedBotFaction : (currentComOption as BotFaction);
  const botArchetype = getBotArchetype(effectiveBotFaction);
  const ninjaArchetype = getBotArchetype(BotFaction.Ninja);

  const toggleSound = () => {
    const next = !muted;
    sounds.setMuted(next);
    setMuted(next);
  };

  // Navegar opciones en el panel COM
  const cycleComOption = useCallback((delta: -1 | 1) => {
    sounds.playPickup();
    setComIndex((prev) => {
      const next = (prev + delta + COM_OPTIONS.length) % COM_OPTIONS.length;
      const opt = COM_OPTIONS[next];
      if (opt !== 'RANDOM') {
        onSelectBotFaction(opt as BotFaction);
      }
      return next;
    });
  }, [onSelectBotFaction]);

  // Cambiar rondas
  const cycleRounds = useCallback((delta: -1 | 1) => {
    sounds.playPickup();
    const currIdx = AVAILABLE_ROUNDS.indexOf(rounds);
    const nextIdx = (currIdx + delta + AVAILABLE_ROUNDS.length) % AVAILABLE_ROUNDS.length;
    onSelectRounds(AVAILABLE_ROUNDS[nextIdx]);
  }, [rounds, onSelectRounds]);

  // Ejecutar combate configurado desde el pop-up de partida
  const handleExecuteFight = useCallback((chosenWorldId: string, finalRounds: number, _modeName: GameModeOption) => {
    sounds.playPickup();
    let finalBot = selectedBotFaction;
    if (isRandomSelected) {
      const randIdx = Math.floor(Math.random() * CANONICAL_BOT_FACTIONS.length);
      finalBot = CANONICAL_BOT_FACTIONS[randIdx];
      onSelectBotFaction(finalBot);
    } else {
      finalBot = currentComOption as BotFaction;
    }
    const effectiveP1 = BotFaction.Ninja;
    const effectiveP2 = isLocal1v1 ? BotFaction.Ninja : finalBot;

    if (onStartFightWithConfig) {
      onStartFightWithConfig(effectiveP1, effectiveP2, chosenWorldId, finalRounds);
    } else {
      onSelectRounds(finalRounds);
      onGoToWorldSelect(effectiveP1, effectiveP2, finalRounds);
    }
  }, [currentComOption, isRandomSelected, selectedBotFaction, onSelectBotFaction, isLocal1v1, onStartFightWithConfig, onSelectRounds, onGoToWorldSelect]);

  // Confirmar y abrir pop-up de configuración de partida
  const handleConfirm = useCallback(() => {
    sounds.playPickup();
    setShowMatchSetup(true);
  }, []);

  // Control total por teclado estilo Arcade / Superfighters
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Si el pop-up de configuración está abierto, delega los controles al modal
      if (showMatchSetup) return;

      // Ignorar si hay inputs de texto
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

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

      // Navegación con flechas
      if (key === 'ArrowLeft') {
        e.preventDefault();
        if (focusedPanel === 'com') {
          cycleComOption(-1);
        } else if (focusedPanel === 'rounds') {
          cycleRounds(-1);
        } else if (focusedPanel === 'p1') {
          setFocusedPanel('com');
        } else if (focusedPanel === 'accept') {
          setFocusedPanel('rounds');
        }
      } else if (key === 'ArrowRight') {
        e.preventDefault();
        if (focusedPanel === 'com') {
          cycleComOption(1);
        } else if (focusedPanel === 'rounds') {
          cycleRounds(1);
        } else if (focusedPanel === 'p1') {
          setFocusedPanel('com');
        }
      } else if (key === 'ArrowUp') {
        e.preventDefault();
        if (focusedPanel === 'accept' || focusedPanel === 'rounds') {
          setFocusedPanel('com');
        } else if (focusedPanel === 'com') {
          setFocusedPanel('p1');
        }
      } else if (key === 'ArrowDown') {
        e.preventDefault();
        if (focusedPanel === 'p1') {
          setFocusedPanel('com');
        } else if (focusedPanel === 'com') {
          setFocusedPanel('rounds');
        } else if (focusedPanel === 'rounds') {
          setFocusedPanel('accept');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedPanel, cycleComOption, cycleRounds, handleConfirm, onBackToLanding]);

  return (
    <div className="relative w-full h-full max-h-screen flex flex-col justify-between items-center bg-black text-white font-pixel overflow-hidden p-3 select-none">
      {/* ── FONDO RETRO DE SUPERFIGHTERS (REJILLA TÁCTICA ROJA CON SILUETA) ── */}
      <div
        className="absolute inset-0 pointer-events-none -z-20 opacity-35"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(220, 38, 38, 0.22) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(220, 38, 38, 0.22) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }}
      />
      {/* Resplandor radial atmosférico */}
      <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(circle_at_center,rgba(185,28,28,0.18)_0%,rgba(0,0,0,0.85)_75%)]" />

      {/* ── CABECERA / LOGO ESTILO SUPERFIGHTERS CLÁSICO ── */}
      <header className="w-full max-w-4xl flex items-center justify-between px-2 pt-1 pb-1 shrink-0">
        {/* Botón Volver (ESC) */}
        <button
          onClick={() => {
            sounds.playPickup();
            onBackToLanding();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-black border-2 border-white hover:bg-white hover:text-black transition text-[10px] cursor-pointer"
          title="Volver (ESC)"
        >
          <span>[ESC] BACK</span>
        </button>

        {/* Título superN */}
        <div className="text-center">
          <div className="border-t-2 border-b-2 border-white py-0.5 px-6 tracking-[0.25em] text-lg sm:text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(255,255,255,0.25)]">
            super<span className="text-red-500">N</span>
          </div>
          <div className="text-[8px] text-red-500 tracking-[0.3em] mt-0.5 font-bold uppercase">
            {isLocal1v1 ? 'DUEL 1 VS 1 — LOCAL MODE' : 'CUSTOM FIGHT — NINJA VS BOT'}
          </div>
        </div>

        {/* Acceso a Arsenal & Sonido */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playPickup();
              onOpenArsenal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black border-2 border-white hover:bg-white hover:text-black transition text-[10px] cursor-pointer"
            title="Ver Arsenal"
          >
            <Swords className="w-3 h-3" />
            <span className="hidden sm:inline">ARSENAL</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-1.5 bg-black border-2 border-white hover:bg-white hover:text-black transition text-white cursor-pointer"
            title={muted ? 'Activar sonido' : 'Silenciar'}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-green-400" />}
          </button>
        </div>
      </header>

      {/* ── CONTENIDO PRINCIPAL: CAJAS RECTANGULARES CON BORDES BLANCOS ── */}
      <main className="w-full max-w-4xl flex-1 flex flex-col justify-center items-center py-2 px-1 min-h-0">
        {/* FILA SUPERIOR: PANEL PLAYER 1 (+ PLAYER 2 si es 1v1) */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-3">
          {/* ── PANEL PLAYER 1 ── */}
          <div
            onClick={() => setFocusedPanel('p1')}
            className={`w-56 sm:w-64 bg-black border-4 p-3 flex flex-col items-center justify-between text-center transition cursor-pointer ${
              focusedPanel === 'p1' ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'border-neutral-400'
            }`}
          >
            <div className="text-sm font-black tracking-widest text-white border-b-2 border-white/40 pb-1 w-full uppercase">
              PLAYER 1
            </div>

            {/* Marco del retrato */}
            <div className="w-24 h-24 my-2.5 rounded-xl border-2 border-white bg-black flex items-center justify-center p-2 relative shadow-inner">
              <img
                src={ninjaArchetype.spriteUrl || '/assets/sprites/player/ninja.png'}
                alt="Ninja"
                className="max-h-full max-w-full object-contain [image-rendering:pixelated]"
              />
            </div>

            {/* Nombre y Arquetipo */}
            <div className="text-xs font-black tracking-wider text-yellow-300">
              NINJA
            </div>
            <div className="text-[9px] text-neutral-300 tracking-wider mt-1 uppercase">
              INDEPENDENT
            </div>
            <div className="text-[8px] text-neutral-500 font-mono-code mt-0.5">
              HP: {ninjaArchetype.maxHealth} • SPEED: ×{ninjaArchetype.speedModifier.toFixed(2)}
            </div>
          </div>

          {/* ── PANEL COM (EN MODO vsBOT) O PLAYER 2 (EN MODO 1v1) ── */}
          {isLocal1v1 ? (
            /* Panel PLAYER 2 en 1v1 Local */
            <div
              onClick={() => setFocusedPanel('com')}
              className={`w-56 sm:w-64 bg-black border-4 p-3 flex flex-col items-center justify-between text-center transition cursor-pointer ${
                focusedPanel === 'com' ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'border-neutral-400'
              }`}
            >
              <div className="text-sm font-black tracking-widest text-white border-b-2 border-white/40 pb-1 w-full uppercase">
                PLAYER 2
              </div>

              {/* Marco del retrato */}
              <div className="w-24 h-24 my-2.5 rounded-xl border-2 border-white bg-black flex items-center justify-center p-2 relative shadow-inner">
                <img
                  src="/assets/sprites/player/ninja.png"
                  alt="Ninja J2"
                  className="max-h-full max-w-full object-contain [image-rendering:pixelated]"
                />
              </div>

              {/* Nombre y Control */}
              <div className="text-xs font-black tracking-wider text-yellow-300">
                NINJA (P2)
              </div>
              <div className="text-[9px] text-neutral-300 tracking-wider mt-1 uppercase">
                INDEPENDENT
              </div>
              <div className="text-[8px] text-amber-400 font-mono-code mt-0.5">
                KEYS: WASD + J, K, L, Q
              </div>
            </div>
          ) : (
            /* Panel COM con navegación de bots y RANDOM */
            <div
              onClick={() => setFocusedPanel('com')}
              className={`w-56 sm:w-64 bg-black border-4 p-3 flex flex-col items-center justify-between text-center transition cursor-pointer ${
                focusedPanel === 'com' ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'border-neutral-400'
              }`}
            >
              <div className="text-sm font-black tracking-widest text-white border-b-2 border-white/40 pb-1 w-full uppercase">
                COM
              </div>

              {/* Marco del retrato (Signo de interrogación si es RANDOM, o sprite del bot) */}
              <div className="w-24 h-24 my-2.5 rounded-xl border-2 border-white bg-black flex items-center justify-center p-2 relative shadow-inner">
                {isRandomSelected ? (
                  <div className="text-3xl font-black text-white select-none animate-pulse">
                    ?
                  </div>
                ) : botArchetype.spriteUrl ? (
                  <img
                    src={botArchetype.spriteUrl}
                    alt={botArchetype.name}
                    className="max-h-full max-w-full object-contain [image-rendering:pixelated]"
                  />
                ) : (
                  <div className="text-2xl font-black text-neutral-500">?</div>
                )}
              </div>

              {/* Selector con Flechas ◀ NOMBRE ▶ */}
              <div className="w-full flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cycleComOption(-1);
                  }}
                  className="text-white hover:text-yellow-300 font-black text-base px-1.5 py-0.5 transition cursor-pointer active:scale-125"
                  title="Anterior (Flecha Izq)"
                >
                  ◀
                </button>

                <div className="text-xs font-black tracking-wider text-yellow-300 uppercase truncate px-1">
                  {isRandomSelected ? 'RANDOM' : botArchetype.name}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cycleComOption(1);
                  }}
                  className="text-white hover:text-yellow-300 font-black text-base px-1.5 py-0.5 transition cursor-pointer active:scale-125"
                  title="Siguiente (Flecha Der)"
                >
                  ▶
                </button>
              </div>

              {/* Subtextos estilo Superfighters */}
              <div className="text-[9px] text-neutral-300 tracking-wider mt-1 uppercase">
                INDEPENDENT
              </div>
              <div className="text-[8px] text-neutral-400 uppercase font-mono-code mt-0.5">
                {isRandomSelected ? 'RANDOM OPPONENT' : `IA: ${botArchetype.aiType.toUpperCase()}`}
              </div>
            </div>
          )}

          {/* Slots -EMPTY- decorativos estilo Superfighters clásico (imagen 3) */}
          <div className="hidden lg:flex flex-col gap-2">
            <div className="w-28 h-20 border border-neutral-700 bg-black/60 flex items-center justify-center text-[9px] text-neutral-600 tracking-widest font-black uppercase">
              - EMPTY -
            </div>
            <div className="w-28 h-20 border border-neutral-700 bg-black/60 flex items-center justify-center text-[9px] text-neutral-600 tracking-widest font-black uppercase">
              - EMPTY -
            </div>
          </div>
        </div>

        {/* ── CAJA DE CONFIGURACIÓN DE RONDAS (ESTILO POPUP SUPERFIGHTERS) ── */}
        <div
          onClick={() => setFocusedPanel('rounds')}
          className={`w-full max-w-md bg-black border-2 p-2.5 flex flex-col items-center justify-center text-center transition cursor-pointer mb-3 ${
            focusedPanel === 'rounds' ? 'border-white shadow-[0_0_12px_rgba(255,255,255,0.3)]' : 'border-neutral-500'
          }`}
        >
          <div className="text-[10px] tracking-widest text-white uppercase mb-2">
            NUMBER OF ROUNDS:
          </div>

          <div className="flex items-center justify-center gap-3">
            {AVAILABLE_ROUNDS.map((num) => {
              const isSelected = rounds === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playPickup();
                    onSelectRounds(num);
                    setFocusedPanel('rounds');
                  }}
                  className={`px-3 py-1 text-xs font-black tracking-wider transition cursor-pointer ${
                    isSelected
                      ? 'border-2 border-white bg-black text-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.5)]'
                      : 'text-neutral-500 hover:text-white border border-transparent'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── BOTÓN ACCEPT / ELEGIR MUNDO ── */}
        <button
          onClick={handleConfirm}
          onMouseEnter={() => setFocusedPanel('accept')}
          className={`px-6 py-2.5 bg-black border-4 text-xs sm:text-sm font-black tracking-[0.2em] text-white hover:bg-white hover:text-black transition uppercase cursor-pointer shadow-lg active:scale-95 ${
            focusedPanel === 'accept' ? 'border-white bg-neutral-900 shadow-[0_0_16px_rgba(255,255,255,0.5)]' : 'border-neutral-300'
          }`}
        >
          <span>[ SPACE ] ACCEPT : SELECT STAGE ➔</span>
        </button>
      </main>

      {/* ── BARRA INFERIOR DE NAVEGACIÓN Y TECLAS ESTILO SUPERFIGHTERS (IMAGEN 3) ── */}
      <footer className="w-full max-w-4xl border-t-2 border-white/60 pt-2 pb-1 px-2 flex flex-wrap items-center justify-between gap-3 text-[9px] text-neutral-300 shrink-0">
        <div className="flex items-center gap-3">
          <span className="border border-yellow-400 bg-black text-yellow-300 px-1.5 py-0.5 font-black">
            ◄ ► ▲ ▼
          </span>
          <span className="tracking-widest uppercase">NAVIGATE</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="border border-yellow-400 bg-black text-yellow-300 px-1.5 py-0.5 font-black">
            SPACE
          </span>
          <span className="tracking-widest uppercase">ACCEPT</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="border border-yellow-400 bg-black text-yellow-300 px-1.5 py-0.5 font-black">
            ESC
          </span>
          <span className="tracking-widest uppercase">BACK</span>
        </div>
      </footer>

      {/* ── MODAL POP-UP DE CONFIGURACIÓN DE PARTIDA ESTILO SUPERFIGHTERS ── */}
      <MatchSetupModal
        isOpen={showMatchSetup}
        onClose={() => setShowMatchSetup(false)}
        onStartFight={handleExecuteFight}
      />
    </div>
  );
};

export default MainMenu;
