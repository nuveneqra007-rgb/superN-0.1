// =============================================================
// MainMenu.tsx — Menú principal con selección de Protagonista (P1)
// y selección de Oponente (Bot Rival) según BotExtended README.md
// =============================================================

import React, { useState } from 'react';
import { BotFaction, BotArchetypeDatabase, getBotArchetype } from '../game/BotData';
import { WeaponDatabase } from '../game/WeaponData';
import { sounds } from '../game/SoundEffects';
import { Play, Shield, Zap, Skull, Swords, Volume2, VolumeX, Info, User, CheckCircle2 } from 'lucide-react';

interface MainMenuProps {
  onStartGame: (playerFaction: BotFaction, botFaction: BotFaction, rounds: number) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [selectedPlayerFaction, setSelectedPlayerFaction] = useState<BotFaction>(BotFaction.Assassin);
  const [selectedBotFaction, setSelectedBotFaction] = useState<BotFaction>(BotFaction.Thug);
  const [activeTab, setActiveTab] = useState<'player' | 'bot'>('player');
  const [rounds, setRounds] = useState<number>(5);
  const [muted, setMuted] = useState<boolean>(sounds.getMuted());
  const [showWeaponInfo, setShowWeaponInfo] = useState<boolean>(false);

  const toggleSound = () => {
    const next = !muted;
    sounds.setMuted(next);
    setMuted(next);
  };

  const playerArchetype = getBotArchetype(selectedPlayerFaction);
  const botArchetype = getBotArchetype(selectedBotFaction);
  const currentArchetype = activeTab === 'player' ? playerArchetype : botArchetype;

  const handleStart = () => {
    sounds.playPickup();
    onStartGame(selectedPlayerFaction, selectedBotFaction, rounds);
  };

  const handleSelectCharacter = (faction: BotFaction) => {
    sounds.playPickup();
    if (activeTab === 'player') {
      setSelectedPlayerFaction(faction);
    } else {
      setSelectedBotFaction(faction);
    }
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-neutral-950 text-neutral-100 overflow-y-auto p-3 select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-950/40 via-neutral-950 to-neutral-950 -z-10 pointer-events-none" />

      {/* Top Bar with Audio & Credits */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2 text-xs font-mono-code text-neutral-400">
          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-sky-400 font-bold">
            v0.1-web
          </span>
          <span>Basado en Superfighters Deluxe & superN</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWeaponInfo(!showWeaponInfo)}
            className="flex items-center gap-1.5 px-3 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded text-xs text-neutral-300 transition"
          >
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>{showWeaponInfo ? 'Ocultar Arsenal' : 'Ver Arsenal de Armas'}</span>
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
          2D Platform Tactical Fighter — Elige tu Protagonista y tu Oponente Rival
        </p>
      </div>

      {showWeaponInfo ? (
        /* Weapon Arsenal Grid with Photos */
        <div className="w-full max-w-5xl bg-neutral-900/95 border border-neutral-800 rounded-xl p-4 mb-4 backdrop-blur shadow-2xl animate-fade-in max-h-[50vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-3 sticky top-0 bg-neutral-900/95 py-1 z-10 border-b border-neutral-800">
            <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2">
              <Swords className="w-4 h-4" /> Arsenal y Armas Oficiales de BotExtended
            </h3>
            <button
              onClick={() => setShowWeaponInfo(false)}
              className="text-xs text-neutral-400 hover:text-white px-2 py-0.5 rounded bg-neutral-800"
            >
              Cerrar ×
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs">
            {Object.values(WeaponDatabase).map((w) => (
              <div
                key={w.type}
                className="p-2.5 bg-neutral-950/90 rounded border border-neutral-800 flex flex-col justify-between hover:border-neutral-700 transition"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-neutral-800/80">
                    <div className="w-12 h-9 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-inner">
                      {w.iconUrl ? (
                        <img
                          src={w.iconUrl}
                          alt={w.name}
                          className="max-h-full max-w-full object-contain [image-rendering:pixelated]"
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: w.color }} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-white block truncate text-xs">{w.name}</span>
                      <span className="text-[9px] uppercase font-mono-code px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                        {w.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-neutral-400 text-[11px] space-y-0.5">
                    <div>Daño: <strong className="text-yellow-400">{w.damage}</strong></div>
                    <div>Munición: <strong className="text-neutral-200">{w.magSize === -1 ? 'Infinito' : w.magSize}</strong></div>
                    {w.explosionRadius ? (
                      <div className="text-orange-400">Explosión: {w.explosionRadius}px</div>
                    ) : null}
                    {w.onFireDuration ? (
                      <div className="text-rose-400">¡Enciende en llamas!</div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

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
                <span>Jugador 1 (Protagonista)</span>
              </div>
              <h3 className="text-base font-extrabold text-white">{playerArchetype.name}</h3>
              <div className="text-[11px] text-neutral-400 flex items-center gap-2">
                <span>HP: <strong className="text-emerald-400">{playerArchetype.maxHealth}</strong></span>
                <span>•</span>
                <span>Vel: <strong className="text-amber-400">×{playerArchetype.speedModifier.toFixed(2)}</strong></span>
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

        {/* Bot Opponent Box */}
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
                <Skull className="w-3.5 h-3.5" />
                <span>Oponente Rival (Bot)</span>
              </div>
              <h3 className="text-base font-extrabold text-white">{botArchetype.name}</h3>
              <div className="text-[11px] text-neutral-400 flex items-center gap-2">
                <span>HP: <strong className="text-rose-400">{botArchetype.maxHealth}</strong></span>
                <span>•</span>
                <span>IA: <strong className="text-sky-300 capitalize">{botArchetype.aiType}</strong></span>
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
                <span className="text-neutral-400">Protagonista P1:</span>
                <span className="font-bold text-cyan-300">{playerArchetype.name}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-neutral-800">
                <span className="text-neutral-400">Oponente Rival:</span>
                <span className="font-bold text-rose-400">{botArchetype.name}</span>
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
                  onClick={() => setRounds(num)}
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
              <div>• Armas caen en plataformas cada 15s.</div>
              <div>• Rodar con <strong className="text-sky-300">S / Abajo</strong> extingue llamas.</div>
              <div>• Combos cuerpo a cuerpo con <strong className="text-sky-300">N / J</strong>.</div>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full mt-3 py-3.5 bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-neutral-950 font-black text-base tracking-wider uppercase rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            ¡ENTRAR A LA ARENA!
          </button>
        </div>
      </div>

      {/* Controls Manual */}
      <div className="w-full max-w-5xl bg-neutral-900/60 border border-neutral-800/80 rounded-lg px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
        <span className="font-bold text-neutral-300">Controles de Teclado:</span>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px]">
          <span><strong className="text-sky-300">A / D ó Flechas</strong>: Correr</span>
          <span><strong className="text-sky-300">W ó ↑ / Espacio</strong>: Saltar</span>
          <span><strong className="text-sky-300">S ó ↓</strong>: Agacharse / Rodar</span>
          <span><strong className="text-sky-300">N ó J</strong>: Ataque Melee (Combo 3 golpes)</span>
          <span><strong className="text-sky-300">M ó K</strong>: Disparar</span>
          <span><strong className="text-sky-300">G</strong>: Granada / Molotov</span>
        </div>
      </div>
    </div>
  );
};
