// =============================================================
// MainMenu.tsx — Menú de Selección Estilo SUPERFIGHTERS Clásico
// Cajas rectangulares negras con bordes blancos gruesos, fondo oscuro
// con rejilla táctica retro, fuente pixelada en mayúsculas,
// navegación con teclado (flechas + espacio + escape) y ratón.
// SIN SCROLL: 100% encajado en viewport.
// =============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  BotFaction,
  getBotArchetype,
  CANONICAL_BOT_FACTIONS,
  BotSlotConfig,
  MAX_BOTS,
} from '../game/BotData';
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
  onStartFightWithConfig?: (
    playerFaction: BotFaction,
    botFaction: BotFaction,
    worldId: string,
    rounds: number,
    botSlots?: BotSlotConfig[]
  ) => void;
  initialShowMatchSetup?: boolean;
  onOpenArsenal: () => void;
  onBackToLanding: () => void;
}

type ComOption = 'RANDOM' | BotFaction;
const COM_OPTIONS: ComOption[] = ['RANDOM', ...CANONICAL_BOT_FACTIONS];
const DIFFICULTIES: ('easy' | 'normal' | 'hard')[] = ['easy', 'normal', 'hard'];

interface ProtagonistVisual {
  id: string;
  name: string;
  tag: string;
  spriteUrl: string;
  isPlayable: boolean;
}

const PROTAGONISTS: ProtagonistVisual[] = [
  {
    id: 'ninja',
    name: 'NINJA',
    tag: 'JUGABLE',
    spriteUrl: '/assets/sprites/player/ninja.png',
    isPlayable: true,
  },
  {
    id: 'gymrat',
    name: 'GYMRAT',
    tag: 'PRÓXIMAMENTE',
    spriteUrl: '/assets/sprites/player/gymrat.png',
    isPlayable: false,
  },
  {
    id: 'santaclo',
    name: 'SANTA CLAUS',
    tag: 'PRÓXIMAMENTE',
    spriteUrl: '/assets/sprites/player/santaclo.png',
    isPlayable: false,
  },
];

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

  // Protagonista visual seleccionado para P1 (Ninja, Gymrat, Santa Claus)
  const [protagonistIdx, setProtagonistIdx] = useState<number>(0);
  const currentProtagonist = PROTAGONISTS[protagonistIdx];

  // Número de bots seleccionados (1–5)
  const [numBots, setNumBots] = useState<number>(1);

  // Configuración de slots para los bots
  const [botSlots, setBotSlots] = useState<BotSlotConfig[]>([
    { faction: 'RANDOM', difficulty: 'normal', team: 'independent' },
    { faction: 'RANDOM', difficulty: 'normal', team: 'independent' },
    { faction: 'RANDOM', difficulty: 'normal', team: 'independent' },
    { faction: 'RANDOM', difficulty: 'normal', team: 'independent' },
    { faction: 'RANDOM', difficulty: 'normal', team: 'independent' },
  ]);

  // Índice del slot enfocado
  const [focusedSlotIdx, setFocusedSlotIdx] = useState<number>(0);

  // Panel enfocado por teclado: 'p1' | 'com' | 'bots' | 'accept'
  const [focusedPanel, setFocusedPanel] = useState<'p1' | 'com' | 'bots' | 'accept'>('com');

  const ninjaArchetype = getBotArchetype(BotFaction.Ninja);

  const toggleSound = () => {
    const next = !muted;
    sounds.setMuted(next);
    setMuted(next);
  };

  const cyclePlayerProtagonist = useCallback((delta: -1 | 1) => {
    sounds.playPickup();
    setProtagonistIdx((prev) => (prev + delta + PROTAGONISTS.length) % PROTAGONISTS.length);
  }, []);

  // Navegar facción de un slot de bot
  const cycleSlotFaction = useCallback((slotIdx: number, delta: -1 | 1) => {
    sounds.playPickup();
    setBotSlots((prev) => {
      const next = [...prev];
      const currentFaction = next[slotIdx].faction;
      const currIdx = COM_OPTIONS.indexOf(currentFaction);
      const nextIdx = (currIdx + delta + COM_OPTIONS.length) % COM_OPTIONS.length;
      next[slotIdx] = { ...next[slotIdx], faction: COM_OPTIONS[nextIdx] };
      if (slotIdx === 0 && COM_OPTIONS[nextIdx] !== 'RANDOM') {
        onSelectBotFaction(COM_OPTIONS[nextIdx] as BotFaction);
      }
      return next;
    });
  }, [onSelectBotFaction]);

  // Navegar dificultad de un slot de bot
  const cycleSlotDifficulty = useCallback((slotIdx: number, delta: -1 | 1) => {
    sounds.playPickup();
    setBotSlots((prev) => {
      const next = [...prev];
      const currDiff = next[slotIdx].difficulty;
      const currIdx = DIFFICULTIES.indexOf(currDiff);
      const nextIdx = (currIdx + delta + DIFFICULTIES.length) % DIFFICULTIES.length;
      next[slotIdx] = { ...next[slotIdx], difficulty: DIFFICULTIES[nextIdx] };
      return next;
    });
  }, []);

  // Cambiar número de bots con flechas
  const cycleNumBots = useCallback((delta: -1 | 1) => {
    sounds.playPickup();
    setNumBots((prev) => {
      const next = prev + delta;
      if (next < 1) return MAX_BOTS;
      if (next > MAX_BOTS) return 1;
      return next;
    });
  }, []);

  // Ejecutar combate configurado desde el pop-up de partida
  const handleExecuteFight = useCallback((chosenWorldId: string, finalRounds: number, _modeName: GameModeOption) => {
    sounds.playPickup();

    // Resolver facciones aleatorias al empezar la partida sin repetir entre slots
    // mientras queden facciones disponibles, excluyendo las ya elegidas explícitamente en otros slots;
    // si se agotan, permite repetir.
    const activeSlots = botSlots.slice(0, numBots);
    const explicitFactions = new Set<BotFaction>();
    activeSlots.forEach((slot) => {
      if (slot.faction !== 'RANDOM') {
        explicitFactions.add(slot.faction);
      }
    });

    let availableFactions = CANONICAL_BOT_FACTIONS.filter((f) => !explicitFactions.has(f));

    const resolvedSlots: BotSlotConfig[] = activeSlots.map((slot) => {
      if (slot.faction === 'RANDOM') {
        if (availableFactions.length === 0) {
          availableFactions = [...CANONICAL_BOT_FACTIONS];
        }
        const randIndex = Math.floor(Math.random() * availableFactions.length);
        const randFaction = availableFactions.splice(randIndex, 1)[0];
        return { ...slot, faction: randFaction };
      }
      return slot;
    });

    const firstBotFaction = (resolvedSlots[0].faction as BotFaction) || selectedBotFaction;
    onSelectBotFaction(firstBotFaction);

    const effectiveP1 = BotFaction.Ninja;
    const effectiveP2 = isLocal1v1 ? BotFaction.Ninja : firstBotFaction;

    if (onStartFightWithConfig) {
      onStartFightWithConfig(effectiveP1, effectiveP2, chosenWorldId, finalRounds, resolvedSlots);
    } else {
      onSelectRounds(finalRounds);
      onGoToWorldSelect(effectiveP1, effectiveP2, finalRounds);
    }
  }, [botSlots, numBots, selectedBotFaction, onSelectBotFaction, isLocal1v1, onStartFightWithConfig, onSelectRounds, onGoToWorldSelect]);

  // Confirmar y abrir pop-up de configuración de partida
  const handleConfirm = useCallback(() => {
    sounds.playPickup();
    setShowMatchSetup(true);
  }, []);

  // Control total por teclado estilo Arcade / Superfighters
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showMatchSetup) return;
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
        if (focusedPanel === 'p1') {
          cyclePlayerProtagonist(-1);
        } else if (focusedPanel === 'com') {
          cycleSlotFaction(focusedSlotIdx, -1);
        } else if (focusedPanel === 'bots') {
          cycleNumBots(-1);
        } else if (focusedPanel === 'accept') {
          setFocusedPanel('bots');
        }
      } else if (key === 'ArrowRight') {
        e.preventDefault();
        if (focusedPanel === 'p1') {
          cyclePlayerProtagonist(1);
        } else if (focusedPanel === 'com') {
          cycleSlotFaction(focusedSlotIdx, 1);
        } else if (focusedPanel === 'bots') {
          cycleNumBots(1);
        }
      } else if (key === 'ArrowUp') {
        e.preventDefault();
        if (focusedPanel === 'accept') {
          setFocusedPanel('bots');
        } else if (focusedPanel === 'bots') {
          setFocusedPanel('com');
        } else if (focusedPanel === 'com') {
          setFocusedPanel('p1');
        }
      } else if (key === 'ArrowDown') {
        e.preventDefault();
        if (focusedPanel === 'p1') {
          setFocusedPanel('com');
        } else if (focusedPanel === 'com') {
          setFocusedPanel('bots');
        } else if (focusedPanel === 'bots') {
          setFocusedPanel('accept');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedPanel, focusedSlotIdx, cycleSlotFaction, cycleNumBots, cyclePlayerProtagonist, handleConfirm, onBackToLanding, showMatchSetup]);

  return (
    <div className="relative w-full h-full max-h-screen flex flex-col justify-between items-center bg-black text-white font-pixel overflow-hidden p-2 sm:p-3 select-none">
      {/* ── FONDO RETRO DE SUPERFIGHTERS (REJILLA TÁCTICA ROJA) ── */}
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
      <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(circle_at_center,rgba(185,28,28,0.18)_0%,rgba(0,0,0,0.85)_75%)]" />

      {/* ── CABECERA / LOGO ESTILO SUPERFIGHTERS CLÁSICO ── */}
      <header className="w-full max-w-4xl flex items-center justify-between px-2 pt-1 pb-1 shrink-0">
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

        <div className="text-center">
          <div className="border-t-2 border-b-2 border-white py-0.5 px-6 tracking-[0.25em] text-lg sm:text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(255,255,255,0.25)]">
            super<span className="text-red-500">N</span>
          </div>
          <div className="text-[11px] text-red-500 tracking-[0.25em] mt-0.5 font-bold uppercase">
            {isLocal1v1 ? 'DUEL 1 VS 1 — LOCAL MODE' : 'CUSTOM FIGHT — BATTLE ARENA'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playPickup();
              onOpenArsenal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black border-2 border-white hover:bg-white hover:text-black transition text-xs cursor-pointer"
            title="Ver Arsenal"
          >
            <Swords className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ARSENAL</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-1.5 bg-black border-2 border-white hover:bg-white hover:text-black transition text-white cursor-pointer"
            title={muted ? 'Activar sonido' : 'Silenciar'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
          </button>
        </div>
      </header>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className="w-full max-w-5xl flex-1 flex flex-col justify-center items-center py-1 px-1 min-h-0 overflow-y-auto">
        {/* PLAYER 1 CENTRADO ARRIBA */}
        <div className="flex items-center justify-center gap-4 mb-3">
          <div
            onClick={() => setFocusedPanel('p1')}
            className={`w-48 sm:w-56 bg-black border-2 p-2.5 flex flex-col items-center justify-between text-center transition cursor-pointer ${
              focusedPanel === 'p1' ? 'border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'border-neutral-500'
            }`}
          >
            <div className="text-xs font-black tracking-widest text-white border-b border-white/40 pb-1 w-full uppercase">
              PLAYER 1
            </div>

            <div className="w-20 h-20 my-1.5 rounded-lg border-2 border-white bg-black flex items-center justify-center p-1.5 relative shadow-inner overflow-hidden">
              <img
                src={currentProtagonist.spriteUrl}
                alt={currentProtagonist.name}
                className="max-h-full max-w-full object-contain [image-rendering:pixelated]"
              />
            </div>

            <div className="flex items-center justify-between w-full px-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cyclePlayerProtagonist(-1);
                }}
                className="text-xs text-neutral-400 hover:text-white px-1 font-bold cursor-pointer transition select-none"
                title="Personaje anterior"
              >
                ◀
              </button>
              <div className="text-xs font-black tracking-wider text-yellow-300">
                {currentProtagonist.name}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cyclePlayerProtagonist(1);
                }}
                className="text-xs text-neutral-400 hover:text-white px-1 font-bold cursor-pointer transition select-none"
                title="Siguiente personaje"
              >
                ▶
              </button>
            </div>

            <div className={`text-[10px] tracking-wider uppercase font-bold mt-0.5 ${
              currentProtagonist.isPlayable ? 'text-emerald-400' : 'text-amber-400/90'
            }`}>
              {currentProtagonist.tag}
            </div>
          </div>

          {isLocal1v1 && (
            <div
              onClick={() => setFocusedPanel('com')}
              className={`w-48 sm:w-56 bg-black border-2 p-2.5 flex flex-col items-center justify-between text-center transition cursor-pointer ${
                focusedPanel === 'com' ? 'border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'border-neutral-500'
              }`}
            >
              <div className="text-xs font-black tracking-widest text-white border-b border-white/40 pb-1 w-full uppercase">
                PLAYER 2
              </div>

              <div className="w-20 h-20 my-1.5 rounded-lg border-2 border-white bg-black flex items-center justify-center p-1.5 relative shadow-inner">
                <img
                  src="/assets/sprites/player/ninja.png"
                  alt="Ninja J2"
                  className="max-h-full max-w-full object-contain [image-rendering:pixelated]"
                />
              </div>

              <div className="text-xs font-black tracking-wider text-yellow-300">
                NINJA (P2)
              </div>
              <div className="text-[11px] text-neutral-300 tracking-wider uppercase">
                INDEPENDENT
              </div>
            </div>
          )}
        </div>

        {/* SLOTS DE BOTS DEBAJO DE PLAYER 1 */}
        {!isLocal1v1 && (
          <div className="w-full flex flex-wrap items-center justify-center gap-2.5 mb-2.5">
            {Array.from({ length: MAX_BOTS }).map((_, slotIdx) => {
              const isActive = slotIdx < numBots;
              const slot = botSlots[slotIdx] || { faction: 'RANDOM', difficulty: 'normal', team: 'independent' };
              const isRandom = slot.faction === 'RANDOM';
              const arch = isRandom ? null : getBotArchetype(slot.faction as BotFaction);
              const isSlotFocused = focusedPanel === 'com' && focusedSlotIdx === slotIdx;

              if (!isActive) {
                return (
                  <div
                    key={slotIdx}
                    className="w-36 sm:w-40 h-44 border border-dashed border-neutral-700 bg-black/40 flex flex-col items-center justify-center text-center opacity-40 select-none"
                  >
                    <span className="text-xs text-neutral-500 font-black tracking-widest uppercase mb-1">
                      COM {slotIdx + 1}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-bold tracking-widest">
                      - EMPTY -
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={slotIdx}
                  onClick={() => {
                    setFocusedPanel('com');
                    setFocusedSlotIdx(slotIdx);
                  }}
                  className={`w-36 sm:w-40 bg-black border-2 p-2 flex flex-col items-center justify-between text-center transition cursor-pointer ${
                    isSlotFocused
                      ? 'border-white shadow-[0_0_12px_rgba(255,255,255,0.4)] scale-105'
                      : 'border-neutral-500'
                  }`}
                >
                  <div className="text-[10px] font-black tracking-widest text-white border-b border-white/30 pb-0.5 w-full uppercase">
                    COM {slotIdx + 1}
                  </div>

                  {/* Retrato */}
                  <div className="w-16 h-16 my-1 rounded border border-white bg-black flex items-center justify-center p-1 relative shadow-inner">
                    {isRandom ? (
                      <div className="text-2xl font-black text-white select-none animate-pulse">?</div>
                    ) : arch?.spriteUrl ? (
                      <img
                        src={arch.spriteUrl}
                        alt={arch.name}
                        className="max-h-full max-w-full object-contain [image-rendering:pixelated]"
                      />
                    ) : (
                      <div className="text-xl font-black text-neutral-400">?</div>
                    )}
                  </div>

                  {/* Selector de Facción: ◀ NOMBRE ▶ */}
                  <div className="w-full flex items-center justify-between px-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFocusedPanel('com');
                        setFocusedSlotIdx(slotIdx);
                        cycleSlotFaction(slotIdx, -1);
                      }}
                      className="text-white hover:text-yellow-300 font-black text-xs px-1 py-0.5 transition cursor-pointer active:scale-125"
                      title="Anterior facción"
                    >
                      ◀
                    </button>
                    <div className="text-[11px] font-black tracking-wider text-yellow-300 uppercase truncate px-0.5">
                      {isRandom ? 'RANDOM' : arch?.name || slot.faction}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFocusedPanel('com');
                        setFocusedSlotIdx(slotIdx);
                        cycleSlotFaction(slotIdx, 1);
                      }}
                      className="text-white hover:text-yellow-300 font-black text-xs px-1 py-0.5 transition cursor-pointer active:scale-125"
                      title="Siguiente facción"
                    >
                      ▶
                    </button>
                  </div>

                  {/* Selector de Dificultad: ◄ EASY/NORMAL/HARD ► */}
                  <div className="w-full flex items-center justify-between px-0.5 mt-1 border-t border-white/20 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFocusedPanel('com');
                        setFocusedSlotIdx(slotIdx);
                        cycleSlotDifficulty(slotIdx, -1);
                      }}
                      className="text-neutral-400 hover:text-white font-black text-xs px-1 cursor-pointer"
                      title="Dificultad anterior"
                    >
                      ◄
                    </button>
                    <span className="text-[10px] sm:text-xs font-bold tracking-wider text-neutral-200 uppercase">
                      {slot.difficulty}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFocusedPanel('com');
                        setFocusedSlotIdx(slotIdx);
                        cycleSlotDifficulty(slotIdx, 1);
                      }}
                      className="text-neutral-400 hover:text-white font-black text-xs px-1 cursor-pointer"
                      title="Siguiente dificultad"
                    >
                      ►
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── CUADRO NUMBER OF BOTS (1–5) REEMPLAZA A NUMBER OF ROUNDS ── */}
        {!isLocal1v1 && (
          <div
            onClick={() => setFocusedPanel('bots')}
            className={`w-full max-w-sm bg-black border-2 p-2 flex flex-col items-center justify-center text-center transition cursor-pointer mb-2.5 ${
              focusedPanel === 'bots'
                ? 'border-white shadow-[0_0_12px_rgba(255,255,255,0.3)]'
                : 'border-neutral-500'
            }`}
          >
            <div className="text-[10px] tracking-widest text-white uppercase mb-1.5 font-bold">
              NUMBER OF BOTS:
            </div>

            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {Array.from({ length: MAX_BOTS }, (_, i) => i + 1).map((num) => {
                const isSelected = numBots === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playPickup();
                      setNumBots(num);
                      setFocusedPanel('bots');
                    }}
                    className={`px-3 py-1 text-xs font-black tracking-wider transition cursor-pointer ${
                      isSelected
                        ? 'border-2 border-white bg-black text-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.5)]'
                        : 'text-neutral-400 hover:text-white border border-transparent'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── BOTÓN ACCEPT / ELEGIR MUNDO ── */}
        <button
          onClick={handleConfirm}
          onMouseEnter={() => setFocusedPanel('accept')}
          className={`px-6 py-2 bg-black border-2 text-xs sm:text-sm font-black tracking-[0.2em] text-white hover:bg-white hover:text-black transition uppercase cursor-pointer shadow-lg active:scale-95 ${
            focusedPanel === 'accept'
              ? 'border-white bg-neutral-900 shadow-[0_0_16px_rgba(255,255,255,0.5)]'
              : 'border-neutral-400'
          }`}
        >
          <span>[ SPACE ] ACCEPT : SELECT STAGE ➔</span>
        </button>
      </main>

      {/* ── BARRA INFERIOR / INSTRUCCIONES (UI-09: >= 12px) ── */}
      <footer className="w-full max-w-4xl text-center py-1.5 text-xs text-neutral-300 tracking-wider font-mono-code uppercase shrink-0">
        ↑↓←→ NAVEGAR · SPACE ACEPTAR · ESC VOLVER
      </footer>

      {/* ── POP-UP MODAL DE CONFIGURACIÓN DE COMBATE (ROUNDS Y MAPA) ── */}
      <MatchSetupModal
        isOpen={showMatchSetup}
        onClose={() => setShowMatchSetup(false)}
        onStartFight={handleExecuteFight}
      />
    </div>
  );
};

export default MainMenu;
