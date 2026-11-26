// =============================================================
// PhysicsStep.ts — Simulación determinista de física 2D
// 60 Hz, AABB sin motor externo
// Basado en Player.as, PlayerState.as
// =============================================================

import { GameConstants } from './GameConstants';
import { PlayerFSM } from './PlayerFSM';
import { PlayerFSMState, PlayerState } from './PlayerState';
import { PLAYER_CONFIG } from './PlayerController';

export interface PhysicsRect {
  x: number;
  y: number;
  w: number;
  h: number;
  isOneWay?: boolean;
}

export const PhysicsStep = {
  deltaTime: 1 / 60,

  tick(p: PlayerState, platforms: PhysicsRect[], arenaWidth: number = 960): void {
    this.applyGravity(p);
    this.integrateAndResolve(p, platforms);
    this.clampToBounds(p, arenaWidth);
  },

  applyGravity(p: PlayerState): void {
    if (
      p.fsm === PlayerFSMState.LedgeHang ||
      p.fsm === PlayerFSMState.LedgeClimb
    ) {
      return;
    }

    // Gravedad asimétrica unificada idéntica a PLAYER_CONFIG
    const gravity = p.velocityY < 0 ? PLAYER_CONFIG.GRAVITY_RISE : PLAYER_CONFIG.GRAVITY_FALL;
    p.velocityY += gravity * this.deltaTime;
    if (p.velocityY > PLAYER_CONFIG.TERMINAL_VELOCITY) {
      p.velocityY = PLAYER_CONFIG.TERMINAL_VELOCITY;
    }
  },

  integrateAndResolve(p: PlayerState, platforms: PhysicsRect[]): void {
    if (p.onGround) {
      p.velocityX *= GameConstants.GroundFriction;
    } else {
      p.velocityX *= GameConstants.AirFriction;
    }

    if (Math.abs(p.velocityX) < 2) {
      p.velocityX = 0;
    }

    if (p.fsm === PlayerFSMState.Roll) {
      const dir = p.facingRight ? 1 : -1;
      p.velocityX = dir * PLAYER_CONFIG.ROLL_SPEED;
    }

    const hw = GameConstants.HitboxStand.x / 2;
    const isCrouched =
      p.fsm === PlayerFSMState.Crouch ||
      p.fsm === PlayerFSMState.Roll ||
      p.fsm === PlayerFSMState.CrouchSlide;
    const hh = (isCrouched ? GameConstants.HitboxCrouch.y : GameConstants.HitboxStand.y) / 2;

    if (p.platformDropTicks > 0) {
      p.platformDropTicks--;
    }

    // 1. Movimiento horizontal + colisión sólo contra paredes sólidas (evita corner snags)
    const prevX = p.x;
    p.x += p.velocityX * this.deltaTime;

    for (const plat of platforms) {
      if (plat.isOneWay) continue;
      const platRight = plat.x + plat.w;
      const platBottom = plat.y + plat.h;
      const feetY = p.y + hh;
      const headY = p.y - hh;

      if (feetY <= plat.y + 4 || headY >= platBottom - 4) continue;

      if (p.velocityX > 0 && prevX + hw <= plat.x + 2 && p.x + hw > plat.x) {
        p.x = plat.x - hw;
        p.velocityX = 0;
      } else if (p.velocityX < 0 && prevX - hw >= platRight - 2 && p.x - hw < platRight) {
        p.x = platRight + hw;
        p.velocityX = 0;
      }
    }

    // 2. Movimiento vertical + colisión con plataformas (paridad con PlayerController)
    const prevY = p.y;
    p.y += p.velocityY * this.deltaTime;
    p.onGround = false;

    for (const plat of platforms) {
      const isOneWay = !!plat.isOneWay;
      if (isOneWay && p.platformDropTicks > 0) continue;

      const platRight = plat.x + plat.w;
      const platBottom = plat.y + plat.h;
      const overlapX = p.x + hw > plat.x + 2 && p.x - hw < platRight - 2;
      if (!overlapX) continue;

      const prevFeet = prevY + hh;
      const currentFeet = p.y + hh;
      const prevHead = prevY - hh;
      const currentHead = p.y - hh;

      if (isOneWay) {
        if (p.velocityY >= 0 && prevFeet <= plat.y + 8 && currentFeet >= plat.y) {
          p.y = plat.y - hh;
          p.velocityY = 0;
          p.onGround = true;
          p.coyoteTicks = 6;
        }
      } else {
        if (p.velocityY >= 0 && prevFeet <= plat.y + 12 && currentFeet >= plat.y) {
          p.y = plat.y - hh;
          p.velocityY = 0;
          p.onGround = true;
          p.coyoteTicks = 6;
        } else if (p.velocityY < 0 && prevHead >= platBottom - 12 && currentHead <= platBottom) {
          p.y = platBottom + hh;
          p.velocityY = 0;
        }
      }
    }

    if (!p.onGround && p.coyoteTicks > 0) {
      p.coyoteTicks--;
    }
  },

  clampToBounds(p: PlayerState, arenaWidth: number = 960): void {
    const hw = GameConstants.HitboxStand.x / 2;
    const minX = hw + 10;
    const maxX = arenaWidth - hw - 10;
    if (p.x < minX) {
      p.x = minX;
      p.velocityX = 0;
    } else if (p.x > maxX) {
      p.x = maxX;
      p.velocityX = 0;
    }

    const killY = 700;
    if (p.y > killY && p.isAlive) {
      p.health = 0;
      p.isAlive = false;
      PlayerFSM.tryTransition(p, PlayerFSMState.Dead);
    }
  },
};
