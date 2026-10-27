// =============================================================
// MainMenu.tsx — Menú principal y selector de facción / arena
// Replicación de MainMenu.tscn y MainMenu.cs
// =============================================================

import React, { useState } from 'react';
import { BotFaction, BotArchetypeDatabase, getBotArchetype } from '../game/BotData';
import { WeaponDatabase, WeaponType } from '../game/WeaponData';
import { sounds } from '../game/SoundEffects';
import { Play, Shield, Zap, Skull, Swords, Volume2, VolumeX, Info } from 'lucide-react';

interface MainMenuProps {
  onStartGame: (faction: BotFaction, rounds: number) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [selectedFaction, setSelectedFaction] = useState<BotFaction>(BotFaction.Thug);
  const [rounds, setRounds] = useState<number>(5);
  const [muted, setMuted] = useState<boolean>(sounds.getMuted());
  const [showWeaponInfo, setShowWeaponInfo] = useState<boolean>(false);

  const toggleSound = () => {
    const next = !muted;
    sounds.setMuted(next);
    setMuted(next);
  };

  const currentArchetype = getBotArchetype(selectedFaction);

  const handleStart = () => {
    sounds.playPickup();
    onStartGame(selectedFaction, rounds);
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-neutral-950 text-neutral-100 overflow-y-auto p-4 select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-950/40 via-neutral-950 to-neutral-950 -z-10 pointer-events-none" />

      {/* Top Bar with Audio & Credits */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 px-2">
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
            <span>{showWeaponInfo ? 'Ocultar Armas' : 'Ver 13 Armas'}</span>
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
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-1">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-sky-400 via-cyan-200 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(56,189,248,0.3)]">
            super<span className="text-white">N</span>
          </h1>
        </div>
        <p className="text-neutral-400 text-sm tracking-wide font-medium">
          2D Platform Tactical Fighter — 60Hz Physics & Dynamic Bots
        </p>
      </div>

      {showWeaponInfo ? (
        /* Weapon Arsenal Grid */
        <div className="w-full max-w-4xl bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 mb-6 backdrop-blur shadow-xl animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-sky-400 flex items-center gap-2">
              <Swords className="w-4 h-4" /> Arsenal de 13 Armas Canónicas
            </h3>
            <button
              onClick={() => setShowWeaponInfo(false)}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Cerrar ×
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {Object.values(WeaponDatabase).map((w) => (
              <div
                key={w.type}
                className="p-3 bg-neutral-950/80 rounded border border-neutral-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white">{w.name}</span>
                    <span className="text-[10px] uppercase font-mono-code px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                      {w.category}
                    </span>
                  </div>
                  <div className="text-neutral-400 text-[11px] space-y-0.5 mt-2">
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

      {/* Main Selection Area */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Left Column: Faction / Opponent selection */}
        <div className="md:col-span-2 bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 backdrop-blur shadow-xl flex flex-col">
          <h2 className="text-sm font-bold uppercase tracking-wider text-sky-400 mb-3 flex items-center gap-2">
            <Skull className="w-4 h-4" /> Seleccionar Oponente (Facción de Bot)
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
            {Object.values(BotArchetypeDatabase).map((arch) => {
              const isSelected = selectedFaction === arch.faction;
              return (
                <button
                  key={arch.faction}
                  onClick={() => setSelectedFaction(arch.faction)}
                  className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-sky-950/70 border-sky-400 ring-2 ring-sky-500/30'
                      : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className={`font-bold text-xs truncate ${isSelected ? 'text-sky-300' : 'text-neutral-200'}`}>
                      {arch.name}
                    </span>
                    {arch.spriteUrl ? (
                      <img
                        src={arch.spriteUrl}
                        alt=""
                        className="w-4 h-4 object-contain shrink-0 [image-rendering:pixelated]"
                      />
                    ) : null}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono-code capitalize mt-1">
                    {arch.aiType}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Archetype Detailed Card */}
          <div className="mt-auto p-4 bg-neutral-950/70 border border-neutral-800 rounded-lg">
            <div className="flex justify-between items-center gap-4 mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{currentArchetype.name}</span>
                  <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-neutral-800 text-sky-300">
                    IA: {currentArchetype.aiType}
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">{currentArchetype.description}</p>
              </div>
              {currentArchetype.spriteUrl ? (
                <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-inner">
                  <img
                    src={currentArchetype.spriteUrl}
                    alt={currentArchetype.name}
                    className="max-h-full max-w-full object-contain [image-rendering:pixelated]"
                  />
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-neutral-800/80 text-xs">
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
                  <span className="font-bold text-neutral-200">
                    {currentArchetype.preferredWeapon || 'Variadas'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Match Configuration & Start */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 backdrop-blur shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
              <Swords className="w-4 h-4" /> Configuración de Rondas
            </h2>

            <div className="flex gap-2 mb-4">
              {[1, 3, 5, 7].map((num) => (
                <button
                  key={num}
                  onClick={() => setRounds(num)}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs border transition ${
                    rounds === num
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {num} {num === 1 ? 'Ronda' : 'Rondas'}
                </button>
              ))}
            </div>

            <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg text-xs space-y-2 mb-4">
              <div className="text-neutral-300 font-semibold mb-1">Reglas del Encuentro:</div>
              <div className="text-neutral-400">
                • El primer combatiente en ganar <strong>{Math.floor(rounds / 2) + 1}</strong> rondas gana el encuentro.
              </div>
              <div className="text-neutral-400">
                • Las armas reaparecen aleatoriamente en las plataformas de la bodega cada 15 segundos.
              </div>
              <div className="text-neutral-400">
                • Rodar (S / Abajo en carrera) apaga el fuego y otorga esquiva.
              </div>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-neutral-950 font-black text-lg tracking-wider uppercase rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.4)] transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            ¡ENTRAR A LA ARENA!
          </button>
        </div>
      </div>

      {/* Controls Manual */}
      <div className="w-full max-w-4xl bg-neutral-900/60 border border-neutral-800/80 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
        <span className="font-bold text-neutral-300">Controles de Teclado:</span>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span><strong className="text-sky-300">A / D ó Flechas</strong>: Correr</span>
          <span><strong className="text-sky-300">W ó ↑ / Espacio</strong>: Saltar</span>
          <span><strong className="text-sky-300">S ó ↓</strong>: Agacharse / Dodge Roll</span>
          <span><strong className="text-sky-300">N ó J</strong>: Ataque Melee (Combo 3 golpes)</span>
          <span><strong className="text-sky-300">M ó K</strong>: Disparar Arma</span>
          <span><strong className="text-sky-300">G</strong>: Lanzar Granada / Molotov</span>
        </div>
      </div>
    </div>
  );
};
