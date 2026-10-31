// ==============================================================================
// CharacterData.ts — Registro y Definición Tipada de Protagonistas de superN
// Fuente única de verdad para personajes jugables y perfiles (Fase 1 GDD v3)
// ==============================================================================

export type CharacterId = 'ninja' | 'gymrat' | 'santaclo';

export interface CharacterStats {
  hp: number;
  speedMult: number;
  meleeDamageMult: number;
}

export interface CharacterSheetDef {
  url: string;
  cols: number;
  rows: number;
  totalFrames: number;
  framesPerRow?: number[];
  hitFrame?: number;
  releaseFrame?: number;
}

export interface CharacterDef {
  id: CharacterId;
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
  {
    id: 'ninja',
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
        cols: 6,
        rows: 1,
        totalFrames: 6,
      },
      run: {
        url: '/assets/sprites/player/ninja_run.png',
        cols: 6,
        rows: 1,
        totalFrames: 6,
      },
      jump: {
        url: '/assets/sprites/player/ninja_jump.png',
        cols: 3,
        rows: 2,
        totalFrames: 6,
      },
      roll: {
        url: '/assets/sprites/player/ninja_roll.png',
        cols: 7,
        rows: 1,
        totalFrames: 7,
      },
      melee: {
        url: '/assets/sprites/player/ninja_melee.png',
        cols: 6,
        rows: 3,
        totalFrames: 18,
        framesPerRow: [6, 6, 6],
        hitFrame: 2,
      },
      oneHandAttack: {
        url: '/assets/sprites/player/one_hand_attack.png',
        cols: 5,
        rows: 1,
        totalFrames: 5,
        hitFrame: 2,
      },
      twoHandAttack: {
        url: '/assets/sprites/player/two_hand_attack.png',
        cols: 6,
        rows: 1,
        totalFrames: 6,
        hitFrame: 3,
      },
      pistolShoot: {
        url: '/assets/sprites/player/pistol_shoot.png',
        cols: 4,
        rows: 1,
        totalFrames: 4,
      },
      rifleShoot: {
        url: '/assets/sprites/player/rifle_shoot.png',
        cols: 4,
        rows: 1,
        totalFrames: 4,
      },
      throwUp: {
        url: '/assets/sprites/player/throw_up.png',
        cols: 5,
        rows: 1,
        totalFrames: 5,
        releaseFrame: 2,
      },
    },
  },
  {
    id: 'gymrat',
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
        cols: 6,
        rows: 1,
        totalFrames: 6,
      },
      run: {
        url: '/assets/sprites/player/gymrat_run.png',
        cols: 6,
        rows: 1,
        totalFrames: 6,
      },
      jump: {
        url: '/assets/sprites/player/gymrat_jump.png',
        cols: 6,
        rows: 1,
        totalFrames: 6,
      },
      roll: {
        url: '/assets/sprites/player/gymrat_roll.png',
        cols: 6,
        rows: 1,
        totalFrames: 6,
      },
      melee: {
        url: '/assets/sprites/player/gymrat_melee.png',
        cols: 6,
        rows: 1,
        totalFrames: 6,
        hitFrame: 1,
      },
      oneHandAttack: {
        url: '/assets/sprites/player/gymrat_one_hand_attack.png',
        cols: 5,
        rows: 1,
        totalFrames: 5,
        hitFrame: 2,
      },
      pistolShoot: {
        url: '/assets/sprites/player/gymrat_pistol_shoot.png',
        cols: 4,
        rows: 1,
        totalFrames: 4,
      },
    },
  },
  {
    id: 'santaclo',
    name: 'SANTA CLAUS',
    title: 'SANTA CLAUS SUPERVIVIENTE',
    tag: 'SUPERVIVIENTE',
    accentColor: '#ef4444',
    idleUrl: '/assets/characters/santaclo/idle.png',
    portraitUrl: '/assets/characters/santaclo/idle.png',
    playable: false, // Bloqueado hasta integrar sus hojas de animación
    drawScale: 1.35,
    stats: {
      hp: 110,
      speedMult: 1.0,
      meleeDamageMult: 1.05,
    },
    startWeapon: 'Fist',
  },
];

export function getCharacterDef(id: CharacterId | string): CharacterDef {
  const found = CHARACTERS.find((c) => c.id === id);
  return found || CHARACTERS[0];
}
