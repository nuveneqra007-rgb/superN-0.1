// =============================================================
// MainMenu.tsx — Menú principal con selección de Protagonista (P1)
// y selección de Oponente (Bot Rival) según BotExtended README.md
// =============================================================

import React, { useState } from 'react';
import { BotFaction, BotArchetypeDatabase, getBotArchetype } from '../game/BotData';
import { WeaponDatabase, WeaponType, getWeapon } from '../game/WeaponData';
import { sounds } from '../game/SoundEffects';
import { Play, Shield, Zap, Skull, Swords, Volume2, VolumeX, User, CheckCircle2, Crosshair, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';

import { GameMode } from './ModeSelectScreen';

interface MainMenuProps {
  gameMode: GameMode;
  selectedPlayerFaction: BotFaction;
  onSelectPlayerFaction: (faction: BotFaction) => void;
  selectedBotFaction: BotFaction;
  onSelectBotFaction: (faction: BotFaction) => void;
  rounds: number;
  onSelectRounds: (rounds: number) => void;
  onGoToWorldSelect: (playerFaction: BotFaction, botFaction: BotFaction, rounds: number) => void;
  onOpenArsenal: () => void;
  onBackToLanding: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  gameMode,
  selectedPlayerFaction,
  onSelectPlayerFaction,
  selectedBotFaction,
  onSelectBotFaction,
  rounds,
  onSelectRounds,
  onGoToWorldSelect,
  onOpenArsenal,
  onBackToLanding,
}) => {
  const [activeTab, setActiveTab] = useState<'player' | 'bot'>('player');
  const [muted, setMuted] = useState<boolean>(sounds.getMuted());

  const toggleSound = () => {
    const next = !muted;
    sounds.setMuted(next);
    setMuted(next);
  };

  const playerArchetype = getBotArchetype(selectedPlayerFaction);
  const botArchetype = getBotArchetype(selectedBotFaction);
  const currentArchetype = activeTab === 'player' ? playerArchetype : botArchetype;

  const handleNext = () => {
    if (selectedPlayerFaction && selectedBotFaction) {
      sounds.playPickup();
      onGoToWorldSelect(selectedPlayerFaction, selectedBotFaction, rounds);
    }
  };

  const handleSelectCharacter = (faction: BotFaction) => {
    sounds.playPickup();
    if (activeTab === 'player') {
      onSelectPlayerFaction(faction);
    } else {
      onSelectBotFaction(faction);
    }
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-neutral-950 text-neutral-100 overflow-y-auto p-3 select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-950/40 via-neutral-950 to-neutral-950 -z-10 pointer-events-none" />

      {/* Top Bar with Audio & Credits */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playPickup();
              onBackToLanding();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-lg text-xs font-bold text-neutral-300 hover:text-white transition shadow-sm cursor-pointer"
            title="Volver a la pantalla de inicio"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Volver</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono-code text-neutral-400">
            <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-sky-400 font-bold">
              v0.1-web
            </span>
            <span>Basado en Superfighters Deluxe & superN</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* New Dedicated Arsenal Button */}
          <button
            onClick={() => {
              sounds.playPickup();
              onOpenArsenal();
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-sky-500/20 via-cyan-500/15 to-neutral-900 hover:from-sky-500/30 hover:to-cyan-500/30 border border-sky-500/50 hover:border-sky-400 rounded-lg text-xs font-bold text-sky-300 hover:text-white transition shadow-[0_0_15px_rgba(14,165,233,0.25)] group"
          >
            <Swords className="w-4 h-4 text-sky-400 group-hover:rotate-12 transition-transform" />
            <span>Ver Arsenal de Armas</span>
            <span className="px-1.5 py-0.5 bg-sky-500/30 text-sky-200 border border-sky-400/30 rounded text-[10px] font-mono-code font-bold">
              51 Armas
            </span>
          </button>

          <button
            onClick={toggleSound}
            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded text-neutral-300 transition"
            title={muted ? 'Activar sonido' : 'Silenciar'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Title & Logo */}
      <div className="text-center mb-3">
        <div className="inline-flex items-center gap-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-sky-400 via-cyan-200 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(56,189,248,0.3)]">
            super<span className="text-white">N</span>
          </h1>
        </div>
        <p className="text-neutral-400 text-xs tracking-wide font-medium">
          {gameMode === 'local1v1'
            ? '2D Platform Tactical Fighter — Elige los combatientes para JUGADOR 1 y JUGADOR 2'
            : '2D Platform Tactical Fighter — Elige tu Protagonista y tu Oponente Rival'}
        </p>
      </div>

      {/* Versus Showcase Banner */}
      <div className="w-full max-w-5xl mb-3 bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 grid grid-cols-1 md:grid-cols-11 gap-3 items-center backdrop-blur shadow-xl">
        {/* P1 Protagonist Box */}
        <div
          onClick={() => setActiveTab('player')}
          className={`md:col-span-5 p-3 rounded-lg border cursor-pointer transition flex items-center justify-between gap-3 ${
            activeTab === 'player'
              ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-2 ring-cyan-500/30'
              : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-neutral-900/90 border border-neutral-800 rounded-lg flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-inner">
              {playerArchetype.spriteUrl ? (
                <img
                  src={playerArchetype.spriteUrl}
                  alt={playerArchetype.name}
                  className="max-h-full max-w-full object-contain [image-rendering:pixelated]"
                />
              ) : null}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono-code font-bold uppercase text-cyan-400">
                <User className="w-3.5 h-3.5" />
                <span>{gameMode === 'local1v1' ? 'Jugador 1' : 'Jugador 1 (Protagonista)'}</span>
              </div>
              <h3 className="text-base font-extrabold text-white">{playerArchetype.name}</h3>
              <div className="text-[11px] text-neutral-400 flex flex-wrap items-center gap-2">
                <span>HP: <strong className="text-emerald-400">{playerArchetype.maxHealth}</strong></span>
                <span>•</span>
                <span>Vel: <strong className="text-amber-400">×{playerArchetype.speedModifier.toFixed(2)}</strong></span>
                <span>•</span>
                <span className="text-cyan-300 font-semibold">Inicio: Desarmado (Puños)</span>
              </div>
            </div>
          </div>
          <button
            className={`px-2.5 py-1 rounded text-[11px] font-bold border transition ${
              activeTab === 'player'
                ? 'bg-cyan-500 text-neutral-950 border-cyan-400'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
            }`}
          >
            {activeTab === 'player' ? 'Editando' : 'Cambiar'}
          </button>
        </div>

        {/* Center VS Indicator */}
        <div className="md:col-span-1 flex flex-col items-center justify-center py-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg font-black text-xs text-neutral-950 tracking-wider">
            VS
          </div>
          <span className="text-[10px] font-mono-code text-neutral-400 mt-1 uppercase">Duelo</span>
        </div>

        {/* P2 / Bot Opponent Box */}
        <div
          onClick={() => setActiveTab('bot')}
          className={`md:col-span-5 p-3 rounded-lg border cursor-pointer transition flex items-center justify-between gap-3 ${
            activeTab === 'bot'
              ? 'bg-rose-950/60 border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.25)] ring-2 ring-rose-500/30'
              : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-neutral-900/90 border border-neutral-800 rounded-lg flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-inner">
              {botArchetype.spriteUrl ? (
                <img
                  src={botArchetype.spriteUrl}
                  alt={botArchetype.name}
                  className="max-h-full max-w-full object-contain [image-rendering:pixelated]"
                />
              ) : null}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono-code font-bold uppercase text-rose-400">
                {gameMode === 'local1v1' ? <User className="w-3.5 h-3.5" /> : <Skull className="w-3.5 h-3.5" />}
                <span>{gameMode === 'local1v1' ? 'Jugador 2' : 'Oponente Rival (Bot)'}</span>
              </div>
              <h3 className="text-base font-extrabold text-white">{botArchetype.name}</h3>
              <div className="text-[11px] text-neutral-400 flex items-center gap-2">
                <span>HP: <strong className="text-rose-400">{botArchetype.maxHealth}</strong></span>
                <span>•</span>
                <span>
                  {gameMode === 'local1v1' ? (
                    <>Vel: <strong className="text-amber-400">×{botArchetype.speedModifier.toFixed(2)}</strong></>
                  ) : (
                    <>IA: <strong className="text-sky-300 capitalize">{botArchetype.aiType}</strong></>
                  )}
                </span>
              </div>
            </div>
          </div>
          <button
            className={`px-2.5 py-1 rounded text-[11px] font-bold border transition ${
              activeTab === 'bot'
                ? 'bg-rose-500 text-neutral-950 border-rose-400'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
            }`}
          >
            {activeTab === 'bot' ? 'Editando' : 'Cambiar'}
          </button>
        </div>
      </div>

      {/* Main Selection Area */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        {/* Left Column: Character Grid for currently active tab */}
        <div className="md:col-span-2 bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 backdrop-blur shadow-xl flex flex-col">
          {/* Tab Selector Buttons */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setActiveTab('player')}
              className={`flex-1 py-2 px-3 rounded-lg border font-bold text-xs flex items-center justify-center gap-2 transition ${
                activeTab === 'player'
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <User className="w-4 h-4 text-cyan-400" />
              <span>1. Elegir Protagonista P1: <strong className="text-white">{playerArchetype.name}</strong></span>
            </button>

            <button
              onClick={() => setActiveTab('bot')}
              className={`flex-1 py-2 px-3 rounded-lg border font-bold text-xs flex items-center justify-center gap-2 transition ${
                activeTab === 'bot'
                  ? 'bg-rose-950/80 border-rose-400 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Skull className="w-4 h-4 text-rose-400" />
              <span>2. Elegir Oponente Rival: <strong className="text-white">{botArchetype.name}</strong></span>
            </button>
          </div>

          <div className="flex items-center justify-between mb-2">
            <h2 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              activeTab === 'player' ? 'text-cyan-400' : 'text-rose-400'
            }`}>
              {activeTab === 'player' ? (
                <>
                  <User className="w-4 h-4" />
                  <span>Selecciona tu Personaje Principal (Jugador 1)</span>
                </>
              ) : (
                <>
                  <Skull className="w-4 h-4" />
                  <span>Selecciona la Facción del Bot Rival</span>
                </>
              )}
            </h2>
            <span className="text-[10px] text-neutral-500 font-mono-code">
              15 Personajes Canónicos
            </span>
          </div>

          {/* 15 Archetypes Grid with photos */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {Object.values(BotArchetypeDatabase).map((arch) => {
              const isSelected =
                activeTab === 'player'
                  ? selectedPlayerFaction === arch.faction
                  : selectedBotFaction === arch.faction;

              return (
                <button
                  key={arch.faction}
                  onClick={() => handleSelectCharacter(arch.faction)}
                  className={`p-2 rounded-lg border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? activeTab === 'player'
                        ? 'bg-cyan-950/70 border-cyan-400 ring-2 ring-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'bg-rose-950/70 border-rose-400 ring-2 ring-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                      : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className={`font-bold text-xs truncate ${
                      isSelected
                        ? activeTab === 'player' ? 'text-cyan-300' : 'text-rose-300'
                        : 'text-neutral-200'
                    }`}>
                      {arch.name}
                    </span>
                    {isSelected ? (
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${
                        activeTab === 'player' ? 'text-cyan-400' : 'text-rose-400'
                      }`} />
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    {arch.spriteUrl ? (
                      <img
                        src={arch.spriteUrl}
                        alt=""
                        className="w-5 h-5 object-contain shrink-0 [image-rendering:pixelated]"
                      />
                    ) : <div className="w-5 h-5" />}
                    <span className="text-[9px] text-neutral-400 font-mono-code capitalize">
                      {arch.aiType}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Archetype Detailed Card */}
          <div className={`mt-auto p-3.5 bg-neutral-950/80 border rounded-lg ${
            activeTab === 'player' ? 'border-cyan-900/60' : 'border-rose-900/60'
          }`}>
            <div className="flex justify-between items-center gap-4 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono-code px-2 py-0.5 rounded font-bold uppercase ${
                    activeTab === 'player' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {activeTab === 'player' ? 'Protagonista P1' : 'Oponente Bot'}
                  </span>
                  <h3 className="text-base font-extrabold text-white">{currentArchetype.name}</h3>
                </div>
                <p className="text-xs text-neutral-300 mt-1">{currentArchetype.description}</p>
              </div>
              {currentArchetype.spriteUrl ? (
                <div className="w-14 h-14 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-inner">
                  <img
                    src={currentArchetype.spriteUrl}
                    alt={currentArchetype.name}
                    className="max-h-full max-w-full object-contain [image-rendering:pixelated]"
                  />
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-neutral-800/80 text-xs">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-neutral-500 text-[10px] block">SALUD</span>
                  <span className="font-bold text-neutral-200">{currentArchetype.maxHealth} HP</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-neutral-500 text-[10px] block">VELOCIDAD</span>
                  <span className="font-bold text-neutral-200">×{currentArchetype.speedModifier.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <span className="text-neutral-500 text-[10px] block">ARMA PREFERIDA</span>
                  <div className="flex items-center gap-1.5 font-bold text-neutral-200">
                    {currentArchetype.preferredWeapon && WeaponDatabase[currentArchetype.preferredWeapon]?.iconUrl ? (
                      <img
                        src={WeaponDatabase[currentArchetype.preferredWeapon].iconUrl}
                        alt=""
                        className="h-4 w-auto object-contain [image-rendering:pixelated]"
                      />
                    ) : null}
                    <span>
                      {currentArchetype.preferredWeapon
                        ? WeaponDatabase[currentArchetype.preferredWeapon]?.name || currentArchetype.preferredWeapon
                        : 'Variadas'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Match Configuration & Start */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 backdrop-blur shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2.5 flex items-center gap-2">
              <Swords className="w-4 h-4" /> Configuración del Encuentro
            </h2>

            {/* Matchup Summary Badge */}
            <div className="p-3 bg-neutral-950/80 border border-neutral-800 rounded-lg text-xs space-y-2 mb-3">
              <div className="flex justify-between items-center pb-1.5 border-b border-neutral-800">
                <span className="text-neutral-400">{gameMode === 'local1v1' ? 'Jugador 1:' : 'Protagonista P1:'}</span>
                <span className="font-bold text-cyan-300">{playerArchetype.name}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-neutral-800">
                <span className="text-neutral-400">{gameMode === 'local1v1' ? 'Jugador 2:' : 'Oponente Rival:'}</span>
                <span className="font-bold text-rose-400">{botArchetype.name}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-neutral-800">
                <span className="text-neutral-400">Inicio de Ronda:</span>
                <span className="font-bold text-neutral-200">Desarmados (Cuerpo a cuerpo)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Objetivo:</span>
                <span className="font-bold text-yellow-300">{Math.floor(rounds / 2) + 1} victorias</span>
              </div>
            </div>

            <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wide block mb-1.5">
              Número de Rondas:
            </label>
            <div className="flex gap-1.5 mb-3">
              {[1, 3, 5, 7].map((num) => (
                <button
                  key={num}
                  onClick={() => onSelectRounds(num)}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-xs border transition ${
                    rounds === num
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {num} {num === 1 ? 'Ronda' : 'Rondas'}
                </button>
              ))}
            </div>

            <div className="p-2.5 bg-neutral-950/70 border border-neutral-800/80 rounded-lg text-[11px] space-y-1.5 text-neutral-400">
              <div>• <strong className="text-sky-300">Ambos luchadores inician sin armas</strong> (combate a puñetazos).</div>
              <div>• <strong className="text-yellow-300">Recoge las armas</strong> que aparecen sobre las plataformas para usarlas.</div>
              <div>• Rodar con <strong className="text-sky-300">S / Abajo</strong> extingue llamas.</div>
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={!selectedPlayerFaction || !selectedBotFaction}
            className={`w-full mt-3 py-3.5 text-neutral-950 font-black text-base tracking-wider uppercase rounded-xl transition transform flex items-center justify-center gap-2 cursor-pointer ${
              selectedPlayerFaction && selectedBotFaction
                ? 'bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:-translate-y-0.5 active:translate-y-0'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50'
            }`}
          >
            <span>ELEGIR MUNDO</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Controls Manual */}
      <div className="w-full max-w-5xl bg-neutral-900/60 border border-neutral-800/80 rounded-lg px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
        <span className="font-bold text-neutral-300">Controles de Teclado:</span>
        {gameMode === 'local1v1' ? (
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px]">
            <span><strong className="text-cyan-400">J1</strong>: Flechas, N (Melee), M (Disparar), , (Granada), . (Correr)</span>
            <span><strong className="text-amber-400">J2</strong>: WASD, J (Melee), K (Disparar), L (Granada), Q (Correr)</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px]">
            <span><strong className="text-sky-300">A / D ó Flechas</strong>: Correr</span>
            <span><strong className="text-sky-300">W ó ↑ / Espacio</strong>: Saltar</span>
            <span><strong className="text-sky-300">S ó ↓</strong>: Agacharse / Rodar</span>
            <span><strong className="text-sky-300">N ó J</strong>: Ataque Melee</span>
            <span><strong className="text-sky-300">M ó K</strong>: Disparar</span>
            <span><strong className="text-sky-300">G</strong>: Granada / Molotov</span>
          </div>
        )}
      </div>
    </div>
  );
};
