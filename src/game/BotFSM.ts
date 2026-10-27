// =============================================================
// BotFSM.ts — Máquina de estados de la IA del bot y control
// Basado en BotExtended BotAI types + BotInfos.cs + BotController.cs
// =============================================================

import { BotAIType } from './BotData';
import { GameConstants } from './GameConstants';
import { PlayerState } from './PlayerState';
import { WeaponDatabase, WeaponType } from './WeaponData';

export enum BotAIState {
  Idle = 'Idle',
  Chase = 'Chase',
  Strafe = 'Strafe',
  Attack = 'Attack',
  Dodge = 'Dodge',
  Flee = 'Flee',
  Pickup = 'Pickup',
  Cover = 'Cover',
}

export interface BotFSMData {
  currentState: BotAIState;
  stateTicks: number;
  aiType: BotAIType;
  dodgeCooldown: number;
  strafeDirX: number;
  strafeTicks: number;
  jumpCooldown: number;
}

export function createBotFSMData(aiType: BotAIType): BotFSMData {
  return {
    currentState: BotAIState.Idle,
    stateTicks: 0,
    aiType,
    dodgeCooldown: 0,
    strafeDirX: 1,
    strafeTicks: 0,
    jumpCooldown: 0,
  };
}

export interface BotInput {
  moveX: number;
  jump: boolean;
  crouch: boolean;
  melee: boolean;
  fire: boolean;
}

export const BotAI = {
  evaluate(
    bot: PlayerState,
    ai: BotFSMData,
    target: PlayerState | null,
    projectileIncoming: boolean,
    nearestWeaponDist: number
  ): BotAIState {
    ai.stateTicks++;
    if (ai.dodgeCooldown > 0) ai.dodgeCooldown--;

    if (!target || !target.isAlive) {
      return BotAIState.Idle;
    }

    const dist = Math.sqrt(
      Math.pow(target.x - bot.x, 2) + Math.pow(target.y - bot.y, 2)
    );

    // 1. Dodge: Bots con IA reactiva
    const canDodge =
      ai.aiType === BotAIType.Hard ||
      ai.aiType === BotAIType.Soldier ||
      ai.aiType === BotAIType.AssassinMelee ||
      ai.aiType === BotAIType.AssassinRange ||
      ai.aiType === BotAIType.Cowboy;

    if (projectileIncoming && ai.dodgeCooldown <= 0 && canDodge) {
      ai.dodgeCooldown = 40;
      return BotAIState.Dodge;
    }

    // 2. Flee: baja salud sin arma de fuego
    if (
      bot.health <= GameConstants.AI_FleeHPThreshold &&
      bot.equippedWeapon === WeaponType.Fists
    ) {
      return BotAIState.Flee;
    }

    // 3. Recoger arma cercana
    if (
      bot.equippedWeapon === WeaponType.Fists &&
      nearestWeaponDist <= GameConstants.AI_WpnSearchInSight
    ) {
      return BotAIState.Pickup;
    }

    // 4. Melee si está a rango cuerpo a cuerpo
    if (dist <= GameConstants.AI_MeleeRange) {
      return BotAIState.Attack;
    }

    // 5. Cobertura: poca vida con bala entrante
    if (
      (ai.aiType === BotAIType.Hard || ai.aiType === BotAIType.Soldier) &&
      bot.health < 50 &&
      projectileIncoming
    ) {
      return BotAIState.Cover;
    }

    // 6. Strafe y disparo con armas de fuego
    const isFirearm =
      bot.equippedWeapon !== WeaponType.Fists &&
      WeaponDatabase[bot.equippedWeapon]?.category === 'Firearm';

    if (isFirearm && dist <= GameConstants.AI_DetectionRange) {
      return BotAIState.Strafe;
    }

    // 7. Chase
    if (dist <= GameConstants.AI_DetectionRange) {
      return BotAIState.Chase;
    }

    return BotAIState.Idle;
  },

  computeInput(
    bot: PlayerState,
    ai: BotFSMData,
    target: PlayerState | null,
    aiState: BotAIState,
    nearestWeaponPos: { x: number; y: number } | null
  ): BotInput {
    let moveX = 0;
    let jump = false;
    let crouch = false;
    let melee = false;
    let fire = false;

    if (ai.jumpCooldown > 0) ai.jumpCooldown--;

    const targetDist = target ? Math.abs(target.x - bot.x) : 9999;
    const targetYDiff = target ? target.y - bot.y : 0;

    switch (aiState) {
      case BotAIState.Idle:
        moveX = Math.sin(ai.stateTicks * 0.05) > 0 ? 0.3 : -0.3;
        break;

      case BotAIState.Chase:
        if (target) {
          moveX = target.x > bot.x ? 1 : -1;
        }
        if (bot.onGround && ai.jumpCooldown <= 0 && targetYDiff < -30) {
          jump = true;
          ai.jumpCooldown = 45;
        }
        break;

      case BotAIState.Attack:
        melee = true;
        if (targetDist > GameConstants.AI_MeleeRange * 0.5) {
          moveX = target && target.x > bot.x ? 1 : -1;
        }
        break;

      case BotAIState.Strafe:
        ai.strafeTicks++;
        if (ai.strafeTicks > 50) {
          ai.strafeDirX = -ai.strafeDirX;
          ai.strafeTicks = 0;
        }
        moveX = ai.strafeDirX * 0.6;

        // Disparo
        fire = bot.attackCooldown <= 0 && bot.ammo > 0;

        // Ajustar distancia si está muy cerca
        if (target && targetDist < 100) {
          moveX = bot.x > target.x ? 1 : -1;
        }
        break;

      case BotAIState.Dodge:
        if (bot.onGround && bot.stamina >= GameConstants.StaminaCostRoll) {
          crouch = true; // roll
          moveX = target && target.x > bot.x ? -1 : 1;
        } else if (bot.onGround && ai.jumpCooldown <= 0) {
          jump = true;
          ai.jumpCooldown = 30;
        }
        break;

      case BotAIState.Flee:
        if (target) {
          moveX = target.x > bot.x ? -1 : 1;
        }
        if (bot.onGround && ai.jumpCooldown <= 0 && targetYDiff < -20) {
          jump = true;
          ai.jumpCooldown = 40;
        }
        break;

      case BotAIState.Pickup:
        if (nearestWeaponPos) {
          moveX = nearestWeaponPos.x > bot.x ? 1 : -1;
          if (bot.onGround && nearestWeaponPos.y < bot.y - 20 && ai.jumpCooldown <= 0) {
            jump = true;
            ai.jumpCooldown = 30;
          }
          if (Math.abs(nearestWeaponPos.x - bot.x) < 20) {
            crouch = true;
          }
        }
        break;

      case BotAIState.Cover:
        crouch = true;
        moveX = 0;
        break;
    }

    return { moveX, jump, crouch, melee, fire };
  },
};
