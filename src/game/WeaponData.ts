// =============================================================
// WeaponData.ts — Definición declarativa de las 13 armas
// Ground Truth: Weapons.as (AS3 original Superfighters)
// =============================================================

import { GameConstants } from './GameConstants';

export enum WeaponType {
  // Melee
  Fists = 'Fists',
  Machete = 'Machete',
  Axe = 'Axe',
  Sword = 'Sword',

  // Firearms
  Pistol = 'Pistol',
  Magnum = 'Magnum',
  Uzi = 'Uzi',
  Rifle = 'Rifle',
  Shotgun = 'Shotgun',
  Sniper = 'Sniper',
  Bazooka = 'Bazooka',
  Flamethrower = 'Flamethrower',

  // Throwables
  Grenade = 'Grenade',
  Molotov = 'Molotov',
}

export type WeaponCategory = 'Melee' | 'Firearm' | 'Throwable' | 'Powerup';

export interface WeaponData {
  type: WeaponType;
  name: string;
  category: WeaponCategory;
  damage: number;
  magSize: number; // -1 = infinito (melee)
  cooldownTicks: number;
  projectileSpeed: number;
  accuracyDeg: number;
  pelletCount?: number;
  explosionRadius?: number;
  hasLaserSight?: boolean;
  onFireDuration?: number;
  color: string;
}

export const WeaponDatabase: Record<WeaponType, WeaponData> = {
  [WeaponType.Fists]: {
    type: WeaponType.Fists,
    name: 'Puños',
    category: 'Melee',
    damage: 6,
    magSize: -1,
    cooldownTicks: GameConstants.FistsCooldownTicks,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#e2e8f0',
  },
  [WeaponType.Machete]: {
    type: WeaponType.Machete,
    name: 'Machete',
    category: 'Melee',
    damage: 8,
    magSize: -1,
    cooldownTicks: 12,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#94a3b8',
  },
  [WeaponType.Axe]: {
    type: WeaponType.Axe,
    name: 'Hacha',
    category: 'Melee',
    damage: 11,
    magSize: -1,
    cooldownTicks: 12,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#b45309',
  },
  [WeaponType.Sword]: {
    type: WeaponType.Sword,
    name: 'Espada',
    category: 'Melee',
    damage: 13,
    magSize: -1,
    cooldownTicks: 14,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#38bdf8',
  },

  // Firearms
  [WeaponType.Pistol]: {
    type: WeaponType.Pistol,
    name: 'Pistola',
    category: 'Firearm',
    damage: GameConstants.PistolDamage,
    magSize: GameConstants.PistolMag,
    cooldownTicks: GameConstants.PistolCooldown,
    projectileSpeed: GameConstants.PistolSpeed,
    accuracyDeg: GameConstants.PistolAccuracy,
    color: '#cbd5e1',
  },
  [WeaponType.Magnum]: {
    type: WeaponType.Magnum,
    name: 'Magnum .44',
    category: 'Firearm',
    damage: GameConstants.MagnumDamage,
    magSize: GameConstants.MagnumMag,
    cooldownTicks: GameConstants.MagnumCooldown,
    projectileSpeed: GameConstants.MagnumSpeed,
    accuracyDeg: GameConstants.MagnumAccuracy,
    color: '#f59e0b',
  },
  [WeaponType.Uzi]: {
    type: WeaponType.Uzi,
    name: 'Uzi Subfusil',
    category: 'Firearm',
    damage: GameConstants.UziDamage,
    magSize: GameConstants.UziMag,
    cooldownTicks: GameConstants.UziCooldown,
    projectileSpeed: GameConstants.UziSpeed,
    accuracyDeg: GameConstants.UziAccuracy,
    color: '#10b981',
  },
  [WeaponType.Rifle]: {
    type: WeaponType.Rifle,
    name: 'Rifle de Asalto',
    category: 'Firearm',
    damage: GameConstants.RifleDamage,
    magSize: GameConstants.RifleMag,
    cooldownTicks: GameConstants.RifleCooldown,
    projectileSpeed: GameConstants.RifleSpeed,
    accuracyDeg: GameConstants.RifleAccuracy,
    color: '#3b82f6',
  },
  [WeaponType.Shotgun]: {
    type: WeaponType.Shotgun,
    name: 'Escopeta',
    category: 'Firearm',
    damage: GameConstants.ShotgunDamagePerPellet,
    magSize: GameConstants.ShotgunShotsInMag,
    cooldownTicks: GameConstants.ShotgunCooldown,
    projectileSpeed: GameConstants.ShotgunSpeed,
    accuracyDeg: GameConstants.ShotgunSpread,
    pelletCount: GameConstants.ShotgunPellets,
    color: '#ef4444',
  },
  [WeaponType.Sniper]: {
    type: WeaponType.Sniper,
    name: 'Francotirador',
    category: 'Firearm',
    damage: GameConstants.SniperDamage,
    magSize: GameConstants.SniperMag,
    cooldownTicks: GameConstants.SniperCooldown,
    projectileSpeed: GameConstants.SniperSpeed,
    accuracyDeg: GameConstants.SniperAccuracy,
    hasLaserSight: true,
    color: '#a855f7',
  },
  [WeaponType.Bazooka]: {
    type: WeaponType.Bazooka,
    name: 'Bazuca',
    category: 'Firearm',
    damage: GameConstants.BazookaDamage,
    magSize: GameConstants.BazookaMag,
    cooldownTicks: GameConstants.BazookaCooldown,
    projectileSpeed: GameConstants.BazookaSpeed,
    accuracyDeg: 2.0,
    explosionRadius: GameConstants.BazookaExplosionRadius,
    color: '#f97316',
  },
  [WeaponType.Flamethrower]: {
    type: WeaponType.Flamethrower,
    name: 'Lanzallamas',
    category: 'Firearm',
    damage: GameConstants.FlameDmgPerTick,
    magSize: GameConstants.FlameMag,
    cooldownTicks: 2,
    projectileSpeed: GameConstants.FlameRange,
    accuracyDeg: GameConstants.FlameSpread,
    onFireDuration: GameConstants.OnFireDuration,
    color: '#f43f5e',
  },

  // Throwables
  [WeaponType.Grenade]: {
    type: WeaponType.Grenade,
    name: 'Granada',
    category: 'Throwable',
    damage: GameConstants.GrenadeDamage,
    magSize: GameConstants.GrenadeMag,
    cooldownTicks: 20,
    projectileSpeed: 400,
    accuracyDeg: 0,
    explosionRadius: GameConstants.GrenadeExplosionRadius,
    color: '#84cc16',
  },
  [WeaponType.Molotov]: {
    type: WeaponType.Molotov,
    name: 'Cóctel Molotov',
    category: 'Throwable',
    damage: GameConstants.MolotovDamage,
    magSize: GameConstants.MolotovMag,
    cooldownTicks: 20,
    projectileSpeed: 350,
    accuracyDeg: 0,
    onFireDuration: GameConstants.OnFireDuration,
    color: '#ea580c',
  },
};

export const SpawnableWeaponsList: WeaponType[] = [
  WeaponType.Pistol,
  WeaponType.Magnum,
  WeaponType.Uzi,
  WeaponType.Rifle,
  WeaponType.Shotgun,
  WeaponType.Sniper,
  WeaponType.Bazooka,
  WeaponType.Flamethrower,
  WeaponType.Grenade,
  WeaponType.Molotov,
  WeaponType.Axe,
  WeaponType.Sword,
  WeaponType.Machete,
];

export function getWeapon(type: WeaponType): WeaponData {
  return WeaponDatabase[type] || WeaponDatabase[WeaponType.Fists];
}
