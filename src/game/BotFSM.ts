// =============================================================
// BotFSM.ts — Máquina de estados de la IA del bot y control
// Basado en BotExtended BotAI types + BotInfos.cs + BotController.cs
// Actualizado con GDD v3 (Lote 8: IA que pelee como oponente humano)
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
  difficulty?: string;
  dodgeCooldown: number;
  strafeDirX: number;
  strafeTicks: number;
  jumpCooldown: number;
  pickupTicks: number;
  pickupCooldown: number;

  // Lote 8: Parámetros adaptativos por dificultad
  reactionTicks: number; // Ticks de retraso antes de reaccionar a una nueva amenaza
  aimError: number; // Desviación angular de disparo en radianes
  dodgeChance: number; // Probabilidad de esquiva (0.25 easy / 0.50 normal / 0.80 hard)
  comboPauseTicks: number; // Pausa táctica tras encadenar golpes (35 / 20 / 8 ticks)
  currentComboPause: number; // Contador activo de pausa tras combo
  pendingState: BotAIState | null; // Estado deseado mientras transcurre el tiempo de reacción
  pendingTimer: number; // Temporizador del tiempo de reacción
  movementPattern: 'advance' | 'circle' | 'wait'; // Alternancia de fintas y patrones
  movementPatternTicks: number; // Duración del patrón actual
}

export function createBotFSMData(aiType: BotAIType, difficulty?: string): BotFSMData {
  const diff = (difficulty || 'normal').toLowerCase();
  let reactionTicks = 18;
  let dodgeChance = 0.50;
  let aimError = 0.12;
  let comboPauseTicks = 20;

  if (diff === 'easy') {
    reactionTicks = 28;
    dodgeChance = 0.25;
    aimError = 0.26;
    comboPauseTicks = 35;
  } else if (diff === 'hard') {
    reactionTicks = 10;
    dodgeChance = 0.80;
    aimError = 0.03;
    comboPauseTicks = 8;
  }

  return {
    currentState: BotAIState.Idle,
    stateTicks: 0,
    aiType,
    difficulty: diff,
    dodgeCooldown: 0,
    strafeDirX: Math.random() < 0.5 ? 1 : -1,
    strafeTicks: 0,
    jumpCooldown: 0,
    pickupTicks: 0,
    pickupCooldown: 0,
    reactionTicks,
    aimError,
    dodgeChance,
    comboPauseTicks,
    currentComboPause: 0,
    pendingState: null,
    pendingTimer: 0,
    movementPattern: 'advance',
    movementPatternTicks: Math.floor(40 + Math.random() * 40),
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
    if (ai.pickupCooldown > 0) ai.pickupCooldown--;
    if (ai.currentComboPause > 0) ai.currentComboPause--;

    // Actualizar temporizador de fintas y patrones dinámicos de movimiento
    ai.movementPatternTicks--;
    if (ai.movementPatternTicks <= 0) {
      const roll = Math.random();
      if (roll < 0.55) {
        ai.movementPattern = 'advance';
        ai.movementPatternTicks = 30 + Math.floor(Math.random() * 45);
      } else if (roll < 0.82) {
        ai.movementPattern = 'circle';
        ai.strafeDirX = Math.random() < 0.5 ? 1 : -1;
        ai.movementPatternTicks = 25 + Math.floor(Math.random() * 35);
      } else {
        ai.movementPattern = 'wait';
        ai.movementPatternTicks = 15 + Math.floor(Math.random() * 20);
      }
    }

    if (!target || !target.isAlive) {
      ai.currentState = BotAIState.Idle;
      return BotAIState.Idle;
    }

    const dist = Math.sqrt(
      Math.pow(target.x - bot.x, 2) + Math.pow(target.y - bot.y, 2)
    );

    // Calcular estado deseado según condiciones del combate
    let desiredState = BotAIState.Chase;

    // 1. Melee si está a distancia cuerpo a cuerpo
    if (dist <= GameConstants.AI_MeleeRange) {
      ai.pickupTicks = 0;
      desiredState = BotAIState.Attack;
    }
    // 2. Esquiva basada en probabilidad según dificultad (Lote 8: sin listas rígidas)
    else if (projectileIncoming && ai.dodgeCooldown <= 0) {
      if (Math.random() < ai.dodgeChance) {
        ai.dodgeCooldown = Math.max(24, 46 - (ai.reactionTicks <= 10 ? 16 : 0));
        ai.currentState = BotAIState.Dodge;
        ai.pendingState = null;
        ai.pendingTimer = 0;
        return BotAIState.Dodge;
      } else {
        // Falló la probabilidad de esquiva: cooldown breve para no testear cada tick
        ai.dodgeCooldown = 15;
      }
    }
    // 3. Huida con baja salud sin arma de fuego
    else if (
      bot.health <= GameConstants.AI_FleeHPThreshold &&
      bot.equippedWeapon === WeaponType.Fists
    ) {
      desiredState = BotAIState.Flee;
    }
    // 4. Strafe a distancia si porta arma de fuego y tiene munición
    else if (
      bot.equippedWeapon !== WeaponType.Fists &&
      WeaponDatabase[bot.equippedWeapon]?.category === 'Firearm' &&
      bot.ammo > 0 &&
      dist <= GameConstants.AI_DetectionRange
    ) {
      desiredState = BotAIState.Strafe;
    }
    // 5. Recoger arma si está desarmado y no está en rango de peligro inminente
    else if (
      bot.equippedWeapon === WeaponType.Fists &&
      nearestWeaponDist <= GameConstants.AI_WpnSearchInSight &&
      ai.pickupCooldown <= 0 &&
      dist > 110
    ) {
      ai.pickupTicks++;
      if (ai.pickupTicks > 70) {
        ai.pickupCooldown = 180;
        ai.pickupTicks = 0;
        desiredState = BotAIState.Chase;
      } else {
        desiredState = BotAIState.Pickup;
      }
    }
    // 6. Cobertura: baja salud bajo amenaza de proyectil
    else if (bot.health < 45 && projectileIncoming) {
      desiredState = BotAIState.Cover;
    }
    // 7. Persecución normal
    else if (dist <= GameConstants.AI_DetectionRange) {
      desiredState = BotAIState.Chase;
    } else {
      desiredState = BotAIState.Idle;
    }

    // Retraso de tiempo de reacción humano (Lote 8: reactionTicks por dificultad)
    // El combate melee inminente o defensa directa reacciona con rapidez; cambios tácticos aplican delay
    if (desiredState === BotAIState.Attack && dist < 32) {
      ai.currentState = desiredState;
      ai.pendingState = null;
      ai.pendingTimer = 0;
    } else if (desiredState !== ai.currentState) {
      if (ai.pendingState !== desiredState) {
        ai.pendingState = desiredState;
        ai.pendingTimer = ai.reactionTicks;
      } else {
        ai.pendingTimer--;
        if (ai.pendingTimer <= 0) {
          ai.currentState = desiredState;
          ai.pendingState = null;
        }
      }
    } else {
      ai.pendingState = null;
      ai.pendingTimer = 0;
    }

    return ai.currentState;
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
        // Pausa táctica tras combo: retroceder un paso en vez de acosar sin tregua
        if (ai.currentComboPause > 0 && target) {
          moveX = target.x > bot.x ? -0.65 : 0.65;
        } else if (target) {
          if (ai.movementPattern === 'wait') {
            moveX = 0;
          } else if (ai.movementPattern === 'circle') {
            moveX = ai.strafeDirX * 0.75;
          } else {
            moveX = target.x > bot.x ? 1 : -1;
          }
        }

        // Salto para alcanzar plataformas elevadas
        if (bot.onGround && ai.jumpCooldown <= 0 && targetYDiff < -25) {
          jump = true;
          ai.jumpCooldown = 35;
        }
        break;

      case BotAIState.Attack:
        // Si está en pausa de combo, retrocede y no ataca de inmediato
        if (ai.currentComboPause > 0 && target) {
          moveX = target.x > bot.x ? -0.8 : 0.8;
          melee = false;
        } else {
          melee = true;
          if (targetDist > GameConstants.AI_MeleeRange * 0.4) {
            moveX = target && target.x > bot.x ? 1 : -1;
          }
          if (bot.onGround && targetYDiff < -20 && ai.jumpCooldown <= 0) {
            jump = true;
            ai.jumpCooldown = 30;
          }
        }
        break;

      case BotAIState.Strafe:
        ai.strafeTicks++;
        if (ai.strafeTicks > 45) {
          ai.strafeDirX = -ai.strafeDirX;
          ai.strafeTicks = 0;
        }
        moveX = ai.strafeDirX * 0.65;

        // Disparo si el arma no está en cooldown
        fire = bot.attackCooldown <= 0 && bot.ammo > 0;

        // Mantener distancia táctica con armas de fuego: retroceder si el rival se acerca
        if (target && targetDist < 120) {
          moveX = bot.x > target.x ? 1 : -1;
        }
        break;

      case BotAIState.Dodge:
        // Opción Arcade: esquiva por cooldown sin consumir estamina
        if (bot.onGround) {
          crouch = true; // ejecuta rodada (roll)
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
          const yDiff = nearestWeaponPos.y - bot.y;
          if (bot.onGround && yDiff < -20 && ai.jumpCooldown <= 0) {
            jump = true;
            ai.jumpCooldown = 35;
          }
          if (Math.abs(nearestWeaponPos.x - bot.x) < 24) {
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
