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
import { getWeapon, isBladeWeapon, SpawnableWeaponsList, WeaponCategory, WeaponDatabase, WeaponType } from '../game/WeaponData';
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
  idleUrl: string;
  cols?: number;
  rows?: number;
  totalFrames?: number;
  hasWalkSheet: boolean;
}

export const CHARACTER_SPRITESHEETS: Record<string, SpritesheetDef> = {
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
    p1IdleSprite: HTMLImageElement | null;
    p1SheetConfig: SpritesheetDef;
    botWalkSheet: HTMLImageElement | null;
    botIdleSprite: HTMLImageElement | null;
    botSheetConfig: SpritesheetDef;
    weaponImages: Record<string, HTMLImageElement>;
    swordComboSheet: HTMLImageElement | null;
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
    const arch = getBotArchetype(botFaction);
    const pArch = getBotArchetype(playerFaction);

    const spawnP1 = worldCfg.spawns[0] || { x: 200, y: 460 };
    const spawnBot = worldCfg.spawns[1] || { x: 760, y: 460 };

    const p1 = createPlayerState(1, pArch.name.toUpperCase(), false, spawnP1.x, spawnP1.y);
    p1.maxHealth = pArch.maxHealth;
    p1.health = pArch.maxHealth;
    p1.speedModifier = pArch.speedModifier;
    p1.damageDealtModifier = pArch.damageDealtModifier;
    p1.damageTakenModifier = pArch.damageTakenModifier;
    p1.meleeForceModifier = pArch.meleeForceModifier;
    p1.equippedWeapon = WeaponType.Fists;
    p1.ammo = 0;

    const bot = createPlayerState(2, arch.name.toUpperCase(), true, spawnBot.x, spawnBot.y);
    bot.maxHealth = arch.maxHealth;
    bot.health = arch.maxHealth;
    bot.speedModifier = arch.speedModifier;
    bot.damageDealtModifier = arch.damageDealtModifier;
    bot.damageTakenModifier = arch.damageTakenModifier;
    bot.meleeForceModifier = arch.meleeForceModifier;
    bot.equippedWeapon = WeaponType.Fists;
    bot.ammo = 0;

    // Cargar imagen de fondo si es el mundo clásico
    let bgImg: HTMLImageElement | null = null;
    if (worldCfg.id === 'classic') {
      bgImg = new Image();
      bgImg.src = '/assets/backgrounds/warehouse.jpg';
    }

    // Carga de Spritesheet y texturas para P1 y Bot según su facción seleccionada
    const p1Cfg = CHARACTER_SPRITESHEETS[playerFaction] || {
      idleUrl: pArch.spriteUrl || '/assets/sprites/player/Assassin_2.png',
      hasWalkSheet: false,
    };
    const botCfg = CHARACTER_SPRITESHEETS[botFaction] || {
      idleUrl: arch.spriteUrl || '/assets/sprites/bot/agent.png',
      hasWalkSheet: false,
    };

    let p1WalkSheet: HTMLImageElement | null = null;
    if (p1Cfg.hasWalkSheet && p1Cfg.walkSheetUrl) {
      p1WalkSheet = new Image();
      p1WalkSheet.src = p1Cfg.walkSheetUrl;
    }

    const p1IdleSprite = new Image();
    p1IdleSprite.src = p1Cfg.idleUrl || pArch.spriteUrl || '/assets/sprites/player/Assassin_2.png';

    let botWalkSheet: HTMLImageElement | null = null;
    if (botCfg.hasWalkSheet && botCfg.walkSheetUrl) {
      botWalkSheet = new Image();
      botWalkSheet.src = botCfg.walkSheetUrl;
    }

    const botIdleSprite = new Image();
    botIdleSprite.src = botCfg.idleUrl || arch.spriteUrl || '/assets/sprites/bot/agent.png';

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
      p1Controller: new PlayerController(spawnP1.x, spawnP1.y, true),
      bot,
      p2Controller: new PlayerController(spawnBot.x, spawnBot.y, false),
      botAI: createBotFSMData(arch.aiType),
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
      p1IdleSprite,
      p1SheetConfig: p1Cfg,
      botWalkSheet,
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
    const arch = getBotArchetype(botFaction);
    const pArch = getBotArchetype(playerFaction);

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

    s.p1 = createPlayerState(1, pArch.name.toUpperCase(), false, spawnP1.x, spawnP1.y);
    s.p1.maxHealth = pArch.maxHealth;
    s.p1.health = pArch.maxHealth;
    s.p1.speedModifier = pArch.speedModifier;
    s.p1.damageDealtModifier = pArch.damageDealtModifier;
    s.p1.damageTakenModifier = pArch.damageTakenModifier;
    s.p1.meleeForceModifier = pArch.meleeForceModifier;
    s.p1.equippedWeapon = WeaponType.Fists;
    s.p1.ammo = 0;
    if (s.p1Controller) {
      s.p1Controller.setPosition(spawnP1.x, spawnP1.y);
      s.p1Controller.facingRight = true;
    }

    s.bot = createPlayerState(2, arch.name.toUpperCase(), true, spawnBot.x, spawnBot.y);
    s.bot.maxHealth = arch.maxHealth;
    s.bot.health = arch.maxHealth;
    s.bot.speedModifier = arch.speedModifier;
    s.bot.damageDealtModifier = arch.damageDealtModifier;
    s.bot.damageTakenModifier = arch.damageTakenModifier;
    s.bot.meleeForceModifier = arch.meleeForceModifier;
    s.bot.equippedWeapon = WeaponType.Fists;
    s.bot.ammo = 0;
    if (s.p2Controller) {
      s.p2Controller.setPosition(spawnBot.x, spawnBot.y);
      s.p2Controller.facingRight = false;
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
        const leftKey = is1v1 ? !!keys['arrowleft'] : !!(keys['a'] || keys['arrowleft']);
        const rightKey = is1v1 ? !!keys['arrowright'] : !!(keys['d'] || keys['arrowright']);
        let moveDir: -1 | 0 | 1 = 0;
        if (leftKey && !rightKey) moveDir = -1;
        else if (rightKey && !leftKey) moveDir = 1;

        const runHeld = is1v1
          ? !!keys['.']
          : !!(keys['shift'] || keys['e'] || keys['.'] || keys['q']);
        const jumpJustPressed = is1v1
          ? !!s.keysJustPressed['arrowup']
          : !!(s.keysJustPressed['w'] || s.keysJustPressed['arrowup'] || s.keysJustPressed[' ']);
        const jumpHeld = is1v1
          ? !!keys['arrowup']
          : !!(keys['w'] || keys['arrowup'] || keys[' ']);
        const rollPressed = is1v1
          ? !!s.keysJustPressed['arrowdown']
          : !!(s.keysJustPressed['s'] || s.keysJustPressed['arrowdown'] || s.keysJustPressed['c']);
        const crouchHeld = is1v1 ? !!keys['arrowdown'] : !!(keys['s'] || keys['arrowdown']);
        const dropThrough = crouchHeld && jumpJustPressed;

        const p1Input: PlayerInput = {
          moveDir,
          run: runHeld,
          jump: jumpJustPressed && !dropThrough,
          jumpHeld,
          roll: rollPressed && !dropThrough,
          dropThrough,
        };

        // Recuperación activa de derribo para P1 mediante teclas de movimiento (Flechas, WASD, salto, rodada)
        if (p1.fsm === PlayerFSMState.KnockedDown || p1.fsm === PlayerFSMState.GetUp) {
          const hasDirInput = moveDir !== 0;
          const hasVerticalInput = jumpJustPressed || rollPressed || crouchHeld;
          const anyMovementPressed = hasDirInput || hasVerticalInput || (is1v1 ? !!keys['n'] || !!keys['m'] : !!keys['n'] || !!keys['j'] || !!keys['m'] || !!keys['k']);

          // Si presiona teclas tras un mínimo amortiguamiento de impacto (4 ticks)
          if (anyMovementPressed && p1.stateTicks >= 4) {
            if (rollPressed || (crouchHeld && hasDirInput)) {
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

          p1.x = s.p1Controller.x;
          p1.y = s.p1Controller.y;
          p1.velocityX = s.p1Controller.vx;
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

        const meleePressed = is1v1 ? !!keys['n'] : !!(keys['n'] || keys['j']);
        const firePressed = is1v1 ? !!keys['m'] : !!(keys['m'] || keys['k']);
        const throwPressed = is1v1 ? !!(keys[','] || keys['comma']) : !!(keys['g'] || keys['comma'] || keys[','] || keys['l']);

        // Melee Attack P1 - Advanced Melee System
        const p1FacingDir = p1.facingRight ? 1 : -1;
        const meleeHeld = is1v1 ? !!keys['n'] : !!(keys['n'] || keys['j']);
        const meleeJustPressed = is1v1 ? !!s.keysJustPressed['n'] : !!(s.keysJustPressed['n'] || s.keysJustPressed['j']);

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
            (crouchHeld || s.p1Controller.state === ControllerState.Roll || Math.abs(p1.velocityX) > 130) &&
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
          } else if (
            meleeHeld &&
            p1.attackCooldown <= 0 &&
            !p1.isSliding &&
            (p1.fsm === PlayerFSMState.Idle ||
              p1.fsm === PlayerFSMState.Run ||
              p1.fsm === PlayerFSMState.Crouch)
          ) {
            const isBladeP1 = isBladeWeapon(p1.equippedWeapon);
            if (!p1.isChargingHeavy) {
              p1.isChargingHeavy = true;
              p1.heavyChargeTicks = 0;
              sounds.playHeavyCharge();
            }
            p1.heavyChargeTicks++;
            p1.velocityX *= 0.88;
            s.p1Controller.vx = p1.velocityX;

            if (p1.heavyChargeTicks % 3 === 0) {
              addSparks(
                p1.x + (Math.random() - 0.5) * 24,
                p1.y + (Math.random() - 0.5) * 24,
                isBladeP1 ? '#e0f2fe' : '#38bdf8',
                2
              );
            }
          } else if (p1.isChargingHeavy && !meleeHeld) {
            const isBladeP1 = isBladeWeapon(p1.equippedWeapon);
            const charge = p1.heavyChargeTicks;
            p1.isChargingHeavy = false;
            p1.heavyChargeTicks = 0;

            if (charge >= 12) {
              const chargeRatio = Math.min(1, charge / 36);
              if (isBladeP1) {
                sounds.playHeavyBladeSlash();
                p1.attackCooldown = 30;
              } else {
                sounds.playHeavySmash();
                p1.attackCooldown = 32;
              }
              PlayerFSM.tryTransition(p1, PlayerFSMState.MeleeAttack);

              p1.velocityX = p1FacingDir * (isBladeP1 ? (220 + 150 * chargeRatio) : (180 + 120 * chargeRatio));
              s.p1Controller.vx = p1.velocityX;
              s.screenShake = 12 + Math.round(chargeRatio * 8);

              if (isBladeP1) {
                const slashHit = CombatSystem.resolveBladeHeavySlash(p1, bot, chargeRatio);
                if (slashHit.didHit) {
                  sounds.playBladeHit();
                  addSparks(bot.x, bot.y, '#e0f2fe', 26);
                  addSparks(bot.x, bot.y, '#ef4444', 18);
                  addSparks(bot.x, bot.y, '#38bdf8', 16);
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: chargeRatio > 0.75
                      ? `¡TAJO DEMOLEDOR CRÍTICO! -${Math.round(slashHit.damageDealt)}`
                      : `¡TAJO CON FILO! -${Math.round(slashHit.damageDealt)}`,
                    x: bot.x,
                    y: bot.y - 35,
                    color: '#38bdf8',
                    life: 45,
                  });
                }
              } else {
                const smashHit = CombatSystem.resolveHeavySmash(p1, bot, chargeRatio);
                if (smashHit.didHit) {
                  sounds.playHit();
                  addSparks(bot.x, bot.y, '#f59e0b', 24);
                  addSparks(bot.x, bot.y, '#ef4444', 16);
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: chargeRatio > 0.75
                      ? `¡SMASH CRÍTICO! -${Math.round(smashHit.damageDealt)}`
                      : `¡HEAVY SMASH! -${Math.round(smashHit.damageDealt)}`,
                    x: bot.x,
                    y: bot.y - 35,
                    color: '#f59e0b',
                    life: 45,
                  });
                }
              }

              s.crates.forEach((c) => {
                if (Math.hypot(p1.x - (c.x + c.w / 2), p1.y - (c.y + c.h / 2)) < 55) {
                  c.health -= isBladeP1 ? 30 : 25;
                  c.vx = p1FacingDir * 460;
                  sounds.playCrateBreak();
                  addSparks(c.x + 16, c.y + 16, '#d97706', 14);
                }
              });
              s.barrels.forEach((b) => {
                if (Math.hypot(p1.x - (b.x + b.w / 2), b.y - (b.y + b.h / 2)) < 55) {
                  b.health -= 20;
                  b.vx = p1FacingDir * 520;
                  sounds.playHit();
                  addSparks(b.x + 12, b.y + 16, '#ef4444', 14);
                }
              });
            } else {
              p1.comboStep = (p1.comboStep + 1) % 3;
              p1.comboWindowTicks = isBladeP1 ? 34 : GameConstants.FistsComboWindowTicks;
              p1.attackCooldown = isBladeP1 ? 14 : GameConstants.FistsCooldownTicks;
              PlayerFSM.tryTransition(p1, PlayerFSMState.MeleeAttack);

              if (isBladeP1) {
                sounds.playSwordSwing();
                const hit = CombatSystem.resolveBladeMelee(p1, bot);
                if (hit.didHit) {
                  sounds.playBladeHit();
                  addSparks(bot.x, bot.y, '#e0f2fe', 18);
                  addSparks(bot.x, bot.y, '#ef4444', 14);
                  s.screenShake = p1.comboStep === 2 ? 9 : 5;
                  const bladeComboNames = ['¡TAJO HORIZONTAL!', '¡CLEAVE DESCENDENTE!', '¡CORTE FINAL!'];
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: `${bladeComboNames[p1.comboStep]} -${Math.round(hit.damageDealt)}`,
                    x: bot.x,
                    y: bot.y - 25,
                    color: '#38bdf8',
                    life: 35,
                  });
                }
              } else {
                sounds.playPunch();
                const hit = CombatSystem.resolveMelee(p1, bot);
                if (hit.didHit) {
                  sounds.playHit();
                  addSparks(bot.x, bot.y, '#38bdf8', 12);
                  s.screenShake = p1.comboStep === 2 ? 8 : 5;
                  const comboNames = ['¡JAB!', '¡CROSS!', '¡PATADA!'];
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: `${comboNames[p1.comboStep]} -${Math.round(hit.damageDealt)}`,
                    x: bot.x,
                    y: bot.y - 25,
                    color: '#38bdf8',
                    life: 35,
                  });
                }
              }
            }
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
          if (wpn.category === 'Firearm') {
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

        // Granadas / Armas Arrojadizas P1 (Consumo limitado de inventario con representación visual)
        if (throwPressed && p1.attackCooldown <= 0) {
          const thrownType = consumeGrenade(s.p1Grenades);
          if (thrownType) {
            p1.attackCooldown = 50;
            sounds.playGunshot('grenade');
            const dir = p1.facingRight ? 1 : -1;
            const gCfg = GRENADE_DATABASE[thrownType];

            s.projectiles.push({
              id: s.nextEntityId++,
              x: p1.x + dir * 18,
              y: p1.y - 12,
              vx: dir * 420 + p1.velocityX * 0.35,
              vy: -320,
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
              grenadeType: thrownType,
              rotation: 0,
              rotationSpeed: dir * 0.22,
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
          } else {
            // Sin munición de granadas
            p1.attackCooldown = 15;
            sounds.playDryFire();
            s.floatingTexts.push({
              id: s.nextEntityId++,
              text: '¡SIN GRANADAS!',
              x: p1.x,
              y: p1.y - 30,
              color: '#ef4444',
              life: 25,
            });
          }
        }
      }

      // ─────────────────────────────────────────────────────────
      // 2. INPUT JUGADOR 2 (1v1 LOCAL) O IA DE COMBATE (vsBOT)
      // ─────────────────────────────────────────────────────────
      if (bot.isAlive && s.roundActive) {
        if (gameMode === 'local1v1') {
          // J2 en 1v1 Local: A/D (mover), W (salto), S (rodar), Q (correr), J (melee), K (disparo), L (granada)
          const leftKey = !!keys['a'];
          const rightKey = !!keys['d'];
          let moveDir: -1 | 0 | 1 = 0;
          if (leftKey && !rightKey) moveDir = -1;
          else if (rightKey && !leftKey) moveDir = 1;

          const runHeld = !!keys['q'];
          const jumpJustPressed = !!s.keysJustPressed['w'];
          const jumpHeld = !!keys['w'];
          const rollPressed = !!s.keysJustPressed['s'];
          const crouchHeld = !!keys['s'];
          const dropThrough = crouchHeld && jumpJustPressed;

          const p2Input: PlayerInput = {
            moveDir,
            run: runHeld,
            jump: jumpJustPressed && !dropThrough,
            jumpHeld,
            roll: rollPressed && !dropThrough,
            dropThrough,
          };

          // Recuperación activa de derribo para P2 (1v1) mediante teclas de movimiento (W, A, S, D, salto, rodada)
          if (bot.fsm === PlayerFSMState.KnockedDown || bot.fsm === PlayerFSMState.GetUp) {
            const hasDirInput = moveDir !== 0;
            const hasVerticalInput = jumpJustPressed || rollPressed || crouchHeld;
            const anyP2Input = hasDirInput || hasVerticalInput || !!keys['j'] || !!keys['k'] || !!keys['l'];

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
                bot.fsm = PlayerFSMState.Run;
              }
            } else {
              if (bot.fsm !== PlayerFSMState.MeleeAttack && bot.fsm !== PlayerFSMState.RangedFire) {
                bot.fsm = crouchHeld ? PlayerFSMState.Crouch : PlayerFSMState.Idle;
              }
            }
          }

          const meleePressed = !!keys['j'];
          const firePressed = !!keys['k'];
          const throwPressed = !!keys['l'];

          // ── COMBATE MELEE AVANZADO JUGADOR 2 (1v1 LOCAL) ──
          const p2FacingDir = bot.facingRight ? 1 : -1;
          const j2MeleeHeld = !!keys['j'];
          const j2MeleeJustPressed = !!s.keysJustPressed['j'];

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

            if (j2MeleeJustPressed) {
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
          } else {
            const rivalDist = Math.hypot(p1.x - bot.x, p1.y - bot.y);
            const isNearP1 = rivalDist < 38 && Math.abs(p1.y - bot.y) < 26;

            if (
              j2MeleeJustPressed &&
              isNearP1 &&
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
              j2MeleeJustPressed &&
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
              j2MeleeHeld &&
              bot.attackCooldown <= 0 &&
              !bot.isSliding &&
              (bot.fsm === PlayerFSMState.Idle ||
                bot.fsm === PlayerFSMState.Run ||
                bot.fsm === PlayerFSMState.Crouch)
            ) {
              if (!bot.isChargingHeavy) {
                bot.isChargingHeavy = true;
                bot.heavyChargeTicks = 0;
                sounds.playHeavyCharge();
              }
              bot.heavyChargeTicks++;
              bot.velocityX *= 0.88;
              s.p2Controller.vx = bot.velocityX;

              if (bot.heavyChargeTicks % 3 === 0) {
                addSparks(
                  bot.x + (Math.random() - 0.5) * 24,
                  bot.y + (Math.random() - 0.5) * 24,
                  '#ef4444',
                  2
                );
              }
            } else if (bot.isChargingHeavy && !j2MeleeHeld) {
              const isBladeJ2 = isBladeWeapon(bot.equippedWeapon);
              const charge = bot.heavyChargeTicks;
              bot.isChargingHeavy = false;
              bot.heavyChargeTicks = 0;

              if (charge >= 12) {
                const chargeRatio = Math.min(1, charge / 36);
                if (isBladeJ2) {
                  sounds.playHeavyBladeSlash();
                  bot.attackCooldown = 30;
                } else {
                  sounds.playHeavySmash();
                  bot.attackCooldown = 32;
                }
                PlayerFSM.tryTransition(bot, PlayerFSMState.MeleeAttack);

                bot.velocityX = p2FacingDir * (isBladeJ2 ? (220 + 150 * chargeRatio) : (180 + 120 * chargeRatio));
                s.p2Controller.vx = bot.velocityX;
                s.screenShake = 12 + Math.round(chargeRatio * 8);

                if (isBladeJ2) {
                  const slashHit = CombatSystem.resolveBladeHeavySlash(bot, p1, chargeRatio);
                  if (slashHit.didHit) {
                    sounds.playBladeHit();
                    addSparks(p1.x, p1.y, '#e0f2fe', 26);
                    addSparks(p1.x, p1.y, '#ef4444', 20);
                    s.floatingTexts.push({
                      id: s.nextEntityId++,
                      text: chargeRatio > 0.75
                        ? `¡TAJO DEMOLEDOR CRÍTICO J2! -${Math.round(slashHit.damageDealt)}`
                        : `¡TAJO CON FILO J2! -${Math.round(slashHit.damageDealt)}`,
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
                      text: chargeRatio > 0.75
                        ? `¡SMASH CRÍTICO J2! -${Math.round(smashHit.damageDealt)}`
                        : `¡HEAVY SMASH J2! -${Math.round(smashHit.damageDealt)}`,
                      x: p1.x,
                      y: p1.y - 35,
                      color: '#f59e0b',
                      life: 45,
                    });
                  }
                }

                s.crates.forEach((c) => {
                  if (Math.hypot(bot.x - (c.x + c.w / 2), bot.y - (c.y + c.h / 2)) < 55) {
                    c.health -= isBladeJ2 ? 30 : 25;
                    c.vx = p2FacingDir * 460;
                    sounds.playCrateBreak();
                    addSparks(c.x + 16, c.y + 16, '#d97706', 14);
                  }
                });
                s.barrels.forEach((b) => {
                  if (Math.hypot(bot.x - (b.x + b.w / 2), b.y - (b.y + b.h / 2)) < 55) {
                    b.health -= 20;
                    b.vx = p2FacingDir * 520;
                    sounds.playHit();
                    addSparks(b.x + 12, b.y + 16, '#ef4444', 14);
                  }
                });
              } else {
                bot.comboStep = (bot.comboStep + 1) % 3;
                bot.comboWindowTicks = isBladeJ2 ? 34 : GameConstants.FistsComboWindowTicks;
                bot.attackCooldown = isBladeJ2 ? 14 : GameConstants.FistsCooldownTicks;
                PlayerFSM.tryTransition(bot, PlayerFSMState.MeleeAttack);

                if (isBladeJ2) {
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
                        text: `${bladeComboNames[bot.comboStep]} J2 -${Math.round(hit.damageDealt)}`,
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

                s.crates.forEach((crate) => {
                  if (Math.hypot(bot.x - (crate.x + crate.w / 2), bot.y - (crate.y + crate.h / 2)) < 45) {
                    crate.health -= 15;
                    crate.vx = p2FacingDir * 180;
                    sounds.playHit();
                    addSparks(crate.x + 16, crate.y + 16, '#d97706', 8);
                  }
                });

                s.barrels.forEach((barrel) => {
                  if (Math.hypot(bot.x - (barrel.x + barrel.w / 2), bot.y - (barrel.y + barrel.h / 2)) < 45) {
                    barrel.health -= 15;
                    barrel.vx = p2FacingDir * 240;
                    sounds.playHit();
                    addSparks(barrel.x + 12, barrel.y + 16, '#ef4444', 8);
                  }
                });
              }
            }
          }

          if (bot.isSliding) {
            bot.slideTicks--;
            if (bot.slideTicks <= 0) {
              bot.isSliding = false;
            }
          }

          // Fire J2
          if (
            firePressed &&
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
              s.screenShake = Math.max(s.screenShake, wpn.type === WeaponType.Shotgun ? 8 : 4);

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

          // Granadas J2 (Consumo limitado de inventario con representación visual)
          if (throwPressed && bot.attackCooldown <= 0) {
            const thrownType = consumeGrenade(s.botGrenades);
            if (thrownType) {
              bot.attackCooldown = 50;
              sounds.playGunshot('grenade');
              const dir = bot.facingRight ? 1 : -1;
              const gCfg = GRENADE_DATABASE[thrownType];
              s.projectiles.push({
                id: s.nextEntityId++,
                x: bot.x + dir * 18,
                y: bot.y - 12,
                vx: dir * 420 + bot.velocityX * 0.35,
                vy: -320,
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
                text: `¡${gCfg.shortName}! (${s.botGrenades.ammo[thrownType]} rest.)`,
                x: bot.x,
                y: bot.y - 32,
                color: gCfg.color,
                life: 30,
              });
            } else {
              bot.attackCooldown = 15;
              sounds.playDryFire();
              s.floatingTexts.push({
                id: s.nextEntityId++,
                text: '¡SIN GRANADAS!',
                x: bot.x,
                y: bot.y - 32,
                color: '#94a3b8',
                life: 25,
              });
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
          const botInput = BotAI.computeInput(bot, s.botAI, p1, aiState, nearestWpnPos);

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
      // 1. P1: Detección de teclas de movimiento horizontal (Flechas o A/D según modo)
      const is1v1Mode = gameMode === 'local1v1';
      const p1LeftPressed = is1v1Mode ? !!keys['arrowleft'] : !!(keys['a'] || keys['arrowleft']);
      const p1RightPressed = is1v1Mode ? !!keys['arrowright'] : !!(keys['d'] || keys['arrowright']);
      const p1HorizontalKeyPressed = (p1LeftPressed || p1RightPressed) && !(p1LeftPressed && p1RightPressed);

      const p1Speed = Math.abs(p1.velocityX);
      const p1IsWalkingState =
        p1.isAlive &&
        p1.onGround &&
        p1HorizontalKeyPressed &&
        p1Speed > 8 &&
        p1.fsm !== PlayerFSMState.Roll &&
        p1.fsm !== PlayerFSMState.KnockedDown &&
        p1.fsm !== PlayerFSMState.GetUp &&
        p1.fsm !== PlayerFSMState.Hitstun &&
        p1.fsm !== PlayerFSMState.Dead;

      p1.isMovingHorizontally = p1IsWalkingState;

      if (p1IsWalkingState) {
        // Sincronización exacta de velocidad y fotogramas (elimina deslizamiento y flotación):
        // animationSpeed escala directamente con la velocidad actual respecto a la velocidad base (160 px/s)
        const baseSpeed = 160;
        p1.animSpeed = Math.max(0.4, p1Speed / baseSpeed);

        // Distancia en píxeles que recorre el personaje durante 1 ciclo completo de 14 frames (54 px)
        const strideDistancePx = 54;
        const totalWalkFrames = s.p1SheetConfig?.totalFrames || 14;
        const distanceThisFrame = p1Speed * (1 / 60);
        const framesToAdvance = (distanceThisFrame / strideDistancePx) * totalWalkFrames;

        p1.animFrameTimer += framesToAdvance;
        if (p1.animFrameTimer >= 1) {
          const step = Math.floor(p1.animFrameTimer);
          p1.animFrame = (p1.animFrame + step) % totalWalkFrames;
          p1.animFrameTimer -= step;
        }
      } else {
        // Al soltar las teclas o detenerse, volver inmediatamente al fotograma estático (idle / frame 0)
        p1.animFrame = 0;
        p1.animFrameTimer = 0;
        p1.animSpeed = 1.0;
      }

      // 2. BOT / J2: Detección de movimiento horizontal y animación sincronizada
      const botLeftPressed = is1v1Mode ? !!keys['a'] : false;
      const botRightPressed = is1v1Mode ? !!keys['d'] : false;
      const botHorizontalKeyPressed = is1v1Mode
        ? ((botLeftPressed || botRightPressed) && !(botLeftPressed && botRightPressed))
        : (Math.abs(bot.velocityX) > 12);

      const botSpeed = Math.abs(bot.velocityX);
      const botIsWalkingState =
        bot.isAlive &&
        bot.onGround &&
        botHorizontalKeyPressed &&
        botSpeed > 8 &&
        bot.fsm !== PlayerFSMState.Roll &&
        bot.fsm !== PlayerFSMState.KnockedDown &&
        bot.fsm !== PlayerFSMState.GetUp &&
        bot.fsm !== PlayerFSMState.Hitstun &&
        bot.fsm !== PlayerFSMState.Dead;

      bot.isMovingHorizontally = botIsWalkingState;

      if (botIsWalkingState) {
        const baseSpeed = 160;
        bot.animSpeed = Math.max(0.4, botSpeed / baseSpeed);
        const strideDistancePx = 54;
        const totalWalkFrames = s.botSheetConfig?.totalFrames || 14;
        const distanceThisFrame = botSpeed * (1 / 60);
        const framesToAdvance = (distanceThisFrame / strideDistancePx) * totalWalkFrames;

        bot.animFrameTimer += framesToAdvance;
        if (bot.animFrameTimer >= 1) {
          const step = Math.floor(bot.animFrameTimer);
          bot.animFrame = (bot.animFrame + step) % totalWalkFrames;
          bot.animFrameTimer -= step;
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
          s.floatingTexts.push({
            id: s.nextEntityId++,
            text: `¡${wData.name}!`,
            x: p1.x,
            y: p1.y - 35,
            color: '#38bdf8',
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
          (gameMode === 'local1v1' && keys['s']);

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

          const maxFuse = pr.maxLifeTicks || (pr.isMolotov ? 70 : 85);
          if (pr.lifeTicks >= maxFuse) {
            triggerGrenadeDetonation(s, pr);
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
        // Mundo clásico (Warehouse)
        if (s.bgImage && s.bgImage.complete && s.bgImage.naturalWidth > 0) {
          ctx.drawImage(s.bgImage, 0, 0, ARENA_WIDTH, ARENA_HEIGHT);
        } else {
          const grad = ctx.createLinearGradient(0, 0, 0, ARENA_HEIGHT);
          grad.addColorStop(0, '#111827');
          grad.addColorStop(0.7, '#1f2937');
          grad.addColorStop(1, '#0f172a');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
        }
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
          // Tema almacén clásico
          if (plat.h >= 30) {
            ctx.fillStyle = '#27201c';
            ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
            ctx.fillStyle = '#45382b';
            ctx.fillRect(plat.x, plat.y, plat.w, 4);
          } else if (plat.w <= 25) {
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
          } else {
            ctx.fillStyle = '#524332';
            ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
            ctx.fillStyle = '#786249';
            ctx.fillRect(plat.x, plat.y, plat.w, 3);
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
        isHuman: boolean
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
        const sheet = isHuman ? s.p1WalkSheet : s.botWalkSheet;
        const idleImg = isHuman ? s.p1IdleSprite : s.botIdleSprite;
        const cfg = isHuman ? s.p1SheetConfig : s.botSheetConfig;

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
          (isHuman && s.p1Controller.state === ControllerState.Roll);

        if (p.invulnerabilityTicks > 0 && Math.floor(p.invulnerabilityTicks / 4) % 2 === 0) {
          ctx.globalAlpha = 0.5;
        } else if (isRolling && (isHuman ? s.p1Controller.isInvulnerable : p.invulnerabilityTicks > 0)) {
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 16;
        }

        // Aura pulsante durante la carga de Heavy Smash
        if (p.isChargingHeavy) {
          const pulse = Math.sin(p.heavyChargeTicks * 0.45) * 0.5 + 0.5;
          ctx.save();
          ctx.strokeStyle = isHuman
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

        // Si el personaje está blandiendo un arma de filo (cuchillos, katanas, machetes, espadas, hachas):
        // Se ejecuta la coreografía marcial de la hoja del spritesheet de 16 fotogramas con arcos de corte y estelas.
        if (
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
        } else if (isWalking && cfg?.hasWalkSheet && sheet && sheet.complete && sheet.naturalWidth > 0 && sheet.naturalHeight > 0) {
          const cols = cfg.cols || 4;
          const rows = cfg.rows || 4;
          const totalFrames = cfg.totalFrames || 14;

          const frameW = sheet.naturalWidth / cols;
          const frameH = sheet.naturalHeight / rows;

          const currentFrame = p.animFrame;
          const safeFrame = Math.max(0, Math.min(currentFrame, totalFrames - 1));
          const col = safeFrame % cols;
          const row = Math.floor(safeFrame / cols);
          const sx = col * frameW;
          const sy = row * frameH;

          ctx.drawImage(sheet, sx, sy, frameW, frameH, drawX, drawY, charW, charH);
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
          ctx.fillStyle = isHuman ? '#0284c7' : '#e11d48';
          ctx.fillRect(drawX, drawY, charW, charH);
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(drawX + 18, drawY + 10, 8, 8);
        }

        // Arma equipada en mano (proporcional al personaje aumentado)
        // Si está ejecutando el ataque de filo, el arma ya forma parte de la animación fluida del spritesheet
        if (p.equippedWeapon !== WeaponType.Fists && !isBladeAttacking) {
          const wImg = s.weaponImages[p.equippedWeapon];
          if (wImg && wImg.complete && wImg.naturalWidth > 0) {
            ctx.drawImage(wImg, 8, -6, 32, 16);
          }
        }

        // Granada táctica activa visible en el cinturón / funda del combatiente
        const fighterGrenades = isHuman ? s.p1Grenades : s.botGrenades;
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

      renderFighter(s.p1, s.p1Sprite, '#38bdf8', true);
      renderFighter(s.bot, s.botSprite, '#f87171', false);

      // 11. PROYECTILES
      for (const pr of s.projectiles) {
        if (pr.isGrenade) {
          const gType = pr.grenadeType || GrenadeType.Frag;
          const gImg = s.grenadeImages[gType];
          ctx.save();
          ctx.translate(pr.x, pr.y);
          ctx.rotate(pr.rotation || 0);

          if (gImg && gImg.complete && gImg.naturalWidth > 0) {
            // Renderizado físico preciso con la imagen/modelo de la granada equipada
            ctx.drawImage(gImg, -10, -10, 20, 20);
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
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, ARENA_HEIGHT / 2 - 35, ARENA_WIDTH, 70);
        ctx.fillStyle = '#facc15';
        ctx.font = '900 32px "Chakra Petch", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(s.announcement, ARENA_WIDTH / 2, ARENA_HEIGHT / 2 + 10);
      }

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
      {/* HUD Superior: Marcador y Nombre del Mundo */}
      <div className="w-full max-w-[960px] bg-neutral-900/90 border border-neutral-800 rounded-t-xl px-4 py-2 flex items-center justify-between text-xs font-mono-code">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold">{hudState.worldName}</span>
          <span className="text-neutral-500">|</span>
          <span className="text-neutral-300">Ronda {hudState.round} / {hudState.maxRounds}</span>
        </div>

        <div className="flex items-center gap-3 text-sm font-extrabold">
          <span className="text-cyan-400">{hudState.p1Score}</span>
          <span className="text-neutral-500">-</span>
          <span className="text-rose-400">{hudState.botScore}</span>
        </div>

        <button
          onClick={onExitToMenu}
          className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg text-xs font-bold transition cursor-pointer"
        >
          Salir (ESC)
        </button>
      </div>

      {/* Viewport del Canvas */}
      <div className="relative border-x border-neutral-800 shadow-2xl bg-black">
        <canvas
          ref={canvasRef}
          width={ARENA_WIDTH}
          height={ARENA_HEIGHT}
          onClick={() => sounds.resumeAudio()}
          tabIndex={0}
          className="w-full max-w-[960px] max-h-[70vh] aspect-[16/9] object-contain block focus:outline-none"
        />

        {/* Modal de Fin de Partida con Revancha */}
        {hudState.isMatchOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 gap-4 z-20 backdrop-blur-sm animate-fade-in">
            <h2 className="text-4xl sm:text-5xl font-black tracking-wider text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">
              {hudState.matchWinner}
            </h2>
            <p className="text-neutral-300 text-base sm:text-lg font-mono-code">
              Marcador Final: {hudState.p1Score} - {hudState.botScore}
            </p>
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => restartRound(true)}
                className="px-6 py-3 min-h-[48px] bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-neutral-950 font-black rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition cursor-pointer touch-manipulation"
              >
                Jugar Revancha (R)
              </button>
              <button
                onClick={onExitToMenu}
                className="px-6 py-3 min-h-[48px] bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold rounded-xl border border-neutral-700 transition cursor-pointer touch-manipulation"
              >
                Elegir Otro Mundo / Menú
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Barra de Estadísticas de Combatientes */}
      <div className="w-full max-w-[960px] bg-neutral-900/95 border border-neutral-800 rounded-b-xl p-3 grid grid-cols-3 items-center gap-4 text-xs">
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
        <div className="flex flex-col items-center justify-center p-2 bg-neutral-950/80 rounded-xl border border-neutral-800 text-center">
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

        {/* Bot / J2 Stats */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-rose-400 font-bold">
            <span>{gameMode === 'local1v1' ? 'J2' : 'BOT'} ({botArch.name.toUpperCase()})</span>
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
            <span>{gameMode === 'local1v1' ? 'ARMA DE J2' : 'ARMA DEL BOT'}</span>
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
    </div>
  );
};
