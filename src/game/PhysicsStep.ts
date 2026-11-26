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

    // Sub-stepping: evita tunneling en caídas rápidas o knockbacks fuertes
    const totalDx = Math.abs(p.velocityX * this.deltaTime);
    const totalDy = Math.abs(p.velocityY * this.deltaTime);
    const steps = Math.min(10, Math.max(1, Math.ceil(Math.max(totalDx, totalDy) / 8)));
    const stepDt = this.deltaTime / steps;

    const wasGroundedRecently = p.onGround || p.coyoteTicks > 0;
    p.onGround = false;

    for (let step = 0; step < steps; step++) {
      // 1. Movimiento horizontal + colisión sólo contra paredes sólidas (evita corner snags)
      const prevX = p.x;
      p.x += p.velocityX * stepDt;

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
      p.y += p.velocityY * stepDt;

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
          // Si acaba de pasar de crouch/roll (hh=17) a stand/hitstun (hh=32), tolerar hasta +20px
          const oneWayTol = wasGroundedRecently ? 20 : 8;
          if (p.velocityY >= 0 && prevFeet <= plat.y + oneWayTol && currentFeet >= plat.y) {
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
          } else if (currentFeet > plat.y && currentHead < platBottom) {
            // Resolución de penetración AABB (MTV) para evitar atravesar bloques sólidos tras hitstun/crouch
            const overlapTop = currentFeet - plat.y;
            const overlapBottom = platBottom - currentHead;
            const overlapLeft = p.x + hw - plat.x;
            const overlapRight = platRight - (p.x - hw);

            if (p.velocityY >= 0 && overlapTop <= hh + 8 && overlapTop <= overlapBottom) {
              p.y = plat.y - hh;
              p.velocityY = 0;
              p.onGround = true;
              p.coyoteTicks = 6;
            } else {
              const minOverlap = Math.min(overlapTop, overlapBottom, overlapLeft, overlapRight);
              if (minOverlap === overlapTop) {
                p.y = plat.y - hh;
                if (p.velocityY > 0) p.velocityY = 0;
                p.onGround = true;
                p.coyoteTicks = 6;
              } else if (minOverlap === overlapBottom) {
                p.y = platBottom + hh;
                if (p.velocityY < 0) p.velocityY = 0;
              } else if (minOverlap === overlapLeft) {
                p.x = plat.x - hw;
                if (p.velocityX > 0) p.velocityX = 0;
              } else {
                p.x = platRight + hw;
                if (p.velocityX < 0) p.velocityX = 0;
              }
            }
          }
        }
      }
    }

    // Apoyo continuo: si vy >= 0 y los pies quedaron a ras de una plataforma, fijar al suelo
    if (!p.onGround && p.velocityY >= 0) {
      const currentFeet = p.y + hh;
      for (const plat of platforms) {
        if (plat.isOneWay && p.platformDropTicks > 0) continue;
        const platRight = plat.x + plat.w;
        const overlapX = p.x + hw > plat.x + 2 && p.x - hw < platRight - 2;
        if (overlapX && currentFeet >= plat.y - 1 && currentFeet <= plat.y + 5) {
          p.y = plat.y - hh;
          p.velocityY = 0;
          p.onGround = true;
          p.coyoteTicks = 6;
          break;
        }
      }
    }

    if (!p.onGround && p.coyoteTicks > 0) {
      p.coyoteTicks--;
    }
  },

  clampToBounds(p: PlayerState, arenaWidth: number = 960): void {
    const hw = GameConstants.HitboxStand.x / 2;
    const isCrouched =
      p.fsm === PlayerFSMState.Crouch ||
      p.fsm === PlayerFSMState.Roll ||
      p.fsm === PlayerFSMState.CrouchSlide;
    const hh = (isCrouched ? GameConstants.HitboxCrouch.y : GameConstants.HitboxStand.y) / 2;
    const minX = hw + 10;
    const maxX = arenaWidth - hw - 10;
    if (p.x < minX) {
      p.x = minX;
      p.velocityX = 0;
    } else if (p.x > maxX) {
      p.x = maxX;
      p.velocityX = 0;
    }

    if (p.y < hh) {
      p.y = hh;
      if (p.velocityY < 0) p.velocityY = 0;
    }

    const killY = 580;
    if (p.y > killY && p.isAlive) {
      p.health = 0;
      p.isAlive = false;
      PlayerFSM.tryTransition(p, PlayerFSMState.Dead);
    }
  },
};
