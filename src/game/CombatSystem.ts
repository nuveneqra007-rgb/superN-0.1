// =============================================================
// CombatSystem.ts — Detección de golpes, daño y knockback
// Lógica pura — Basado en PlayerState.as y Weapons.as
// =============================================================

import { GameConstants } from './GameConstants';
import { PlayerFSM } from './PlayerFSM';
import { PlayerFSMState, PlayerState } from './PlayerState';
import { WeaponDatabase, WeaponType } from './WeaponData';

export interface HitResult {
  didHit: boolean;
  damageDealt: number;
  knockbackX: number;
  knockbackY: number;
  hitstunTicks: number;
  causedKnockdown: boolean;
  ignitedTarget: boolean;
}

export const CombatSystem = {
  resolveMelee(attacker: PlayerState, defender: PlayerState): HitResult {
    if (!defender.isAlive || defender.invulnerabilityTicks > 0) {
      return this.miss();
    }

    const wpn = WeaponDatabase[attacker.equippedWeapon] || WeaponDatabase[WeaponType.Fists];
    const step = Math.min(Math.max(attacker.comboStep, 0), 2);

    // Hitbox del golpe: rectangular frente al atacante
    const hitW = wpn.category === 'Melee' ? 48 : 30;
    const hitH = 44;
    const dirX = attacker.facingRight ? 1 : -1;
    const hitCx = attacker.x + dirX * (hitW / 2 + 8);
    const hitCy = attacker.y;

    if (
      !this.rectsOverlap(
        hitCx,
        hitCy,
        hitW,
        hitH,
        defender.x,
        defender.y,
        GameConstants.HitboxStand.x,
        GameConstants.HitboxStand.y
      )
    ) {
      return this.miss();
    }

    // Daño con combo step
    let baseDmg = wpn.damage;
    if (attacker.equippedWeapon === WeaponType.Fists) {
      baseDmg = GameConstants.FistsDamage[step];
    } else if (attacker.equippedWeapon === WeaponType.Machete) {
      baseDmg = GameConstants.MacheteCombo[step];
    } else if (attacker.equippedWeapon === WeaponType.Axe) {
      baseDmg = GameConstants.AxeCombo[step];
    } else if (attacker.equippedWeapon === WeaponType.Sword) {
      baseDmg = GameConstants.SwordCombo[step];
    }

    const dmg = this.applyModifiers(
      baseDmg,
      attacker.damageDealtModifier,
      defender.damageTakenModifier
    );

    // Knockback
    const kbX = attacker.facingRight
      ? GameConstants.FistsKbX[step]
      : -GameConstants.FistsKbX[step];
    const kbY = GameConstants.FistsKbY[step];

    // Hitstun
    const hitstun =
      step === 2 ? GameConstants.HitstunTicksStrong : GameConstants.HitstunTicksLight;
    const knockdown = step === 2 || defender.health - dmg <= 0.01;

    // Desarme al 3er golpe con poca salud
    if (step === 2 && defender.health < GameConstants.DisarmHPThreshold) {
      const roll = Math.random();
      if (roll < GameConstants.DisarmChanceAtLowHP) {
        this.disarmPlayer(defender);
      }
    }

    // Habilidades especiales de arquetipos (BotExtended)
    const upperAttackerName = attacker.name.toUpperCase();
    if (upperAttackerName.includes('MOTERO') || upperAttackerName.includes('BIKER')) {
      attacker.health = Math.min(attacker.maxHealth, attacker.health + 4);
    }
    if (upperAttackerName.includes('BERSERKER')) {
      attacker.health = Math.min(attacker.maxHealth, attacker.health + 5);
    }

    this.applyDamage(defender, dmg, hitstun, kbX, kbY, knockdown);

    return {
      didHit: true,
      damageDealt: dmg,
      knockbackX: kbX,
      knockbackY: kbY,
      hitstunTicks: hitstun,
      causedKnockdown: knockdown,
      ignitedTarget: false,
    };
  },

  resolveProjectile(
    attacker: PlayerState,
    defender: PlayerState,
    weaponType: WeaponType,
    projX: number,
    projY: number
  ): HitResult {
    if (!defender.isAlive || defender.invulnerabilityTicks > 0) {
      return this.miss();
    }

    const hw = GameConstants.HitboxStand.x / 2;
    const hh = GameConstants.HitboxStand.y / 2;
    if (
      projX < defender.x - hw ||
      projX > defender.x + hw ||
      projY < defender.y - hh ||
      projY > defender.y + hh
    ) {
      return this.miss();
    }

    const wpn = WeaponDatabase[weaponType] || WeaponDatabase[WeaponType.Pistol];
    let dmg = this.applyModifiers(
      wpn.damage,
      attacker.damageDealtModifier,
      defender.damageTakenModifier
    );

    // Habilidades de proyectil por arquetipo (BotExtended)
    const upperAttackerName = attacker.name.toUpperCase();
    if (upperAttackerName.includes('FRANCOTIRADOR') || upperAttackerName.includes('SNIPER')) {
      if (Math.random() < 0.25) {
        dmg = Math.round(dmg * 1.5);
      }
    }
    if (upperAttackerName.includes('PISTOLERO') || upperAttackerName.includes('COWBOY')) {
      if (Math.random() < 0.15) {
        this.disarmPlayer(defender);
      }
    }

    const ignited = (wpn.onFireDuration || 0) > 0;
    if (ignited) {
      defender.isOnFire = true;
      defender.fireTicks = wpn.onFireDuration || 180;
    }

    const kbX = projX > defender.x ? -100 : 100;
    const kbY = -80;
    this.applyDamage(defender, dmg, GameConstants.HitstunTicksLight, kbX, kbY, false);

    return {
      didHit: true,
      damageDealt: dmg,
      knockbackX: kbX,
      knockbackY: kbY,
      hitstunTicks: GameConstants.HitstunTicksLight,
      causedKnockdown: false,
      ignitedTarget: ignited,
    };
  },

  resolveExplosion(
    defender: PlayerState,
    epicenterX: number,
    epicenterY: number,
    radius: number,
    damage: number
  ): HitResult {
    if (!defender.isAlive || defender.invulnerabilityTicks > 0) {
      return this.miss();
    }

    const dist = Math.sqrt(
      Math.pow(defender.x - epicenterX, 2) + Math.pow(defender.y - epicenterY, 2)
    );
    if (dist > radius) return this.miss();

    const factor = 1 - dist / radius;
    const dmg = damage * factor * defender.damageTakenModifier;
    const kbX = defender.x > epicenterX ? 320 : -320;
    const kbY = -420;

    this.applyDamage(defender, dmg, GameConstants.HitstunTicksStrong, kbX, kbY, true);

    return {
      didHit: true,
      damageDealt: dmg,
      knockbackX: kbX,
      knockbackY: kbY,
      hitstunTicks: GameConstants.HitstunTicksStrong,
      causedKnockdown: true,
      ignitedTarget: false,
    };
  },

  tickFireDamage(p: PlayerState): number {
    if (!p.isOnFire || p.fireTicks <= 0) return 0;
    if (p.stateTicks % 2 !== 0) return 0;

    const dmg = (GameConstants.FlameDmgPerTick / 8) * p.damageTakenModifier;
    p.health = Math.max(0, p.health - dmg);
    if (p.health <= 0) {
      PlayerFSM.tryTransition(p, PlayerFSMState.Dead);
    }
    return dmg;
  },

  applyDamage(
    p: PlayerState,
    dmg: number,
    hitstunTicks: number,
    kbX: number,
    kbY: number,
    knockdown: boolean
  ): void {
    p.health = Math.max(0, p.health - dmg);
    p.velocityX = kbX;
    p.velocityY = kbY;

    if (p.health <= 0) {
      PlayerFSM.tryTransition(p, PlayerFSMState.Dead);
      return;
    }

    if (knockdown) {
      PlayerFSM.tryTransition(p, PlayerFSMState.KnockedDown);
    } else {
      p.hitstunTicks = hitstunTicks;
      PlayerFSM.tryTransition(p, PlayerFSMState.Hitstun);
    }
  },

  disarmPlayer(p: PlayerState): void {
    p.equippedWeapon = WeaponType.Fists;
    p.ammo = 0;
  },

  applyModifiers(base: number, dealt: number, taken: number): number {
    return base * dealt * taken;
  },

  rectsOverlap(
    ax: number,
    ay: number,
    aw: number,
    ah: number,
    bx: number,
    by: number,
    bw: number,
    bh: number
  ): boolean {
    const halfAW = aw / 2;
    const halfAH = ah / 2;
    const halfBW = bw / 2;
    const halfBH = bh / 2;
    return Math.abs(ax - bx) < halfAW + halfBW && Math.abs(ay - by) < halfAH + halfBH;
  },

  miss(): HitResult {
    return {
      didHit: false,
      damageDealt: 0,
      knockbackX: 0,
      knockbackY: 0,
      hitstunTicks: 0,
      causedKnockdown: false,
      ignitedTarget: false,
    };
  },
};
