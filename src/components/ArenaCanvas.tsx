// =============================================================
// ArenaCanvas.tsx — Motor de renderizado y loop de juego 60Hz
// Soporte multiescenario con 3 mundos y mecánicas interactivas
// =============================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BotFaction, getBotArchetype } from '../game/BotData';
import { BotAI, BotAIState, createBotFSMData } from '../game/BotFSM';
import { CombatSystem, HitResult } from '../game/CombatSystem';
import { GameConstants } from '../game/GameConstants';
import { PhysicsRect, PhysicsStep } from '../game/PhysicsStep';
import { PlayerFSM } from '../game/PlayerFSM';
import { createPlayerState, PlayerFSMState, PlayerState } from '../game/PlayerState';
import { getWeapon, isBladeWeapon, isOneHandWeapon, isPistolWeapon, isRifleWeapon, isSwordWeapon, isThrowableWeapon, isTwoHandWeapon, SpawnableWeaponsList, WeaponCategory, WeaponDatabase, WeaponType } from '../game/WeaponData';
import { PlayerController, PlayerInput, PlayerState as ControllerState, PLAYER_CONFIG } from '../game/PlayerController';
import { sounds } from '../game/SoundEffects';
import { getWorldConfig, WorldConfig, HazardCfg, PlatformRect } from '../game/WorldData';
import { GameMode } from './ModeSelectScreen';
import {
  GrenadeType,
  GrenadeConfig,
  GRENADE_DATABASE,
  GRENADE_MAX_CAPACITY,
  GRENADE_INITIAL_COUNT,
  ALL_GRENADE_TYPES,
  GrenadeInventory,
  createGrenadeInventory,
  getTotalGrenades,
  canAddGrenade,
  addGrenades,
  cycleGrenadeType,
  consumeGrenade,
  GrenadePickupEntity,
} from '../game/GrenadeSystem';

interface ArenaCanvasProps {
  gameMode?: GameMode;
  playerFaction?: BotFaction;
  botFaction: BotFaction;
  maxRounds: number;
  worldId?: string;
  onExitToMenu: () => void;
  onMatchComplete?: (playerWon: boolean) => void;
}

/**
 * Configuración de Spritesheets por Facción / Personaje.
 * Cada personaje cuenta con su spritesheet de caminata (número de columnas, filas y fotogramas totales).
 * - Personaje Assassin (Asesino): Usa el spritesheet dinámico de caminata (/assets/aistudio/Assassin-walk-trimmed_710f16f3.png).
 * - Para añadir las texturas de los demás personajes (Punk, Gánster, Policía, Mutante, Matón, Soldado, etc.),
 *   simplemente asigna su respectivo 'walkSheetUrl' e 'idleUrl' manteniendo este mismo esqueleto de animación.
 */
export interface SpritesheetDef {
  walkSheetUrl?: string;
  runSheetUrl?: string;
  rollSheetUrl?: string;
  jumpSheetUrl?: string;
  idleUrl: string;
  cols?: number;
  rows?: number;
  totalFrames?: number;
  hasWalkSheet: boolean;
  hasRunSheet?: boolean;
  hasRollSheet?: boolean;
  hasJumpSheet?: boolean;
  runCols?: number;
  runRows?: number;
  runTotalFrames?: number;
  rollCols?: number;
  rollRows?: number;
  rollTotalFrames?: number;
  jumpCols?: number;
  jumpRows?: number;
  jumpTotalFrames?: number;
  hasMeleeSheet?: boolean;
  meleeSheetUrl?: string;
  meleeCols?: number;
  meleeRows?: number;
  meleeTotalFramesPerRow?: number;
  hasOneHandAttackSheet?: boolean;
  oneHandAttackSheetUrl?: string;
  oneHandCols?: number;
  oneHandRows?: number;
  oneHandTotalFrames?: number;
  hasTwoHandAttackSheet?: boolean;
  twoHandAttackSheetUrl?: string;
  twoHandCols?: number;
  twoHandRows?: number;
  twoHandTotalFrames?: number;
  hasPistolShootSheet?: boolean;
  pistolShootSheetUrl?: string;
  pistolCols?: number;
  pistolRows?: number;
  pistolTotalFrames?: number;
  hasRifleShootSheet?: boolean;
  rifleShootSheetUrl?: string;
  rifleCols?: number;
  rifleRows?: number;
  rifleTotalFrames?: number;
  hasThrowUpSheet?: boolean;
  throwUpSheetUrl?: string;
  throwUpCols?: number;
  throwUpRows?: number;
  throwUpTotalFrames?: number;
}

export const CHARACTER_SPRITESHEETS: Record<string, SpritesheetDef> = {
  // ── 0. NINJA (PROTAGONISTA ÚNICO) ──
  // Pixel art de cuerpo negro con detalles naranja.
  // Animación de caminata horizontal de 6 frames (/assets/sprites/player/ninja_walk.png).
  // Animación de carrera horizontal de 6 frames con inercia (/assets/sprites/player/ninja_run.png).
  // Animación de rodar (roll) de 7 frames sin loop (/assets/sprites/player/ninja_roll.png).
  // Animación de salto (jump) de 6 frames en 2 filas x 3 columnas (/assets/sprites/player/ninja_jump.png).
  // Hoja de sprites de combate melee de 3 filas x 6 columnas (/assets/sprites/player/ninja_melee.png):
  //   Fila 1: Puñetazo | Fila 2: Patada | Fila 3: Uppercut
  // Set de animación de Ataque a una mano de 5 frames (/assets/sprites/player/one_hand_attack.png)
  // Set oficial de Ataque a dos manos (Golpe pesado) de 6 frames (/assets/sprites/player/two_hand_attack.png)
  // Set oficial de Ataque a una mano (Pistolas) de 4 frames (/assets/sprites/player/pistol_shoot.png)
  // Set oficial de Ataque a dos manos (Rifles/Escopetas) de 4 frames (/assets/sprites/player/rifle_shoot.png)
  [BotFaction.Ninja]: {
    idleUrl: '/assets/sprites/player/ninja.png',
    walkSheetUrl: '/assets/sprites/player/ninja_walk.png',
    runSheetUrl: '/assets/sprites/player/ninja_run.png',
    rollSheetUrl: '/assets/sprites/player/ninja_roll.png',
    jumpSheetUrl: '/assets/sprites/player/ninja_jump.png',
    meleeSheetUrl: '/assets/sprites/player/ninja_melee.png',
    oneHandAttackSheetUrl: '/assets/sprites/player/one_hand_attack.png',
    twoHandAttackSheetUrl: '/assets/sprites/player/two_hand_attack.png',
    pistolShootSheetUrl: '/assets/sprites/player/pistol_shoot.png',
    rifleShootSheetUrl: '/assets/sprites/player/rifle_shoot.png',
    throwUpSheetUrl: '/assets/sprites/player/throw_up.png',
    cols: 6,
    rows: 1,
    totalFrames: 6,
    hasWalkSheet: true,
    hasRunSheet: true,
    hasRollSheet: true,
    hasJumpSheet: true,
    hasMeleeSheet: true,
    hasOneHandAttackSheet: true,
    hasTwoHandAttackSheet: true,
    hasPistolShootSheet: true,
    hasRifleShootSheet: true,
    hasThrowUpSheet: true,
    runCols: 6,
    runRows: 1,
    runTotalFrames: 6,
    rollCols: 7,
    rollRows: 1,
    rollTotalFrames: 7,
    jumpCols: 3,
    jumpRows: 2,
    jumpTotalFrames: 6,
    meleeCols: 6,
    meleeRows: 3,
    meleeTotalFramesPerRow: 6,
    oneHandCols: 5,
    oneHandRows: 1,
    oneHandTotalFrames: 5,
    twoHandCols: 6,
    twoHandRows: 1,
    twoHandTotalFrames: 6,
    pistolCols: 4,
    pistolRows: 1,
    pistolTotalFrames: 4,
    rifleCols: 4,
    rifleRows: 1,
    rifleTotalFrames: 4,
    throwUpCols: 5,
    throwUpRows: 1,
    throwUpTotalFrames: 5,
  },
  // ── 1. ASESINO (ASSASSIN) ──
  // Utiliza la imagen oficial prevista (/assets/sprites/player/Assassin_2.png)
  // para idle y caminata con ciclo biomecánico fluido, sin cambiar a formas no previstas ni perder la imagen.
  [BotFaction.Assassin]: {
    idleUrl: '/assets/sprites/player/Assassin_2.png',
    hasWalkSheet: false,
  },
  // ── 2. MATÓN (THUG) ──
  [BotFaction.Thug]: {
    idleUrl: '/assets/sprites/bot/thug.png',
    hasWalkSheet: false,
  },
  // ── 3. PUNK ──
  [BotFaction.Punk]: {
    idleUrl: '/assets/sprites/bot/punk.png',
    hasWalkSheet: false,
  },
  // ── 4. MOTERO (BIKER) ──
  [BotFaction.Biker]: {
    idleUrl: '/assets/sprites/bot/biker.png',
    hasWalkSheet: false,
  },
  // ── 5. GÁNSTER (GANGSTER) ──
  [BotFaction.Gangster]: {
    idleUrl: '/assets/sprites/bot/gangster.png',
    hasWalkSheet: false,
  },
  // ── 6. POLICÍA (POLICE) ──
  [BotFaction.Police]: {
    idleUrl: '/assets/sprites/bot/police.png',
    hasWalkSheet: false,
  },
  // ── 7. METROCOP ──
  [BotFaction.MetroCop]: {
    idleUrl: '/assets/sprites/bot/metrocop.png',
    hasWalkSheet: false,
  },
  // ── 8. MUTANTE (MUTANT) ──
  [BotFaction.Mutant]: {
    idleUrl: '/assets/sprites/bot/mutant.png',
    hasWalkSheet: false,
  },
  // ── 9. ZOMBI (ZOMBIE) ──
  [BotFaction.Zombie]: {
    idleUrl: '/assets/sprites/bot/zombie.png',
    hasWalkSheet: false,
  },
  // ── 10. SOLDADO (SOLDIER) ──
  [BotFaction.Soldier]: {
    idleUrl: '/assets/sprites/bot/soldier.png',
    hasWalkSheet: false,
  },
  // ── 11. AGENTE (AGENT) ──
  [BotFaction.Agent]: {
    idleUrl: '/assets/sprites/bot/agent.png',
    hasWalkSheet: false,
  },
  // ── 12. PISTOLERO (COWBOY) ──
  [BotFaction.Cowboy]: {
    idleUrl: '/assets/sprites/bot/cowboy.png',
    hasWalkSheet: false,
  },
  // ── 13. FRANCOTIRADOR (SNIPER) ──
  [BotFaction.Sniper]: {
    idleUrl: '/assets/sprites/bot/sniper.png',
    hasWalkSheet: false,
  },
  // ── 14. JEFE BERSERKER ──
  [BotFaction.Boss_Berserker]: {
    idleUrl: '/assets/sprites/bot/berserker.png',
    hasWalkSheet: false,
  },
  // ── 15. JEFE TANQUE ──
  [BotFaction.Boss_Tank]: {
    idleUrl: '/assets/sprites/bot/tank.png',
    hasWalkSheet: false,
  },
};

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
  isThrowable?: boolean;
  grenadeType?: GrenadeType;
  rotation?: number;
  rotationSpeed?: number;
  fuseTicks?: number;
  color: string;
}

interface SmokeCloudEntity {
  id: number;
  x: number;
  y: number;
  radius: number;
  remainingTicks: number;
  maxTicks: number;
}

interface WorldWeaponEntity {
  id: number;
  weaponType: WeaponType;
  x: number;
  y: number;
  baseY: number;
  bobTicks: number;
  spawnSlotIndex?: number; // Índice del punto de spawn designado que generó esta arma
}

/**
 * Representa el estado y ciclo de vida de un punto de spawn designado en el mapa.
 * Permite que cada punto controle su propio ciclo de sustitución garantizando
 * que nunca se solapen o acumulen armas en la misma ubicación.
 */
interface WeaponSpawnSlot {
  slotIndex: number;
  x: number;
  y: number;
  currentWeaponId: number | null; // ID del arma actual en este punto (null si ya fue recogida)
  timer: number;                  // Contador de ticks para el siguiente ciclo de reemplazo
  spawnInterval: number;          // Ticks totales requeridos para el reemplazo
  lastWeaponType?: WeaponType;    // Último tipo de arma generada para promover variedad
}

interface MedkitEntity {
  id: number;
  x: number;
  y: number;
  baseY: number;
  bobTicks: number;
}

interface DestructibleCrateEntity {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  health: number;
  maxHealth: number;
  vx?: number;
  vy?: number;
}

interface ExplosiveBarrelEntity {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  health: number;
  maxHealth: number;
  vx?: number;
  vy?: number;
}

interface ConveyorEntity {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  direction: 'left' | 'right';
}

interface HydraulicPressEntity {
  id: string;
  x: number;
  baseY: number;
  currentY: number;
  w: number;
  h: number;
  tick: number;
  cycle: number;
  maxDrop: number;
  crushDamage: number;
  hasSlammedThisCycle: boolean;
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
  gameMode = 'vsBot',
  playerFaction = BotFaction.Assassin,
  botFaction,
  maxRounds,
  worldId = 'classic',
  onExitToMenu,
  onMatchComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dimensiones de la arena
  const ARENA_WIDTH = 960;
  const ARENA_HEIGHT = 540;

  const playerArch = getBotArchetype(playerFaction);
  const botArch = getBotArchetype(botFaction);
  const currentWorld = getWorldConfig(worldId);

  // React state for HUD
  const [hudState, setHudState] = useState({
    p1Health: 100,
    p1MaxHealth: 100,
    p1Stamina: 100,
    p1Weapon: WeaponType.Fists,
    p1Ammo: 0,
    p1MaxAmmo: -1,
    p1GrenadeType: GrenadeType.Frag,
    p1GrenadeCount: 3,
    p1GrenadeTotal: 3,
    p1GrenadeMax: GRENADE_MAX_CAPACITY,
    botHealth: botArch.maxHealth,
    botMaxHealth: botArch.maxHealth,
    botWeapon: WeaponType.Fists,
    botAmmo: 0,
    botGrenadeType: GrenadeType.Frag,
    botGrenadeCount: 3,
    round: 1,
    maxRounds,
    p1Score: 0,
    botScore: 0,
    announcement: '¡PELEA!',
    isRoundOver: false,
    isMatchOver: false,
    matchWinner: '',
    worldName: currentWorld.name,
  });

  // Esquema de controles en 1v1 Local ('wasd_p1': J1=WASD / J2=Flechas, 'arrows_p1': J1=Flechas / J2=WASD)
  const [controlScheme, setControlScheme] = useState<'wasd_p1' | 'arrows_p1'>('wasd_p1');
  const controlSchemeRef = useRef<'wasd_p1' | 'arrows_p1'>('wasd_p1');
  useEffect(() => {
    controlSchemeRef.current = controlScheme;
  }, [controlScheme]);

  // Estado mutado en el loop de 60Hz
  const stateRef = useRef<{
    p1: PlayerState;
    p1Controller: PlayerController;
    bot: PlayerState;
    p2Controller: PlayerController;
    botAI: ReturnType<typeof createBotFSMData>;
    projectiles: ProjectileEntity[];
    worldWeapons: WorldWeaponEntity[];
    weaponSlots: WeaponSpawnSlot[];
    p1Grenades: GrenadeInventory;
    botGrenades: GrenadeInventory;
    grenadePickups: GrenadePickupEntity[];
    smokeClouds: SmokeCloudEntity[];
    flashbangFlash: number;
    grenadeImages: Record<GrenadeType, HTMLImageElement>;
    medkits: MedkitEntity[];
    crates: DestructibleCrateEntity[];
    barrels: ExplosiveBarrelEntity[];
    conveyors: ConveyorEntity[];
    presses: HydraulicPressEntity[];
    fireZones: FireZone[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    platforms: PlatformRect[];
    worldConfig: WorldConfig;
    worldTick: number;
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
    keysJustPressed: { [key: string]: boolean };
    bgImage: HTMLImageElement | null;
    p1Sprite: HTMLImageElement | null;
    botSprite: HTMLImageElement | null;
    p1WalkSheet: HTMLImageElement | null;
    p1RunSheet: HTMLImageElement | null;
    p1RollSheet: HTMLImageElement | null;
    p1JumpSheet: HTMLImageElement | null;
    p1MeleeSheet: HTMLImageElement | null;
    p1OneHandSheet: HTMLImageElement | null;
    p1TwoHandSheet: HTMLImageElement | null;
    p1PistolSheet: HTMLImageElement | null;
    p1RifleSheet: HTMLImageElement | null;
    p1ThrowUpSheet: HTMLImageElement | null;
    p1IdleSprite: HTMLImageElement | null;
    p1SheetConfig: SpritesheetDef;
    botWalkSheet: HTMLImageElement | null;
    botRunSheet: HTMLImageElement | null;
    botRollSheet: HTMLImageElement | null;
    botJumpSheet: HTMLImageElement | null;
    botMeleeSheet: HTMLImageElement | null;
    botOneHandSheet: HTMLImageElement | null;
    botTwoHandSheet: HTMLImageElement | null;
    botPistolSheet: HTMLImageElement | null;
    botRifleSheet: HTMLImageElement | null;
    botThrowUpSheet: HTMLImageElement | null;
    botIdleSprite: HTMLImageElement | null;
    botSheetConfig: SpritesheetDef;
    weaponImages: Record<string, HTMLImageElement>;
    swordComboSheet: HTMLImageElement | null;
    botQuiet: boolean;
  } | null>(null);

  // Helper para generar entidades interactivas del mundo
  const createWorldHazards = useCallback((world: WorldConfig) => {
    const crates: DestructibleCrateEntity[] = [];
    const barrels: ExplosiveBarrelEntity[] = [];
    const conveyors: ConveyorEntity[] = [];
    const presses: HydraulicPressEntity[] = [];

    world.hazards.forEach((h) => {
      if (h.type === 'destructible_crate') {
        crates.push({
          id: h.id,
          x: h.x,
          y: h.y,
          w: h.w,
          h: h.h,
          health: h.health || 25,
          maxHealth: h.maxHealth || 25,
          vx: 0,
          vy: 0,
        });
      } else if (h.type === 'explosive_barrel') {
        barrels.push({
          id: h.id,
          x: h.x,
          y: h.y,
          w: h.w,
          h: h.h,
          health: h.health || 30,
          maxHealth: h.maxHealth || 30,
          vx: 0,
          vy: 0,
        });
      } else if (h.type === 'conveyor_belt') {
        conveyors.push({
          id: h.id,
          x: h.x,
          y: h.y,
          w: h.w,
          h: h.h,
          speed: h.speed || 2.4,
          direction: h.direction || 'right',
        });
      } else if (h.type === 'hydraulic_press') {
        presses.push({
          id: h.id,
          x: h.x,
          baseY: h.y,
          currentY: h.y,
          w: h.w,
          h: h.h,
          tick: 0,
          cycle: h.cyclePeriodTicks || 180,
          maxDrop: h.maxDropY || 100,
          crushDamage: h.crushDamage || 40,
          hasSlammedThisCycle: false,
        });
      }
    });

    return { crates, barrels, conveyors, presses };
  }, []);

  // Helpers de combate y efectos de partículas
  const addSparks = (x: number, y: number, color: string, count: number = 8) => {
    if (!stateRef.current) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 90;
      stateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 10 + Math.random() * 12,
        maxLife: 22,
        color,
        size: 1.5 + Math.random() * 2,
      });
    }
  };

  // ─────────────────────────────────────────────────────────────
  // SISTEMA MODULAR DE GESTIÓN Y CICLO DE VIDA DE ARMAS (SPAWN SLOTS)
  // ─────────────────────────────────────────────────────────────

  /**
   * Inicializa la estructura de puntos de spawn asignados para la arena.
   * Cada slot mantiene su estado, el ID del arma actualmente presente y
   * su temporizador para el siguiente reemplazo.
   */
  const initializeWeaponSpawnSlots = (worldCfg: WorldConfig): WeaponSpawnSlot[] => {
    return worldCfg.weaponSpawns.map((pos, idx) => ({
      slotIndex: idx,
      x: pos.x,
      y: pos.y,
      currentWeaponId: null,
      timer: idx * 180, // Escalonamiento inicial para que las armas no ciclen en el mismo fotograma
      spawnInterval: 780 + (idx % 3) * 60, // Ciclo individual de ~13 a 15 segundos (a 60 FPS)
      lastWeaponType: undefined,
    }));
  };

  /**
   * Destruye de forma segura el arma presente en un punto de spawn específico.
   * REGLA ESTRICTA: El arma anterior se elimina automáticamente antes de instanciar la nueva.
   * Incluye comprobaciones estrictas de nulidad (null-checks): si el combatiente ya había
   * recogido el arma antes del ciclo de spawn, la referencia nula se gestiona limpiamente sin errores.
   *
   * @param s Estado activo de la partida
   * @param slotIndex Índice del punto de spawn designado
   * @param triggerVisuals Determina si genera partículas de desvanecimiento
   * @returns Entidad eliminada o null si no había ninguna arma tirada en el punto
   */
  const destroyWeaponAtSpawnSlot = (
    s: NonNullable<typeof stateRef.current>,
    slotIndex: number,
    triggerVisuals: boolean = true
  ): WorldWeaponEntity | null => {
    if (!s || !s.weaponSlots || !s.weaponSlots[slotIndex]) return null;
    const slot = s.weaponSlots[slotIndex];

    // Validación de nulidad: si no hay arma registrada actualmente en este slot, salir limpiamente
    if (slot.currentWeaponId === null) {
      return null;
    }

    // Buscar el índice del arma en la lista del mundo por ID o proximidad al spawn point
    const targetId = slot.currentWeaponId;
    const weaponIdx = s.worldWeapons.findIndex(
      (w) => w && (w.id === targetId || (w.spawnSlotIndex === slotIndex && Math.hypot(w.x - slot.x, w.baseY - slot.y) < 26))
    );

    // Validación de nulidad: si el arma ya fue recogida o eliminada previamente
    if (weaponIdx === -1) {
      slot.currentWeaponId = null;
      return null;
    }

    const removedWeapon = s.worldWeapons[weaponIdx];
    if (!removedWeapon) {
      slot.currentWeaponId = null;
      return null;
    }

    // Efecto visual sutil de desmaterialización / reemplazo del arma obsoleta
    if (triggerVisuals) {
      addSparks(removedWeapon.x, removedWeapon.y, '#94a3b8', 8);
      addSparks(removedWeapon.x, removedWeapon.y, '#38bdf8', 6);
    }

    // Destrucción y eliminación limpia del arreglo del mundo
    s.worldWeapons.splice(weaponIdx, 1);
    slot.currentWeaponId = null;

    return removedWeapon;
  };

  /**
   * Instancia una nueva arma en el punto de spawn designado.
   * Cumple con la regla estricta:
   * 1. Destruye automáticamente cualquier arma previa en este punto exacto (si aún sigue allí).
   * 2. Instancia la nueva arma en las coordenadas exactas del spawn point.
   * 3. Reinicia el temporizador del ciclo de vida para este punto.
   *
   * @param s Estado activo de la partida
   * @param slotIndex Índice del punto de spawn designado
   * @param forcedWeaponType Tipo opcional forzado de arma
   * @returns La nueva entidad WorldWeaponEntity instanciada
   */
  const instantiateWeaponAtSpawnSlot = (
    s: NonNullable<typeof stateRef.current>,
    slotIndex: number,
    forcedWeaponType?: WeaponType
  ): WorldWeaponEntity | null => {
    if (!s || !s.weaponSlots || !s.weaponSlots[slotIndex]) return null;
    const slot = s.weaponSlots[slotIndex];

    // 1. DESTRUCCIÓN PREVIA: Asegurar que el arma anterior desaparezca antes de generar la nueva
    destroyWeaponAtSpawnSlot(s, slotIndex, true);

    // 2. SELECCIÓN DE ARMA: Elegir un arma aleatoria del catálogo (priorizando variedad)
    let selectedWeaponType = forcedWeaponType;
    if (!selectedWeaponType) {
      const candidates = SpawnableWeaponsList.filter((w) => w !== slot.lastWeaponType);
      const pool = candidates.length > 0 ? candidates : SpawnableWeaponsList;
      selectedWeaponType = pool[Math.floor(Math.random() * pool.length)];
    }

    // 3. INSTANCIACIÓN: Crear la nueva entidad en el punto exacto
    const newId = s.nextEntityId++;
    const newWeapon: WorldWeaponEntity = {
      id: newId,
      weaponType: selectedWeaponType,
      x: slot.x,
      y: slot.y,
      baseY: slot.y,
      bobTicks: slotIndex * 15,
      spawnSlotIndex: slotIndex,
    };

    // 4. REGISTRO EN EL MUNDO Y SLOT:
    s.worldWeapons.push(newWeapon);
    slot.currentWeaponId = newId;
    slot.lastWeaponType = selectedWeaponType;
    slot.timer = 0; // Reinicio estricto del temporizador del ciclo

    // Efecto visual de aparición del arma
    addSparks(slot.x, slot.y, '#38bdf8', 12);

    return newWeapon;
  };

  /**
   * Actualiza el ciclo de vida y temporizadores de todos los puntos de spawn en el mapa.
   * Ejecutado en el tick principal a 60Hz. Cuando un punto cumple su tiempo de ciclo,
   * reemplaza el arma automáticamente llamando a `instantiateWeaponAtSpawnSlot`.
   */
  const updateWeaponSpawns = (s: NonNullable<typeof stateRef.current>): void => {
    if (!s || !s.weaponSlots || s.weaponSlots.length === 0) return;

    for (let i = 0; i < s.weaponSlots.length; i++) {
      const slot = s.weaponSlots[i];
      if (!slot) continue;

      slot.timer++;

      // Al cumplirse el temporizador del ciclo para este punto exacto:
      if (slot.timer >= slot.spawnInterval) {
        instantiateWeaponAtSpawnSlot(s, i);
      }
    }
  };

  // Inicializar estado del juego
  useEffect(() => {
    const worldCfg = getWorldConfig(worldId);
    const effectiveP1Faction = BotFaction.Ninja;
    const effectiveP2Faction = gameMode === 'local1v1' ? BotFaction.Ninja : botFaction;

    const arch = getBotArchetype(effectiveP2Faction);
    const pArch = getBotArchetype(effectiveP1Faction);

    const spawnP1 = worldCfg.spawns[0] || { x: 200, y: 460 };
    const spawnBot = worldCfg.spawns[1] || { x: 760, y: 460 };

    const p1Label = gameMode === 'local1v1' ? 'NINJA (J1)' : 'NINJA';
    const p2Label = gameMode === 'local1v1' ? 'NINJA (J2)' : arch.name.toUpperCase();

    const p1 = createPlayerState(1, p1Label, false, spawnP1.x, spawnP1.y);
    p1.maxHealth = pArch.maxHealth;
    p1.health = pArch.maxHealth;
    p1.speedModifier = pArch.speedModifier;
    p1.damageDealtModifier = pArch.damageDealtModifier;
    p1.damageTakenModifier = pArch.damageTakenModifier;
    p1.meleeForceModifier = pArch.meleeForceModifier;
    p1.equippedWeapon = WeaponType.Katana;
    p1.characterState = 'arma_una_mano';
    p1.weaponState = 'arma_una_mano';
    p1.ammo = 0;
    p1.isSwordAttacking = false;
    p1.swordComboStep = 0;
    p1.swordAnimFrame = 0;
    p1.swordAnimTimer = 0;
    p1.swordHasHit = false;
    p1.swordComboBuffered = false;
    p1.swordComboWindowTicks = 0;

    const bot = createPlayerState(2, p2Label, gameMode !== 'local1v1', spawnBot.x, spawnBot.y);
    bot.maxHealth = arch.maxHealth;
    bot.health = arch.maxHealth;
    bot.speedModifier = arch.speedModifier;
    bot.damageDealtModifier = arch.damageDealtModifier;
    bot.damageTakenModifier = arch.damageTakenModifier;
    bot.meleeForceModifier = arch.meleeForceModifier;
    bot.equippedWeapon = WeaponType.Fists;
    bot.ammo = 0;
    bot.characterState = 'desarmado';
    bot.weaponState = 'desarmado';
    bot.isSwordAttacking = false;
    bot.swordComboStep = 0;
    bot.swordAnimFrame = 0;
    bot.swordAnimTimer = 0;
    bot.swordHasHit = false;
    bot.swordComboBuffered = false;
    bot.swordComboWindowTicks = 0;
    bot.isTwoHandAttacking = false;
    bot.twoHandAnimFrame = 0;
    bot.twoHandAnimTimer = 0;
    bot.twoHandHasHit = false;
    bot.isOneHandAttacking = false;
    bot.oneHandAnimFrame = 0;
    bot.oneHandAnimTimer = 0;
    bot.oneHandHasHit = false;
    bot.isPistolShooting = false;
    bot.pistolAnimFrame = 0;
    bot.pistolAnimTimer = 0;
    bot.pistolHasFired = false;
    bot.isRifleShooting = false;
    bot.rifleAnimFrame = 0;
    bot.rifleAnimTimer = 0;
    bot.rifleHasFired = false;
    bot.isThrowing = false;
    bot.throwAnimFrame = 0;
    bot.throwAnimTimer = 0;
    bot.throwHasReleased = false;
    bot.isMeleeComboAttacking = false;
    bot.meleeComboStep = 0;
    bot.meleeAnimFrame = 0;
    bot.meleeAnimTimer = 0;
    bot.meleeHasHit = false;
    bot.comboStep = 0;
    bot.comboBuffered = false;
    bot.comboWindowTicks = 0;

    // Cargar imagen de fondo si es el mundo clásico
    let bgImg: HTMLImageElement | null = null;
    if (worldCfg.id === 'classic') {
      bgImg = new Image();
      bgImg.src = '/assets/backgrounds/warehouse.jpg';
    }

    // Carga de Spritesheet y texturas para P1 y Bot según su facción seleccionada
    const p1Cfg = CHARACTER_SPRITESHEETS[effectiveP1Faction] || {
      idleUrl: pArch.spriteUrl || '/assets/sprites/player/ninja.png',
      hasWalkSheet: false,
    };
    const botCfg = (gameMode === 'local1v1' || effectiveP2Faction === BotFaction.Ninja)
      ? (CHARACTER_SPRITESHEETS[BotFaction.Ninja] || p1Cfg)
      : (CHARACTER_SPRITESHEETS[effectiveP2Faction] || {
          idleUrl: arch.spriteUrl || '/assets/sprites/bot/thug.png',
          hasWalkSheet: false,
        });

    let p1WalkSheet: HTMLImageElement | null = null;
    if (p1Cfg.hasWalkSheet && p1Cfg.walkSheetUrl) {
      p1WalkSheet = new Image();
      p1WalkSheet.src = p1Cfg.walkSheetUrl;
    }

    let p1RunSheet: HTMLImageElement | null = null;
    if (p1Cfg.hasRunSheet && p1Cfg.runSheetUrl) {
      p1RunSheet = new Image();
      p1RunSheet.src = p1Cfg.runSheetUrl;
    }

    let p1RollSheet: HTMLImageElement | null = null;
    if (p1Cfg.hasRollSheet && p1Cfg.rollSheetUrl) {
      p1RollSheet = new Image();
      p1RollSheet.src = p1Cfg.rollSheetUrl;
    }

    let p1JumpSheet: HTMLImageElement | null = null;
    if (p1Cfg.hasJumpSheet && p1Cfg.jumpSheetUrl) {
      p1JumpSheet = new Image();
      p1JumpSheet.src = p1Cfg.jumpSheetUrl;
    }

    let p1MeleeSheet: HTMLImageElement | null = null;
    if (p1Cfg.hasMeleeSheet && p1Cfg.meleeSheetUrl) {
      p1MeleeSheet = new Image();
      p1MeleeSheet.src = p1Cfg.meleeSheetUrl;
    } else if (effectiveP1Faction === BotFaction.Ninja) {
      p1MeleeSheet = new Image();
      p1MeleeSheet.src = '/assets/sprites/player/ninja_melee.png';
    }

    let p1OneHandSheet: HTMLImageElement | null = null;
    if (p1Cfg.hasOneHandAttackSheet && p1Cfg.oneHandAttackSheetUrl) {
      p1OneHandSheet = new Image();
      p1OneHandSheet.src = p1Cfg.oneHandAttackSheetUrl;
    } else if (effectiveP1Faction === BotFaction.Ninja) {
      p1OneHandSheet = new Image();
      p1OneHandSheet.src = '/assets/sprites/player/one_hand_attack.png';
    }

    let p1TwoHandSheet: HTMLImageElement | null = null;
    if (p1Cfg.hasTwoHandAttackSheet && p1Cfg.twoHandAttackSheetUrl) {
      p1TwoHandSheet = new Image();
      p1TwoHandSheet.src = p1Cfg.twoHandAttackSheetUrl;
    } else if (effectiveP1Faction === BotFaction.Ninja) {
      p1TwoHandSheet = new Image();
      p1TwoHandSheet.src = '/assets/sprites/player/two_hand_attack.png';
    }

    let p1PistolSheet: HTMLImageElement | null = null;
    if (p1Cfg.hasPistolShootSheet && p1Cfg.pistolShootSheetUrl) {
      p1PistolSheet = new Image();
      p1PistolSheet.src = p1Cfg.pistolShootSheetUrl;
    } else if (effectiveP1Faction === BotFaction.Ninja) {
      p1PistolSheet = new Image();
      p1PistolSheet.src = '/assets/sprites/player/pistol_shoot.png';
    }

    let p1RifleSheet: HTMLImageElement | null = null;
    if (p1Cfg.hasRifleShootSheet && p1Cfg.rifleShootSheetUrl) {
      p1RifleSheet = new Image();
      p1RifleSheet.src = p1Cfg.rifleShootSheetUrl;
    } else if (effectiveP1Faction === BotFaction.Ninja) {
      p1RifleSheet = new Image();
      p1RifleSheet.src = '/assets/sprites/player/rifle_shoot.png';
    }

    let p1ThrowUpSheet: HTMLImageElement | null = null;
    if (p1Cfg.hasThrowUpSheet && p1Cfg.throwUpSheetUrl) {
      p1ThrowUpSheet = new Image();
      p1ThrowUpSheet.src = p1Cfg.throwUpSheetUrl;
    } else if (effectiveP1Faction === BotFaction.Ninja) {
      p1ThrowUpSheet = new Image();
      p1ThrowUpSheet.src = '/assets/sprites/player/throw_up.png';
    }

    const p1IdleSprite = new Image();
    p1IdleSprite.src = p1Cfg.idleUrl || pArch.spriteUrl || '/assets/sprites/player/Assassin_2.png';

    let botWalkSheet: HTMLImageElement | null = null;
    if (botCfg.hasWalkSheet && botCfg.walkSheetUrl) {
      botWalkSheet = new Image();
      botWalkSheet.src = botCfg.walkSheetUrl;
    }

    let botRunSheet: HTMLImageElement | null = null;
    if (botCfg.hasRunSheet && botCfg.runSheetUrl) {
      botRunSheet = new Image();
      botRunSheet.src = botCfg.runSheetUrl;
    }

    let botRollSheet: HTMLImageElement | null = null;
    if (botCfg.hasRollSheet && botCfg.rollSheetUrl) {
      botRollSheet = new Image();
      botRollSheet.src = botCfg.rollSheetUrl;
    }

    let botJumpSheet: HTMLImageElement | null = null;
    if (botCfg.hasJumpSheet && botCfg.jumpSheetUrl) {
      botJumpSheet = new Image();
      botJumpSheet.src = botCfg.jumpSheetUrl;
    }

    let botMeleeSheet: HTMLImageElement | null = null;
    let botOneHandSheet: HTMLImageElement | null = null;
    let botTwoHandSheet: HTMLImageElement | null = null;
    let botPistolSheet: HTMLImageElement | null = null;
    let botRifleSheet: HTMLImageElement | null = null;
    let botThrowUpSheet: HTMLImageElement | null = null;

    if (gameMode === 'local1v1' || effectiveP2Faction === BotFaction.Ninja) {
      botWalkSheet = p1WalkSheet;
      botRunSheet = p1RunSheet;
      botRollSheet = p1RollSheet;
      botJumpSheet = p1JumpSheet;
      botMeleeSheet = p1MeleeSheet;
      botOneHandSheet = p1OneHandSheet;
      botTwoHandSheet = p1TwoHandSheet;
      botPistolSheet = p1PistolSheet;
      botRifleSheet = p1RifleSheet;
      botThrowUpSheet = p1ThrowUpSheet;
    }

    const botIdleSprite = new Image();
    botIdleSprite.src = (gameMode === 'local1v1' || effectiveP2Faction === BotFaction.Ninja)
      ? (p1Cfg.idleUrl || '/assets/sprites/player/ninja.png')
      : (botCfg.idleUrl || arch.spriteUrl || '/assets/sprites/bot/agent.png');

    // Preload weapon sprites
    const weaponImages: Record<string, HTMLImageElement> = {};
    Object.values(WeaponDatabase).forEach((w) => {
      if (w.iconUrl) {
        const wImg = new Image();
        wImg.src = w.iconUrl;
        weaponImages[w.type] = wImg;
      }
    });

    const swordComboSheet = new Image();
    swordComboSheet.src = '/assets/aistudio/assasin-asm_sword_triple_combo_3a606114.png';

    // Preload grenade sprites
    const grenadeImages = {} as Record<GrenadeType, HTMLImageElement>;
    Object.values(GRENADE_DATABASE).forEach((g) => {
      const gImg = new Image();
      gImg.src = g.iconUrl;
      grenadeImages[g.type] = gImg;
    });

    // Inicialización de slots de spawn y armas en el mundo
    const weaponSlots = initializeWeaponSpawnSlots(worldCfg);
    const worldWeapons: WorldWeaponEntity[] = [];

    weaponSlots.forEach((slot, idx) => {
      const weaponType = SpawnableWeaponsList[Math.floor(Math.random() * SpawnableWeaponsList.length)];
      const wId = idx + 1;
      worldWeapons.push({
        id: wId,
        weaponType,
        x: slot.x,
        y: slot.y,
        baseY: slot.y,
        bobTicks: idx * 20,
        spawnSlotIndex: idx,
      });
      slot.currentWeaponId = wId;
      slot.lastWeaponType = weaponType;
    });

    const hazards = createWorldHazards(worldCfg);

    stateRef.current = {
      p1,
      p1Controller: new PlayerController(spawnP1.x, spawnP1.y, true, 1),
      bot,
      p2Controller: new PlayerController(spawnBot.x, spawnBot.y, false, 2),
      botAI: createBotFSMData(arch.aiType),
      botQuiet: true,
      projectiles: [],
      worldWeapons,
      weaponSlots,
      p1Grenades: createGrenadeInventory(GRENADE_MAX_CAPACITY, GrenadeType.Frag, GRENADE_INITIAL_COUNT),
      botGrenades: createGrenadeInventory(GRENADE_MAX_CAPACITY, GrenadeType.Frag, GRENADE_INITIAL_COUNT),
      grenadePickups: [],
      smokeClouds: [],
      flashbangFlash: 0,
      grenadeImages,
      medkits: [],
      crates: hazards.crates,
      barrels: hazards.barrels,
      conveyors: hazards.conveyors,
      presses: hazards.presses,
      fireZones: [],
      particles: [],
      floatingTexts: [],
      platforms: worldCfg.platforms,
      worldConfig: worldCfg,
      worldTick: 0,
      screenShake: 0,
      weaponSpawnTimer: 300,
      round: 1,
      p1Score: 0,
      botScore: 0,
      roundActive: true,
      announcement: '¡PELEA!',
      announcementTicks: 90,
      nextEntityId: 20,
      keys: {},
      keysJustPressed: {},
      bgImage: bgImg,
      p1Sprite: p1IdleSprite,
      botSprite: botIdleSprite,
      p1WalkSheet,
      p1RunSheet,
      p1RollSheet,
      p1JumpSheet,
      p1MeleeSheet,
      p1OneHandSheet,
      p1TwoHandSheet,
      p1PistolSheet,
      p1RifleSheet,
      p1ThrowUpSheet,
      p1IdleSprite,
      p1SheetConfig: p1Cfg,
      botWalkSheet,
      botRunSheet,
      botRollSheet,
      botJumpSheet,
      botMeleeSheet,
      botOneHandSheet,
      botTwoHandSheet,
      botPistolSheet,
      botRifleSheet,
      botThrowUpSheet,
      botIdleSprite,
      botSheetConfig: botCfg,
      weaponImages,
      swordComboSheet,
    };

    // Iniciar ambientación procedural del mundo
    sounds.startWorldAmbient(worldCfg.ambientSound);
    sounds.playRoundGong(true);

    return () => {
      sounds.stopWorldAmbient();
      stateRef.current = null;
    };
  }, [botFaction, playerFaction, maxRounds, worldId, createWorldHazards]);

  // Reiniciar ronda o revancha manteniendo el mundo elegido
  const restartRound = useCallback((isFullRematch: boolean = false) => {
    if (!stateRef.current) return;
    const s = stateRef.current;
    const worldCfg = s.worldConfig;
    const effectiveP1Faction = BotFaction.Ninja;
    const effectiveP2Faction = gameMode === 'local1v1' ? BotFaction.Ninja : botFaction;
    const arch = getBotArchetype(effectiveP2Faction);
    const pArch = getBotArchetype(effectiveP1Faction);

    const spawnP1 = worldCfg.spawns[0] || { x: 200, y: 460 };
    const spawnBot = worldCfg.spawns[1] || { x: 760, y: 460 };

    if (isFullRematch) {
      s.p1Score = 0;
      s.botScore = 0;
      s.round = 1;
      setHudState((prev) => ({
        ...prev,
        p1Score: 0,
        botScore: 0,
        round: 1,
        isMatchOver: false,
        matchWinner: '',
      }));
    }

    const p1Label = gameMode === 'local1v1' ? 'NINJA (J1)' : 'NINJA';
    const p2Label = gameMode === 'local1v1' ? 'NINJA (J2)' : arch.name.toUpperCase();

    s.p1 = createPlayerState(1, p1Label, false, spawnP1.x, spawnP1.y);
    s.p1.maxHealth = pArch.maxHealth;
    s.p1.health = pArch.maxHealth;
    s.p1.speedModifier = pArch.speedModifier;
    s.p1.damageDealtModifier = pArch.damageDealtModifier;
    s.p1.damageTakenModifier = pArch.damageTakenModifier;
    s.p1.meleeForceModifier = pArch.meleeForceModifier;
    s.p1.equippedWeapon = WeaponType.Katana;
    s.p1.ammo = 0;
    s.p1.characterState = 'arma_una_mano';
    s.p1.weaponState = 'arma_una_mano';
    s.p1.isTwoHandAttacking = false;
    s.p1.twoHandAnimFrame = 0;
    s.p1.twoHandAnimTimer = 0;
    s.p1.twoHandHasHit = false;
    s.p1.isPistolShooting = false;
    s.p1.pistolAnimFrame = 0;
    s.p1.pistolAnimTimer = 0;
    s.p1.pistolHasFired = false;
    s.p1.isRifleShooting = false;
    s.p1.rifleAnimFrame = 0;
    s.p1.rifleAnimTimer = 0;
    s.p1.rifleHasFired = false;
    s.p1.isThrowing = false;
    s.p1.throwAnimFrame = 0;
    s.p1.throwAnimTimer = 0;
    s.p1.throwHasReleased = false;
    if (s.p1Controller) {
      s.p1Controller.setPlayerId(1);
      s.p1Controller.setPosition(spawnP1.x, spawnP1.y);
      s.p1Controller.facingRight = true;
      s.p1Controller.isShootingPistol = false;
      s.p1Controller.isShootingRifle = false;
      s.p1Controller.isThrowing = false;
      s.p1Controller.hasHeavyRifleEquipped = false;
    }

    s.bot = createPlayerState(2, p2Label, gameMode !== 'local1v1', spawnBot.x, spawnBot.y);
    s.bot.maxHealth = arch.maxHealth;
    s.bot.health = arch.maxHealth;
    s.bot.speedModifier = arch.speedModifier;
    s.bot.damageDealtModifier = arch.damageDealtModifier;
    s.bot.damageTakenModifier = arch.damageTakenModifier;
    s.bot.meleeForceModifier = arch.meleeForceModifier;
    s.bot.equippedWeapon = WeaponType.Fists;
    s.bot.ammo = 0;
    s.bot.characterState = 'desarmado';
    s.bot.weaponState = 'desarmado';
    s.bot.isTwoHandAttacking = false;
    s.bot.twoHandAnimFrame = 0;
    s.bot.twoHandAnimTimer = 0;
    s.bot.twoHandHasHit = false;
    s.bot.isOneHandAttacking = false;
    s.bot.oneHandAnimFrame = 0;
    s.bot.oneHandAnimTimer = 0;
    s.bot.oneHandHasHit = false;
    s.bot.isPistolShooting = false;
    s.bot.pistolAnimFrame = 0;
    s.bot.pistolAnimTimer = 0;
    s.bot.pistolHasFired = false;
    s.bot.isRifleShooting = false;
    s.bot.rifleAnimFrame = 0;
    s.bot.rifleAnimTimer = 0;
    s.bot.rifleHasFired = false;
    s.bot.isThrowing = false;
    s.bot.throwAnimFrame = 0;
    s.bot.throwAnimTimer = 0;
    s.bot.throwHasReleased = false;
    s.bot.isMeleeComboAttacking = false;
    s.bot.meleeComboStep = 0;
    s.bot.meleeAnimFrame = 0;
    s.bot.meleeAnimTimer = 0;
    s.bot.meleeHasHit = false;
    s.bot.comboStep = 0;
    s.bot.comboBuffered = false;
    s.bot.comboWindowTicks = 0;
    if (s.p2Controller) {
      s.p2Controller.setPlayerId(2);
      s.p2Controller.setPosition(spawnBot.x, spawnBot.y);
      s.p2Controller.facingRight = false;
      s.p2Controller.isShootingPistol = false;
      s.p2Controller.isShootingRifle = false;
      s.p2Controller.isThrowing = false;
      s.p2Controller.hasHeavyRifleEquipped = false;
    }

    // Reinicializar puntos de spawn y armas en plataformas
    s.weaponSlots = initializeWeaponSpawnSlots(worldCfg);
    s.worldWeapons = [];
    s.weaponSlots.forEach((slot, idx) => {
      const weaponType = SpawnableWeaponsList[Math.floor(Math.random() * SpawnableWeaponsList.length)];
      const wId = s.nextEntityId++;
      s.worldWeapons.push({
        id: wId,
        weaponType,
        x: slot.x,
        y: slot.y,
        baseY: slot.y,
        bobTicks: idx * 20,
        spawnSlotIndex: idx,
      });
      slot.currentWeaponId = wId;
      slot.lastWeaponType = weaponType;
    });

    // Regenerar peligros si es revancha o se quedaron vacíos
    if (isFullRematch || s.crates.length === 0 || s.barrels.length === 0) {
      const hazards = createWorldHazards(worldCfg);
      s.crates = hazards.crates;
      s.barrels = hazards.barrels;
      s.conveyors = hazards.conveyors;
      s.presses = hazards.presses;
    }

    s.medkits = [];
    s.projectiles = [];
    s.particles = [];
    s.fireZones = [];
    s.floatingTexts = [];
    s.p1Grenades = createGrenadeInventory(GRENADE_MAX_CAPACITY, GrenadeType.Frag, GRENADE_INITIAL_COUNT);
    s.botGrenades = createGrenadeInventory(GRENADE_MAX_CAPACITY, GrenadeType.Frag, GRENADE_INITIAL_COUNT);
    s.grenadePickups = [];
    s.smokeClouds = [];
    s.flashbangFlash = 0;
    s.roundActive = true;
    s.announcement = '¡PELEA!';
    s.announcementTicks = 90;
    s.weaponSpawnTimer = 300;

    sounds.playRoundGong(true);
  }, [botFaction, playerFaction, createWorldHazards]);

  // Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!stateRef.current) return;
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'space'].includes(key)) {
        e.preventDefault();
      }
      if (!stateRef.current.keys[key]) {
        stateRef.current.keysJustPressed[key] = true;
      }
      stateRef.current.keys[key] = true;

      if (key === 'r') {
        restartRound(stateRef.current.p1Score >= Math.floor(maxRounds / 2) + 1 || stateRef.current.botScore >= Math.floor(maxRounds / 2) + 1);
      }
      if (key === 'c' || key === 't') {
        const nextType = cycleGrenadeType(stateRef.current.p1Grenades);
        const gCfg = GRENADE_DATABASE[nextType];
        sounds.playPickup();
        stateRef.current.floatingTexts.push({
          id: stateRef.current.nextEntityId++,
          text: `EQUIPADA: ${gCfg.shortName} (${stateRef.current.p1Grenades.ammo[nextType]} disp.)`,
          x: stateRef.current.p1.x,
          y: stateRef.current.p1.y - 35,
          color: gCfg.color,
          life: 30,
        });
      }
      if (key === 'y' && gameMode === 'local1v1') {
        cycleGrenadeType(stateRef.current.botGrenades);
      }
      if (key === 'b') {
        stateRef.current.botQuiet = !stateRef.current.botQuiet;
        stateRef.current.floatingTexts.push({
          id: stateRef.current.nextEntityId++,
          text: stateRef.current.botQuiet ? 'BOT: QUIETO (PRÁCTICA)' : 'BOT: IA ACTIVA',
          x: stateRef.current.bot.x,
          y: stateRef.current.bot.y - 45,
          color: stateRef.current.botQuiet ? '#38bdf8' : '#ef4444',
          life: 45,
        });
      }
      if (key === 'escape') {
        onExitToMenu();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!stateRef.current) return;
      const key = e.key.toLowerCase();
      stateRef.current.keys[key] = false;
      delete stateRef.current.keysJustPressed[key];
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onExitToMenu, restartRound, maxRounds]);

  // Helpers de combate y efectos
  const createExplosion = (
    x: number,
    y: number,
    radius: number,
    damage: number,
    spawnFire: boolean
  ) => {
    if (!stateRef.current) return;
    const s = stateRef.current;
    s.screenShake = 16;
    sounds.playExplosion();

    addSparks(x, y, '#f97316', 30);
    addSparks(x, y, '#ef4444', 20);
    addSparks(x, y, '#fde047', 15);

    if (spawnFire) {
      s.fireZones.push({
        x,
        y,
        radius: radius * 0.7,
        remainingTicks: 300,
      });
    }

    // Daño a combatientes
    [s.p1, s.bot].forEach((target) => {
      if (!target.isAlive) return;
      const dist = Math.hypot(target.x - x, target.y - y);
      if (dist < radius) {
        const falloff = 1 - dist / radius;
        const dealt = damage * falloff * target.damageTakenModifier;
        target.health = Math.max(0, target.health - dealt);
        target.fireTicks = 180;
        target.isOnFire = true;

        if (target.health <= 0) {
          target.health = 0;
          target.isAlive = false;
          PlayerFSM.tryTransition(target, PlayerFSMState.Dead);
          sounds.playHit();
        } else {
          PlayerFSM.tryTransition(target, PlayerFSMState.KnockedDown);
        }

        if (target.id === s.p1.id) {
          s.p1.isMeleeComboAttacking = false;
          s.p1.comboStep = 0;
          s.p1.meleeComboStep = 0;
          s.p1.comboBuffered = false;
          s.p1.comboWindowTicks = 0;
          s.p1.isOneHandAttacking = false;
          s.p1.isTwoHandAttacking = false;
          s.p1.isPistolShooting = false;
          s.p1.isRifleShooting = false;
          s.p1.isThrowing = false;
        } else {
          s.bot.isMeleeComboAttacking = false;
          s.bot.comboStep = 0;
          s.bot.meleeComboStep = 0;
          s.bot.comboBuffered = false;
          s.bot.comboWindowTicks = 0;
          s.bot.isOneHandAttacking = false;
          s.bot.isTwoHandAttacking = false;
          s.bot.isPistolShooting = false;
          s.bot.isRifleShooting = false;
          s.bot.isThrowing = false;
        }

        s.floatingTexts.push({
          id: s.nextEntityId++,
          text: `-${Math.round(dealt)}`,
          x: target.x,
          y: target.y - 35,
          color: '#f97316',
          life: 40,
        });
      }
    });

    // Daño en cadena a cajas y barriles
    s.crates.forEach((c) => {
      const dist = Math.hypot(c.x + c.w / 2 - x, c.y + c.h / 2 - y);
      if (dist < radius) {
        c.health -= damage * (1 - dist / radius);
      }
    });

    s.barrels.forEach((b) => {
      const dist = Math.hypot(b.x + b.w / 2 - x, b.y + b.h / 2 - y);
      if (dist < radius) {
        b.health -= damage * (1 - dist / radius);
      }
    });
  };

  /**
   * Resuelve la detonación visual y física específica según el tipo de granada arrojada:
   * - Frag: Explosión HE clásica destructiva + onda expansiva
   * - Smoke: Cortina de humo denso persistente que bloquea visión
   * - Flashbang: Ráfaga enceguecedora + aturdimiento masivo (Hitstun) a combatientes
   * - Molotov: Impacto directo y generación de zona de fuego prolongada
   */
  const triggerGrenadeDetonation = (
    s: NonNullable<typeof stateRef.current>,
    pr: ProjectileEntity
  ) => {
    if (pr.weaponType === WeaponType.C4) {
      createExplosion(pr.x, pr.y, 85, pr.damage || 60, false);
      addSparks(pr.x, pr.y, '#ef4444', 35);
      addSparks(pr.x, pr.y, '#f97316', 25);
      s.screenShake = 22;
      sounds.playExplosion();
      return;
    }

    if (pr.weaponType === WeaponType.Mine) {
      createExplosion(pr.x, pr.y, 60, pr.damage || 45, false);
      addSparks(pr.x, pr.y, '#f59e0b', 28);
      s.screenShake = 14;
      sounds.playExplosion();
      return;
    }

    if (pr.weaponType === WeaponType.Baseball) {
      return;
    }

    const gType = pr.grenadeType || GrenadeType.Frag;
    const gCfg = GRENADE_DATABASE[gType];

    switch (gType) {
      case GrenadeType.Frag: {
        createExplosion(pr.x, pr.y, gCfg.explosionRadius, gCfg.damage, false);
        addSparks(pr.x, pr.y, '#f97316', 30);
        addSparks(pr.x, pr.y, '#e2e8f0', 20);
        addSparks(pr.x, pr.y, '#34d399', 15);
        s.screenShake = 16;
        sounds.playExplosion();
        break;
      }

      case GrenadeType.Smoke: {
        s.screenShake = 6;
        s.smokeClouds.push({
          id: s.nextEntityId++,
          x: pr.x,
          y: pr.y,
          radius: gCfg.explosionRadius,
          remainingTicks: gCfg.smokeDurationTicks || 360,
          maxTicks: gCfg.smokeDurationTicks || 360,
        });

        // 45 partículas densas de humo
        for (let k = 0; k < 45; k++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = 15 + Math.random() * 50;
          s.particles.push({
            x: pr.x + (Math.random() - 0.5) * 24,
            y: pr.y + (Math.random() - 0.5) * 18,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd * 0.4 - 10,
            life: 180 + Math.random() * 120,
            maxLife: 300,
            color: k % 2 === 0 ? 'rgba(203, 213, 225, 0.7)' : 'rgba(148, 163, 184, 0.6)',
            size: 14 + Math.random() * 16,
          });
        }

        [s.p1, s.bot].forEach((target) => {
          if (!target.isAlive) return;
          const dist = Math.hypot(target.x - pr.x, target.y - pr.y);
          if (dist < gCfg.explosionRadius) {
            target.health = Math.max(0, target.health - gCfg.damage);
          }
        });

        s.floatingTexts.push({
          id: s.nextEntityId++,
          text: '¡CORTINA DE HUMO!',
          x: pr.x,
          y: pr.y - 30,
          color: '#cbd5e1',
          life: 45,
        });
        break;
      }

      case GrenadeType.Flashbang: {
        s.flashbangFlash = 35;
        s.screenShake = 12;
        sounds.playRoundGong(false);

        addSparks(pr.x, pr.y, '#fef08a', 35);
        addSparks(pr.x, pr.y, '#ffffff', 25);
        addSparks(pr.x, pr.y, '#38bdf8', 15);

        [s.p1, s.bot].forEach((target) => {
          if (!target.isAlive) return;
          const dist = Math.hypot(target.x - pr.x, target.y - pr.y);
          if (dist < gCfg.explosionRadius) {
            target.health = Math.max(0, target.health - gCfg.damage);
            target.hitstunTicks = gCfg.stunTicks || 70;
            PlayerFSM.tryTransition(target, PlayerFSMState.Hitstun);
            s.floatingTexts.push({
              id: s.nextEntityId++,
              text: '¡CEGADO / ATURDIDO!',
              x: target.x,
              y: target.y - 35,
              color: '#facc15',
              life: 45,
            });
          }
        });
        break;
      }

      case GrenadeType.Molotov: {
        sounds.playExplosion();
        addSparks(pr.x, pr.y, '#f97316', 30);
        addSparks(pr.x, pr.y, '#93c5fd', 15);
        createExplosion(pr.x, pr.y, gCfg.explosionRadius, gCfg.damage, true);
        break;
      }
    }
  };

  // LOOP PRINCIPAL DE JUEGO (60Hz)
  useEffect(() => {
    let animId: number;

    const updateGame = () => {
      const s = stateRef.current;
      if (!s) return;

      s.worldTick++;
      const p1 = s.p1;
      const bot = s.bot;
      const keys = s.keys;

      // Destello blanco de golpe (Hit Flash Feedback)
      if (p1.hitFlashTicks > 0) p1.hitFlashTicks--;
      if (bot.hitFlashTicks > 0) bot.hitFlashTicks--;

      // Detección reactiva de daño para destello inmediato y partículas de impacto
      if ((p1 as any)._prevHealth !== undefined && p1.health < (p1 as any)._prevHealth) {
        p1.hitFlashTicks = 5;
        addSparks(p1.x, p1.y, '#ffffff', 8);
        addSparks(p1.x, p1.y, '#38bdf8', 6);
      }
      (p1 as any)._prevHealth = p1.health;

      if ((bot as any)._prevHealth !== undefined && bot.health < (bot as any)._prevHealth) {
        bot.hitFlashTicks = 5;
        addSparks(bot.x, bot.y, '#ffffff', 8);
        addSparks(bot.x, bot.y, '#f87171', 6);
      }
      (bot as any)._prevHealth = bot.health;

      // Anuncios
      if (s.announcementTicks > 0) {
        s.announcementTicks--;
        if (s.announcementTicks <= 0 && s.roundActive) {
          s.announcement = '';
        }
      }

      // Comprobar muerte automática si la salud llega a 0 o menos por cualquier daño
      if (p1.isAlive && p1.health <= 0) {
        p1.health = 0;
        p1.isAlive = false;
        PlayerFSM.tryTransition(p1, PlayerFSMState.Dead);
      }
      if (bot.isAlive && bot.health <= 0) {
        bot.health = 0;
        bot.isAlive = false;
        PlayerFSM.tryTransition(bot, PlayerFSMState.Dead);
      }

      // Fin de ronda y match
      if (s.roundActive && (!p1.isAlive || !bot.isAlive)) {
        s.roundActive = false;
        const p1Won = p1.isAlive;
        if (p1Won) {
          s.p1Score++;
          s.announcement = '¡JUGADOR 1 GANA!';
          sounds.playRoundGong(true);
        } else {
          s.botScore++;
          s.announcement = gameMode === 'local1v1' ? '¡JUGADOR 2 GANA!' : '¡BOT GANA!';
          sounds.playRoundGong(false);
        }
        s.announcementTicks = 150;

        const neededWins = Math.floor(maxRounds / 2) + 1;
        if (s.p1Score >= neededWins || s.botScore >= neededWins) {
          const matchWon = s.p1Score > s.botScore;
          setTimeout(() => {
            if (stateRef.current) {
              stateRef.current.announcement = matchWon
                ? '¡VICTORIA TOTAL!'
                : gameMode === 'local1v1'
                ? '¡VICTORIA DEL JUGADOR 2!'
                : '¡DERROTA!';
              stateRef.current.announcementTicks = 9999;
            }
            setHudState((prev) => ({
              ...prev,
              isMatchOver: true,
              matchWinner: matchWon
                ? '¡VICTORIA DEL JUGADOR 1!'
                : gameMode === 'local1v1'
                ? '¡VICTORIA DEL JUGADOR 2!'
                : '¡EL BOT HA VENCIDO!',
            }));
            if (onMatchComplete) onMatchComplete(matchWon);
          }, 2000);
        } else {
          setTimeout(() => {
            if (stateRef.current) {
              s.round++;
              restartRound(false);
            }
          }, 2500);
        }
      }

      // ─────────────────────────────────────────────────────────
      // 1. INPUT HUMANO (P1)
      // ─────────────────────────────────────────────────────────
      if (p1.isAlive && s.roundActive) {
        const is1v1 = gameMode === 'local1v1';
        const scheme = controlSchemeRef.current;
        s.p1Controller.setPlayerId(1);
        const p1RawInput = s.p1Controller.readInput(keys, s.keysJustPressed, is1v1, scheme);
        const p1Combat = s.p1Controller.readCombatInput(keys, s.keysJustPressed, is1v1, scheme);

        const moveDir = p1RawInput.moveDir;
        const leftKey = moveDir === -1;
        const rightKey = moveDir === 1;
        const runHeld = p1RawInput.run;
        const jumpJustPressed = p1RawInput.jump;
        const jumpHeld = p1RawInput.jumpHeld;
        const rollPressed = p1RawInput.roll;
        const dropThrough = !!p1RawInput.dropThrough;
        const crouchHeld = (scheme === 'wasd_p1')
          ? !!(keys['s'] || keys['S'] || (!is1v1 && keys['arrowdown']))
          : !!(keys['arrowdown'] || (!is1v1 && (keys['s'] || keys['S'])));

        const isNinjaComboLocked = !!p1.isSwordAttacking || !!p1.isMeleeComboAttacking || !!p1.isOneHandAttacking || !!p1.isTwoHandAttacking;

        const p1Input: PlayerInput = {
          moveDir: isNinjaComboLocked ? 0 : moveDir,
          run: isNinjaComboLocked ? false : runHeld,
          jump: isNinjaComboLocked ? false : jumpJustPressed,
          jumpHeld: isNinjaComboLocked ? false : jumpHeld,
          roll: isNinjaComboLocked ? false : rollPressed,
          dropThrough: isNinjaComboLocked ? false : dropThrough,
        };

        // Recuperación activa de derribo para P1 mediante teclas de movimiento (Flechas, salto, rodada)
        if (p1.fsm === PlayerFSMState.KnockedDown || p1.fsm === PlayerFSMState.GetUp) {
          const hasDirInput = moveDir !== 0;
          const hasVerticalInput = jumpJustPressed || (hasDirInput && rollPressed) || crouchHeld;
          const anyMovementPressed = hasDirInput || hasVerticalInput || (is1v1 ? !!keys['n'] || !!keys['m'] : !!keys['n'] || !!keys['j'] || !!keys['m'] || !!keys['k']);

          // Si presiona teclas tras un mínimo amortiguamiento de impacto (4 ticks)
          if (anyMovementPressed && p1.stateTicks >= 4) {
            if ((rollPressed && hasDirInput) || (crouchHeld && hasDirInput)) {
              // Rodada de escape / recuperación inmediata
              if (hasDirInput) p1.facingRight = moveDir > 0;
              PlayerFSM.tryTransition(p1, PlayerFSMState.Roll);
              s.p1Controller.setPosition(p1.x, p1.y);
              s.p1Controller.isOnFloor = p1.onGround;
              s.p1Controller.facingRight = p1.facingRight;
              s.p1Controller.state = ControllerState.Roll;
              p1.rollTicks = GameConstants.RollDurationTicks;
              p1.invulnerabilityTicks = 20;
              sounds.playRoll();
              s.floatingTexts.push({
                id: s.nextEntityId++,
                text: '¡RODADA DE RECUPERACIÓN!',
                x: p1.x,
                y: p1.y - 28,
                color: '#38bdf8',
                life: 25,
              });
            } else if (jumpJustPressed) {
              // Salto de recuperación vertical
              PlayerFSM.tryTransition(p1, PlayerFSMState.Jump);
              s.p1Controller.setPosition(p1.x, p1.y);
              s.p1Controller.isOnFloor = false;
              s.p1Controller.vy = -GameConstants.JumpVelocity;
              p1.velocityY = -GameConstants.JumpVelocity;
              p1.invulnerabilityTicks = 16;
              sounds.playJump();
              s.floatingTexts.push({
                id: s.nextEntityId++,
                text: '¡SALTO DE RECUPERACIÓN!',
                x: p1.x,
                y: p1.y - 28,
                color: '#4ade80',
                life: 25,
              });
            } else {
              // Levantarse inmediatamente al presionar flecha izquierda / derecha, o tecla de dirección
              if (hasDirInput) {
                p1.facingRight = moveDir > 0;
                s.p1Controller.facingRight = p1.facingRight;
              }
              PlayerFSM.tryTransition(p1, PlayerFSMState.Idle);
              s.p1Controller.setPosition(p1.x, p1.y);
              s.p1Controller.isOnFloor = p1.onGround;
              s.p1Controller.state = ControllerState.Idle;
              p1.invulnerabilityTicks = 18;
              addSparks(p1.x, p1.y + 12, '#38bdf8', 8);
              s.floatingTexts.push({
                id: s.nextEntityId++,
                text: '¡DE PIE!',
                x: p1.x,
                y: p1.y - 28,
                color: '#e2e8f0',
                life: 25,
              });
            }
          }
        }

        if (
          p1.fsm !== PlayerFSMState.KnockedDown &&
          p1.fsm !== PlayerFSMState.GetUp &&
          p1.fsm !== PlayerFSMState.Hitstun
        ) {
          const prevRoll = s.p1Controller.state === ControllerState.Roll;
          const prevJump = s.p1Controller.state === ControllerState.Jump;

          s.p1Controller.update(1 / 60, p1Input, s.platforms);

          if (p1.isMeleeComboAttacking || p1.isOneHandAttacking) {
            s.p1Controller.vx = 0;
            p1.velocityX = 0;
            s.p1Controller.state = ControllerState.Idle;
            p1.fsm = PlayerFSMState.MeleeAttack;
          }

          p1.x = s.p1Controller.x;
          p1.y = s.p1Controller.y;
          p1.velocityX = (p1.isMeleeComboAttacking || p1.isOneHandAttacking) ? 0 : s.p1Controller.vx;
          p1.velocityY = s.p1Controller.vy;
          p1.facingRight = s.p1Controller.facingRight;
          p1.onGround = s.p1Controller.isOnFloor;

          if (s.p1Controller.state === ControllerState.Roll) {
            if (!prevRoll) {
              sounds.playRoll();
              p1.rollTicks = GameConstants.RollDurationTicks;
            }
            p1.fsm = PlayerFSMState.Roll;
            if (Math.random() < 0.65) {
              const dustDir = p1.facingRight ? -1 : 1;
              s.particles.push({
                x: p1.x + dustDir * 10,
                y: p1.y + 16,
                vx: dustDir * (25 + Math.random() * 45),
                vy: -8 - Math.random() * 15,
                life: 14,
                maxLife: 20,
                color: '#cbd5e1',
                size: 3,
              });
            }
          } else if (s.p1Controller.state === ControllerState.Jump) {
            if (!prevJump) sounds.playJump();
            p1.fsm = PlayerFSMState.Jump;
          } else if (s.p1Controller.state === ControllerState.Fall) {
            p1.fsm = PlayerFSMState.Fall;
          } else if (s.p1Controller.state === ControllerState.Run || s.p1Controller.state === ControllerState.Walk) {
            if (p1.fsm !== PlayerFSMState.MeleeAttack && p1.fsm !== PlayerFSMState.RangedFire) {
              p1.fsm = PlayerFSMState.Run;
            }
          } else {
            if (p1.fsm !== PlayerFSMState.MeleeAttack && p1.fsm !== PlayerFSMState.RangedFire) {
              p1.fsm = crouchHeld ? PlayerFSMState.Crouch : PlayerFSMState.Idle;
            }
          }
        }

        const meleePressed = p1Combat.melee;
        const firePressed = p1Combat.fire;
        const throwPressed = p1Combat.throwGrenade;

        // Melee Attack P1 - Advanced Melee System
        const p1FacingDir = p1.facingRight ? 1 : -1;
        const meleeHeld = meleePressed;
        const meleeJustPressed = p1Combat.meleeJust;
        const fireJustPressed = p1Combat.fireJust;
        const throwJustPressed = p1Combat.throwJust;

        if (p1.isGrappling && p1.grabbedTargetId === bot.id) {
          p1.grappleTicks++;
          bot.x = p1.x + p1FacingDir * 24;
          bot.y = p1.y;
          bot.velocityX = 0;
          bot.velocityY = 0;
          bot.isGrabbed = true;
          s.p2Controller.setPosition(bot.x, bot.y);
          s.p2Controller.vx = 0;
          s.p2Controller.vy = 0;

          if (meleeJustPressed) {
            sounds.playThrow();
            const throwDirX = leftKey ? -1 : (rightKey ? 1 : p1FacingDir);
            const throwUp = jumpHeld || !crouchHeld;
            const throwHit = CombatSystem.resolveThrow(p1, bot, throwDirX, throwUp);

            p1.isGrappling = false;
            p1.grabbedTargetId = null;
            bot.isGrabbed = false;
            p1.attackCooldown = 26;
            s.screenShake = 10;
            addSparks(bot.x, bot.y, '#38bdf8', 18);

            s.floatingTexts.push({
              id: s.nextEntityId++,
              text: `¡LANZAMIENTO! -${Math.round(throwHit.damageDealt)}`,
              x: bot.x,
              y: bot.y - 35,
              color: '#38bdf8',
              life: 38,
            });

            s.crates.forEach((c) => {
              if (Math.hypot(bot.x - (c.x + c.w / 2), bot.y - (c.y + c.h / 2)) < 52) {
                c.health -= 20;
                c.vx = throwDirX * 360;
                sounds.playCrateBreak();
              }
            });
            s.barrels.forEach((b) => {
              if (Math.hypot(bot.x - (b.x + b.w / 2), bot.y - (b.y + b.h / 2)) < 52) {
                b.health -= 15;
                b.vx = throwDirX * 420;
                sounds.playHit();
              }
            });
          } else if (p1.grappleTicks > 50) {
            p1.isGrappling = false;
            p1.grabbedTargetId = null;
            bot.isGrabbed = false;
            p1.attackCooldown = 15;
          }
        } else {
          const rivalDist = Math.hypot(bot.x - p1.x, bot.y - p1.y);
          const isNearRival = rivalDist < 38 && Math.abs(bot.y - p1.y) < 26;

          if (
            meleeJustPressed &&
            isNearRival &&
            bot.isAlive &&
            !bot.isGrabbed &&
            !s.p2Controller.isInvulnerable &&
            p1.attackCooldown <= 0 &&
            p1.onGround &&
            (crouchHeld || (p1.facingRight ? rightKey : leftKey))
          ) {
            p1.isGrappling = true;
            p1.grabbedTargetId = bot.id;
            p1.grappleTicks = 0;
            bot.isGrabbed = true;
            sounds.playGrapple();
            s.floatingTexts.push({
              id: s.nextEntityId++,
              text: '¡AGARRE!',
              x: p1.x,
              y: p1.y - 30,
              color: '#f59e0b',
              life: 30,
            });
          } else if (
            meleeJustPressed &&
            p1.attackCooldown <= 0 &&
            (crouchHeld || s.p1Controller.state === ControllerState.Roll) &&
            p1.onGround
          ) {
            const isBladeP1 = isBladeWeapon(p1.equippedWeapon);
            p1.isSliding = true;
            p1.slideTicks = 18;
            p1.attackCooldown = isBladeP1 ? 24 : 28;
            p1.velocityX = p1FacingDir * (isBladeP1 ? 460 : 430);
            s.p1Controller.vx = p1.velocityX;
            if (isBladeP1) {
              sounds.playSwordSwing();
              sounds.playSlide();
            } else {
              sounds.playSlide();
            }
            PlayerFSM.tryTransition(p1, PlayerFSMState.CrouchSlide);
            addSparks(p1.x, p1.y + 16, isBladeP1 ? '#e0f2fe' : '#94a3b8', 14);

            if (isBladeP1) {
              const slideHit = CombatSystem.resolveBladeDashSlash(p1, bot);
              if (slideHit.didHit) {
                sounds.playBladeHit();
                s.screenShake = 9;
                addSparks(bot.x, bot.y + 12, '#38bdf8', 18);
                addSparks(bot.x, bot.y + 12, '#ffffff', 12);
                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text: `¡TAJO RASANTE! -${Math.round(slideHit.damageDealt)}`,
                  x: bot.x,
                  y: bot.y - 25,
                  color: '#38bdf8',
                  life: 35,
                });
              }
            } else {
              const slideHit = CombatSystem.resolveSlideTackle(p1, bot);
              if (slideHit.didHit) {
                sounds.playHit();
                s.screenShake = 8;
                addSparks(bot.x, bot.y + 12, '#38bdf8', 16);
                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text: `¡BARRIDA! -${Math.round(slideHit.damageDealt)}`,
                  x: bot.x,
                  y: bot.y - 25,
                  color: '#38bdf8',
                  life: 35,
                });
              }
            }

            s.crates.forEach((c) => {
              if (Math.hypot(p1.x - (c.x + c.w / 2), p1.y - (c.y + c.h / 2)) < 50) {
                c.health -= isBladeP1 ? 25 : 15;
                c.vx = p1FacingDir * 320;
                sounds.playHit();
                addSparks(c.x + 16, c.y + 16, '#d97706', 10);
              }
            });
            s.barrels.forEach((b) => {
              if (Math.hypot(p1.x - (b.x + b.w / 2), b.y - (b.y + b.h / 2)) < 50) {
                b.health -= 15;
                b.vx = p1FacingDir * 380;
                sounds.playHit();
                addSparks(b.x + 12, b.y + 16, '#ef4444', 10);
              }
            });
          }
        }

        // ─────────────────────────────────────────────────────────
        // ─────────────────────────────────────────────────────────
        // ⚠️ REGLA DE ORO - TECLAS SEPARADAS (NO MEZCLAR)
        // 1. Tecla "N": EXCLUSIVA para golpes cuerpo a cuerpo (puños, espadas, hachas).
        // 2. Tecla "M": EXCLUSIVA para disparar armas de fuego (pistolas, rifles, escopetas).
        // 3. Tecla "," (coma) o "L": EXCLUSIVA para lanzar bombas/granadas (Grenade, Molotov, C4, Baseball, Mine).
        // ─────────────────────────────────────────────────────────
        const isPistol = isPistolWeapon(p1.equippedWeapon);
        const isRifle = isRifleWeapon(p1.equippedWeapon);
        const isThrowable = isThrowableWeapon(p1.equippedWeapon);
        const isFirearm = isRifle || isPistol || (p1.equippedWeapon !== WeaponType.Fists && getWeapon(p1.equippedWeapon).category === 'Firearm');

        // ═════════════════════════════════════════════════════════
        // 1. TECLA "N": EXCLUSIVA PARA GOLPES CUERPO A CUERPO
        // ═════════════════════════════════════════════════════════
        if (
          meleeJustPressed &&
          p1.isAlive &&
          s.roundActive &&
          p1.fsm !== PlayerFSMState.KnockedDown &&
          p1.fsm !== PlayerFSMState.GetUp &&
          p1.fsm !== PlayerFSMState.Hitstun &&
          p1.fsm !== PlayerFSMState.Roll &&
          !p1.isGrappling &&
          !p1.isThrowing
        ) {
          // ── PRIORIDAD OFICIAL: ARMAS DE AGARRE A UNA MANO (one_hand_attack - 5 frames) ──
          if (isOneHandWeapon(p1.equippedWeapon)) {
            // Ataque a una mano: animación One Shot de 5 frames rápida
            if (!p1.isOneHandAttacking) {
              p1.isOneHandAttacking = true;
              p1.oneHandAnimFrame = 0;
              p1.oneHandAnimTimer = 0;
              p1.oneHandHasHit = false;

              p1.velocityX = 0;
              s.p1Controller.vx = 0;
              s.p1Controller.state = ControllerState.Idle;
              PlayerFSM.tryTransition(p1, PlayerFSMState.MeleeAttack);

              if (isBladeWeapon(p1.equippedWeapon)) {
                sounds.playSwordSwing();
              } else {
                sounds.playPunch();
              }
            }
          } else if (isTwoHandWeapon(p1.equippedWeapon)) {
            // Ataque a dos manos (Golpe pesado): animación One Shot de 6 frames, más lenta y pesada
            if (!p1.isTwoHandAttacking) {
              p1.isTwoHandAttacking = true;
              p1.twoHandAnimFrame = 0;
              p1.twoHandAnimTimer = 0;
              p1.twoHandHasHit = false;

              p1.velocityX = 0;
              s.p1Controller.vx = 0;
              s.p1Controller.state = ControllerState.Idle;
              PlayerFSM.tryTransition(p1, PlayerFSMState.MeleeAttack);

              if (isBladeWeapon(p1.equippedWeapon)) {
                sounds.playSwordSwing();
              } else {
                sounds.playPunch();
              }
            }
          } else if (isSwordWeapon(p1.equippedWeapon)) {
            if (p1.isSwordAttacking) {
              if ((p1.swordComboStep || 0) < 2) {
                p1.swordComboBuffered = true;
                p1.swordComboWindowTicks = 32;

                if ((p1.swordAnimFrame || 0) >= 3) {
                  p1.swordComboStep = (p1.swordComboStep || 0) + 1;
                  p1.swordAnimFrame = 0;
                  p1.swordAnimTimer = 0;
                  p1.swordHasHit = false;
                  p1.swordComboBuffered = false;
                  p1.swordComboWindowTicks = 32;
                  sounds.playSwordSwing();
                }
              }
            } else {
              let nextStep = 0;
              if ((p1.swordComboWindowTicks || 0) > 0 && (p1.swordComboStep || 0) > 0 && (p1.swordComboStep || 0) <= 2) {
                nextStep = p1.swordComboStep || 0;
              } else {
                nextStep = 0;
              }

              p1.isSwordAttacking = true;
              p1.swordComboStep = nextStep;
              p1.swordAnimFrame = 0;
              p1.swordAnimTimer = 0;
              p1.swordHasHit = false;
              p1.swordComboBuffered = false;
              p1.swordComboWindowTicks = 32;

              p1.velocityX = 0;
              s.p1Controller.vx = 0;
              s.p1Controller.state = ControllerState.Idle;
              PlayerFSM.tryTransition(p1, PlayerFSMState.MeleeAttack);

              sounds.playSwordSwing();
            }
          } else {
            // Sistema de combo melee desarmado (Puños / Golpes cuerpo a cuerpo)
            // Funciona desarmado o si porta arma de fuego/bomba pero presiona tecla de golpe melee (N)
            if (p1.isMeleeComboAttacking) {
              if (p1.meleeComboStep < 2) {
                p1.comboBuffered = true;
                p1.comboWindowTicks = 34;

                if (p1.meleeAnimFrame >= 3) {
                  p1.meleeComboStep++;
                  p1.comboStep = p1.meleeComboStep;
                  p1.meleeAnimFrame = 0;
                  p1.meleeAnimTimer = 0;
                  p1.meleeHasHit = false;
                  p1.comboBuffered = false;
                  p1.comboWindowTicks = 34;
                  sounds.playPunch();
                }
              }
            } else {
              let nextStep = 0;
              if (p1.comboWindowTicks > 0 && p1.comboStep > 0 && p1.comboStep <= 2) {
                nextStep = p1.comboStep;
              } else {
                nextStep = 0;
              }

              p1.isMeleeComboAttacking = true;
              p1.meleeComboStep = nextStep;
              p1.comboStep = nextStep;
              p1.meleeAnimFrame = 0;
              p1.meleeAnimTimer = 0;
              p1.meleeHasHit = false;
              p1.comboBuffered = false;
              p1.comboWindowTicks = 34;

              p1.velocityX = 0;
              s.p1Controller.vx = 0;
              s.p1Controller.state = ControllerState.Idle;
              PlayerFSM.tryTransition(p1, PlayerFSMState.MeleeAttack);

              sounds.playPunch();
            }
          }
        }

        // ═════════════════════════════════════════════════════════
        // 2. TECLA "M": EXCLUSIVA PARA DISPARAR ARMAS DE FUEGO
        // ═════════════════════════════════════════════════════════
        if (
          (fireJustPressed || (firePressed && (p1.isRifleShooting || p1.isPistolShooting))) &&
          p1.isAlive &&
          s.roundActive &&
          p1.fsm !== PlayerFSMState.KnockedDown &&
          p1.fsm !== PlayerFSMState.GetUp &&
          p1.fsm !== PlayerFSMState.Hitstun &&
          p1.fsm !== PlayerFSMState.Roll &&
          !p1.isGrappling &&
          !p1.isThrowing
        ) {
          if (isFirearm && isRifle) {
            // Disparo de rifles/escopetas a dos manos (rifle_shoot - 4 frames con retroceso en frame 3)
            if (p1.attackCooldown <= 0 && !p1.isRifleShooting) {
              if (p1.ammo > 0) {
                const wpn = getWeapon(p1.equippedWeapon);
                p1.isRifleShooting = true;
                p1.rifleAnimFrame = 0;
                p1.rifleAnimTimer = 0;
                p1.rifleHasFired = true;
                s.p1Controller.isShootingRifle = true;

                p1.attackCooldown = Math.max(wpn.cooldownTicks, 10);
                p1.ammo--;
                PlayerFSM.tryTransition(p1, PlayerFSMState.RangedFire);
                sounds.playGunshot(wpn.soundType || wpn.type.toLowerCase());

                const dir = p1.facingRight ? 1 : -1;
                const muzzleX = p1.x + dir * 32;
                const muzzleY = p1.y - 7;

                addSparks(muzzleX, muzzleY, '#fde047', 12);
                addSparks(muzzleX, muzzleY, '#ffffff', 6);
                s.screenShake = Math.min(14, Math.max(5, (wpn.damage || 25) / 3));

                const count = wpn.pelletCount || 1;
                for (let i = 0; i < count; i++) {
                  const spreadAngle = ((Math.random() - 0.5) * ((wpn.accuracyDeg || 4) * Math.PI / 180)) / 2;
                  const speed = wpn.projectileSpeed || 950;
                  s.projectiles.push({
                    id: s.nextEntityId++,
                    x: muzzleX,
                    y: muzzleY,
                    vx: dir * speed * Math.cos(spreadAngle),
                    vy: speed * Math.sin(spreadAngle),
                    damage: (wpn.damage / count) * p1.damageDealtModifier,
                    onFireDuration: wpn.onFireDuration || 0,
                    explosionRadius: wpn.explosionRadius || 0,
                    shooterId: p1.id,
                    weaponType: p1.equippedWeapon,
                    pelletCount: count,
                    lifeTicks: 0,
                    maxLifeTicks: 60,
                    color: wpn.color || '#facc15',
                  });
                }
              } else {
                p1.attackCooldown = 15;
                sounds.playDryFire();
              }
            }
          } else if (isFirearm && isPistol) {
            // Disparo de pistolas a una mano (pistol_shoot - 4 frames)
            if (p1.attackCooldown <= 0 && !p1.isPistolShooting) {
              if (p1.ammo > 0) {
                const wpn = getWeapon(p1.equippedWeapon);
                p1.isPistolShooting = true;
                p1.pistolAnimFrame = 0;
                p1.pistolAnimTimer = 0;
                p1.pistolHasFired = true;
                s.p1Controller.isShootingPistol = true;

                p1.attackCooldown = Math.max(wpn.cooldownTicks, 14);
                p1.ammo--;
                PlayerFSM.tryTransition(p1, PlayerFSMState.RangedFire);
                sounds.playGunshot(wpn.type.toLowerCase());

                const dir = p1.facingRight ? 1 : -1;
                const muzzleX = p1.x + dir * 28;
                const muzzleY = p1.y - 6;

                addSparks(muzzleX, muzzleY, '#fde047', 8);
                s.screenShake = Math.min(10, Math.max(3, (wpn.damage || 20) / 4));

                const count = wpn.pelletCount || 1;
                for (let i = 0; i < count; i++) {
                  const spreadAngle = ((Math.random() - 0.5) * ((wpn.accuracyDeg || 3) * Math.PI / 180)) / 2;
                  const speed = wpn.projectileSpeed || 900;
                  s.projectiles.push({
                    id: s.nextEntityId++,
                    x: muzzleX,
                    y: muzzleY,
                    vx: dir * speed * Math.cos(spreadAngle),
                    vy: speed * Math.sin(spreadAngle),
                    damage: (wpn.damage / count) * p1.damageDealtModifier,
                    onFireDuration: wpn.onFireDuration || 0,
                    explosionRadius: wpn.explosionRadius || 0,
                    shooterId: p1.id,
                    weaponType: p1.equippedWeapon,
                    pelletCount: count,
                    lifeTicks: 0,
                    maxLifeTicks: 60,
                    color: '#facc15',
                  });
                }
              } else {
                p1.attackCooldown = 15;
                sounds.playDryFire();
              }
            }
          } else if (p1.attackCooldown <= 0 && !p1.isPistolShooting) {
            // Disparo táctico con pistola reglamentaria del Ninja (Tecla M)
            const wpn = getWeapon(WeaponType.Pistol);
            p1.isPistolShooting = true;
            p1.pistolAnimFrame = 0;
            p1.pistolAnimTimer = 0;
            p1.pistolHasFired = true;
            s.p1Controller.isShootingPistol = true;

            p1.attackCooldown = Math.max(wpn.cooldownTicks, 14);
            PlayerFSM.tryTransition(p1, PlayerFSMState.RangedFire);
            sounds.playGunshot('pistol');

            const dir = p1.facingRight ? 1 : -1;
            const muzzleX = p1.x + dir * 28;
            const muzzleY = p1.y - 6;

            addSparks(muzzleX, muzzleY, '#fde047', 8);
            s.screenShake = 3;

            const speed = wpn.projectileSpeed || 900;
            s.projectiles.push({
              id: s.nextEntityId++,
              x: muzzleX,
              y: muzzleY,
              vx: dir * speed,
              vy: 0,
              damage: wpn.damage * p1.damageDealtModifier,
              onFireDuration: 0,
              explosionRadius: 0,
              shooterId: p1.id,
              weaponType: WeaponType.Pistol,
              pelletCount: 1,
              lifeTicks: 0,
              maxLifeTicks: 60,
              color: '#facc15',
            });
          }
        }

        // ═════════════════════════════════════════════════════════
        // 3. TECLA "," (coma) O "L": EXCLUSIVA PARA LANZAR BOMBAS/GRANADAS
        // Lista de Objetos: Grenade, Molotov, C4, Baseball, Mine (o inventario de granadas)
        // ═════════════════════════════════════════════════════════
        if (
          throwJustPressed &&
          p1.isAlive &&
          s.roundActive &&
          p1.fsm !== PlayerFSMState.KnockedDown &&
          p1.fsm !== PlayerFSMState.GetUp &&
          p1.fsm !== PlayerFSMState.Hitstun &&
          p1.fsm !== PlayerFSMState.Roll &&
          !p1.isGrappling &&
          !p1.isThrowing
        ) {
          const hasGrenadesInInventory = getTotalGrenades(s.p1Grenades) > 0;
          if (p1.attackCooldown <= 0) {
            if (isThrowable && p1.ammo > 0) {
              p1.isThrowing = true;
              p1.throwAnimFrame = 0;
              p1.throwAnimTimer = 0;
              p1.throwHasReleased = false;
              // Guardar la inercia previa del movimiento antes de detener al personaje
              p1.throwInitialInertia = p1.velocityX * 0.45;
              // Movimiento: El personaje se detiene mientras ejecuta el lanzamiento
              p1.velocityX = 0;
              s.p1Controller.vx = 0;
              s.p1Controller.state = ControllerState.Idle;
              s.p1Controller.isThrowing = true;
              p1.attackCooldown = 25;
              PlayerFSM.tryTransition(p1, PlayerFSMState.MeleeAttack);
              sounds.playSwordSwing();
            } else if (hasGrenadesInInventory) {
              p1.isThrowing = true;
              p1.throwAnimFrame = 0;
              p1.throwAnimTimer = 0;
              p1.throwHasReleased = false;
              p1.throwInitialInertia = p1.velocityX * 0.45;
              p1.velocityX = 0;
              s.p1Controller.vx = 0;
              s.p1Controller.state = ControllerState.Idle;
              s.p1Controller.isThrowing = true;
              p1.attackCooldown = 25;
              PlayerFSM.tryTransition(p1, PlayerFSMState.MeleeAttack);
              sounds.playSwordSwing();
            } else {
              p1.attackCooldown = 15;
              sounds.playDryFire();
              s.floatingTexts.push({
                id: s.nextEntityId++,
                text: '¡SIN BOMBAS / GRANADAS!',
                x: p1.x,
                y: p1.y - 30,
                color: '#ef4444',
                life: 25,
              });
            }
          }
        }

        // ─────────────────────────────────────────────────────────
        // LÓGICA DE AVANCE Y RESOLUCIÓN DEL ATAQUE A DOS MANOS (two_hand_attack)
        // 6 Fotogramas, One Shot, más lenta (4 ticks/frame = ~66ms/frame) y con mayor hitbox por ser golpe pesado
        // ─────────────────────────────────────────────────────────
        if (p1.isTwoHandAttacking) {
          // Bloqueo estricto de movimiento: el personaje no puede caminar, correr ni saltar
          p1.velocityX = 0;
          s.p1Controller.vx = 0;
          s.p1Controller.state = ControllerState.Idle;
          p1.fsm = PlayerFSMState.MeleeAttack;

          p1.twoHandAnimTimer = (p1.twoHandAnimTimer || 0) + 1;
          // Más lenta que una mano (4 ticks/frame vs 2 ticks/frame)
          if (p1.twoHandAnimTimer >= 4) {
            p1.twoHandAnimTimer = 0;
            p1.twoHandAnimFrame = (p1.twoHandAnimFrame || 0) + 1;

            if (p1.twoHandAnimFrame >= 6) {
              // Al terminar el 6to frame (One Shot), vuelve al estado normal (Idle)
              p1.isTwoHandAttacking = false;
              p1.twoHandAnimFrame = 0;
              p1.twoHandAnimTimer = 0;
              p1.twoHandHasHit = false;
              p1.fsm = PlayerFSMState.Idle;
            }
          }

          // Detección de impacto en el fotograma de golpe pesado hacia abajo (fotograma 3)
          if (!p1.twoHandHasHit && (p1.twoHandAnimFrame || 0) === 3) {
            p1.twoHandHasHit = true;
            const p1FacingDir = p1.facingRight ? 1 : -1;
            // Mayor hitbox por ser golpe pesado (82px alcance frontal y 48px vertical)
            const hitReach = 82;
            const isBotInReach =
              bot.isAlive &&
              !bot.isGrabbed &&
              !s.p2Controller.isInvulnerable &&
              bot.fsm !== PlayerFSMState.Roll &&
              ((p1FacingDir > 0 && bot.x >= p1.x - 15 && bot.x <= p1.x + hitReach) ||
               (p1FacingDir < 0 && bot.x <= p1.x + 15 && bot.x >= p1.x - hitReach)) &&
              Math.abs(bot.y - p1.y) < 48;

            const wpn = getWeapon(p1.equippedWeapon);
            const isBlade = isBladeWeapon(p1.equippedWeapon);
            const baseDmg = (wpn.damage || 22) * 1.45; // Golpe pesado con mayor daño
            const finalDmg = baseDmg * p1.damageDealtModifier;

            if (isBotInReach) {
              if (isBlade) {
                sounds.playBladeHit();
                addSparks(bot.x, bot.y, '#38bdf8', 22);
                addSparks(bot.x, bot.y, '#ffffff', 14);
              } else {
                sounds.playHit();
                addSparks(bot.x, bot.y, '#f97316', 22);
                addSparks(bot.x, bot.y, '#fbbf24', 14);
              }

              s.screenShake = 12; // Mayor sacudida por golpe pesado
              bot.velocityX = p1FacingDir * 260; // Mayor retroceso
              bot.hitstunTicks = 24; // Mayor aturdimiento
              PlayerFSM.tryTransition(bot, PlayerFSMState.Hitstun);

              bot.health = Math.max(0, bot.health - finalDmg);
              if (bot.health <= 0) {
                bot.health = 0;
                bot.isAlive = false;
                PlayerFSM.tryTransition(bot, PlayerFSMState.Dead);
                sounds.playHit();
              }

              s.floatingTexts.push({
                id: s.nextEntityId++,
                text: `¡GOLPE PESADO (${wpn.name.toUpperCase()})! -${Math.round(finalDmg)}`,
                x: bot.x,
                y: bot.y - 36,
                color: '#f97316',
                life: 55,
              });
            }
          }
        }

        // ─────────────────────────────────────────────────────────
        // LÓGICA DE AVANCE Y RESOLUCIÓN DEL COMBATE CON ESPADA DEL NINJA
        // 3 Tajos Fluidos, Rápidos y Letales (one_hand_attack de 5 frames)
        // Bloqueo estricto de movimiento + combo ágil y letal contra el rival
        // ─────────────────────────────────────────────────────────
        if (p1.isSwordAttacking) {
          p1.velocityX = 0;
          s.p1Controller.vx = 0;
          s.p1Controller.state = ControllerState.Idle;
          p1.fsm = PlayerFSMState.MeleeAttack;

          p1.swordAnimTimer = (p1.swordAnimTimer || 0) + 1;
          if (p1.swordAnimTimer >= 2) {
            p1.swordAnimTimer = 0;
            p1.swordAnimFrame = (p1.swordAnimFrame || 0) + 1;

            if (p1.swordComboBuffered && (p1.swordAnimFrame || 0) >= 3 && (p1.swordComboStep || 0) < 2) {
              p1.swordComboStep = (p1.swordComboStep || 0) + 1;
              p1.swordAnimFrame = 0;
              p1.swordAnimTimer = 0;
              p1.swordHasHit = false;
              p1.swordComboBuffered = false;
              p1.swordComboWindowTicks = 32;
              sounds.playSwordSwing();
            } else if ((p1.swordAnimFrame || 0) >= 5) {
              if (p1.swordComboBuffered && (p1.swordComboStep || 0) < 2) {
                p1.swordComboStep = (p1.swordComboStep || 0) + 1;
                p1.swordAnimFrame = 0;
                p1.swordAnimTimer = 0;
                p1.swordHasHit = false;
                p1.swordComboBuffered = false;
                p1.swordComboWindowTicks = 32;
                sounds.playSwordSwing();
              } else {
                p1.isSwordAttacking = false;
                p1.swordAnimFrame = 0;
                p1.swordAnimTimer = 0;
                p1.swordHasHit = false;
                p1.fsm = PlayerFSMState.Idle;

                if ((p1.swordComboStep || 0) >= 2) {
                  p1.swordComboStep = 0;
                  p1.swordComboWindowTicks = 0;
                } else {
                  p1.swordComboStep = (p1.swordComboStep || 0) + 1;
                  p1.swordComboWindowTicks = 26;
                }
              }
            }
          }

          if (!p1.swordHasHit && (p1.swordAnimFrame || 0) >= 2) {
            p1.swordHasHit = true;
            const p1FacingDir = p1.facingRight ? 1 : -1;
            const currentStep = p1.swordComboStep || 0;
            const hitReach = currentStep === 0 ? 68 : currentStep === 1 ? 74 : 84;
            const isBotInReach =
              bot.isAlive &&
              !bot.isGrabbed &&
              !s.p2Controller.isInvulnerable &&
              bot.fsm !== PlayerFSMState.Roll &&
              ((p1FacingDir > 0 && bot.x >= p1.x - 10 && bot.x <= p1.x + hitReach) ||
               (p1FacingDir < 0 && bot.x <= p1.x + 10 && bot.x >= p1.x - hitReach)) &&
              Math.abs(bot.y - p1.y) < 42;

            const wpn = getWeapon(p1.equippedWeapon);
            const wpnName = wpn.name || 'ESPADA';

            if (isBotInReach) {
              sounds.playBladeHit();
              let damage = 22;
              let shake = 6;
              let text = '¡TAJO I!';
              let textColor = '#38bdf8';

              if (currentStep === 0) {
                damage = 22 * p1.damageDealtModifier;
                shake = 6;
                text = `¡TAJO I (${wpnName.toUpperCase()})! -${Math.round(damage)}`;
                textColor = '#38bdf8';
                bot.velocityX = p1FacingDir * 190;
                bot.hitstunTicks = 16;
                PlayerFSM.tryTransition(bot, PlayerFSMState.Hitstun);
                addSparks(bot.x, bot.y, '#38bdf8', 16);
                addSparks(bot.x, bot.y, '#ffffff', 10);
              } else if (currentStep === 1) {
                damage = 30 * p1.damageDealtModifier;
                shake = 9;
                text = `¡TAJO II (${wpnName.toUpperCase()})! -${Math.round(damage)}`;
                textColor = '#38bdf8';
                bot.velocityX = p1FacingDir * 270;
                bot.hitstunTicks = 20;
                PlayerFSM.tryTransition(bot, PlayerFSMState.Hitstun);
                addSparks(bot.x, bot.y, '#38bdf8', 22);
                addSparks(bot.x, bot.y, '#ffffff', 14);
              } else {
                damage = 44 * p1.damageDealtModifier;
                shake = 14;
                text = `¡REMATE NINJA (${wpnName.toUpperCase()})! -${Math.round(damage)}`;
                textColor = '#06b6d4';
                bot.velocityX = p1FacingDir * 390;
                bot.velocityY = -270;
                s.p2Controller.vy = -270;
                bot.onGround = false;
                bot.knockdownTicks = 45;
                PlayerFSM.tryTransition(bot, PlayerFSMState.KnockedDown);
                sounds.playHeavyBladeSlash();
                addSparks(bot.x, bot.y - 10, '#38bdf8', 28);
                addSparks(bot.x, bot.y - 10, '#e0f2fe', 22);
                addSparks(bot.x, bot.y - 10, '#ffffff', 16);
                CombatSystem.disarmPlayer(bot);
              }

              s.screenShake = shake;
              bot.health = Math.max(0, bot.health - damage);
              if (bot.health <= 0) {
                bot.health = 0;
                bot.isAlive = false;
                PlayerFSM.tryTransition(bot, PlayerFSMState.Dead);
                sounds.playHit();
              }

              s.floatingTexts.push({
                id: s.nextEntityId++,
                text,
                x: bot.x,
                y: bot.y - 32,
                color: textColor,
                life: 38,
              });
            }

            s.crates.forEach((c) => {
              if (Math.hypot(p1.x + p1FacingDir * 32 - (c.x + c.w / 2), p1.y - (c.y + c.h / 2)) < 52) {
                c.health -= 35;
                c.vx = p1FacingDir * 340;
                sounds.playBladeHit();
                addSparks(c.x + 16, c.y + 16, '#38bdf8', 12);
              }
            });
            s.barrels.forEach((b) => {
              if (Math.hypot(p1.x + p1FacingDir * 32 - (b.x + b.w / 2), p1.y - (b.y + b.h / 2)) < 52) {
                b.health -= 30;
                b.vx = p1FacingDir * 380;
                sounds.playBladeHit();
                addSparks(b.x + 12, b.y + 16, '#ef4444', 12);
              }
            });
          }
        }

        if ((p1.swordComboWindowTicks || 0) > 0) {
          p1.swordComboWindowTicks = (p1.swordComboWindowTicks || 0) - 1;
          if (p1.swordComboWindowTicks <= 0 && !p1.isSwordAttacking) {
            p1.swordComboStep = 0;
          }
        }

        // ─────────────────────────────────────────────────────────
        // LÓGICA DE AVANCE Y RESOLUCIÓN DEL ATAQUE A UNA MANO (one_hand_attack)
        // 5 Fotogramas, One Shot, mayor velocidad que los puños (2 ticks/frame vs 3 ticks/frame)
        // ─────────────────────────────────────────────────────────
        if (p1.isOneHandAttacking) {
          // Bloqueo estricto de movimiento: el personaje no puede caminar, correr ni saltar
          p1.velocityX = 0;
          s.p1Controller.vx = 0;
          s.p1Controller.state = ControllerState.Idle;
          p1.fsm = PlayerFSMState.MeleeAttack;

          p1.oneHandAnimTimer = (p1.oneHandAnimTimer || 0) + 1;
          // Velocidad rápida: avanza cada 2 ticks (~33ms/frame, 10 ticks = 166ms total vs 300ms de los puños)
          if (p1.oneHandAnimTimer >= 2) {
            p1.oneHandAnimTimer = 0;
            p1.oneHandAnimFrame = (p1.oneHandAnimFrame || 0) + 1;

            if (p1.oneHandAnimFrame >= 5) {
              // Al terminar el último frame (One Shot), vuelve al estado normal (Idle)
              p1.isOneHandAttacking = false;
              p1.oneHandAnimFrame = 0;
              p1.oneHandAnimTimer = 0;
              p1.oneHandHasHit = false;
              p1.fsm = PlayerFSMState.Idle;
            }
          }

          // Detección de impacto en el fotograma activo (fotograma 2)
          if (!p1.oneHandHasHit && (p1.oneHandAnimFrame || 0) >= 2) {
            p1.oneHandHasHit = true;
            const p1FacingDir = p1.facingRight ? 1 : -1;
            const hitReach = 58;
            const isBotInReach =
              bot.isAlive &&
              !bot.isGrabbed &&
              !s.p2Controller.isInvulnerable &&
              bot.fsm !== PlayerFSMState.Roll &&
              ((p1FacingDir > 0 && bot.x >= p1.x - 10 && bot.x <= p1.x + hitReach) ||
               (p1FacingDir < 0 && bot.x <= p1.x + 10 && bot.x >= p1.x - hitReach)) &&
              Math.abs(bot.y - p1.y) < 34;

            const wpn = getWeapon(p1.equippedWeapon);
            const isBlade = isBladeWeapon(p1.equippedWeapon);
            const baseDmg = wpn.damage || 16;
            const finalDmg = baseDmg * p1.damageDealtModifier;

            if (isBotInReach) {
              if (isBlade) {
                sounds.playBladeHit();
                addSparks(bot.x, bot.y, '#38bdf8', 16);
                addSparks(bot.x, bot.y, '#ffffff', 10);
              } else {
                sounds.playHit();
                addSparks(bot.x, bot.y, '#f59e0b', 16);
              }

              s.screenShake = 7;
              bot.velocityX = p1FacingDir * 170;
              bot.hitstunTicks = 16;
              PlayerFSM.tryTransition(bot, PlayerFSMState.Hitstun);

              bot.health = Math.max(0, bot.health - finalDmg);
              if (bot.health <= 0) {
                bot.health = 0;
                bot.isAlive = false;
                PlayerFSM.tryTransition(bot, PlayerFSMState.Dead);
                sounds.playHit();
              }

              s.floatingTexts.push({
                id: s.nextEntityId++,
                text: `¡${wpn.name.toUpperCase()}! -${Math.round(finalDmg)}`,
                x: bot.x,
                y: bot.y - 32,
                color: isBlade ? '#38bdf8' : '#f59e0b',
                life: 35,
              });
            }

            // Impacto en cajas del escenario
            s.crates.forEach((c) => {
              if (Math.hypot(p1.x + p1FacingDir * 30 - (c.x + c.w / 2), p1.y - (c.y + c.h / 2)) < 48) {
                c.health -= baseDmg * 1.2;
                c.vx = p1FacingDir * 290;
                sounds.playHit();
                addSparks(c.x + 16, c.y + 16, '#d97706', 12);
              }
            });

            // Impacto en barriles
            s.barrels.forEach((b) => {
              if (Math.hypot(p1.x + p1FacingDir * 30 - (b.x + b.w / 2), p1.y - (b.y + b.h / 2)) < 48) {
                b.health -= baseDmg;
                b.vx = p1FacingDir * 330;
                sounds.playHit();
                addSparks(b.x + 12, b.y + 16, '#ef4444', 12);
              }
            });
          }
        }

        // ─────────────────────────────────────────────────────────
        // LÓGICA DE AVANCE Y RETROCESO DE DISPARO CON PISTOLA (pistol_shoot)
        // 4 Fotogramas:
        // Frame 0: Apuntado frontal y disparo con fogonazo
        // Frame 1: Empuje de disparo
        // Frame 2: (Frame 3) Mano levantada hacia arriba: Retroceso / Recarga
        // Frame 3: Retorno a la posición de guardia
        // Permite moverse a velocidad de caminar mientras dispara (no puede correr)
        // ─────────────────────────────────────────────────────────
        if (p1.isPistolShooting) {
          if (p1.fsm === PlayerFSMState.KnockedDown || p1.fsm === PlayerFSMState.Hitstun || !p1.isAlive) {
            p1.isPistolShooting = false;
            p1.pistolAnimFrame = 0;
            p1.pistolAnimTimer = 0;
            s.p1Controller.isShootingPistol = false;
          } else {
            s.p1Controller.isShootingPistol = true;

            // Orientación del apuntado (Superfighters):
            // Si se mueve, orienta hacia la dirección del movimiento; si está quieto, mantiene última dirección
            const moveDir = (keys['arrowleft'] || (gameMode === 'vsBot' && keys['a']))
              ? -1
              : (keys['arrowright'] || (gameMode === 'vsBot' && keys['d']))
              ? 1
              : 0;

            if (moveDir !== 0) {
              p1.facingRight = moveDir > 0;
              s.p1Controller.facingRight = p1.facingRight;
            }

            p1.pistolAnimTimer = (p1.pistolAnimTimer || 0) + 1;
            // 4 ticks por frame (~66ms por frame)
            if (p1.pistolAnimTimer >= 4) {
              p1.pistolAnimTimer = 0;
              p1.pistolAnimFrame = (p1.pistolAnimFrame || 0) + 1;

              if (p1.pistolAnimFrame >= 4) {
                // Ciclo continuo si mantiene 'N' o disparo con arma automática (Uzi, SilencedUzi, MachinePistol)
                const isAuto =
                  p1.equippedWeapon === WeaponType.Uzi ||
                  p1.equippedWeapon === WeaponType.SilencedUzi ||
                  p1.equippedWeapon === WeaponType.MachinePistol;
                const nHeld = !!keys['n'] || !!keys['N'] || !!keys['m'] || !!keys['M'];

                if (isAuto && nHeld && p1.ammo > 0 && p1.attackCooldown <= 0) {
                  p1.pistolAnimFrame = 0;
                  p1.ammo--;
                  const wpn = getWeapon(p1.equippedWeapon);
                  p1.attackCooldown = Math.max(wpn.cooldownTicks, 10);
                  sounds.playGunshot(wpn.type.toLowerCase());

                  const dir = p1.facingRight ? 1 : -1;
                  const muzzleX = p1.x + dir * 28;
                  const muzzleY = p1.y - 6;

                  addSparks(muzzleX, muzzleY, '#fde047', 8);
                  s.screenShake = 3;

                  const speed = wpn.projectileSpeed || 900;
                  const spreadAngle = ((Math.random() - 0.5) * ((wpn.accuracyDeg || 4) * Math.PI / 180)) / 2;
                  s.projectiles.push({
                    id: s.nextEntityId++,
                    x: muzzleX,
                    y: muzzleY,
                    vx: dir * speed * Math.cos(spreadAngle),
                    vy: speed * Math.sin(spreadAngle),
                    damage: wpn.damage * p1.damageDealtModifier,
                    onFireDuration: 0,
                    explosionRadius: 0,
                    shooterId: p1.id,
                    weaponType: p1.equippedWeapon,
                    pelletCount: 1,
                    lifeTicks: 0,
                    maxLifeTicks: 60,
                    color: '#facc15',
                  });
                } else {
                  p1.isPistolShooting = false;
                  p1.pistolAnimFrame = 0;
                  p1.pistolAnimTimer = 0;
                  s.p1Controller.isShootingPistol = false;
                  if (p1.fsm === PlayerFSMState.RangedFire) {
                    p1.fsm = PlayerFSMState.Idle;
                  }
                }
              }
            }
          }
        } else if (s.p1Controller) {
          s.p1Controller.isShootingPistol = false;
        }

        // ─────────────────────────────────────────────────────────
        // LÓGICA DE AVANCE Y RETROCESO DE DISPARO CON RIFLE/ESCOPETA (rifle_shoot)
        // 4 Fotogramas:
        // Frame 0: Apuntado frontal y disparo con gran fogonazo
        // Frame 1: Empuje de disparo y retroceso
        // Frame 2: (Frame 3) Sacudida hacia atrás: Fuerte retroceso del disparo
        // Frame 3: Recuperación y vuelta al apuntado
        // Permite moverse a velocidad de caminar mientras dispara (no puede correr)
        // ─────────────────────────────────────────────────────────
        if (p1.isRifleShooting) {
          if (p1.fsm === PlayerFSMState.KnockedDown || p1.fsm === PlayerFSMState.Hitstun || !p1.isAlive) {
            p1.isRifleShooting = false;
            p1.rifleAnimFrame = 0;
            p1.rifleAnimTimer = 0;
            s.p1Controller.isShootingRifle = false;
          } else {
            s.p1Controller.isShootingRifle = true;

            // Orientación del apuntado (Superfighters):
            // Si se mueve, orienta hacia la dirección del movimiento; si está quieto, mantiene última dirección
            const moveDir = (keys['arrowleft'] || (gameMode === 'vsBot' && keys['a']))
              ? -1
              : (keys['arrowright'] || (gameMode === 'vsBot' && keys['d']))
              ? 1
              : 0;

            if (moveDir !== 0) {
              p1.facingRight = moveDir > 0;
              s.p1Controller.facingRight = p1.facingRight;
            }

            p1.rifleAnimTimer = (p1.rifleAnimTimer || 0) + 1;
            // 4 ticks por frame (~66ms por frame)
            if (p1.rifleAnimTimer >= 4) {
              p1.rifleAnimTimer = 0;
              p1.rifleAnimFrame = (p1.rifleAnimFrame || 0) + 1;

              if (p1.rifleAnimFrame >= 4) {
                // Ciclo continuo si mantiene 'N' o disparo con arma automática (M60, Assault, TommyGun, SMG, Carbine, MP50)
                const isAuto =
                  p1.equippedWeapon === WeaponType.M60 ||
                  p1.equippedWeapon === WeaponType.Assault ||
                  p1.equippedWeapon === WeaponType.Rifle ||
                  p1.equippedWeapon === WeaponType.TommyGun ||
                  p1.equippedWeapon === WeaponType.SMG ||
                  p1.equippedWeapon === WeaponType.Carbine ||
                  p1.equippedWeapon === WeaponType.MP50;
                const nHeld = !!keys['n'] || !!keys['N'] || !!keys['m'] || !!keys['M'];

                if (isAuto && nHeld && p1.ammo > 0 && p1.attackCooldown <= 0) {
                  p1.rifleAnimFrame = 0;
                  p1.ammo--;
                  const wpn = getWeapon(p1.equippedWeapon);
                  p1.attackCooldown = Math.max(wpn.cooldownTicks, 8);
                  sounds.playGunshot(wpn.soundType || wpn.type.toLowerCase());

                  const dir = p1.facingRight ? 1 : -1;
                  const muzzleX = p1.x + dir * 32;
                  const muzzleY = p1.y - 7;

                  addSparks(muzzleX, muzzleY, '#fde047', 10);
                  addSparks(muzzleX, muzzleY, '#ffffff', 5);
                  s.screenShake = 4;

                  const speed = wpn.projectileSpeed || 950;
                  const spreadAngle = ((Math.random() - 0.5) * ((wpn.accuracyDeg || 4) * Math.PI / 180)) / 2;
                  s.projectiles.push({
                    id: s.nextEntityId++,
                    x: muzzleX,
                    y: muzzleY,
                    vx: dir * speed * Math.cos(spreadAngle),
                    vy: speed * Math.sin(spreadAngle),
                    damage: wpn.damage * p1.damageDealtModifier,
                    onFireDuration: wpn.onFireDuration || 0,
                    explosionRadius: wpn.explosionRadius || 0,
                    shooterId: p1.id,
                    weaponType: p1.equippedWeapon,
                    pelletCount: 1,
                    lifeTicks: 0,
                    maxLifeTicks: 60,
                    color: wpn.color || '#facc15',
                  });
                } else {
                  p1.isRifleShooting = false;
                  p1.rifleAnimFrame = 0;
                  p1.rifleAnimTimer = 0;
                  s.p1Controller.isShootingRifle = false;
                  if (p1.fsm === PlayerFSMState.RangedFire) {
                    p1.fsm = PlayerFSMState.Idle;
                  }
                }
              }
            }
          }
        } else if (s.p1Controller) {
          s.p1Controller.isShootingRifle = false;
        }

        // ─────────────────────────────────────────────────────────
        // LÓGICA DE AVANCE Y LANZAMIENTO (throw_up - 5 Frames, One Shot)
        // Requisitos de la mecánica:
        // - Frame 0 (1): Brazo recogido hacia atrás
        // - Frame 1 (2): Elevación del brazo
        // - Frame 2 (3): Brazo extendido hacia adelante -> EXACTAMENTE AQUÍ SE SUELTA EL OBJETO
        // - Frame 3 (4): Descenso y seguimiento del brazo
        // - Frame 4 (5): Conclusión del lanzamiento y retorno a guardia
        // - Movimiento: El personaje se detiene o se mueve a velocidad de caminar mientras ejecuta el lanzamiento.
        // - Lógica de apuntado (Superfighters): Sale hacia donde mira (flip_h) y hereda inercia de movimiento.
        // ─────────────────────────────────────────────────────────
        if (p1.isThrowing) {
          if (p1.fsm === PlayerFSMState.KnockedDown || p1.fsm === PlayerFSMState.Hitstun || !p1.isAlive) {
            p1.isThrowing = false;
            p1.throwAnimFrame = 0;
            p1.throwAnimTimer = 0;
            p1.throwHasReleased = false;
            s.p1Controller.isThrowing = false;
          } else {
            s.p1Controller.isThrowing = true;
            // Movimiento: El personaje se detiene mientras ejecuta el lanzamiento
            p1.velocityX = 0;
            s.p1Controller.vx = 0;
            s.p1Controller.state = ControllerState.Idle;

            // Orientación según la dirección hacia la que mira (flip_h):
            // Si pulsa izquierda/derecha actualiza la orientación; si no, mantiene la última dirección
            const moveDir = (keys['arrowleft'] || (gameMode === 'vsBot' && keys['a']))
              ? -1
              : (keys['arrowright'] || (gameMode === 'vsBot' && keys['d']))
              ? 1
              : 0;

            if (moveDir !== 0) {
              p1.facingRight = moveDir > 0;
              s.p1Controller.facingRight = p1.facingRight;
            }

            // Ejecución del lanzamiento exactamente en el Frame 3 (índice 2: brazo extendido hacia adelante)
            if (p1.throwAnimFrame === 2 && !p1.throwHasReleased) {
              p1.throwHasReleased = true;

              const dir = p1.facingRight ? 1 : -1;
              const launchX = p1.x + dir * 26;
              const launchY = p1.y - 14;

              // El objeto hereda la inercia previa del movimiento
              const inheritedInertia = p1.throwInitialInertia || 0;
              const wType = p1.equippedWeapon;
              const isThrowable = isThrowableWeapon(wType);

              if (isThrowable) {
                p1.ammo--;
                const wpn = getWeapon(wType);

                if (wType === WeaponType.Grenade) {
                  const gCfg = GRENADE_DATABASE[GrenadeType.Frag];
                  sounds.playGunshot('grenade');
                  s.projectiles.push({
                    id: s.nextEntityId++,
                    x: launchX,
                    y: launchY,
                    vx: dir * 440 + inheritedInertia,
                    vy: -300,
                    damage: gCfg.damage * p1.damageDealtModifier,
                    onFireDuration: 0,
                    explosionRadius: gCfg.explosionRadius,
                    shooterId: p1.id,
                    weaponType: WeaponType.Grenade,
                    pelletCount: 1,
                    lifeTicks: 0,
                    maxLifeTicks: gCfg.fuseTicks || 85,
                    isGrenade: true,
                    isThrowable: true,
                    grenadeType: GrenadeType.Frag,
                    rotation: 0,
                    rotationSpeed: dir * 0.25,
                    color: gCfg.color,
                  });
                } else if (wType === WeaponType.Molotov) {
                  const gCfg = GRENADE_DATABASE[GrenadeType.Molotov];
                  sounds.playGunshot('grenade');
                  s.projectiles.push({
                    id: s.nextEntityId++,
                    x: launchX,
                    y: launchY,
                    vx: dir * 390 + inheritedInertia,
                    vy: -270,
                    damage: gCfg.damage * p1.damageDealtModifier,
                    onFireDuration: gCfg.burnDurationTicks || 240,
                    explosionRadius: gCfg.explosionRadius,
                    shooterId: p1.id,
                    weaponType: WeaponType.Molotov,
                    pelletCount: 1,
                    lifeTicks: 0,
                    maxLifeTicks: 70,
                    isGrenade: true,
                    isMolotov: true,
                    isThrowable: true,
                    grenadeType: GrenadeType.Molotov,
                    rotation: 0,
                    rotationSpeed: dir * 0.28,
                    color: gCfg.color,
                  });
                } else if (wType === WeaponType.C4) {
                  sounds.playGunshot('grenade');
                  s.projectiles.push({
                    id: s.nextEntityId++,
                    x: launchX,
                    y: launchY,
                    vx: dir * 350 + inheritedInertia,
                    vy: -240,
                    damage: (wpn.damage || 60) * p1.damageDealtModifier,
                    onFireDuration: 0,
                    explosionRadius: wpn.explosionRadius || 85,
                    shooterId: p1.id,
                    weaponType: WeaponType.C4,
                    pelletCount: 1,
                    lifeTicks: 0,
                    maxLifeTicks: 80,
                    isGrenade: true,
                    isThrowable: true,
                    rotation: 0,
                    rotationSpeed: dir * 0.18,
                    color: '#ef4444',
                  });
                } else if (wType === WeaponType.Mine) {
                  sounds.playPickup();
                  s.projectiles.push({
                    id: s.nextEntityId++,
                    x: launchX,
                    y: launchY,
                    vx: dir * 280 + inheritedInertia,
                    vy: -180,
                    damage: (wpn.damage || 45) * p1.damageDealtModifier,
                    onFireDuration: 0,
                    explosionRadius: wpn.explosionRadius || 60,
                    shooterId: p1.id,
                    weaponType: WeaponType.Mine,
                    pelletCount: 1,
                    lifeTicks: 0,
                    maxLifeTicks: 250,
                    isGrenade: true,
                    isThrowable: true,
                    rotation: 0,
                    rotationSpeed: dir * 0.12,
                    color: '#f59e0b',
                  });
                } else if (wType === WeaponType.Baseball) {
                  sounds.playPunch();
                  s.projectiles.push({
                    id: s.nextEntityId++,
                    x: launchX,
                    y: launchY,
                    vx: dir * 650 + inheritedInertia,
                    vy: -140,
                    damage: (wpn.damage || 14) * p1.damageDealtModifier,
                    onFireDuration: 0,
                    explosionRadius: 0,
                    shooterId: p1.id,
                    weaponType: WeaponType.Baseball,
                    pelletCount: 1,
                    lifeTicks: 0,
                    maxLifeTicks: 90,
                    isGrenade: true,
                    isThrowable: true,
                    rotation: 0,
                    rotationSpeed: dir * 0.45,
                    color: '#f8fafc',
                  });
                }

                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text: `¡${wpn.name}! (${p1.ammo} rest.)`,
                  x: p1.x,
                  y: p1.y - 32,
                  color: wpn.color || '#38bdf8',
                  life: 30,
                });
              } else {
                // Lanzamiento desde inventario de granadas (Tecla ',' o 'L')
                const thrownType = consumeGrenade(s.p1Grenades);
                if (thrownType) {
                  sounds.playGunshot('grenade');
                  const gCfg = GRENADE_DATABASE[thrownType];
                  s.projectiles.push({
                    id: s.nextEntityId++,
                    x: launchX,
                    y: launchY,
                    vx: dir * 420 + inheritedInertia,
                    vy: -310,
                    damage: gCfg.damage * p1.damageDealtModifier,
                    onFireDuration: gCfg.burnDurationTicks || 0,
                    explosionRadius: gCfg.explosionRadius,
                    shooterId: p1.id,
                    weaponType: WeaponType.Grenade,
                    pelletCount: 1,
                    lifeTicks: 0,
                    maxLifeTicks: gCfg.fuseTicks || 85,
                    isGrenade: true,
                    isMolotov: thrownType === GrenadeType.Molotov,
                    isThrowable: true,
                    grenadeType: thrownType,
                    rotation: 0,
                    rotationSpeed: dir * 0.24,
                    color: gCfg.color,
                  });

                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: `¡${gCfg.shortName}! (${s.p1Grenades.ammo[thrownType]} rest.)`,
                    x: p1.x,
                    y: p1.y - 32,
                    color: gCfg.color,
                    life: 30,
                  });
                }
              }
            }

            p1.throwAnimTimer = (p1.throwAnimTimer || 0) + 1;
            // 4 ticks por fotograma (~66ms por frame para 5 frames en ~330ms)
            if (p1.throwAnimTimer >= 4) {
              p1.throwAnimTimer = 0;
              p1.throwAnimFrame = (p1.throwAnimFrame || 0) + 1;

              if (p1.throwAnimFrame >= 5) {
                // Fin de la animación One Shot
                p1.isThrowing = false;
                p1.throwAnimFrame = 0;
                p1.throwAnimTimer = 0;
                p1.throwHasReleased = false;
                s.p1Controller.isThrowing = false;

                if (isThrowableWeapon(p1.equippedWeapon) && p1.ammo <= 0) {
                  p1.equippedWeapon = WeaponType.Fists;
                  p1.characterState = 'desarmado';
                  p1.weaponState = 'desarmado';
                }

                if (p1.fsm === PlayerFSMState.MeleeAttack) {
                  p1.fsm = PlayerFSMState.Idle;
                }
              }
            }
          }
        } else if (s.p1Controller) {
          s.p1Controller.isThrowing = false;
        }

        // Sincronizar flag de arma pesada para reducción de velocidad y bloqueo de carrera
        if (s.p1Controller) {
          s.p1Controller.hasHeavyRifleEquipped = isRifleWeapon(p1.equippedWeapon);
        }

        // Cuenta regresiva de la ventana de combo: si pasa el tiempo sin presionar 'N', se reinicia a 0
        if (p1.comboWindowTicks > 0) {
          p1.comboWindowTicks--;
          if (p1.comboWindowTicks <= 0 && !p1.isMeleeComboAttacking) {
            p1.comboStep = 0;
            p1.meleeComboStep = 0;
          }
        }

        // Lógica de avance fotograma a fotograma y resolución de daño del combo
        if (p1.isMeleeComboAttacking) {
          // Bloqueo estricto de movimiento: no puede caminar, correr ni saltar
          p1.velocityX = 0;
          s.p1Controller.vx = 0;
          s.p1Controller.state = ControllerState.Idle;
          p1.fsm = PlayerFSMState.MeleeAttack;

          p1.meleeAnimTimer++;
          // 3 ticks por fotograma (18 ticks = ~300ms a 60 FPS por golpe de 6 frames)
          if (p1.meleeAnimTimer >= 3) {
            p1.meleeAnimTimer = 0;
            p1.meleeAnimFrame++;

            // Si el jugador pulsó 'N' antes de terminar y estamos en frames de salida (frame >= 4)
            if (p1.comboBuffered && p1.meleeAnimFrame >= 4 && p1.meleeComboStep < 2) {
              p1.meleeComboStep++;
              p1.comboStep = p1.meleeComboStep;
              p1.meleeAnimFrame = 0;
              p1.meleeAnimTimer = 0;
              p1.meleeHasHit = false;
              p1.comboBuffered = false;
              p1.comboWindowTicks = 34;
              sounds.playPunch();
            } else if (p1.meleeAnimFrame >= 6) {
              // Fin del último frame (One Shot completado)
              if (p1.comboBuffered && p1.meleeComboStep < 2) {
                p1.meleeComboStep++;
                p1.comboStep = p1.meleeComboStep;
                p1.meleeAnimFrame = 0;
                p1.meleeAnimTimer = 0;
                p1.meleeHasHit = false;
                p1.comboBuffered = false;
                p1.comboWindowTicks = 34;
                sounds.playPunch();
              } else {
                // Al terminar el último frame, vuelve al estado normal (Idle)
                p1.isMeleeComboAttacking = false;
                p1.meleeAnimFrame = 0;
                p1.fsm = PlayerFSMState.Idle;

                if (p1.meleeComboStep >= 2) {
                  // Si completó el Uppercut (3er golpe), el combo finaliza y se reinicia
                  p1.comboStep = 0;
                  p1.comboWindowTicks = 0;
                  p1.meleeComboStep = 0;
                } else {
                  // Si completó golpe 1 o 2, habilita la ventana de combo para el siguiente toque de 'N'
                  p1.comboStep = p1.meleeComboStep + 1;
                  p1.comboWindowTicks = 24; // Ventana de ~400ms para continuar el combo
                }
              }
            }
          }

          // Detección de impacto en los fotogramas activos de golpe (frame 2 o 3)
          if (!p1.meleeHasHit && p1.meleeAnimFrame >= 2 && p1.meleeAnimFrame <= 3) {
            p1.meleeHasHit = true;
            const p1FacingDir = p1.facingRight ? 1 : -1;
            const hitReach = 50;
            const isBotInReach =
              bot.isAlive &&
              !bot.isGrabbed &&
              !s.p2Controller.isInvulnerable &&
              bot.fsm !== PlayerFSMState.Roll &&
              ((p1FacingDir > 0 && bot.x >= p1.x - 10 && bot.x <= p1.x + hitReach) ||
               (p1FacingDir < 0 && bot.x <= p1.x + 10 && bot.x >= p1.x - hitReach)) &&
              Math.abs(bot.y - p1.y) < 32;

            if (isBotInReach) {
              sounds.playHit();
              let damage = 12;
              let shake = 5;
              let text = '¡PUÑETAZO!';
              let textColor = '#38bdf8';

              if (p1.meleeComboStep === 0) {
                // Fila 1: Puñetazo
                damage = 12 * p1.damageDealtModifier;
                shake = 5;
                text = `¡PUÑETAZO! -${Math.round(damage)}`;
                textColor = '#38bdf8';
                bot.velocityX = p1FacingDir * 110;
                bot.hitstunTicks = 14;
                PlayerFSM.tryTransition(bot, PlayerFSMState.Hitstun);
                addSparks(bot.x, bot.y, '#38bdf8', 14);
              } else if (p1.meleeComboStep === 1) {
                // Fila 2: Patada
                damage = 18 * p1.damageDealtModifier;
                shake = 8;
                text = `¡PATADA! -${Math.round(damage)}`;
                textColor = '#f59e0b';
                bot.velocityX = p1FacingDir * 200;
                bot.hitstunTicks = 18;
                PlayerFSM.tryTransition(bot, PlayerFSMState.Hitstun);
                addSparks(bot.x, bot.y, '#f59e0b', 18);
                addSparks(bot.x, bot.y, '#ffffff', 12);
              } else {
                // Fila 3: Uppercut (Lanzamiento vertical demoledor y derribo)
                damage = 28 * p1.damageDealtModifier;
                shake = 14;
                text = `¡UPPERCUT! -${Math.round(damage)}`;
                textColor = '#ef4444';
                bot.velocityX = p1FacingDir * 240;
                bot.velocityY = -390;
                s.p2Controller.vy = -390;
                bot.onGround = false;
                bot.knockdownTicks = 45;
                PlayerFSM.tryTransition(bot, PlayerFSMState.KnockedDown);
                sounds.playHeavySmash();
                addSparks(bot.x, bot.y - 12, '#ef4444', 26);
                addSparks(bot.x, bot.y - 12, '#fde047', 20);
                addSparks(bot.x, bot.y - 12, '#ffffff', 16);
              }

              s.screenShake = shake;
              bot.health = Math.max(0, bot.health - damage);
              if (bot.health <= 0) {
                bot.health = 0;
                bot.isAlive = false;
                PlayerFSM.tryTransition(bot, PlayerFSMState.Dead);
                sounds.playHit();
              }

              s.floatingTexts.push({
                id: s.nextEntityId++,
                text,
                x: bot.x,
                y: bot.y - 32,
                color: textColor,
                life: 35,
              });
            }

            // Daño e interacción con cajas destructibles
            s.crates.forEach((c) => {
              if (Math.hypot(p1.x + p1FacingDir * 26 - (c.x + c.w / 2), p1.y - (c.y + c.h / 2)) < 44) {
                const cDmg = p1.meleeComboStep === 2 ? 30 : p1.meleeComboStep === 1 ? 20 : 12;
                c.health -= cDmg;
                c.vx = p1FacingDir * 280;
                sounds.playHit();
                addSparks(c.x + 16, c.y + 16, '#d97706', 10);
              }
            });

            // Daño en barriles explosivos
            s.barrels.forEach((b) => {
              if (Math.hypot(p1.x + p1FacingDir * 26 - (b.x + b.w / 2), p1.y - (b.y + b.h / 2)) < 44) {
                const bDmg = p1.meleeComboStep === 2 ? 25 : p1.meleeComboStep === 1 ? 16 : 10;
                b.health -= bDmg;
                b.vx = p1FacingDir * 320;
                sounds.playHit();
                addSparks(b.x + 12, b.y + 16, '#ef4444', 10);
              }
            });
          }
        }

        if (p1.isSliding) {
          p1.slideTicks--;
          if (p1.slideTicks <= 0) {
            p1.isSliding = false;
          }
        }

        // Firearm / Ranged Fire P1
        if (
          firePressed &&
          p1.attackCooldown <= 0 &&
          p1.equippedWeapon !== WeaponType.Fists &&
          p1.ammo > 0 &&
          p1.fsm !== PlayerFSMState.Roll
        ) {
          const wpn = getWeapon(p1.equippedWeapon);
          if (wpn.category === 'Firearm' && !isPistolWeapon(p1.equippedWeapon) && !isRifleWeapon(p1.equippedWeapon)) {
            p1.attackCooldown = wpn.cooldownTicks;
            p1.ammo--;
            PlayerFSM.tryTransition(p1, PlayerFSMState.RangedFire);
            sounds.playGunshot(wpn.type.toLowerCase());

            const dir = p1.facingRight ? 1 : -1;
            const muzzleX = p1.x + dir * 28;
            const muzzleY = p1.y - 6;

            addSparks(muzzleX, muzzleY, '#fde047', 6);
            s.screenShake = Math.min(10, (wpn.damage || 20) / 4);

            const count = wpn.pelletCount || 1;
            for (let i = 0; i < count; i++) {
              const spreadAngle = ((Math.random() - 0.5) * ((wpn.accuracyDeg || 3) * Math.PI / 180)) / 2;
              const speed = wpn.projectileSpeed || 900;
              s.projectiles.push({
                id: s.nextEntityId++,
                x: muzzleX,
                y: muzzleY,
                vx: dir * speed * Math.cos(spreadAngle),
                vy: speed * Math.sin(spreadAngle),
                damage: (wpn.damage / count) * p1.damageDealtModifier,
                onFireDuration: wpn.onFireDuration || 0,
                explosionRadius: wpn.explosionRadius || 0,
                shooterId: p1.id,
                weaponType: p1.equippedWeapon,
                pelletCount: count,
                lifeTicks: 0,
                maxLifeTicks: 60,
                color: '#facc15',
              });
            }
          }
        }

        // Lanzamiento de bombas/granadas P1 está centralizado arriba en la sección 3 con animación 'throw_up' (One Shot de 5 frames, soltando en Frame 3)
      }

      // ─────────────────────────────────────────────────────────
      // 2. INPUT JUGADOR 2 (1v1 LOCAL) O IA DE COMBATE (vsBOT)
      // ─────────────────────────────────────────────────────────
      if (bot.isAlive && s.roundActive) {
        if (gameMode === 'local1v1') {
          const scheme = controlSchemeRef.current;
          s.p2Controller.setPlayerId(2);
          const p2RawInput = s.p2Controller.readInput(keys, s.keysJustPressed, true, scheme);
          const p2Combat = s.p2Controller.readCombatInput(keys, s.keysJustPressed, true, scheme);

          const moveDir = p2RawInput.moveDir;
          const leftKey = moveDir === -1;
          const rightKey = moveDir === 1;
          const runHeld = p2RawInput.run;
          const jumpJustPressed = p2RawInput.jump;
          const jumpHeld = p2RawInput.jumpHeld;
          const rollPressed = p2RawInput.roll;
          const dropThrough = !!p2RawInput.dropThrough;
          const crouchHeld = (scheme === 'wasd_p1')
            ? !!keys['arrowdown']
            : !!(keys['s'] || keys['S']);

          const isNinjaComboLocked = !!bot.isSwordAttacking || !!bot.isMeleeComboAttacking || !!bot.isOneHandAttacking || !!bot.isTwoHandAttacking;

          const p2Input: PlayerInput = {
            moveDir: isNinjaComboLocked ? 0 : moveDir,
            run: isNinjaComboLocked ? false : runHeld,
            jump: isNinjaComboLocked ? false : jumpJustPressed,
            jumpHeld: isNinjaComboLocked ? false : jumpHeld,
            roll: isNinjaComboLocked ? false : rollPressed,
            dropThrough: isNinjaComboLocked ? false : dropThrough,
          };

          // Recuperación activa de derribo para P2 (1v1) mediante teclas de movimiento (W, A, S, D, salto, rodada)
          if (bot.fsm === PlayerFSMState.KnockedDown || bot.fsm === PlayerFSMState.GetUp) {
            const hasDirInput = moveDir !== 0;
            const hasVerticalInput = jumpJustPressed || rollPressed || crouchHeld;
            const anyP2Input = hasDirInput || hasVerticalInput || !!keys['j'] || !!keys['J'] || !!keys['k'] || !!keys['K'] || !!keys['l'] || !!keys['L'];

            if (anyP2Input && bot.stateTicks >= 4) {
              if (rollPressed || (crouchHeld && hasDirInput)) {
                if (hasDirInput) bot.facingRight = moveDir > 0;
                PlayerFSM.tryTransition(bot, PlayerFSMState.Roll);
                s.p2Controller.setPosition(bot.x, bot.y);
                s.p2Controller.isOnFloor = bot.onGround;
                s.p2Controller.facingRight = bot.facingRight;
                s.p2Controller.state = ControllerState.Roll;
                bot.rollTicks = GameConstants.RollDurationTicks;
                bot.invulnerabilityTicks = 20;
                sounds.playRoll();
                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text: '¡RODADA DE RECUPERACIÓN!',
                  x: bot.x,
                  y: bot.y - 28,
                  color: '#f43f5e',
                  life: 25,
                });
              } else if (jumpJustPressed) {
                PlayerFSM.tryTransition(bot, PlayerFSMState.Jump);
                s.p2Controller.setPosition(bot.x, bot.y);
                s.p2Controller.isOnFloor = false;
                s.p2Controller.vy = -GameConstants.JumpVelocity;
                bot.velocityY = -GameConstants.JumpVelocity;
                bot.invulnerabilityTicks = 16;
                sounds.playJump();
                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text: '¡SALTO DE RECUPERACIÓN!',
                  x: bot.x,
                  y: bot.y - 28,
                  color: '#fb7185',
                  life: 25,
                });
              } else {
                if (hasDirInput) {
                  bot.facingRight = moveDir > 0;
                  s.p2Controller.facingRight = bot.facingRight;
                }
                PlayerFSM.tryTransition(bot, PlayerFSMState.Idle);
                s.p2Controller.setPosition(bot.x, bot.y);
                s.p2Controller.isOnFloor = bot.onGround;
                s.p2Controller.state = ControllerState.Idle;
                bot.invulnerabilityTicks = 18;
                addSparks(bot.x, bot.y + 12, '#f43f5e', 8);
                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text: '¡DE PIE!',
                  x: bot.x,
                  y: bot.y - 28,
                  color: '#e2e8f0',
                  life: 25,
                });
              }
            }
          }

          if (
            bot.fsm !== PlayerFSMState.KnockedDown &&
            bot.fsm !== PlayerFSMState.GetUp &&
            bot.fsm !== PlayerFSMState.Hitstun
          ) {
            const prevRoll = s.p2Controller.state === ControllerState.Roll;
            const prevJump = s.p2Controller.state === ControllerState.Jump;

            s.p2Controller.update(1 / 60, p2Input, s.platforms);

            bot.x = s.p2Controller.x;
            bot.y = s.p2Controller.y;
            bot.velocityX = s.p2Controller.vx;
            bot.velocityY = s.p2Controller.vy;
            bot.facingRight = s.p2Controller.facingRight;
            bot.onGround = s.p2Controller.isOnFloor;

            if (s.p2Controller.state === ControllerState.Roll) {
              if (!prevRoll) {
                sounds.playRoll();
                bot.rollTicks = GameConstants.RollDurationTicks;
              }
              bot.fsm = PlayerFSMState.Roll;
              if (Math.random() < 0.65) {
                const dustDir = bot.facingRight ? -1 : 1;
                s.particles.push({
                  x: bot.x + dustDir * 10,
                  y: bot.y + 16,
                  vx: dustDir * (25 + Math.random() * 45),
                  vy: -8 - Math.random() * 15,
                  life: 14,
                  maxLife: 20,
                  color: '#cbd5e1',
                  size: 3,
                });
              }
            } else if (s.p2Controller.state === ControllerState.Jump) {
              if (!prevJump) sounds.playJump();
              bot.fsm = PlayerFSMState.Jump;
            } else if (s.p2Controller.state === ControllerState.Fall) {
              bot.fsm = PlayerFSMState.Fall;
            } else if (s.p2Controller.state === ControllerState.Run || s.p2Controller.state === ControllerState.Walk) {
              if (bot.fsm !== PlayerFSMState.MeleeAttack && bot.fsm !== PlayerFSMState.RangedFire) {
                bot.fsm = s.p2Controller.state === ControllerState.Run ? PlayerFSMState.Run : PlayerFSMState.Idle;
              }
            } else {
              if (bot.fsm !== PlayerFSMState.MeleeAttack && bot.fsm !== PlayerFSMState.RangedFire) {
                bot.fsm = crouchHeld ? PlayerFSMState.Crouch : PlayerFSMState.Idle;
              }
            }
          }

          const isTwoHand = isTwoHandWeapon(bot.equippedWeapon);
          const isOneHand = isOneHandWeapon(bot.equippedWeapon);
          const isRifle = isRifleWeapon(bot.equippedWeapon);
          const isPistol = isPistolWeapon(bot.equippedWeapon);
          const isThrowable = isThrowableWeapon(bot.equippedWeapon);
          const isFirearm = isRifle || isPistol;

          if (s.p2Controller) {
            s.p2Controller.hasHeavyRifleEquipped = isRifle;
          }

          const meleeJustPressed = p2Combat.meleeJust;
          const fireJustPressed = p2Combat.fireJust;
          const firePressed = p2Combat.fire;
          const throwJustPressed = p2Combat.throwJust;
          const p2FacingDir = bot.facingRight ? 1 : -1;

          // ── COMBATE JUGADOR 2 (1v1 LOCAL) ──
          if (bot.isGrappling && bot.grabbedTargetId === p1.id) {
            bot.grappleTicks++;
            p1.x = bot.x + p2FacingDir * 24;
            p1.y = bot.y;
            p1.velocityX = 0;
            p1.velocityY = 0;
            p1.isGrabbed = true;
            s.p1Controller.setPosition(p1.x, p1.y);
            s.p1Controller.vx = 0;
            s.p1Controller.vy = 0;

            if (meleeJustPressed) {
              sounds.playThrow();
              const throwDirX = leftKey ? -1 : (rightKey ? 1 : p2FacingDir);
              const throwUp = jumpHeld || !crouchHeld;
              const throwHit = CombatSystem.resolveThrow(bot, p1, throwDirX, throwUp);

              bot.isGrappling = false;
              bot.grabbedTargetId = null;
              p1.isGrabbed = false;
              bot.attackCooldown = 26;
              s.screenShake = 10;
              addSparks(p1.x, p1.y, '#ef4444', 18);

              s.floatingTexts.push({
                id: s.nextEntityId++,
                text: `¡LANZAMIENTO J2! -${Math.round(throwHit.damageDealt)}`,
                x: p1.x,
                y: p1.y - 35,
                color: '#ef4444',
                life: 38,
              });

              s.crates.forEach((c) => {
                if (Math.hypot(p1.x - (c.x + c.w / 2), p1.y - (c.y + c.h / 2)) < 52) {
                  c.health -= 20;
                  c.vx = throwDirX * 360;
                  sounds.playCrateBreak();
                }
              });
              s.barrels.forEach((b) => {
                if (Math.hypot(p1.x - (b.x + b.w / 2), p1.y - (b.y + b.h / 2)) < 52) {
                  b.health -= 15;
                  b.vx = throwDirX * 420;
                  sounds.playHit();
                }
              });
            } else if (bot.grappleTicks > 50) {
              bot.isGrappling = false;
              bot.grabbedTargetId = null;
              p1.isGrabbed = false;
              bot.attackCooldown = 15;
            }
          } else if (
            meleeJustPressed &&
            Math.hypot(p1.x - bot.x, p1.y - bot.y) < 38 &&
            Math.abs(p1.y - bot.y) < 26 &&
            p1.isAlive &&
            !p1.isGrabbed &&
            !s.p1Controller.isInvulnerable &&
            bot.attackCooldown <= 0 &&
            bot.onGround &&
            (crouchHeld || (bot.facingRight ? rightKey : leftKey))
          ) {
            bot.isGrappling = true;
            bot.grabbedTargetId = p1.id;
            bot.grappleTicks = 0;
            p1.isGrabbed = true;
            sounds.playGrapple();
            s.floatingTexts.push({
              id: s.nextEntityId++,
              text: '¡AGARRE J2!',
              x: bot.x,
              y: bot.y - 30,
              color: '#f87171',
              life: 30,
            });
          } else if (
            meleeJustPressed &&
            bot.attackCooldown <= 0 &&
            (crouchHeld || s.p2Controller.state === ControllerState.Roll || Math.abs(bot.velocityX) > 130) &&
            bot.onGround
          ) {
            const isBladeJ2 = isBladeWeapon(bot.equippedWeapon);
            bot.isSliding = true;
            bot.slideTicks = 18;
            bot.attackCooldown = isBladeJ2 ? 24 : 28;
            bot.velocityX = p2FacingDir * (isBladeJ2 ? 460 : 430);
            s.p2Controller.vx = bot.velocityX;
            if (isBladeJ2) {
              sounds.playSwordSwing();
              sounds.playSlide();
            } else {
              sounds.playSlide();
            }
            PlayerFSM.tryTransition(bot, PlayerFSMState.CrouchSlide);
            addSparks(bot.x, bot.y + 16, isBladeJ2 ? '#e0f2fe' : '#94a3b8', 14);

            if (isBladeJ2) {
              const slideHit = CombatSystem.resolveBladeDashSlash(bot, p1);
              if (slideHit.didHit) {
                sounds.playBladeHit();
                s.screenShake = 9;
                addSparks(p1.x, p1.y + 12, '#ef4444', 18);
                addSparks(p1.x, p1.y + 12, '#ffffff', 12);
                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text: `¡TAJO RASANTE J2! -${Math.round(slideHit.damageDealt)}`,
                  x: p1.x,
                  y: p1.y - 25,
                  color: '#ef4444',
                  life: 35,
                });
              }
            } else {
              const slideHit = CombatSystem.resolveSlideTackle(bot, p1);
              if (slideHit.didHit) {
                sounds.playHit();
                s.screenShake = 8;
                addSparks(p1.x, p1.y + 12, '#ef4444', 16);
                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text: `¡BARRIDA J2! -${Math.round(slideHit.damageDealt)}`,
                  x: p1.x,
                  y: p1.y - 25,
                  color: '#ef4444',
                  life: 35,
                });
              }
            }

            s.crates.forEach((c) => {
              if (Math.hypot(bot.x - (c.x + c.w / 2), bot.y - (c.y + c.h / 2)) < 50) {
                c.health -= isBladeJ2 ? 25 : 15;
                c.vx = p2FacingDir * 320;
                sounds.playHit();
                addSparks(c.x + 16, c.y + 16, '#d97706', 10);
              }
            });
            s.barrels.forEach((b) => {
              if (Math.hypot(bot.x - (b.x + b.w / 2), bot.y - (b.y + b.h / 2)) < 50) {
                b.health -= 15;
                b.vx = p2FacingDir * 380;
                sounds.playHit();
                addSparks(b.x + 12, b.y + 16, '#ef4444', 10);
              }
            });
          } else if (
            meleeJustPressed &&
            bot.isAlive &&
            s.roundActive &&
            bot.fsm !== PlayerFSMState.KnockedDown &&
            bot.fsm !== PlayerFSMState.GetUp &&
            bot.fsm !== PlayerFSMState.Hitstun &&
            bot.fsm !== PlayerFSMState.Roll &&
            !bot.isGrappling &&
            !bot.isThrowing
          ) {
            if (isOneHand) {
              if (!bot.isOneHandAttacking) {
                bot.isOneHandAttacking = true;
                bot.oneHandAnimFrame = 0;
                bot.oneHandAnimTimer = 0;
                bot.oneHandHasHit = false;

                bot.velocityX = 0;
                s.p2Controller.vx = 0;
                s.p2Controller.state = ControllerState.Idle;
                PlayerFSM.tryTransition(bot, PlayerFSMState.MeleeAttack);

                if (isBladeWeapon(bot.equippedWeapon)) {
                  sounds.playSwordSwing();
                } else {
                  sounds.playPunch();
                }
              }
            } else if (isTwoHand) {
              if (!bot.isTwoHandAttacking) {
                bot.isTwoHandAttacking = true;
                bot.twoHandAnimFrame = 0;
                bot.twoHandAnimTimer = 0;
                bot.twoHandHasHit = false;

                bot.velocityX = 0;
                s.p2Controller.vx = 0;
                s.p2Controller.state = ControllerState.Idle;
                PlayerFSM.tryTransition(bot, PlayerFSMState.MeleeAttack);

                if (isBladeWeapon(bot.equippedWeapon)) {
                  sounds.playSwordSwing();
                } else {
                  sounds.playPunch();
                }
              }
            } else if (isSwordWeapon(bot.equippedWeapon)) {
              if (bot.isSwordAttacking) {
                if ((bot.swordComboStep || 0) < 2) {
                  bot.swordComboBuffered = true;
                  bot.swordComboWindowTicks = 32;

                  if ((bot.swordAnimFrame || 0) >= 3) {
                    bot.swordComboStep = (bot.swordComboStep || 0) + 1;
                    bot.swordAnimFrame = 0;
                    bot.swordAnimTimer = 0;
                    bot.swordHasHit = false;
                    bot.swordComboBuffered = false;
                    bot.swordComboWindowTicks = 32;
                    sounds.playSwordSwing();
                  }
                }
              } else {
                let nextStep = 0;
                if ((bot.swordComboWindowTicks || 0) > 0 && (bot.swordComboStep || 0) > 0 && (bot.swordComboStep || 0) <= 2) {
                  nextStep = bot.swordComboStep || 0;
                } else {
                  nextStep = 0;
                }

                bot.isSwordAttacking = true;
                bot.swordComboStep = nextStep;
                bot.swordAnimFrame = 0;
                bot.swordAnimTimer = 0;
                bot.swordHasHit = false;
                bot.swordComboBuffered = false;
                bot.swordComboWindowTicks = 32;

                bot.velocityX = 0;
                s.p2Controller.vx = 0;
                s.p2Controller.state = ControllerState.Idle;
                PlayerFSM.tryTransition(bot, PlayerFSMState.MeleeAttack);

                sounds.playSwordSwing();
              }
            } else {
              // Combo Melee desarmado J2 (3 golpes idénticos al protagonista)
              if (bot.isMeleeComboAttacking) {
                if (bot.meleeComboStep < 2) {
                  bot.comboBuffered = true;
                  bot.comboWindowTicks = 34;

                  if (bot.meleeAnimFrame >= 3) {
                    bot.meleeComboStep++;
                    bot.comboStep = bot.meleeComboStep;
                    bot.meleeAnimFrame = 0;
                    bot.meleeAnimTimer = 0;
                    bot.meleeHasHit = false;
                    bot.comboBuffered = false;
                    bot.comboWindowTicks = 34;
                    sounds.playPunch();
                  }
                }
              } else {
                let nextStep = 0;
                if (bot.comboWindowTicks > 0 && bot.comboStep > 0 && bot.comboStep <= 2) {
                  nextStep = bot.comboStep;
                } else {
                  nextStep = 0;
                }

                bot.isMeleeComboAttacking = true;
                bot.meleeComboStep = nextStep;
                bot.comboStep = nextStep;
                bot.meleeAnimFrame = 0;
                bot.meleeAnimTimer = 0;
                bot.meleeHasHit = false;
                bot.comboBuffered = false;
                bot.comboWindowTicks = 34;

                bot.velocityX = 0;
                s.p2Controller.vx = 0;
                s.p2Controller.state = ControllerState.Idle;
                PlayerFSM.tryTransition(bot, PlayerFSMState.MeleeAttack);

                sounds.playPunch();
              }
            }
          }

          // ── DISPARO DE ARMAS DE FUEGO JUGADOR 2 (Tecla K) ──
          if (
            (fireJustPressed || (firePressed && (bot.isRifleShooting || bot.isPistolShooting))) &&
            isFirearm &&
            bot.isAlive &&
            s.roundActive &&
            bot.fsm !== PlayerFSMState.KnockedDown &&
            bot.fsm !== PlayerFSMState.GetUp &&
            bot.fsm !== PlayerFSMState.Hitstun &&
            bot.fsm !== PlayerFSMState.Roll &&
            !bot.isGrappling &&
            !bot.isThrowing
          ) {
            if (isRifle) {
              if (bot.attackCooldown <= 0 && !bot.isRifleShooting) {
                if (bot.ammo > 0) {
                  const wpn = getWeapon(bot.equippedWeapon);
                  bot.isRifleShooting = true;
                  bot.rifleAnimFrame = 0;
                  bot.rifleAnimTimer = 0;
                  bot.rifleHasFired = true;
                  s.p2Controller.isShootingRifle = true;

                  bot.attackCooldown = Math.max(wpn.cooldownTicks, 10);
                  bot.ammo--;
                  PlayerFSM.tryTransition(bot, PlayerFSMState.RangedFire);
                  sounds.playGunshot(wpn.soundType || wpn.type.toLowerCase());

                  const dir = bot.facingRight ? 1 : -1;
                  const muzzleX = bot.x + dir * 32;
                  const muzzleY = bot.y - 7;

                  addSparks(muzzleX, muzzleY, '#fde047', 12);
                  addSparks(muzzleX, muzzleY, '#ffffff', 6);
                  s.screenShake = Math.min(14, Math.max(5, (wpn.damage || 25) / 3));

                  const count = wpn.pelletCount || 1;
                  for (let i = 0; i < count; i++) {
                    const spreadAngle = ((Math.random() - 0.5) * ((wpn.accuracyDeg || 4) * Math.PI / 180)) / 2;
                    const speed = wpn.projectileSpeed || 950;
                    s.projectiles.push({
                      id: s.nextEntityId++,
                      x: muzzleX,
                      y: muzzleY,
                      vx: dir * speed * Math.cos(spreadAngle),
                      vy: speed * Math.sin(spreadAngle),
                      damage: (wpn.damage / count) * bot.damageDealtModifier,
                      onFireDuration: wpn.onFireDuration || 0,
                      explosionRadius: wpn.explosionRadius || 0,
                      shooterId: bot.id,
                      weaponType: bot.equippedWeapon,
                      pelletCount: count,
                      lifeTicks: 0,
                      maxLifeTicks: 60,
                      color: wpn.color || '#facc15',
                    });
                  }
                } else {
                  bot.attackCooldown = 15;
                  sounds.playDryFire();
                }
              }
            } else if (isPistol) {
              if (bot.attackCooldown <= 0 && !bot.isPistolShooting) {
                if (bot.ammo > 0) {
                  const wpn = getWeapon(bot.equippedWeapon);
                  bot.isPistolShooting = true;
                  bot.pistolAnimFrame = 0;
                  bot.pistolAnimTimer = 0;
                  bot.pistolHasFired = true;
                  s.p2Controller.isShootingPistol = true;

                  bot.attackCooldown = Math.max(wpn.cooldownTicks, 14);
                  bot.ammo--;
                  PlayerFSM.tryTransition(bot, PlayerFSMState.RangedFire);
                  sounds.playGunshot(wpn.type.toLowerCase());

                  const dir = bot.facingRight ? 1 : -1;
                  const muzzleX = bot.x + dir * 28;
                  const muzzleY = bot.y - 6;

                  addSparks(muzzleX, muzzleY, '#fde047', 8);
                  s.screenShake = Math.min(10, Math.max(3, (wpn.damage || 20) / 4));

                  const count = wpn.pelletCount || 1;
                  for (let i = 0; i < count; i++) {
                    const spreadAngle = ((Math.random() - 0.5) * ((wpn.accuracyDeg || 3) * Math.PI / 180)) / 2;
                    const speed = wpn.projectileSpeed || 900;
                    s.projectiles.push({
                      id: s.nextEntityId++,
                      x: muzzleX,
                      y: muzzleY,
                      vx: dir * speed * Math.cos(spreadAngle),
                      vy: speed * Math.sin(spreadAngle),
                      damage: (wpn.damage / count) * bot.damageDealtModifier,
                      onFireDuration: wpn.onFireDuration || 0,
                      explosionRadius: wpn.explosionRadius || 0,
                      shooterId: bot.id,
                      weaponType: bot.equippedWeapon,
                      pelletCount: count,
                      lifeTicks: 0,
                      maxLifeTicks: 60,
                      color: '#facc15',
                    });
                  }
                } else {
                  bot.attackCooldown = 15;
                  sounds.playDryFire();
                }
              }
            }
          }

          // ── LANZAMIENTO DE BOMBAS / GRANADAS JUGADOR 2 (Tecla L) ──
          if (
            throwJustPressed &&
            bot.isAlive &&
            s.roundActive &&
            bot.fsm !== PlayerFSMState.KnockedDown &&
            bot.fsm !== PlayerFSMState.GetUp &&
            bot.fsm !== PlayerFSMState.Hitstun &&
            bot.fsm !== PlayerFSMState.Roll &&
            !bot.isGrappling &&
            !bot.isThrowing
          ) {
            const hasGrenadesInInventory = getTotalGrenades(s.botGrenades) > 0;
            if (bot.attackCooldown <= 0) {
              if (isThrowable && bot.ammo > 0) {
                bot.isThrowing = true;
                bot.throwAnimFrame = 0;
                bot.throwAnimTimer = 0;
                bot.throwHasReleased = false;
                bot.throwInitialInertia = bot.velocityX * 0.45;
                bot.velocityX = 0;
                s.p2Controller.vx = 0;
                s.p2Controller.state = ControllerState.Idle;
                s.p2Controller.isThrowing = true;
                bot.attackCooldown = 25;
                PlayerFSM.tryTransition(bot, PlayerFSMState.MeleeAttack);
                sounds.playSwordSwing();
              } else if (hasGrenadesInInventory) {
                bot.isThrowing = true;
                bot.throwAnimFrame = 0;
                bot.throwAnimTimer = 0;
                bot.throwHasReleased = false;
                bot.throwInitialInertia = bot.velocityX * 0.45;
                bot.velocityX = 0;
                s.p2Controller.vx = 0;
                s.p2Controller.state = ControllerState.Idle;
                s.p2Controller.isThrowing = true;
                bot.attackCooldown = 25;
                PlayerFSM.tryTransition(bot, PlayerFSMState.MeleeAttack);
                sounds.playSwordSwing();
              } else {
                bot.attackCooldown = 15;
                sounds.playDryFire();
                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text: '¡SIN BOMBAS / GRANADAS!',
                  x: bot.x,
                  y: bot.y - 30,
                  color: '#ef4444',
                  life: 25,
                });
              }
            }
          }

          // ── BUCLES DE ANIMACIÓN Y FOTOGRAMAS JUGADOR 2 ──
          // Ataque a Dos Manos (two_hand_attack - 6 frames)
          if (bot.isTwoHandAttacking) {
            bot.velocityX = 0;
            s.p2Controller.vx = 0;
            s.p2Controller.state = ControllerState.Idle;
            bot.fsm = PlayerFSMState.MeleeAttack;

            bot.twoHandAnimTimer = (bot.twoHandAnimTimer || 0) + 1;
            if (bot.twoHandAnimTimer >= 4) {
              bot.twoHandAnimTimer = 0;
              bot.twoHandAnimFrame = (bot.twoHandAnimFrame || 0) + 1;

              if (bot.twoHandAnimFrame >= 6) {
                bot.isTwoHandAttacking = false;
                bot.twoHandAnimFrame = 0;
                bot.twoHandAnimTimer = 0;
                bot.twoHandHasHit = false;
                bot.fsm = PlayerFSMState.Idle;
              }
            }

            if (!bot.twoHandHasHit && (bot.twoHandAnimFrame || 0) === 3) {
              bot.twoHandHasHit = true;
              const hitReach = 82;
              const isP1InReach =
                p1.isAlive &&
                !p1.isGrabbed &&
                !s.p1Controller.isInvulnerable &&
                p1.fsm !== PlayerFSMState.Roll &&
                ((p2FacingDir > 0 && p1.x >= bot.x - 15 && p1.x <= bot.x + hitReach) ||
                 (p2FacingDir < 0 && p1.x <= bot.x + 15 && p1.x >= bot.x - hitReach)) &&
                Math.abs(p1.y - bot.y) < 48;

              const wpn = getWeapon(bot.equippedWeapon);
              const isBlade = isBladeWeapon(bot.equippedWeapon);
              const baseDmg = (wpn.damage || 22) * 1.45;
              const finalDmg = baseDmg * bot.damageDealtModifier;

              if (isP1InReach) {
                if (isBlade) {
                  sounds.playBladeHit();
                  addSparks(p1.x, p1.y, '#38bdf8', 22);
                  addSparks(p1.x, p1.y, '#ffffff', 14);
                } else {
                  sounds.playHit();
                  addSparks(p1.x, p1.y, '#f97316', 22);
                  addSparks(p1.x, p1.y, '#fbbf24', 14);
                }

                s.screenShake = 12;
                p1.velocityX = p2FacingDir * 260;
                p1.hitstunTicks = 24;
                PlayerFSM.tryTransition(p1, PlayerFSMState.Hitstun);

                p1.health = Math.max(0, p1.health - finalDmg);
                if (p1.health <= 0) {
                  p1.health = 0;
                  p1.isAlive = false;
                  PlayerFSM.tryTransition(p1, PlayerFSMState.Dead);
                  sounds.playHit();
                }

                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text: `¡GOLPE PESADO (${wpn.name.toUpperCase()})! -${Math.round(finalDmg)}`,
                  x: p1.x,
                  y: p1.y - 36,
                  color: '#f97316',
                  life: 55,
                });
              }

              s.crates.forEach((c) => {
                if (Math.hypot(bot.x + p2FacingDir * 32 - (c.x + c.w / 2), bot.y - (c.y + c.h / 2)) < 52) {
                  c.health -= baseDmg * 1.5;
                  c.vx = p2FacingDir * 380;
                  sounds.playCrateBreak();
                  addSparks(c.x + 16, c.y + 16, '#d97706', 14);
                }
              });

              s.barrels.forEach((b) => {
                if (Math.hypot(bot.x + p2FacingDir * 32 - (b.x + b.w / 2), bot.y - (b.y + b.h / 2)) < 52) {
                  b.health -= baseDmg * 1.2;
                  b.vx = p2FacingDir * 420;
                  sounds.playHit();
                  addSparks(b.x + 12, b.y + 16, '#ef4444', 14);
                }
              });
            }
          }

          // ── COMBATE CON ESPADA EXCLUSIVO DEL NINJA (J2) ──
          if (bot.isSwordAttacking) {
            bot.velocityX = 0;
            s.p2Controller.vx = 0;
            s.p2Controller.state = ControllerState.Idle;
            bot.fsm = PlayerFSMState.MeleeAttack;

            bot.swordAnimTimer = (bot.swordAnimTimer || 0) + 1;
            if (bot.swordAnimTimer >= 2) {
              bot.swordAnimTimer = 0;
              bot.swordAnimFrame = (bot.swordAnimFrame || 0) + 1;

              if (bot.swordComboBuffered && (bot.swordAnimFrame || 0) >= 3 && (bot.swordComboStep || 0) < 2) {
                bot.swordComboStep = (bot.swordComboStep || 0) + 1;
                bot.swordAnimFrame = 0;
                bot.swordAnimTimer = 0;
                bot.swordHasHit = false;
                bot.swordComboBuffered = false;
                bot.swordComboWindowTicks = 32;
                sounds.playSwordSwing();
              } else if ((bot.swordAnimFrame || 0) >= 5) {
                if (bot.swordComboBuffered && (bot.swordComboStep || 0) < 2) {
                  bot.swordComboStep = (bot.swordComboStep || 0) + 1;
                  bot.swordAnimFrame = 0;
                  bot.swordAnimTimer = 0;
                  bot.swordHasHit = false;
                  bot.swordComboBuffered = false;
                  bot.swordComboWindowTicks = 32;
                  sounds.playSwordSwing();
                } else {
                  bot.isSwordAttacking = false;
                  bot.swordAnimFrame = 0;
                  bot.swordAnimTimer = 0;
                  bot.swordHasHit = false;
                  bot.fsm = PlayerFSMState.Idle;

                  if ((bot.swordComboStep || 0) >= 2) {
                    bot.swordComboStep = 0;
                    bot.swordComboWindowTicks = 0;
                  } else {
                    bot.swordComboStep = (bot.swordComboStep || 0) + 1;
                    bot.swordComboWindowTicks = 26;
                  }
                }
              }
            }

            if (!bot.swordHasHit && (bot.swordAnimFrame || 0) >= 2) {
              bot.swordHasHit = true;
              const currentStep = bot.swordComboStep || 0;
              const hitReach = currentStep === 0 ? 68 : currentStep === 1 ? 74 : 84;
              const isP1InReach =
                p1.isAlive &&
                !p1.isGrabbed &&
                !s.p1Controller.isInvulnerable &&
                p1.fsm !== PlayerFSMState.Roll &&
                ((p2FacingDir > 0 && p1.x >= bot.x - 10 && p1.x <= bot.x + hitReach) ||
                 (p2FacingDir < 0 && p1.x <= bot.x + 10 && p1.x >= bot.x - hitReach)) &&
                Math.abs(p1.y - bot.y) < 42;

              const wpn = getWeapon(bot.equippedWeapon);
              const wpnName = wpn.name || 'ESPADA';

              if (isP1InReach) {
                sounds.playBladeHit();
                let damage = 22;
                let shake = 6;
                let text = '¡TAJO I!';
                let textColor = '#f43f5e';

                if (currentStep === 0) {
                  damage = 22 * bot.damageDealtModifier;
                  shake = 6;
                  text = `¡TAJO I (${wpnName.toUpperCase()})! -${Math.round(damage)}`;
                  textColor = '#f43f5e';
                  p1.velocityX = p2FacingDir * 190;
                  p1.hitstunTicks = 16;
                  PlayerFSM.tryTransition(p1, PlayerFSMState.Hitstun);
                  addSparks(p1.x, p1.y, '#f43f5e', 16);
                  addSparks(p1.x, p1.y, '#ffffff', 10);
                } else if (currentStep === 1) {
                  damage = 30 * bot.damageDealtModifier;
                  shake = 9;
                  text = `¡TAJO II (${wpnName.toUpperCase()})! -${Math.round(damage)}`;
                  textColor = '#f43f5e';
                  p1.velocityX = p2FacingDir * 270;
                  p1.hitstunTicks = 20;
                  PlayerFSM.tryTransition(p1, PlayerFSMState.Hitstun);
                  addSparks(p1.x, p1.y, '#f43f5e', 22);
                  addSparks(p1.x, p1.y, '#ffffff', 14);
                } else {
                  damage = 44 * bot.damageDealtModifier;
                  shake = 14;
                  text = `¡REMATE NINJA (${wpnName.toUpperCase()})! -${Math.round(damage)}`;
                  textColor = '#e11d48';
                  p1.velocityX = p2FacingDir * 390;
                  p1.velocityY = -270;
                  s.p1Controller.vy = -270;
                  p1.onGround = false;
                  p1.knockdownTicks = 45;
                  PlayerFSM.tryTransition(p1, PlayerFSMState.KnockedDown);
                  sounds.playHeavyBladeSlash();
                  addSparks(p1.x, p1.y - 10, '#f43f5e', 28);
                  addSparks(p1.x, p1.y - 10, '#ffffff', 16);
                  CombatSystem.disarmPlayer(p1);
                }

                s.screenShake = shake;
                p1.health = Math.max(0, p1.health - damage);
                if (p1.health <= 0) {
                  p1.health = 0;
                  p1.isAlive = false;
                  PlayerFSM.tryTransition(p1, PlayerFSMState.Dead);
                  sounds.playHit();
                }

                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text,
                  x: p1.x,
                  y: p1.y - 32,
                  color: textColor,
                  life: 38,
                });
              }
            }
          }

          if ((bot.swordComboWindowTicks || 0) > 0) {
            bot.swordComboWindowTicks = (bot.swordComboWindowTicks || 0) - 1;
            if (bot.swordComboWindowTicks <= 0 && !bot.isSwordAttacking) {
              bot.swordComboStep = 0;
            }
          }

          // Ataque a Una Mano (one_hand_attack - 5 frames)
          if (bot.isOneHandAttacking) {
            bot.velocityX = 0;
            s.p2Controller.vx = 0;
            s.p2Controller.state = ControllerState.Idle;
            bot.fsm = PlayerFSMState.MeleeAttack;

            bot.oneHandAnimTimer = (bot.oneHandAnimTimer || 0) + 1;
            if (bot.oneHandAnimTimer >= 2) {
              bot.oneHandAnimTimer = 0;
              bot.oneHandAnimFrame = (bot.oneHandAnimFrame || 0) + 1;

              if (bot.oneHandAnimFrame >= 5) {
                bot.isOneHandAttacking = false;
                bot.oneHandAnimFrame = 0;
                bot.oneHandAnimTimer = 0;
                bot.oneHandHasHit = false;
                bot.fsm = PlayerFSMState.Idle;
              }
            }

            if (!bot.oneHandHasHit && (bot.oneHandAnimFrame || 0) >= 2) {
              bot.oneHandHasHit = true;
              const hitReach = 58;
              const isP1InReach =
                p1.isAlive &&
                !p1.isGrabbed &&
                !s.p1Controller.isInvulnerable &&
                p1.fsm !== PlayerFSMState.Roll &&
                ((p2FacingDir > 0 && p1.x >= bot.x - 10 && p1.x <= bot.x + hitReach) ||
                 (p2FacingDir < 0 && p1.x <= bot.x + 10 && p1.x >= bot.x - hitReach)) &&
                Math.abs(p1.y - bot.y) < 34;

              const wpn = getWeapon(bot.equippedWeapon);
              const isBlade = isBladeWeapon(bot.equippedWeapon);
              const baseDmg = wpn.damage || 16;
              const finalDmg = baseDmg * bot.damageDealtModifier;

              if (isP1InReach) {
                if (isBlade) {
                  sounds.playBladeHit();
                  addSparks(p1.x, p1.y, '#38bdf8', 16);
                  addSparks(p1.x, p1.y, '#ffffff', 10);
                } else {
                  sounds.playHit();
                  addSparks(p1.x, p1.y, '#f59e0b', 16);
                }

                s.screenShake = 7;
                p1.velocityX = p2FacingDir * 170;
                p1.hitstunTicks = 16;
                PlayerFSM.tryTransition(p1, PlayerFSMState.Hitstun);

                p1.health = Math.max(0, p1.health - finalDmg);
                if (p1.health <= 0) {
                  p1.health = 0;
                  p1.isAlive = false;
                  PlayerFSM.tryTransition(p1, PlayerFSMState.Dead);
                  sounds.playHit();
                }

                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text: `¡${wpn.name.toUpperCase()}! -${Math.round(finalDmg)}`,
                  x: p1.x,
                  y: p1.y - 32,
                  color: isBlade ? '#38bdf8' : '#f59e0b',
                  life: 35,
                });
              }

              s.crates.forEach((c) => {
                if (Math.hypot(bot.x + p2FacingDir * 30 - (c.x + c.w / 2), bot.y - (c.y + c.h / 2)) < 48) {
                  c.health -= baseDmg * 1.2;
                  c.vx = p2FacingDir * 290;
                  sounds.playHit();
                  addSparks(c.x + 16, c.y + 16, '#d97706', 12);
                }
              });

              s.barrels.forEach((b) => {
                if (Math.hypot(bot.x + p2FacingDir * 30 - (b.x + b.w / 2), bot.y - (b.y + b.h / 2)) < 48) {
                  b.health -= baseDmg;
                  b.vx = p2FacingDir * 330;
                  sounds.playHit();
                  addSparks(b.x + 12, b.y + 16, '#ef4444', 12);
                }
              });
            }
          }

          // Disparo de Pistolas (pistol_shoot - 4 frames)
          if (bot.isPistolShooting) {
            if (bot.fsm === PlayerFSMState.KnockedDown || bot.fsm === PlayerFSMState.Hitstun || !bot.isAlive) {
              bot.isPistolShooting = false;
              bot.pistolAnimFrame = 0;
              bot.pistolAnimTimer = 0;
              s.p2Controller.isShootingPistol = false;
            } else {
              s.p2Controller.isShootingPistol = true;
              if (moveDir !== 0) {
                bot.facingRight = moveDir > 0;
                s.p2Controller.facingRight = bot.facingRight;
              }

              bot.pistolAnimTimer = (bot.pistolAnimTimer || 0) + 1;
              if (bot.pistolAnimTimer >= 4) {
                bot.pistolAnimTimer = 0;
                bot.pistolAnimFrame = (bot.pistolAnimFrame || 0) + 1;

                if (bot.pistolAnimFrame >= 4) {
                  const isAuto =
                    bot.equippedWeapon === WeaponType.Uzi ||
                    bot.equippedWeapon === WeaponType.SilencedUzi ||
                    bot.equippedWeapon === WeaponType.MachinePistol;
                  const kHeld = !!keys['k'] || !!keys['K'];

                  if (isAuto && kHeld && bot.ammo > 0 && bot.attackCooldown <= 0) {
                    bot.pistolAnimFrame = 0;
                    bot.ammo--;
                    const wpn = getWeapon(bot.equippedWeapon);
                    bot.attackCooldown = Math.max(wpn.cooldownTicks, 10);
                    sounds.playGunshot(wpn.type.toLowerCase());

                    const dir = bot.facingRight ? 1 : -1;
                    const muzzleX = bot.x + dir * 28;
                    const muzzleY = bot.y - 6;

                    addSparks(muzzleX, muzzleY, '#fde047', 8);
                    s.screenShake = 3;

                    const speed = wpn.projectileSpeed || 900;
                    const spreadAngle = ((Math.random() - 0.5) * ((wpn.accuracyDeg || 4) * Math.PI / 180)) / 2;
                    s.projectiles.push({
                      id: s.nextEntityId++,
                      x: muzzleX,
                      y: muzzleY,
                      vx: dir * speed * Math.cos(spreadAngle),
                      vy: speed * Math.sin(spreadAngle),
                      damage: wpn.damage * bot.damageDealtModifier,
                      onFireDuration: 0,
                      explosionRadius: 0,
                      shooterId: bot.id,
                      weaponType: bot.equippedWeapon,
                      pelletCount: 1,
                      lifeTicks: 0,
                      maxLifeTicks: 60,
                      color: '#facc15',
                    });
                  } else {
                    bot.isPistolShooting = false;
                    bot.pistolAnimFrame = 0;
                    bot.pistolAnimTimer = 0;
                    s.p2Controller.isShootingPistol = false;
                    if (bot.fsm === PlayerFSMState.RangedFire) {
                      bot.fsm = PlayerFSMState.Idle;
                    }
                  }
                }
              }
            }
          } else if (s.p2Controller) {
            s.p2Controller.isShootingPistol = false;
          }

          // Disparo de Rifles/Escopetas (rifle_shoot - 4 frames con retroceso en frame 3)
          if (bot.isRifleShooting) {
            if (bot.fsm === PlayerFSMState.KnockedDown || bot.fsm === PlayerFSMState.Hitstun || !bot.isAlive) {
              bot.isRifleShooting = false;
              bot.rifleAnimFrame = 0;
              bot.rifleAnimTimer = 0;
              s.p2Controller.isShootingRifle = false;
            } else {
              s.p2Controller.isShootingRifle = true;
              if (moveDir !== 0) {
                bot.facingRight = moveDir > 0;
                s.p2Controller.facingRight = bot.facingRight;
              }

              bot.rifleAnimTimer = (bot.rifleAnimTimer || 0) + 1;
              if (bot.rifleAnimTimer >= 4) {
                bot.rifleAnimTimer = 0;
                bot.rifleAnimFrame = (bot.rifleAnimFrame || 0) + 1;

                if (bot.rifleAnimFrame >= 4) {
                  const isAuto =
                    bot.equippedWeapon === WeaponType.M60 ||
                    bot.equippedWeapon === WeaponType.Assault ||
                    bot.equippedWeapon === WeaponType.Rifle ||
                    bot.equippedWeapon === WeaponType.TommyGun ||
                    bot.equippedWeapon === WeaponType.SMG ||
                    bot.equippedWeapon === WeaponType.Carbine ||
                    bot.equippedWeapon === WeaponType.MP50;
                  const kHeld = !!keys['k'] || !!keys['K'];

                  if (isAuto && kHeld && bot.ammo > 0 && bot.attackCooldown <= 0) {
                    bot.rifleAnimFrame = 0;
                    bot.ammo--;
                    const wpn = getWeapon(bot.equippedWeapon);
                    bot.attackCooldown = Math.max(wpn.cooldownTicks, 8);
                    sounds.playGunshot(wpn.soundType || wpn.type.toLowerCase());

                    const dir = bot.facingRight ? 1 : -1;
                    const muzzleX = bot.x + dir * 32;
                    const muzzleY = bot.y - 7;

                    addSparks(muzzleX, muzzleY, '#fde047', 10);
                    addSparks(muzzleX, muzzleY, '#ffffff', 5);
                    s.screenShake = 4;

                    const speed = wpn.projectileSpeed || 950;
                    const spreadAngle = ((Math.random() - 0.5) * ((wpn.accuracyDeg || 4) * Math.PI / 180)) / 2;
                    s.projectiles.push({
                      id: s.nextEntityId++,
                      x: muzzleX,
                      y: muzzleY,
                      vx: dir * speed * Math.cos(spreadAngle),
                      vy: speed * Math.sin(spreadAngle),
                      damage: wpn.damage * bot.damageDealtModifier,
                      onFireDuration: wpn.onFireDuration || 0,
                      explosionRadius: wpn.explosionRadius || 0,
                      shooterId: bot.id,
                      weaponType: bot.equippedWeapon,
                      pelletCount: 1,
                      lifeTicks: 0,
                      maxLifeTicks: 60,
                      color: wpn.color || '#facc15',
                    });
                  } else {
                    bot.isRifleShooting = false;
                    bot.rifleAnimFrame = 0;
                    bot.rifleAnimTimer = 0;
                    s.p2Controller.isShootingRifle = false;
                    if (bot.fsm === PlayerFSMState.RangedFire) {
                      bot.fsm = PlayerFSMState.Idle;
                    }
                  }
                }
              }
            }
          } else if (s.p2Controller) {
            s.p2Controller.isShootingRifle = false;
          }

          // Lanzamiento (throw_up - 5 frames, liberación en frame 2)
          if (bot.isThrowing) {
            if (bot.fsm === PlayerFSMState.KnockedDown || bot.fsm === PlayerFSMState.Hitstun || !bot.isAlive) {
              bot.isThrowing = false;
              bot.throwAnimFrame = 0;
              bot.throwAnimTimer = 0;
              bot.throwHasReleased = false;
              s.p2Controller.isThrowing = false;
            } else {
              s.p2Controller.isThrowing = true;
              bot.velocityX = 0;
              s.p2Controller.vx = 0;
              s.p2Controller.state = ControllerState.Idle;

              if (moveDir !== 0) {
                bot.facingRight = moveDir > 0;
                s.p2Controller.facingRight = bot.facingRight;
              }

              if (bot.throwAnimFrame === 2 && !bot.throwHasReleased) {
                bot.throwHasReleased = true;

                const dir = bot.facingRight ? 1 : -1;
                const launchX = bot.x + dir * 26;
                const launchY = bot.y - 14;
                const inheritedInertia = bot.throwInitialInertia || 0;
                const wType = bot.equippedWeapon;
                const isThrowableNow = isThrowableWeapon(wType);

                if (isThrowableNow) {
                  bot.ammo--;
                  const wpn = getWeapon(wType);

                  if (wType === WeaponType.Grenade) {
                    const gCfg = GRENADE_DATABASE[GrenadeType.Frag];
                    sounds.playGunshot('grenade');
                    s.projectiles.push({
                      id: s.nextEntityId++,
                      x: launchX,
                      y: launchY,
                      vx: dir * 440 + inheritedInertia,
                      vy: -300,
                      damage: gCfg.damage * bot.damageDealtModifier,
                      onFireDuration: 0,
                      explosionRadius: gCfg.explosionRadius,
                      shooterId: bot.id,
                      weaponType: WeaponType.Grenade,
                      pelletCount: 1,
                      lifeTicks: 0,
                      maxLifeTicks: gCfg.fuseTicks || 85,
                      isGrenade: true,
                      isThrowable: true,
                      grenadeType: GrenadeType.Frag,
                      rotation: 0,
                      rotationSpeed: dir * 0.25,
                      color: gCfg.color,
                    });
                  } else if (wType === WeaponType.Molotov) {
                    const gCfg = GRENADE_DATABASE[GrenadeType.Molotov];
                    sounds.playGunshot('grenade');
                    s.projectiles.push({
                      id: s.nextEntityId++,
                      x: launchX,
                      y: launchY,
                      vx: dir * 390 + inheritedInertia,
                      vy: -270,
                      damage: gCfg.damage * bot.damageDealtModifier,
                      onFireDuration: gCfg.burnDurationTicks || 240,
                      explosionRadius: gCfg.explosionRadius,
                      shooterId: bot.id,
                      weaponType: WeaponType.Molotov,
                      pelletCount: 1,
                      lifeTicks: 0,
                      maxLifeTicks: 70,
                      isGrenade: true,
                      isMolotov: true,
                      isThrowable: true,
                      grenadeType: GrenadeType.Molotov,
                      rotation: 0,
                      rotationSpeed: dir * 0.28,
                      color: gCfg.color,
                    });
                  } else if (wType === WeaponType.C4) {
                    sounds.playGunshot('grenade');
                    s.projectiles.push({
                      id: s.nextEntityId++,
                      x: launchX,
                      y: launchY,
                      vx: dir * 350 + inheritedInertia,
                      vy: -240,
                      damage: (wpn.damage || 60) * bot.damageDealtModifier,
                      onFireDuration: 0,
                      explosionRadius: wpn.explosionRadius || 85,
                      shooterId: bot.id,
                      weaponType: WeaponType.C4,
                      pelletCount: 1,
                      lifeTicks: 0,
                      maxLifeTicks: 80,
                      isGrenade: true,
                      isThrowable: true,
                      rotation: 0,
                      rotationSpeed: dir * 0.18,
                      color: '#ef4444',
                    });
                  } else if (wType === WeaponType.Mine) {
                    sounds.playPickup();
                    s.projectiles.push({
                      id: s.nextEntityId++,
                      x: launchX,
                      y: launchY,
                      vx: dir * 280 + inheritedInertia,
                      vy: -180,
                      damage: (wpn.damage || 45) * bot.damageDealtModifier,
                      onFireDuration: 0,
                      explosionRadius: wpn.explosionRadius || 60,
                      shooterId: bot.id,
                      weaponType: WeaponType.Mine,
                      pelletCount: 1,
                      lifeTicks: 0,
                      maxLifeTicks: 250,
                      isGrenade: true,
                      isThrowable: true,
                      rotation: 0,
                      rotationSpeed: dir * 0.12,
                      color: '#f59e0b',
                    });
                  } else if (wType === WeaponType.Baseball) {
                    sounds.playPunch();
                    s.projectiles.push({
                      id: s.nextEntityId++,
                      x: launchX,
                      y: launchY,
                      vx: dir * 650 + inheritedInertia,
                      vy: -140,
                      damage: (wpn.damage || 14) * bot.damageDealtModifier,
                      onFireDuration: 0,
                      explosionRadius: 0,
                      shooterId: bot.id,
                      weaponType: WeaponType.Baseball,
                      pelletCount: 1,
                      lifeTicks: 0,
                      maxLifeTicks: 90,
                      isGrenade: true,
                      isThrowable: true,
                      rotation: 0,
                      rotationSpeed: dir * 0.45,
                      color: '#f8fafc',
                    });
                  }

                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: `¡${wpn.name}! (${bot.ammo} rest.)`,
                    x: bot.x,
                    y: bot.y - 32,
                    color: wpn.color || '#38bdf8',
                    life: 30,
                  });
                } else {
                  const thrownType = consumeGrenade(s.botGrenades);
                  if (thrownType) {
                    sounds.playGunshot('grenade');
                    const gCfg = GRENADE_DATABASE[thrownType];
                    s.projectiles.push({
                      id: s.nextEntityId++,
                      x: launchX,
                      y: launchY,
                      vx: dir * 420 + inheritedInertia,
                      vy: -310,
                      damage: gCfg.damage * bot.damageDealtModifier,
                      onFireDuration: gCfg.burnDurationTicks || 0,
                      explosionRadius: gCfg.explosionRadius,
                      shooterId: bot.id,
                      weaponType: WeaponType.Grenade,
                      pelletCount: 1,
                      lifeTicks: 0,
                      maxLifeTicks: gCfg.fuseTicks || 85,
                      isGrenade: true,
                      isMolotov: thrownType === GrenadeType.Molotov,
                      isThrowable: true,
                      grenadeType: thrownType,
                      rotation: 0,
                      rotationSpeed: dir * 0.24,
                      color: gCfg.color,
                    });

                    s.floatingTexts.push({
                      id: s.nextEntityId++,
                      text: `¡${gCfg.shortName}! (${s.botGrenades.ammo[thrownType]} rest.)`,
                      x: bot.x,
                      y: bot.y - 32,
                      color: gCfg.color,
                      life: 30,
                    });
                  }
                }
              }

              bot.throwAnimTimer = (bot.throwAnimTimer || 0) + 1;
              if (bot.throwAnimTimer >= 4) {
                bot.throwAnimTimer = 0;
                bot.throwAnimFrame = (bot.throwAnimFrame || 0) + 1;

                if (bot.throwAnimFrame >= 5) {
                  bot.isThrowing = false;
                  bot.throwAnimFrame = 0;
                  bot.throwAnimTimer = 0;
                  bot.throwHasReleased = false;
                  s.p2Controller.isThrowing = false;

                  if (isThrowableWeapon(bot.equippedWeapon) && bot.ammo <= 0) {
                    bot.equippedWeapon = WeaponType.Fists;
                    bot.characterState = 'desarmado';
                    bot.weaponState = 'desarmado';
                  }

                  if (bot.fsm === PlayerFSMState.MeleeAttack) {
                    bot.fsm = PlayerFSMState.Idle;
                  }
                }
              }
            }
          } else if (s.p2Controller) {
            s.p2Controller.isThrowing = false;
          }

          // Combo melee desarmado (Puños / Patada / Uppercut)
          if (bot.comboWindowTicks > 0) {
            bot.comboWindowTicks--;
            if (bot.comboWindowTicks <= 0 && !bot.isMeleeComboAttacking) {
              bot.comboStep = 0;
              bot.meleeComboStep = 0;
            }
          }

          if (bot.isMeleeComboAttacking) {
            bot.velocityX = 0;
            s.p2Controller.vx = 0;
            s.p2Controller.state = ControllerState.Idle;
            bot.fsm = PlayerFSMState.MeleeAttack;

            bot.meleeAnimTimer++;
            if (bot.meleeAnimTimer >= 3) {
              bot.meleeAnimTimer = 0;
              bot.meleeAnimFrame++;

              if (bot.comboBuffered && bot.meleeAnimFrame >= 4 && bot.meleeComboStep < 2) {
                bot.meleeComboStep++;
                bot.comboStep = bot.meleeComboStep;
                bot.meleeAnimFrame = 0;
                bot.meleeAnimTimer = 0;
                bot.meleeHasHit = false;
                bot.comboBuffered = false;
                bot.comboWindowTicks = 34;
                sounds.playPunch();
              } else if (bot.meleeAnimFrame >= 6) {
                if (bot.comboBuffered && bot.meleeComboStep < 2) {
                  bot.meleeComboStep++;
                  bot.comboStep = bot.meleeComboStep;
                  bot.meleeAnimFrame = 0;
                  bot.meleeAnimTimer = 0;
                  bot.meleeHasHit = false;
                  bot.comboBuffered = false;
                  bot.comboWindowTicks = 34;
                  sounds.playPunch();
                } else {
                  bot.isMeleeComboAttacking = false;
                  bot.meleeAnimFrame = 0;
                  bot.fsm = PlayerFSMState.Idle;

                  if (bot.meleeComboStep >= 2) {
                    bot.comboStep = 0;
                    bot.comboWindowTicks = 0;
                    bot.meleeComboStep = 0;
                  } else {
                    bot.comboStep = bot.meleeComboStep + 1;
                    bot.comboWindowTicks = 24;
                  }
                }
              }
            }

            if (!bot.meleeHasHit && bot.meleeAnimFrame >= 2 && bot.meleeAnimFrame <= 3) {
              bot.meleeHasHit = true;
              const hitReach = 50;
              const isP1InReach =
                p1.isAlive &&
                !p1.isGrabbed &&
                !s.p1Controller.isInvulnerable &&
                p1.fsm !== PlayerFSMState.Roll &&
                ((p2FacingDir > 0 && p1.x >= bot.x - 10 && p1.x <= bot.x + hitReach) ||
                 (p2FacingDir < 0 && p1.x <= bot.x + 10 && p1.x >= bot.x - hitReach)) &&
                Math.abs(p1.y - bot.y) < 32;

              if (isP1InReach) {
                sounds.playHit();
                let damage = 12;
                let shake = 5;
                let text = '¡PUÑETAZO J2!';
                let textColor = '#f43f5e';

                if (bot.meleeComboStep === 0) {
                  damage = 12 * bot.damageDealtModifier;
                  shake = 5;
                  text = `¡PUÑETAZO J2! -${Math.round(damage)}`;
                  textColor = '#38bdf8';
                  p1.velocityX = p2FacingDir * 110;
                  p1.hitstunTicks = 14;
                  PlayerFSM.tryTransition(p1, PlayerFSMState.Hitstun);
                  addSparks(p1.x, p1.y, '#38bdf8', 14);
                } else if (bot.meleeComboStep === 1) {
                  damage = 18 * bot.damageDealtModifier;
                  shake = 8;
                  text = `¡PATADA J2! -${Math.round(damage)}`;
                  textColor = '#f59e0b';
                  p1.velocityX = p2FacingDir * 200;
                  p1.hitstunTicks = 18;
                  PlayerFSM.tryTransition(p1, PlayerFSMState.Hitstun);
                  addSparks(p1.x, p1.y, '#f59e0b', 18);
                  addSparks(p1.x, p1.y, '#ffffff', 12);
                } else {
                  damage = 28 * bot.damageDealtModifier;
                  shake = 14;
                  text = `¡UPPERCUT J2! -${Math.round(damage)}`;
                  textColor = '#ef4444';
                  p1.velocityX = p2FacingDir * 240;
                  p1.velocityY = -390;
                  s.p1Controller.vy = -390;
                  p1.onGround = false;
                  p1.knockdownTicks = 45;
                  PlayerFSM.tryTransition(p1, PlayerFSMState.KnockedDown);
                  sounds.playHeavySmash();
                  addSparks(p1.x, p1.y - 12, '#ef4444', 26);
                  addSparks(p1.x, p1.y - 12, '#fde047', 20);
                  addSparks(p1.x, p1.y - 12, '#ffffff', 16);
                }

                s.screenShake = shake;
                p1.health = Math.max(0, p1.health - damage);
                if (p1.health <= 0) {
                  p1.health = 0;
                  p1.isAlive = false;
                  PlayerFSM.tryTransition(p1, PlayerFSMState.Dead);
                  sounds.playHit();
                }

                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text,
                  x: p1.x,
                  y: p1.y - 32,
                  color: textColor,
                  life: 35,
                });
              }

              s.crates.forEach((c) => {
                if (Math.hypot(bot.x + p2FacingDir * 26 - (c.x + c.w / 2), bot.y - (c.y + c.h / 2)) < 44) {
                  const cDmg = bot.meleeComboStep === 2 ? 30 : bot.meleeComboStep === 1 ? 20 : 12;
                  c.health -= cDmg;
                  c.vx = p2FacingDir * 280;
                  sounds.playHit();
                  addSparks(c.x + 16, c.y + 16, '#d97706', 10);
                }
              });

              s.barrels.forEach((b) => {
                if (Math.hypot(bot.x + p2FacingDir * 26 - (b.x + b.w / 2), bot.y - (b.y + b.h / 2)) < 44) {
                  const bDmg = bot.meleeComboStep === 2 ? 25 : bot.meleeComboStep === 1 ? 16 : 10;
                  b.health -= bDmg;
                  b.vx = p2FacingDir * 320;
                  sounds.playHit();
                  addSparks(b.x + 12, b.y + 16, '#ef4444', 10);
                }
              });
            }
          }

          if (bot.isSliding) {
            bot.slideTicks--;
            if (bot.slideTicks <= 0) {
              bot.isSliding = false;
            }
          }

          // Armas de fuego pesadas no rifle/pistola (ej. Bazooka, Shotgun, Flamethrower)
          if (
            firePressed &&
            bot.attackCooldown <= 0 &&
            bot.equippedWeapon !== WeaponType.Fists &&
            bot.ammo > 0 &&
            bot.fsm !== PlayerFSMState.Roll
          ) {
            const wpn = getWeapon(bot.equippedWeapon);
            if (wpn.category === 'Firearm' && !isPistol && !isRifle) {
              bot.attackCooldown = wpn.cooldownTicks;
              bot.ammo--;
              PlayerFSM.tryTransition(bot, PlayerFSMState.RangedFire);
              sounds.playGunshot(wpn.type.toLowerCase());

              const dir = bot.facingRight ? 1 : -1;
              const muzzleX = bot.x + dir * 28;
              const muzzleY = bot.y - 6;

              addSparks(muzzleX, muzzleY, '#fde047', 6);
              s.screenShake = Math.min(10, (wpn.damage || 20) / 4);

              const count = wpn.pelletCount || 1;
              for (let i = 0; i < count; i++) {
                const spreadAngle = ((Math.random() - 0.5) * ((wpn.accuracyDeg || 3) * Math.PI / 180)) / 2;
                const speed = wpn.projectileSpeed || 900;
                s.projectiles.push({
                  id: s.nextEntityId++,
                  x: muzzleX,
                  y: muzzleY,
                  vx: dir * speed * Math.cos(spreadAngle),
                  vy: speed * Math.sin(spreadAngle),
                  damage: (wpn.damage / count) * bot.damageDealtModifier,
                  onFireDuration: wpn.onFireDuration || 0,
                  explosionRadius: wpn.explosionRadius || 0,
                  shooterId: bot.id,
                  weaponType: bot.equippedWeapon,
                  pelletCount: count,
                  lifeTicks: 0,
                  maxLifeTicks: 60,
                  color: '#f87171',
                });
              }
            }
          }
        } else {
          // IA DE COMBATE (BOT RIVAL ORIGINAL vsBOT)
          let nearestWpnDist = 9999;
          let nearestWpnPos: { x: number; y: number } | null = null;
          for (const w of s.worldWeapons) {
            const dy = w.y - bot.y;
            const dx = Math.abs(w.x - bot.x);
            // Si el arma está a más de 170px por encima directamente en la vertical,
            // no es alcanzable de un solo salto directo sin plataforma previa
            if (dy < -170 && dx < 60) {
              continue;
            }
            const d = Math.hypot(w.x - bot.x, w.y - bot.y);
            if (d < nearestWpnDist) {
              nearestWpnDist = d;
              nearestWpnPos = { x: w.x, y: w.y };
            }
          }

          let projIncoming = false;
          for (const pr of s.projectiles) {
            if (pr.shooterId !== bot.id && Math.hypot(pr.x - bot.x, pr.y - bot.y) < 160) {
              projIncoming = true;
              break;
            }
          }

          const aiState = BotAI.evaluate(bot, s.botAI, p1, projIncoming, nearestWpnDist);
          const botInput = s.botQuiet
            ? { moveX: 0, jump: false, crouch: false, melee: false, fire: false }
            : BotAI.computeInput(bot, s.botAI, p1, aiState, nearestWpnPos);

          if (s.botQuiet && bot.onGround && bot.fsm !== PlayerFSMState.KnockedDown && bot.fsm !== PlayerFSMState.GetUp && bot.fsm !== PlayerFSMState.Hitstun) {
            bot.velocityX = 0;
            if (bot.fsm === PlayerFSMState.Run || bot.fsm === PlayerFSMState.Walk) {
              PlayerFSM.tryTransition(bot, PlayerFSMState.Idle);
            }
          }

          // Salto de ayuda si el bot choca contra un escalón del terreno mientras corre
          if (
            bot.onGround &&
            s.botAI.jumpCooldown <= 0 &&
            Math.abs(botInput.moveX) > 0.4 &&
            Math.abs(bot.velocityX) < 25 &&
            (aiState === BotAIState.Chase || aiState === BotAIState.Pickup)
          ) {
            botInput.jump = true;
            s.botAI.jumpCooldown = 40;
          }

          // Recuperación activa de derribo para bot IA
          if (bot.fsm === PlayerFSMState.KnockedDown && bot.stateTicks >= 8) {
            if (botInput.crouch && bot.onGround) {
              PlayerFSM.tryTransition(bot, PlayerFSMState.Roll);
              bot.rollTicks = GameConstants.RollDurationTicks;
              bot.invulnerabilityTicks = 20;
              sounds.playRoll();
            } else if (botInput.jump && bot.onGround) {
              PlayerFSM.tryTransition(bot, PlayerFSMState.Jump);
              bot.velocityY = GameConstants.JumpVelocity;
              bot.invulnerabilityTicks = 16;
              sounds.playJump();
            } else if (Math.abs(botInput.moveX) > 0.2 || bot.stateTicks >= 18) {
              PlayerFSM.tryTransition(bot, PlayerFSMState.Idle);
              bot.invulnerabilityTicks = 18;
              addSparks(bot.x, bot.y + 12, '#ef4444', 8);
            }
          }

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
            if (bot.onGround) PlayerFSM.tryTransition(bot, PlayerFSMState.Run);
          } else if (bot.fsm !== PlayerFSMState.Roll) {
            bot.velocityX *= GameConstants.GroundFriction;
            if (bot.onGround && Math.abs(bot.velocityX) < 5) {
              bot.velocityX = 0;
              if (bot.fsm === PlayerFSMState.Run) PlayerFSM.tryTransition(bot, PlayerFSMState.Idle);
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

          // ── COMBATE MELEE AVANZADO IA (vsBot) ──
          const botFacingDir = bot.facingRight ? 1 : -1;
          const targetDist = Math.hypot(p1.x - bot.x, p1.y - bot.y);

          if (bot.isGrappling && bot.grabbedTargetId === p1.id) {
            bot.grappleTicks++;
            p1.x = bot.x + botFacingDir * 24;
            p1.y = bot.y;
            p1.velocityX = 0;
            p1.velocityY = 0;
            p1.isGrabbed = true;
            s.p1Controller.setPosition(p1.x, p1.y);
            s.p1Controller.vx = 0;
            s.p1Controller.vy = 0;

            if (bot.grappleTicks >= 25) {
              sounds.playThrow();
              const throwDirX = p1.x > 480 ? -1 : 1;
              const throwHit = CombatSystem.resolveThrow(bot, p1, throwDirX, true);

              bot.isGrappling = false;
              bot.grabbedTargetId = null;
              p1.isGrabbed = false;
              bot.attackCooldown = 30;
              s.screenShake = 10;
              addSparks(p1.x, p1.y, '#ef4444', 18);

              s.floatingTexts.push({
                id: s.nextEntityId++,
                text: `¡LANZAMIENTO BOT! -${Math.round(throwHit.damageDealt)}`,
                x: p1.x,
                y: p1.y - 35,
                color: '#ef4444',
                life: 38,
              });
            }
          } else if (
            botInput.melee &&
            bot.attackCooldown <= 0 &&
            (bot.fsm === PlayerFSMState.Idle ||
              bot.fsm === PlayerFSMState.Run ||
              bot.fsm === PlayerFSMState.Crouch)
          ) {
            const canGrapple = targetDist < 38 && p1.isAlive && !p1.isGrabbed && !s.p1Controller.isInvulnerable && bot.onGround;
            const canSlide = targetDist > 35 && targetDist < 75 && Math.abs(bot.velocityX) > 90 && bot.onGround;
            const canHeavySmash = p1.fsm === PlayerFSMState.KnockedDown || p1.fsm === PlayerFSMState.Hitstun;

            if (canGrapple && Math.random() < 0.28) {
              bot.isGrappling = true;
              bot.grabbedTargetId = p1.id;
              bot.grappleTicks = 0;
              p1.isGrabbed = true;
              sounds.playGrapple();
              s.floatingTexts.push({
                id: s.nextEntityId++,
                text: '¡AGARRE BOT!',
                x: bot.x,
                y: bot.y - 30,
                color: '#f87171',
                life: 30,
              });
            } else if (canSlide && Math.random() < 0.35) {
              const isBladeBot = isBladeWeapon(bot.equippedWeapon);
              bot.isSliding = true;
              bot.slideTicks = 18;
              bot.attackCooldown = isBladeBot ? 25 : 30;
              bot.velocityX = botFacingDir * (isBladeBot ? 460 : 430);
              s.p2Controller.vx = bot.velocityX;
              if (isBladeBot) {
                sounds.playSwordSwing();
                sounds.playSlide();
              } else {
                sounds.playSlide();
              }
              PlayerFSM.tryTransition(bot, PlayerFSMState.CrouchSlide);
              addSparks(bot.x, bot.y + 16, isBladeBot ? '#e0f2fe' : '#94a3b8', 14);

              if (isBladeBot) {
                const slideHit = CombatSystem.resolveBladeDashSlash(bot, p1);
                if (slideHit.didHit) {
                  sounds.playBladeHit();
                  s.screenShake = 9;
                  addSparks(p1.x, p1.y + 12, '#ef4444', 18);
                  addSparks(p1.x, p1.y + 12, '#ffffff', 12);
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: `¡TAJO RASANTE BOT! -${Math.round(slideHit.damageDealt)}`,
                    x: p1.x,
                    y: p1.y - 25,
                    color: '#ef4444',
                    life: 35,
                  });
                }
              } else {
                const slideHit = CombatSystem.resolveSlideTackle(bot, p1);
                if (slideHit.didHit) {
                  sounds.playHit();
                  s.screenShake = 8;
                  addSparks(p1.x, p1.y + 12, '#ef4444', 16);
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: `¡BARRIDA BOT! -${Math.round(slideHit.damageDealt)}`,
                    x: p1.x,
                    y: p1.y - 25,
                    color: '#ef4444',
                    life: 35,
                  });
                }
              }
            } else if (canHeavySmash && Math.random() < 0.5) {
              const isBladeBot = isBladeWeapon(bot.equippedWeapon);
              const chargeRatio = 0.85;
              if (isBladeBot) {
                sounds.playHeavyBladeSlash();
                bot.attackCooldown = 32;
              } else {
                sounds.playHeavySmash();
                bot.attackCooldown = 36;
              }
              PlayerFSM.tryTransition(bot, PlayerFSMState.MeleeAttack);

              bot.velocityX = botFacingDir * (isBladeBot ? 280 : 240);
              s.p2Controller.vx = bot.velocityX;
              s.screenShake = 14;

              if (isBladeBot) {
                const smashHit = CombatSystem.resolveBladeHeavySlash(bot, p1, chargeRatio);
                if (smashHit.didHit) {
                  sounds.playBladeHit();
                  addSparks(p1.x, p1.y, '#e0f2fe', 26);
                  addSparks(p1.x, p1.y, '#ef4444', 18);
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: `¡TAJO DEMOLEDOR BOT! -${Math.round(smashHit.damageDealt)}`,
                    x: p1.x,
                    y: p1.y - 35,
                    color: '#ef4444',
                    life: 45,
                  });
                }
              } else {
                const smashHit = CombatSystem.resolveHeavySmash(bot, p1, chargeRatio);
                if (smashHit.didHit) {
                  sounds.playHit();
                  addSparks(p1.x, p1.y, '#f59e0b', 24);
                  addSparks(p1.x, p1.y, '#ef4444', 16);
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: `¡HEAVY SMASH BOT! -${Math.round(smashHit.damageDealt)}`,
                    x: p1.x,
                    y: p1.y - 35,
                    color: '#f59e0b',
                    life: 45,
                  });
                }
              }
            } else {
              const isBladeBot = isBladeWeapon(bot.equippedWeapon);
              bot.comboStep = (bot.comboStep + 1) % 3;
              bot.comboWindowTicks = isBladeBot ? 34 : GameConstants.FistsComboWindowTicks;
              bot.attackCooldown = isBladeBot ? 14 : GameConstants.FistsCooldownTicks;
              PlayerFSM.tryTransition(bot, PlayerFSMState.MeleeAttack);

              if (isBladeBot) {
                sounds.playSwordSwing();
                if (s.p1Controller.isInvulnerable) {
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: '¡ESQUIVADO!',
                    x: p1.x,
                    y: p1.y - 25,
                    color: '#38bdf8',
                    life: 25,
                  });
                } else {
                  const hit = CombatSystem.resolveBladeMelee(bot, p1);
                  if (hit.didHit) {
                    sounds.playBladeHit();
                    addSparks(p1.x, p1.y, '#e0f2fe', 18);
                    addSparks(p1.x, p1.y, '#ef4444', 14);
                    s.screenShake = bot.comboStep === 2 ? 9 : 5;
                    const bladeComboNames = ['¡TAJO HORIZONTAL!', '¡CLEAVE DESCENDENTE!', '¡CORTE FINAL!'];
                    s.floatingTexts.push({
                      id: s.nextEntityId++,
                      text: `${bladeComboNames[bot.comboStep]} BOT -${Math.round(hit.damageDealt)}`,
                      x: p1.x,
                      y: p1.y - 25,
                      color: '#ef4444',
                      life: 35,
                    });
                  }
                }
              } else {
                sounds.playPunch();
                if (s.p1Controller.isInvulnerable) {
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: '¡ESQUIVADO!',
                    x: p1.x,
                    y: p1.y - 25,
                    color: '#38bdf8',
                    life: 25,
                  });
                } else {
                  const hit = CombatSystem.resolveMelee(bot, p1);
                  if (hit.didHit) {
                    sounds.playHit();
                    addSparks(p1.x, p1.y, '#ef4444', 12);
                    s.screenShake = bot.comboStep === 2 ? 8 : 5;
                    const comboNames = ['¡JAB!', '¡CROSS!', '¡PATADA!'];
                    s.floatingTexts.push({
                      id: s.nextEntityId++,
                      text: `${comboNames[bot.comboStep]} -${Math.round(hit.damageDealt)}`,
                      x: p1.x,
                      y: p1.y - 25,
                      color: '#ef4444',
                      life: 35,
                    });
                  }
                }
              }
            }

            s.crates.forEach((crate) => {
              if (Math.hypot(bot.x - (crate.x + crate.w / 2), bot.y - (crate.y + crate.h / 2)) < 45) {
                crate.health -= 15;
                crate.vx = botFacingDir * 200;
                sounds.playHit();
                addSparks(crate.x + 16, crate.y + 16, '#d97706', 8);
              }
            });

            s.barrels.forEach((barrel) => {
              if (Math.hypot(bot.x - (barrel.x + barrel.w / 2), barrel.y - (barrel.y + barrel.h / 2)) < 45) {
                barrel.health -= 15;
                barrel.vx = botFacingDir * 240;
                sounds.playHit();
                addSparks(barrel.x + 12, barrel.y + 16, '#ef4444', 8);
              }
            });
          }

          if (bot.isSliding) {
            bot.slideTicks--;
            if (bot.slideTicks <= 0) {
              bot.isSliding = false;
            }
          }

          // Bot Disparo
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
              const muzzleX = bot.x + dir * 28;
              const muzzleY = bot.y - 6;

              addSparks(muzzleX, muzzleY, '#fde047', 6);

              const count = wpn.pelletCount || 1;
              for (let i = 0; i < count; i++) {
                const spreadAngle = ((Math.random() - 0.5) * ((wpn.accuracyDeg || 3) * Math.PI / 180)) / 2;
                const speed = wpn.projectileSpeed || 900;
                s.projectiles.push({
                  id: s.nextEntityId++,
                  x: muzzleX,
                  y: muzzleY,
                  vx: dir * speed * Math.cos(spreadAngle),
                  vy: speed * Math.sin(spreadAngle),
                  damage: (wpn.damage / count) * bot.damageDealtModifier,
                  onFireDuration: wpn.onFireDuration || 0,
                  explosionRadius: wpn.explosionRadius || 0,
                  shooterId: bot.id,
                  weaponType: bot.equippedWeapon,
                  pelletCount: count,
                  lifeTicks: 0,
                  maxLifeTicks: 60,
                  color: '#f87171',
                });
              }
            }
          }

          // Uso táctico de granadas por parte de la IA rival
          if (
            bot.attackCooldown <= 0 &&
            targetDist >= 130 &&
            targetDist <= 380 &&
            bot.fsm !== PlayerFSMState.Roll &&
            bot.fsm !== PlayerFSMState.KnockedDown &&
            Math.random() < 0.03
          ) {
            const thrownType = consumeGrenade(s.botGrenades);
            if (thrownType) {
              bot.attackCooldown = 55;
              sounds.playGunshot('grenade');
              const dir = bot.facingRight ? 1 : -1;
              const gCfg = GRENADE_DATABASE[thrownType];
              s.projectiles.push({
                id: s.nextEntityId++,
                x: bot.x + dir * 18,
                y: bot.y - 12,
                vx: dir * (360 + Math.random() * 80) + bot.velocityX * 0.3,
                vy: -300 - Math.random() * 60,
                damage: gCfg.damage * bot.damageDealtModifier,
                onFireDuration: gCfg.burnDurationTicks || 0,
                explosionRadius: gCfg.explosionRadius,
                shooterId: bot.id,
                weaponType: WeaponType.Grenade,
                pelletCount: 1,
                lifeTicks: 0,
                maxLifeTicks: gCfg.fuseTicks || 85,
                isGrenade: true,
                isMolotov: thrownType === GrenadeType.Molotov,
                grenadeType: thrownType,
                rotation: 0,
                rotationSpeed: dir * 0.22,
                color: gCfg.color,
              });

              s.floatingTexts.push({
                id: s.nextEntityId++,
                text: `¡${gCfg.shortName} BOT! (${s.botGrenades.ammo[thrownType]} rest.)`,
                x: bot.x,
                y: bot.y - 32,
                color: gCfg.color,
                life: 30,
              });
            }
          }
        }
      }

      // ─────────────────────────────────────────────────────────
      // 3. FÍSICAS DE JUGADORES Y ESTADOS
      // ─────────────────────────────────────────────────────────
      const prevP1Fsm = p1.fsm;
      const prevBotFsm = bot.fsm;

      if (
        !p1.isAlive ||
        p1.fsm === PlayerFSMState.KnockedDown ||
        p1.fsm === PlayerFSMState.GetUp ||
        p1.fsm === PlayerFSMState.Hitstun
      ) {
        PhysicsStep.tick(p1, s.platforms);
        s.p1Controller.setPosition(p1.x, p1.y);
        s.p1Controller.facingRight = p1.facingRight;
      }

      if (gameMode === 'local1v1') {
        if (
          !bot.isAlive ||
          bot.fsm === PlayerFSMState.KnockedDown ||
          bot.fsm === PlayerFSMState.GetUp ||
          bot.fsm === PlayerFSMState.Hitstun
        ) {
          PhysicsStep.tick(bot, s.platforms);
          s.p2Controller.setPosition(bot.x, bot.y);
          s.p2Controller.facingRight = bot.facingRight;
        }
      } else {
        PhysicsStep.tick(bot, s.platforms);
      }
      PlayerFSM.tick(p1);
      PlayerFSM.tick(bot);

      // Sincronización inmediata al levantarse automáticamente hacia Idle
      if (p1.fsm === PlayerFSMState.Idle && (prevP1Fsm === PlayerFSMState.KnockedDown || prevP1Fsm === PlayerFSMState.GetUp)) {
        s.p1Controller.setPosition(p1.x, p1.y);
        s.p1Controller.isOnFloor = p1.onGround;
        s.p1Controller.facingRight = p1.facingRight;
        s.p1Controller.state = ControllerState.Idle;
      }

      if (bot.fsm === PlayerFSMState.Idle && (prevBotFsm === PlayerFSMState.KnockedDown || prevBotFsm === PlayerFSMState.GetUp)) {
        if (gameMode === 'local1v1') {
          s.p2Controller.setPosition(bot.x, bot.y);
          s.p2Controller.isOnFloor = bot.onGround;
          s.p2Controller.facingRight = bot.facingRight;
          s.p2Controller.state = ControllerState.Idle;
        }
      }

      CombatSystem.tickFireDamage(p1);
      CombatSystem.tickFireDamage(bot);

      // ─────────────────────────────────────────────────────────
      // GESTIÓN DE ESTADOS Y ANIMACIÓN SINCRONIZADA CON SPRITESHEET
      // ─────────────────────────────────────────────────────────
      // 1. P1: Animación fluida de movimiento con inercia (Walk / Run)
      const is1v1Mode = gameMode === 'local1v1';
      const p1Speed = Math.abs(p1.velocityX);
      const p1IsMovingState =
        p1.isAlive &&
        p1.onGround &&
        p1Speed > 8 &&
        p1.fsm !== PlayerFSMState.Roll &&
        p1.fsm !== PlayerFSMState.KnockedDown &&
        p1.fsm !== PlayerFSMState.GetUp &&
        p1.fsm !== PlayerFSMState.Hitstun &&
        p1.fsm !== PlayerFSMState.Dead;

      p1.isMovingHorizontally = p1IsMovingState;

      if (p1IsMovingState) {
        // Al sobrepasar el umbral de velocidad (200 px/s), activar carrera
        const isRunning = p1Speed >= PLAYER_CONFIG.RUN_THRESHOLD;
        const totalFrames = isRunning
          ? (s.p1SheetConfig?.runTotalFrames || 6)
          : (s.p1SheetConfig?.totalFrames || 6);

        // Distancia de zancada adaptada (más amplia en carrera rápida)
        const strideDistancePx = isRunning ? 64 : 46;
        const distanceThisFrame = p1Speed * (1 / 60);
        const framesToAdvance = (distanceThisFrame / strideDistancePx) * totalFrames;

        p1.animFrameTimer += framesToAdvance;
        if (p1.animFrameTimer >= 1) {
          const step = Math.floor(p1.animFrameTimer);
          p1.animFrame = (p1.animFrame + step) % totalFrames;
          p1.animFrameTimer -= step;
        }

        // Mantener orientación según el vector de movimiento (inercia)
        if (Math.abs(p1.velocityX) > 2) {
          p1.facingRight = p1.velocityX > 0;
        }
      } else {
        // Al frenar por completo, volver a frame 0 (idle)
        p1.animFrame = 0;
        p1.animFrameTimer = 0;
        p1.animSpeed = 1.0;
      }

      // 2. BOT / J2: Detección de movimiento horizontal y animación sincronizada
      const botSpeed = Math.abs(bot.velocityX);
      const botIsMovingState =
        bot.isAlive &&
        bot.onGround &&
        botSpeed > 8 &&
        bot.fsm !== PlayerFSMState.Roll &&
        bot.fsm !== PlayerFSMState.KnockedDown &&
        bot.fsm !== PlayerFSMState.GetUp &&
        bot.fsm !== PlayerFSMState.Hitstun &&
        bot.fsm !== PlayerFSMState.Dead;

      bot.isMovingHorizontally = botIsMovingState;

      if (botIsMovingState) {
        const isRunning = botSpeed >= PLAYER_CONFIG.RUN_THRESHOLD && !!s.botSheetConfig?.hasRunSheet;
        const totalFrames = isRunning
          ? (s.botSheetConfig?.runTotalFrames || 6)
          : (s.botSheetConfig?.totalFrames || 14);

        const strideDistancePx = isRunning ? 64 : 54;
        const distanceThisFrame = botSpeed * (1 / 60);
        const framesToAdvance = (distanceThisFrame / strideDistancePx) * totalFrames;

        bot.animFrameTimer += framesToAdvance;
        if (bot.animFrameTimer >= 1) {
          const step = Math.floor(bot.animFrameTimer);
          bot.animFrame = (bot.animFrame + step) % totalFrames;
          bot.animFrameTimer -= step;
        }

        if (is1v1Mode && Math.abs(bot.velocityX) > 2) {
          bot.facingRight = bot.velocityX > 0;
        }
      } else {
        bot.animFrame = 0;
        bot.animFrameTimer = 0;
        bot.animSpeed = 1.0;
      }

      // ─────────────────────────────────────────────────────────
      // 4. MECÁNICAS DE MUNDO INTERACTIVAS
      // ─────────────────────────────────────────────────────────

      // 4.1. CINTA TRANSPORTADORA (ZONA INDUSTRIAL)
      s.conveyors.forEach((conv) => {
        const dirMult = conv.direction === 'left' ? -1 : 1;
        const pushAmount = conv.speed * dirMult;

        // Empujar P1 si está sobre la cinta
        if (
          p1.isAlive &&
          p1.x >= conv.x - 10 &&
          p1.x <= conv.x + conv.w + 10 &&
          p1.y >= conv.y - 12 &&
          p1.y <= conv.y + conv.h + 8
        ) {
          s.p1Controller.x += pushAmount;
          p1.x += pushAmount;
        }

        // Empujar Bot si está sobre la cinta
        if (
          bot.isAlive &&
          bot.x >= conv.x - 10 &&
          bot.x <= conv.x + conv.w + 10 &&
          bot.y >= conv.y - 12 &&
          bot.y <= conv.y + conv.h + 8
        ) {
          bot.x += pushAmount;
        }

        // Empujar armas y medkits que caigan sobre la cinta
        s.worldWeapons.forEach((w) => {
          if (w.x >= conv.x && w.x <= conv.x + conv.w && Math.abs(w.baseY - (conv.y - 10)) < 20) {
            w.x += pushAmount;
          }
        });

        s.medkits.forEach((m) => {
          if (m.x >= conv.x && m.x <= conv.x + conv.w && Math.abs(m.baseY - (conv.y - 10)) < 20) {
            m.x += pushAmount;
          }
        });
      });

      // 4.2. PRENSA HIDRÁULICA (ZONA INDUSTRIAL)
      s.presses.forEach((press) => {
        press.tick = (press.tick + 1) % press.cycle;

        // Fase de ciclo:
        // 0 - 110: Arriba (Retraída)
        // 110 - 125: Descenso veloz (Slam)
        // 125 - 155: Aplastando en el suelo
        // 155 - 180: Retorno gradual hacia arriba
        if (press.tick < 110) {
          press.currentY = press.baseY;
          press.hasSlammedThisCycle = false;
        } else if (press.tick >= 110 && press.tick <= 125) {
          const progress = (press.tick - 110) / 15;
          press.currentY = press.baseY + progress * press.maxDrop;
          if (press.tick >= 122 && !press.hasSlammedThisCycle) {
            press.hasSlammedThisCycle = true;
            sounds.playHydraulicSlam();
            s.screenShake = 10;
            addSparks(press.x + press.w / 2, press.currentY + press.h, '#f97316', 16);

            // Verificar aplastamiento de P1
            if (
              p1.isAlive &&
              Math.abs(p1.x - (press.x + press.w / 2)) < press.w / 2 + 10 &&
              p1.y >= press.currentY &&
              p1.y <= press.currentY + press.h + 30
            ) {
              p1.health = Math.max(0, p1.health - press.crushDamage);
              if (p1.health <= 0) {
                p1.health = 0;
                p1.isAlive = false;
                PlayerFSM.tryTransition(p1, PlayerFSMState.Dead);
              } else {
                PlayerFSM.tryTransition(p1, PlayerFSMState.KnockedDown);
              }
              s.floatingTexts.push({
                id: s.nextEntityId++,
                text: '¡APLASTADO!',
                x: p1.x,
                y: p1.y - 30,
                color: '#ef4444',
                life: 45,
              });
            }

            // Verificar aplastamiento del Bot
            if (
              bot.isAlive &&
              Math.abs(bot.x - (press.x + press.w / 2)) < press.w / 2 + 10 &&
              bot.y >= press.currentY &&
              bot.y <= press.currentY + press.h + 30
            ) {
              bot.health = Math.max(0, bot.health - press.crushDamage);
              if (bot.health <= 0) {
                bot.health = 0;
                bot.isAlive = false;
                PlayerFSM.tryTransition(bot, PlayerFSMState.Dead);
              } else {
                PlayerFSM.tryTransition(bot, PlayerFSMState.KnockedDown);
              }
              s.floatingTexts.push({
                id: s.nextEntityId++,
                text: '¡APLASTADO!',
                x: bot.x,
                y: bot.y - 30,
                color: '#ef4444',
                life: 45,
              });
            }
          }
        } else if (press.tick > 125 && press.tick <= 155) {
          press.currentY = press.baseY + press.maxDrop;
        } else {
          const retProg = (press.tick - 155) / 25;
          press.currentY = press.baseY + (1 - retProg) * press.maxDrop;
        }
      });

      // ── FÍSICA DE INERCIA Y COLISIÓN PARA CAJAS Y BARRILES (Superfighters) ──
      s.crates.forEach((crate) => {
        if (crate.vx && Math.abs(crate.vx) > 3) {
          crate.x += crate.vx * (1 / 60);
          crate.vx *= 0.91; // Fricción
          if (crate.x < 15) { crate.x = 15; crate.vx = -crate.vx * 0.4; }
          if (crate.x + crate.w > ARENA_WIDTH - 15) { crate.x = ARENA_WIDTH - 15 - crate.w; crate.vx = -crate.vx * 0.4; }
        }
      });

      s.barrels.forEach((barrel) => {
        if (barrel.vx && Math.abs(barrel.vx) > 3) {
          barrel.x += barrel.vx * (1 / 60);
          barrel.vx *= 0.93; // Fricción en suelo
          if (barrel.x < 15) { barrel.x = 15; barrel.vx = -barrel.vx * 0.4; }
          if (barrel.x + barrel.w > ARENA_WIDTH - 15) { barrel.x = ARENA_WIDTH - 15 - barrel.w; barrel.vx = -barrel.vx * 0.4; }

          // Barriles en movimiento a gran velocidad impactando a combatientes
          const currentVx = barrel.vx;
          if (Math.abs(currentVx) > 85) {
            [s.p1, s.bot].forEach((target) => {
              if (!target.isAlive) return;
              if (Math.hypot((barrel.x + barrel.w / 2) - target.x, (barrel.y + barrel.h / 2) - target.y) < 32) {
                barrel.health -= 15;
                target.health = Math.max(0, target.health - 16);
                target.velocityX = currentVx * 0.75;
                target.velocityY = -150;
                PlayerFSM.tryTransition(target, PlayerFSMState.KnockedDown);
                sounds.playHit();
                addSparks(target.x, target.y, '#f97316', 15);
                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text: '¡IMPACTO DE BARRIL! -16',
                  x: target.x,
                  y: target.y - 30,
                  color: '#f97316',
                  life: 35,
                });
              }
            });
          }
        }
      });

      // 4.3. COMPROBAR DESTRUCCIÓN DE CAJAS
      for (let i = s.crates.length - 1; i >= 0; i--) {
        const crate = s.crates[i];
        if (crate.health <= 0) {
          sounds.playCrateBreak();
          addSparks(crate.x + crate.w / 2, crate.y + crate.h / 2, '#d97706', 20);
          addSparks(crate.x + crate.w / 2, crate.y + crate.h / 2, '#78350f', 15);

          // Soltar arma, paquete de granadas tácticas o botiquín
          const dropRoll = Math.random();
          if (dropRoll < 0.38) {
            // Suelta arma
            const wpn = SpawnableWeaponsList[Math.floor(Math.random() * SpawnableWeaponsList.length)];
            s.worldWeapons.push({
              id: s.nextEntityId++,
              weaponType: wpn,
              x: crate.x + crate.w / 2,
              y: crate.y,
              baseY: crate.y,
              bobTicks: 0,
            });
            s.floatingTexts.push({
              id: s.nextEntityId++,
              text: '¡ARMA ENCONTRADA!',
              x: crate.x + crate.w / 2,
              y: crate.y - 20,
              color: '#38bdf8',
              life: 40,
            });
          } else if (dropRoll < 0.72) {
            // Suelta paquete de granadas tácticas (aporta +2 al inventario limitado)
            const gTypes = ALL_GRENADE_TYPES;
            const pickedType = gTypes[Math.floor(Math.random() * gTypes.length)];
            s.grenadePickups.push({
              id: s.nextEntityId++,
              type: pickedType,
              amount: 2,
              x: crate.x + crate.w / 2,
              y: crate.y,
              baseY: crate.y,
              bobTicks: 0,
            });
            s.floatingTexts.push({
              id: s.nextEntityId++,
              text: `¡${GRENADE_DATABASE[pickedType].shortName} x2!`,
              x: crate.x + crate.w / 2,
              y: crate.y - 20,
              color: GRENADE_DATABASE[pickedType].color,
              life: 40,
            });
          } else {
            // Suelta botiquín
            s.medkits.push({
              id: s.nextEntityId++,
              x: crate.x + crate.w / 2,
              y: crate.y,
              baseY: crate.y,
              bobTicks: 0,
            });
            s.floatingTexts.push({
              id: s.nextEntityId++,
              text: '¡BOTIQUÍN!',
              x: crate.x + crate.w / 2,
              y: crate.y - 20,
              color: '#22c55e',
              life: 40,
            });
          }

          s.crates.splice(i, 1);
        }
      }

      // 4.4. COMPROBAR EXPLOSIÓN DE BARRILES
      for (let i = s.barrels.length - 1; i >= 0; i--) {
        const barrel = s.barrels[i];
        if (barrel.health <= 0) {
          createExplosion(barrel.x + barrel.w / 2, barrel.y + barrel.h / 2, 95, 55, true);
          s.floatingTexts.push({
            id: s.nextEntityId++,
            text: '¡BARRIL EXPLOSIVO!',
            x: barrel.x + barrel.w / 2,
            y: barrel.y - 25,
            color: '#f97316',
            life: 45,
          });
          s.barrels.splice(i, 1);
        }
      }

      // 4.5. RECOLECCIÓN DE BOTIQUINES (+35 HP)
      for (let i = s.medkits.length - 1; i >= 0; i--) {
        const med = s.medkits[i];
        med.bobTicks++;
        med.y = med.baseY + Math.sin(med.bobTicks * 0.1) * 4;

        // P1 recoge
        if (p1.isAlive && Math.hypot(med.x - p1.x, med.y - p1.y) < 32) {
          p1.health = Math.min(p1.maxHealth, p1.health + 35);
          sounds.playMedkit();
          addSparks(med.x, med.y, '#22c55e', 14);
          s.floatingTexts.push({
            id: s.nextEntityId++,
            text: '+35 HP',
            x: p1.x,
            y: p1.y - 30,
            color: '#22c55e',
            life: 45,
          });
          s.medkits.splice(i, 1);
          continue;
        }

        // Bot recoge
        if (bot.isAlive && Math.hypot(med.x - bot.x, med.y - bot.y) < 32) {
          bot.health = Math.min(bot.maxHealth, bot.health + 35);
          sounds.playMedkit();
          addSparks(med.x, med.y, '#22c55e', 14);
          s.floatingTexts.push({
            id: s.nextEntityId++,
            text: '+35 HP',
            x: bot.x,
            y: bot.y - 30,
            color: '#22c55e',
            life: 45,
          });
          s.medkits.splice(i, 1);
          continue;
        }
      }

      // 4.6. RECOLECCIÓN DE GRANADAS EN EL MAPA (LÍMITE ESTRICTO DE 8 EN INVENTARIO)
      for (let i = s.grenadePickups.length - 1; i >= 0; i--) {
        const gp = s.grenadePickups[i];
        gp.bobTicks++;
        gp.y = gp.baseY + Math.sin(gp.bobTicks * 0.09) * 4;
        const gCfg = GRENADE_DATABASE[gp.type];

        // P1 pickup
        if (p1.isAlive && Math.hypot(gp.x - p1.x, gp.y - p1.y) < 32) {
          if (canAddGrenade(s.p1Grenades)) {
            const added = addGrenades(s.p1Grenades, gp.type, gp.amount);
            sounds.playPickup();
            addSparks(gp.x, gp.y, gCfg.color, 12);
            s.floatingTexts.push({
              id: s.nextEntityId++,
              text: `+${added} ${gCfg.shortName} (${s.p1Grenades.ammo[gp.type]}/${GRENADE_MAX_CAPACITY})`,
              x: p1.x,
              y: p1.y - 30,
              color: gCfg.color,
              life: 45,
            });
            s.grenadePickups.splice(i, 1);
            continue;
          } else if (s.worldTick % 35 === 0) {
            s.floatingTexts.push({
              id: s.nextEntityId++,
              text: `¡BOLSA LLENA (${GRENADE_MAX_CAPACITY}/${GRENADE_MAX_CAPACITY})!`,
              x: p1.x,
              y: p1.y - 30,
              color: '#f59e0b',
              life: 25,
            });
          }
        }

        // Bot / J2 pickup
        if (bot.isAlive && Math.hypot(gp.x - bot.x, gp.y - bot.y) < 32) {
          if (canAddGrenade(s.botGrenades)) {
            const added = addGrenades(s.botGrenades, gp.type, gp.amount);
            sounds.playPickup();
            addSparks(gp.x, gp.y, gCfg.color, 12);
            s.floatingTexts.push({
              id: s.nextEntityId++,
              text: `+${added} ${gCfg.shortName} (${s.botGrenades.ammo[gp.type]}/${GRENADE_MAX_CAPACITY})`,
              x: bot.x,
              y: bot.y - 30,
              color: gCfg.color,
              life: 45,
            });
            s.grenadePickups.splice(i, 1);
            continue;
          }
        }
      }

      // Recolección de armas
      for (let i = s.worldWeapons.length - 1; i >= 0; i--) {
        const w = s.worldWeapons[i];
        w.bobTicks++;
        w.y = w.baseY + Math.sin(w.bobTicks * 0.08) * 5;

        // P1 pickup
        const d1 = Math.hypot(w.x - p1.x, w.y - p1.y);
        const canP1Pickup =
          p1.fsm === PlayerFSMState.Crouch ||
          p1.equippedWeapon === WeaponType.Fists ||
          keys['arrowdown'] ||
          (gameMode === 'vsBot' && keys['s']);

        if (d1 < 32 && canP1Pickup) {
          const wData = getWeapon(w.weaponType);
          p1.equippedWeapon = w.weaponType;
          p1.ammo = wData.magSize;
          sounds.playPickup();

          // Lógica de Equipamiento: cambia el estado del personaje según el arma
          const isOneHand = isOneHandWeapon(w.weaponType);
          const isThrowable = isThrowableWeapon(w.weaponType);
          const isRifle = isRifleWeapon(w.weaponType);
          const isTwoHand = isTwoHandWeapon(w.weaponType);
          const isPistol = isPistolWeapon(w.weaponType);
          if (isOneHand) {
            p1.characterState = 'arma_una_mano';
            p1.weaponState = 'arma_una_mano';
            s.p1Controller.hasHeavyRifleEquipped = false;
          } else if (isThrowable) {
            p1.characterState = 'arrojadiza';
            p1.weaponState = 'arrojadiza';
            s.p1Controller.hasHeavyRifleEquipped = false;
          } else if (isRifle) {
            p1.characterState = 'arma_dos_manos';
            p1.weaponState = 'rifle';
            s.p1Controller.hasHeavyRifleEquipped = true;
          } else if (isTwoHand) {
            p1.characterState = 'arma_dos_manos';
            p1.weaponState = 'arma_dos_manos';
            s.p1Controller.hasHeavyRifleEquipped = false;
          } else if (isPistol) {
            p1.characterState = 'arma_una_mano';
            p1.weaponState = 'pistola';
            s.p1Controller.hasHeavyRifleEquipped = false;
          } else {
            p1.characterState = 'desarmado';
            p1.weaponState = 'desarmado';
            s.p1Controller.hasHeavyRifleEquipped = false;
          }

          s.floatingTexts.push({
            id: s.nextEntityId++,
            text: isThrowable
              ? `¡${wData.name}! (arrojadiza)`
              : isRifle
              ? `¡${wData.name}! (rifle)`
              : isTwoHand
              ? `¡${wData.name}! (arma_dos_manos)`
              : isPistol
              ? `¡${wData.name}! (pistola)`
              : `¡${wData.name}!`,
            x: p1.x,
            y: p1.y - 35,
            color: isThrowable ? '#38bdf8' : isRifle ? '#eab308' : isTwoHand ? '#f97316' : '#38bdf8',
            life: 45,
          });

          // Validación y liberación segura de referencia en el punto de spawn si pertenecía a uno
          if (w.spawnSlotIndex !== undefined && s.weaponSlots && s.weaponSlots[w.spawnSlotIndex]) {
            if (s.weaponSlots[w.spawnSlotIndex].currentWeaponId === w.id) {
              s.weaponSlots[w.spawnSlotIndex].currentWeaponId = null;
            }
          }

          s.worldWeapons.splice(i, 1);
          continue;
        }

        // Bot / J2 pickup
        const d2 = Math.hypot(w.x - bot.x, w.y - bot.y);
        const canBotPickup =
          bot.fsm === PlayerFSMState.Crouch ||
          bot.equippedWeapon === WeaponType.Fists ||
          (gameMode === 'local1v1' && (keys['s'] || keys['S']));

        if (d2 < 32 && canBotPickup) {
          const wData = getWeapon(w.weaponType);
          bot.equippedWeapon = w.weaponType;
          bot.ammo = wData.magSize;
          sounds.playPickup();

          // Lógica de Equipamiento J2 / Bot: cambia el estado del personaje según el arma
          const isOneHand = isOneHandWeapon(w.weaponType);
          const isThrowable = isThrowableWeapon(w.weaponType);
          const isRifle = isRifleWeapon(w.weaponType);
          const isTwoHand = isTwoHandWeapon(w.weaponType);
          const isPistol = isPistolWeapon(w.weaponType);
          if (isOneHand) {
            bot.characterState = 'arma_una_mano';
            bot.weaponState = 'arma_una_mano';
            if (s.p2Controller) s.p2Controller.hasHeavyRifleEquipped = false;
          } else if (isThrowable) {
            bot.characterState = 'arrojadiza';
            bot.weaponState = 'arrojadiza';
            if (s.p2Controller) s.p2Controller.hasHeavyRifleEquipped = false;
          } else if (isRifle) {
            bot.characterState = 'arma_dos_manos';
            bot.weaponState = 'rifle';
            if (s.p2Controller) s.p2Controller.hasHeavyRifleEquipped = true;
          } else if (isTwoHand) {
            bot.characterState = 'arma_dos_manos';
            bot.weaponState = 'arma_dos_manos';
            if (s.p2Controller) s.p2Controller.hasHeavyRifleEquipped = false;
          } else if (isPistol) {
            bot.characterState = 'arma_una_mano';
            bot.weaponState = 'pistola';
            if (s.p2Controller) s.p2Controller.hasHeavyRifleEquipped = false;
          } else {
            bot.characterState = 'desarmado';
            bot.weaponState = 'desarmado';
            if (s.p2Controller) s.p2Controller.hasHeavyRifleEquipped = false;
          }

          s.floatingTexts.push({
            id: s.nextEntityId++,
            text: isThrowable
              ? `¡${wData.name}! (arrojadiza)`
              : isRifle
              ? `¡${wData.name}! (rifle)`
              : isTwoHand
              ? `¡${wData.name}! (arma_dos_manos)`
              : isPistol
              ? `¡${wData.name}! (pistola)`
              : `¡${wData.name}!`,
            x: bot.x,
            y: bot.y - 35,
            color: isThrowable ? '#38bdf8' : isRifle ? '#eab308' : isTwoHand ? '#f97316' : '#f87171',
            life: 45,
          });

          // Validación y liberación segura de referencia en el punto de spawn si pertenecía a uno
          if (w.spawnSlotIndex !== undefined && s.weaponSlots && s.weaponSlots[w.spawnSlotIndex]) {
            if (s.weaponSlots[w.spawnSlotIndex].currentWeaponId === w.id) {
              s.weaponSlots[w.spawnSlotIndex].currentWeaponId = null;
            }
          }

          s.worldWeapons.splice(i, 1);
          continue;
        }
      }

      // 4.4. CICLOS DE REEMPLAZO DE ARMAS EN PUNTOS DE SPAWN DESIGNADOS
      // Regla estricta: Cada arma permanece indefinidamente en su punto exacto
      // hasta que el ciclo de spawn genere una nueva arma en esa misma ubicación,
      // momento en el cual el arma anterior se destruye automáticamente antes de crear la nueva.
      updateWeaponSpawns(s);

      // ─────────────────────────────────────────────────────────
      // 5. PROYECTILES Y COLISIONES
      // ─────────────────────────────────────────────────────────
      for (let i = s.projectiles.length - 1; i >= 0; i--) {
        const pr = s.projectiles[i];
        pr.lifeTicks++;

        if (pr.isGrenade) {
          pr.vy += GameConstants.Gravity * (1 / 60);
          pr.x += pr.vx * (1 / 60);
          pr.y += pr.vy * (1 / 60);
          pr.rotation = (pr.rotation || 0) + (pr.rotationSpeed || 0.15);

          // Estela de partículas según el tipo de granada arrojada
          if (Math.random() < 0.45) {
            const gType = pr.grenadeType || GrenadeType.Frag;
            const trailColor =
              gType === GrenadeType.Flashbang
                ? '#e0f2fe'
                : gType === GrenadeType.Smoke
                ? '#94a3b8'
                : gType === GrenadeType.Molotov
                ? '#f97316'
                : '#64748b';
            s.particles.push({
              x: pr.x,
              y: pr.y,
              vx: (Math.random() - 0.5) * 15,
              vy: (Math.random() - 0.5) * 15,
              life: 12,
              maxLife: 15,
              color: trailColor,
              size: gType === GrenadeType.Smoke ? 4 : 2.5,
            });
          }

          if (pr.y >= 500) {
            pr.y = 500;
            pr.vy = -pr.vy * 0.52;
            pr.vx *= 0.78;
            pr.rotationSpeed = (pr.rotationSpeed || 0.1) * 0.75;
            if (pr.grenadeType === GrenadeType.Molotov || pr.isMolotov) {
              triggerGrenadeDetonation(s, pr);
              s.projectiles.splice(i, 1);
              continue;
            }
          }
          if (pr.x <= 20 || pr.x >= 940) {
            pr.vx = -pr.vx * 0.6;
            pr.rotationSpeed = -(pr.rotationSpeed || 0.15);
          }

          if (pr.weaponType === WeaponType.Baseball) {
            const target = pr.shooterId === s.p1.id ? s.bot : s.p1;
            if (target.isAlive && Math.hypot(pr.x - target.x, pr.y - (target.y - 10)) < 26) {
              target.health = Math.max(0, target.health - pr.damage);
              target.velocityX += pr.vx * 0.45;
              sounds.playPunch();
              addSparks(pr.x, pr.y, '#f8fafc', 10);
              s.floatingTexts.push({
                id: s.nextEntityId++,
                text: `¡BÉISBOL! -${Math.round(pr.damage)}`,
                x: target.x,
                y: target.y - 30,
                color: '#f8fafc',
                life: 30,
              });
              s.projectiles.splice(i, 1);
              continue;
            }
          }

          if (pr.weaponType === WeaponType.Mine) {
            const target = pr.shooterId === s.p1.id ? s.bot : s.p1;
            if (pr.lifeTicks > 15 && target.isAlive && Math.hypot(pr.x - target.x, pr.y - target.y) < 28) {
              triggerGrenadeDetonation(s, pr);
              s.projectiles.splice(i, 1);
              continue;
            }
          }

          const maxFuse = pr.maxLifeTicks || (pr.isMolotov ? 70 : 85);
          if (pr.lifeTicks >= maxFuse) {
            if (pr.weaponType !== WeaponType.Baseball) {
              triggerGrenadeDetonation(s, pr);
            }
            s.projectiles.splice(i, 1);
            continue;
          }
        } else {
          // Balas de armas de fuego
          pr.x += pr.vx * (1 / 60);
          pr.y += pr.vy * (1 / 60);

          // Impacto en cajas de madera
          let crateHit = false;
          for (const crate of s.crates) {
            if (
              pr.x >= crate.x &&
              pr.x <= crate.x + crate.w &&
              pr.y >= crate.y &&
              pr.y <= crate.y + crate.h
            ) {
              crate.health -= pr.damage;
              sounds.playHit();
              addSparks(pr.x, pr.y, '#d97706', 6);
              crateHit = true;
              break;
            }
          }
          if (crateHit) {
            s.projectiles.splice(i, 1);
            continue;
          }

          // Impacto en barriles explosivos
          let barrelHit = false;
          for (const barrel of s.barrels) {
            if (
              pr.x >= barrel.x &&
              pr.x <= barrel.x + barrel.w &&
              pr.y >= barrel.y &&
              pr.y <= barrel.y + barrel.h
            ) {
              barrel.health -= pr.damage;
              sounds.playHit();
              addSparks(pr.x, pr.y, '#ef4444', 8);
              barrelHit = true;
              break;
            }
          }
          if (barrelHit) {
            s.projectiles.splice(i, 1);
            continue;
          }

          // Impacto en Combatientes
          const target = pr.shooterId === p1.id ? bot : p1;
          const isTargetRolling =
            target.id === p1.id
              ? s.p1Controller.isInvulnerable
              : target.fsm === PlayerFSMState.Roll;

          if (
            target.isAlive &&
            !isTargetRolling &&
            Math.abs(pr.x - target.x) < 18 &&
            pr.y >= target.y - 25 &&
            pr.y <= target.y + 25
          ) {
            const finalDmg = pr.damage * target.damageTakenModifier;
            target.health = Math.max(0, target.health - finalDmg);
            target.fireTicks = Math.max(target.fireTicks, pr.onFireDuration);
            target.isOnFire = target.fireTicks > 0;

            sounds.playHit();
            addSparks(pr.x, pr.y, '#ef4444', 10);
            s.screenShake = 5;

            // Knockback leve según la dirección de la bala
            const dir = pr.vx > 0 ? 1 : -1;
            target.velocityX = dir * 65;

            // Si la salud llega a 0 o menos, muere inmediatamente
            if (target.health <= 0) {
              target.health = 0;
              target.isAlive = false;
              PlayerFSM.tryTransition(target, PlayerFSMState.Dead);
              sounds.playHit();
            } else {
              target.hitstunTicks = GameConstants.HitstunTicksLight;
              PlayerFSM.tryTransition(target, PlayerFSMState.Hitstun);
            }

            if (target.id === p1.id) {
              p1.isMeleeComboAttacking = false;
              p1.comboStep = 0;
              p1.meleeComboStep = 0;
              p1.comboBuffered = false;
              p1.comboWindowTicks = 0;
              p1.isOneHandAttacking = false;
              p1.oneHandAnimFrame = 0;
              p1.oneHandAnimTimer = 0;
              p1.oneHandHasHit = false;
              p1.isTwoHandAttacking = false;
              p1.twoHandAnimFrame = 0;
              p1.twoHandAnimTimer = 0;
              p1.twoHandHasHit = false;
              p1.isPistolShooting = false;
              p1.pistolAnimFrame = 0;
              p1.pistolAnimTimer = 0;
              p1.isRifleShooting = false;
              p1.rifleAnimFrame = 0;
              p1.rifleAnimTimer = 0;
              p1.isThrowing = false;
              p1.throwAnimFrame = 0;
              p1.throwAnimTimer = 0;
              p1.throwHasReleased = false;
              if (s.p1Controller) {
                s.p1Controller.isShootingPistol = false;
                s.p1Controller.isShootingRifle = false;
                s.p1Controller.isThrowing = false;
              }
            } else {
              bot.isMeleeComboAttacking = false;
              bot.comboStep = 0;
              bot.meleeComboStep = 0;
              bot.comboBuffered = false;
              bot.comboWindowTicks = 0;
              bot.isOneHandAttacking = false;
              bot.oneHandAnimFrame = 0;
              bot.oneHandAnimTimer = 0;
              bot.oneHandHasHit = false;
              bot.isTwoHandAttacking = false;
              bot.twoHandAnimFrame = 0;
              bot.twoHandAnimTimer = 0;
              bot.twoHandHasHit = false;
              bot.isPistolShooting = false;
              bot.pistolAnimFrame = 0;
              bot.pistolAnimTimer = 0;
              bot.isRifleShooting = false;
              bot.rifleAnimFrame = 0;
              bot.rifleAnimTimer = 0;
              bot.isThrowing = false;
              bot.throwAnimFrame = 0;
              bot.throwAnimTimer = 0;
              bot.throwHasReleased = false;
              if (s.p2Controller) {
                s.p2Controller.isShootingPistol = false;
                s.p2Controller.isShootingRifle = false;
                s.p2Controller.isThrowing = false;
              }
            }

            s.floatingTexts.push({
              id: s.nextEntityId++,
              text: `-${Math.round(finalDmg)}`,
              x: target.x,
              y: target.y - 25,
              color: '#ef4444',
              life: 30,
            });

            if (pr.explosionRadius > 0) {
              createExplosion(pr.x, pr.y, pr.explosionRadius, pr.damage * 0.7, false);
            }

            s.projectiles.splice(i, 1);
            continue;
          }

          // Fuera de límites
          if (pr.x < -20 || pr.x > 980 || pr.y < -20 || pr.y > 550 || pr.lifeTicks > pr.maxLifeTicks) {
            s.projectiles.splice(i, 1);
          }
        }
      }

      // ─────────────────────────────────────────────────────────
      // 6. ZONAS DE FUEGO Y PARTÍCULAS
      // ─────────────────────────────────────────────────────────
      for (let i = s.fireZones.length - 1; i >= 0; i--) {
        const fz = s.fireZones[i];
        fz.remainingTicks--;

        if (Math.random() < 0.3) {
          s.particles.push({
            x: fz.x + (Math.random() - 0.5) * fz.radius * 1.5,
            y: fz.y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 20,
            vy: -40 - Math.random() * 40,
            life: 15,
            maxLife: 20,
            color: '#f97316',
            size: 3 + Math.random() * 3,
          });
        }

        [p1, bot].forEach((fighter) => {
          if (fighter.isAlive && Math.hypot(fighter.x - fz.x, fighter.y - fz.y) < fz.radius) {
            fighter.fireTicks = Math.max(fighter.fireTicks, 90);
            fighter.isOnFire = true;
          }
        });

        if (fz.remainingTicks <= 0) {
          s.fireZones.splice(i, 1);
        }
      }

      // 6.2. NUBES DE HUMO TÁCTICO
      for (let i = s.smokeClouds.length - 1; i >= 0; i--) {
        const sc = s.smokeClouds[i];
        sc.remainingTicks--;

        if (Math.random() < 0.28) {
          s.particles.push({
            x: sc.x + (Math.random() - 0.5) * sc.radius * 1.4,
            y: sc.y + (Math.random() - 0.5) * (sc.radius * 0.7),
            vx: (Math.random() - 0.5) * 12,
            vy: -15 - Math.random() * 20,
            life: 25,
            maxLife: 35,
            color: '#cbd5e1',
            size: 8 + Math.random() * 8,
          });
        }

        if (sc.remainingTicks <= 0) {
          s.smokeClouds.splice(i, 1);
        }
      }

      // 6.3. DECAY DE DESTELLO CEGADOR (FLASHBANG)
      if (s.flashbangFlash > 0) {
        s.flashbangFlash = Math.max(0, s.flashbangFlash - 0.035);
      }

      // Partículas
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx * (1 / 60);
        pt.y += pt.vy * (1 / 60);
        pt.life--;
        if (pt.life <= 0) s.particles.splice(i, 1);
      }

      // Textos flotantes
      for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
        const ft = s.floatingTexts[i];
        ft.y -= 0.6;
        ft.life--;
        if (ft.life <= 0) s.floatingTexts.splice(i, 1);
      }

      // Shake decay
      if (s.screenShake > 0) {
        s.screenShake *= 0.88;
        if (s.screenShake < 0.1) s.screenShake = 0;
      }

      // Limpiar teclas de pulsación única
      s.keysJustPressed = {};

      // Sincronizar HUD cada 3 frames
      if (s.worldTick % 3 === 0) {
        setHudState((prev) => ({
          ...prev,
          p1Health: p1.health,
          p1MaxHealth: p1.maxHealth,
          p1Stamina: p1.stamina,
          p1Weapon: p1.equippedWeapon,
          p1Ammo: p1.ammo,
          p1MaxAmmo: getWeapon(p1.equippedWeapon)?.magSize ?? -1,
          p1GrenadeType: s.p1Grenades.activeType,
          p1GrenadeCount: s.p1Grenades.ammo[s.p1Grenades.activeType] || 0,
          p1GrenadeTotal: getTotalGrenades(s.p1Grenades),
          p1GrenadeMax: GRENADE_MAX_CAPACITY,
          botHealth: bot.health,
          botMaxHealth: bot.maxHealth,
          botWeapon: bot.equippedWeapon,
          botAmmo: bot.ammo,
          botGrenadeType: s.botGrenades.activeType,
          botGrenadeCount: s.botGrenades.ammo[s.botGrenades.activeType] || 0,
          round: s.round,
          p1Score: s.p1Score,
          botScore: s.botScore,
          announcement: s.announcement,
        }));
      }
    };

    // ─────────────────────────────────────────────────────────
    // RENDERIZADOR CANVAS 2D
    // ─────────────────────────────────────────────────────────
    const renderGame = () => {
      const s = stateRef.current;
      const canvas = canvasRef.current;
      if (!s || !canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.imageSmoothingEnabled = false;
      (ctx as any).webkitImageSmoothingEnabled = false;
      (ctx as any).mozImageSmoothingEnabled = false;
      (ctx as any).msImageSmoothingEnabled = false;

      // Screen Shake
      if (s.screenShake > 0.5) {
        const shakeX = (Math.random() - 0.5) * s.screenShake * 2;
        const shakeY = (Math.random() - 0.5) * s.screenShake * 2;
        ctx.translate(shakeX, shakeY);
      }

      const worldCfg = s.worldConfig;

      // 1. CIELO Y PARALLAX POR MUNDO
      if (worldCfg.id === 'desert') {
        // Cielo degradado azul claro a cálido
        const skyGrad = ctx.createLinearGradient(0, 0, 0, ARENA_HEIGHT);
        skyGrad.addColorStop(0, '#38bdf8');
        skyGrad.addColorStop(0.55, '#93c5fd');
        skyGrad.addColorStop(1, '#fef08a');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

        // Sol brillante en el desierto
        ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
        ctx.beginPath();
        ctx.arc(820, 110, 48, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fffbeb';
        ctx.beginPath();
        ctx.arc(820, 110, 24, 0, Math.PI * 2);
        ctx.fill();

        // Parallax 1: Montañas distantes
        ctx.fillStyle = '#9a7b56';
        ctx.beginPath();
        ctx.moveTo(0, 360);
        ctx.lineTo(80, 260);
        ctx.lineTo(190, 350);
        ctx.lineTo(310, 240);
        ctx.lineTo(460, 370);
        ctx.lineTo(600, 250);
        ctx.lineTo(750, 360);
        ctx.lineTo(870, 270);
        ctx.lineTo(960, 350);
        ctx.lineTo(960, ARENA_HEIGHT);
        ctx.lineTo(0, ARENA_HEIGHT);
        ctx.closePath();
        ctx.fill();

        // Parallax 2: Pirámides y crestas arenosas
        ctx.fillStyle = '#c28847';
        ctx.beginPath();
        ctx.moveTo(140, 390);
        ctx.lineTo(260, 280);
        ctx.lineTo(380, 390);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(640, 390);
        ctx.lineTo(750, 300);
        ctx.lineTo(860, 390);
        ctx.closePath();
        ctx.fill();

        // Parallax 3: Dunas anaranjadas
        ctx.fillStyle = '#e09848';
        ctx.beginPath();
        ctx.moveTo(0, 410);
        ctx.bezierCurveTo(200, 360, 400, 430, 600, 380);
        ctx.bezierCurveTo(750, 350, 880, 420, 960, 390);
        ctx.lineTo(960, ARENA_HEIGHT);
        ctx.lineTo(0, ARENA_HEIGHT);
        ctx.closePath();
        ctx.fill();
      } else if (worldCfg.id === 'industrial') {
        // Cielo gris azulado
        const skyGrad = ctx.createLinearGradient(0, 0, 0, ARENA_HEIGHT);
        skyGrad.addColorStop(0, '#0f172a');
        skyGrad.addColorStop(0.65, '#1e293b');
        skyGrad.addColorStop(1, '#334155');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

        // Siluetas de fábricas y chimeneas
        ctx.fillStyle = '#131b28';
        ctx.fillRect(40, 160, 120, 300);
        ctx.fillRect(200, 120, 160, 340);
        ctx.fillRect(480, 180, 140, 280);
        ctx.fillRect(720, 140, 180, 320);

        // Chimeneas rojiblancas
        const drawChimney = (cx: number, cy: number, w: number, h: number) => {
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(cx, cy, w, h);
          ctx.fillStyle = '#dc2626';
          for (let y = cy + 10; y < cy + h; y += 30) {
            ctx.fillRect(cx, y, w, 15);
          }
          // Humo sutil
          ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
          ctx.beginPath();
          ctx.arc(cx + w / 2, cy - 10, 12, 0, Math.PI * 2);
          ctx.fill();
        };
        drawChimney(840, 50, 26, 120);
        drawChimney(905, 30, 22, 140);

        // Estructuras y vigas metálicas en X
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        for (let x = 80; x < ARENA_WIDTH; x += 160) {
          ctx.strokeRect(x, 80, 120, 120);
          ctx.beginPath();
          ctx.moveTo(x, 80);
          ctx.lineTo(x + 120, 200);
          ctx.moveTo(x + 120, 80);
          ctx.lineTo(x, 200);
          ctx.stroke();
        }
      } else {
        // Warehouse: Almacén industrial oscuro con figuras geométricas y sistema de tuberías estilo Superfighters
        const bgGrad = ctx.createLinearGradient(0, 0, 0, ARENA_HEIGHT);
        bgGrad.addColorStop(0, '#060911');
        bgGrad.addColorStop(0.65, '#0c121e');
        bgGrad.addColorStop(1, '#111927');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

        // Rejilla técnica de fondo estilo blueprint industrial
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.35)';
        ctx.lineWidth = 1;
        for (let x = 0; x < ARENA_WIDTH; x += 32) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, ARENA_HEIGHT);
          ctx.stroke();
        }
        for (let y = 0; y < ARENA_HEIGHT; y += 32) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(ARENA_WIDTH, y);
          ctx.stroke();
        }

        // Estructuras de vigas metálicas en cruz (X-braces estilo Superfighters)
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
        ctx.lineWidth = 2;
        for (let bx = 30; bx < ARENA_WIDTH; bx += 150) {
          ctx.strokeRect(bx, 60, 120, 80);
          ctx.beginPath();
          ctx.moveTo(bx, 60);
          ctx.lineTo(bx + 120, 140);
          ctx.moveTo(bx + 120, 60);
          ctx.lineTo(bx, 140);
          ctx.stroke();
        }

        // Función de tubería geométrica con sombreado cilíndrico metálico
        const drawSuperPipe = (px: number, py: number, pw: number, ph: number, isVert: boolean) => {
          ctx.save();
          const pGrad = isVert
            ? ctx.createLinearGradient(px, py, px + pw, py)
            : ctx.createLinearGradient(px, py, px, py + ph);
          pGrad.addColorStop(0, '#0f172a');
          pGrad.addColorStop(0.25, '#334155');
          pGrad.addColorStop(0.5, '#64748b');
          pGrad.addColorStop(0.75, '#334155');
          pGrad.addColorStop(1, '#090d16');
          ctx.fillStyle = pGrad;
          ctx.fillRect(px, py, pw, ph);

          ctx.strokeStyle = '#020617';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px, py, pw, ph);

          // Anillos de acople con remaches
          if (isVert) {
            for (let ry = py + 30; ry < py + ph - 10; ry += 70) {
              ctx.fillStyle = '#475569';
              ctx.fillRect(px - 3, ry, pw + 6, 8);
              ctx.strokeRect(px - 3, ry, pw + 6, 8);
              ctx.fillStyle = '#94a3b8';
              ctx.fillRect(px, ry + 2, 3, 3);
              ctx.fillRect(px + pw - 3, ry + 2, 3, 3);
            }
          } else {
            for (let rx = px + 40; rx < px + pw - 10; rx += 100) {
              ctx.fillStyle = '#475569';
              ctx.fillRect(rx, py - 3, 10, ph + 6);
              ctx.strokeRect(rx, py - 3, 10, ph + 6);
              ctx.fillStyle = '#94a3b8';
              ctx.fillRect(rx + 3, py, 3, 3);
              ctx.fillRect(rx + 3, py + ph - 3, 3, 3);
            }
          }
          ctx.restore();
        };

        // Red de tuberías geométricas principales (Superfighters style)
        drawSuperPipe(0, 110, ARENA_WIDTH, 26, false);
        drawSuperPipe(0, 255, ARENA_WIDTH, 18, false);
        drawSuperPipe(140, 30, 22, 290, true);
        drawSuperPipe(480, 30, 22, 290, true);
        drawSuperPipe(810, 30, 22, 290, true);

        // Codos geométricos (uniones cuadradas en 90°)
        const drawPipeJoint = (jx: number, jy: number, jsize: number) => {
          ctx.fillStyle = '#334155';
          ctx.strokeStyle = '#020617';
          ctx.lineWidth = 1.5;
          ctx.fillRect(jx, jy, jsize, jsize);
          ctx.strokeRect(jx, jy, jsize, jsize);
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.arc(jx + jsize / 2, jy + jsize / 2, jsize * 0.28, 0, Math.PI * 2);
          ctx.fill();
        };
        drawPipeJoint(137, 107, 28);
        drawPipeJoint(477, 107, 28);
        drawPipeJoint(807, 107, 28);
        drawPipeJoint(138, 251, 26);
        drawPipeJoint(478, 251, 26);
        drawPipeJoint(808, 251, 26);

        // Manómetros de presión industriales con aguja roja
        const drawPressureGauge = (gx: number, gy: number) => {
          ctx.save();
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.arc(gx, gy, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(gx, gy, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(gx - 7, gy - 1, 2, 2);
          ctx.fillRect(gx + 5, gy - 1, 2, 2);
          ctx.fillRect(gx - 1, gy - 7, 2, 2);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.lineTo(gx + 5, gy - 6);
          ctx.stroke();
          ctx.restore();
        };
        drawPressureGauge(310, 123);
        drawPressureGauge(650, 123);

        // Válvulas industriales circulares rojas
        const drawValve = (vx: number, vy: number) => {
          ctx.save();
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(vx, vy, 11, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(vx - 11, vy);
          ctx.lineTo(vx + 11, vy);
          ctx.moveTo(vx, vy - 11);
          ctx.lineTo(vx, vy + 11);
          ctx.stroke();
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(vx, vy, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        };
        drawValve(230, 123);
        drawValve(730, 123);

        // Lámparas colgantes
        const drawLamp = (lx: number) => {
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(lx, 0);
          ctx.lineTo(lx, 70);
          ctx.stroke();

          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.moveTo(lx - 12, 85);
          ctx.lineTo(lx + 12, 85);
          ctx.lineTo(lx + 6, 70);
          ctx.lineTo(lx - 6, 70);
          ctx.closePath();
          ctx.fill();

          const lightGrad = ctx.createRadialGradient(lx, 85, 2, lx, 220, 150);
          lightGrad.addColorStop(0, 'rgba(250, 204, 21, 0.16)');
          lightGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
          ctx.fillStyle = lightGrad;
          ctx.beginPath();
          ctx.moveTo(lx - 12, 85);
          ctx.lineTo(lx - 90, 320);
          ctx.lineTo(lx + 90, 320);
          ctx.lineTo(lx + 12, 85);
          ctx.closePath();
          ctx.fill();
        };

        drawLamp(220);
        drawLamp(480);
        drawLamp(740);
      }

      // 2. PROPS DECORATIVOS SIN COLISIÓN
      worldCfg.props.forEach((prop) => {
        ctx.save();
        ctx.translate(prop.x, prop.y);
        const scale = prop.scale || 1;
        ctx.scale(scale, scale);

        if (prop.type === 'cactus') {
          // Cactus estilizado
          ctx.fillStyle = '#15803d';
          ctx.fillRect(-6, -38, 12, 38);
          ctx.fillRect(-16, -26, 10, 6);
          ctx.fillRect(-16, -34, 6, 12);
          ctx.fillRect(6, -20, 10, 6);
          ctx.fillRect(10, -28, 6, 12);
        } else if (prop.type === 'dry_tree') {
          // Árbol tipo sabana
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-8, -48, 16, 48);
          ctx.fillRect(-22, -48, 14, 8);
          ctx.fillRect(8, -48, 14, 8);
          ctx.fillStyle = '#65a30d';
          ctx.beginPath();
          ctx.ellipse(0, -56, 36, 14, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (prop.type === 'cow_skull') {
          // Cráneo de vaca con cuernos
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(0, -8, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-6, -10);
          ctx.quadraticCurveTo(-18, -18, -16, -6);
          ctx.moveTo(6, -10);
          ctx.quadraticCurveTo(18, -18, 16, -6);
          ctx.stroke();
        } else if (prop.type === 'dry_bush') {
          ctx.fillStyle = '#92400e';
          ctx.beginPath();
          ctx.arc(0, -6, 9, 0, Math.PI * 2);
          ctx.fill();
        } else if (prop.type === 'arrow_sign') {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-3, -24, 6, 24);
          ctx.fillStyle = '#b45309';
          ctx.fillRect(-14, -28, 28, 12);
          ctx.fillStyle = '#fef3c7';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('→', -4, -19);
        } else if (prop.type === 'lockers') {
          ctx.fillStyle = '#334155';
          ctx.fillRect(-18, -42, 36, 42);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-15, -38, 14, 34);
          ctx.fillRect(1, -38, 14, 34);
        } else if (prop.type === 'warning_board') {
          ctx.fillStyle = '#eab308';
          ctx.fillRect(-12, -24, 24, 18);
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('⚠️', -8, -11);
        } else if (prop.type === 'box_stack') {
          ctx.fillStyle = '#b45309';
          ctx.fillRect(-12, -22, 24, 22);
          ctx.fillRect(-6, -38, 16, 16);
        }
        ctx.restore();
      });

      // 3. PLATAFORMAS CON TEMÁTICA
      for (const plat of s.platforms) {
        if (plat.theme === 'desert_earth') {
          // Tierra marrón con borde festoneado de arena superior
          ctx.fillStyle = '#78461f';
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

          ctx.fillStyle = '#e6b566';
          ctx.fillRect(plat.x, plat.y, plat.w, 6);

          // Puntos y textura arenosa
          ctx.fillStyle = '#d49b4b';
          for (let px = plat.x + 4; px < plat.x + plat.w; px += 14) {
            ctx.beginPath();
            ctx.arc(px, plat.y + 6, 3, 0, Math.PI);
            ctx.fill();
          }
        } else if (plat.theme === 'hazard_stripe' || plat.label === 'CONVEYOR') {
          // Base metálica
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

          // Franjas diagonales de peligro (Amarillo/Negro o Naranja/Negro)
          ctx.save();
          ctx.beginPath();
          ctx.rect(plat.x, plat.y, plat.w, plat.h);
          ctx.clip();

          const offset = (s.worldTick * 2) % 24;
          for (let sx = plat.x - 24; sx < plat.x + plat.w + 24; sx += 24) {
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.moveTo(sx + offset, plat.y);
            ctx.lineTo(sx + 12 + offset, plat.y);
            ctx.lineTo(sx + offset, plat.y + plat.h);
            ctx.lineTo(sx - 12 + offset, plat.y + plat.h);
            ctx.closePath();
            ctx.fill();
          }

          // Chevrons si es cinta transportadora
          if (plat.label === 'CONVEYOR') {
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 10px monospace';
            const chevOffset = (s.worldTick * 3) % 40;
            for (let cx = plat.x + chevOffset; cx < plat.x + plat.w; cx += 40) {
              ctx.fillText('>>>', cx, plat.y + 13);
            }
          }
          ctx.restore();

          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);
        } else if (plat.theme === 'industrial_metal') {
          // Paneles metálicos azul oscuro con remaches
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

          ctx.fillStyle = '#334155';
          ctx.fillRect(plat.x, plat.y, plat.w, 4);

          // Remaches
          ctx.fillStyle = '#94a3b8';
          for (let rx = plat.x + 8; rx < plat.x + plat.w; rx += 20) {
            ctx.beginPath();
            ctx.arc(rx, plat.y + plat.h / 2, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Warehouse: Plataformas de hormigón oscuro y vigas
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

          // Borde superior de hormigón
          ctx.fillStyle = '#334155';
          ctx.fillRect(plat.x, plat.y, plat.w, 4);

          // Textura de bloques de hormigón
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1;
          for (let bx = plat.x + 30; bx < plat.x + plat.w; bx += 30) {
            ctx.beginPath();
            ctx.moveTo(bx, plat.y);
            ctx.lineTo(bx, plat.y + plat.h);
            ctx.stroke();
          }
        }
      }

      // 4. PRENSAS HIDRÁULICAS (ZONA INDUSTRIAL)
      s.presses.forEach((press) => {
        // Cilindro superior fijo
        ctx.fillStyle = '#334155';
        ctx.fillRect(press.x + press.w / 2 - 8, press.baseY - 40, 16, 40);

        // Vástago de pistón cromado
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(
          press.x + press.w / 2 - 5,
          press.baseY,
          10,
          Math.max(0, press.currentY - press.baseY)
        );

        // Cabezal de estampado
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(press.x, press.currentY, press.w, press.h);

        // Franja de advertencia en cabezal
        ctx.fillStyle = '#facc15';
        ctx.fillRect(press.x + 4, press.currentY + press.h - 8, press.w - 8, 6);

        // Luz de aviso
        ctx.fillStyle = press.tick >= 90 && press.tick <= 125 ? '#ef4444' : '#22c55e';
        ctx.beginPath();
        ctx.arc(press.x + press.w / 2, press.currentY + 12, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // 5. CAJAS DESTRUCTIBLES (DESIERTO)
      s.crates.forEach((crate) => {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(crate.x, crate.y, crate.w, crate.h);

        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.strokeRect(crate.x, crate.y, crate.w, crate.h);

        // Tablas cruzadas en X
        ctx.beginPath();
        ctx.moveTo(crate.x, crate.y);
        ctx.lineTo(crate.x + crate.w, crate.y + crate.h);
        ctx.moveTo(crate.x + crate.w, crate.y);
        ctx.lineTo(crate.x, crate.y + crate.h);
        ctx.stroke();

        // Barra de vida si está dañada
        if (crate.health < crate.maxHealth) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(crate.x, crate.y - 6, crate.w, 4);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(crate.x, crate.y - 6, (crate.health / crate.maxHealth) * crate.w, 4);
        }
      });

      // 6. BARRILES EXPLOSIVOS (ZONA INDUSTRIAL)
      s.barrels.forEach((barrel) => {
        // Tambor de acero rojo
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(barrel.x, barrel.y, barrel.w, barrel.h);

        // Rebordes metálicos oscuros
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(barrel.x, barrel.y, barrel.w, 4);
        ctx.fillRect(barrel.x, barrel.y + barrel.h / 2 - 2, barrel.w, 4);
        ctx.fillRect(barrel.x, barrel.y + barrel.h - 4, barrel.w, 4);

        // Icono de peligro de fuego
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🔥', barrel.x + barrel.w / 2, barrel.y + barrel.h / 2 + 3);

        if (barrel.health < barrel.maxHealth) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(barrel.x, barrel.y - 6, barrel.w, 4);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(barrel.x, barrel.y - 6, (barrel.health / barrel.maxHealth) * barrel.w, 4);
        }
      });

      // 7. BOTIQUINES (+35 HP)
      s.medkits.forEach((med) => {
        const bobY = Math.sin(med.bobTicks * 0.1) * 3;

        // Aura verde
        ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
        ctx.beginPath();
        ctx.arc(med.x, med.y + bobY, 18, 0, Math.PI * 2);
        ctx.fill();

        // Maletín blanco
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(med.x - 12, med.y - 8 + bobY, 24, 16);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(med.x - 12, med.y - 8 + bobY, 24, 16);

        // Cruz médica verde
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(med.x - 2, med.y - 6 + bobY, 4, 12);
        ctx.fillRect(med.x - 6, med.y - 2 + bobY, 12, 4);
      });

      // 8. ARMAS EN EL MUNDO
      for (const w of s.worldWeapons) {
        const wData = getWeapon(w.weaponType);
        const wImg = s.weaponImages[w.weaponType];
        const bobY = Math.sin(w.bobTicks * 0.1) * 4;

        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.beginPath();
        ctx.arc(w.x, w.y + bobY, 18, 0, Math.PI * 2);
        ctx.fill();

        if (wImg && wImg.complete && wImg.naturalWidth > 0) {
          ctx.drawImage(wImg, w.x - 16, w.y - 12 + bobY, 32, 16);
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = wData.color;
          ctx.lineWidth = 1.5;
          ctx.fillRect(w.x - 14, w.y - 7 + bobY, 28, 14);
          ctx.strokeRect(w.x - 14, w.y - 7 + bobY, 28, 14);
        }

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(wData.name.slice(0, 9), w.x, w.y + 14 + bobY);
        ctx.fillStyle = wData.color;
        ctx.fillText('▼', w.x, w.y - 14 + bobY);
      }

      // 8.5. PAQUETES DE GRANADAS EN EL MUNDO
      for (const gp of s.grenadePickups) {
        const gCfg = GRENADE_DATABASE[gp.type];
        const gImg = s.grenadeImages[gp.type];
        const bobY = Math.sin(gp.bobTicks * 0.1) * 4;

        // Aura de color según el tipo de granada
        ctx.fillStyle = gCfg.color + '40';
        ctx.beginPath();
        ctx.arc(gp.x, gp.y + bobY, 16, 0, Math.PI * 2);
        ctx.fill();

        // Caja de suministro táctico
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = gCfg.color;
        ctx.lineWidth = 1.5;
        ctx.fillRect(gp.x - 12, gp.y - 10 + bobY, 24, 20);
        ctx.strokeRect(gp.x - 12, gp.y - 10 + bobY, 24, 20);

        if (gImg && gImg.complete && gImg.naturalWidth > 0) {
          ctx.drawImage(gImg, gp.x - 9, gp.y - 8 + bobY, 18, 16);
        } else {
          ctx.fillStyle = gCfg.color;
          ctx.beginPath();
          ctx.arc(gp.x, gp.y + bobY, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Etiqueta del tipo y cantidad
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${gCfg.shortName} x${gp.amount}`, gp.x, gp.y + 18 + bobY);
        ctx.fillStyle = gCfg.color;
        ctx.fillText('▼', gp.x, gp.y - 13 + bobY);
      }

      // 9. ZONAS DE FUEGO
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

      // 10. JUGADORES
      const renderFighter = (
        p: PlayerState,
        sprite: HTMLImageElement | null,
        nameTagColor: string,
        playerId: 1 | 2
      ) => {
        // Dimensiones aumentadas para hacer a los personajes más grandes y visibles en pantalla
        const isBigFighter =
          p.name.includes('TANQUE') ||
          p.name.includes('MUTANTE') ||
          p.name.includes('BERSERKER');
        const charW = isBigFighter ? 60 : 52;
        const charH = isBigFighter ? 82 : 74;
        const drawX = -charW / 2;
        const drawY = -charH / 2;

        const isP1 = playerId === 1;
        const controller = isP1 ? s.p1Controller : s.p2Controller;
        const is1v1 = gameMode === 'local1v1';
        const sheet = isP1 ? s.p1WalkSheet : (is1v1 ? s.botWalkSheet : null);
        const runSheet = isP1 ? s.p1RunSheet : (is1v1 ? s.botRunSheet : null);
        const rollSheet = isP1 ? s.p1RollSheet : (is1v1 ? s.botRollSheet : null);
        const jumpSheet = isP1 ? s.p1JumpSheet : (is1v1 ? s.botJumpSheet : null);
        const idleImg = isP1 ? s.p1IdleSprite : (s.botIdleSprite || s.p1IdleSprite);
        const cfg = isP1 ? s.p1SheetConfig : (is1v1 ? s.botSheetConfig : null);
        const activeThrowSheet = isP1 ? s.p1ThrowUpSheet : (is1v1 ? s.botThrowUpSheet : null);
        const activeRifleSheet = isP1 ? s.p1RifleSheet : (is1v1 ? s.botRifleSheet : null);
        const activePistolSheet = isP1 ? s.p1PistolSheet : (is1v1 ? s.botPistolSheet : null);
        const activeTwoHandSheet = isP1 ? s.p1TwoHandSheet : (is1v1 ? s.botTwoHandSheet : null);
        const activeOneHandSheet = isP1 ? s.p1OneHandSheet : (is1v1 ? s.botOneHandSheet : null);
        const activeMeleeSheet = isP1 ? s.p1MeleeSheet : (is1v1 ? s.botMeleeSheet : null);
        // Sombra suave proyectada bajo los pies del Ninja y los bots (solo visual, sin colisión)
        if (p.isAlive) {
          ctx.save();
          const feetY = p.y + charH / 2 - 2;
          const inAirDist = p.onGround ? 0 : Math.min(80, Math.max(0, p.velocityY < 0 ? 22 : 14));
          const shadowScale = Math.max(0.45, 1 - inAirDist / 95);
          const shadowAlpha = Math.max(0.18, 0.45 * (1 - inAirDist / 120));
          ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
          ctx.beginPath();
          ctx.ellipse(p.x, feetY, (charW * 0.4) * shadowScale, 5 * shadowScale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.save();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.ellipse(p.x, p.y + 16, charW * 0.45, 5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        if (!p.isAlive) {
          ctx.save();
          ctx.translate(p.x, p.y + 16);
          ctx.rotate((p.facingRight ? 1 : -1) * 1.5);
          ctx.globalAlpha = 0.65;
          const deadImg = idleImg || sprite;
          if (deadImg && deadImg.complete && deadImg.naturalWidth > 0) {
            ctx.drawImage(deadImg, drawX, drawY, charW, charH);
          } else {
            ctx.fillStyle = 'rgba(100, 116, 139, 0.6)';
            ctx.fillRect(-charW / 3, -charH / 2, (charW * 2) / 3, charH);
          }
          ctx.restore();
          return;
        }

        ctx.save();
        ctx.translate(p.x, p.y);

        const isRolling =
          p.fsm === PlayerFSMState.Roll ||
          (controller && controller.state === ControllerState.Roll);

        const isInvulnerable = controller
          ? controller.isInvulnerable
          : (p.invulnerabilityTicks > 0);

        if (p.invulnerabilityTicks > 0 && Math.floor(p.invulnerabilityTicks / 4) % 2 === 0) {
          ctx.globalAlpha = 0.5;
        } else if (isRolling && isInvulnerable) {
          ctx.shadowColor = isP1 ? '#38bdf8' : '#f43f5e';
          ctx.shadowBlur = 16;
        }

        // Aura pulsante durante la carga de Heavy Smash
        if (p.isChargingHeavy) {
          const pulse = Math.sin(p.heavyChargeTicks * 0.45) * 0.5 + 0.5;
          ctx.save();
          ctx.strokeStyle = isP1
            ? `rgba(56, 189, 248, ${0.45 + pulse * 0.55})`
            : `rgba(244, 63, 94, ${0.45 + pulse * 0.55})`;
          ctx.lineWidth = 3 + pulse * 3;
          ctx.beginPath();
          ctx.arc(0, 0, charH * 0.52, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Postura aerodinámica agachada al ejecutar Barrida (Slide)
        if (p.isSliding) {
          ctx.translate(0, charH * 0.16);
          ctx.scale(1.18, 0.72);
        }

        // Fuego si está ardiendo
        if (p.isOnFire || p.fireTicks > 0) {
          ctx.fillStyle = 'rgba(249, 115, 22, 0.35)';
          ctx.beginPath();
          ctx.arc(0, 0, 34, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.scale(p.facingRight ? 1 : -1, 1);

        // Estado de caminata activo sobre el suelo
        const isWalking =
          p.onGround &&
          p.isMovingHorizontally &&
          p.fsm !== PlayerFSMState.Roll &&
          p.fsm !== PlayerFSMState.KnockedDown &&
          p.fsm !== PlayerFSMState.GetUp &&
          p.fsm !== PlayerFSMState.Dead;

        const isBlade = isBladeWeapon(p.equippedWeapon);
        const isBladeAttacking =
          isBlade &&
          (p.fsm === PlayerFSMState.MeleeAttack || p.isSliding || p.isChargingHeavy);

        // -2. Animación de Lanzamiento (throw_up - 5 frames)
        if (
          p.isThrowing &&
          activeThrowSheet &&
          activeThrowSheet.complete &&
          activeThrowSheet.naturalWidth > 0
        ) {
          const throwCols = cfg?.throwUpCols || 5;
          const throwRows = cfg?.throwUpRows || 1;
          const frameW = activeThrowSheet.naturalWidth / throwCols;
          const frameH = activeThrowSheet.naturalHeight / throwRows;

          const safeCol = Math.max(0, Math.min(throwCols - 1, p.throwAnimFrame || 0));
          const sx = safeCol * frameW;
          const sy = 0;

          ctx.drawImage(activeThrowSheet, sx, sy, frameW, frameH, drawX, drawY, charW, charH);

          const currentF = p.throwAnimFrame || 0;

          if (currentF < 2 && !p.throwHasReleased) {
            const wImg = s.weaponImages[p.equippedWeapon] || s.weaponImages[WeaponType.Grenade];
            if (wImg && wImg.complete && wImg.naturalWidth > 0) {
              ctx.save();
              if (currentF === 0) {
                // Frame 0: mano recogida hacia atrás
                ctx.translate(-14, -14);
                ctx.rotate(-0.35);
              } else if (currentF === 1) {
                // Frame 1: mano levantada hacia arriba
                ctx.translate(-6, -26);
                ctx.rotate(-0.75);
              }
              ctx.drawImage(wImg, -8, -8, 16, 16);
              ctx.restore();
            }
          }
        } else if (
          p.isRifleShooting &&
          activeRifleSheet &&
          activeRifleSheet.complete &&
          activeRifleSheet.naturalWidth > 0
        ) {
          const rifleCols = cfg?.rifleCols || 4;
          const rifleRows = cfg?.rifleRows || 1;
          const frameW = activeRifleSheet.naturalWidth / rifleCols;
          const frameH = activeRifleSheet.naturalHeight / rifleRows;

          const safeCol = Math.max(0, Math.min(rifleCols - 1, p.rifleAnimFrame || 0));
          const sx = safeCol * frameW;
          const sy = 0;

          ctx.drawImage(activeRifleSheet, sx, sy, frameW, frameH, drawX, drawY, charW, charH);

          const currentF = p.rifleAnimFrame || 0;

          // Rifle / arma pesada en dos manos orientada y sacudida según el retroceso
          const wImg = s.weaponImages[p.equippedWeapon];
          if (wImg && wImg.complete && wImg.naturalWidth > 0) {
            ctx.save();
            if (currentF === 0) {
              // Frame 1: Apuntado frontal y disparo inicial
              ctx.translate(22, 0);
              ctx.rotate(-0.02);
            } else if (currentF === 1) {
              // Frame 2: Inicio del retroceso
              ctx.translate(20, -3);
              ctx.rotate(-0.15);
            } else if (currentF === 2) {
              // Frame 3: Fuerte retroceso / sacudida hacia atrás
              ctx.translate(14, -18);
              ctx.rotate(-0.65);
            } else {
              // Frame 4: Recuperación y re-alineación
              ctx.translate(22, -2);
              ctx.rotate(-0.05);
            }
            ctx.drawImage(wImg, -6, -8, 36, 18);
            ctx.restore();
          }

          // Fogonazo pesado / Destello frontal (Muzzle Flash) en el primer frame
          if (currentF === 0) {
            ctx.save();
            ctx.fillStyle = '#fde047';
            ctx.shadowColor = '#f97316';
            ctx.shadowBlur = 18;
            ctx.beginPath();
            ctx.arc(44, 0, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(38, -6);
            ctx.lineTo(56, 0);
            ctx.lineTo(38, 6);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        } else if (
          p.isPistolShooting &&
          activePistolSheet &&
          activePistolSheet.complete &&
          activePistolSheet.naturalWidth > 0
        ) {
          const pistolCols = cfg?.pistolCols || 4;
          const pistolRows = cfg?.pistolRows || 1;
          const frameW = activePistolSheet.naturalWidth / pistolCols;
          const frameH = activePistolSheet.naturalHeight / pistolRows;

          const safeCol = Math.max(0, Math.min(pistolCols - 1, p.pistolAnimFrame || 0));
          const sx = safeCol * frameW;
          const sy = 0;

          ctx.drawImage(activePistolSheet, sx, sy, frameW, frameH, drawX, drawY, charW, charH);

          const currentF = p.pistolAnimFrame || 0;

          // Arma equipada en la mano orientada y posicionada según el frame de la animación
          const wImg = s.weaponImages[p.equippedWeapon];
          if (wImg && wImg.complete && wImg.naturalWidth > 0) {
            ctx.save();
            if (currentF === 0) {
              // Apuntado horizontal directo
              ctx.translate(22, -3);
              ctx.rotate(0);
            } else if (currentF === 1) {
              // Comienzo de retroceso
              ctx.translate(23, -5);
              ctx.rotate(-0.15);
            } else if (currentF === 2) {
              // Frame 3 (donde levanta la mano): retroceso/recarga hacia arriba
              ctx.translate(20, -18);
              ctx.rotate(-0.75);
            } else {
              // Frame 4: recuperación y retorno al apuntado
              ctx.translate(22, -3);
              ctx.rotate(-0.05);
            }
            ctx.drawImage(wImg, -4, -6, 24, 14);
            ctx.restore();
          }

          // Fogonazo / Destello frontal (Muzzle Flash) en el primer frame
          if (currentF === 0) {
            ctx.save();
            ctx.fillStyle = '#fde047';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.arc(36, -3, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(34, -6);
            ctx.lineTo(44, -3);
            ctx.lineTo(34, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        } else if (
          p.isTwoHandAttacking &&
          activeTwoHandSheet &&
          activeTwoHandSheet.complete &&
          activeTwoHandSheet.naturalWidth > 0
        ) {
          const twoHandCols = cfg?.twoHandCols || 6;
          const twoHandRows = cfg?.twoHandRows || 1;
          const frameW = activeTwoHandSheet.naturalWidth / twoHandCols;
          const frameH = activeTwoHandSheet.naturalHeight / twoHandRows;

          const safeCol = Math.max(0, Math.min(twoHandCols - 1, p.twoHandAnimFrame || 0));
          const sx = safeCol * frameW;
          const sy = 0;

          ctx.drawImage(activeTwoHandSheet, sx, sy, frameW, frameH, drawX, drawY, charW, charH);

          const currentF = p.twoHandAnimFrame || 0;
          // Estela pesada de impacto / onda expansiva
          if (currentF >= 2 && currentF <= 4) {
            ctx.save();
            ctx.lineWidth = 4.5;
            ctx.strokeStyle = '#f97316';
            ctx.shadowColor = '#f97316';
            ctx.shadowBlur = 16;
            ctx.beginPath();
            if (currentF === 3) {
              // Impacto contra el suelo / arco grande hacia abajo
              ctx.arc(20, 14, 46, -Math.PI * 0.4, Math.PI * 0.45, false);
            } else {
              ctx.arc(14, -10, 42, -Math.PI * 0.6, Math.PI * 0.1, false);
            }
            ctx.stroke();
            ctx.restore();
          }

          // Arma pesada equipada orientada según el fotograma del golpe a dos manos
          const wImg = s.weaponImages[p.equippedWeapon];
          if (wImg && wImg.complete && wImg.naturalWidth > 0) {
            ctx.save();
            if (currentF === 0) {
              ctx.translate(14, -2);
              ctx.rotate(-0.3);
            } else if (currentF === 1) {
              ctx.translate(10, -28);
              ctx.rotate(-1.2);
            } else if (currentF === 2) {
              ctx.translate(14, -30);
              ctx.rotate(-1.4);
            } else if (currentF === 3) {
              // Golpe contra el suelo
              ctx.translate(26, 18);
              ctx.rotate(1.15);
            } else if (currentF === 4) {
              ctx.translate(18, 6);
              ctx.rotate(0.5);
            } else {
              ctx.translate(14, 0);
              ctx.rotate(0.1);
            }
            // Armas pesadas se dibujan con mayor tamaño y peso visual
            ctx.drawImage(wImg, -6, -9, 34, 18);
            ctx.restore();
          }
        } else if (
          p.isOneHandAttacking &&
          activeOneHandSheet &&
          activeOneHandSheet.complete &&
          activeOneHandSheet.naturalWidth > 0
        ) {
          const oneHandCols = cfg?.oneHandCols || 5;
          const oneHandRows = cfg?.oneHandRows || 1;
          const frameW = activeOneHandSheet.naturalWidth / oneHandCols;
          const frameH = activeOneHandSheet.naturalHeight / oneHandRows;

          const safeCol = Math.max(0, Math.min(oneHandCols - 1, p.oneHandAnimFrame || 0));
          const sx = safeCol * frameW;
          const sy = 0;

          ctx.drawImage(activeOneHandSheet, sx, sy, frameW, frameH, drawX, drawY, charW, charH);

          // Estela dinámica de corte/impacto veloz en frames activos (frames 1, 2, 3)
          if ((p.oneHandAnimFrame || 0) >= 1 && (p.oneHandAnimFrame || 0) <= 3) {
            ctx.save();
            ctx.lineWidth = 3.5;
            ctx.strokeStyle = '#38bdf8';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(12, -4, 38, -Math.PI * 0.35, Math.PI * 0.25, false);
            ctx.stroke();
            ctx.restore();
          }

          // Arma equipada en la mano orientada y posicionada según el fotograma del swing
          const wImg = s.weaponImages[p.equippedWeapon];
          if (wImg && wImg.complete && wImg.naturalWidth > 0) {
            ctx.save();
            const frame = p.oneHandAnimFrame || 0;
            if (frame === 0) {
              ctx.translate(12, -2);
              ctx.rotate(-0.25);
            } else if (frame === 1) {
              ctx.translate(18, -14);
              ctx.rotate(-0.7);
            } else if (frame === 2) {
              ctx.translate(26, -2);
              ctx.rotate(0.2);
            } else if (frame === 3) {
              ctx.translate(22, 8);
              ctx.rotate(0.65);
            } else {
              ctx.translate(16, 2);
              ctx.rotate(0.1);
            }
            ctx.drawImage(wImg, -4, -8, 28, 14);
            ctx.restore();
          }
        } else if (
          p.isMeleeComboAttacking &&
          activeMeleeSheet &&
          activeMeleeSheet.complete &&
          activeMeleeSheet.naturalWidth > 0
        ) {
          const meleeCols = cfg?.meleeCols || 6;
          const meleeRows = cfg?.meleeRows || 3;
          const frameW = activeMeleeSheet.naturalWidth / meleeCols;
          const frameH = activeMeleeSheet.naturalHeight / meleeRows;

          const safeRow = Math.max(0, Math.min(2, p.meleeComboStep));
          const safeCol = Math.max(0, Math.min(5, p.meleeAnimFrame));

          const sx = safeCol * frameW;
          const sy = safeRow * frameH;

          ctx.drawImage(activeMeleeSheet, sx, sy, frameW, frameH, drawX, drawY, charW, charH);

          // Estelas dinámicas de impacto (frames activos 2 y 3)
          if (p.meleeAnimFrame >= 2 && p.meleeAnimFrame <= 3) {
            ctx.save();
            ctx.lineWidth = 3.5;
            if (safeRow === 0) {
              // Puñetazo: Destello horizontal azul cielo
              ctx.strokeStyle = '#38bdf8';
              ctx.shadowColor = '#38bdf8';
              ctx.shadowBlur = 10;
              ctx.beginPath();
              ctx.moveTo(14, -6);
              ctx.lineTo(36, -6);
              ctx.stroke();
            } else if (safeRow === 1) {
              // Patada: Arco dinámico ámbar
              ctx.strokeStyle = '#f59e0b';
              ctx.shadowColor = '#f59e0b';
              ctx.shadowBlur = 12;
              ctx.beginPath();
              ctx.arc(6, 4, 32, -Math.PI * 0.25, Math.PI * 0.35, false);
              ctx.stroke();
            } else {
              // Uppercut: Arco ascendente rojo/dorado demoledor
              ctx.strokeStyle = '#ef4444';
              ctx.shadowColor = '#fde047';
              ctx.shadowBlur = 16;
              ctx.beginPath();
              ctx.arc(8, -8, 38, Math.PI * 0.1, -Math.PI * 0.5, true);
              ctx.stroke();
            }
            ctx.restore();
          }
        } else if (
          !p.onGround &&
          !isRolling &&
          cfg?.hasJumpSheet &&
          jumpSheet &&
          jumpSheet.complete &&
          jumpSheet.naturalWidth > 0
        ) {
          const jumpCols = cfg.jumpCols || 3;
          const jumpRows = cfg.jumpRows || 2;
          const totalJumpFrames = cfg.jumpTotalFrames || 6;

          const jumpFrameW = jumpSheet.naturalWidth / jumpCols;
          const jumpFrameH = jumpSheet.naturalHeight / jumpRows;

          // Sincronización precisa con el arco de física vertical:
          // Frame 0: Impulso inicial / despegue (vy < -350)
          // Frame 1: Ascenso veloz (vy entre -350 y -100)
          // Frame 2: Ápice / cúspide del salto (vy entre -100 y +120)
          // Frame 3: Comienzo del descenso (vy entre +120 y +320)
          // Frame 4: Caída libre en el aire (se mantiene aquí mientras siga cayendo en el aire)
          let jumpFrame = 0;
          if (p.velocityY < -350) {
            jumpFrame = 0;
          } else if (p.velocityY < -100) {
            jumpFrame = 1;
          } else if (p.velocityY < 120) {
            jumpFrame = 2;
          } else if (p.velocityY < 320) {
            jumpFrame = 3;
          } else {
            jumpFrame = 4; // Pausa y se mantiene en el frame de caída si sigue en el aire
          }

          const safeFrame = Math.min(totalJumpFrames - 1, Math.max(0, jumpFrame));
          const col = safeFrame % jumpCols;
          const row = Math.floor(safeFrame / jumpCols);
          const sx = col * jumpFrameW;
          const sy = row * jumpFrameH;

          ctx.drawImage(jumpSheet, sx, sy, jumpFrameW, jumpFrameH, drawX, drawY, charW, charH);
        } else if (
          isRolling &&
          cfg?.hasRollSheet &&
          rollSheet &&
          rollSheet.complete &&
          rollSheet.naturalWidth > 0
        ) {
          const rollCols = cfg.rollCols || 7;
          const rollRows = cfg.rollRows || 1;
          const totalRollFrames = cfg.rollTotalFrames || 7;

          const rollFrameW = rollSheet.naturalWidth / rollCols;
          const rollFrameH = rollSheet.naturalHeight / rollRows;

          // Progreso continuo de 0 a 1 durante la rodada (ejecuta los 7 frames una sola vez sin loop)
          const rollProgress = isP1
            ? s.p1Controller.rollProgress
            : is1v1
            ? s.p2Controller.rollProgress
            : Math.min(1, Math.max(0, 1 - (p.rollTicks / (GameConstants.RollDurationTicks || 21))));

          const safeFrame = Math.min(totalRollFrames - 1, Math.max(0, Math.floor(rollProgress * totalRollFrames)));
          const col = safeFrame % rollCols;
          const row = Math.floor(safeFrame / rollCols);
          const sx = col * rollFrameW;
          const sy = row * rollFrameH;

          // Dibujar el fotograma correspondiente de la animación de 7 cuadros
          ctx.drawImage(rollSheet, sx, sy, rollFrameW, rollFrameH, drawX, drawY, charW, charH);
        } else if (
          isBladeAttacking &&
          s.swordComboSheet &&
          s.swordComboSheet.complete &&
          s.swordComboSheet.naturalWidth > 0
        ) {
          const swordCols = 4;
          const swordRows = 4;
          const sw = s.swordComboSheet.naturalWidth / swordCols;
          const sh = s.swordComboSheet.naturalHeight / swordRows;
          let sFrame = 0;
          if (p.isChargingHeavy) {
            sFrame = 2; // Guardia alta cargando poder
          } else if (p.isSliding) {
            sFrame = 10; // Tajo rasante rozando el suelo
          } else if (p.fsm === PlayerFSMState.MeleeAttack) {
            if (p.comboStep === 0) sFrame = 4; // Tajo 1 horizontal con arco
            else if (p.comboStep === 1) sFrame = 5; // Tajo 2 cleave diagonal
            else sFrame = 12; // Tajo 3 estocada / remate devastador
          }
          const sCol = sFrame % swordCols;
          const sRow = Math.floor(sFrame / swordCols);
          const sx = sCol * sw;
          const sy = sRow * sh;

          const swordDrawW = charW * 1.5;
          const swordDrawH = charH * 1.5;
          const swordDrawX = -swordDrawW / 2 + 10;
          const swordDrawY = -swordDrawH / 2 - 4;

          ctx.drawImage(s.swordComboSheet, sx, sy, sw, sh, swordDrawX, swordDrawY, swordDrawW, swordDrawH);

          // Arco y estela dinámica de corte con brillo de acero
          ctx.save();
          ctx.strokeStyle = '#e0f2fe';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;
          ctx.lineWidth = 3.8;
          ctx.beginPath();
          if (p.isSliding) {
            ctx.moveTo(-8, 16);
            ctx.quadraticCurveTo(24, 22, 54, 14);
          } else if (p.comboStep === 0) {
            ctx.arc(8, -6, 42, -Math.PI * 0.35, Math.PI * 0.35, false);
          } else if (p.comboStep === 1) {
            ctx.arc(6, -10, 44, -Math.PI * 0.6, Math.PI * 0.15, false);
          } else {
            ctx.arc(12, -2, 48, -Math.PI * 0.45, Math.PI * 0.45, false);
          }
          ctx.stroke();
          ctx.restore();
        } else if (
          isWalking &&
          ((cfg?.hasRunSheet && Math.abs(p.velocityX) >= PLAYER_CONFIG.RUN_THRESHOLD && runSheet && runSheet.complete && runSheet.naturalWidth > 0) ||
           (cfg?.hasWalkSheet && sheet && sheet.complete && sheet.naturalWidth > 0))
        ) {
          const isRunning = Math.abs(p.velocityX) >= PLAYER_CONFIG.RUN_THRESHOLD && cfg?.hasRunSheet && runSheet && runSheet.complete && runSheet.naturalWidth > 0;
          const activeSheet = isRunning ? runSheet! : sheet!;
          const cols = isRunning ? (cfg.runCols || 6) : (cfg.cols || 6);
          const rows = isRunning ? (cfg.runRows || 1) : (cfg.rows || 1);
          const totalFrames = isRunning ? (cfg.runTotalFrames || 6) : (cfg.totalFrames || 6);

          const frameW = activeSheet.naturalWidth / cols;
          const frameH = activeSheet.naturalHeight / rows;

          const currentFrame = p.animFrame;
          const safeFrame = Math.max(0, Math.min(currentFrame, totalFrames - 1));
          const col = safeFrame % cols;
          const row = Math.floor(safeFrame / cols);
          const sx = col * frameW;
          const sy = row * frameH;

          ctx.drawImage(activeSheet, sx, sy, frameW, frameH, drawX, drawY, charW, charH);
        } else if (idleImg && idleImg.complete && idleImg.naturalWidth > 0) {
          // 2. Facción con su imagen oficial prevista (ej. Assassin_2.png, Agent_2.png, etc.):
          // Se mantiene SIEMPRE la imagen correcta en todos los estados sin perderla ni deformarla.
          if (isRolling) {
            const rollTicksLeft = p.rollTicks > 0 ? p.rollTicks : 12;
            const rollProgress = Math.min(1, Math.max(0, 1 - (rollTicksLeft / (GameConstants.RollDurationTicks || 24))));
            ctx.rotate(rollProgress * Math.PI * 2);
            ctx.drawImage(idleImg, drawX, drawY, charW, charH);
          } else if (p.fsm === PlayerFSMState.Crouch) {
            ctx.translate(0, charH * 0.12);
            ctx.scale(1.05, 0.78);
            ctx.drawImage(idleImg, drawX, drawY, charW, charH);
          } else if (p.fsm === PlayerFSMState.KnockedDown) {
            ctx.translate(0, charH * 0.28);
            ctx.rotate(-Math.PI / 2);
            ctx.drawImage(idleImg, drawX, drawY, charW, charH);
          } else if (p.fsm === PlayerFSMState.GetUp) {
            // Animación suave de levantarse de -90° hasta 0° (de pie)
            const getUpTicksMax = 16;
            const remaining = Math.max(0, p.getUpTicks);
            const progress = Math.min(1, Math.max(0, 1 - (remaining / getUpTicksMax)));
            const angle = (-Math.PI / 2) * (1 - progress);
            const offsetY = (charH * 0.28) * (1 - progress);
            ctx.translate(0, offsetY);
            ctx.rotate(angle);
            ctx.drawImage(idleImg, drawX, drawY, charW, charH);
          } else if (isWalking) {
            // Ciclo de caminata dinámico y continuo con la imagen oficial prevista:
            // - Rebote de pasos (bobbing)
            // - Inclinación biomecánica hacia adelante/atrás (lean)
            // - Ligera compresión de impacto en cada paso
            const walkStep = (p.animFrame / 14) * Math.PI * 2;
            const walkBobY = -Math.abs(Math.sin(walkStep * 2)) * 3;
            const walkTilt = Math.sin(walkStep) * 0.07;
            const walkSquash = 1 + Math.sin(walkStep * 2) * 0.03;

            ctx.translate(0, walkBobY);
            ctx.rotate(walkTilt);
            ctx.scale(1 / walkSquash, walkSquash);
            ctx.drawImage(idleImg, drawX, drawY, charW, charH);
          } else if (!p.onGround) {
            // En el aire (salto / caída)
            if (p.velocityY < -60) {
              ctx.scale(0.95, 1.05);
            } else if (p.velocityY > 60) {
              ctx.rotate(0.05);
            }
            ctx.drawImage(idleImg, drawX, drawY, charW, charH);
          } else {
            // Posición estática (idle de pie): mantiene la imagen oficial exacta
            ctx.drawImage(idleImg, drawX, drawY, charW, charH);
          }
        } else if (sprite && sprite.complete && sprite.naturalWidth > 0) {
          ctx.drawImage(sprite, drawX, drawY, charW, charH);
        } else {
          ctx.fillStyle = isP1 ? '#0284c7' : '#e11d48';
          ctx.fillRect(drawX, drawY, charW, charH);
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(drawX + 18, drawY + 10, 8, 8);
        }

        // Arma equipada en mano (proporcional al personaje aumentado)
        // Si está ejecutando el ataque de filo, el ataque a una mano, el ataque a dos manos, pistolas, rifles o el combo melee del Ninja, las manos muestran la animación
        if (p.equippedWeapon !== WeaponType.Fists && !isBladeAttacking && !p.isMeleeComboAttacking && !p.isOneHandAttacking && !p.isTwoHandAttacking && !p.isPistolShooting && !p.isRifleShooting) {
          const wImg = s.weaponImages[p.equippedWeapon];
          if (wImg && wImg.complete && wImg.naturalWidth > 0) {
            ctx.drawImage(wImg, 8, -6, 32, 16);
          }
        }

        // Granada táctica activa visible en el cinturón / funda del combatiente
        const fighterGrenades = isP1 ? s.p1Grenades : s.botGrenades;
        const activeGType = fighterGrenades.activeType;
        const activeCount = fighterGrenades.ammo[activeGType] || 0;
        if (activeCount > 0) {
          const gImg = s.grenadeImages[activeGType];
          ctx.save();
          // Portada en el cinturón / funda táctica de la cadera
          ctx.translate(-8, 6);
          ctx.rotate(-0.15);
          if (gImg && gImg.complete && gImg.naturalWidth > 0) {
            ctx.drawImage(gImg, -8, -8, 16, 16);
          } else {
            ctx.fillStyle = GRENADE_DATABASE[activeGType].color;
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          ctx.restore();
        }

        // Destello blanco rápido en impacto (Hit Flash Feedback retro)
        if (p.hitFlashTicks > 0) {
          ctx.save();
          ctx.globalCompositeOperation = 'source-atop';
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.92, p.hitFlashTicks * 0.25)})`;
          ctx.fillRect(drawX - 2, drawY - 2, charW + 4, charH + 4);
          ctx.restore();
        }

        ctx.restore();

        // Barra de salud sobre cabeza (ajustada a la nueva escala del personaje)
        const hpPercent = Math.max(0, p.health / p.maxHealth);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(p.x - 24, p.y - 48, 48, 6);
        ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#eab308' : '#ef4444';
        ctx.fillRect(p.x - 23, p.y - 47, 46 * hpPercent, 4);

        // Nombre
        ctx.fillStyle = nameTagColor;
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(p.name, p.x, p.y - 54);
      };

      // 9.5 SOMBRA BAJO LOS PIES (CONTACTO Y PESO VISUAL EN EL SUELO / PLATAFORMAS)
      const renderGroundedShadow = (p: PlayerState) => {
        if (!p.isAlive) return;
        const isBigFighter =
          p.name.includes('TANQUE') ||
          p.name.includes('MUTANTE') ||
          p.name.includes('BERSERKER');
        const charHalfH = isBigFighter ? 41 : 37;
        const baseW = isBigFighter ? 24 : 18;
        const baseH = 5;

        // Encontrar plataforma más cercana debajo de los pies
        let groundY = 501; // Superficie por defecto del suelo
        for (const plat of s.platforms) {
          if (p.x >= plat.x - 10 && p.x <= plat.x + plat.w + 10 && plat.y >= p.y - 5) {
            if (plat.y < groundY) groundY = plat.y;
          }
        }

        const feetY = p.y + charHalfH;
        const dist = Math.max(0, groundY - feetY);

        if (dist < 220) {
          const shadowScale = Math.max(0.35, 1 - dist / 220);
          ctx.save();
          ctx.fillStyle = `rgba(0, 0, 0, ${0.48 * shadowScale})`;
          ctx.beginPath();
          const targetY = p.onGround ? feetY - 2 : groundY - 1;
          ctx.ellipse(p.x, targetY, baseW * shadowScale, baseH * shadowScale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      };

      renderGroundedShadow(s.p1);
      renderGroundedShadow(s.bot);

      renderFighter(s.p1, s.p1Sprite, '#38bdf8', 1);
      renderFighter(s.bot, s.botSprite, '#f87171', 2);

      // 11. PROYECTILES
      for (const pr of s.projectiles) {
        if (pr.isGrenade) {
          const gType = pr.grenadeType || GrenadeType.Frag;
          const wImg = (pr.weaponType && s.weaponImages[pr.weaponType]) || s.grenadeImages[gType];
          ctx.save();
          ctx.translate(pr.x, pr.y);
          ctx.rotate(pr.rotation || 0);

          if (wImg && wImg.complete && wImg.naturalWidth > 0) {
            // Renderizado físico preciso con la imagen/modelo de la granada o arrojadizo equipado
            ctx.drawImage(wImg, -11, -11, 22, 22);
          } else {
            ctx.fillStyle = pr.color;
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#f8fafc';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-2, -8, 4, 3);
          }
          ctx.restore();
        } else {
          ctx.fillStyle = pr.color;
          ctx.fillRect(pr.x - 3, pr.y - 1.5, 6, 3);
        }
      }

      // 11.5. NUBES DE HUMO TÁCTICO
      for (const sc of s.smokeClouds) {
        const lifeRatio = Math.min(1, sc.remainingTicks / 60);
        ctx.save();
        ctx.fillStyle = `rgba(148, 163, 184, ${0.5 * lifeRatio})`;
        ctx.beginPath();
        ctx.arc(sc.x, sc.y, sc.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(203, 213, 225, ${0.35 * lifeRatio})`;
        ctx.beginPath();
        ctx.arc(sc.x - sc.radius * 0.25, sc.y - sc.radius * 0.15, sc.radius * 0.65, 0, Math.PI * 2);
        ctx.arc(sc.x + sc.radius * 0.28, sc.y + sc.radius * 0.1, sc.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 12. PARTÍCULAS
      for (const pt of s.particles) {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life / pt.maxLife;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // 13. TEXTOS FLOTANTES
      for (const ft of s.floatingTexts) {
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
      }

      // 13.5. DESTELLO DE CEGADORA (FLASHBANG SCREEN FLASH OVERLAY)
      if (s.flashbangFlash > 0.01) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.92, s.flashbangFlash)})`;
        ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
        ctx.restore();
      }

      // 14. ANUNCIO CENTRAL
      if (s.announcement) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, ARENA_HEIGHT / 2 - 32, ARENA_WIDTH, 64);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(0, ARENA_HEIGHT / 2 - 32, ARENA_WIDTH, 64);
        ctx.fillStyle = '#facc15';
        ctx.font = '18px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(s.announcement, ARENA_WIDTH / 2, ARENA_HEIGHT / 2 + 7);
      }

      // 14.5. HUD RETRO SUPERFIGHTERS (CAJAS P1 Y COM CON BORDES BLANCOS Y FUENTE PIXEL)
      const drawRetroHUD = () => {
        ctx.save();

        const boxW = 230;
        const boxH = 68;

        // ── CAJA RETRO P1 (ESQUINA SUPERIOR IZQUIERDA) ──
        const p1X = 16;
        const p1Y = 16;

        // Fondo semitransparente oscuro y borde blanco sólido
        ctx.fillStyle = 'rgba(5, 7, 10, 0.88)';
        ctx.fillRect(p1X, p1Y, boxW, boxH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(p1X, p1Y, boxW, boxH);

        // Retrato del Ninja
        const p1AvX = p1X + 8;
        const p1AvY = p1Y + 12;
        const p1AvSize = 44;
        ctx.fillStyle = '#0a0e17';
        ctx.fillRect(p1AvX, p1AvY, p1AvSize, p1AvSize);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(p1AvX, p1AvY, p1AvSize, p1AvSize);

        const p1Img = (s.p1IdleSprite && s.p1IdleSprite.complete && s.p1IdleSprite.naturalWidth > 0)
          ? s.p1IdleSprite
          : (s.p1Sprite && s.p1Sprite.complete && s.p1Sprite.naturalWidth > 0)
          ? s.p1Sprite
          : null;

        if (p1Img) {
          ctx.drawImage(p1Img, p1AvX + 2, p1AvY + 2, p1AvSize - 4, p1AvSize - 4);
        } else {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(p1AvX + 6, p1AvY + 6, p1AvSize - 12, p1AvSize - 12);
        }

        // Nombre del Jugador ("NINJA")
        ctx.fillStyle = '#ffffff';
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('NINJA', p1X + 60, p1Y + 23);

        // Barra de Vida P1 (Verde o Roja)
        const p1BarX = p1X + 60;
        const p1BarY = p1Y + 29;
        const p1BarW = 158;
        const p1BarH = 10;
        const p1HpRatio = Math.max(0, s.p1.health / s.p1.maxHealth);

        ctx.fillStyle = '#18181b';
        ctx.fillRect(p1BarX, p1BarY, p1BarW, p1BarH);
        ctx.fillStyle = p1HpRatio > 0.35 ? '#22c55e' : '#ef4444';
        ctx.fillRect(p1BarX, p1BarY, Math.round(p1BarW * p1HpRatio), p1BarH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(p1BarX, p1BarY, p1BarW, p1BarH);

        // Icono y Texto del Arma Equipada P1
        const p1Wpn = getWeapon(s.p1.equippedWeapon);
        const p1WpnName = (p1Wpn?.name || s.p1.equippedWeapon || 'KATANA').toUpperCase();
        const p1WImg = s.weaponImages[s.p1.equippedWeapon];
        const p1HasIcon = p1WImg && p1WImg.complete && p1WImg.naturalWidth > 0;

        if (p1HasIcon) {
          ctx.drawImage(p1WImg, p1X + 60, p1Y + 45, 24, 14);
        }
        ctx.fillStyle = '#fde047';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(p1WpnName, p1HasIcon ? p1X + 90 : p1X + 60, p1Y + 56);

        // ── CAJA RETRO BOT / COM (ESQUINA SUPERIOR DERECHA) ──
        const p2X = ARENA_WIDTH - boxW - 16;
        const p2Y = 16;

        // Fondo semitransparente oscuro y borde blanco sólido
        ctx.fillStyle = 'rgba(5, 7, 10, 0.88)';
        ctx.fillRect(p2X, p2Y, boxW, boxH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(p2X, p2Y, boxW, boxH);

        // Retrato del Bot
        const botAvSize = 44;
        const botAvX = p2X + boxW - 8 - botAvSize;
        const botAvY = p2Y + 12;
        ctx.fillStyle = '#0a0e17';
        ctx.fillRect(botAvX, botAvY, botAvSize, botAvSize);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(botAvX, botAvY, botAvSize, botAvSize);

        const botSpriteImg = (s.botIdleSprite && s.botIdleSprite.complete && s.botIdleSprite.naturalWidth > 0)
          ? s.botIdleSprite
          : (s.botSprite && s.botSprite.complete && s.botSprite.naturalWidth > 0)
          ? s.botSprite
          : null;

        if (botSpriteImg) {
          ctx.drawImage(botSpriteImg, botAvX + 2, botAvY + 2, botAvSize - 4, botAvSize - 4);
        } else {
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(botAvX + 6, botAvY + 6, botAvSize - 12, botAvSize - 12);
        }

        // Nombre del Bot ("JEFE TANQUE", "BOT" o su nombre de arquetipo)
        const is1v1 = gameMode === 'local1v1';
        const rawBotName = is1v1 ? 'NINJA' : (s.bot?.name || botArch?.name || 'BOT');
        const botDisplayName = rawBotName.toUpperCase();

        ctx.fillStyle = '#ffffff';
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(botDisplayName, p2X + boxW - 60, p2Y + 23);

        // Barra de Vida del Bot (Verde o Roja)
        const botBarW = 158;
        const botBarH = 10;
        const botBarX = p2X + boxW - 60 - botBarW;
        const botBarY = p2Y + 29;
        const botHpRatio = Math.max(0, s.bot.health / s.bot.maxHealth);

        ctx.fillStyle = '#18181b';
        ctx.fillRect(botBarX, botBarY, botBarW, botBarH);
        ctx.fillStyle = botHpRatio > 0.35 ? '#22c55e' : '#ef4444';
        const botFillW = Math.round(botBarW * botHpRatio);
        ctx.fillRect(botBarX + botBarW - botFillW, botBarY, botFillW, botBarH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(botBarX, botBarY, botBarW, botBarH);

        // Icono y Texto del Arma Equipada del Bot
        const botWpn = getWeapon(s.bot.equippedWeapon);
        const botWpnName = (botWpn?.name || s.bot.equippedWeapon || 'FISTS').toUpperCase();
        const bWImg = s.weaponImages[s.bot.equippedWeapon];
        const bHasIcon = bWImg && bWImg.complete && bWImg.naturalWidth > 0;

        ctx.textAlign = 'right';
        ctx.fillStyle = '#fde047';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText(botWpnName, p2X + boxW - 60, p2Y + 56);

        if (bHasIcon) {
          const textW = ctx.measureText(botWpnName).width;
          ctx.drawImage(bWImg, p2X + boxW - 60 - textW - 28, p2Y + 45, 24, 14);
        }

        ctx.restore();
      };

      drawRetroHUD();

      ctx.restore();
    };

    const loop = () => {
      updateGame();
      renderGame();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [maxRounds, restartRound]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2 select-none overflow-hidden bg-neutral-950">
      {/* HUD Superior: Nombre del Mundo, P1 vs COM central y botón Salir */}
      <div className="w-full max-w-[960px] bg-black/90 border-2 border-white border-b-0 px-4 py-2.5 flex items-center justify-between text-[10px] font-pixel shadow-lg">
        <div className="flex items-center gap-2.5 text-neutral-300">
          <span className="text-cyan-400 font-bold uppercase tracking-wider">{hudState.worldName}</span>
          <span className="text-neutral-600">|</span>
          <span className="text-neutral-300">RONDA {hudState.round}/{hudState.maxRounds}</span>
        </div>

        {/* Centro de Pantalla: P1 vs COM (o P1 vs P2) con marcador */}
        <div className="flex items-center gap-3 font-pixel text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400 font-bold">P1</span>
            {Array.from({ length: hudState.maxRounds }).map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 border border-white flex items-center justify-center ${
                  i < hudState.p1Score
                    ? 'bg-yellow-400 text-[8px] font-bold text-black'
                    : 'bg-neutral-900 text-neutral-600'
                }`}
              >
                {i < hudState.p1Score ? '■' : ''}
              </div>
            ))}
          </div>

          <span className="text-neutral-400 font-bold px-1">VS</span>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: hudState.maxRounds }).map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 border border-white flex items-center justify-center ${
                  i < hudState.botScore
                    ? 'bg-yellow-400 text-[8px] font-bold text-black'
                    : 'bg-neutral-900 text-neutral-600'
                }`}
              >
                {i < hudState.botScore ? '■' : ''}
              </div>
            ))}
            <span className="text-rose-400 font-bold">
              {gameMode === 'local1v1' ? 'P2' : 'COM'}
            </span>
          </div>
        </div>

        <button
          onClick={onExitToMenu}
          className="px-3 py-1 bg-black hover:bg-neutral-800 text-white border-2 border-white text-[9px] font-pixel transition cursor-pointer active:translate-y-0.5 rounded-none"
        >
          SALIR (ESC)
        </button>
      </div>

      {/* Viewport del Canvas Retro */}
      <div className="relative border-2 border-white bg-black">
        <canvas
          ref={canvasRef}
          width={ARENA_WIDTH}
          height={ARENA_HEIGHT}
          onClick={() => sounds.resumeAudio()}
          tabIndex={0}
          className="w-full max-w-[960px] max-h-[78vh] aspect-[16/9] object-contain block focus:outline-none"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Modal de Fin de Partida con Revancha (Estilo Retro) */}
        {hudState.isMatchOver && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 gap-5 z-20 font-pixel">
            <div className="border-2 border-white bg-black/95 p-6 flex flex-col items-center gap-4 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-wider text-yellow-400 text-center leading-relaxed">
                {hudState.matchWinner}
              </h2>
              <p className="text-neutral-300 text-xs text-center font-pixel">
                MARCADOR FINAL: {hudState.p1Score} - {hudState.botScore}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-3 w-full">
                <button
                  onClick={() => restartRound(true)}
                  className="flex-1 px-4 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-pixel text-[10px] border-2 border-white transition cursor-pointer active:translate-y-0.5"
                >
                  REVANCHA (R)
                </button>
                <button
                  onClick={onExitToMenu}
                  className="flex-1 px-4 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-pixel text-[10px] border-2 border-white transition cursor-pointer active:translate-y-0.5"
                >
                  MENÚ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
