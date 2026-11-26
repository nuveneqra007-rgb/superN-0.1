// =============================================================
// WeaponGripData.ts — Configuración de empuñadura y porte por arma
// Define el punto de agarre (grip), segundo agarre (foregrip),
// dimensiones proporcionales y ángulo natural en reposo.
// =============================================================

import { WeaponType } from './WeaponData';

export type CarryPose =
  | 'one_hand_blade'
  | 'one_hand_blunt'
  | 'two_hand_heavy'
  | 'pistol'
  | 'rifle'
  | 'throwable';

export interface WeaponGripConfig {
  carryPose: CarryPose;
  /** Coordenada X normalizada (0..1) del mango dentro del sprite del arma */
  gripX: number;
  /** Coordenada Y normalizada (0..1) del mango dentro del sprite del arma */
  gripY: number;
  /** Segundo punto de agarre (guardamanos/mango frontal) para armas a dos manos */
  foregripX?: number;
  foregripY?: number;
  /** Ancho de dibujado en pantalla (px) */
  drawW: number;
  /** Alto de dibujado en pantalla (px) */
  drawH: number;
  /** Ángulo natural en reposo (radianes) */
  idleAngle: number;
}

const DEFAULT_BY_POSE: Record<CarryPose, WeaponGripConfig> = {
  one_hand_blade: {
    carryPose: 'one_hand_blade',
    gripX: 0.22,
    gripY: 0.65,
    drawW: 28,
    drawH: 14,
    idleAngle: -0.35,
  },
  one_hand_blunt: {
    carryPose: 'one_hand_blunt',
    gripX: 0.2,
    gripY: 0.68,
    drawW: 28,
    drawH: 13,
    idleAngle: 0.35,
  },
  two_hand_heavy: {
    carryPose: 'two_hand_heavy',
    gripX: 0.22,
    gripY: 0.62,
    foregripX: 0.54,
    foregripY: 0.58,
    drawW: 38,
    drawH: 18,
    idleAngle: -0.2,
  },
  pistol: {
    carryPose: 'pistol',
    gripX: 0.26,
    gripY: 0.68,
    drawW: 21,
    drawH: 13,
    idleAngle: 0.08,
  },
  rifle: {
    carryPose: 'rifle',
    gripX: 0.26,
    gripY: 0.64,
    foregripX: 0.62,
    foregripY: 0.56,
    drawW: 38,
    drawH: 15,
    idleAngle: 0.05,
  },
  throwable: {
    carryPose: 'throwable',
    gripX: 0.5,
    gripY: 0.55,
    drawW: 15,
    drawH: 15,
    idleAngle: 0,
  },
};

const WEAPON_GRIP_OVERRIDES: Partial<Record<WeaponType, Partial<WeaponGripConfig>>> = {
  // ── Armas blancas de una mano ──
  [WeaponType.Knife]: {
    carryPose: 'one_hand_blade',
    gripX: 0.25,
    gripY: 0.62,
    drawW: 19,
    drawH: 10,
    idleAngle: 0.2,
  },
  [WeaponType.Machete]: {
    carryPose: 'one_hand_blade',
    gripX: 0.2,
    gripY: 0.65,
    drawW: 29,
    drawH: 13,
    idleAngle: -0.25,
  },
  [WeaponType.Katana]: {
    carryPose: 'one_hand_blade',
    gripX: 0.22,
    gripY: 0.68,
    drawW: 38,
    drawH: 13,
    idleAngle: -0.45,
  },
  [WeaponType.Sword]: {
    carryPose: 'one_hand_blade',
    gripX: 0.22,
    gripY: 0.64,
    drawW: 35,
    drawH: 14,
    idleAngle: -0.4,
  },

  // ── Contundentes de una mano ──
  [WeaponType.Bat]: {
    carryPose: 'one_hand_blunt',
    gripX: 0.18,
    gripY: 0.68,
    drawW: 31,
    drawH: 12,
    idleAngle: -0.55,
  },
  [WeaponType.Baton]: {
    carryPose: 'one_hand_blunt',
    gripX: 0.22,
    gripY: 0.65,
    drawW: 24,
    drawH: 11,
    idleAngle: 0.25,
  },
  [WeaponType.ShockBaton]: {
    carryPose: 'one_hand_blunt',
    gripX: 0.22,
    gripY: 0.65,
    drawW: 26,
    drawH: 12,
    idleAngle: 0.22,
  },
  [WeaponType.LeadPipe]: {
    carryPose: 'one_hand_blunt',
    gripX: 0.2,
    gripY: 0.65,
    drawW: 29,
    drawH: 12,
    idleAngle: 0.3,
  },
  [WeaponType.Pipe]: {
    carryPose: 'one_hand_blunt',
    gripX: 0.2,
    gripY: 0.65,
    drawW: 29,
    drawH: 12,
    idleAngle: 0.3,
  },
  [WeaponType.Bottle]: {
    carryPose: 'one_hand_blunt',
    gripX: 0.26,
    gripY: 0.6,
    drawW: 18,
    drawH: 11,
    idleAngle: -0.25,
  },
  [WeaponType.Chain]: {
    carryPose: 'one_hand_blunt',
    gripX: 0.24,
    gripY: 0.6,
    drawW: 28,
    drawH: 14,
    idleAngle: 0.45,
  },
  [WeaponType.Whip]: {
    carryPose: 'one_hand_blunt',
    gripX: 0.22,
    gripY: 0.62,
    drawW: 30,
    drawH: 14,
    idleAngle: 0.4,
  },
  [WeaponType.CueStick]: {
    carryPose: 'one_hand_blunt',
    gripX: 0.2,
    gripY: 0.65,
    drawW: 36,
    drawH: 10,
    idleAngle: -0.3,
  },
  [WeaponType.Teapot]: {
    carryPose: 'one_hand_blunt',
    gripX: 0.35,
    gripY: 0.55,
    drawW: 18,
    drawH: 15,
    idleAngle: 0,
  },
  [WeaponType.Pillow]: {
    carryPose: 'one_hand_blunt',
    gripX: 0.35,
    gripY: 0.55,
    drawW: 22,
    drawH: 16,
    idleAngle: 0.1,
  },

  // ── Pesadas a dos manos ──
  [WeaponType.Axe]: {
    carryPose: 'two_hand_heavy',
    gripX: 0.22,
    gripY: 0.65,
    foregripX: 0.54,
    foregripY: 0.58,
    drawW: 34,
    drawH: 17,
    idleAngle: -0.35,
  },
  [WeaponType.Hammer]: {
    carryPose: 'two_hand_heavy',
    gripX: 0.22,
    gripY: 0.65,
    foregripX: 0.54,
    foregripY: 0.58,
    drawW: 32,
    drawH: 17,
    idleAngle: -0.25,
  },
  [WeaponType.Chainsaw]: {
    carryPose: 'two_hand_heavy',
    gripX: 0.24,
    gripY: 0.58,
    foregripX: 0.55,
    foregripY: 0.48,
    drawW: 40,
    drawH: 18,
    idleAngle: 0.12,
  },
  [WeaponType.Chair]: {
    carryPose: 'two_hand_heavy',
    gripX: 0.35,
    gripY: 0.62,
    foregripX: 0.65,
    foregripY: 0.58,
    drawW: 28,
    drawH: 24,
    idleAngle: -0.1,
  },
  [WeaponType.Flagpole]: {
    carryPose: 'two_hand_heavy',
    gripX: 0.22,
    gripY: 0.65,
    foregripX: 0.52,
    foregripY: 0.6,
    drawW: 42,
    drawH: 16,
    idleAngle: -0.4,
  },

  // ── Pistolas y subfusiles cortos ──
  [WeaponType.Pistol]: { carryPose: 'pistol', drawW: 20, drawH: 12 },
  [WeaponType.Pistol45]: { carryPose: 'pistol', drawW: 22, drawH: 13 },
  [WeaponType.SilencedPistol]: { carryPose: 'pistol', gripX: 0.22, drawW: 25, drawH: 12 },
  [WeaponType.Magnum]: { carryPose: 'pistol', drawW: 24, drawH: 14 },
  [WeaponType.Revolver]: { carryPose: 'pistol', drawW: 23, drawH: 13 },
  [WeaponType.FlareGun]: { carryPose: 'pistol', drawW: 20, drawH: 13 },
  [WeaponType.MachinePistol]: { carryPose: 'pistol', drawW: 24, drawH: 14 },
  [WeaponType.Uzi]: { carryPose: 'pistol', gripX: 0.36, gripY: 0.68, drawW: 24, drawH: 15 },
  [WeaponType.SilencedUzi]: { carryPose: 'pistol', gripX: 0.32, gripY: 0.68, drawW: 28, drawH: 15 },

  // ── Rifles, escopetas y pesadas ──
  [WeaponType.TommyGun]: { carryPose: 'rifle', drawW: 36, drawH: 15 },
  [WeaponType.SMG]: { carryPose: 'rifle', drawW: 33, drawH: 15 },
  [WeaponType.MP50]: { carryPose: 'rifle', drawW: 34, drawH: 15 },
  [WeaponType.Rifle]: { carryPose: 'rifle', drawW: 38, drawH: 15 },
  [WeaponType.Assault]: { carryPose: 'rifle', drawW: 38, drawH: 16 },
  [WeaponType.Carbine]: { carryPose: 'rifle', drawW: 36, drawH: 15 },
  [WeaponType.M60]: { carryPose: 'rifle', gripX: 0.25, foregripX: 0.6, drawW: 44, drawH: 18, idleAngle: 0.08 },
  [WeaponType.Shotgun]: { carryPose: 'rifle', drawW: 38, drawH: 14 },
  [WeaponType.SawedOff]: { carryPose: 'rifle', gripX: 0.26, foregripX: 0.58, drawW: 29, drawH: 13 },
  [WeaponType.DarkShotgun]: { carryPose: 'rifle', drawW: 40, drawH: 15 },
  [WeaponType.Sniper]: { carryPose: 'rifle', gripX: 0.24, foregripX: 0.62, drawW: 46, drawH: 15 },
  [WeaponType.Bazooka]: { carryPose: 'rifle', gripX: 0.35, gripY: 0.65, foregripX: 0.64, foregripY: 0.6, drawW: 46, drawH: 18, idleAngle: -0.08 },
  [WeaponType.GLauncher]: { carryPose: 'rifle', drawW: 38, drawH: 17 },
  [WeaponType.Flamethrower]: { carryPose: 'rifle', drawW: 42, drawH: 17 },
  [WeaponType.Lazer]: { carryPose: 'rifle', drawW: 38, drawH: 15 },
  [WeaponType.Bow]: { carryPose: 'rifle', gripX: 0.48, gripY: 0.5, foregripX: 0.6, foregripY: 0.5, drawW: 24, drawH: 26, idleAngle: 0 },

  // ── Arrojadizas / desplegables ──
  [WeaponType.Grenade]: { carryPose: 'throwable', drawW: 14, drawH: 14 },
  [WeaponType.Molotov]: { carryPose: 'throwable', gripX: 0.48, gripY: 0.68, drawW: 16, drawH: 18, idleAngle: -0.15 },
  [WeaponType.C4]: { carryPose: 'throwable', drawW: 16, drawH: 14 },
  [WeaponType.Mine]: { carryPose: 'throwable', drawW: 16, drawH: 12 },
  [WeaponType.Baseball]: { carryPose: 'throwable', drawW: 13, drawH: 13 },
};

/**
 * Retorna la configuración de agarre y tamaño proporcional para cualquier WeaponType.
 */
export function getWeaponGripConfig(weaponType: WeaponType): WeaponGripConfig {
  const override = WEAPON_GRIP_OVERRIDES[weaponType];
  const pose: CarryPose = override?.carryPose || 'one_hand_blunt';
  const base = DEFAULT_BY_POSE[pose];
  return override ? { ...base, ...override } : base;
}
