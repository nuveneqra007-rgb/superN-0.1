// =============================================================
// WeaponFireSystem.ts — Motor unificado de disparo y balística
// Centraliza generación de proyectiles (balas, perdigones,
// cohetes de Bazooka, granadas de lanzador, llamas, láser y flechas)
// y dispara el perfil sonoro correspondiente al arma.
// =============================================================

import { GrenadeType } from './GrenadeSystem';
import { sounds } from './SoundEffects';
import {
  WeaponBallisticType,
  WeaponType,
  getWeapon,
  getWeaponBallisticType,
  getWeaponSoundProfile,
} from './WeaponData';

export interface FiredProjectileSpec {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  onFireDuration: number;
  explosionRadius: number;
  shooterId: number;
  weaponType: WeaponType;
  pelletCount: number;
  lifeTicks: number;
  maxLifeTicks: number;
  color: string;
  ballisticType?: WeaponBallisticType;
  gravity?: number;
  isRocket?: boolean;
  isLaser?: boolean;
  isFlame?: boolean;
  isArrow?: boolean;
  isGrenade?: boolean;
  isLauncherRound?: boolean;
  grenadeType?: GrenadeType;
  rotation?: number;
  rotationSpeed?: number;
}

export interface FireWeaponParams {
  weaponType: WeaponType;
  shooterId: number;
  muzzleX: number;
  muzzleY: number;
  dir: 1 | -1;
  damageMultiplier: number;
  nextEntityId: () => number;
  bulletColor?: string;
}

export interface FireWeaponResult {
  projectiles: FiredProjectileSpec[];
  ballisticType: WeaponBallisticType;
  recoilForce: number;
  screenShake: number;
  sparkColor: string;
  sparkCount: number;
}

/**
 * Crea los proyectiles y dispara el sonido correcto para cualquier WeaponType.
 */
export function fireWeaponProjectiles(params: FireWeaponParams): FireWeaponResult {
  const {
    weaponType,
    shooterId,
    muzzleX,
    muzzleY,
    dir,
    damageMultiplier,
    nextEntityId,
    bulletColor,
  } = params;

  const wpn = getWeapon(weaponType);
  const ballisticType = getWeaponBallisticType(weaponType);
  const soundProfile = getWeaponSoundProfile(weaponType);

  sounds.playWeaponSound(soundProfile);

  const projectiles: FiredProjectileSpec[] = [];
  const totalDamage = (wpn.damage || 15) * damageMultiplier;

  if (ballisticType === 'rocket') {
    const speed = 460;
    const rocketDamage = Math.max(65, wpn.damage || 65) * damageMultiplier;
    projectiles.push({
      id: nextEntityId(),
      x: muzzleX,
      y: muzzleY,
      vx: dir * speed,
      vy: 0,
      damage: rocketDamage,
      onFireDuration: wpn.onFireDuration || 120,
      explosionRadius: Math.max(110, wpn.explosionRadius || 110),
      shooterId,
      weaponType,
      pelletCount: 1,
      lifeTicks: 0,
      maxLifeTicks: 130,
      color: '#f97316',
      ballisticType,
      isRocket: true,
      rotation: dir > 0 ? 0 : Math.PI,
    });

    return {
      projectiles,
      ballisticType,
      recoilForce: 115,
      screenShake: 9,
      sparkColor: '#fb923c',
      sparkCount: 14,
    };
  }

  if (ballisticType === 'grenade_launcher') {
    const speed = wpn.projectileSpeed || 540;
    projectiles.push({
      id: nextEntityId(),
      x: muzzleX,
      y: muzzleY,
      vx: dir * speed,
      vy: -165,
      damage: totalDamage,
      onFireDuration: wpn.onFireDuration || 0,
      explosionRadius: wpn.explosionRadius || 95,
      shooterId,
      weaponType,
      pelletCount: 1,
      lifeTicks: 0,
      maxLifeTicks: 85,
      color: '#22c55e',
      ballisticType,
      isGrenade: true,
      isLauncherRound: true,
      grenadeType: GrenadeType.Frag,
      rotation: 0,
      rotationSpeed: dir * 0.22,
    });

    return {
      projectiles,
      ballisticType,
      recoilForce: 80,
      screenShake: 7,
      sparkColor: '#fde047',
      sparkCount: 8,
    };
  }

  if (ballisticType === 'flame_stream') {
    const flameCount = 3;
    const speed = wpn.projectileSpeed || 360;
    for (let i = 0; i < flameCount; i++) {
      const spread = (Math.random() - 0.5) * 0.34;
      const spd = speed * (0.85 + Math.random() * 0.3);
      projectiles.push({
        id: nextEntityId(),
        x: muzzleX,
        y: muzzleY + (Math.random() - 0.5) * 4,
        vx: dir * spd * Math.cos(spread),
        vy: spd * Math.sin(spread) - 25,
        damage: totalDamage / flameCount,
        onFireDuration: wpn.onFireDuration || 160,
        explosionRadius: 0,
        shooterId,
        weaponType,
        pelletCount: flameCount,
        lifeTicks: 0,
        maxLifeTicks: 18,
        color: i % 2 === 0 ? '#fb923c' : '#fde047',
        ballisticType,
        isFlame: true,
      });
    }

    return {
      projectiles,
      ballisticType,
      recoilForce: 12,
      screenShake: 2,
      sparkColor: '#fb923c',
      sparkCount: 4,
    };
  }

  if (ballisticType === 'laser_beam') {
    const speed = wpn.projectileSpeed || 1550;
    projectiles.push({
      id: nextEntityId(),
      x: muzzleX,
      y: muzzleY,
      vx: dir * speed,
      vy: 0,
      damage: totalDamage,
      onFireDuration: wpn.onFireDuration || 60,
      explosionRadius: 0,
      shooterId,
      weaponType,
      pelletCount: 1,
      lifeTicks: 0,
      maxLifeTicks: 35,
      color: '#22d3ee',
      ballisticType,
      isLaser: true,
    });

    return {
      projectiles,
      ballisticType,
      recoilForce: 20,
      screenShake: 4,
      sparkColor: '#67e8f9',
      sparkCount: 8,
    };
  }

  if (ballisticType === 'arrow') {
    const speed = wpn.projectileSpeed || 680;
    projectiles.push({
      id: nextEntityId(),
      x: muzzleX,
      y: muzzleY,
      vx: dir * speed,
      vy: -60,
      damage: totalDamage,
      onFireDuration: 0,
      explosionRadius: 0,
      shooterId,
      weaponType,
      pelletCount: 1,
      lifeTicks: 0,
      maxLifeTicks: 95,
      color: '#fde68a',
      ballisticType,
      gravity: 340,
      isArrow: true,
    });

    return {
      projectiles,
      ballisticType,
      recoilForce: 10,
      screenShake: 1,
      sparkColor: '#fef3c7',
      sparkCount: 0,
    };
  }

  // Escopetas: abanico real de múltiples perdigones y corto alcance
  if (ballisticType === 'pellet_spread') {
    const count = Math.max(4, wpn.pelletCount || 5);
    const isSawedOff = weaponType === WeaponType.SawedOff;
    const isDark = weaponType === WeaponType.DarkShotgun;
    const spreadDeg = isSawedOff ? 24 : isDark ? 18 : 16;
    const spreadRad = (spreadDeg * Math.PI) / 180;
    const maxLife = isSawedOff ? 18 : 21;
    const baseSpeed = wpn.projectileSpeed || 680;
    const pelletDamage = (isSawedOff ? 9 : isDark ? 10 : 11) * damageMultiplier;

    for (let i = 0; i < count; i++) {
      const t = count > 1 ? i / (count - 1) - 0.5 : 0;
      const jitter = ((Math.random() - 0.5) * 3 * Math.PI) / 180;
      const angle = t * spreadRad + jitter;
      const spd = baseSpeed * (0.92 + Math.random() * 0.16);

      projectiles.push({
        id: nextEntityId(),
        x: muzzleX,
        y: muzzleY,
        vx: dir * spd * Math.cos(angle),
        vy: spd * Math.sin(angle),
        damage: pelletDamage,
        onFireDuration: 0,
        explosionRadius: 0,
        shooterId,
        weaponType,
        pelletCount: count,
        lifeTicks: 0,
        maxLifeTicks: maxLife,
        color: '#fbbf24',
        ballisticType,
      });
    }

    return {
      projectiles,
      ballisticType,
      recoilForce: isSawedOff ? 85 : 75,
      screenShake: 7,
      sparkColor: '#fde047',
      sparkCount: 12,
    };
  }

  // Balas convencionales, silenciadas y francotirador
  const count = wpn.pelletCount || 1;
  const baseSpeed =
    ballisticType === 'sniper_pierce'
      ? wpn.projectileSpeed || 1500
      : wpn.projectileSpeed || 900;
  const maxLife = 65;
  const projColor =
    ballisticType === 'silenced_bullet'
      ? '#94a3b8'
      : ballisticType === 'sniper_pierce'
      ? '#fef08a'
      : bulletColor || '#facc15';

  for (let i = 0; i < count; i++) {
    const spreadAngle = ((Math.random() - 0.5) * ((wpn.accuracyDeg || 3) * Math.PI) / 180) / 2;
    projectiles.push({
      id: nextEntityId(),
      x: muzzleX,
      y: muzzleY,
      vx: dir * baseSpeed * Math.cos(spreadAngle),
      vy: baseSpeed * Math.sin(spreadAngle),
      damage: totalDamage / count,
      onFireDuration: wpn.onFireDuration || 0,
      explosionRadius: wpn.explosionRadius || 0,
      shooterId,
      weaponType,
      pelletCount: count,
      lifeTicks: 0,
      maxLifeTicks: maxLife,
      color: projColor,
      ballisticType,
    });
  }

  const recoilForce =
    ballisticType === 'sniper_pierce'
      ? 95
      : soundProfile === 'magnum'
      ? 60
      : soundProfile === 'rifle'
      ? 45
      : 25;

  const screenShake = Math.min(10, Math.max(2, (wpn.damage || 15) / 4));

  return {
    projectiles,
    ballisticType,
    recoilForce,
    screenShake,
    sparkColor: ballisticType === 'silenced_bullet' ? '#cbd5e1' : '#fde047',
    sparkCount: ballisticType === 'silenced_bullet' ? 3 : 9,
  };
}
