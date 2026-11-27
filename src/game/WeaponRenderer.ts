// =============================================================
// WeaponRenderer.ts — Renderizado unificado de arma empuñada
// Alinea la empuñadura (gripX, gripY) del arma con la mano del
// protagonista (Ninja, Gymrat, Santa) según su estado de animación.
// =============================================================

import { CharacterHandProfile, CharacterHandStyle, HandAnchor } from './CharacterData';
import { PlayerFSMState } from './PlayerState';
import { WeaponType } from './WeaponData';
import { CarryPose, getWeaponGripConfig } from './WeaponGripData';

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
  pickupAnimTicks?: number;
  isUsingWeapon?: boolean;
  isAiming?: boolean;
  weaponGuardTicks?: number;
  debugGrip?: boolean;
}

const POSE_OFFSET_BY_CARRY: Record<CarryPose, { x: number; y: number }> = {
  one_hand_blade: { x: 0, y: 0 },
  one_hand_blunt: { x: 0, y: 1 },
  two_hand_heavy: { x: -1, y: 1 },
  pistol: { x: 1, y: -1 },
  rifle: { x: -2, y: 2 },
  throwable: { x: -1, y: 2 },
};

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

  // Enfunde táctico: si no está usando, apuntando ni en guardia post-ataque,
  // el arma permanece guardada en el inventario (HUD) sin flotar en la mano.
  if (!pose.isUsingWeapon && !pose.isAiming && (pose.weaponGuardTicks || 0) <= 0) {
    return null;
  }

  // Al correr (sprint), el arma se enfunda/oculta; reaparece al detenerse, caminar lento o disparar
  if (pose.isRunning && !pose.isUsingWeapon && !pose.isAiming) {
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
 * Dibuja el puño/guante envolvente sobre el punto de agarre de la empuñadura.
 * Mantiene el estilo visual único de cada protagonista (Ninja, Gymrat, Santa).
 */
export function drawGripHand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  style: CharacterHandStyle,
  scale: number = 1
): void {
  const r = style.radius * scale;
  ctx.save();
  ctx.translate(x, y);

  // Muñequera / borde de guante detrás del puño
  ctx.fillStyle = style.cuffColor;
  ctx.fillRect(-r * 1.15, -r * 0.55, r * 0.75, r * 1.1);

  // Puño cerrado envolviendo el mango
  ctx.fillStyle = style.gloveColor;
  ctx.strokeStyle = style.borderColor;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Detalle sutil de nudillos superiores
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.beginPath();
  ctx.arc(r * 0.2, -r * 0.28, r * 0.42, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Dibuja un arma en una coordenada/ángulo específico usando su pivote real (gripX, gripY),
 * su escala proporcional y el puño envolvente propio del protagonista.
 * Reutilizable tanto en reposo/caminata como en frames de ataque o disparo.
 */
export function renderWeaponAtHand(
  ctx: CanvasRenderingContext2D,
  weaponImg: HTMLImageElement,
  weaponType: WeaponType,
  profile: CharacterHandProfile,
  handX: number,
  handY: number,
  angle: number,
  options?: {
    scale?: number;
    includeForegrip?: boolean;
    debugGrip?: boolean;
  }
): void {
  const grip = getWeaponGripConfig(weaponType);
  const offsetX = -grip.gripX * grip.drawW;
  const offsetY = -grip.gripY * grip.drawH;
  const scale = options?.scale ?? 1;

  ctx.save();
  ctx.translate(handX, handY);
  ctx.rotate(angle);
  if (scale !== 1) {
    ctx.scale(scale, scale);
  }

  // Capa 2: Sprite del arma alineado por su empuñadura
  ctx.drawImage(weaponImg, offsetX, offsetY, grip.drawW, grip.drawH);

  // Capa 3a: Mano principal envolviendo la empuñadura
  drawGripHand(ctx, 0, 0, profile.handStyle, 1);

  // Capa 3b: Mano de apoyo en rifles y armas pesadas a dos manos
  const showForegrip = options?.includeForegrip ?? true;
  if (showForegrip && grip.foregripX !== undefined && grip.foregripY !== undefined) {
    const fx = (grip.foregripX - grip.gripX) * grip.drawW;
    const fy = (grip.foregripY - grip.gripY) * grip.drawH;
    drawGripHand(ctx, fx, fy, profile.handStyle, 0.86);

    if (options?.debugGrip) {
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(fx - 1.5, fy - 1.5, 3, 3);
    }
  }

  if (options?.debugGrip) {
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(-1.5, -1.5, 3, 3);
  }

  ctx.restore();
}

/**
 * Dibuja el arma equipada anclada por su empuñadura a la mano del protagonista,
 * con puño envolvente, segunda mano en armas largas y feedback al recoger.
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
  const carryOffset = POSE_OFFSET_BY_CARRY[grip.carryPose];

  // Tween corto de 6 ticks al recoger o cambiar de arma
  const pickupT = Math.min(1, Math.max(0, (pose.pickupAnimTicks || 0) / 6));
  const pickupScale = 1 + 0.18 * pickupT;
  const pickupAngle = -0.32 * pickupT;

  renderWeaponAtHand(
    ctx,
    weaponImg,
    weaponType,
    profile,
    anchor.x + carryOffset.x,
    anchor.y + carryOffset.y,
    anchor.angle + grip.idleAngle + pickupAngle,
    {
      scale: pickupScale,
      includeForegrip: true,
      debugGrip: pose.debugGrip,
    }
  );
}
