// =============================================================
// WeaponRenderer.ts — Renderizado unificado de arma empuñada
// Alinea la empuñadura (gripX, gripY) del arma con la mano del
// protagonista (Ninja, Gymrat, Santa) según su estado de animación.
// =============================================================

import { CharacterHandProfile, HandAnchor } from './CharacterData';
import { PlayerFSMState } from './PlayerState';
import { WeaponType } from './WeaponData';
import { getWeaponGripConfig } from './WeaponGripData';

export interface WeaponRenderPose {
  fsm: PlayerFSMState;
  animFrame: number;
  velocityY: number;
  onGround: boolean;
  isWalking: boolean;
  isRunning: boolean;
  isRolling: boolean;
  isCrouching: boolean;
  getUpTicks?: number;
}

/**
 * Resuelve la posición y ángulo de la mano principal según el perfil del personaje y su pose.
 */
export function resolveHandAnchor(
  profile: CharacterHandProfile,
  pose: WeaponRenderPose
): HandAnchor | null {
  if (pose.isRolling && profile.hideOnRoll) {
    return null;
  }

  if (pose.fsm === PlayerFSMState.KnockedDown) {
    return { x: 4, y: 14, angle: -Math.PI / 2 };
  }

  if (pose.fsm === PlayerFSMState.GetUp) {
    const remaining = Math.max(0, pose.getUpTicks || 0);
    const progress = Math.min(1, Math.max(0, 1 - remaining / 16));
    return {
      x: profile.idle.x * progress + 4 * (1 - progress),
      y: profile.idle.y * progress + 14 * (1 - progress),
      angle: (-Math.PI / 2) * (1 - progress),
    };
  }

  if (pose.isCrouching) {
    return profile.crouch;
  }

  if (!pose.onGround) {
    return pose.velocityY < -40 ? profile.jump : profile.fall;
  }

  if (pose.isRunning && profile.run.length > 0) {
    const idx = Math.abs(Math.floor(pose.animFrame / 4)) % profile.run.length;
    return profile.run[idx];
  }

  if (pose.isWalking && profile.walk.length > 0) {
    const idx = Math.abs(Math.floor(pose.animFrame / 4)) % profile.walk.length;
    return profile.walk[idx];
  }

  // Ligera respiración en idle para que el arma no se vea congelada
  const breathY = Math.sin(pose.animFrame * 0.08) * 0.6;
  return {
    x: profile.idle.x,
    y: profile.idle.y + breathY,
    angle: profile.idle.angle,
  };
}

/**
 * Dibuja el arma equipada anclada por su empuñadura a la mano del protagonista.
 */
export function renderEquippedWeaponIdle(
  ctx: CanvasRenderingContext2D,
  weaponImg: HTMLImageElement,
  weaponType: WeaponType,
  profile: CharacterHandProfile,
  pose: WeaponRenderPose
): void {
  const anchor = resolveHandAnchor(profile, pose);
  if (!anchor) return;

  const grip = getWeaponGripConfig(weaponType);
  const offsetX = -grip.gripX * grip.drawW;
  const offsetY = -grip.gripY * grip.drawH;

  ctx.save();
  ctx.translate(anchor.x, anchor.y);
  ctx.rotate(anchor.angle + grip.idleAngle);
  ctx.drawImage(weaponImg, offsetX, offsetY, grip.drawW, grip.drawH);
  ctx.restore();
}
