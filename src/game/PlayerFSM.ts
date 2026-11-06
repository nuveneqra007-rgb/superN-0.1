// =============================================================
// PlayerFSM.ts — Lógica de transiciones de la máquina de estados
// Mapeado desde PlayerState.as, PlayerAnimation.as
// =============================================================

import { GameConstants } from './GameConstants';
import { PlayerFSMState, PlayerState } from './PlayerState';

const Priorities: Record<PlayerFSMState, number> = {
  [PlayerFSMState.Idle]: 1,
  [PlayerFSMState.Walk]: 2,
  [PlayerFSMState.Run]: 3,
  [PlayerFSMState.Sprint]: 3,
  [PlayerFSMState.Jump]: 4,
  [PlayerFSMState.Fall]: 4,
  [PlayerFSMState.Crouch]: 3,
  [PlayerFSMState.CrouchSlide]: 5,
  [PlayerFSMState.Roll]: 8, // ininterrumpible
  [PlayerFSMState.Dive]: 6,
  [PlayerFSMState.WallSlide]: 5,
  [PlayerFSMState.LedgeHang]: 7,
  [PlayerFSMState.LedgeClimb]: 9, // bloquea input
  [PlayerFSMState.MeleeAttack]: 6,
  [PlayerFSMState.RangedAim]: 5,
  [PlayerFSMState.RangedFire]: 6,
  [PlayerFSMState.ThrowWeapon]: 7,
  [PlayerFSMState.Hitstun]: 8,
  [PlayerFSMState.KnockedDown]: 9,
  [PlayerFSMState.GetUp]: 9, // bloquea input
  [PlayerFSMState.Dead]: 10,
  [PlayerFSMState.ArmaDosManos]: 3,
};

export const PlayerFSM = {
  tryTransition(player: PlayerState, next: PlayerFSMState): boolean {
    if (player.fsm === next) return true;
    if (!this.canTransition(player.fsm, next)) return false;

    this.onExitState(player, player.fsm);
    player.fsm = next;
    player.stateTicks = 0;
    this.onEnterState(player, next);
    return true;
  },

  canTransition(current: PlayerFSMState, next: PlayerFSMState): boolean {
    if (current === PlayerFSMState.Dead) return false;

    // Roll es ininterrumpible excepto muerte o hitstun
    if (
      current === PlayerFSMState.Roll &&
      next !== PlayerFSMState.Dead &&
      next !== PlayerFSMState.Hitstun
    ) {
      return false;
    }

    // LedgeClimb bloquea transiciones normales excepto muerte o Idle
    if (current === PlayerFSMState.LedgeClimb && next !== PlayerFSMState.Dead && next !== PlayerFSMState.Idle) {
      return false;
    }

    // GetUp: permite levantarse a Idle, o recuperarse con Roll, Jump, Walk, Run, Fall, Dead
    if (current === PlayerFSMState.GetUp) {
      if (
        next === PlayerFSMState.Idle ||
        next === PlayerFSMState.Roll ||
        next === PlayerFSMState.Jump ||
        next === PlayerFSMState.Walk ||
        next === PlayerFSMState.Run ||
        next === PlayerFSMState.Fall ||
        next === PlayerFSMState.Dead ||
        next === PlayerFSMState.Hitstun
      ) {
        return true;
      }
      return false;
    }

    // KnockedDown: permite levantarse (GetUp), rodar, saltar, idle directo, caer o morir
    if (current === PlayerFSMState.KnockedDown) {
      if (
        next === PlayerFSMState.GetUp ||
        next === PlayerFSMState.Idle ||
        next === PlayerFSMState.Roll ||
        next === PlayerFSMState.Jump ||
        next === PlayerFSMState.Fall ||
        next === PlayerFSMState.Dead ||
        next === PlayerFSMState.Hitstun
      ) {
        return true;
      }
      return false;
    }

    const currPrio = Priorities[current] || 1;
    const nextPrio = Priorities[next] || 1;
    if (
      currPrio > 5 &&
      nextPrio < currPrio &&
      next !== PlayerFSMState.Idle &&
      next !== PlayerFSMState.Fall
    ) {
      return false;
    }

    return true;
  },

  onEnterState(p: PlayerState, state: PlayerFSMState): void {
    switch (state) {
      case PlayerFSMState.Roll:
        p.rollTicks = GameConstants.RollDurationTicks;
        if (p.isOnFire) {
          p.isOnFire = false;
          p.fireTicks = 0;
        }
        break;

      case PlayerFSMState.CrouchSlide:
        p.slideTicks = 16;
        break;

      case PlayerFSMState.Hitstun:
        break;

      case PlayerFSMState.GetUp:
        p.getUpTicks = 16;
        p.invulnerabilityTicks = 24;
        break;

      case PlayerFSMState.KnockedDown:
        p.knockdownTicks = 36;
        break;

      case PlayerFSMState.Dead:
        p.isAlive = false;
        p.respawnTicks = 180;
        break;
    }
  },

  onExitState(_p: PlayerState, _state: PlayerFSMState): void {
    // exit state cleanup
  },

  tick(p: PlayerState): void {
    if (p.fsm === PlayerFSMState.Dead || !p.isAlive) return;

    p.stateTicks++;
    if (p.invulnerabilityTicks > 0) p.invulnerabilityTicks--;
    if (p.attackCooldown > 0) p.attackCooldown--;

    if (p.isOnFire) {
      p.fireTicks--;
      if (p.fireTicks <= 0) p.isOnFire = false;
    }

    switch (p.fsm) {
      case PlayerFSMState.Roll:
        p.rollTicks--;
        if (p.rollTicks <= 0) this.tryTransition(p, PlayerFSMState.Idle);
        break;

      case PlayerFSMState.CrouchSlide:
        p.slideTicks--;
        if (p.slideTicks <= 0) this.tryTransition(p, PlayerFSMState.Crouch);
        break;

      case PlayerFSMState.Hitstun:
        p.hitstunTicks--;
        if (p.hitstunTicks <= 0) this.tryTransition(p, PlayerFSMState.Idle);
        break;

      case PlayerFSMState.KnockedDown:
        p.knockdownTicks--;
        if (p.knockdownTicks <= 0) this.tryTransition(p, PlayerFSMState.GetUp);
        break;

      case PlayerFSMState.GetUp:
        p.getUpTicks--;
        if (p.getUpTicks <= 0) this.tryTransition(p, PlayerFSMState.Idle);
        break;

      case PlayerFSMState.MeleeAttack:
        if (p.comboWindowTicks > 0) p.comboWindowTicks--;
        if (p.comboWindowTicks <= 0 && p.stateTicks > 8) {
          p.comboStep = 0;
          this.tryTransition(p, PlayerFSMState.Idle);
        }
        break;

      case PlayerFSMState.RangedFire:
        if (p.stateTicks > 6) {
          this.tryTransition(p, PlayerFSMState.Idle);
        }
        break;
    }
  },
};
