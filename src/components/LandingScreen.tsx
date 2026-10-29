// =============================================================
// LandingScreen.tsx — Pantalla de inicio Retro Arcade estilo Superfighters
// Fondo negro con elementos geométricos pixelados en cian/turquesa
// (tuberías, ladrillos, terminales), fichas amarillas de estado,
// logo en bloque sólido blanco y botón de texto pixelado "PLAY".
// =============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { sounds } from '../game/SoundEffects';

interface LandingScreenProps {
  onEnter: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onEnter }) => {
  const [isSelected, setIsSelected] = useState<boolean>(true);

  const handleEnter = useCallback(() => {
    sounds.resumeAudio();
    sounds.playPickup();
    onEnter();
  }, [onEnter]);

  // Navegación accesible con teclado
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

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-center bg-black text-white font-pixel select-none overflow-hidden">
      {/* ─────────────────────────────────────────────────────────
          ESCENARIO ESTÁTICO GEOMÉTRICO RETRO PIXEL ART (SVG)
          Idéntico a la referencia original de Superfighters
          ───────────────────────────────────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none -z-10"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
        style={{ shapeRendering: 'crispEdges' }}
      >
        {/* Fondo Negro Puro */}
        <rect width="800" height="600" fill="#000000" />

        {/* ── 1. PARED DE LADRILLOS (ESQUINA SUPERIOR IZQUIERDA) ── */}
        <g stroke="#00a89d" strokeWidth="4" fill="none">
          {/* Fila 1 */}
          <line x1="16" y1="56" x2="140" y2="56" />
          <line x1="16" y1="56" x2="16" y2="76" />
          <line x1="56" y1="56" x2="56" y2="76" />
          <line x1="104" y1="56" x2="104" y2="76" />
          <line x1="140" y1="56" x2="140" y2="76" />

          {/* Fila 2 */}
          <line x1="16" y1="76" x2="152" y2="76" />
          <line x1="32" y1="76" x2="32" y2="96" />
          <line x1="80" y1="76" x2="80" y2="96" />
          <line x1="128" y1="76" x2="128" y2="96" />

          {/* Fila 3 */}
          <line x1="16" y1="96" x2="140" y2="96" />
          <line x1="16" y1="96" x2="16" y2="116" />
          <line x1="56" y1="96" x2="56" y2="116" />
          <line x1="104" y1="96" x2="104" y2="116" />

          {/* Fila 4 */}
          <line x1="16" y1="116" x2="48" y2="116" />
          <line x1="48" y1="116" x2="48" y2="132" />
          <line x1="16" y1="132" x2="48" y2="132" />
        </g>

        {/* ── 2. SISTEMA DE TUBERÍAS Y ESTRUCTURAS DERECHAS ── */}
        {/* Tubería Vertical Principal 1 (la más alta que sube hasta arriba) */}
        {/* Cuerpo exterior */}
        <rect x="696" y="28" width="40" height="400" fill="#00776f" stroke="#000000" strokeWidth="4" />
        <line x1="702" y1="28" x2="702" y2="428" stroke="#00cfc0" strokeWidth="6" />
        {/* Codo superior */}
        <rect x="696" y="28" width="68" height="24" fill="#00776f" stroke="#000000" strokeWidth="4" />
        <line x1="696" y1="34" x2="764" y2="34" stroke="#00cfc0" strokeWidth="6" />
        <rect x="738" y="28" width="26" height="52" fill="#00776f" stroke="#000000" strokeWidth="4" />
        {/* Anillos de unión */}
        <rect x="694" y="68" width="44" height="8" fill="#00cfc0" />
        <rect x="694" y="228" width="44" height="8" fill="#00cfc0" />
        <rect x="694" y="388" width="44" height="8" fill="#00cfc0" />

        {/* Tubería Vertical Secundaria 2 (a la izquierda de la principal) */}
        <rect x="664" y="60" width="24" height="340" fill="#00776f" stroke="#000000" strokeWidth="4" />
        <line x1="668" y1="60" x2="668" y2="400" stroke="#00cfc0" strokeWidth="4" />
        {/* Codo superior Tubería 2 */}
        <rect x="664" y="60" width="24" height="24" fill="#00776f" />
        <rect x="664" y="140" width="26" height="6" fill="#00cfc0" />
        <rect x="664" y="260" width="26" height="6" fill="#00cfc0" />

        {/* Ramal horizontal superior derecho */}
        <rect x="726" y="336" width="74" height="24" fill="#00776f" stroke="#000000" strokeWidth="4" />
        <line x1="726" y1="340" x2="800" y2="340" stroke="#00cfc0" strokeWidth="4" />
        <rect x="788" y="334" width="8" height="28" fill="#00cfc0" />

        {/* Codo y ramal horizontal medio (Tubería 3 que va hacia la izquierda) */}
        <rect x="612" y="336" width="56" height="24" fill="#00776f" stroke="#000000" strokeWidth="4" />
        <line x1="612" y1="340" x2="668" y2="340" stroke="#00cfc0" strokeWidth="4" />
        {/* Tubería que baja desde el medio hacia la izquierda */}
        <rect x="612" y="336" width="24" height="68" fill="#00776f" stroke="#000000" strokeWidth="4" />
        <line x1="616" y1="336" x2="616" y2="404" stroke="#00cfc0" strokeWidth="4" />
        <rect x="610" y="360" width="28" height="6" fill="#00cfc0" />

        {/* Tubería en U y curva inferior */}
        <rect x="572" y="380" width="24" height="220" fill="#00776f" stroke="#000000" strokeWidth="4" />
        <line x1="576" y1="380" x2="576" y2="600" stroke="#00cfc0" strokeWidth="4" />
        <rect x="572" y="380" width="64" height="24" fill="#00776f" stroke="#000000" strokeWidth="4" />
        <line x1="572" y1="384" x2="636" y2="384" stroke="#00cfc0" strokeWidth="4" />

        {/* Tramo horizontal largo que conecta por abajo */}
        <rect x="612" y="472" width="188" height="28" fill="#00776f" stroke="#000000" strokeWidth="4" />
        <line x1="612" y1="476" x2="800" y2="476" stroke="#00cfc0" strokeWidth="6" />
        <rect x="612" y="400" width="24" height="100" fill="#00776f" stroke="#000000" strokeWidth="4" />
        <line x1="616" y1="400" x2="616" y2="500" stroke="#00cfc0" strokeWidth="4" />

        {/* Pared de ladrillos inferior derecha */}
        <g stroke="#00a89d" strokeWidth="4" fill="none">
          <line x1="652" y1="436" x2="760" y2="436" />
          <line x1="652" y1="436" x2="652" y2="452" />
          <line x1="688" y1="436" x2="688" y2="452" />
          <line x1="724" y1="436" x2="724" y2="452" />
          <line x1="760" y1="436" x2="760" y2="452" />
          <line x1="636" y1="452" x2="776" y2="452" />
          <line x1="668" y1="452" x2="668" y2="468" />
          <line x1="704" y1="452" x2="704" y2="468" />
          <line x1="740" y1="452" x2="740" y2="468" />
        </g>

        {/* Estructura piramidal de ladrillos abajo a la derecha */}
        <g stroke="#00a89d" strokeWidth="4" fill="none">
          <line x1="640" y1="528" x2="708" y2="528" />
          <line x1="664" y1="528" x2="664" y2="548" />
          <line x1="692" y1="528" x2="692" y2="548" />
          <line x1="624" y1="548" x2="724" y2="548" />
          <line x1="644" y1="548" x2="644" y2="568" />
          <line x1="676" y1="548" x2="676" y2="568" />
          <line x1="708" y1="548" x2="708" y2="568" />
          <line x1="616" y1="568" x2="732" y2="568" />
          <line x1="632" y1="568" x2="632" y2="600" />
          <line x1="660" y1="568" x2="660" y2="600" />
          <line x1="688" y1="568" x2="688" y2="600" />
          <line x1="716" y1="568" x2="716" y2="600" />
        </g>

        {/* Clúster de tubos verticales en la esquina inferior derecha */}
        <rect x="740" y="520" width="16" height="80" fill="#00776f" stroke="#000000" strokeWidth="2" />
        <line x1="744" y1="520" x2="744" y2="600" stroke="#00cfc0" strokeWidth="4" />
        <rect x="764" y="504" width="16" height="96" fill="#00776f" stroke="#000000" strokeWidth="2" />
        <line x1="768" y1="504" x2="768" y2="600" stroke="#00cfc0" strokeWidth="4" />
        <rect x="788" y="536" width="16" height="64" fill="#00776f" stroke="#000000" strokeWidth="2" />
        <line x1="792" y1="536" x2="792" y2="600" stroke="#00cfc0" strokeWidth="4" />

        {/* ── 3. TERMINALES TECNOLÓGICAS (ESQUINA INFERIOR IZQUIERDA) ── */}
        <rect x="8" y="476" width="116" height="124" fill="#00554f" stroke="#00a89d" strokeWidth="4" />

        {/* Terminal 1 (Izquierda) */}
        <rect x="16" y="488" width="46" height="42" fill="#00776f" stroke="#00a89d" strokeWidth="3" />
        <rect x="22" y="496" width="8" height="8" fill="#00ffff" />
        <rect x="22" y="510" width="34" height="4" fill="#00a89d" />
        <rect x="22" y="518" width="34" height="4" fill="#00a89d" />
        {/* Ranuras inferiores Terminal 1 */}
        <rect x="16" y="538" width="46" height="60" fill="#00433e" stroke="#00a89d" strokeWidth="2" />
        <rect x="22" y="546" width="20" height="6" fill="#00cfc0" />
        <rect x="22" y="558" width="34" height="6" fill="#00cfc0" />
        <rect x="22" y="570" width="16" height="24" fill="#00cfc0" />

        {/* Terminal 2 (Derecha) */}
        <rect x="68" y="488" width="46" height="42" fill="#00776f" stroke="#00a89d" strokeWidth="3" />
        <rect x="74" y="496" width="8" height="8" fill="#00ffff" />
        <rect x="74" y="510" width="34" height="4" fill="#00a89d" />
        <rect x="74" y="518" width="34" height="4" fill="#00a89d" />
        {/* Ranuras inferiores Terminal 2 */}
        <rect x="68" y="538" width="46" height="60" fill="#00433e" stroke="#00a89d" strokeWidth="2" />
        <rect x="94" y="556" width="14" height="14" fill="#00cfc0" />

        {/* ── 4. ICONOS DE ESTADO (FICHAS AMARILLAS SUPERFIGHTERS) ── */}
        {/* Ficha Amarilla 1 (Estilo Pacman con ranura lateral) */}
        <g transform="translate(18, 432)">
          {/* Sombra / borde oscuro */}
          <circle cx="18" cy="18" r="18" fill="#78350f" />
          {/* Cuerpo amarillo arcade */}
          <circle cx="18" cy="18" r="15" fill="#facc15" />
          {/* Hendidura / corte tipo Pacman */}
          <path d="M 18,18 L 8,10 L 8,26 Z" fill="#000000" />
          <rect x="18" y="16" width="4" height="4" fill="#78350f" />
        </g>

        {/* Ficha Amarilla 2 (Estilo Reloj / Cruceta) */}
        <g transform="translate(74, 432)">
          {/* Sombra / borde oscuro */}
          <circle cx="18" cy="18" r="18" fill="#78350f" />
          {/* Cuerpo amarillo arcade */}
          <circle cx="18" cy="18" r="15" fill="#facc15" />
          {/* Ranura cruceta de moneda */}
          <rect x="16" y="8" width="4" height="20" fill="#000000" />
          <rect x="10" y="16" width="16" height="4" fill="#000000" />
        </g>
      </svg>

      {/* ─────────────────────────────────────────────────────────
          CONTENIDO CENTRAL: LOGO PLANO RETRO Y BOTÓN "PLAY"
          ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-2xl w-full">
        {/* ── BANNER RETRO DEL TÍTULO: "SUPER N" EN UNA SOLA LÍNEA ── */}
        <div className="flex flex-col items-center justify-center select-none mb-8 sm:mb-10 w-full max-w-xl">
          {/* Barra superior sólida con cortes pixelados decorativos estilo Superfighters */}
          <div className="w-full flex items-center justify-between gap-1 mb-2">
            <div className="h-1.5 sm:h-2 bg-white flex-1" />
            <div className="h-1.5 sm:h-2 w-3 sm:w-4 bg-black" />
            <div className="h-1.5 sm:h-2 w-12 sm:w-16 bg-white" />
            <div className="h-1.5 sm:h-2 w-2 sm:w-3 bg-black" />
            <div className="h-1.5 sm:h-2 flex-1 bg-white" />
          </div>

          {/* Caja del Logo: "SUPER" pequeño y "N" grande roja sangrienta en UNA SOLA LÍNEA */}
          <div className="relative w-full py-4 sm:py-6 px-4 sm:px-10 border-y-4 border-white bg-black flex items-center justify-center">
            <div className="flex flex-row items-center justify-center gap-3 sm:gap-6">
              {/* "SUPER" — Pequeño, blanco retro arcade */}
              <span className="text-lg sm:text-2xl md:text-3xl font-pixel font-bold tracking-[0.22em] text-white uppercase drop-shadow-[0_2px_0_#333]">
                SUPER
              </span>

              {/* "N" — Grande, sangre temática resaltante con goteo dinámico */}
              <div className="relative flex items-center justify-center">
                {/* SVG de alta definición retro pixel/vector de la N de Sangre */}
                <svg
                  className="w-20 h-24 sm:w-28 sm:h-32 md:w-32 md:h-36 overflow-visible filter drop-shadow-[0_4px_10px_rgba(220,38,38,0.5)]"
                  viewBox="0 0 100 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ shapeRendering: 'crispEdges' }}
                >
                  <defs>
                    {/* Gradiente de sangre líquida: brillo superior a carmesí coagulado */}
                    <linearGradient id="bloodGradient" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="45%" stopColor="#dc2626" />
                      <stop offset="85%" stopColor="#991b1b" />
                      <stop offset="100%" stopColor="#580808" />
                    </linearGradient>
                    <linearGradient id="bloodHighlight" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>

                  {/* Sombra de fondo profunda para dar volumen a la letra N */}
                  <path
                    d="M 12 16 L 36 16 L 36 60 L 68 16 L 92 16 L 92 100 L 70 100 L 70 54 L 38 100 L 12 100 Z"
                    fill="#3f0707"
                    transform="translate(3, 4)"
                  />

                  {/* Cuerpo principal de la letra N */}
                  <path
                    d="M 12 12 L 36 12 L 36 56 L 68 12 L 92 12 L 92 94 L 70 94 L 70 50 L 38 94 L 12 94 Z"
                    fill="url(#bloodGradient)"
                    stroke="#2a0404"
                    strokeWidth="2"
                  />

                  {/* Brillos especulares de sangre líquida fresca en los bordes superiores */}
                  <rect x="14" y="14" width="20" height="4" fill="url(#bloodHighlight)" />
                  <rect x="70" y="14" width="20" height="4" fill="url(#bloodHighlight)" />
                  <line x1="38" y1="56" x2="68" y2="14" stroke="#fca5a5" strokeWidth="2" strokeOpacity="0.7" />

                  {/* Coágulos y salpicaduras internas (textura de sangre) */}
                  <rect x="18" y="24" width="4" height="12" fill="#fca5a5" opacity="0.6" />
                  <rect x="26" y="70" width="6" height="14" fill="#580808" />
                  <rect x="76" y="28" width="4" height="20" fill="#fca5a5" opacity="0.5" />
                  <rect x="78" y="66" width="6" height="16" fill="#580808" />
                  <rect x="48" y="52" width="6" height="10" fill="#7f1d1d" />

                  {/* ── GOTAS Y CHORROS DE SANGRE GOTIANDO DE LA "N" ── */}
                  {/* Goteo Pata Izquierda */}
                  {/* Chorro que desciende */}
                  <path d="M 14 94 L 14 104 L 18 108 L 22 104 L 22 94 Z" fill="#991b1b" />
                  <path d="M 16 94 L 16 103 L 18 106 L 20 103 L 20 94 Z" fill="#dc2626" />
                  {/* Gota desprendida cayendo */}
                  <circle cx="18" cy="114" r="3" fill="#dc2626" />
                  <rect x="17" y="112" width="2" height="2" fill="#fca5a5" />
                  <circle cx="18" cy="122" r="1.5" fill="#991b1b" />

                  {/* Goteo Centro (Vértice de la diagonal) */}
                  <path d="M 36 94 L 38 102 L 42 106 L 46 102 L 44 94 Z" fill="#991b1b" />
                  <path d="M 38 94 L 39 101 L 42 104 L 44 101 L 43 94 Z" fill="#dc2626" />
                  <circle cx="42" cy="111" r="2" fill="#dc2626" />

                  {/* Goteo Pata Derecha (Gota larga gruesa con escurrimiento) */}
                  <path d="M 80 94 L 80 108 L 84 114 L 88 108 L 88 94 Z" fill="#991b1b" />
                  <path d="M 82 94 L 82 107 L 84 112 L 86 107 L 86 94 Z" fill="#dc2626" />
                  <circle cx="84" cy="120" r="3.5" fill="#dc2626" />
                  <rect x="83" y="118" width="2" height="2" fill="#fca5a5" />
                  <circle cx="84" cy="129" r="1.8" fill="#7f1d1d" />

                  {/* Micro salpicadura lateral derecha */}
                  <circle cx="94" cy="80" r="1.5" fill="#dc2626" />
                  <circle cx="97" cy="86" r="2.2" fill="#991b1b" />
                  <circle cx="96" cy="94" r="1.2" fill="#7f1d1d" />

                  {/* Micro salpicadura lateral izquierda */}
                  <circle cx="8" cy="74" r="1.5" fill="#dc2626" />
                  <circle cx="6" cy="84" r="2" fill="#991b1b" />
                </svg>
              </div>
            </div>
          </div>

          {/* Barra inferior sólida */}
          <div className="w-full flex items-center justify-between gap-1 mt-2">
            <div className="h-1.5 sm:h-2 w-16 sm:w-20 bg-white" />
            <div className="h-1.5 sm:h-2 w-2 sm:w-3 bg-black" />
            <div className="h-1.5 sm:h-2 flex-1 bg-white" />
            <div className="h-1.5 sm:h-2 w-4 sm:w-6 bg-black" />
            <div className="h-1.5 sm:h-2 w-24 sm:w-32 bg-white" />
          </div>

          {/* Frase temática en rojo sangre */}
          <div className="mt-4 flex flex-col items-center">
            <p className="text-[9px] sm:text-[10px] tracking-[0.25em] text-red-600 font-pixel font-bold uppercase drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]">
              LUCHA, ESQUIVA, SOBREVIVE
            </p>
          </div>
        </div>

        {/* ── BOTÓN DE ENTRADA RETRO: "PLAY" (MÁS PEQUEÑO) ── */}
        <button
          onClick={handleEnter}
          onMouseEnter={() => {
            if (!isSelected) {
              sounds.playPickup();
              setIsSelected(true);
            }
          }}
          className="group flex items-center justify-center gap-2 py-1.5 px-4 text-xs sm:text-sm font-pixel tracking-widest cursor-pointer transition-colors duration-100 outline-none focus:outline-none"
        >
          {/* Cursor / flecha izquierda indicadora de selección */}
          <span
            className={`transition-colors duration-100 ${
              isSelected ? 'text-yellow-400 animate-pulse' : 'text-transparent'
            }`}
          >
            ▶
          </span>

          {/* Texto PLAY */}
          <span
            className={`tracking-[0.25em] transition-colors duration-100 ${
              isSelected ? 'text-yellow-400' : 'text-neutral-200'
            }`}
          >
            PLAY
          </span>

          {/* Cursor / flecha derecha */}
          <span
            className={`transition-colors duration-100 ${
              isSelected ? 'text-yellow-400 animate-pulse' : 'text-transparent'
            }`}
          >
            ◀
          </span>
        </button>

        {/* Indicador inferior de teclado retro */}
        <p className="mt-8 text-[9px] sm:text-[10px] tracking-wider text-neutral-500 font-pixel">
          PRESS [ENTER] OR [SPACE] TO START
        </p>
      </div>
    </div>
  );
};

export default LandingScreen;
