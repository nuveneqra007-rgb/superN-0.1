// =============================================================
// ArenaCanvas.tsx — Motor de renderizado y loop de juego 60Hz
// Réplica fiel de GameArena.tscn, BattleScene.cs y GamePlayer.cs
// =============================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BotFaction, getBotArchetype } from '../game/BotData';
import { BotAI, createBotFSMData } from '../game/BotFSM';
import { CombatSystem, HitResult } from '../game/CombatSystem';
import { GameConstants } from '../game/GameConstants';
import { PhysicsRect, PhysicsStep } from '../game/PhysicsStep';
import { PlayerFSM } from '../game/PlayerFSM';
import { createPlayerState, PlayerFSMState, PlayerState } from '../game/PlayerState';
import { sounds } from '../game/SoundEffects';
import { getWeapon, SpawnableWeaponsList, WeaponCategory, WeaponDatabase, WeaponType } from '../game/WeaponData';

interface ArenaCanvasProps {
  playerFaction?: BotFaction;
  botFaction: BotFaction;
  maxRounds: number;
  onExitToMenu: () => void;
  onMatchComplete?: (playerWon: boolean) => void;
}

interface ProjectileEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  onFireDuration: number;
  explosionRadius: number;
  shooterId: number;
  weaponType: WeaponType;
  pelletCount: number;
  lifeTicks: number;
  maxLifeTicks: number;
  isGrenade?: boolean;
  isMolotov?: boolean;
  fuseTicks?: number;
  color: string;
}

interface WorldWeaponEntity {
  id: number;
  weaponType: WeaponType;
  x: number;
  y: number;
  baseY: number;
  bobTicks: number;
}

interface FireZone {
  x: number;
  y: number;
  radius: number;
  remainingTicks: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
}

export const ArenaCanvas: React.FC<ArenaCanvasProps> = ({
  playerFaction = BotFaction.Assassin,
  botFaction,
  maxRounds,
  onExitToMenu,
  onMatchComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dimensiones originales Godot
  const ARENA_WIDTH = 960;
  const ARENA_HEIGHT = 540;

  const playerArch = getBotArchetype(playerFaction);
  const botArch = getBotArchetype(botFaction);

  // React state for HUD overlays
  const [hudState, setHudState] = useState({
    p1Health: 100,
    p1MaxHealth: 100,
    p1Stamina: 100,
    p1Weapon: playerArch.preferredWeapon || WeaponType.Fists,
    p1Ammo: playerArch.preferredWeapon ? getWeapon(playerArch.preferredWeapon).magSize : 0,
    p1MaxAmmo: playerArch.preferredWeapon ? getWeapon(playerArch.preferredWeapon).magSize : -1,
    botHealth: botArch.maxHealth,
    botMaxHealth: botArch.maxHealth,
    botWeapon: botArch.preferredWeapon || WeaponType.Fists,
    botAmmo: botArch.preferredWeapon ? getWeapon(botArch.preferredWeapon).magSize : 0,
    round: 1,
    maxRounds,
    p1Score: 0,
    botScore: 0,
    announcement: '¡PELEA!',
    isRoundOver: false,
    isMatchOver: false,
    matchWinner: '',
  });

  // Game state stored in refs to run smoothly at 60Hz without re-triggering React renders
  const stateRef = useRef<{
    p1: PlayerState;
    bot: PlayerState;
    botAI: ReturnType<typeof createBotFSMData>;
    projectiles: ProjectileEntity[];
    worldWeapons: WorldWeaponEntity[];
    fireZones: FireZone[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    platforms: PhysicsRect[];
    screenShake: number;
    weaponSpawnTimer: number;
    round: number;
    p1Score: number;
    botScore: number;
    roundActive: boolean;
    announcement: string;
    announcementTicks: number;
    nextEntityId: number;
    keys: { [key: string]: boolean };
    bgImage: HTMLImageElement | null;
    p1Sprite: HTMLImageElement | null;
    botSprite: HTMLImageElement | null;
    weaponImages: Record<string, HTMLImageElement>;
  } | null>(null);

  // Initialize game state
  useEffect(() => {
    const arch = getBotArchetype(botFaction);
    const pArch = getBotArchetype(playerFaction);

    const p1 = createPlayerState(1, pArch.name.toUpperCase(), false, 200, 460);
    p1.speedModifier = pArch.speedModifier;
    p1.damageDealtModifier = pArch.damageDealtModifier;
    p1.damageTakenModifier = pArch.damageTakenModifier;
    p1.meleeForceModifier = pArch.meleeForceModifier;

    if (pArch.preferredWeapon) {
      p1.equippedWeapon = pArch.preferredWeapon;
      p1.ammo = getWeapon(pArch.preferredWeapon).magSize;
    }

    const bot = createPlayerState(2, arch.name.toUpperCase(), true, 760, 460);

    // Apply archetype modifiers to bot
    bot.maxHealth = arch.maxHealth;
    bot.health = arch.maxHealth;
    bot.speedModifier = arch.speedModifier;
    bot.damageDealtModifier = arch.damageDealtModifier;
    bot.damageTakenModifier = arch.damageTakenModifier;
    bot.meleeForceModifier = arch.meleeForceModifier;

    if (arch.preferredWeapon && Math.random() < arch.equipWeaponChance) {
      bot.equippedWeapon = arch.preferredWeapon;
      bot.ammo = getWeapon(arch.preferredWeapon).magSize;
    }

    // Platforms according to GameArena.tscn
    const platforms: PhysicsRect[] = [
      // Floor
      { x: -10, y: 501, w: 980, h: 40, isOneWay: false },
      // Left Wall
      { x: 0, y: 0, w: 20, h: 540, isOneWay: false },
      // Right Wall
      { x: 940, y: 0, w: 20, h: 540, isOneWay: false },
      // Plat1 - Center (200x14) at y=370
      { x: 380, y: 370, w: 200, h: 14, isOneWay: true },
      // Plat2 - Left (140x14) at y=290
      { x: 125, y: 290, w: 140, h: 14, isOneWay: true },
      // Plat3 - Right (140x14) at y=290
      { x: 695, y: 290, w: 140, h: 14, isOneWay: true },
      // Plat4 - High Center (140x14) at y=210
      { x: 410, y: 210, w: 140, h: 14, isOneWay: true },
    ];

    // Load images
    const bgImg = new Image();
    bgImg.src = '/assets/backgrounds/warehouse.jpg';

    const p1Img = new Image();
    p1Img.src = pArch.spriteUrl || '/assets/sprites/player/Assassin_2.png';

    const botImg = new Image();
    botImg.src = arch.spriteUrl || '/assets/sprites/bot/Agent_2.png';

    // Preload weapon sprites
    const weaponImages: Record<string, HTMLImageElement> = {};
    Object.values(WeaponDatabase).forEach((w) => {
      if (w.iconUrl) {
        const wImg = new Image();
        wImg.src = w.iconUrl;
        weaponImages[w.type] = wImg;
      }
    });

    stateRef.current = {
      p1,
      bot,
      botAI: createBotFSMData(arch.aiType),
      projectiles: [],
      worldWeapons: [
        {
          id: 1,
          weaponType: WeaponType.Pistol,
          x: 480,
          y: 350,
          baseY: 350,
          bobTicks: 0,
        },
      ],
      fireZones: [],
      particles: [],
      floatingTexts: [],
      platforms,
      screenShake: 0,
      weaponSpawnTimer: 300,
      round: 1,
      p1Score: 0,
      botScore: 0,
      roundActive: true,
      announcement: '¡PELEA!',
      announcementTicks: 90,
      nextEntityId: 10,
      keys: {},
      bgImage: bgImg,
      p1Sprite: p1Img,
      botSprite: botImg,
      weaponImages,
    };

    sounds.playRoundGong(true);

    return () => {
      stateRef.current = null;
    };
  }, [botFaction, maxRounds]);

  // Input listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!stateRef.current) return;
      const key = e.key.toLowerCase();
      stateRef.current.keys[key] = true;

      if (key === 'r') {
        restartRound();
      }
      if (key === 'escape') {
        onExitToMenu();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!stateRef.current) return;
      stateRef.current.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onExitToMenu]);

  // Helper to restart current round
  const restartRound = useCallback(() => {
    if (!stateRef.current) return;
    const s = stateRef.current;
    const arch = getBotArchetype(botFaction);
    const pArch = getBotArchetype(playerFaction);

    s.p1 = createPlayerState(1, pArch.name.toUpperCase(), false, 200, 460);
    s.p1.speedModifier = pArch.speedModifier;
    s.p1.damageDealtModifier = pArch.damageDealtModifier;
    s.p1.damageTakenModifier = pArch.damageTakenModifier;
    s.p1.meleeForceModifier = pArch.meleeForceModifier;

    if (pArch.preferredWeapon) {
      s.p1.equippedWeapon = pArch.preferredWeapon;
      s.p1.ammo = getWeapon(pArch.preferredWeapon).magSize;
    }

    s.bot = createPlayerState(2, arch.name.toUpperCase(), true, 760, 460);
    s.bot.maxHealth = arch.maxHealth;
    s.bot.health = arch.maxHealth;
    s.bot.speedModifier = arch.speedModifier;
    s.bot.damageDealtModifier = arch.damageDealtModifier;
    s.bot.damageTakenModifier = arch.damageTakenModifier;
    s.bot.meleeForceModifier = arch.meleeForceModifier;

    if (arch.preferredWeapon && Math.random() < arch.equipWeaponChance) {
      s.bot.equippedWeapon = arch.preferredWeapon;
      s.bot.ammo = getWeapon(arch.preferredWeapon).magSize;
    }

    if (s.p1Sprite && pArch.spriteUrl) {
      s.p1Sprite.src = pArch.spriteUrl;
    }

    if (s.botSprite && arch.spriteUrl) {
      s.botSprite.src = arch.spriteUrl;
    }

    s.projectiles = [];
    s.particles = [];
    s.fireZones = [];
    s.floatingTexts = [];
    s.roundActive = true;
    s.announcement = '¡PELEA!';
    s.announcementTicks = 90;
    s.weaponSpawnTimer = 300;

    sounds.playRoundGong(true);
  }, [botFaction, playerFaction]);

  // Spawn a random weapon at a valid platform location
  const spawnRandomWeapon = () => {
    if (!stateRef.current) return;
    const s = stateRef.current;
    if (s.worldWeapons.length >= 4) return;

    const spawnPoints = [
      { x: 480, y: 350 },
      { x: 195, y: 270 },
      { x: 765, y: 270 },
      { x: 480, y: 190 },
      { x: 300, y: 480 },
      { x: 650, y: 480 },
    ];
    const pt = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
    const wpnType =
      SpawnableWeaponsList[Math.floor(Math.random() * SpawnableWeaponsList.length)];

    s.worldWeapons.push({
      id: s.nextEntityId++,
      weaponType: wpnType,
      x: pt.x,
      y: pt.y,
      baseY: pt.y,
      bobTicks: Math.random() * 50,
    });

    // Spawn sparkles
    for (let i = 0; i < 8; i++) {
      s.particles.push({
        x: pt.x,
        y: pt.y,
        vx: (Math.random() - 0.5) * 80,
        vy: (Math.random() - 0.5) * 80,
        life: 25,
        maxLife: 25,
        color: '#facc15',
        size: 3,
      });
    }
  };

  // Add hit spark particles
  const addSparks = (x: number, y: number, color = '#f97316', count = 10) => {
    if (!stateRef.current) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 160;
      stateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 15 + Math.random() * 15,
        maxLife: 30,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  };

  // Add explosion effect
  const createExplosion = (x: number, y: number, radius: number, damage: number, isMolotov = false) => {
    if (!stateRef.current) return;
    const s = stateRef.current;
    s.screenShake = 14;
    sounds.playExplosion();

    // Damage players in radius
    const hitP1 = CombatSystem.resolveExplosion(s.p1, x, y, radius, damage);
    if (hitP1.didHit) {
      s.floatingTexts.push({
        id: s.nextEntityId++,
        text: `-${Math.round(hitP1.damageDealt)}`,
        x: s.p1.x,
        y: s.p1.y - 20,
        color: '#ef4444',
        life: 40,
      });
    }

    const hitBot = CombatSystem.resolveExplosion(s.bot, x, y, radius, damage);
    if (hitBot.didHit) {
      s.floatingTexts.push({
        id: s.nextEntityId++,
        text: `-${Math.round(hitBot.damageDealt)}`,
        x: s.bot.x,
        y: s.bot.y - 20,
        color: '#facc15',
        life: 40,
      });
    }

    if (isMolotov) {
      s.fireZones.push({
        x,
        y,
        radius: GameConstants.MolotovFireZone,
        remainingTicks: 240, // 4 seconds of fire
      });
    }

    // Explosion particles
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 260;
      s.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        life: 25 + Math.random() * 25,
        maxLife: 50,
        color: i % 2 === 0 ? '#ea580c' : i % 3 === 0 ? '#facc15' : '#71717a',
        size: 4 + Math.random() * 6,
      });
    }
  };

  // Main 60Hz physics and game loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let accumulatedTime = 0;
    const timestep = 1000 / 60; // 16.666ms

    const updateGame = () => {
      const s = stateRef.current;
      if (!s) return;

      const p1 = s.p1;
      const bot = s.bot;
      const keys = s.keys;

      // Decrement announcement timer
      if (s.announcementTicks > 0) {
        s.announcementTicks--;
        if (s.announcementTicks <= 0 && s.roundActive) {
          s.announcement = '';
        }
      }

      // Check round end
      if (s.roundActive && (!p1.isAlive || !bot.isAlive)) {
        s.roundActive = false;
        const p1Won = p1.isAlive;
        if (p1Won) {
          s.p1Score++;
          s.announcement = '¡JUGADOR 1 GANA!';
          sounds.playRoundGong(true);
        } else {
          s.botScore++;
          s.announcement = '¡BOT GANA!';
          sounds.playRoundGong(false);
        }
        s.announcementTicks = 150;

        const neededWins = Math.floor(maxRounds / 2) + 1;
        if (s.p1Score >= neededWins || s.botScore >= neededWins) {
          const matchWon = s.p1Score > s.botScore;
          setTimeout(() => {
            if (stateRef.current) {
              stateRef.current.announcement = matchWon ? '¡VICTORIA TOTAL!' : '¡DERROTA!';
              stateRef.current.announcementTicks = 9999;
            }
            if (onMatchComplete) onMatchComplete(matchWon);
          }, 2000);
        } else {
          // Next round after delay
          setTimeout(() => {
            if (stateRef.current) {
              s.round++;
              restartRound();
            }
          }, 2500);
        }
      }

      // ─────────────────────────────────────────────────────────
      // 1. INPUT HUMANO (P1)
      // ─────────────────────────────────────────────────────────
      if (p1.isAlive && s.roundActive) {
        let moveX = 0;
        if (keys['a'] || keys['arrowleft']) moveX -= 1;
        if (keys['d'] || keys['arrowright']) moveX += 1;

        const jumpPressed = keys['w'] || keys['arrowup'] || keys[' '];
        const crouchPressed = keys['s'] || keys['arrowdown'];
        const meleePressed = keys['n'] || keys['j'];
        const firePressed = keys['m'] || keys['k'];
        const throwPressed = keys['g'];

        // Drop-down through one-way platforms: Down + Jump
        if (crouchPressed && jumpPressed) {
          p1.platformDropTicks = GameConstants.PlatformDropTicks;
        }

        // Horizontal speed
        const speed = GameConstants.RunSpeed * p1.speedModifier;
        if (
          Math.abs(moveX) > 0.05 &&
          p1.fsm !== PlayerFSMState.Roll &&
          p1.fsm !== PlayerFSMState.KnockedDown &&
          p1.fsm !== PlayerFSMState.GetUp &&
          p1.fsm !== PlayerFSMState.Hitstun
        ) {
          p1.velocityX = moveX * speed;
          p1.facingRight = moveX > 0;
          if (p1.onGround) {
            PlayerFSM.tryTransition(p1, PlayerFSMState.Run);
          }
        } else if (p1.fsm !== PlayerFSMState.Roll) {
          p1.velocityX *= GameConstants.GroundFriction;
          if (p1.onGround && Math.abs(p1.velocityX) < 5) {
            p1.velocityX = 0;
            if (p1.fsm === PlayerFSMState.Run) {
              PlayerFSM.tryTransition(p1, PlayerFSMState.Idle);
            }
          }
        }

        // Jump
        if (
          jumpPressed &&
          !crouchPressed &&
          (p1.onGround || p1.coyoteTicks > 0) &&
          p1.stamina >= GameConstants.StaminaCostJump &&
          p1.fsm !== PlayerFSMState.Roll &&
          p1.fsm !== PlayerFSMState.KnockedDown
        ) {
          p1.velocityY = GameConstants.JumpVelocity;
          p1.stamina -= GameConstants.StaminaCostJump;
          p1.coyoteTicks = 0;
          PlayerFSM.tryTransition(p1, PlayerFSMState.Jump);
          sounds.playJump();
        }

        // Crouch + Dodge Roll
        if (crouchPressed && p1.onGround && !jumpPressed) {
          if (
            p1.fsm === PlayerFSMState.Run &&
            p1.stamina >= GameConstants.StaminaCostRoll &&
            p1.attackCooldown <= 0
          ) {
            p1.stamina -= GameConstants.StaminaCostRoll;
            p1.attackCooldown = GameConstants.RollCooldownTicks;
            PlayerFSM.tryTransition(p1, PlayerFSMState.Roll);
            sounds.playRoll();
          } else if (p1.fsm !== PlayerFSMState.Roll) {
            PlayerFSM.tryTransition(p1, PlayerFSMState.Crouch);
          }
        } else if (p1.fsm === PlayerFSMState.Crouch && !crouchPressed) {
          PlayerFSM.tryTransition(p1, PlayerFSMState.Idle);
        }

        // Melee Attack
        if (
          meleePressed &&
          p1.attackCooldown <= 0 &&
          (p1.fsm === PlayerFSMState.Idle ||
            p1.fsm === PlayerFSMState.Run ||
            p1.fsm === PlayerFSMState.Crouch)
        ) {
          p1.comboStep = (p1.comboStep + 1) % 3;
          p1.comboWindowTicks = GameConstants.FistsComboWindowTicks;
          p1.attackCooldown = GameConstants.FistsCooldownTicks;
          PlayerFSM.tryTransition(p1, PlayerFSMState.MeleeAttack);
          sounds.playPunch();

          // Resolve Melee against Bot
          const hit = CombatSystem.resolveMelee(p1, bot);
          if (hit.didHit) {
            sounds.playHit();
            addSparks(bot.x, bot.y, '#f59e0b', 12);
            s.screenShake = 6;
            s.floatingTexts.push({
              id: s.nextEntityId++,
              text: `-${Math.round(hit.damageDealt)}`,
              x: bot.x,
              y: bot.y - 25,
              color: '#facc15',
              life: 35,
            });
          }
        }

        // Fire Gun
        if (
          firePressed &&
          p1.attackCooldown <= 0 &&
          p1.equippedWeapon !== WeaponType.Fists &&
          p1.ammo > 0 &&
          p1.fsm !== PlayerFSMState.Roll &&
          p1.fsm !== PlayerFSMState.KnockedDown
        ) {
          const wpn = getWeapon(p1.equippedWeapon);
          if (wpn.category === 'Firearm') {
            p1.attackCooldown = wpn.cooldownTicks;
            p1.ammo--;
            PlayerFSM.tryTransition(p1, PlayerFSMState.RangedFire);
            sounds.playGunshot(wpn.type.toLowerCase());
            s.screenShake = wpn.type === WeaponType.Bazooka || wpn.type === WeaponType.Shotgun ? 8 : 3;

            const dir = p1.facingRight ? 1 : -1;
            const muzzleX = p1.x + dir * 22;
            const muzzleY = p1.y - 8;

            addSparks(muzzleX, muzzleY, '#fde047', 6);

            // Handle pellets (e.g., Shotgun 4 pellets)
            const count = wpn.pelletCount || 1;
            for (let i = 0; i < count; i++) {
              const spreadAngle =
                ((Math.random() - 0.5) * wpn.accuracyDeg * Math.PI) / 180;
              const baseAngle = dir === 1 ? 0 : Math.PI;
              const angle = baseAngle + spreadAngle;

              s.projectiles.push({
                id: s.nextEntityId++,
                x: muzzleX,
                y: muzzleY,
                vx: Math.cos(angle) * wpn.projectileSpeed,
                vy: Math.sin(angle) * wpn.projectileSpeed,
                damage: wpn.damage * p1.damageDealtModifier,
                onFireDuration: wpn.onFireDuration || 0,
                explosionRadius: wpn.explosionRadius || 0,
                shooterId: p1.id,
                weaponType: wpn.type,
                pelletCount: 1,
                lifeTicks: 0,
                maxLifeTicks: wpn.type === WeaponType.Flamethrower ? 24 : 120,
                color: wpn.color,
              });
            }

            if (p1.ammo <= 0) {
              p1.equippedWeapon = WeaponType.Fists;
            }
          }
        }

        // Throw Grenade / Molotov
        if (
          throwPressed &&
          p1.attackCooldown <= 0 &&
          (p1.equippedWeapon === WeaponType.Grenade ||
            p1.equippedWeapon === WeaponType.Molotov) &&
          p1.ammo > 0
        ) {
          const wpn = getWeapon(p1.equippedWeapon);
          p1.attackCooldown = 25;
          p1.ammo--;
          const dir = p1.facingRight ? 1 : -1;

          s.projectiles.push({
            id: s.nextEntityId++,
            x: p1.x + dir * 16,
            y: p1.y - 12,
            vx: dir * 300,
            vy: -350,
            damage: wpn.damage,
            onFireDuration: wpn.onFireDuration || 0,
            explosionRadius:
              wpn.type === WeaponType.Grenade
                ? GameConstants.GrenadeExplosionRadius
                : GameConstants.MolotovFireZone,
            shooterId: p1.id,
            weaponType: wpn.type,
            pelletCount: 1,
            lifeTicks: 0,
            maxLifeTicks: 200,
            isGrenade: true,
            isMolotov: wpn.type === WeaponType.Molotov,
            fuseTicks:
              wpn.type === WeaponType.Grenade
                ? GameConstants.GrenadeTimerTicks
                : 0,
            color: wpn.color,
          });

          if (p1.ammo <= 0) {
            p1.equippedWeapon = WeaponType.Fists;
          }
        }

        // Stamina regen
        if (
          p1.onGround &&
          (p1.fsm === PlayerFSMState.Idle || p1.fsm === PlayerFSMState.Crouch)
        ) {
          p1.stamina = Math.min(
            GameConstants.MaxStamina,
            p1.stamina + GameConstants.StaminaRegenPerTick
          );
        }
      }

      // ─────────────────────────────────────────────────────────
      // 2. IA DEL BOT
      // ─────────────────────────────────────────────────────────
      if (bot.isAlive && s.roundActive) {
        // Find nearest weapon
        let nearestWpnDist = 9999;
        let nearestWpnPos: { x: number; y: number } | null = null;
        for (const w of s.worldWeapons) {
          const d = Math.sqrt(
            Math.pow(w.x - bot.x, 2) + Math.pow(w.y - bot.y, 2)
          );
          if (d < nearestWpnDist) {
            nearestWpnDist = d;
            nearestWpnPos = { x: w.x, y: w.y };
          }
        }

        // Check incoming projectiles
        let projIncoming = false;
        for (const pr of s.projectiles) {
          if (pr.shooterId !== bot.id) {
            const d = Math.sqrt(
              Math.pow(pr.x - bot.x, 2) + Math.pow(pr.y - bot.y, 2)
            );
            if (d < 160) {
              projIncoming = true;
              break;
            }
          }
        }

        const aiState = BotAI.evaluate(
          bot,
          s.botAI,
          p1,
          projIncoming,
          nearestWpnDist
        );
        const botInput = BotAI.computeInput(
          bot,
          s.botAI,
          p1,
          aiState,
          nearestWpnPos
        );

        // Apply movement
        const botSpeed = GameConstants.RunSpeed * bot.speedModifier;
        if (
          Math.abs(botInput.moveX) > 0.05 &&
          bot.fsm !== PlayerFSMState.Roll &&
          bot.fsm !== PlayerFSMState.KnockedDown &&
          bot.fsm !== PlayerFSMState.GetUp &&
          bot.fsm !== PlayerFSMState.Hitstun
        ) {
          bot.velocityX = botInput.moveX * botSpeed;
          bot.facingRight = botInput.moveX > 0;
          if (bot.onGround) {
            PlayerFSM.tryTransition(bot, PlayerFSMState.Run);
          }
        } else if (bot.fsm !== PlayerFSMState.Roll) {
          bot.velocityX *= GameConstants.GroundFriction;
          if (bot.onGround && Math.abs(bot.velocityX) < 5) {
            bot.velocityX = 0;
            if (bot.fsm === PlayerFSMState.Run) {
              PlayerFSM.tryTransition(bot, PlayerFSMState.Idle);
            }
          }
        }

        // Bot Jump
        if (
          botInput.jump &&
          (bot.onGround || bot.coyoteTicks > 0) &&
          bot.stamina >= GameConstants.StaminaCostJump &&
          bot.fsm !== PlayerFSMState.Roll &&
          bot.fsm !== PlayerFSMState.KnockedDown
        ) {
          bot.velocityY = GameConstants.JumpVelocity;
          bot.stamina -= GameConstants.StaminaCostJump;
          bot.coyoteTicks = 0;
          PlayerFSM.tryTransition(bot, PlayerFSMState.Jump);
          sounds.playJump();
        }

        // Bot Crouch / Dodge Roll
        if (botInput.crouch && bot.onGround) {
          if (
            bot.fsm === PlayerFSMState.Run &&
            bot.stamina >= GameConstants.StaminaCostRoll &&
            bot.attackCooldown <= 0
          ) {
            bot.stamina -= GameConstants.StaminaCostRoll;
            bot.attackCooldown = GameConstants.RollCooldownTicks;
            PlayerFSM.tryTransition(bot, PlayerFSMState.Roll);
            sounds.playRoll();
          } else if (bot.fsm !== PlayerFSMState.Roll) {
            PlayerFSM.tryTransition(bot, PlayerFSMState.Crouch);
          }
        } else if (bot.fsm === PlayerFSMState.Crouch && !botInput.crouch) {
          PlayerFSM.tryTransition(bot, PlayerFSMState.Idle);
        }

        // Bot Melee
        if (
          botInput.melee &&
          bot.attackCooldown <= 0 &&
          (bot.fsm === PlayerFSMState.Idle ||
            bot.fsm === PlayerFSMState.Run ||
            bot.fsm === PlayerFSMState.Crouch)
        ) {
          bot.comboStep = (bot.comboStep + 1) % 3;
          bot.comboWindowTicks = GameConstants.FistsComboWindowTicks;
          bot.attackCooldown = GameConstants.FistsCooldownTicks;
          PlayerFSM.tryTransition(bot, PlayerFSMState.MeleeAttack);
          sounds.playPunch();

          const hit = CombatSystem.resolveMelee(bot, p1);
          if (hit.didHit) {
            sounds.playHit();
            addSparks(p1.x, p1.y, '#ef4444', 12);
            s.screenShake = 6;
            s.floatingTexts.push({
              id: s.nextEntityId++,
              text: `-${Math.round(hit.damageDealt)}`,
              x: p1.x,
              y: p1.y - 25,
              color: '#ef4444',
              life: 35,
            });
          }
        }

        // Bot Gun Fire
        if (
          botInput.fire &&
          bot.attackCooldown <= 0 &&
          bot.equippedWeapon !== WeaponType.Fists &&
          bot.ammo > 0 &&
          bot.fsm !== PlayerFSMState.Roll
        ) {
          const wpn = getWeapon(bot.equippedWeapon);
          if (wpn.category === 'Firearm') {
            bot.attackCooldown = wpn.cooldownTicks;
            bot.ammo--;
            PlayerFSM.tryTransition(bot, PlayerFSMState.RangedFire);
            sounds.playGunshot(wpn.type.toLowerCase());

            const dir = bot.facingRight ? 1 : -1;
            const muzzleX = bot.x + dir * 22;
            const muzzleY = bot.y - 8;

            addSparks(muzzleX, muzzleY, '#fde047', 6);

            const count = wpn.pelletCount || 1;
            for (let i = 0; i < count; i++) {
              const spreadAngle =
                ((Math.random() - 0.5) * wpn.accuracyDeg * Math.PI) / 180;
              const baseAngle = dir === 1 ? 0 : Math.PI;
              const angle = baseAngle + spreadAngle;

              s.projectiles.push({
                id: s.nextEntityId++,
                x: muzzleX,
                y: muzzleY,
                vx: Math.cos(angle) * wpn.projectileSpeed,
                vy: Math.sin(angle) * wpn.projectileSpeed,
                damage: wpn.damage * bot.damageDealtModifier,
                onFireDuration: wpn.onFireDuration || 0,
                explosionRadius: wpn.explosionRadius || 0,
                shooterId: bot.id,
                weaponType: wpn.type,
                pelletCount: 1,
                lifeTicks: 0,
                maxLifeTicks: wpn.type === WeaponType.Flamethrower ? 24 : 120,
                color: wpn.color,
              });
            }

            if (bot.ammo <= 0) {
              bot.equippedWeapon = WeaponType.Fists;
            }
          }
        }

        // Bot stamina regen
        if (
          bot.onGround &&
          (bot.fsm === PlayerFSMState.Idle || bot.fsm === PlayerFSMState.Crouch)
        ) {
          bot.stamina = Math.min(
            GameConstants.MaxStamina,
            bot.stamina + GameConstants.StaminaRegenPerTick
          );
        }
      }

      // ─────────────────────────────────────────────────────────
      // 3. FÍSICA Y TICKS DE JUGADORES
      // ─────────────────────────────────────────────────────────
      PhysicsStep.tick(p1, s.platforms);
      PhysicsStep.tick(bot, s.platforms);
      PlayerFSM.tick(p1);
      PlayerFSM.tick(bot);

      // Fire damage ticks
      CombatSystem.tickFireDamage(p1);
      CombatSystem.tickFireDamage(bot);

      // Weapon pickups
      for (let i = s.worldWeapons.length - 1; i >= 0; i--) {
        const w = s.worldWeapons[i];
        w.bobTicks++;
        w.y = w.baseY + Math.sin(w.bobTicks * 0.08) * 5;

        // Player 1 pickup
        const d1 = Math.sqrt(Math.pow(w.x - p1.x, 2) + Math.pow(w.y - p1.y, 2));
        const canP1Pickup =
          p1.fsm === PlayerFSMState.Crouch ||
          p1.equippedWeapon === WeaponType.Fists ||
          keys['s'] ||
          keys['arrowdown'];

        if (d1 < 32 && canP1Pickup) {
          const wData = getWeapon(w.weaponType);
          p1.equippedWeapon = w.weaponType;
          p1.ammo = wData.magSize;
          sounds.playPickup();
          s.floatingTexts.push({
            id: s.nextEntityId++,
            text: `¡${wData.name}!`,
            x: p1.x,
            y: p1.y - 35,
            color: '#38bdf8',
            life: 45,
          });
          s.worldWeapons.splice(i, 1);
          continue;
        }

        // Bot pickup
        const d2 = Math.sqrt(Math.pow(w.x - bot.x, 2) + Math.pow(w.y - bot.y, 2));
        const canBotPickup =
          bot.fsm === PlayerFSMState.Crouch ||
          bot.equippedWeapon === WeaponType.Fists;

        if (d2 < 32 && canBotPickup) {
          const wData = getWeapon(w.weaponType);
          bot.equippedWeapon = w.weaponType;
          bot.ammo = wData.magSize;
          sounds.playPickup();
          s.floatingTexts.push({
            id: s.nextEntityId++,
            text: `¡${wData.name}!`,
            x: bot.x,
            y: bot.y - 35,
            color: '#f97316',
            life: 45,
          });
          s.worldWeapons.splice(i, 1);
          continue;
        }
      }

      // Periodical weapon spawn
      s.weaponSpawnTimer++;
      if (s.weaponSpawnTimer >= 900) {
        // Every 15 seconds
        spawnRandomWeapon();
        s.weaponSpawnTimer = 0;
      }

      // ─────────────────────────────────────────────────────────
      // 4. ACTUALIZAR PROYECTILES
      // ─────────────────────────────────────────────────────────
      for (let i = s.projectiles.length - 1; i >= 0; i--) {
        const pr = s.projectiles[i];
        pr.lifeTicks++;

        // Throwable physics (gravity & bounce)
        if (pr.isGrenade) {
          pr.vy += GameConstants.Gravity * (1 / 60);
          pr.x += pr.vx * (1 / 60);
          pr.y += pr.vy * (1 / 60);

          // Floor bounce
          if (pr.y >= 500) {
            pr.y = 500;
            pr.vy = -pr.vy * 0.55;
            pr.vx *= 0.8;
            if (pr.isMolotov) {
              createExplosion(pr.x, pr.y, pr.explosionRadius, pr.damage, true);
              s.projectiles.splice(i, 1);
              continue;
            }
          }
          // Walls
          if (pr.x <= 20 || pr.x >= 940) {
            pr.vx = -pr.vx * 0.7;
          }

          if (pr.fuseTicks && pr.lifeTicks >= pr.fuseTicks) {
            createExplosion(pr.x, pr.y, pr.explosionRadius, pr.damage, false);
            s.projectiles.splice(i, 1);
            continue;
          }
        } else {
          // Standard bullet / rocket / flame
          pr.x += pr.vx * (1 / 60);
          pr.y += pr.vy * (1 / 60);

          // Smoke for bazooka
          if (pr.weaponType === WeaponType.Bazooka && pr.lifeTicks % 2 === 0) {
            s.particles.push({
              x: pr.x,
              y: pr.y,
              vx: (Math.random() - 0.5) * 20,
              vy: (Math.random() - 0.5) * 20,
              life: 20,
              maxLife: 20,
              color: '#a1a1aa',
              size: 4,
            });
          }

          // Wall collision
          if (pr.x < 15 || pr.x > 945 || pr.y > 510 || pr.y < 0) {
            if (pr.explosionRadius > 0) {
              createExplosion(pr.x, pr.y, pr.explosionRadius, pr.damage, false);
            } else {
              addSparks(pr.x, pr.y, '#facc15', 5);
            }
            s.projectiles.splice(i, 1);
            continue;
          }

          // Check hit against player 1
          if (pr.shooterId !== p1.id && p1.isAlive) {
            const hit = CombatSystem.resolveProjectile(
              bot,
              p1,
              pr.weaponType,
              pr.x,
              pr.y
            );
            if (hit.didHit) {
              if (pr.explosionRadius > 0) {
                createExplosion(pr.x, pr.y, pr.explosionRadius, pr.damage, false);
              } else {
                sounds.playHit();
                addSparks(pr.x, pr.y, '#ef4444', 8);
                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text: `-${Math.round(hit.damageDealt)}`,
                  x: p1.x,
                  y: p1.y - 20,
                  color: '#ef4444',
                  life: 30,
                });
              }
              s.projectiles.splice(i, 1);
              continue;
            }
          }

          // Check hit against bot
          if (pr.shooterId !== bot.id && bot.isAlive) {
            const hit = CombatSystem.resolveProjectile(
              p1,
              bot,
              pr.weaponType,
              pr.x,
              pr.y
            );
            if (hit.didHit) {
              if (pr.explosionRadius > 0) {
                createExplosion(pr.x, pr.y, pr.explosionRadius, pr.damage, false);
              } else {
                sounds.playHit();
                addSparks(pr.x, pr.y, '#f59e0b', 8);
                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text: `-${Math.round(hit.damageDealt)}`,
                  x: bot.x,
                  y: bot.y - 20,
                  color: '#facc15',
                  life: 30,
                });
              }
              s.projectiles.splice(i, 1);
              continue;
            }
          }
        }

        if (pr.lifeTicks >= pr.maxLifeTicks) {
          s.projectiles.splice(i, 1);
        }
      }

      // Fire zones
      for (let i = s.fireZones.length - 1; i >= 0; i--) {
        const fz = s.fireZones[i];
        fz.remainingTicks--;

        // Flame sparks
        if (Math.random() < 0.4) {
          s.particles.push({
            x: fz.x + (Math.random() - 0.5) * fz.radius * 1.5,
            y: fz.y + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 30,
            vy: -40 - Math.random() * 60,
            life: 25,
            maxLife: 25,
            color: '#ea580c',
            size: 3,
          });
        }

        // Catch fire if stepped inside
        if (p1.isAlive && Math.abs(p1.x - fz.x) < fz.radius && Math.abs(p1.y - fz.y) < 25) {
          p1.isOnFire = true;
          p1.fireTicks = 120;
        }
        if (bot.isAlive && Math.abs(bot.x - fz.x) < fz.radius && Math.abs(bot.y - fz.y) < 25) {
          bot.isOnFire = true;
          bot.fireTicks = 120;
        }

        if (fz.remainingTicks <= 0) {
          s.fireZones.splice(i, 1);
        }
      }

      // Particles update
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx * (1 / 60);
        pt.y += pt.vy * (1 / 60);
        pt.life--;
        if (pt.life <= 0) {
          s.particles.splice(i, 1);
        }
      }

      // Floating texts update
      for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
        const ft = s.floatingTexts[i];
        ft.y -= 0.6;
        ft.life--;
        if (ft.life <= 0) {
          s.floatingTexts.splice(i, 1);
        }
      }

      if (s.screenShake > 0) s.screenShake *= 0.88;

      // Update React HUD state periodically
      const p1WpnData = getWeapon(p1.equippedWeapon);
      setHudState({
        p1Health: p1.health,
        p1MaxHealth: p1.maxHealth,
        p1Stamina: p1.stamina,
        p1Weapon: p1.equippedWeapon,
        p1Ammo: p1.ammo,
        p1MaxAmmo: p1WpnData.magSize,
        botHealth: bot.health,
        botMaxHealth: bot.maxHealth,
        botWeapon: bot.equippedWeapon,
        botAmmo: bot.ammo,
        round: s.round,
        maxRounds,
        p1Score: s.p1Score,
        botScore: s.botScore,
        announcement: s.announcement,
        isRoundOver: !s.roundActive,
        isMatchOver: s.announcement.includes('TOTAL') || s.announcement.includes('DERROTA'),
        matchWinner: s.announcement,
      });
    };

    // Render pass
    const renderGame = () => {
      const s = stateRef.current;
      const canvas = canvasRef.current;
      if (!s || !canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.imageSmoothingEnabled = false;

      // Screen shake
      if (s.screenShake > 0.5) {
        const shakeX = (Math.random() - 0.5) * s.screenShake * 2;
        const shakeY = (Math.random() - 0.5) * s.screenShake * 2;
        ctx.translate(shakeX, shakeY);
      }

      // 1. Background
      if (s.bgImage && s.bgImage.complete && s.bgImage.naturalWidth > 0) {
        ctx.drawImage(s.bgImage, 0, 0, ARENA_WIDTH, ARENA_HEIGHT);
      } else {
        // Fallback warehouse background
        const grad = ctx.createLinearGradient(0, 0, 0, ARENA_HEIGHT);
        grad.addColorStop(0, '#111827');
        grad.addColorStop(0.7, '#1f2937');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

        // Industrial warehouse grid and beams
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        for (let x = 60; x < ARENA_WIDTH; x += 120) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, ARENA_HEIGHT);
          ctx.stroke();
        }
      }

      // 2. Platforms
      for (const plat of s.platforms) {
        if (plat.h >= 30) {
          // Floor
          ctx.fillStyle = '#27201c';
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

          // Top highlight
          ctx.fillStyle = '#45382b';
          ctx.fillRect(plat.x, plat.y, plat.w, 4);
        } else if (plat.w <= 25) {
          // Walls
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
          ctx.fillStyle = '#334155';
          ctx.fillRect(plat.x + (plat.x < 100 ? plat.w - 3 : 0), plat.y, 3, plat.h);
        } else {
          // Elevated platforms
          ctx.fillStyle = '#524332';
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

          // Metallic top edge and supports
          ctx.fillStyle = '#786249';
          ctx.fillRect(plat.x, plat.y, plat.w, 3);

          // Small support brackets
          ctx.fillStyle = '#3b3124';
          ctx.fillRect(plat.x + 8, plat.y + plat.h, 12, 6);
          ctx.fillRect(plat.x + plat.w - 20, plat.y + plat.h, 12, 6);
        }
      }

      // 3. Fire zones
      for (const fz of s.fireZones) {
        const grad = ctx.createRadialGradient(fz.x, fz.y, 5, fz.x, fz.y, fz.radius);
        grad.addColorStop(0, 'rgba(251, 146, 60, 0.7)');
        grad.addColorStop(0.6, 'rgba(234, 88, 12, 0.4)');
        grad.addColorStop(1, 'rgba(220, 38, 38, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(fz.x, fz.y, fz.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. World weapons on ground
      for (const w of s.worldWeapons) {
        const wData = getWeapon(w.weaponType);
        const wImg = s.weaponImages[w.weaponType];
        const bobY = Math.sin(w.bobTicks * 0.1) * 4;

        // Pulsing glow
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.beginPath();
        ctx.arc(w.x, w.y + bobY, 18, 0, Math.PI * 2);
        ctx.fill();

        if (wImg && wImg.complete && wImg.naturalWidth > 0) {
          // Render authentic BotExtended weapon sprite
          ctx.drawImage(wImg, w.x - 16, w.y - 12 + bobY, 32, 16);
        } else {
          // Weapon crate/base fallback
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = wData.color;
          ctx.lineWidth = 1.5;
          ctx.fillRect(w.x - 14, w.y - 7 + bobY, 28, 14);
          ctx.strokeRect(w.x - 14, w.y - 7 + bobY, 28, 14);
        }

        // Weapon badge text
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(wData.name.slice(0, 9), w.x, w.y + 14 + bobY);

        // Small indicator above
        ctx.fillStyle = wData.color;
        ctx.fillText('▼', w.x, w.y - 14 + bobY);
      }

      // 5. Render Players
      const renderFighter = (
        p: PlayerState,
        sprite: HTMLImageElement | null,
        nameTagColor: string,
        isHuman: boolean
      ) => {
        if (!p.isAlive) {
          // Dead body / ragdoll on floor
          ctx.save();
          ctx.translate(p.x, p.y + 14);
          ctx.rotate((p.facingRight ? 1 : -1) * 1.5);
          ctx.fillStyle = 'rgba(100, 116, 139, 0.6)';
          ctx.fillRect(-14, -24, 28, 48);
          ctx.restore();
          return;
        }

        ctx.save();
        ctx.translate(p.x, p.y);

        // Invulnerability blinking
        if (p.invulnerabilityTicks > 0 && Math.floor(p.invulnerabilityTicks / 4) % 2 === 0) {
          ctx.globalAlpha = 0.5;
        }

        // Draw character sprite
        const spriteWidth = 56;
        const spriteHeight = 76;
        const spriteOffsetY = -38;

        ctx.save();
        if (!p.facingRight) {
          ctx.scale(-1, 1);
        }

        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
          // Draw actual Godot character sprite
          ctx.drawImage(
            sprite,
            -spriteWidth / 2,
            spriteOffsetY - (spriteHeight / 2 - 20),
            spriteWidth,
            spriteHeight
          );
        } else {
          // Crisp pixel stylized fighter fallback
          ctx.fillStyle = isHuman ? '#0284c7' : '#b91c1c';
          // Body
          ctx.fillRect(-12, -34, 24, 38);
          // Head
          ctx.fillStyle = isHuman ? '#38bdf8' : '#f87171';
          ctx.fillRect(-10, -48, 20, 14);
          // Visor / eyes
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(2, -44, 6, 4);
        }

        // Weapon held in hands
        if (p.equippedWeapon !== WeaponType.Fists) {
          const wData = getWeapon(p.equippedWeapon);
          const wImg = s.weaponImages[p.equippedWeapon];
          if (wImg && wImg.complete && wImg.naturalWidth > 0) {
            ctx.drawImage(wImg, 6, -24, 24, 12);
          } else {
            ctx.fillStyle = wData.color;
            ctx.fillRect(8, -20, 16, 5);
          }
          if (wData.hasLaserSight) {
            // Laser sight line
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(30, -18);
            ctx.lineTo(400, -18);
            ctx.stroke();
          }
        }

        // Hit flash overlay
        if (p.fsm === PlayerFSMState.Hitstun) {
          ctx.fillStyle = 'rgba(249, 115, 22, 0.45)';
          ctx.fillRect(-16, -52, 32, 60);
        }

        // On fire flame effect
        if (p.isOnFire) {
          ctx.fillStyle = 'rgba(234, 88, 12, 0.6)';
          ctx.beginPath();
          ctx.arc(0, -20, 22 + Math.sin(p.stateTicks) * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore(); // restore flip

        // Overhead Overhead Name & Health Bar
        const barW = 56;
        const barH = 6;
        const barX = -barW / 2;
        const barY = -60;

        // Name Tag
        ctx.fillStyle = nameTagColor;
        ctx.font = 'bold 11px "Chakra Petch", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.name, 0, barY - 4);

        // Bar Background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

        // Health fill
        const hpPct = Math.max(0, p.health / p.maxHealth);
        ctx.fillStyle =
          hpPct > 0.6 ? '#22c55e' : hpPct > 0.3 ? '#eab308' : '#ef4444';
        ctx.fillRect(barX, barY, barW * hpPct, barH);

        // Stamina bar (human only)
        if (isHuman) {
          const stmPct = Math.max(0, p.stamina / GameConstants.MaxStamina);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(barX, barY + barH + 1, barW * stmPct, 2);
        }

        ctx.restore();
      };

      renderFighter(s.p1, s.p1Sprite, '#38bdf8', true);
      renderFighter(s.bot, s.botSprite, '#f87171', false);

      // 6. Projectiles
      for (const pr of s.projectiles) {
        ctx.save();
        if (pr.isGrenade) {
          ctx.fillStyle = pr.color;
          ctx.beginPath();
          ctx.arc(pr.x, pr.y, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#000';
          ctx.stroke();
        } else {
          // Tracer bullet / rocket
          ctx.fillStyle = pr.color;
          ctx.shadowColor = pr.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(pr.x, pr.y, pr.weaponType === WeaponType.Bazooka ? 5 : 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Bullet trail
          ctx.strokeStyle = pr.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(pr.x, pr.y);
          ctx.lineTo(pr.x - pr.vx * 0.03, pr.y - pr.vy * 0.03);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 7. Particles
      for (const pt of s.particles) {
        ctx.save();
        ctx.globalAlpha = pt.life / pt.maxLife;
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
        ctx.restore();
      }

      // 8. Floating damage numbers
      for (const ft of s.floatingTexts) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, ft.life / 20);
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 15px "Chakra Petch", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // 9. Central Big Announcement ("¡PELEA!", "¡JUGADOR 1 GANA!", etc.)
      if (s.announcement) {
        ctx.save();
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 10;
        ctx.font = 'bold 44px "Chakra Petch", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(s.announcement, ARENA_WIDTH / 2, 180);
        ctx.restore();
      }

      ctx.restore();
    };

    const loop = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;
      accumulatedTime += delta;

      // Limit max catchup to avoid spiraling
      if (accumulatedTime > 100) accumulatedTime = 100;

      while (accumulatedTime >= timestep) {
        updateGame();
        accumulatedTime -= timestep;
      }

      renderGame();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [maxRounds, botFaction, playerFaction, restartRound, onMatchComplete]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-neutral-950 p-2 overflow-hidden select-none">
      {/* Top Header Match Tracker */}
      <div className="w-full max-w-[960px] bg-neutral-900/90 border border-neutral-800 rounded-t-lg px-4 py-2 flex items-center justify-between text-neutral-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-bold text-cyan-400 text-sm tracking-wider">
              P1 ({playerArch.name.toUpperCase()})
            </span>
          </div>
          <span className="text-xl font-bold font-mono-code text-cyan-300">
            {hudState.p1Score}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-sm font-bold uppercase tracking-widest text-neutral-300">
            Round {hudState.round} / {hudState.maxRounds}
          </span>
          <span className="text-xs text-neutral-400 font-mono-code">
            Al mejor de {Math.floor(hudState.maxRounds / 2) + 1}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xl font-bold font-mono-code text-rose-400">
            {hudState.botScore}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-rose-400 text-sm tracking-wider">
              BOT ({botArch.name.toUpperCase()})
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative border-x border-neutral-800 shadow-2xl bg-black">
        <canvas
          ref={canvasRef}
          width={ARENA_WIDTH}
          height={ARENA_HEIGHT}
          className="w-full max-w-[960px] max-h-[70vh] aspect-[16/9] object-contain block"
        />

        {/* Round or Match Overlay Banner */}
        {hudState.isMatchOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 gap-4 z-20 backdrop-blur-sm animate-fade-in">
            <h2 className="text-5xl font-extrabold tracking-wider text-yellow-400">
              {hudState.matchWinner}
            </h2>
            <p className="text-neutral-300 text-lg">
              Marcador Final: {hudState.p1Score} - {hudState.botScore}
            </p>
            <div className="flex gap-4 mt-2">
              <button
                onClick={restartRound}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg transition"
              >
                Jugar Revancha (R)
              </button>
              <button
                onClick={onExitToMenu}
                className="px-6 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 font-bold rounded-lg shadow-lg transition"
              >
                Volver al Menú (ESC)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Fighter Controls & Health HUD */}
      <div className="w-full max-w-[960px] bg-neutral-900/95 border border-neutral-800 rounded-b-lg p-3 grid grid-cols-3 items-center gap-4 text-xs">
        {/* P1 Stats */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-cyan-400 font-bold">
            <span>P1 ({playerArch.name.toUpperCase()})</span>
            <span>{Math.ceil(hudState.p1Health)} / {hudState.p1MaxHealth}</span>
          </div>
          <div className="w-full h-3 bg-neutral-800 rounded overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${
                hudState.p1Health > 60
                  ? 'bg-emerald-500'
                  : hudState.p1Health > 30
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.max(0, (hudState.p1Health / hudState.p1MaxHealth) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-neutral-400">
            <span>STAMINA (Dodge / Salto)</span>
            <span>{Math.ceil(hudState.p1Stamina)}%</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-800 rounded overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-75"
              style={{ width: `${Math.max(0, hudState.p1Stamina)}%` }}
            />
          </div>
        </div>

        {/* Current Equipped Weapon */}
        <div className="flex flex-col items-center justify-center p-2 bg-neutral-950/80 rounded border border-neutral-800 text-center">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Arma P1</span>
          <div className="flex items-center gap-2 my-0.5">
            {getWeapon(hudState.p1Weapon)?.iconUrl ? (
              <img
                src={getWeapon(hudState.p1Weapon).iconUrl}
                alt=""
                className="h-5 w-auto object-contain [image-rendering:pixelated]"
              />
            ) : null}
            <span className="text-sm font-bold text-yellow-400">{hudState.p1Weapon}</span>
          </div>
          <span className="text-xs font-mono-code text-neutral-300">
            {hudState.p1MaxAmmo === -1
              ? 'Melee (Infinito)'
              : `Munición: ${hudState.p1Ammo} / ${hudState.p1MaxAmmo}`}
          </span>
        </div>

        {/* Opponent Bot Stats */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-rose-400 font-bold">
            <span>BOT ({botArch.name.toUpperCase()})</span>
            <span>{Math.ceil(hudState.botHealth)} / {hudState.botMaxHealth}</span>
          </div>
          <div className="w-full h-3 bg-neutral-800 rounded overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${
                hudState.botHealth > 60
                  ? 'bg-emerald-500'
                  : hudState.botHealth > 30
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.max(0, (hudState.botHealth / hudState.botMaxHealth) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-neutral-400">
            <span>ARMA DEL BOT</span>
            <div className="flex items-center gap-1.5 font-bold text-rose-300">
              {getWeapon(hudState.botWeapon)?.iconUrl ? (
                <img
                  src={getWeapon(hudState.botWeapon).iconUrl}
                  alt=""
                  className="h-4 w-auto object-contain [image-rendering:pixelated]"
                />
              ) : null}
              <span>{hudState.botWeapon}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Controls Reminder Strip */}
      <div className="w-full max-w-[960px] mt-1.5 flex flex-wrap justify-between items-center text-[11px] text-neutral-400 px-2 font-mono-code">
        <span><strong className="text-neutral-200">A / D ó ← / →</strong>: Mover</span>
        <span><strong className="text-neutral-200">W ó ↑ / Espacio</strong>: Saltar</span>
        <span><strong className="text-neutral-200">S ó ↓</strong>: Agacharse / Rodar</span>
        <span><strong className="text-neutral-200">N ó J</strong>: Golpe Melee</span>
        <span><strong className="text-neutral-200">M ó K</strong>: Disparar</span>
        <span><strong className="text-neutral-200">G</strong>: Granada</span>
        <span><strong className="text-neutral-200">R</strong>: Reiniciar</span>
        <span><strong className="text-neutral-200">ESC</strong>: Menú</span>
      </div>
    </div>
  );
};
