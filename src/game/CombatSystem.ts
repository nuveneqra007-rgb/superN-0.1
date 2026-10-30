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
    const hitW = wpn.category === 'Melee' ? 58 : 38;
    const hitH = 54;
    const dirX = attacker.facingRight ? 1 : -1;
    const hitCx = attacker.x + dirX * (hitW / 2 + 10);
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

  resolveHeavySmash(attacker: PlayerState, defender: PlayerState, chargeRatio: number): HitResult {
    if (!defender.isAlive || defender.invulnerabilityTicks > 0) {
      return this.miss();
    }

    const hitW = 68;
    const hitH = 60;
    const dirX = attacker.facingRight ? 1 : -1;
    const hitCx = attacker.x + dirX * (hitW / 2 + 12);
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

    const baseDmg = 24 + 18 * Math.min(1, Math.max(0, chargeRatio));
    const dmg = this.applyModifiers(
      baseDmg,
      attacker.damageDealtModifier,
      defender.damageTakenModifier
    );

    const forceMult = attacker.meleeForceModifier || 1.0;
    const kbX = dirX * (440 + 260 * chargeRatio) * forceMult;
    const kbY = -(260 + 140 * chargeRatio);

    // Desarme forzado por golpe demoledor
    this.disarmPlayer(defender);

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

  resolveSlideTackle(attacker: PlayerState, defender: PlayerState): HitResult {
    if (!defender.isAlive || defender.invulnerabilityTicks > 0) {
      return this.miss();
    }

    const dist = Math.hypot(defender.x - attacker.x, defender.y - attacker.y);
    if (dist > 48 || Math.abs(defender.y - attacker.y) > 28) {
      return this.miss();
    }

    const dirX = attacker.facingRight ? 1 : -1;
    const baseDmg = 14;
    const dmg = this.applyModifiers(
      baseDmg,
      attacker.damageDealtModifier,
      defender.damageTakenModifier
    );

    const kbX = dirX * 220;
    const kbY = -120;

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

  resolveThrow(attacker: PlayerState, defender: PlayerState, throwDirectionX: number, throwUp: boolean): HitResult {
    if (!defender.isAlive) {
      return this.miss();
    }

    const dirX = throwDirectionX !== 0 ? throwDirectionX : (attacker.facingRight ? 1 : -1);
    const baseDmg = 18;
    const dmg = this.applyModifiers(
      baseDmg,
      attacker.damageDealtModifier,
      defender.damageTakenModifier
    );

    const forceMult = attacker.meleeForceModifier || 1.0;
    const kbX = dirX * 450 * forceMult;
    const kbY = throwUp ? -320 : -160;

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

  // ══════════════════════════════════════════════════════════════
  // ESTILO DE COMBATE CON ARMAS DE FILO (Espadas, Cuchillos, etc.)
  // ══════════════════════════════════════════════════════════════

  resolveBladeMelee(attacker: PlayerState, defender: PlayerState): HitResult {
    if (!defender.isAlive || defender.invulnerabilityTicks > 0) {
      return this.miss();
    }

    const step = Math.min(Math.max(attacker.comboStep, 0), 2);
    // Alcance extendido por el filo del arma (68px de ancho frontal)
    const hitW = 68;
    const hitH = 58;
    const dirX = attacker.facingRight ? 1 : -1;
    const hitCx = attacker.x + dirX * (hitW / 2 + 10);
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

    // Progresión de daño combo con filo
    const bladeComboDamages = [18, 26, 36];
    const baseDmg = bladeComboDamages[step];
    const dmg = this.applyModifiers(
      baseDmg,
      attacker.damageDealtModifier,
      defender.damageTakenModifier
    );

    // Impulso y knockback lacerante
    const forceMult = attacker.meleeForceModifier || 1.0;
    const kbXSteps = [220, 290, 420];
    const kbYSteps = [-60, -110, -240];
    const kbX = dirX * kbXSteps[step] * forceMult;
    const kbY = kbYSteps[step];

    const hitstun = step === 2 ? GameConstants.HitstunTicksStrong + 4 : GameConstants.HitstunTicksLight + 2;
    const knockdown = step === 2 || defender.health - dmg <= 0.01;

    // Desarme en el 3er golpe del combo de filo (desarma con 65% de probabilidad o si rival tiene < 50 HP)
    if (step === 2 && (defender.health < 50 || Math.random() < 0.65)) {
      this.disarmPlayer(defender);
    }

    // Bonificaciones de arquetipo
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

  resolveBladeHeavySlash(attacker: PlayerState, defender: PlayerState, chargeRatio: number): HitResult {
    if (!defender.isAlive || defender.invulnerabilityTicks > 0) {
      return this.miss();
    }

    // Alcance masivo de la onda de corte / tajo cargado (82px)
    const hitW = 82;
    const hitH = 64;
    const dirX = attacker.facingRight ? 1 : -1;
    const hitCx = attacker.x + dirX * (hitW / 2 + 12);
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

    const baseDmg = 34 + 28 * Math.min(1, Math.max(0, chargeRatio));
    const dmg = this.applyModifiers(
      baseDmg,
      attacker.damageDealtModifier,
      defender.damageTakenModifier
    );

    const forceMult = attacker.meleeForceModifier || 1.0;
    const kbX = dirX * (480 + 300 * chargeRatio) * forceMult;
    const kbY = -(280 + 160 * chargeRatio);

    // Corte crítico siempre desarma
    this.disarmPlayer(defender);

    this.applyDamage(defender, dmg, GameConstants.HitstunTicksStrong + 6, kbX, kbY, true);

    return {
      didHit: true,
      damageDealt: dmg,
      knockbackX: kbX,
      knockbackY: kbY,
      hitstunTicks: GameConstants.HitstunTicksStrong + 6,
      causedKnockdown: true,
      ignitedTarget: false,
    };
  },

  resolveBladeDashSlash(attacker: PlayerState, defender: PlayerState): HitResult {
    if (!defender.isAlive || defender.invulnerabilityTicks > 0) {
      return this.miss();
    }

    const dist = Math.hypot(defender.x - attacker.x, defender.y - attacker.y);
    if (dist > 58 || Math.abs(defender.y - attacker.y) > 30) {
      return this.miss();
    }

    const dirX = attacker.facingRight ? 1 : -1;
    const baseDmg = 22;
    const dmg = this.applyModifiers(
      baseDmg,
      attacker.damageDealtModifier,
      defender.damageTakenModifier
    );

    const kbX = dirX * 280;
    const kbY = -140;

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
      p.health = 0;
      p.isAlive = false;
      PlayerFSM.tryTransition(p, PlayerFSMState.Dead);
    }
    return dmg;
  },

  applyHit(target: PlayerState, params: {
    damage: number;
    kbX: number;
    kbY?: number;
    stunTicks?: number;
    hitStop?: number;
    causedKnockdown?: boolean;
    attacker?: PlayerState;
    weaponType?: WeaponType;
    screenShake?: number;
  }): {
    finalDamage: number;
    isDead: boolean;
    causedKnockdown: boolean;
    stunTicks: number;
    hitStop: number;
    screenShake: number;
  } {
    const finalDamage = Math.max(1, params.damage * (target.damageTakenModifier || 1.0));
    target.health = Math.max(0, target.health - finalDamage);
    target.hitFlashTicks = 2; // 2 frames de destello blanco retro

    target.velocityX = params.kbX;
    if (params.kbY !== undefined) {
      target.velocityY = params.kbY;
    }

    const causedKnockdown = !!params.causedKnockdown || target.health <= 0;
    const stunTicks = params.stunTicks ?? (causedKnockdown ? GameConstants.HitstunTicksStrong : GameConstants.HitstunTicksLight);
    const hitStop = params.hitStop ?? (causedKnockdown ? 6 : 4);
    const screenShake = params.screenShake ?? (causedKnockdown ? 14 : 7);

    if (target.health <= 0) {
      target.health = 0;
      target.isAlive = false;
      PlayerFSM.tryTransition(target, PlayerFSMState.Dead);
      target.deaths++;
      if (params.attacker) {
        params.attacker.kills++;
      }
    } else if (causedKnockdown) {
      target.onGround = false;
      target.knockdownTicks = 45;
      PlayerFSM.tryTransition(target, PlayerFSMState.KnockedDown);
    } else {
      target.hitstunTicks = stunTicks;
      PlayerFSM.tryTransition(target, PlayerFSMState.Hitstun);
    }

    if (params.attacker && params.attacker.lifestealOnHit && params.attacker.lifestealOnHit > 0) {
      params.attacker.health = Math.min(
        params.attacker.maxHealth,
        params.attacker.health + params.attacker.lifestealOnHit
      );
    }

    return {
      finalDamage,
      isDead: !target.isAlive,
      causedKnockdown,
      stunTicks,
      hitStop,
      screenShake,
    };
  },

  applyDamage(
    p: PlayerState,
    dmg: number,
    hitstunTicks: number,
    kbX: number,
    kbY: number,
    knockdown: boolean
  ): void {
    this.applyHit(p, {
      damage: dmg,
      kbX,
      kbY,
      stunTicks: hitstunTicks,
      causedKnockdown: knockdown,
    });
  },

  disarmPlayer(p: PlayerState): void {
    if (p.inventory) {
      if (p.inventory.activeSlot === 'melee') {
        p.inventory.melee = WeaponType.Fists;
        p.equippedWeapon = WeaponType.Fists;
        p.ammo = 0;
      } else if (p.inventory.activeSlot === 'handgun') {
        p.inventory.handgun = null;
        p.inventory.activeSlot = 'melee';
        p.equippedWeapon = p.inventory.melee;
        p.ammo = 0;
      } else if (p.inventory.activeSlot === 'primary') {
        p.inventory.primary = null;
        p.inventory.activeSlot = 'melee';
        p.equippedWeapon = p.inventory.melee;
        p.ammo = 0;
      } else if (p.inventory.activeSlot === 'throwable') {
        p.inventory.activeSlot = 'melee';
        p.equippedWeapon = p.inventory.melee;
        p.ammo = 0;
      }
      p.characterState = p.equippedWeapon === WeaponType.Fists ? 'desarmado' : 'arma_una_mano';
      p.weaponState = p.equippedWeapon === WeaponType.Fists ? 'desarmado' : 'arma_una_mano';
    } else {
      p.equippedWeapon = WeaponType.Fists;
      p.ammo = 0;
      p.characterState = 'desarmado';
      p.weaponState = 'desarmado';
    }
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
