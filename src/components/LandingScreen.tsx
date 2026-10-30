// ==============================================================================
// LandingScreen.tsx — Pantalla de Título Principal Urban Noir / Survival
// Juego: "Super N"
//
// Estructura modular en 4 capas:
//   Capa 1: Fondo (Gradiente Radial Carmesí/Azulado + Parallax Ciudad 3 Capas)
//   Capa 2: Efectos Ambientales (CRT Scanlines 6% + Vignette Noir + Niebla)
//   Capa 3: Protagonistas (Footer Showcase: Ninja, GymRat, Santa Clo con Rim Light)
//   Capa 4: UI Central (Logo Neón con Parpadeo Roto, Lema y Botón Play Pixel Art)
// ==============================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { sounds } from '../game/SoundEffects';

interface LandingScreenProps {
  onEnter: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onEnter }) => {
  const [isSelected, setIsSelected] = useState<boolean>(true);
  const [isFlickering, setIsFlickering] = useState<boolean>(false);
  const [activeHero, setActiveHero] = useState<number | null>(null);

  // Acción de entrada principal
  const handleEnter = useCallback(() => {
    sounds.resumeAudio();
    sounds.playPickup();
    onEnter();
  }, [onEnter]);

  // Parpadeo intermitente aleatorio del letrero de neón (cada 5 a 10 segundos)
  useEffect(() => {
    let timeoutId: any;
    const triggerRandomFlicker = () => {
      // Intervalo aleatorio entre 5000ms y 10000ms
      const randomDelay = Math.floor(Math.random() * 5000) + 5000;
      timeoutId = setTimeout(() => {
        setIsFlickering(true);
        // Duración de la secuencia de parpadeo de tubo roto
        setTimeout(() => {
          setIsFlickering(false);
          triggerRandomFlicker();
        }, 650);
      }, randomDelay);
    };

    triggerRandomFlicker();
    return () => clearTimeout(timeoutId);
  }, []);

  // Navegación accesible completa con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEnter();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        sounds.playPickup();
        setIsSelected(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleEnter]);

  // Lista de protagonistas urbanos con sus sprites pixel art oficiales
  const protagonists = useMemo(
    () => [
      {
        id: 'ninja',
        name: 'NINJA',
        title: 'SHINOBI URBANO',
        accentColor: '#38bdf8',
        tag: 'SIGILO / HOJA',
        spriteUrl: '/assets/sprites/player/ninja.png',
      },
      {
        id: 'gymrat',
        name: 'GYMRAT',
        title: 'BRAWLER BRUTAL',
        accentColor: '#f97316',
        tag: 'FUERZA BRUTA',
        spriteUrl: '/assets/sprites/player/gymrat.png',
      },
      {
        id: 'santaclo',
        name: 'SANTA CLO',
        title: 'VETERANO NOIR',
        accentColor: '#ef4444',
        tag: 'SUPERVIVIENTE',
        spriteUrl: '/assets/sprites/player/santaclo.png',
      },
    ],
    []
  );

  return (
    <div
      className="relative w-full h-full min-h-screen flex flex-col items-center justify-between font-pixel select-none overflow-hidden"
      style={{
        // ─────────────────────────────────────────────────────────────
        // CAPA 1: FONDO — Gradiente radial carmesí profundo a negro azulado
        // Centro: #1A0505 (carmesí desaturado) difuminándose a #050510
        // ─────────────────────────────────────────────────────────────
        background: 'radial-gradient(ellipse at 50% 40%, #1A0505 0%, #120409 38%, #090614 72%, #050510 100%)',
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          CAPA 2: EFECTOS AMBIENTALES RETRO (SCANLINES CRT + VIGNETTE NOIR)
          Textura sutil de líneas horizontales al 7% de opacidad
          ───────────────────────────────────────────────────────────── */}
      {/* Scanlines CRT horizontales */}
      <div
        className="pointer-events-none absolute inset-0 z-30 opacity-[0.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0px, rgba(0, 0, 0, 0.9) 1px, transparent 1px, transparent 3px)',
          backgroundSize: '100% 3px',
        }}
      />

      {/* Viñeta oscura periférica estilo monitor arcade arcade */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 40%, rgba(5, 5, 16, 0.5) 75%, rgba(0, 0, 0, 0.9) 100%)',
        }}
      />

      {/* Bruma / Niebla carmesí ambiental tenue en el horizonte */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-96 z-10 opacity-30"
        style={{
          background: 'linear-gradient(to top, rgba(220, 38, 38, 0.15) 0%, rgba(20, 5, 10, 0.05) 50%, transparent 100%)',
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          CAPA 1.2: PARALLAX ESTÁTICO DE CIUDAD (SVG VECTORIAL CRISP)
          3 Capas de siluetas urbanas con ventanas, antenas y grúas portuarias
          ───────────────────────────────────────────────────────────── */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[48vh] min-h-[280px] max-h-[460px] pointer-events-none z-10"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
        style={{ shapeRendering: 'crispEdges' }}
      >
        <defs>
          {/* Gradiente vertical para rascacielos lejanos */}
          <linearGradient id="skylineFarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0e0a18" />
            <stop offset="100%" stopColor="#06050e" />
          </linearGradient>

          {/* Gradiente para capa media de almacenes e industrias */}
          <linearGradient id="skylineMidGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14070c" />
            <stop offset="100%" stopColor="#080408" />
          </linearGradient>

          {/* Gradiente para grúas portuarias y estructuras de azotea cercanas */}
          <linearGradient id="skylineNearGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1c0a0f" />
            <stop offset="100%" stopColor="#060204" />
          </linearGradient>
        </defs>

        {/* ── CAPA LEJANA: Rascacielos oscuros con ventanas encendidas ── */}
        <g fill="url(#skylineFarGrad)">
          {/* Bloque rascacielos 1 */}
          <rect x="0" y="90" width="75" height="310" />
          <rect x="65" y="140" width="60" height="260" />
          {/* Antena alta izquierda con luz de baliza */}
          <line x1="38" y1="30" x2="38" y2="90" stroke="#1f182f" strokeWidth="2" />
          <circle cx="38" cy="30" r="3" fill="#ef4444" className="animate-beacon" />

          {/* Rascacielos 2 (Torre monolítica) */}
          <rect x="150" y="60" width="95" height="340" />
          <polygon points="150,60 197,35 245,60" fill="#171128" />
          <line x1="197" y1="15" x2="197" y2="35" stroke="#251c3d" strokeWidth="2" />
          <circle cx="197" cy="15" r="3" fill="#ef4444" className="animate-beacon" />

          {/* Bloque edificios centro-izq */}
          <rect x="270" y="120" width="80" height="280" />
          <rect x="365" y="80" width="110" height="320" />
          <rect x="410" y="55" width="20" height="25" />

          {/* Gran torre central silueteada detrás del logo */}
          <rect x="520" y="40" width="160" height="360" />
          <rect x="560" y="20" width="80" height="20" />
          <line x1="600" y1="0" x2="600" y2="20" stroke="#2a1f45" strokeWidth="2" />
          <circle cx="600" cy="2" r="3.5" fill="#ef4444" className="animate-beacon" />

          {/* Bloques de la derecha */}
          <rect x="720" y="110" width="90" height="290" />
          <rect x="830" y="75" width="105" height="325" />
          <rect x="955" y="130" width="85" height="270" />
          <rect x="1055" y="50" width="145" height="350" />
          <line x1="1120" y1="20" x2="1120" y2="50" stroke="#1f182f" strokeWidth="2" />
          <circle cx="1120" cy="20" r="3" fill="#ef4444" className="animate-beacon" />
        </g>

        {/* Ventanas iluminadas en amarillo/ámbar tenue en los rascacielos */}
        <g fill="#f59e0b">
          {/* Ventanas Torre Izquierda */}
          <rect x="14" y="110" width="4" height="6" opacity="0.6" />
          <rect x="24" y="110" width="4" height="6" opacity="0.4" />
          <rect x="44" y="130" width="4" height="6" opacity="0.7" className="animate-window-flicker" />
          <rect x="14" y="160" width="4" height="6" opacity="0.5" />
          <rect x="34" y="180" width="4" height="6" opacity="0.6" />

          {/* Ventanas Torre Monolítica 2 */}
          <rect x="165" y="90" width="5" height="8" opacity="0.75" />
          <rect x="180" y="90" width="5" height="8" opacity="0.3" />
          <rect x="210" y="120" width="5" height="8" opacity="0.65" />
          <rect x="165" y="150" width="5" height="8" opacity="0.8" className="animate-window-flicker" />
          <rect x="195" y="170" width="5" height="8" opacity="0.5" />
          <rect x="220" y="200" width="5" height="8" opacity="0.7" />

          {/* Ventanas Edificios Centro */}
          <rect x="380" y="110" width="6" height="6" opacity="0.5" />
          <rect x="400" y="110" width="6" height="6" opacity="0.8" />
          <rect x="430" y="130" width="6" height="6" opacity="0.4" />
          <rect x="390" y="160" width="6" height="6" opacity="0.7" />
          <rect x="440" y="180" width="6" height="6" opacity="0.6" />

          {/* Ventanas Torre Central */}
          <rect x="540" y="80" width="6" height="8" opacity="0.4" />
          <rect x="580" y="80" width="6" height="8" opacity="0.7" />
          <rect x="620" y="80" width="6" height="8" opacity="0.6" />
          <rect x="560" y="120" width="6" height="8" opacity="0.75" className="animate-window-flicker" />
          <rect x="640" y="130" width="6" height="8" opacity="0.5" />

          {/* Ventanas Edificios Derecha */}
          <rect x="740" y="140" width="5" height="7" opacity="0.6" />
          <rect x="770" y="170" width="5" height="7" opacity="0.8" />
          <rect x="850" y="100" width="6" height="8" opacity="0.7" />
          <rect x="880" y="130" width="6" height="8" opacity="0.5" />
          <rect x="910" y="160" width="6" height="8" opacity="0.75" className="animate-window-flicker" />
          <rect x="1075" y="90" width="5" height="8" opacity="0.6" />
          <rect x="1105" y="120" width="5" height="8" opacity="0.7" />
          <rect x="1135" y="140" width="5" height="8" opacity="0.45" />
        </g>

        {/* ── CAPA MEDIA: Fábricas, almacenes con techos a dos aguas y tanques de agua ── */}
        <g fill="url(#skylineMidGrad)">
          {/* Tanque de agua industrial sobre patas de acero */}
          <rect x="85" y="210" width="40" height="28" rx="2" />
          <polygon points="85,210 105,198 125,210" />
          <line x1="90" y1="238" x2="90" y2="260" stroke="#0e0408" strokeWidth="3" />
          <line x1="120" y1="238" x2="120" y2="260" stroke="#0e0408" strokeWidth="3" />
          <line x1="90" y1="248" x2="120" y2="248" stroke="#0e0408" strokeWidth="2" />

          {/* Almacén techo de sierra (sawtooth roof) */}
          <polygon points="230,280 255,245 255,280 280,245 280,280 305,245 305,280 305,370 230,370" />

          {/* Fábrica con chimenea de humo */}
          <rect x="470" y="230" width="90" height="170" />
          <rect x="480" y="180" width="16" height="50" />
          <rect x="477" y="176" width="22" height="4" fill="#25090f" />

          {/* Silueta antena parabólica / radar en azotea */}
          <path d="M 700 240 Q 720 220 740 240 Z" fill="#14070c" />
          <line x1="720" y1="230" x2="720" y2="255" stroke="#14070c" strokeWidth="3" />

          {/* Almacén portuario con puertas de carga */}
          <rect x="780" y="220" width="120" height="180" />
          <polygon points="780,220 840,195 900,220" />
          <rect x="980" y="240" width="85" height="160" />
        </g>

        {/* ── CAPA CERCANA: PUERTO MALDITO & AZOTEA (Grúas industriales, tuberías y vigas) ── */}
        <g fill="url(#skylineNearGrad)" stroke="#1c0a0f">
          {/* Grúa de pórtico portuaria (Puerto Maldito) - Lado Izquierdo */}
          <g strokeWidth="3">
            {/* Torre principal de la grúa */}
            <line x1="30" y1="360" x2="70" y2="160" />
            <line x1="110" y1="360" x2="70" y2="160" />
            {/* Riostras transversales (armaduras en celosía) */}
            <line x1="42" y1="300" x2="98" y2="300" strokeWidth="2" />
            <line x1="52" y1="240" x2="88" y2="240" strokeWidth="2" />
            <line x1="60" y1="195" x2="80" y2="195" strokeWidth="2" />
            <line x1="42" y1="300" x2="88" y2="240" strokeWidth="1.5" />
            <line x1="98" y1="300" x2="52" y2="240" strokeWidth="1.5" />
            {/* Pluma horizontal superior de carga */}
            <line x1="20" y1="160" x2="165" y2="160" strokeWidth="4" />
            <line x1="70" y1="130" x2="70" y2="160" strokeWidth="3" />
            <line x1="70" y1="130" x2="165" y2="160" strokeWidth="2" />
            <line x1="70" y1="130" x2="20" y2="160" strokeWidth="2" />
            {/* Cabina del operador y cable de izaje con gancho */}
            <rect x="80" y="162" width="16" height="14" fill="#2d0b13" stroke="none" />
            <line x1="140" y1="160" x2="140" y2="230" stroke="#fca5a5" strokeWidth="1.5" strokeDasharray="3 3" />
            <rect x="135" y="230" width="10" height="12" fill="#ef4444" stroke="none" />
          </g>

          {/* Grúa de construcción derecha en Azotea */}
          <g strokeWidth="2.5">
            <line x1="1060" y1="360" x2="1080" y2="150" />
            <line x1="1100" y1="360" x2="1080" y2="150" />
            <line x1="1068" y1="280" x2="1092" y2="280" strokeWidth="1.5" />
            <line x1="1074" y1="210" x2="1086" y2="210" strokeWidth="1.5" />
            {/* Brazo horizontal */}
            <line x1="1020" y1="150" x2="1170" y2="150" strokeWidth="3.5" />
            <line x1="1080" y1="125" x2="1080" y2="150" strokeWidth="3" />
            <line x1="1080" y1="125" x2="1170" y2="150" strokeWidth="1.5" />
            <line x1="1080" y1="125" x2="1020" y2="150" strokeWidth="1.5" />
            <line x1="1140" y1="150" x2="1140" y2="220" stroke="#fca5a5" strokeWidth="1.5" strokeDasharray="3 3" />
            <polygon points="1136,220 1144,220 1140,230" fill="#f59e0b" stroke="none" />
          </g>

          {/* Tuberías industriales de presión y conductos de vapor */}
          <path
            d="M 280 390 L 280 340 L 340 340 L 340 310 L 400 310 L 400 390"
            fill="none"
            stroke="#2d0b13"
            strokeWidth="7"
          />
          <circle cx="340" cy="325" r="5" fill="#ef4444" stroke="none" />
          <path
            d="M 870 390 L 870 330 L 920 330 L 920 390"
            fill="none"
            stroke="#2d0b13"
            strokeWidth="6"
          />

          {/* Barandilla y cornisa del mirador/muelle donde se paran los héroes */}
          <rect x="0" y="375" width="1200" height="25" fill="#0c0407" stroke="none" />
          <line x1="0" y1="375" x2="1200" y2="375" stroke="#3b0f19" strokeWidth="3" />
        </g>
      </svg>

      {/* ─────────────────────────────────────────────────────────────
          HEADER SUPERIOR DISCRETO (ESTADO RETRO ARCADE)
          ───────────────────────────────────────────────────────────── */}
      <header className="relative z-30 w-full max-w-5xl px-6 pt-5 flex items-center justify-between text-[10px] tracking-widest text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_#ef4444]" />
          <span className="text-neutral-300">SISTEMA ACTIVO</span>
          <span className="text-neutral-600">|</span>
          <span className="text-neutral-400 hidden sm:inline">SUPERFIGHTERS PROTOCOL</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-amber-500/80 bg-amber-950/40 border border-amber-600/30 px-2 py-0.5 rounded text-[9px]">
            BUILD v1.0.4-NOIR
          </span>
          <span className="text-neutral-500 hidden sm:inline">60 FPS</span>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          CAPA 4: UI CENTRAL — LOGO CON PARPADEO NEÓN Y BOTÓN PIXEL ART
          ───────────────────────────────────────────────────────────── */}
      <main className="relative z-30 flex flex-col items-center justify-center text-center px-4 max-w-2xl w-full my-auto">
        {/* Contenedor del Logo con animación de parpadeo neón intermitente */}
        <div
          className={`flex flex-col items-center justify-center select-none w-full max-w-xl transition-all duration-75 ${
            isFlickering ? 'animate-neon-flicker' : ''
          }`}
        >
          {/* Barra superior de neón con cortes tácticos */}
          <div className="w-full flex items-center justify-between gap-1 mb-2">
            <div className="h-1.5 sm:h-2 bg-gradient-to-r from-red-800 to-white flex-1 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
            <div className="h-1.5 sm:h-2 w-3 sm:w-4 bg-[#050510]" />
            <div className="h-1.5 sm:h-2 w-12 sm:w-16 bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]" />
            <div className="h-1.5 sm:h-2 w-2 sm:w-3 bg-[#050510]" />
            <div className="h-1.5 sm:h-2 flex-1 bg-gradient-to-l from-red-800 to-white shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          </div>

          {/* Caja Central del Letrero: "SUPER" y la "N" Roja con Sangre */}
          <div
            className="relative w-full py-4 sm:py-6 px-4 sm:px-10 border-y-4 border-red-600/80 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.35),inset_0_0_20px_rgba(220,38,38,0.2)]"
            style={{
              borderColor: isFlickering ? '#991b1b' : '#ef4444',
            }}
          >
            {/* Tornillos esquineros industriales */}
            <div className="absolute top-1.5 left-2 w-1.5 h-1.5 bg-neutral-400 rounded-full shadow-[0_0_2px_#fff]" />
            <div className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-neutral-400 rounded-full shadow-[0_0_2px_#fff]" />
            <div className="absolute bottom-1.5 left-2 w-1.5 h-1.5 bg-neutral-400 rounded-full shadow-[0_0_2px_#fff]" />
            <div className="absolute bottom-1.5 right-2 w-1.5 h-1.5 bg-neutral-400 rounded-full shadow-[0_0_2px_#fff]" />

            <div className="flex flex-row items-center justify-center gap-3 sm:gap-6">
              {/* "SUPER" — Fuente pixelada con resplandor nítido y sombra paralela */}
              <span
                className="text-2xl sm:text-3xl md:text-4xl font-pixel font-bold tracking-[0.25em] text-white uppercase"
                style={{
                  textShadow:
                    '0 0 14px rgba(255, 255, 255, 0.75), 0 0 24px rgba(239, 68, 68, 0.5), 3px 3px 0px #000000',
                }}
              >
                SUPER
              </span>

              {/* "N" — Icono central sangriento con gradientes y goteo dinámico */}
              <div className="relative flex items-center justify-center">
                <svg
                  className="w-20 h-24 sm:w-28 sm:h-32 md:w-32 md:h-36 overflow-visible filter drop-shadow-[0_4px_16px_rgba(239,68,68,0.7)]"
                  viewBox="0 0 100 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ shapeRendering: 'crispEdges' }}
                >
                  <defs>
                    <linearGradient id="bloodGradientTitle" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="45%" stopColor="#dc2626" />
                      <stop offset="85%" stopColor="#991b1b" />
                      <stop offset="100%" stopColor="#580808" />
                    </linearGradient>
                    <linearGradient id="bloodHighlightTitle" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.15" />
                    </linearGradient>
                  </defs>

                  {/* Sombra de fondo profunda */}
                  <path
                    d="M 12 16 L 36 16 L 36 60 L 68 16 L 92 16 L 92 100 L 70 100 L 70 54 L 38 100 L 12 100 Z"
                    fill="#2a0404"
                    transform="translate(3, 4)"
                  />

                  {/* Cuerpo principal de la letra N */}
                  <path
                    d="M 12 12 L 36 12 L 36 56 L 68 12 L 92 12 L 92 94 L 70 94 L 70 50 L 38 94 L 12 94 Z"
                    fill="url(#bloodGradientTitle)"
                    stroke="#1a0202"
                    strokeWidth="2.5"
                  />

                  {/* Brillo especular superior */}
                  <rect x="14" y="14" width="20" height="4" fill="url(#bloodHighlightTitle)" />
                  <rect x="70" y="14" width="20" height="4" fill="url(#bloodHighlightTitle)" />
                  <line x1="38" y1="56" x2="68" y2="14" stroke="#fca5a5" strokeWidth="2" strokeOpacity="0.75" />

                  {/* Texturas internas de sangre coagulada */}
                  <rect x="18" y="24" width="4" height="12" fill="#fca5a5" opacity="0.6" />
                  <rect x="26" y="70" width="6" height="14" fill="#580808" />
                  <rect x="76" y="28" width="4" height="20" fill="#fca5a5" opacity="0.5" />
                  <rect x="78" y="66" width="6" height="16" fill="#580808" />
                  <rect x="48" y="52" width="6" height="10" fill="#7f1d1d" />

                  {/* Gotas y chorros de sangre cayendo */}
                  <path d="M 14 94 L 14 104 L 18 108 L 22 104 L 22 94 Z" fill="#991b1b" />
                  <path d="M 16 94 L 16 103 L 18 106 L 20 103 L 20 94 Z" fill="#dc2626" />
                  <circle cx="18" cy="114" r="3" fill="#dc2626" />
                  <rect x="17" y="112" width="2" height="2" fill="#fca5a5" />
                  <circle cx="18" cy="122" r="1.5" fill="#991b1b" />

                  <path d="M 36 94 L 38 102 L 42 106 L 46 102 L 44 94 Z" fill="#991b1b" />
                  <path d="M 38 94 L 39 101 L 42 104 L 44 101 L 43 94 Z" fill="#dc2626" />
                  <circle cx="42" cy="111" r="2" fill="#dc2626" />

                  <path d="M 80 94 L 80 108 L 84 114 L 88 108 L 88 94 Z" fill="#991b1b" />
                  <path d="M 82 94 L 82 107 L 84 112 L 86 107 L 86 94 Z" fill="#dc2626" />
                  <circle cx="84" cy="120" r="3.5" fill="#dc2626" />
                  <rect x="83" y="118" width="2" height="2" fill="#fca5a5" />
                  <circle cx="84" cy="129" r="1.8" fill="#7f1d1d" />

                  <circle cx="94" cy="80" r="1.5" fill="#dc2626" />
                  <circle cx="97" cy="86" r="2.2" fill="#991b1b" />
                  <circle cx="8" cy="74" r="1.5" fill="#dc2626" />
                  <circle cx="6" cy="84" r="2" fill="#991b1b" />
                </svg>
              </div>
            </div>
          </div>

          {/* Barra inferior del letrero */}
          <div className="w-full flex items-center justify-between gap-1 mt-2">
            <div className="h-1.5 sm:h-2 w-16 sm:w-20 bg-gradient-to-r from-red-800 to-white shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
            <div className="h-1.5 sm:h-2 w-2 sm:w-3 bg-[#050510]" />
            <div className="h-1.5 sm:h-2 flex-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]" />
            <div className="h-1.5 sm:h-2 w-4 sm:w-6 bg-[#050510]" />
            <div className="h-1.5 sm:h-2 w-24 sm:w-32 bg-gradient-to-l from-red-800 to-white shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          </div>

          {/* Lema Oficial con resplandor neón carmesí */}
          <div className="mt-4 flex flex-col items-center">
            <p
              className="text-[10px] sm:text-[11px] md:text-xs tracking-[0.3em] font-pixel font-bold uppercase text-red-500"
              style={{
                textShadow:
                  '0 0 12px rgba(239, 68, 68, 0.9), 0 0 24px rgba(185, 28, 28, 0.6), 2px 2px 0px #1a0505',
              }}
            >
              LUCHA, ESQUIVA, SOBREVIVE
            </p>
          </div>
        </div>

        {/* ── BOTÓN PLAY CON DISEÑO UI PIXEL ART Y MARCO DEFINIDO ── */}
        <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3">
          <button
            onClick={handleEnter}
            onMouseEnter={() => {
              if (!isSelected) {
                sounds.playPickup();
                setIsSelected(true);
              }
            }}
            className={`group relative flex items-center justify-center gap-3 sm:gap-4 py-3 px-8 sm:px-12 font-pixel tracking-widest cursor-pointer transition-all duration-150 outline-none select-none ${
              isSelected
                ? 'bg-red-950/70 border-2 border-yellow-400 shadow-[0_0_24px_rgba(250,204,21,0.55),inset_0_0_14px_rgba(250,204,21,0.25)] scale-105'
                : 'bg-black/60 border-2 border-neutral-700/80 shadow-[0_0_10px_rgba(0,0,0,0.8)] hover:border-yellow-500/60'
            }`}
            style={{
              clipPath:
                'polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))',
            }}
          >
            {/* Bisel superior interno retro */}
            <div className="absolute top-0 left-2 right-2 h-[2px] bg-white/20 pointer-events-none" />

            {/* Triángulo izquierdo con desplazamiento pulsante */}
            <span
              className={`text-sm sm:text-base transition-all duration-150 ${
                isSelected
                  ? 'text-yellow-400 animate-nudge-left drop-shadow-[0_0_8px_#facc15]'
                  : 'text-amber-200/50'
              }`}
            >
              ▶
            </span>

            {/* Texto "PLAY" con estados normal (amarillo pálido) y hover (amarillo brillante) */}
            <span
              className={`text-sm sm:text-base md:text-lg font-bold tracking-[0.3em] uppercase transition-colors duration-150 ${
                isSelected
                  ? 'text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.85)]'
                  : 'text-amber-100/90'
              }`}
              style={{
                textShadow: isSelected
                  ? '0 0 10px rgba(250, 204, 21, 0.9), 2px 2px 0px #000'
                  : '1px 1px 0px #000',
              }}
            >
              PLAY
            </span>

            {/* Triángulo derecho con desplazamiento pulsante hacia la derecha */}
            <span
              className={`text-sm sm:text-base transition-all duration-150 ${
                isSelected
                  ? 'text-yellow-400 animate-nudge-right drop-shadow-[0_0_8px_#facc15]'
                  : 'text-amber-200/50'
              }`}
            >
              ◀
            </span>
          </button>

          {/* Texto inferior inmersivo solicitado: "[ENTER] PARA ENTRAR A LA CIUDAD" */}
          <button
            onClick={handleEnter}
            className="group flex items-center gap-1.5 text-[9px] sm:text-[10px] tracking-[0.2em] text-neutral-400 hover:text-yellow-400 font-pixel transition-colors cursor-pointer mt-1"
          >
            <span className="text-red-500 group-hover:text-yellow-400 font-bold">[ENTER]</span>
            <span className="group-hover:underline decoration-yellow-400/50">PARA ENTRAR A LA CIUDAD</span>
          </button>
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          CAPA 3: FOOTER — PROTAGONISTAS (NINJA, GYMRAT, SANTA CLO)
          Colocados sobre la cornisa urbana con sutil rim light rojo
          ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-30 w-full max-w-4xl px-4 pb-4 pt-1 flex flex-col items-center">
        {/* Encabezado discreto de protagonistas */}
        <div className="flex items-center gap-2 mb-2">
          <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-red-600/60" />
          <span className="text-[8px] sm:text-[9px] font-pixel tracking-[0.25em] text-red-500/80 uppercase">
            PROTAGONISTAS DE LA CIUDAD
          </span>
          <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-red-600/60" />
        </div>

        {/* Tarjetas / Siluetas de los 3 Héroes */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6 w-full max-w-xl">
          {protagonists.map((hero, idx) => {
            const isHovered = activeHero === idx;
            return (
              <div
                key={hero.id}
                onMouseEnter={() => {
                  setActiveHero(idx);
                  sounds.playPickup();
                }}
                onMouseLeave={() => setActiveHero(null)}
                className={`relative flex flex-col items-center p-2 rounded bg-neutral-950/70 border transition-all duration-200 group cursor-default ${
                  isHovered
                    ? 'border-red-500 shadow-[0_0_18px_rgba(239,68,68,0.5)] scale-105'
                    : 'border-red-950/50 hover:border-red-800/80'
                }`}
                style={{
                  clipPath:
                    'polygon(0 3px, 3px 0, calc(100% - 3px) 0, 100% 3px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 3px 100%, 0 calc(100% - 3px))',
                }}
              >
                {/* Contenedor del Avatar / Sprite Pixel Art Oficial con Rim Light Roja */}
                <div className="relative w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center overflow-hidden my-1">
                  {/* Halo / Resplandor de luz trasera (Rim Light Roja) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-red-600/35 via-red-900/10 to-transparent rounded-sm opacity-70 group-hover:opacity-100 transition-opacity" />

                  {/* Sprite Pixel Art oficial */}
                  <img
                    src={hero.spriteUrl}
                    alt={hero.name}
                    className="relative z-10 w-auto h-14 sm:h-18 object-contain filter drop-shadow-[0_0_8px_rgba(239,68,68,0.75)] group-hover:scale-115 group-hover:drop-shadow-[0_0_14px_rgba(239,68,68,1)] transition-all duration-200"
                    style={{
                      imageRendering: 'pixelated',
                    }}
                  />

                  {/* Rim light highlight inferior en el piso del héroe */}
                  <div className="absolute bottom-0 w-10 h-[2px] bg-red-500 shadow-[0_0_8px_#ef4444]" />
                </div>

                {/* Nombre del Héroe */}
                <span
                  className="text-[9px] sm:text-[10px] font-bold tracking-wider mt-1"
                  style={{
                    color: isHovered ? hero.accentColor : '#f1f5f9',
                  }}
                >
                  {hero.name}
                </span>

                {/* Subtítulo / Rol */}
                <span className="text-[7px] sm:text-[8px] text-neutral-500 tracking-tight text-center">
                  {hero.tag}
                </span>
              </div>
            );
          })}
        </div>

        {/* Atajo de controles inferior */}
        <div className="mt-3 text-[8px] tracking-widest text-neutral-600 font-pixel flex items-center gap-3">
          <span>[↑ / ↓] NAVEGAR</span>
          <span>•</span>
          <span>[CLICK / ENTER] ENTRAR</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingScreen;
