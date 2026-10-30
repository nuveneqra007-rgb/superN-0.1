// ==============================================================================
// ModeSelectScreen.tsx — Selección de Modo de Juego Estilo Duck Game / Retro Arcade
// Diseño:
//   1. Columna de opciones flotante a la izquierda (texto puro pixel art, sin tarjetas).
//   2. Escenario estático y detallado de fondo (Puerto Maldito / Metro Cero) con personajes
//      en posición idle (Ninja vs Rival), plataformas industriales, grúa y contenedores.
//   3. Capa atmosférica con viñeta y gradiente para contraste del texto.
//   4. Menú secundario flotante contextual en columna derecha para sub-opciones.
//   5. Barra de navegación inferior con badges pixelados y créditos en la esquina izquierda.
// ==============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { sounds } from '../game/SoundEffects';
import { Volume2, VolumeX, BookOpen, Settings, Swords, ChevronRight, X } from 'lucide-react';
import { CONTROLS_TEXT } from '../game/Controls';

export type GameMode = 'vsBot' | 'local1v1';

interface ModeSelectScreenProps {
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onConfirmMode: () => void;
  onBackToLanding: () => void;
}

interface PrimaryOption {
  id: 'solo' | 'versus' | 'tutorial' | 'config';
  title: string;
  badge?: string;
  subOptions: {
    id: string;
    title: string;
    action: () => void;
  }[];
}

export const ModeSelectScreen: React.FC<ModeSelectScreenProps> = ({
  selectedMode,
  onSelectMode,
  onConfirmMode,
  onBackToLanding,
}) => {
  const [muted, setMuted] = useState<boolean>(sounds.getMuted());
  const [activePrimaryIdx, setActivePrimaryIdx] = useState<number>(
    selectedMode === 'local1v1' ? 1 : 0
  );
  const [isSubMenuFocused, setIsSubMenuFocused] = useState<boolean>(false);
  const [activeSubIdx, setActiveSubIdx] = useState<number>(0);
  const [activeModal, setActiveModal] = useState<'tutorial' | 'config' | null>(null);

  const toggleSound = useCallback(() => {
    const next = !muted;
    sounds.setMuted(next);
    setMuted(next);
    sounds.playPickup();
  }, [muted]);

  // Ejecutar modo 1 Jugador
  const startSolo = useCallback(() => {
    sounds.playPickup();
    onSelectMode('vsBot');
    onConfirmMode();
  }, [onSelectMode, onConfirmMode]);

  // Ejecutar modo 2 Jugadores
  const startVersus = useCallback(() => {
    sounds.playPickup();
    onSelectMode('local1v1');
    onConfirmMode();
  }, [onSelectMode, onConfirmMode]);

  // Definición de las opciones y sus sub-menús contextuales
  const primaryOptions: PrimaryOption[] = [
    {
      id: 'solo',
      title: '1 JUGADOR',
      badge: 'SOLO',
      subOptions: [
        {
          id: 'solo-vs-bot',
          title: 'DUELO VS BOT (IA)',
          action: startSolo,
        },
        {
          id: 'solo-practice',
          title: 'MODO PRÁCTICA',
          action: startSolo,
        },
      ],
    },
    {
      id: 'versus',
      title: '2 JUGADORES',
      badge: 'VERSUS',
      subOptions: [
        {
          id: 'vs-local',
          title: '1 VS 1 LOCAL',
          action: startVersus,
        },
        {
          id: 'vs-coop',
          title: 'COOPERATIVO',
          action: startVersus,
        },
      ],
    },
    {
      id: 'tutorial',
      title: 'TUTORIAL',
      badge: 'GUÍA',
      subOptions: [
        {
          id: 'tut-moves',
          title: 'CONTROLES BÁSICOS',
          action: () => {
            sounds.playPickup();
            setActiveModal('tutorial');
          },
        },
        {
          id: 'tut-weapons',
          title: 'COMBOS & ARMAS',
          action: () => {
            sounds.playPickup();
            setActiveModal('tutorial');
          },
        },
      ],
    },
    {
      id: 'config',
      title: 'CONFIGURACIÓN',
      badge: 'AJUSTES',
      subOptions: [
        {
          id: 'cfg-sound',
          title: muted ? 'AUDIO SFX: [ OFF ]' : 'AUDIO SFX: [ ON ]',
          action: toggleSound,
        },
        {
          id: 'cfg-keys',
          title: 'MAPA DE TECLAS',
          action: () => {
            sounds.playPickup();
            setActiveModal('config');
          },
        },
      ],
    },
  ];

  const currentPrimary = primaryOptions[activePrimaryIdx];

  // Navegación por teclado arcade (estilo Duck Game)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      // Si hay un modal abierto, cerrarlo con Escape o Espacio/Enter
      if (activeModal) {
        if (key === 'Escape' || key === ' ' || key === 'Enter') {
          e.preventDefault();
          sounds.playPickup();
          setActiveModal(null);
        }
        return;
      }

      if (key === 'Escape') {
        e.preventDefault();
        sounds.playPickup();
        if (isSubMenuFocused) {
          setIsSubMenuFocused(false);
        } else {
          onBackToLanding();
        }
        return;
      }

      // Columna secundaria activa
      if (isSubMenuFocused) {
        if (key === 'ArrowUp' || key === 'w' || key === 'W') {
          e.preventDefault();
          sounds.playPickup();
          setActiveSubIdx((prev) => (prev > 0 ? prev - 1 : currentPrimary.subOptions.length - 1));
        } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
          e.preventDefault();
          sounds.playPickup();
          setActiveSubIdx((prev) => (prev < currentPrimary.subOptions.length - 1 ? prev + 1 : 0));
        } else if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
          e.preventDefault();
          sounds.playPickup();
          setIsSubMenuFocused(false);
        } else if (key === ' ' || key === 'Enter') {
          e.preventDefault();
          const sub = currentPrimary.subOptions[activeSubIdx];
          if (sub) sub.action();
        }
        return;
      }

      // Columna primaria activa
      if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        e.preventDefault();
        sounds.playPickup();
        setActivePrimaryIdx((prev) => (prev > 0 ? prev - 1 : primaryOptions.length - 1));
        setActiveSubIdx(0);
      } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        e.preventDefault();
        sounds.playPickup();
        setActivePrimaryIdx((prev) => (prev < primaryOptions.length - 1 ? prev + 1 : 0));
        setActiveSubIdx(0);
      } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        e.preventDefault();
        sounds.playPickup();
        setIsSubMenuFocused(true);
        setActiveSubIdx(0);
      } else if (key === ' ' || key === 'Enter') {
        e.preventDefault();
        // Acción directa al aceptar la opción primaria
        if (currentPrimary.id === 'solo') {
          startSolo();
        } else if (currentPrimary.id === 'versus') {
          startVersus();
        } else if (currentPrimary.id === 'tutorial') {
          sounds.playPickup();
          setActiveModal('tutorial');
        } else if (currentPrimary.id === 'config') {
          sounds.playPickup();
          setIsSubMenuFocused(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isSubMenuFocused,
    activePrimaryIdx,
    activeSubIdx,
    currentPrimary,
    primaryOptions.length,
    activeModal,
    startSolo,
    startVersus,
    onBackToLanding,
  ]);

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col justify-between font-pixel select-none overflow-hidden text-neutral-100">
      {/* ─────────────────────────────────────────────────────────────
          CAPA 1: FONDO PARALLAX DE CIUDAD + ESCENARIO ESTÁTICO (PUERTO MALDITO)
          ───────────────────────────────────────────────────────────── */}
      {/* Cielo nocturno carmesí profundo */}
      <div
        className="absolute inset-0 pointer-events-none -z-30"
        style={{
          background:
            'radial-gradient(ellipse at 60% 40%, #1A0505 0%, #120409 38%, #090614 75%, #04030a 100%)',
        }}
      />

      {/* Parallax de la ciudad al fondo */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[55vh] min-h-[300px] pointer-events-none -z-20 opacity-60"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
        style={{ shapeRendering: 'crispEdges' }}
      >
        <defs>
          <linearGradient id="skylineFarGradMode" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#120c1d" />
            <stop offset="100%" stopColor="#06050e" />
          </linearGradient>
          <linearGradient id="skylineMidGradMode" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a080e" />
            <stop offset="100%" stopColor="#080408" />
          </linearGradient>
        </defs>

        {/* Siluetas de rascacielos lejanos con balizas rojas */}
        <g fill="url(#skylineFarGradMode)">
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

        {/* Ventanas ámbar parpadeantes */}
        <g fill="#f59e0b">
          <rect x="165" y="90" width="5" height="8" opacity="0.75" />
          <rect x="210" y="120" width="5" height="8" opacity="0.65" />
          <rect x="400" y="110" width="6" height="6" opacity="0.8" />
          <rect x="580" y="80" width="6" height="8" opacity="0.7" />
          <rect x="620" y="80" width="6" height="8" opacity="0.6" />
          <rect x="850" y="100" width="6" height="8" opacity="0.7" />
          <rect x="1105" y="120" width="5" height="8" opacity="0.7" />
        </g>

        {/* Grúa industrial a la derecha */}
        <g stroke="#2d0b13" strokeWidth="2.5">
          <line x1="1060" y1="360" x2="1080" y2="150" />
          <line x1="1100" y1="360" x2="1080" y2="150" />
          <line x1="1020" y1="150" x2="1170" y2="150" strokeWidth="3.5" />
          <line x1="1140" y1="150" x2="1140" y2="240" stroke="#fca5a5" strokeWidth="1.5" strokeDasharray="3 3" />
        </g>
      </svg>

      {/* ─────────────────────────────────────────────────────────────
          CAPA 2: ESCENARIO ESTÁTICO DE COMBATE (PUERTO MALDITO / MUELLE TÁCTICO)
          ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none -z-10 flex items-end justify-end">
        {/* Gráficos vectoriales del escenario de plataformas en la mitad derecha */}
        <svg
          className="w-full h-full max-h-[85vh]"
          viewBox="0 0 1000 600"
          preserveAspectRatio="xMaxYMax slice"
          style={{ shapeRendering: 'crispEdges' }}
        >
          <defs>
            <linearGradient id="dockBeam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2c141d" />
              <stop offset="100%" stopColor="#120609" />
            </linearGradient>
            <linearGradient id="crateMetal" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="50%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
          </defs>

          {/* Muelle principal / Suelo de combate */}
          <rect x="340" y="520" width="660" height="80" fill="url(#dockBeam)" />
          {/* Franja de advertencia industrial (Hazard stripes) */}
          <line x1="340" y1="520" x2="1000" y2="520" stroke="#facc15" strokeWidth="4" />
          <g stroke="#1a080e" strokeWidth="6">
            <line x1="360" y1="520" x2="380" y2="530" />
            <line x1="410" y1="520" x2="430" y2="530" />
            <line x1="460" y1="520" x2="480" y2="530" />
            <line x1="510" y1="520" x2="530" y2="530" />
            <line x1="560" y1="520" x2="580" y2="530" />
            <line x1="610" y1="520" x2="630" y2="530" />
            <line x1="660" y1="520" x2="680" y2="530" />
            <line x1="710" y1="520" x2="730" y2="530" />
            <line x1="760" y1="520" x2="780" y2="530" />
            <line x1="810" y1="520" x2="830" y2="530" />
            <line x1="860" y1="520" x2="880" y2="530" />
            <line x1="910" y1="520" x2="930" y2="530" />
            <line x1="960" y1="520" x2="980" y2="530" />
          </g>

          {/* Viga de acero intermedia izquierda */}
          <rect x="420" y="420" width="180" height="14" fill="#3f1722" />
          <line x1="420" y1="420" x2="600" y2="420" stroke="#991b1b" strokeWidth="2" />
          <rect x="440" y="434" width="8" height="86" fill="#240e14" />
          <rect x="570" y="434" width="8" height="86" fill="#240e14" />

          {/* Plataforma elevada central superior (Gantry) */}
          <rect x="660" y="340" width="220" height="16" fill="#3f1722" />
          <line x1="660" y1="340" x2="880" y2="340" stroke="#ef4444" strokeWidth="2" />
          {/* Barandilla de seguridad */}
          <line x1="660" y1="315" x2="880" y2="315" stroke="#581c2b" strokeWidth="2" />
          <line x1="700" y1="315" x2="700" y2="340" stroke="#581c2b" strokeWidth="2" />
          <line x1="770" y1="315" x2="770" y2="340" stroke="#581c2b" strokeWidth="2" />
          <line x1="840" y1="315" x2="840" y2="340" stroke="#581c2b" strokeWidth="2" />

          {/* Cajas de suministros y contenedores */}
          <rect x="450" y="388" width="32" height="32" fill="url(#crateMetal)" stroke="#270e04" strokeWidth="2" />
          <line x1="450" y1="388" x2="482" y2="420" stroke="#270e04" strokeWidth="1.5" />
          <line x1="482" y1="388" x2="450" y2="420" stroke="#270e04" strokeWidth="1.5" />

          <rect x="830" y="476" width="44" height="44" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
          <text x="836" y="502" fill="#64748b" fontSize="8" fontFamily="monospace">CORP</text>

          {/* Barril rojo de combustible */}
          <rect x="795" y="488" width="24" height="32" rx="3" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="2" />
          <line x1="795" y1="498" x2="819" y2="498" stroke="#fca5a5" strokeWidth="1.5" />
          <line x1="795" y1="508" x2="819" y2="508" stroke="#450a0a" strokeWidth="1.5" />
        </svg>

        {/* ── PERSONAJES EN POSICIÓN DE SPAWN / IDLE ── */}
        {/* Ninja (Jugador 1) sobre la plataforma intermedia */}
        <div
          className="absolute z-10 flex flex-col items-center pointer-events-none"
          style={{ right: '46%', bottom: '29%' }}
        >
          <img
            src="/assets/sprites/player/ninja.png"
            alt="Ninja Idle"
            className="w-16 h-18 sm:w-20 sm:h-22 object-contain filter drop-shadow-[0_0_12px_rgba(56,189,248,0.7)]"
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="text-[7px] text-cyan-400 bg-cyan-950/80 px-1 py-0.5 rounded border border-cyan-500/40 mt-1">
            P1 : NINJA
          </span>
        </div>

        {/* Rival / Bot (Assassin) sobre la plataforma superior */}
        <div
          className="absolute z-10 flex flex-col items-center pointer-events-none"
          style={{ right: '18%', bottom: '42%' }}
        >
          <img
            src="/assets/sprites/bot/Assassin_2.png"
            alt="Assassin Idle"
            className="w-16 h-18 sm:w-20 sm:h-22 object-contain filter drop-shadow-[0_0_12px_rgba(239,68,68,0.7)] -scale-x-100"
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="text-[7px] text-red-400 bg-red-950/80 px-1 py-0.5 rounded border border-red-500/40 mt-1">
            RIVAL : IA
          </span>
        </div>

        {/* Arma flotante en el centro (Katana) con luz de aura */}
        <div
          className="absolute z-10 flex flex-col items-center pointer-events-none animate-bounce"
          style={{ right: '35%', bottom: '48%' }}
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-500/20 border border-yellow-400/50 shadow-[0_0_14px_rgba(250,204,21,0.5)]">
            <img
              src="/assets/weapons/Katana.png"
              alt="Katana Spawn"
              className="w-8 h-8 object-contain filter drop-shadow-[0_0_6px_#facc15]"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CAPA 3: ATMÓSFERA Y GRADIENTE DE OSCURECIMIENTO
          Oscurece la mitad izquierda para que el texto resalte nítido y legible
          ───────────────────────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 -z-5"
        style={{
          background:
            'linear-gradient(to right, rgba(5, 5, 12, 0.94) 0%, rgba(5, 5, 12, 0.88) 36%, rgba(5, 5, 12, 0.5) 65%, rgba(5, 5, 12, 0.2) 100%)',
        }}
      />
      {/* Scanlines CRT muy sutiles */}
      <div
        className="pointer-events-none absolute inset-0 -z-5 opacity-5"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.9) 0px, rgba(0,0,0,0.9) 1px, transparent 1px, transparent 3px)',
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          HEADER SUPERIOR DISCRETO (LOGO superN)
          ───────────────────────────────────────────────────────────── */}
      <header className="relative z-30 w-full px-6 pt-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playPickup();
              onBackToLanding();
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-black/80 border border-neutral-600 hover:border-white hover:text-yellow-300 transition text-[9px] cursor-pointer"
            title="Volver a la portada (ESC)"
          >
            <span>◄ ESC</span>
          </button>
          <div className="flex items-center gap-1.5 text-lg font-black tracking-[0.2em] text-white">
            <span>SUPER</span>
            <span className="text-red-500 drop-shadow-[0_0_8px_#ef4444]">N</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="p-1.5 bg-black/80 border border-neutral-600 hover:border-yellow-400 transition text-neutral-300 hover:text-white cursor-pointer"
            title={muted ? 'Activar sonido' : 'Silenciar'}
          >
            {muted ? (
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-green-400" />
            )}
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          MENÚ PRINCIPAL FLOTANTE (ESTILO DUCK GAME)
          Lista de texto puro a la izquierda sin recuadros ni cajas pesadas
          ───────────────────────────────────────────────────────────── */}
      <main className="relative z-30 flex-1 flex items-center px-6 sm:px-12 md:px-16 lg:px-20 min-h-0">
        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-16 w-full max-w-4xl">
          {/* ── COLUMNA IZQUIERDA: MENÚ PRIMARIO (SIN CAJAS) ── */}
          <div className="flex flex-col items-start gap-4 sm:gap-6">
            {primaryOptions.map((opt, idx) => {
              const isSelected = activePrimaryIdx === idx;
              const isFocusedCol = !isSubMenuFocused && isSelected;

              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    sounds.playPickup();
                    setActivePrimaryIdx(idx);
                    setActiveSubIdx(0);
                    if (opt.id === 'solo') startSolo();
                    else if (opt.id === 'versus') startVersus();
                    else if (opt.id === 'tutorial') setActiveModal('tutorial');
                    else if (opt.id === 'config') setIsSubMenuFocused(true);
                  }}
                  onMouseEnter={() => {
                    if (activePrimaryIdx !== idx) {
                      sounds.playPickup();
                      setActivePrimaryIdx(idx);
                      setActiveSubIdx(0);
                    }
                  }}
                  className="group flex items-center gap-2 sm:gap-3 cursor-pointer transition-all duration-100 outline-none"
                >
                  {/* Flecha indicadora de selección pixelada */}
                  <span
                    className={`text-base sm:text-lg md:text-xl transition-transform duration-100 ${
                      isSelected
                        ? 'text-yellow-400 translate-x-1 drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]'
                        : 'text-transparent'
                    }`}
                  >
                    ►
                  </span>

                  {/* Título de la opción sin recuadros ni cajas */}
                  <span
                    className={`text-base sm:text-xl md:text-2xl font-pixel font-bold tracking-[0.2em] uppercase transition-colors duration-100 ${
                      isSelected
                        ? 'text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.7)]'
                        : 'text-neutral-400 group-hover:text-white'
                    }`}
                    style={{
                      textShadow: isSelected
                        ? '0 0 10px rgba(250, 204, 21, 0.8), 2px 2px 0px #000'
                        : '1px 1px 0px #000',
                    }}
                  >
                    {opt.title}
                  </span>

                  {/* Badge sutil opcional */}
                  {opt.badge && (
                    <span
                      className={`text-[8px] sm:text-[9px] px-1.5 py-0.5 tracking-widest font-mono-code transition-colors ${
                        isSelected
                          ? 'text-yellow-400 border border-yellow-500/50 bg-yellow-950/40'
                          : 'text-neutral-500 border border-neutral-700 bg-neutral-950/50'
                      }`}
                    >
                      {opt.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── COLUMNA DERECHA: SUB-OPCIONES FLOTANTES (CONTEXTUALES) ── */}
          {currentPrimary && currentPrimary.subOptions && currentPrimary.subOptions.length > 0 && (
            <div className="flex flex-col items-start gap-3 sm:gap-4 pl-0 md:pl-8 md:border-l md:border-white/10 animate-landing-enter">
              <div className="text-[9px] sm:text-[10px] text-neutral-400 tracking-[0.25em] font-pixel uppercase pb-1 flex items-center gap-1.5">
                <span>SUB-MODO</span>
                <ChevronRight className="w-3 h-3 text-yellow-400" />
              </div>

              {currentPrimary.subOptions.map((sub, sIdx) => {
                const isSubActive = activeSubIdx === sIdx;
                const isSelectedAndSubFocused = isSubMenuFocused && isSubActive;

                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      sounds.playPickup();
                      setActiveSubIdx(sIdx);
                      sub.action();
                    }}
                    onMouseEnter={() => {
                      if (activeSubIdx !== sIdx) {
                        sounds.playPickup();
                        setActiveSubIdx(sIdx);
                      }
                    }}
                    className={`group flex items-center gap-2 cursor-pointer transition-all duration-100 outline-none text-left py-1 ${
                      isSelectedAndSubFocused ? 'translate-x-1' : ''
                    }`}
                  >
                    <span
                      className={`text-sm transition-transform ${
                        isSubActive
                          ? 'text-yellow-400 drop-shadow-[0_0_6px_#facc15]'
                          : 'text-transparent'
                      }`}
                    >
                      ►
                    </span>

                    <span
                      className={`text-xs sm:text-sm font-pixel tracking-[0.18em] uppercase transition-colors ${
                        isSubActive
                          ? 'text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]'
                          : 'text-neutral-400 group-hover:text-neutral-200'
                      }`}
                      style={{
                        textShadow: isSubActive ? '1px 1px 0px #000' : 'none',
                      }}
                    >
                      {sub.title}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          BARRA INFERIOR DE NAVEGACIÓN Y CRÉDITOS (ESTILO DUCK GAME)
          ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-30 w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 bg-black/60 backdrop-blur-sm shrink-0">
        {/* Esquina Inferior Izquierda: Créditos sutiles */}
        <div className="text-[9px] text-neutral-500 font-pixel tracking-wider">
          superN v0.1 • DESIGN, CODE & SFX • RETRO NOIR
        </div>

        {/* Parte Inferior Derecha: 3 Indicadores visuales pixelados */}
        <div className="flex items-center gap-3 sm:gap-5 text-[9px] font-pixel tracking-wider">
          {/* NAVEGAR */}
          <div className="flex items-center gap-1.5">
            <span className="border border-yellow-400 bg-black text-yellow-300 px-1.5 py-0.5 font-bold shadow-[0_0_4px_rgba(250,204,21,0.4)]">
              FLECHAS
            </span>
            <span className="text-neutral-400 uppercase">NAVEGAR</span>
          </div>

          {/* ACEPTAR */}
          <div className="flex items-center gap-1.5">
            <span className="border border-yellow-400 bg-black text-yellow-300 px-1.5 py-0.5 font-bold shadow-[0_0_4px_rgba(250,204,21,0.4)]">
              ESPACIO
            </span>
            <span className="text-neutral-400 uppercase">ACEPTAR</span>
          </div>

          {/* VOLVER */}
          <div className="flex items-center gap-1.5">
            <span className="border border-yellow-400 bg-black text-yellow-300 px-1.5 py-0.5 font-bold shadow-[0_0_4px_rgba(250,204,21,0.4)]">
              ESC
            </span>
            <span className="text-neutral-400 uppercase">VOLVER</span>
          </div>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────
          MODAL RETRO: TUTORIAL Y CONTROLES
          ───────────────────────────────────────────────────────────── */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-landing-enter">
          <div className="relative w-full max-w-lg bg-neutral-950 border-2 border-white p-5 shadow-[0_0_30px_rgba(0,0,0,0.9)] font-pixel text-left">
            {/* Cabecera del modal */}
            <div className="flex items-center justify-between border-b-2 border-white/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">►</span>
                <span className="text-xs sm:text-sm font-black tracking-widest text-white uppercase">
                  {activeModal === 'tutorial' ? 'TUTORIAL Y GUÍA DE COMBATE' : 'CONFIGURACIÓN Y TECLAS'}
                </span>
              </div>
              <button
                onClick={() => {
                  sounds.playPickup();
                  setActiveModal(null);
                }}
                className="text-neutral-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido según modal */}
            {activeModal === 'tutorial' ? (
              <div className="space-y-4 text-[9px] sm:text-[10px] text-neutral-300 leading-relaxed font-mono-code uppercase">
                <div>
                  <strong className="text-cyan-400 font-pixel block mb-1">
                    1. MOVIMIENTO BÁSICO:
                  </strong>
                  <span>WASD o FLECHAS para moverte y saltar. Shift o Q para correr.</span>
                </div>

                <div>
                  <strong className="text-yellow-300 font-pixel block mb-1">
                    2. RODAR TÁCTICO (INVULNERABLE):
                  </strong>
                  <span className="text-neutral-200">{CONTROLS_TEXT.ROLL_HINT}</span>
                </div>

                <div>
                  <strong className="text-red-400 font-pixel block mb-1">
                    3. ACCIONES DE COMBATE:
                  </strong>
                  <span>N = Melee (Golpe cuerpo a cuerpo) · M = Disparo · Coma (,) = Granada</span>
                </div>

                <div>
                  <strong className="text-emerald-400 font-pixel block mb-1">
                    4. ARMAS Y SUMINISTROS:
                  </strong>
                  <span>Pasa sobre un arma para recogerla. Teclas 1, 2, 3, 4 para cambiar de ranura.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-[9px] sm:text-[10px] text-neutral-300 font-mono-code uppercase">
                <div className="border border-white/20 p-2.5 bg-black">
                  <strong className="text-cyan-400 font-pixel block mb-1">1 JUGADOR:</strong>
                  <span>{CONTROLS_TEXT.SOLO_FULL}</span>
                </div>

                <div className="border border-white/20 p-2.5 bg-black">
                  <strong className="text-amber-400 font-pixel block mb-1">2 JUGADORES (J1):</strong>
                  <span>{CONTROLS_TEXT.P1_1V1_FULL}</span>
                </div>

                <div className="border border-white/20 p-2.5 bg-black">
                  <strong className="text-emerald-400 font-pixel block mb-1">2 JUGADORES (J2):</strong>
                  <span>{CONTROLS_TEXT.P2_1V1_FULL}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span>EFECTOS DE SONIDO (SFX):</span>
                  <button
                    onClick={toggleSound}
                    className="px-2 py-1 bg-neutral-900 border border-white text-yellow-300 cursor-pointer"
                  >
                    {muted ? 'MUTED [ OFF ]' : 'ACTIVE [ ON ]'}
                  </button>
                </div>
              </div>
            )}

            {/* Pie del modal */}
            <div className="mt-5 pt-3 border-t border-white/20 flex justify-end">
              <button
                onClick={() => {
                  sounds.playPickup();
                  setActiveModal(null);
                }}
                className="px-4 py-1.5 bg-black border border-white text-yellow-300 hover:bg-white hover:text-black transition text-[9px] cursor-pointer"
              >
                [ SPACE / ESC ] CERRAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeSelectScreen;
