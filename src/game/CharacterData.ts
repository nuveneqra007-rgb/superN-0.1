// ==============================================================================
// CharacterData.ts — Registro y Definición Tipada de Protagonistas de superN
// Fuente única de verdad para personajes jugables y perfiles (Fase 1-5 GDD v3)
// ==============================================================================

import { BotFaction, BotArchetypeDatabase } from './BotData';
import frameMetaData from '../data/frameMeta.json';

export { frameMetaData };

export type CharacterId = 'ninja' | 'gymrat' | 'santaclo';

export interface CharacterStats {
  hp: number;
  speedMult: number;
  meleeDamageMult: number;
}

export interface CharacterSheetDef {
  url: string;
  metaUrl?: string;
  cols: number;
  rows: number;
  totalFrames: number;
  framesPerRow?: number[];
  hitFrame?: number;
  releaseFrame?: number;
  frameDurations?: number[];
  phases?: ('windup' | 'active' | 'recovery')[];
}

export interface CharacterDef {
  id: CharacterId;
  faction: BotFaction;
  name: string;
  title: string;
  tag: string;
  accentColor: string;
  idleUrl: string;
  portraitUrl?: string;
  playable: boolean;
  stats: CharacterStats;
  startWeapon?: string;
  drawScale?: number;
  sheets?: {
    walk?: CharacterSheetDef;
    run?: CharacterSheetDef;
    jump?: CharacterSheetDef;
    roll?: CharacterSheetDef;
    melee?: CharacterSheetDef;
    oneHandAttack?: CharacterSheetDef;
    twoHandAttack?: CharacterSheetDef;
    pistolShoot?: CharacterSheetDef;
    rifleShoot?: CharacterSheetDef;
    throwUp?: CharacterSheetDef;
  };
}

export const CHARACTERS: CharacterDef[] = [
  // ── 1. NINJA (SHINOBI URBANO) ──
  {
    id: 'ninja',
    faction: BotFaction.Ninja,
    name: 'NINJA',
    title: 'SHINOBI URBANO',
    tag: 'SIGILO / HOJA',
    accentColor: '#38bdf8',
    idleUrl: '/assets/characters/ninja/idle.png',
    portraitUrl: '/assets/characters/ninja/idle.png',
    playable: true,
    drawScale: 1.0,
    stats: {
      hp: 100,
      speedMult: 1.15,
      meleeDamageMult: 1.0,
    },
    startWeapon: 'Fist',
    sheets: {
      walk: {
        url: '/assets/sprites/player/ninja_walk.png',
        metaUrl: '/assets/sprites/player/ninja_walk.meta.json',
        cols: 6,
        rows: 1,
        totalFrames: 6,
        frameDurations: [4, 4, 4, 4, 4, 4],
      },
      run: {
        url: '/assets/sprites/player/ninja_run.png',
        metaUrl: '/assets/sprites/player/ninja_run.meta.json',
        cols: 6,
        rows: 1,
        totalFrames: 6,
        frameDurations: [3, 3, 3, 3, 3, 3],
      },
      jump: {
        url: '/assets/sprites/player/ninja_jump.png',
        metaUrl: '/assets/sprites/player/ninja_jump.meta.json',
        cols: 3,
        rows: 2,
        totalFrames: 6,
        frameDurations: [4, 4, 5, 5, 4, 4],
      },
      roll: {
        url: '/assets/sprites/player/ninja_roll.png',
        metaUrl: '/assets/sprites/player/ninja_roll.meta.json',
        cols: 7,
        rows: 1,
        totalFrames: 7,
        frameDurations: [2, 2, 2, 2, 2, 2, 3],
      },
      melee: {
        url: '/assets/sprites/player/ninja_melee.png',
        metaUrl: '/assets/sprites/player/ninja_melee.meta.json',
        cols: 6,
        rows: 3,
        totalFrames: 18,
        framesPerRow: [6, 6, 6],
        hitFrame: 2,
        frameDurations: [2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 4, 4],
      },
      oneHandAttack: {
        url: '/assets/sprites/player/one_hand_attack.png',
        metaUrl: '/assets/sprites/player/one_hand_attack.meta.json',
        cols: 5,
        rows: 1,
        totalFrames: 5,
        hitFrame: 2,
        frameDurations: [2, 2, 2, 3, 3],
        phases: ['windup', 'windup', 'active', 'recovery', 'recovery'],
      },
      twoHandAttack: {
        url: '/assets/sprites/player/two_hand_attack.png',
        metaUrl: '/assets/sprites/player/two_hand_attack.meta.json',
        cols: 6,
        rows: 1,
        totalFrames: 6,
        hitFrame: 3,
        frameDurations: [3, 3, 2, 2, 4, 4],
        phases: ['windup', 'windup', 'windup', 'active', 'recovery', 'recovery'],
      },
      pistolShoot: {
        url: '/assets/sprites/player/pistol_shoot.png',
        metaUrl: '/assets/sprites/player/pistol_shoot.meta.json',
        cols: 4,
        rows: 1,
        totalFrames: 4,
        frameDurations: [2, 1, 2, 3],
      },
      rifleShoot: {
        url: '/assets/sprites/player/rifle_shoot.png',
        metaUrl: '/assets/sprites/player/rifle_shoot.meta.json',
        cols: 4,
        rows: 1,
        totalFrames: 4,
        frameDurations: [2, 1, 3, 3],
      },
      throwUp: {
        url: '/assets/sprites/player/throw_up.png',
        metaUrl: '/assets/sprites/player/throw_up.meta.json',
        cols: 5,
        rows: 1,
        totalFrames: 5,
        releaseFrame: 2,
        frameDurations: [3, 3, 2, 3, 4],
      },
    },
  },

  // ── 2. GYMRAT (BRAWLER BRUTAL) ──
  {
    id: 'gymrat',
    faction: BotFaction.Gymrat,
    name: 'GYMRAT',
    title: 'BRAWLER BRUTAL',
    tag: 'FUERZA BRUTA',
    accentColor: '#f97316',
    idleUrl: '/assets/characters/gymrat/idle.png',
    portraitUrl: '/assets/characters/gymrat/idle.png',
    playable: true,
    drawScale: 1.08,
    stats: {
      hp: 125,
      speedMult: 0.92,
      meleeDamageMult: 1.25,
    },
    startWeapon: 'Fist',
    sheets: {
      walk: {
        url: '/assets/sprites/player/gymrat_walk.png',
        metaUrl: '/assets/sprites/player/gymrat_walk.meta.json',
        cols: 6,
        rows: 1,
        totalFrames: 6,
        frameDurations: [5, 5, 5, 5, 5, 5],
      },
      run: {
        url: '/assets/sprites/player/gymrat_run.png',
        metaUrl: '/assets/sprites/player/gymrat_run.meta.json',
        cols: 6,
        rows: 1,
        totalFrames: 6,
        frameDurations: [3, 3, 3, 3, 3, 3],
      },
      jump: {
        url: '/assets/sprites/player/gymrat_jump.png',
        metaUrl: '/assets/sprites/player/gymrat_jump.meta.json',
        cols: 6,
        rows: 1,
        totalFrames: 6,
        frameDurations: [4, 4, 5, 5, 4, 4],
      },
      roll: {
        url: '/assets/sprites/player/gymrat_roll.png',
        metaUrl: '/assets/sprites/player/gymrat_roll.meta.json',
        cols: 6,
        rows: 1,
        totalFrames: 6,
        frameDurations: [3, 2, 2, 2, 3, 3],
      },
      melee: {
        url: '/assets/sprites/player/gymrat_melee.png',
        metaUrl: '/assets/sprites/player/gymrat_melee.meta.json',
        cols: 6,
        rows: 1,
        totalFrames: 6,
        hitFrame: 1,
        frameDurations: [3, 2, 2, 3, 4, 4],
      },
      oneHandAttack: {
        url: '/assets/sprites/player/gymrat_one_hand_attack.png',
        metaUrl: '/assets/sprites/player/gymrat_one_hand_attack.meta.json',
        cols: 5,
        rows: 1,
        totalFrames: 5,
        hitFrame: 2,
        frameDurations: [3, 2, 2, 4, 4],
        phases: ['windup', 'windup', 'active', 'recovery', 'recovery'],
      },
      twoHandAttack: {
        url: '/assets/sprites/player/gymrat_two_hand_attack.png',
        metaUrl: '/assets/sprites/player/gymrat_two_hand_attack.meta.json',
        cols: 6,
        rows: 1,
        totalFrames: 6,
        hitFrame: 3,
        frameDurations: [4, 4, 3, 2, 5, 5],
        phases: ['windup', 'windup', 'windup', 'active', 'recovery', 'recovery'],
      },
      pistolShoot: {
        url: '/assets/sprites/player/gymrat_pistol_shoot.png',
        metaUrl: '/assets/sprites/player/gymrat_pistol_shoot.meta.json',
        cols: 4,
        rows: 1,
        totalFrames: 4,
        frameDurations: [2, 1, 3, 3],
      },
      rifleShoot: {
        url: '/assets/sprites/player/gymrat_rifle_shoot.png',
        metaUrl: '/assets/sprites/player/gymrat_rifle_shoot.meta.json',
        cols: 4,
        rows: 1,
        totalFrames: 4,
        frameDurations: [2, 1, 3, 4],
      },
      throwUp: {
        url: '/assets/sprites/player/gymrat_throw_up.png',
        metaUrl: '/assets/sprites/player/gymrat_throw_up.meta.json',
        cols: 5,
        rows: 1,
        totalFrames: 5,
        releaseFrame: 2,
        frameDurations: [3, 3, 2, 4, 4],
      },
    },
  },

  // ── 3. SANTA CLAUS (SUPERVIVIENTE) ──
  {
    id: 'santaclo',
    faction: BotFaction.Santa,
    name: 'SANTA CLAUS',
    title: 'SANTA CLAUS SUPERVIVIENTE',
    tag: 'SUPERVIVIENTE',
    accentColor: '#ef4444',
    idleUrl: '/assets/characters/santaclo/idle.png',
    portraitUrl: '/assets/characters/santaclo/idle.png',
    playable: true,
    drawScale: 1.08,
    stats: {
      hp: 110,
      speedMult: 1.0,
      meleeDamageMult: 1.05,
    },
    startWeapon: 'Fist',
    sheets: {
      walk: {
        url: '/assets/sprites/player/santaclo_walk.png',
        metaUrl: '/assets/sprites/player/santaclo_walk.meta.json',
        cols: 6,
        rows: 1,
        totalFrames: 6,
        frameDurations: [5, 5, 5, 5, 5, 5],
      },
      run: {
        url: '/assets/sprites/player/santaclo_run.png',
        metaUrl: '/assets/sprites/player/santaclo_run.meta.json',
        cols: 6,
        rows: 1,
        totalFrames: 6,
        frameDurations: [3, 3, 3, 3, 3, 3],
      },
      jump: {
        url: '/assets/sprites/player/santaclo_jump.png',
        metaUrl: '/assets/sprites/player/santaclo_jump.meta.json',
        cols: 6,
        rows: 1,
        totalFrames: 6,
        frameDurations: [4, 4, 5, 5, 4, 4],
      },
      roll: {
        url: '/assets/sprites/player/santaclo_roll.png',
        metaUrl: '/assets/sprites/player/santaclo_roll.meta.json',
        cols: 6,
        rows: 1,
        totalFrames: 6,
        frameDurations: [3, 2, 2, 2, 3, 3],
      },
      melee: {
        url: '/assets/sprites/player/santaclo_melee.png',
        metaUrl: '/assets/sprites/player/santaclo_melee.meta.json',
        cols: 5,
        rows: 1,
        totalFrames: 5,
        hitFrame: 2,
        frameDurations: [4, 3, 2, 4, 5],
        phases: ['windup', 'windup', 'active', 'recovery', 'recovery'],
      },
      oneHandAttack: {
        url: '/assets/sprites/player/santaclo_one_hand_attack.png',
        metaUrl: '/assets/sprites/player/santaclo_one_hand_attack.meta.json',
        cols: 5,
        rows: 1,
        totalFrames: 5,
        hitFrame: 2,
        frameDurations: [4, 3, 2, 4, 5],
        phases: ['windup', 'windup', 'active', 'recovery', 'recovery'],
      },
      twoHandAttack: {
        url: '/assets/sprites/player/santaclo_two_hand_attack.png',
        metaUrl: '/assets/sprites/player/santaclo_two_hand_attack.meta.json',
        cols: 5,
        rows: 1,
        totalFrames: 5,
        hitFrame: 3,
        frameDurations: [5, 5, 4, 2, 6],
        phases: ['windup', 'windup', 'windup', 'active', 'recovery'],
      },
      pistolShoot: {
        url: '/assets/sprites/player/santaclo_pistol_shoot.png',
        metaUrl: '/assets/sprites/player/santaclo_pistol_shoot.meta.json',
        cols: 4,
        rows: 1,
        totalFrames: 4,
        hitFrame: 1, // Frame 2 (0-indexed 1): disparo y fogonazo
        frameDurations: [2, 1, 3, 3],
        phases: ['windup', 'active', 'recovery', 'recovery'],
      },
      rifleShoot: {
        url: '/assets/sprites/player/santaclo_rifle_shoot.png',
        metaUrl: '/assets/sprites/player/santaclo_rifle_shoot.meta.json',
        cols: 4,
        rows: 1,
        totalFrames: 4,
        hitFrame: 1, // Frame 2 (0-indexed 1): disparo con fogonazo
        frameDurations: [2, 1, 3, 4],
        phases: ['windup', 'active', 'recovery', 'recovery'],
      },
      throwUp: {
        url: '/assets/sprites/player/santaclo_throw_up.png',
        metaUrl: '/assets/sprites/player/santaclo_throw_up.meta.json',
        cols: 5,
        rows: 1,
        totalFrames: 5,
        releaseFrame: 3, // CRÍTICO: Frame 4 (0-indexed 3) brazo completamente extendido hacia la derecha/arriba
        frameDurations: [4, 4, 3, 3, 4],
      },
    },
  },
];

/**
 * Obtiene la definición de un personaje por su ID interno ('ninja', 'gymrat', 'santaclo')
 */
export function getCharacterDef(id: CharacterId | string): CharacterDef {
  if (typeof id !== 'string') return CHARACTERS[0];
  const found = CHARACTERS.find((c) => c.id === id || c.faction === id);
  if (!found) {
    return CHARACTERS[0];
  }
  return found;
}

/**
 * Obtiene la definición de un personaje jugable a partir de su facción (BotFaction)
 */
export function getCharacterDefByFaction(faction: BotFaction | string): CharacterDef | undefined {
  if (typeof faction !== 'string') return undefined;
  if (faction === BotFaction.Ninja || faction === 'ninja') return CHARACTERS[0];
  if (faction === BotFaction.Gymrat || faction === 'gymrat') return CHARACTERS[1];
  if (faction === BotFaction.Santa || faction === 'santaclo') return CHARACTERS[2];
  return undefined;
}

/**
 * Interfaz unificada de configuración de spritesheets para ArenaCanvas.
 * Centraliza la definición de texturas para cualquier combatiente (P1, P2 o Bot).
 */
export interface FighterSheetConfig {
  faction: BotFaction | string;
  idleUrl: string;
  hasWalkSheet: boolean;
  walkSheetUrl?: string;
  cols?: number;
  rows?: number;
  totalFrames?: number;

  hasRunSheet?: boolean;
  runSheetUrl?: string;
  runCols?: number;
  runRows?: number;
  runTotalFrames?: number;

  hasRollSheet?: boolean;
  rollSheetUrl?: string;
  rollCols?: number;
  rollRows?: number;
  rollTotalFrames?: number;

  hasJumpSheet?: boolean;
  jumpSheetUrl?: string;
  jumpCols?: number;
  jumpRows?: number;
  jumpTotalFrames?: number;

  hasMeleeSheet?: boolean;
  meleeSheetUrl?: string;
  meleeCols?: number;
  meleeRows?: number;
  meleeTotalFramesPerRow?: number;
  meleeHitFrame?: number;

  hasOneHandAttackSheet?: boolean;
  oneHandAttackSheetUrl?: string;
  oneHandCols?: number;
  oneHandRows?: number;
  oneHandTotalFrames?: number;
  oneHandHitFrame?: number;

  hasTwoHandAttackSheet?: boolean;
  twoHandAttackSheetUrl?: string;
  twoHandCols?: number;
  twoHandRows?: number;
  twoHandTotalFrames?: number;
  twoHandHitFrame?: number;

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
  throwUpReleaseFrame?: number;
}

/**
 * Fuente Única de Verdad: Resuelve la configuración de spritesheets para cualquier facción
 * leyendo exclusivamente desde CharacterData.ts y BotArchetypeDatabase.
 * Si detecta inconsistencias o assets faltantes, emite warnings/errores en consola.
 */
export function getFighterSheetConfig(faction: BotFaction | string): FighterSheetConfig {
  if (typeof faction !== 'string' || !faction || faction === '$$typeof') {
    return {
      faction: typeof faction === 'string' ? faction : '',
      idleUrl: '/assets/sprites/player/ninja.png',
      hasWalkSheet: false,
    };
  }

  const charDef = getCharacterDefByFaction(faction);

  if (charDef && charDef.sheets) {
    const s = charDef.sheets;
    return {
      faction,
      idleUrl: charDef.idleUrl,
      hasWalkSheet: !!s.walk,
      walkSheetUrl: s.walk?.url,
      cols: s.walk?.cols || 6,
      rows: s.walk?.rows || 1,
      totalFrames: s.walk?.totalFrames || 6,

      hasRunSheet: !!s.run,
      runSheetUrl: s.run?.url,
      runCols: s.run?.cols || 6,
      runRows: s.run?.rows || 1,
      runTotalFrames: s.run?.totalFrames || 6,

      hasRollSheet: !!s.roll,
      rollSheetUrl: s.roll?.url,
      rollCols: s.roll?.cols || 6,
      rollRows: s.roll?.rows || 1,
      rollTotalFrames: s.roll?.totalFrames || 6,

      hasJumpSheet: !!s.jump,
      jumpSheetUrl: s.jump?.url,
      jumpCols: s.jump?.cols || 6,
      jumpRows: s.jump?.rows || 1,
      jumpTotalFrames: s.jump?.totalFrames || 6,

      hasMeleeSheet: !!s.melee,
      meleeSheetUrl: s.melee?.url,
      meleeCols: s.melee?.cols || 6,
      meleeRows: s.melee?.rows || 1,
      meleeTotalFramesPerRow: s.melee?.framesPerRow ? s.melee.framesPerRow[0] : (s.melee?.cols || 6),
      meleeHitFrame: s.melee?.hitFrame,

      hasOneHandAttackSheet: !!s.oneHandAttack,
      oneHandAttackSheetUrl: s.oneHandAttack?.url,
      oneHandCols: s.oneHandAttack?.cols || 5,
      oneHandRows: s.oneHandAttack?.rows || 1,
      oneHandTotalFrames: s.oneHandAttack?.totalFrames || 5,
      oneHandHitFrame: s.oneHandAttack?.hitFrame,

      hasTwoHandAttackSheet: !!s.twoHandAttack,
      twoHandAttackSheetUrl: s.twoHandAttack?.url,
      twoHandCols: s.twoHandAttack?.cols || 5,
      twoHandRows: s.twoHandAttack?.rows || 1,
      twoHandTotalFrames: s.twoHandAttack?.totalFrames || 5,
      twoHandHitFrame: s.twoHandAttack?.hitFrame,

      hasPistolShootSheet: !!s.pistolShoot,
      pistolShootSheetUrl: s.pistolShoot?.url,
      pistolCols: s.pistolShoot?.cols || 4,
      pistolRows: s.pistolShoot?.rows || 1,
      pistolTotalFrames: s.pistolShoot?.totalFrames || 4,

      hasRifleShootSheet: !!s.rifleShoot,
      rifleShootSheetUrl: s.rifleShoot?.url,
      rifleCols: s.rifleShoot?.cols || 4,
      rifleRows: s.rifleShoot?.rows || 1,
      rifleTotalFrames: s.rifleShoot?.totalFrames || 4,

      hasThrowUpSheet: !!s.throwUp,
      throwUpSheetUrl: s.throwUp?.url,
      throwUpCols: s.throwUp?.cols || 5,
      throwUpRows: s.throwUp?.rows || 1,
      throwUpTotalFrames: s.throwUp?.totalFrames || 5,
      throwUpReleaseFrame: s.throwUp?.releaseFrame ?? 2,
    };
  }

  // Si no es un protagonista con hoja completa, consultar BotArchetypeDatabase
  const botArch = BotArchetypeDatabase[faction as BotFaction];
  if (!botArch) {
    return {
      faction,
      idleUrl: '/assets/sprites/player/ninja.png',
      hasWalkSheet: false,
    };
  }

  return {
    faction,
    idleUrl: botArch.spriteUrl || '/assets/sprites/bot/thug.png',
    hasWalkSheet: false,
  };
}

/**
 * Definición de escala uniforme y anclaje por tipo de hoja de sprites (Corrección de Escala Uniforme).
 * Compara el tamaño base del personaje en idle/walk contra el frame del disparo o ataque,
 * aplicando el factor de escala (Scale) necesario para igualar el tamaño base,
 * y alineando el pivote (los pies en la línea del suelo) para evitar encogimientos, hundimientos o teletransportes.
 */
export interface UniformScaleAnchor {
  scaleFactor: number;
  feetYRatio: number; // Posición de la línea de pies en la celda normalizada (0..1)
  feetCenterXInCell?: number; // Centro horizontal del cuerpo/pies en la celda original
}

export const UNIFORM_SCALE_MAP: Record<string, UniformScaleAnchor> = {
  // Santa Claus:
  // Base Walk: 296px de alto sobre celda de 320 (feetY = 316)
  // Shoot frames: 202px de alto (escala uniforme = 296 / 202 = 1.46535)
  santaclo_rifle_shoot: {
    scaleFactor: 296 / 202,
    feetYRatio: 316 / 320,
    feetCenterXInCell: 125,
  },
  santaclo_two_hand_shoot: {
    scaleFactor: 296 / 202,
    feetYRatio: 316 / 320,
    feetCenterXInCell: 125,
  },
  santaclo_pistol_shoot: {
    scaleFactor: 296 / 202,
    feetYRatio: 316 / 320,
    feetCenterXInCell: 125,
  },
  santaclo_one_hand_shoot: {
    scaleFactor: 296 / 202,
    feetYRatio: 316 / 320,
    feetCenterXInCell: 125,
  },
  santaclo_throw_up: {
    scaleFactor: 1.0,
    feetYRatio: 314 / 320,
    feetCenterXInCell: 160,
  },

  // Gymrat:
  // Base Walk frame 0: 334px de alto sobre celda de 400 (feetY = 400)
  // Rifle shoot: 309px de alto (escala uniforme = 334 / 309 = 1.0809)
  gymrat_rifle_shoot: {
    scaleFactor: 334 / 309,
    feetYRatio: 400 / 400,
    feetCenterXInCell: 160,
  },
  gymrat_two_hand_shoot: {
    scaleFactor: 334 / 309,
    feetYRatio: 400 / 400,
    feetCenterXInCell: 160,
  },
  // Pistol shoot: 300px de alto (escala uniforme = 334 / 300 = 1.1133)
  gymrat_pistol_shoot: {
    scaleFactor: 334 / 300,
    feetYRatio: 400 / 400,
    feetCenterXInCell: 160,
  },
  gymrat_one_hand_shoot: {
    scaleFactor: 334 / 300,
    feetYRatio: 400 / 400,
    feetCenterXInCell: 160,
  },

  // Ninja:
  // Base Walk frame 0: 249px de alto sobre celda de 290 (feetY = 271)
  // Rifle shoot: 209px de alto (escala uniforme = 249 / 209 = 1.1914)
  ninja_rifle_shoot: {
    scaleFactor: 249 / 209,
    feetYRatio: 271 / 290,
    feetCenterXInCell: 85,
  },
  ninja_two_hand_shoot: {
    scaleFactor: 249 / 209,
    feetYRatio: 271 / 290,
    feetCenterXInCell: 85,
  },
  // Pistol shoot: 229px de alto (escala uniforme = 249 / 229 = 1.0873)
  ninja_pistol_shoot: {
    scaleFactor: 249 / 229,
    feetYRatio: 271 / 290,
    feetCenterXInCell: 85,
  },
  ninja_one_hand_shoot: {
    scaleFactor: 249 / 229,
    feetYRatio: 271 / 290,
    feetCenterXInCell: 85,
  },
};

export function getUniformScaleConfig(sheetId: string): UniformScaleAnchor | null {
  if (UNIFORM_SCALE_MAP[sheetId]) {
    return UNIFORM_SCALE_MAP[sheetId];
  }

  // Detección dinámica automática si se trata de una animación de disparo o de arma
  if (sheetId.includes('shoot') || sheetId.includes('rifle')) {
    let prefix = '';
    if (sheetId.startsWith('santaclo_')) prefix = 'santaclo_';
    else if (sheetId.startsWith('gymrat_')) prefix = 'gymrat_';
    else if (sheetId.startsWith('ninja_')) prefix = 'ninja_';

    if (prefix) {
      const walkMeta = (frameMetaData as Record<string, any>)[`${prefix}walk`];
      const currentMeta = (frameMetaData as Record<string, any>)[sheetId];
      if (walkMeta?.frames?.[0] && currentMeta?.frames?.[0]) {
        const baseH = walkMeta.frames[0].h;
        const currentH = currentMeta.frames[0].h;
        const cellH = currentMeta.frames[0].cellH || walkMeta.frames[0].cellH || 320;
        if (currentH > 0 && currentH < baseH * 0.96) {
          const baseRatio = baseH / (walkMeta.frames[0].cellH || cellH);
          const currentRatio = currentH / cellH;
          const scaleFactor = baseRatio / currentRatio;
          const feetYRatio = (currentMeta.frames[0].y - currentMeta.frames[0].cellY + currentH) / cellH;
          return {
            scaleFactor,
            feetYRatio,
            feetCenterXInCell: currentMeta.frames[0].anchorX
              ? currentMeta.frames[0].anchorX + (currentMeta.frames[0].x - currentMeta.frames[0].cellX)
              : (currentMeta.frames[0].x - currentMeta.frames[0].cellX + currentMeta.frames[0].w / 2),
          };
        }
      }
    }
  }

  return null;
}

