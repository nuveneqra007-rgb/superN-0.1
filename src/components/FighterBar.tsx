// =============================================================
// FighterBar.tsx — Barra HUD de Luchadores con Inventario por Ranuras
// FASE F2: Estética Superfighters retro
// - Fondo negro con borde azul fino (#2563eb / border-blue-600)
// - Tarjeta por luchador: retrato, nombre, barra de vida y 4 ranuras
// - Ranura 1: Melee (puños por defecto)
// - Ranura 2: Handgun
// - Ranura 3: Primary (rifle/escopeta)
// - Ranura 4: Throwable (granadas/arrojadizos)
// - Modo compacto para bots cuando hay 4 o más luchadores
// =============================================================

import React from 'react';
import { WeaponType } from '../game/WeaponData';
import { GrenadeType } from '../game/GrenadeSystem';

export const SHOW_ENERGY_BAR = false;

export interface FighterSlotInfo {
  weaponType?: WeaponType | GrenadeType;
  iconUrl: string;
  ammo?: number;
  count?: number;
  isEmpty?: boolean;
}

export interface FighterBarData {
  id: number;
  name: string;
  color: string;
  portrait?: string;
  health: number;
  maxHealth: number;
  energy?: number;
  isAlive: boolean;
  score: number;
  activeSlot: 'melee' | 'handgun' | 'primary' | 'throwable';
  slots: {
    melee: FighterSlotInfo;
    handgun: FighterSlotInfo;
    primary: FighterSlotInfo;
    throwable: FighterSlotInfo;
  };
}

interface FighterBarProps {
  fighters: FighterBarData[];
}

export const FighterBar: React.FC<FighterBarProps> = ({ fighters }) => {
  if (!fighters || fighters.length === 0) return null;

  // Si hay más de 3 luchadores, los bots pasan a modo compacto para caber en la pantalla
  const isCompactMode = fighters.length >= 4;

  const renderSlotBox = (
    slotKey: 'melee' | 'handgun' | 'primary' | 'throwable',
    slotInfo: FighterSlotInfo,
    isActive: boolean,
    slotNumber: string
  ) => {
    const empty = slotInfo.isEmpty;
    const hasIcon = Boolean(slotInfo.iconUrl && !empty);

    let counterText: string | null = null;
    if (slotKey === 'handgun' || slotKey === 'primary') {
      if (!empty && slotInfo.ammo !== undefined && slotInfo.ammo >= 0) {
        counterText = slotInfo.ammo.toString().padStart(2, '0');
      }
    } else if (slotKey === 'throwable') {
      if (slotInfo.count !== undefined && slotInfo.count > 0) {
        counterText = slotInfo.count.toString().padStart(2, '0');
      }
    }

    return (
      <div
        key={slotKey}
        className={`relative flex flex-col items-center justify-between w-[32px] h-[34px] rounded-none transition-all ${
          empty
            ? 'bg-[#2b0808] border border-[#521313]'
            : 'bg-neutral-900 border border-neutral-600'
        } ${
          isActive
            ? 'border-yellow-400 ring-1 ring-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)] z-10'
            : ''
        }`}
        title={`Ranura ${slotNumber}: ${slotKey}`}
      >
        {/* Número de ranura sutil en la esquina superior izquierda */}
        <span className="absolute top-[1px] left-[2px] text-[7px] text-neutral-500 font-pixel leading-none pointer-events-none">
          {slotNumber}
        </span>

        {/* Icono del arma */}
        <div className="w-full h-[22px] flex items-center justify-center pt-1 overflow-hidden">
          {hasIcon ? (
            <img
              src={slotInfo.iconUrl}
              alt={slotKey}
              className="max-h-[18px] max-w-[26px] object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <div className="w-2.5 h-1 bg-red-900/40 rounded-none" />
          )}
        </div>

        {/* Contador inferior */}
        <div className="w-full text-center pb-[1px] bg-black/60 leading-none">
          <span
            className={`font-pixel text-[8px] font-bold ${
              counterText !== null ? (counterText === '00' ? 'text-red-400' : 'text-yellow-300') : 'text-transparent'
            }`}
          >
            {counterText ?? '--'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1240px] bg-black/95 border-2 border-blue-600 px-3 py-2 flex items-center justify-between gap-2.5 font-pixel shadow-[0_4px_20px_rgba(0,0,0,0.8)] overflow-x-auto select-none">
      {fighters.map((f, idx) => {
        const isPlayer = idx === 0;
        const useCompact = isCompactMode && !isPlayer;
        const hpPercent = Math.max(0, Math.min(100, (f.health / (f.maxHealth || 100)) * 100));
        const isLowHp = hpPercent <= 35;

        // Ranura activa actual para el modo compacto
        const activeSlotInfo = f.slots[f.activeSlot] || f.slots.melee;

        return (
          <div
            key={f.id}
            className={`flex items-center gap-2 px-2 py-1.5 border border-white/20 bg-neutral-950/80 transition-all flex-1 min-w-0 ${
              !f.isAlive ? 'opacity-35 grayscale border-red-900/40' : ''
            }`}
            style={{ maxWidth: useCompact ? '180px' : undefined }}
          >
            {/* Retrato */}
            <div
              className="relative w-9 h-9 shrink-0 border border-white bg-neutral-900 flex items-center justify-center overflow-hidden"
              style={{ borderColor: f.color }}
            >
              {f.portrait ? (
                <img
                  src={f.portrait}
                  alt={f.name}
                  className="w-full h-full object-cover scale-125 translate-y-1"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-xs font-bold font-pixel"
                  style={{ color: f.color }}
                >
                  {f.name.slice(0, 2)}
                </div>
              )}
              {/* Badge si está muerto */}
              {!f.isAlive && (
                <div className="absolute inset-0 bg-red-950/80 flex items-center justify-center text-[8px] text-red-400 font-bold font-pixel">
                  KO
                </div>
              )}
            </div>

            {/* Columna central: Nombre, barra de vida y slots */}
            <div className="flex flex-col justify-center gap-1 min-w-0 flex-1">
              {/* Cabecera: Nombre y Score */}
              <div className="flex items-center justify-between gap-1 leading-none">
                <span
                  className="text-[9px] font-bold truncate tracking-wider"
                  style={{ color: f.color }}
                  title={f.name}
                >
                  {f.name}
                </span>
                <span className="text-[8px] text-yellow-400 font-bold shrink-0">
                  ★{f.score}
                </span>
              </div>

              {/* Barra de Vida */}
              <div className="w-full h-2.5 bg-neutral-900 border border-white/60 overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-100 ${
                    isLowHp ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${hpPercent}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[7px] text-white/90 font-bold leading-none pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
                  {Math.round(f.health)}
                </span>
              </div>

              {/* Barra de energía (opcional) */}
              {SHOW_ENERGY_BAR && f.energy !== undefined && (
                <div className="w-full h-1 bg-neutral-900 border border-white/30 overflow-hidden">
                  <div
                    className="h-full bg-cyan-300 transition-all duration-75"
                    style={{ width: `${Math.max(0, Math.min(100, f.energy))}%` }}
                  />
                </div>
              )}

              {/* Ranuras de Armas */}
              {useCompact ? (
                /* Modo Compacto para Bots */
                <div className="flex items-center gap-1.5 pt-0.5">
                  <div
                    className="relative flex items-center justify-center w-7 h-6 bg-neutral-900 border border-yellow-400"
                    title={`Equipada: ${f.activeSlot}`}
                  >
                    {activeSlotInfo.iconUrl ? (
                      <img
                        src={activeSlotInfo.iconUrl}
                        alt="weapon"
                        className="max-h-4 max-w-5 object-contain"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <span className="text-[7px] text-neutral-400">P</span>
                    )}
                  </div>
                  <span className="text-[8px] text-yellow-300 font-pixel">
                    {activeSlotInfo.ammo !== undefined && activeSlotInfo.ammo > 0
                      ? `x${activeSlotInfo.ammo}`
                      : activeSlotInfo.count !== undefined && activeSlotInfo.count > 0
                      ? `x${activeSlotInfo.count}`
                      : ''}
                  </span>
                </div>
              ) : (
                /* Modo Completo (4 ranuras) */
                <div className="flex items-center gap-1 pt-0.5">
                  {renderSlotBox('melee', f.slots.melee, f.activeSlot === 'melee', '1')}
                  {renderSlotBox('handgun', f.slots.handgun, f.activeSlot === 'handgun', '2')}
                  {renderSlotBox('primary', f.slots.primary, f.activeSlot === 'primary', '3')}
                  {renderSlotBox('throwable', f.slots.throwable, f.activeSlot === 'throwable', '4')}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FighterBar;
