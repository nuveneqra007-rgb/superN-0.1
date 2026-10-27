// =============================================================
// ArsenalView.tsx — Pantalla completa del Arsenal de Armas
// Muestra todas las armas en pantalla, daño que inflige y detalles
// =============================================================

import React, { useState, useMemo, useEffect } from 'react';
import { WeaponCategory, WeaponData, WeaponDatabase, WeaponType } from '../game/WeaponData';
import { sounds } from '../game/SoundEffects';
import {
  ArrowLeft,
  Search,
  Swords,
  Flame,
  Zap,
  Target,
  Volume2,
  VolumeX,
  Crosshair,
  ShieldAlert,
  Sparkles,
  Bomb,
  Play,
  RotateCcw,
} from 'lucide-react';

interface ArsenalViewProps {
  onBackToMenu: () => void;
  selectedWeaponType?: WeaponType;
}

export const ArsenalView: React.FC<ArsenalViewProps> = ({
  onBackToMenu,
  selectedWeaponType = WeaponType.Pistol,
}) => {
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponData>(
    () => WeaponDatabase[selectedWeaponType] || WeaponDatabase[WeaponType.Pistol]
  );
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'damage-desc' | 'damage-asc' | 'name' | 'magSize' | 'cooldown'>('damage-desc');
  const [muted, setMuted] = useState<boolean>(sounds.getMuted());
  const [soundFeedbackActive, setSoundFeedbackActive] = useState<boolean>(false);

  // Keyboard shortcut: ESC to return to menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBackToMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBackToMenu]);

  const toggleSound = () => {
    const next = !muted;
    sounds.setMuted(next);
    setMuted(next);
  };

  const allWeapons = useMemo(() => Object.values(WeaponDatabase), []);

  // Filter & sort
  const filteredWeapons = useMemo(() => {
    return allWeapons
      .filter((w) => {
        if (activeCategory !== 'all' && w.category !== activeCategory) {
          return false;
        }
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchName = w.name.toLowerCase().includes(q);
          const matchType = w.type.toLowerCase().includes(q);
          const matchFeatures = w.features.some((f) => f.toLowerCase().includes(q));
          const matchDesc = w.description.toLowerCase().includes(q);
          return matchName || matchType || matchFeatures || matchDesc;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'damage-desc') return b.damage - a.damage;
        if (sortBy === 'damage-asc') return a.damage - b.damage;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'magSize') return b.magSize - a.magSize;
        if (sortBy === 'cooldown') return a.cooldownTicks - b.cooldownTicks;
        return 0;
      });
  }, [allWeapons, activeCategory, searchQuery, sortBy]);

  const handleSelectWeapon = (w: WeaponData) => {
    setSelectedWeapon(w);
    sounds.playPickup();
  };

  const handleTestSound = () => {
    sounds.resumeAudio();
    sounds.playWeaponSound(selectedWeapon.soundType);
    setSoundFeedbackActive(true);
    setTimeout(() => setSoundFeedbackActive(false), 200);
  };

  // Calculate damage tier color
  const getDamageBadgeStyle = (dmg: number) => {
    if (dmg >= 40) {
      return 'bg-purple-950/80 text-purple-300 border-purple-600/80 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
    }
    if (dmg >= 20) {
      return 'bg-rose-950/80 text-rose-300 border-rose-600/80 shadow-[0_0_10px_rgba(244,63,94,0.3)]';
    }
    if (dmg >= 12) {
      return 'bg-amber-950/80 text-amber-300 border-amber-600/80';
    }
    return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80';
  };

  // Approximate RPM based on 60 ticks/second
  const rpm = Math.round((60 / Math.max(1, selectedWeapon.cooldownTicks)) * 60);

  return (
    <div className="relative w-screen h-screen flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden select-none font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-950/30 via-neutral-950 to-neutral-950 -z-10 pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="w-full bg-neutral-900/95 border-b border-neutral-800 px-6 py-3 flex items-center justify-between z-20 backdrop-blur shrink-0 shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg border border-neutral-700 font-bold text-xs transition shadow"
            title="Volver al Menú (ESC)"
          >
            <ArrowLeft className="w-4 h-4 text-sky-400" />
            <span>Volver al Menú</span>
            <span className="text-[10px] text-neutral-400 font-mono-code bg-neutral-900 px-1.5 py-0.5 rounded">ESC</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-inner">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wide bg-gradient-to-r from-sky-400 via-cyan-200 to-amber-300 bg-clip-text text-transparent">
                ARSENAL TÁCTICO & BASE DE DATOS
              </h1>
              <p className="text-[11px] text-neutral-400 font-mono-code">
                Superfighters Deluxe / superN — {allWeapons.length} Armas Catalogadas
              </p>
            </div>
          </div>
        </div>

        {/* Global Sound & Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-neutral-950 rounded border border-neutral-800 text-xs font-mono-code text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Física de combate a 60Hz</span>
          </div>

          <button
            onClick={toggleSound}
            className="p-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-neutral-300 transition"
            title={muted ? 'Activar sonido' : 'Silenciar'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Filter and Search Bar Strip */}
      <div className="w-full bg-neutral-900/80 border-b border-neutral-800/80 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 backdrop-blur z-10">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: `Todas (${allWeapons.length})` },
            { id: 'Firearm', label: `Armas de Fuego (${allWeapons.filter((w) => w.category === 'Firearm').length})` },
            { id: 'Melee', label: `Melee & Blancas (${allWeapons.filter((w) => w.category === 'Melee').length})` },
            { id: 'Throwable', label: `Arrojadizas (${allWeapons.filter((w) => w.category === 'Throwable').length})` },
            { id: 'Powerup', label: `Especiales (${allWeapons.filter((w) => w.category === 'Powerup').length})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sounds.playPickup();
                setActiveCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap border ${
                activeCategory === cat.id
                  ? 'bg-sky-500 text-neutral-950 border-sky-400 shadow-[0_0_12px_rgba(14,165,233,0.3)]'
                  : 'bg-neutral-950/70 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar arma, efecto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-sky-500 w-44 md:w-56 font-mono-code transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-neutral-500 hover:text-neutral-300 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono-code">
            <span className="hidden sm:inline">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 transition cursor-pointer"
            >
              <option value="damage-desc">Mayor Daño</option>
              <option value="damage-asc">Menor Daño</option>
              <option value="cooldown">Mayor Cadencia (RPM)</option>
              <option value="name">Nombre A-Z</option>
              <option value="magSize">Capacidad Cargador</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area: Split View */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Spotlight Panel: Selected Weapon Deep Dive (4 cols on large screens) */}
        <aside className="lg:col-span-5 xl:col-span-4 bg-neutral-900/90 border-r border-neutral-800 p-4 lg:p-5 flex flex-col justify-between overflow-y-auto backdrop-blur shadow-2xl">
          <div className="space-y-4">
            {/* Category & Status Banner */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-code uppercase font-bold tracking-wider bg-neutral-950 border border-neutral-800 text-neutral-300">
                {selectedWeapon.category}
              </span>
              <span className="text-[11px] font-mono-code text-neutral-400 flex items-center gap-1">
                <Crosshair className="w-3.5 h-3.5 text-sky-400" />
                Alcance: <strong className="text-neutral-200">{selectedWeapon.range}</strong>
              </span>
            </div>

            {/* Weapon Showcase Frame with Scaled Pixel Art */}
            <div className="relative w-full h-36 bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900/90 border border-neutral-800 rounded-2xl flex items-center justify-center p-4 overflow-hidden shadow-inner group">
              {/* Radial glow background in weapon accent color */}
              <div
                className="absolute w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-300"
                style={{ backgroundColor: selectedWeapon.color }}
              />

              {/* Grid pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:16px_16px] opacity-20 pointer-events-none" />

              {/* High-res / Pixelated weapon graphic */}
              {selectedWeapon.iconUrl ? (
                <img
                  src={selectedWeapon.iconUrl}
                  alt={selectedWeapon.name}
                  className={`h-20 max-w-[85%] object-contain [image-rendering:pixelated] drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] transition-transform duration-200 ${
                    soundFeedbackActive ? 'scale-110' : 'group-hover:scale-105'
                  }`}
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-xl font-bold"
                  style={{ backgroundColor: selectedWeapon.color }}
                >
                  ⚡
                </div>
              )}

              {/* Corner Watermark */}
              <span className="absolute bottom-2 right-3 text-[10px] font-mono-code text-neutral-600">
                {selectedWeapon.type}
              </span>
            </div>

            {/* Weapon Title and Lore */}
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-2xl font-black text-white tracking-tight">{selectedWeapon.name}</h2>
              </div>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{selectedWeapon.description}</p>
            </div>

            {/* Prominent Damage & Combat Metrics */}
            <div className="p-3.5 bg-neutral-950/80 rounded-xl border border-neutral-800/80 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono-code uppercase text-neutral-400 block font-semibold">
                      Daño que inflige
                    </span>
                    <span className="text-2xl font-black font-mono-code text-rose-400 tracking-tight">
                      {selectedWeapon.damage}{' '}
                      <span className="text-xs font-normal text-neutral-400">
                        {selectedWeapon.pelletCount ? `(x${selectedWeapon.pelletCount} = ${selectedWeapon.damage * selectedWeapon.pelletCount} max)` : 'HP / impacto'}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-neutral-500 font-mono-code block">Letalidad (vs 80 HP)</span>
                  <span className="text-xs font-bold text-amber-400 font-mono-code">
                    {selectedWeapon.damage >= 40
                      ? '1-2 impactos mortales'
                      : selectedWeapon.damage >= 20
                      ? '3-4 impactos mortales'
                      : selectedWeapon.damage >= 10
                      ? '5-8 impactos continuos'
                      : 'Rociado / Combo continuo'}
                  </span>
                </div>
              </div>

              {/* Visual Damage Gauge Bar */}
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500"
                  style={{ width: `${Math.min(100, (selectedWeapon.damage / 60) * 100)}%` }}
                />
              </div>

              {/* Combat Specs Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800/80 text-xs">
                <div className="p-2 bg-neutral-900/70 rounded-lg border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 font-mono-code block">Cadencia de Disparo</span>
                  <span className="font-bold text-neutral-200 font-mono-code">
                    {selectedWeapon.magSize === -1 ? `${Math.round(60 / selectedWeapon.cooldownTicks)} golpes/s` : `${rpm} RPM`}
                  </span>
                </div>

                <div className="p-2 bg-neutral-900/70 rounded-lg border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 font-mono-code block">Capacidad de Munición</span>
                  <span className="font-bold text-neutral-200 font-mono-code">
                    {selectedWeapon.magSize === -1 ? 'Infinito (Melee)' : `${selectedWeapon.magSize} Cartuchos`}
                  </span>
                </div>

                <div className="p-2 bg-neutral-900/70 rounded-lg border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 font-mono-code block">Velocidad Proyectil</span>
                  <span className="font-bold text-neutral-200 font-mono-code">
                    {selectedWeapon.projectileSpeed > 0 ? `${selectedWeapon.projectileSpeed} px/s` : 'Contacto Físico'}
                  </span>
                </div>

                <div className="p-2 bg-neutral-900/70 rounded-lg border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 font-mono-code block">Dispersión / Precisión</span>
                  <span className="font-bold text-neutral-200 font-mono-code">
                    {selectedWeapon.accuracyDeg === 0 ? 'Precisión Directa' : `±${selectedWeapon.accuracyDeg}°`}
                  </span>
                </div>
              </div>
            </div>

            {/* Special Traits Badges */}
            {selectedWeapon.features && selectedWeapon.features.length > 0 && (
              <div>
                <span className="text-[10px] font-mono-code uppercase text-neutral-400 font-semibold block mb-1.5">
                  Características Especiales
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedWeapon.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/60 text-sky-300 text-[11px] font-mono-code flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-sky-400" />
                      {feat}
                    </span>
                  ))}
                  {selectedWeapon.explosionRadius ? (
                    <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300 text-[11px] font-mono-code flex items-center gap-1">
                      <Bomb className="w-3 h-3 text-amber-400" />
                      Radio Explosivo {selectedWeapon.explosionRadius}px
                    </span>
                  ) : null}
                  {selectedWeapon.onFireDuration ? (
                    <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/60 text-rose-300 text-[11px] font-mono-code flex items-center gap-1">
                      <Flame className="w-3 h-3 text-rose-400" />
                      Provoca Llamas Activas
                    </span>
                  ) : null}
                  {selectedWeapon.hasLaserSight ? (
                    <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/60 text-purple-300 text-[11px] font-mono-code flex items-center gap-1">
                      <Target className="w-3 h-3 text-purple-400" />
                      Mira Láser Visible
                    </span>
                  ) : null}
                </div>
              </div>
            )}

            {/* Tactical Combat Tip */}
            <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl text-xs space-y-1">
              <span className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Consejo de Combate en la Arena:
              </span>
              <p className="text-neutral-300 text-[11px] leading-relaxed">{selectedWeapon.tacticalTip}</p>
            </div>
          </div>

          {/* Action Buttons: Sound test & Equip */}
          <div className="pt-4 border-t border-neutral-800 space-y-2">
            <button
              onClick={handleTestSound}
              className={`w-full py-2.5 rounded-xl border text-xs font-bold font-mono-code flex items-center justify-center gap-2 transition ${
                soundFeedbackActive
                  ? 'bg-amber-400 text-neutral-950 border-amber-300 scale-[0.98]'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border-neutral-700'
              }`}
            >
              <Volume2 className="w-4 h-4 text-sky-400" />
              <span>Escuchar Sonido de Disparo / Impacto</span>
            </button>

            <button
              onClick={onBackToMenu}
              className="w-full py-3 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 hover:from-sky-400 hover:to-emerald-300 text-neutral-950 font-black text-xs tracking-wider uppercase rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.3)] transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-neutral-950" />
              <span>Volver al Menú Principal</span>
            </button>
            <p className="text-[10px] text-neutral-400 text-center font-mono-code pt-1">
              Los combatientes inician desarmados; recoge las armas en las plataformas para usarlas.
            </p>
          </div>
        </aside>

        {/* Right Gallery: All Weapons on Screen Grid (7 cols on large screens) */}
        <main className="lg:col-span-7 xl:col-span-8 bg-neutral-950 p-4 lg:p-5 overflow-y-auto">
          {/* Gallery Info Bar */}
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-mono-code text-neutral-400">
              Mostrando <strong className="text-neutral-200">{filteredWeapons.length}</strong> armas de{' '}
              <strong className="text-neutral-200">{allWeapons.length}</strong>
            </span>
            <span className="text-[11px] text-neutral-500 font-mono-code">
              Haz clic en cualquier arma para inspeccionar sus métricas completas
            </span>
          </div>

          {/* Weapons Grid */}
          {filteredWeapons.length === 0 ? (
            <div className="w-full h-64 flex flex-col items-center justify-center text-center p-6 bg-neutral-900/40 rounded-xl border border-neutral-800">
              <Search className="w-8 h-8 text-neutral-600 mb-2" />
              <p className="text-sm font-bold text-neutral-300">No se encontraron armas</p>
              <p className="text-xs text-neutral-500 mt-1">Prueba con otro término de búsqueda o cambia la categoría.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="mt-3 px-3 py-1 bg-neutral-800 text-xs text-sky-400 rounded border border-neutral-700"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {filteredWeapons.map((weapon) => {
                const isSelected = selectedWeapon.type === weapon.type;
                const damageStyle = getDamageBadgeStyle(weapon.damage);

                return (
                  <div
                    key={weapon.type}
                    onClick={() => handleSelectWeapon(weapon)}
                    className={`relative p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-neutral-900 border-sky-400 ring-2 ring-sky-500/40 shadow-[0_0_18px_rgba(14,165,233,0.3)] -translate-y-0.5'
                        : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Top row: Category pill & Ammo */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[9px] uppercase font-mono-code font-bold px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-400">
                        {weapon.category}
                      </span>
                      <span className="text-[10px] font-mono-code text-neutral-400">
                        {weapon.magSize === -1 ? 'Melee' : `${weapon.magSize}b`}
                      </span>
                    </div>

                    {/* Weapon Pixel Art Preview */}
                    <div className="w-full h-16 bg-neutral-950/80 rounded-lg border border-neutral-800/80 flex items-center justify-center p-2 mb-2 group-hover:border-neutral-700 transition overflow-hidden">
                      {weapon.iconUrl ? (
                        <img
                          src={weapon.iconUrl}
                          alt={weapon.name}
                          className="max-h-full max-w-full object-contain [image-rendering:pixelated] group-hover:scale-110 transition duration-150"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: weapon.color }} />
                      )}
                    </div>

                    {/* Weapon Title */}
                    <div className="min-w-0 mb-2">
                      <h3
                        className={`text-xs font-bold truncate transition ${
                          isSelected ? 'text-sky-300' : 'text-neutral-100 group-hover:text-white'
                        }`}
                        title={weapon.name}
                      >
                        {weapon.name}
                      </h3>
                      <span className="text-[10px] text-neutral-400 font-mono-code block truncate">
                        {weapon.range}
                      </span>
                    </div>

                    {/* Bottom metric badges: Prominent Damage display */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                      <div className={`px-2 py-0.5 rounded text-[11px] font-mono-code font-bold border ${damageStyle}`}>
                        Daño: {weapon.damage}
                      </div>

                      {/* Icon indicator for special property */}
                      <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                        {weapon.explosionRadius ? (
                          <span title="Explosión">
                            <Bomb className="w-3.5 h-3.5 text-amber-400" />
                          </span>
                        ) : weapon.onFireDuration ? (
                          <span title="Prende en Llamas">
                            <Flame className="w-3.5 h-3.5 text-rose-400" />
                          </span>
                        ) : weapon.hasLaserSight ? (
                          <span title="Mira Láser">
                            <Target className="w-3.5 h-3.5 text-purple-400" />
                          </span>
                        ) : weapon.pelletCount ? (
                          <span className="text-[10px] text-rose-400 font-mono-code font-bold">x{weapon.pelletCount}</span>
                        ) : null}
                      </div>
                    </div>

                    {/* Active Selection Glow Ring */}
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
