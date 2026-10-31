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
  fallbackUrl?: string;
  isPlayable: boolean;
}

const GYMRAT_SPRITE_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEUAAABLCAYAAAAmh0pZAAADk0lEQVR4AeyasXLTQBCG1xTUKZ2KFAy14AHAj8IwdDQ8AEWY4RWoYHgWw1AzrhmKUMVlBlzRmD3Fe/ol78mS7uRTnM3c5tar83+rT7c5Wc4Dsp89AgZlDwmRQTEoCgElZCvFoCgElJCtFIOiEFBCtlIMikJACdlKMSgKASVkK8WgKASU0OmuFOVku4ZioWx5otTGknlbLJS82Y80u0FRwCaDsv34ioaaklfWUDIoWc8i8eQGRQEaBWX77jmJofbszRfqY/jeKfhRUKZwAmPkYFAUqlFQZh++kRhd/yKx2i4UKDEco+SVNRQFJWvmI05uUBS4sVBmrFmalJHrOVa188dEO5tyyVQJk31DiDDEj10pojNSn0e2DUrfRwLVGcBOVAXrHt7c1Y/kf9UGJX92mTIwKAr4JhRfMvKZpnMPjw5ktyl7ZVIXwp0IfT7mc2A/S2tCyZLE1CY1KMoVcVD8csVSKZf+7qYLfXdzJoZ6uJugj2PQD42ZQik5KJir+UzAoDCEZusEJbTUpYxcj6WHJRB6bzMRef319z8SQx0+7suc/VFbJyijZjBBcYOiXBQHZcbx0lwZiMlTNNeHSqOxvFkmvr149JDEWtRGLSUHpWXu+3noGFDuHNkmlLKM+CxmUkau59dVw8cC6Fcj/ANsV3oYxp0ISw/jIT9UwqyfvJSaUHgOawZFWQNtUNRScuXUx3BOLJlaPPDdEI45pt8G5Zh5TGoug6Jcjq5QfCmxRsjnQ7dtPp+TWFEUVOzs6acfpNn5558kdqvgf/u5aiUL/9XgRyZ0ukJJOOX0pQyKco1GgbLZbEhsvV6TmDJ/GZKxri8D1S+8MfOlxIdDPh+Kb6NAiU8rr4JBUfjHQvHLGz+b/H37jMSuXz8hsdVqRSvFZKzr8QYPNTl3Pxf7o7ZYKKMml0u8M5RcCeaYdwgUv4wby7vKH74vwpsuHqDuGrUx+DgCdBpz+RxYM3kbAiV5ElMTNCjKFUkHBZY6Pj3jObFk+KXa/JgupaQqJAymg5IwqdxSBkW5Al2h+L/2L4sLEnv//Q+JDSgZTGdsfZzroN8VykGhUxpgUJSrGYSyXC63YlIurr84OyOxy+WKxIjI7yDU4Ue0Xe90xUTb9aLtepbspc/jB7cglMGKJ/BGg6JcxCCUxWJBi53h+65ubkjsclGQGI/xOwj7B5toux4HXyXSR82+fhBKX6G7O34/c4Oyz4T+AwAA//9ZbFPuAAAABklEQVQDAD60V3dfWp08AAAAAElFTkSuQmCC';

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
    tag: 'JUGABLE',
    spriteUrl: '/assets/sprites/player/gymrat.png',
    fallbackUrl: GYMRAT_SPRITE_BASE64,
    isPlayable: true,
  },
  {
    id: 'santaclo',
    name: 'SANTA CLAUS',
    tag: 'JUGABLE',
    spriteUrl: '/assets/sprites/player/santaclo.png',
    isPlayable: true,
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

    const selectedP1Faction =
      currentProtagonist.id === 'gymrat'
        ? BotFaction.Gymrat
        : currentProtagonist.id === 'santaclo'
        ? BotFaction.Santa
        : BotFaction.Ninja;

    onSelectPlayerFaction(selectedP1Faction);

    const effectiveP1 = selectedP1Faction;
    const effectiveP2 = isLocal1v1 ? BotFaction.Ninja : firstBotFaction;

    if (onStartFightWithConfig) {
      onStartFightWithConfig(effectiveP1, effectiveP2, chosenWorldId, finalRounds, resolvedSlots);
    } else {
      onSelectRounds(finalRounds);
      onGoToWorldSelect(effectiveP1, effectiveP2, finalRounds);
    }
  }, [botSlots, numBots, selectedBotFaction, onSelectBotFaction, onSelectPlayerFaction, currentProtagonist, isLocal1v1, onStartFightWithConfig, onSelectRounds, onGoToWorldSelect]);

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
      {/* ── FONDO PARALLAX DE CIUDAD NOIR (MISMO FONDO DE PORTADA) ── */}
      <div
        className="absolute inset-0 pointer-events-none -z-30"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, #1A0505 0%, #120409 38%, #090614 75%, #050510 100%)',
        }}
      />

      {/* Siluetas de la ciudad con ventanas y balizas pulsantes */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[55vh] min-h-[280px] pointer-events-none -z-20 opacity-50"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
        style={{ shapeRendering: 'crispEdges' }}
      >
        <defs>
          <linearGradient id="skylineFarGradMain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#120c1d" />
            <stop offset="100%" stopColor="#06050e" />
          </linearGradient>
        </defs>

        <g fill="url(#skylineFarGradMain)">
          <rect x="0" y="90" width="75" height="310" />
          <rect x="150" y="60" width="95" height="340" />
          <line x1="197" y1="15" x2="197" y2="35" stroke="#251c3d" strokeWidth="2" />
          <circle cx="197" cy="15" r="3" fill="#ef4444" className="animate-beacon" />
          <rect x="365" y="80" width="110" height="320" />
          <rect x="520" y="40" width="160" height="360" />
          <circle cx="600" cy="2" r="3.5" fill="#ef4444" className="animate-beacon" />
          <rect x="830" y="75" width="105" height="325" />
          <rect x="1055" y="50" width="145" height="350" />
          <circle cx="1120" cy="20" r="3" fill="#ef4444" className="animate-beacon" />
        </g>

        <g fill="#f59e0b">
          <rect x="165" y="90" width="5" height="8" opacity="0.75" />
          <rect x="210" y="120" width="5" height="8" opacity="0.65" />
          <rect x="400" y="110" width="6" height="6" opacity="0.8" />
          <rect x="580" y="80" width="6" height="8" opacity="0.7" />
          <rect x="620" y="80" width="6" height="8" opacity="0.6" />
          <rect x="850" y="100" width="6" height="8" opacity="0.7" />
          <rect x="1105" y="120" width="5" height="8" opacity="0.7" />
        </g>
      </svg>

      {/* Capa de contraste y textura CRT suave */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 40%, rgba(5, 5, 16, 0.6) 80%, rgba(0, 0, 0, 0.95) 100%)',
        }}
      />

      {/* ── CABECERA / LOGO ESTILO SUPERFIGHTERS CLÁSICO ── */}
      <header className="w-full max-w-5xl flex items-center justify-between px-3 pt-2 pb-1 shrink-0 z-10">
        <button
          onClick={() => {
            sounds.playPickup();
            onBackToLanding();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-black/80 backdrop-blur-sm border-2 border-white hover:bg-white hover:text-black transition text-[10px] cursor-pointer"
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black/80 backdrop-blur-sm border-2 border-white hover:bg-white hover:text-black transition text-xs cursor-pointer"
            title="Ver Arsenal"
          >
            <Swords className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ARSENAL</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-1.5 bg-black/80 backdrop-blur-sm border-2 border-white hover:bg-white hover:text-black transition text-white cursor-pointer"
            title={muted ? 'Activar sonido' : 'Silenciar'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
          </button>
        </div>
      </header>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className="w-full max-w-5xl flex-1 flex flex-col justify-center items-center py-1 px-1 min-h-0 overflow-y-auto z-10">
        {/* ── ÁREA DE PREVISUALIZACIÓN CENTRAL CON RIM LIGHT ── */}
        <div className="flex items-center justify-center gap-6 mb-2.5">
          {/* Tarjeta de Selección PLAYER 1 */}
          <div
            onClick={() => setFocusedPanel('p1')}
            className={`w-48 sm:w-56 bg-black/75 backdrop-blur-sm border-2 p-2.5 flex flex-col items-center justify-between text-center transition cursor-pointer ${
              focusedPanel === 'p1' ? 'border-yellow-400 shadow-[0_0_16px_rgba(250,204,21,0.45)] ring-1 ring-yellow-400' : 'border-white hover:border-neutral-300'
            }`}
          >
            <div className="text-xs font-black tracking-widest text-white border-b border-white/40 pb-1 w-full uppercase flex items-center justify-between">
              <span>PLAYER 1</span>
              <span className="text-[9px] text-yellow-300 font-bold">[ P1 ]</span>
            </div>

            {/* Avatar / Sprite con Rim Light */}
            <div className="relative w-24 h-24 my-1.5 rounded border border-white/80 bg-black/80 flex items-center justify-center p-1.5 shadow-inner overflow-hidden">
              {/* Rim light halo rojo */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.35)_0%,transparent_75%)]" />
              <img
                src={currentProtagonist.spriteUrl}
                alt={currentProtagonist.name}
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.dataset.failedOnce) {
                    img.dataset.failedOnce = '1';
                    if (currentProtagonist.id === 'gymrat') {
                      img.src = '/assets/sprites/player/Gymrat.png';
                      return;
                    }
                  }
                  if (currentProtagonist.fallbackUrl && img.src !== currentProtagonist.fallbackUrl) {
                    img.src = currentProtagonist.fallbackUrl;
                  }
                }}
                className="relative z-10 max-h-full max-w-full object-contain filter drop-shadow-[0_0_8px_rgba(239,68,68,0.7)] [image-rendering:pixelated] hover:scale-110 transition-transform"
              />
              <div className="absolute bottom-0 w-12 h-[2px] bg-red-500 shadow-[0_0_6px_#ef4444]" />
            </div>

            <div className="flex items-center justify-between w-full px-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cyclePlayerProtagonist(-1);
                }}
                className="text-xs text-neutral-400 hover:text-white px-1 font-bold cursor-pointer transition select-none active:scale-125"
                title="Personaje anterior"
              >
                ◀
              </button>
              <div className="text-xs font-black tracking-wider text-yellow-300 uppercase truncate">
                {currentProtagonist.name}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cyclePlayerProtagonist(1);
                }}
                className="text-xs text-neutral-400 hover:text-white px-1 font-bold cursor-pointer transition select-none active:scale-125"
                title="Siguiente personaje"
              >
                ▶
              </button>
            </div>

            <div className={`text-[9px] tracking-wider uppercase font-bold mt-0.5 ${
              currentProtagonist.isPlayable ? 'text-emerald-400' : 'text-amber-400/90'
            }`}>
              {currentProtagonist.tag}
            </div>
          </div>

          {isLocal1v1 && (
            <div
              onClick={() => setFocusedPanel('com')}
              className={`w-48 sm:w-56 bg-black/75 backdrop-blur-sm border-2 p-2.5 flex flex-col items-center justify-between text-center transition cursor-pointer ${
                focusedPanel === 'com' ? 'border-yellow-400 shadow-[0_0_16px_rgba(250,204,21,0.45)] ring-1 ring-yellow-400' : 'border-white hover:border-neutral-300'
              }`}
            >
              <div className="text-xs font-black tracking-widest text-white border-b border-white/40 pb-1 w-full uppercase flex items-center justify-between">
                <span>PLAYER 2</span>
                <span className="text-[9px] text-yellow-300 font-bold">[ P2 ]</span>
              </div>

              <div className="relative w-24 h-24 my-1.5 rounded border border-white/80 bg-black/80 flex items-center justify-center p-1.5 shadow-inner">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.3)_0%,transparent_75%)]" />
                <img
                  src="/assets/sprites/player/ninja.png"
                  alt="Ninja J2"
                  className="relative z-10 max-h-full max-w-full object-contain filter drop-shadow-[0_0_8px_rgba(56,189,248,0.7)] [image-rendering:pixelated]"
                />
                <div className="absolute bottom-0 w-12 h-[2px] bg-cyan-400 shadow-[0_0_6px_#38bdf8]" />
              </div>

              <div className="text-xs font-black tracking-wider text-yellow-300 uppercase">
                NINJA (P2)
              </div>
              <div className="text-[9px] text-neutral-400 tracking-wider uppercase font-bold mt-0.5">
                DUELO LOCAL
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
                    className="w-36 sm:w-40 h-44 border-2 border-dashed border-neutral-700/60 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-center opacity-45 select-none"
                  >
                    <span className="text-[10px] text-neutral-500 font-black tracking-widest uppercase mb-2">
                      COM {slotIdx + 1}
                    </span>
                    <div className="w-14 h-14 rounded border border-neutral-700/50 bg-black/50 flex items-center justify-center relative">
                      <span className="text-3xl font-black text-neutral-600/70 select-none">?</span>
                    </div>
                    <span className="text-[8px] text-neutral-500 font-mono-code tracking-widest uppercase mt-2">
                      [ VACÍO ]
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
                  className={`w-36 sm:w-40 bg-black/75 backdrop-blur-sm border-2 p-2 flex flex-col items-center justify-between text-center transition cursor-pointer ${
                    isSlotFocused
                      ? 'border-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.45)] ring-1 ring-yellow-400 scale-105'
                      : 'border-white hover:border-neutral-300'
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
            className={`w-full max-w-sm bg-black/75 backdrop-blur-sm border-2 p-2 flex flex-col items-center justify-center text-center transition cursor-pointer mb-2.5 ${
              focusedPanel === 'bots'
                ? 'border-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.4)] ring-1 ring-yellow-400'
                : 'border-white hover:border-neutral-300'
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
                        ? 'border-2 border-yellow-400 bg-yellow-950/60 text-yellow-300 scale-110 shadow-[0_0_8px_rgba(250,204,21,0.6)]'
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
          className={`px-6 py-2 bg-black/80 backdrop-blur-sm border-2 text-xs sm:text-sm font-black tracking-[0.2em] transition uppercase cursor-pointer shadow-lg active:scale-95 ${
            focusedPanel === 'accept'
              ? 'border-yellow-400 text-yellow-300 bg-neutral-900/90 shadow-[0_0_16px_rgba(250,204,21,0.5)] scale-105'
              : 'border-white text-white hover:border-yellow-400 hover:text-yellow-300'
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
