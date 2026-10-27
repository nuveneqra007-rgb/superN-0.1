// =============================================================
// PhysicsStep.ts — Simulación determinista de física 2D
// 60 Hz, AABB sin motor externo
// Basado en Player.as, PlayerState.as
// =============================================================

import { GameConstants } from './GameConstants';
import { PlayerFSM } from './PlayerFSM';
import { PlayerFSMState, PlayerState } from './PlayerState';

export interface PhysicsRect {
  x: number;
  y: number;
  w: number;
  h: number;
  isOneWay?: boolean;
}

export const PhysicsStep = {
  deltaTime: 1 / 60,

  tick(p: PlayerState, platforms: PhysicsRect[]): void {
    if (!p.isAlive) return;

    this.applyGravity(p);
    this.applyMovement(p);
    this.resolveCollisions(p, platforms);
    this.clampToBounds(p);
  },

  applyGravity(p: PlayerState): void {
    if (
      p.fsm === PlayerFSMState.LedgeHang ||
      p.fsm === PlayerFSMState.LedgeClimb
    ) {
      return;
    }

    p.velocityY += GameConstants.Gravity * this.deltaTime;
    const maxFall = 800;
    if (p.velocityY > maxFall) p.velocityY = maxFall;
  },

  applyMovement(p: PlayerState): void {
    if (p.onGround) {
      p.velocityX *= GameConstants.GroundFriction;
    } else {
      p.velocityX *= GameConstants.AirFriction;
    }

    if (p.fsm === PlayerFSMState.Roll) {
      const dir = p.facingRight ? 1 : -1;
      p.velocityX = dir * GameConstants.RollSpeed;
    }

    p.x += p.velocityX * this.deltaTime;
    p.y += p.velocityY * this.deltaTime;
  },

  resolveCollisions(p: PlayerState, platforms: PhysicsRect[]): void {
    const hw = GameConstants.HitboxStand.x / 2;
    const isCrouched =
      p.fsm === PlayerFSMState.Crouch ||
      p.fsm === PlayerFSMState.Roll ||
      p.fsm === PlayerFSMState.CrouchSlide;
    const hh = (isCrouched ? GameConstants.HitboxCrouch.y : GameConstants.HitboxStand.y) / 2;

    p.onGround = false;

    if (p.platformDropTicks > 0) {
      p.platformDropTicks--;
    }

    for (const plat of platforms) {
      const isOneWay = plat.isOneWay || plat.h <= 14;
      if (isOneWay && p.platformDropTicks > 0) continue;

      const platRight = plat.x + plat.w;
      const platBottom = plat.y + plat.h;

      const overlapX = p.x + hw > plat.x && p.x - hw < platRight;
      const overlapY = p.y + hh > plat.y && p.y - hh < platBottom;

      if (!overlapX || !overlapY) continue;

      const penLeft = p.x + hw - plat.x;
      const penRight = platRight - (p.x - hw);
      const penTop = p.y + hh - plat.y;
      const penBottom = platBottom - (p.y - hh);

      // One-way: sólo colisión desde arriba cuando cae
      if (isOneWay) {
        if (p.velocityY >= 0 && penTop <= 16 && p.y - p.velocityY * this.deltaTime + hh <= plat.y + 4) {
          p.y = plat.y - hh;
          p.velocityY = 0;
          p.onGround = true;
          p.coyoteTicks = 6;
        }
        continue;
      }

      // Plataforma sólida — resolver eje con menor penetración
      const minPen = Math.min(penLeft, penRight, penTop, penBottom);

      if (minPen === penTop && p.velocityY >= 0) {
        p.y = plat.y - hh;
        p.velocityY = 0;
        p.onGround = true;
        p.coyoteTicks = 6;
      } else if (minPen === penBottom && p.velocityY < 0) {
        p.y = platBottom + hh;
        p.velocityY = 0;
      } else if (minPen === penLeft) {
        p.x = plat.x - hw;
        p.velocityX = 0;
      } else if (minPen === penRight) {
        p.x = platRight + hw;
        p.velocityX = 0;
      }
    }

    if (!p.onGround && p.coyoteTicks > 0) {
      p.coyoteTicks--;
    }
  },

  clampToBounds(p: PlayerState): void {
    const killY = 700;
    if (p.y > killY) {
      p.health = 0;
      PlayerFSM.tryTransition(p, PlayerFSMState.Dead);
    }
  },
};
