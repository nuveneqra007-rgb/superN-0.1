// =============================================================
// WorldData.ts — Definición tipada de mundos y mecánicas interactivas
// Compatible con el motor 60Hz de superN
// =============================================================

import { PhysicsRect } from './PhysicsStep';

export interface SpawnPoint {
  x: number;
  y: number;
}

export interface LayerCfg {
  id: string;
  speed: number; // Factor de desplazamiento parallax
  type: 'image' | 'dunes' | 'pyramids' | 'mountains' | 'factory_silhouettes' | 'beams';
  color?: string;
  imageUrl?: string;
  offsetY?: number;
}

export type PropType =
  | 'cactus'
  | 'dry_tree'
  | 'dry_bush'
  | 'cow_skull'
  | 'arrow_sign'
  | 'lockers'
  | 'warning_board'
  | 'box_stack'
  | 'chimney'
  | 'beam';

export interface PropCfg {
  id: string;
  type: PropType;
  x: number;
  y: number;
  scale?: number;
  flipX?: boolean;
}

export interface PlatformRect extends PhysicsRect {
  theme?: 'warehouse' | 'desert_earth' | 'industrial_metal' | 'hazard_stripe';
  color?: string;
  topColor?: string;
  label?: string;
}

export type HazardType =
  | 'destructible_crate'
  | 'conveyor_belt'
  | 'explosive_barrel'
  | 'hydraulic_press';

export interface HazardCfg {
  id: string;
  type: HazardType;
  x: number;
  y: number;
  w: number;
  h: number;
  // Parámetros y constantes ajustables
  health?: number;            // Cajas (25 HP) y barriles (30 HP)
  maxHealth?: number;
  explosionRadius?: number;   // Barriles (85 px)
  explosionDamage?: number;   // Barriles (50 dmg)
  speed?: number;             // Cintas transportadoras (+2.5 px/tick)
  direction?: 'left' | 'right';
  crushDamage?: number;       // Prensa hidráulica (35 dmg)
  cyclePeriodTicks?: number;  // Ciclo total de la prensa (180 ticks = 3 seg)
  downDurationTicks?: number; // Tiempo que permanece abajo (40 ticks)
  maxDropY?: number;          // Descenso de la prensa (90 px)
  itemDropChance?: number;    // Probabilidad de arma/botiquín al romper caja (1.0)
}

export interface WorldConfig {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  mechanicLabel: string;
  mechanicsDescription: string;
  preview: string;
  sky: string[]; // Gradiente de cielo [colorTop, colorBottom]
  parallaxLayers: LayerCfg[];
  platforms: PlatformRect[];
  props: PropCfg[];
  spawns: SpawnPoint[];       // [p1Spawn, botSpawn]
  weaponSpawns: SpawnPoint[]; // Puntos donde flotan armas
  hazards: HazardCfg[];
  ambientSound?: 'warehouse' | 'desert' | 'industrial';
}

// -------------------------------------------------------------
// MUNDO 1: ARENA CLÁSICA (Almacén original sin modificaciones)
// -------------------------------------------------------------
const classicWorld: WorldConfig = {
  id: 'classic',
  name: 'Arena Clásica',
  subtitle: 'Almacén Táctico',
  description: 'La arena original de combate sin peligros ambientales. Plataformas equilibradas para duelos directos.',
  mechanicLabel: 'Sin mecánicas extra',
  mechanicsDescription: 'Diseño clásico con vigas industriales y 4 plataformas elevadas simétricas.',
  preview: '/assets/backgrounds/warehouse.jpg',
  sky: ['#111827', '#1f2937', '#0f172a'],
  parallaxLayers: [
    {
      id: 'bg_image',
      speed: 0.1,
      type: 'image',
      imageUrl: '/assets/backgrounds/warehouse.jpg',
    },
  ],
  platforms: [
    // Suelo
    { x: -10, y: 501, w: 980, h: 40, isOneWay: false, theme: 'warehouse' },
    // Muro Izquierdo
    { x: 0, y: 0, w: 20, h: 540, isOneWay: false, theme: 'warehouse' },
    // Muro Derecho
    { x: 940, y: 0, w: 20, h: 540, isOneWay: false, theme: 'warehouse' },
    // Plat1 - Centro (200x14)
    { x: 380, y: 370, w: 200, h: 14, isOneWay: true, theme: 'warehouse' },
    // Plat2 - Izquierda (140x14)
    { x: 125, y: 290, w: 140, h: 14, isOneWay: true, theme: 'warehouse' },
    // Plat3 - Derecha (140x14)
    { x: 695, y: 290, w: 140, h: 14, isOneWay: true, theme: 'warehouse' },
    // Plat4 - Centro Alto (140x14)
    { x: 410, y: 210, w: 140, h: 14, isOneWay: true, theme: 'warehouse' },
  ],
  props: [],
  spawns: [
    { x: 200, y: 460 },
    { x: 760, y: 460 },
  ],
  weaponSpawns: [
    { x: 480, y: 350 },
    { x: 480, y: 190 },
    { x: 195, y: 270 },
    { x: 765, y: 270 },
  ],
  hazards: [],
  ambientSound: 'warehouse',
};



// -------------------------------------------------------------
// MUNDO 4: PUERTO MALDITO (Barco, grúas y muelles nocturnos)
// -------------------------------------------------------------
const puertoWorld: WorldConfig = {
  id: 'puerto',
  name: 'Puerto Maldito',
  subtitle: 'Dársena Nocturna',
  description: 'Barco de carga anclado en aguas oscuras con grúas operativas, muelles de madera y almacenes portuarios.',
  mechanicLabel: 'Doble nivel naval y cajas portuarias',
  mechanicsDescription: 'Combate sobre la cubierta del carguero y los muelles. Cajas destructibles con provisiones navales.',
  preview: '/assets/aistudio/image_26e47cf6.png',
  sky: ['#050814', '#0d1629', '#1a2744'],
  parallaxLayers: [
    { id: 'bg_image', speed: 0.1, type: 'image', imageUrl: '/assets/aistudio/image_26e47cf6.png' },
  ],
  platforms: [
    // Suelo muelle y almacén derecho
    { x: 510, y: 410, w: 450, h: 130, isOneWay: false, theme: 'warehouse' },
    // Muelle central de pilotes
    { x: 405, y: 420, w: 105, h: 20, isOneWay: true, theme: 'warehouse' },
    // Cubierta del barco carguero
    { x: 45, y: 400, w: 340, h: 140, isOneWay: false, theme: 'warehouse' },
    // Cabina superior del barco
    { x: 120, y: 320, w: 160, h: 16, isOneWay: true, theme: 'warehouse' },
    // Pasarela media del almacén derecho
    { x: 635, y: 300, w: 120, h: 16, isOneWay: true, theme: 'warehouse' },
    { x: 775, y: 300, w: 165, h: 16, isOneWay: true, theme: 'warehouse' },
    // Pasarela alta del almacén derecho
    { x: 800, y: 200, w: 140, h: 16, isOneWay: true, theme: 'warehouse' },
    // Muros laterales
    { x: 0, y: 0, w: 20, h: 540, isOneWay: false, theme: 'warehouse' },
    { x: 940, y: 0, w: 20, h: 540, isOneWay: false, theme: 'warehouse' },
  ],
  props: [],
  spawns: [
    { x: 180, y: 350 },
    { x: 720, y: 360 },
  ],
  weaponSpawns: [
    { x: 200, y: 290 },
    { x: 460, y: 395 },
    { x: 690, y: 275 },
    { x: 870, y: 175 },
  ],
  hazards: [
    {
      id: 'puerto_crate_1',
      type: 'destructible_crate',
      x: 170,
      y: 368,
      w: 32,
      h: 32,
      health: 25,
      maxHealth: 25,
      itemDropChance: 1.0,
    },
    {
      id: 'puerto_barrel_1',
      type: 'explosive_barrel',
      x: 820,
      y: 378,
      w: 24,
      h: 32,
      health: 30,
      maxHealth: 30,
      explosionRadius: 90,
      explosionDamage: 55,
    },
  ],
  ambientSound: 'warehouse',
};

// -------------------------------------------------------------
// MUNDO 5: FUNDICIÓN ROJA (Cinta masiva y calor infernal)
// -------------------------------------------------------------
const fundicionWorld: WorldConfig = {
  id: 'fundicion',
  name: 'Fundición Roja',
  subtitle: 'Horno Siderúrgico',
  description: 'Complejo metalúrgico a altas temperaturas con una cinta transportadora masiva y turbinas de ventilación.',
  mechanicLabel: 'Cinta transportadora continua y barriles',
  mechanicsDescription: 'Cinta transportadora horizontal que desplaza a los combatientes en el centro del escenario.',
  preview: '/assets/aistudio/image_57664f22.png',
  sky: ['#2b0505', '#1a0303', '#0a0000'],
  parallaxLayers: [
    { id: 'bg_image', speed: 0.1, type: 'image', imageUrl: '/assets/aistudio/image_57664f22.png' },
  ],
  platforms: [
    // Cinta transportadora central (plataforma activa)
    { x: 85, y: 355, w: 790, h: 28, isOneWay: false, theme: 'hazard_stripe' },
    // Suelo inferior base
    { x: -10, y: 505, w: 980, h: 40, isOneWay: false, theme: 'industrial_metal' },
    // Muros laterales
    { x: 0, y: 0, w: 20, h: 540, isOneWay: false, theme: 'industrial_metal' },
    { x: 940, y: 0, w: 20, h: 540, isOneWay: false, theme: 'industrial_metal' },
  ],
  props: [],
  spawns: [
    { x: 220, y: 310 },
    { x: 740, y: 310 },
  ],
  weaponSpawns: [
    { x: 320, y: 320 },
    { x: 480, y: 320 },
    { x: 640, y: 320 },
  ],
  hazards: [
    {
      id: 'fundicion_conveyor',
      type: 'conveyor_belt',
      x: 85,
      y: 355,
      w: 790,
      h: 28,
      speed: 2.0,
      direction: 'right',
    },
    {
      id: 'fundicion_barrel_1',
      type: 'explosive_barrel',
      x: 340,
      y: 323,
      w: 24,
      h: 32,
      health: 30,
      maxHealth: 30,
      explosionRadius: 90,
      explosionDamage: 55,
    },
    {
      id: 'fundicion_barrel_2',
      type: 'explosive_barrel',
      x: 620,
      y: 323,
      w: 24,
      h: 32,
      health: 30,
      maxHealth: 30,
      explosionRadius: 90,
      explosionDamage: 55,
    },
  ],
  ambientSound: 'industrial',
};

// -------------------------------------------------------------
// MUNDO 6: METRO NEÓN (Estación subterránea ciberpunk)
// -------------------------------------------------------------
const cyberpunkWorld: WorldConfig = {
  id: 'cyberpunk',
  name: 'Metro Neón',
  subtitle: 'Terminal Subterránea',
  description: 'Andén futurista en penumbra con estructuras geométricas fluorescentes, escaleras colgantes y cables de tensión.',
  mechanicLabel: 'Duelos verticales en plataformas flotantes',
  mechanicsDescription: 'Múltiples bloques suspendidos en el vacío para maniobras aéreas, saltos y caídas tácticas.',
  preview: '/assets/aistudio/image_43c2b272.png',
  sky: ['#02080d', '#05131a', '#020b12'],
  parallaxLayers: [
    { id: 'bg_image', speed: 0.1, type: 'image', imageUrl: '/assets/aistudio/image_43c2b272.png' },
  ],
  platforms: [
    // Suelo inferior neón
    { x: 70, y: 505, w: 820, h: 32, isOneWay: false, theme: 'warehouse' },
    // Plataforma central flotante
    { x: 360, y: 235, w: 240, h: 22, isOneWay: true, theme: 'warehouse' },
    // Bloques escalonados a la izquierda
    { x: 105, y: 215, w: 42, h: 42, isOneWay: true, theme: 'warehouse' },
    { x: 185, y: 300, w: 42, h: 42, isOneWay: true, theme: 'warehouse' },
    { x: 185, y: 405, w: 42, h: 42, isOneWay: true, theme: 'warehouse' },
    // Bloques escalonados a la derecha
    { x: 815, y: 215, w: 42, h: 42, isOneWay: true, theme: 'warehouse' },
    { x: 735, y: 300, w: 42, h: 42, isOneWay: true, theme: 'warehouse' },
    { x: 735, y: 405, w: 42, h: 42, isOneWay: true, theme: 'warehouse' },
    // Muros laterales
    { x: 0, y: 0, w: 20, h: 540, isOneWay: false, theme: 'warehouse' },
    { x: 940, y: 0, w: 20, h: 540, isOneWay: false, theme: 'warehouse' },
  ],
  props: [],
  spawns: [
    { x: 190, y: 460 },
    { x: 770, y: 460 },
  ],
  weaponSpawns: [
    { x: 480, y: 200 },
    { x: 125, y: 185 },
    { x: 835, y: 185 },
    { x: 480, y: 470 },
  ],
  hazards: [],
  ambientSound: 'warehouse',
};

// -------------------------------------------------------------
// MUNDO 7: LABORATORIO TÓXICO (Zona ácida con suministros)
// -------------------------------------------------------------
const toxicoWorld: WorldConfig = {
  id: 'toxico',
  name: 'Laboratorio Tóxico',
  subtitle: 'Zona de Biopeligro',
  description: 'Instalación científica abandonada con suelos bioluminiscentes verdes, púas de contención y suministros médicos.',
  mechanicLabel: 'Plataformas elevadas y botiquines',
  mechanicsDescription: 'Cajas destructibles con alta probabilidad de botiquines de primeros auxilios y armas pesadas.',
  preview: '/assets/aistudio/image_6f961c12.png',
  sky: ['#041a05', '#092e0b', '#031405'],
  parallaxLayers: [
    { id: 'bg_image', speed: 0.1, type: 'image', imageUrl: '/assets/aistudio/image_6f961c12.png' },
  ],
  platforms: [
    // Suelo inferior verde
    { x: -10, y: 505, w: 980, h: 40, isOneWay: false, theme: 'hazard_stripe' },
    // Plataformas medias con púas inferiores
    { x: 210, y: 325, w: 245, h: 22, isOneWay: true, theme: 'warehouse' },
    { x: 505, y: 325, w: 245, h: 22, isOneWay: true, theme: 'warehouse' },
    // Plataforma central superior
    { x: 415, y: 175, w: 160, h: 22, isOneWay: true, theme: 'warehouse' },
    // Pasarelas altas laterales
    { x: 35, y: 190, w: 165, h: 22, isOneWay: true, theme: 'warehouse' },
    { x: 760, y: 190, w: 165, h: 22, isOneWay: true, theme: 'warehouse' },
    // Muros laterales
    { x: 0, y: 0, w: 20, h: 540, isOneWay: false, theme: 'warehouse' },
    { x: 940, y: 0, w: 20, h: 540, isOneWay: false, theme: 'warehouse' },
  ],
  props: [],
  spawns: [
    { x: 260, y: 280 },
    { x: 700, y: 280 },
  ],
  weaponSpawns: [
    { x: 490, y: 140 },
    { x: 110, y: 155 },
    { x: 840, y: 155 },
    { x: 490, y: 465 },
  ],
  hazards: [
    {
      id: 'toxico_crate_1',
      type: 'destructible_crate',
      x: 480,
      y: 143,
      w: 32,
      h: 32,
      health: 25,
      maxHealth: 25,
      itemDropChance: 1.0,
    },
    {
      id: 'toxico_crate_2',
      type: 'destructible_crate',
      x: 810,
      y: 158,
      w: 32,
      h: 32,
      health: 25,
      maxHealth: 25,
      itemDropChance: 1.0,
    },
  ],
  ambientSound: 'warehouse',
};

// -------------------------------------------------------------
// MUNDO 8: FOSO "БОЙ!" (Coliseo subterráneo brutal)
// -------------------------------------------------------------
const fosoWorld: WorldConfig = {
  id: 'foso',
  name: 'Foso "БОЙ!"',
  subtitle: 'Arena Clandestina',
  description: 'Coliseo de lucha clandestina bajo tierra, con columnas de acero, púas mortales y un altar central de armamento.',
  mechanicLabel: 'Altar superior con munición y cajas pesadas',
  mechanicsDescription: 'El altar central superior alberga múltiples cajas con armas de gran potencia y granadas.',
  preview: '/assets/aistudio/image_3d8d2fc4.png',
  sky: ['#000000', '#0a0a0a', '#141414'],
  parallaxLayers: [
    { id: 'bg_image', speed: 0.1, type: 'image', imageUrl: '/assets/aistudio/image_3d8d2fc4.png' },
  ],
  platforms: [
    // Suelo inferior
    { x: -10, y: 505, w: 980, h: 40, isOneWay: false, theme: 'warehouse' },
    // Columnas inferiores
    { x: 145, y: 380, w: 50, h: 125, isOneWay: false, theme: 'warehouse' },
    { x: 305, y: 425, w: 50, h: 80, isOneWay: false, theme: 'warehouse' },
    { x: 645, y: 425, w: 50, h: 80, isOneWay: false, theme: 'warehouse' },
    { x: 795, y: 380, w: 50, h: 125, isOneWay: false, theme: 'warehouse' },
    // Plataformas medias
    { x: 140, y: 265, w: 180, h: 20, isOneWay: true, theme: 'warehouse' },
    { x: 645, y: 265, w: 180, h: 20, isOneWay: true, theme: 'warehouse' },
    // Plataforma central intermedia
    { x: 385, y: 330, w: 200, h: 20, isOneWay: true, theme: 'warehouse' },
    // Altar superior "БОЙ!"
    { x: 385, y: 175, w: 200, h: 20, isOneWay: true, theme: 'warehouse' },
    // Muros laterales
    { x: 0, y: 0, w: 20, h: 540, isOneWay: false, theme: 'warehouse' },
    { x: 940, y: 0, w: 20, h: 540, isOneWay: false, theme: 'warehouse' },
  ],
  props: [],
  spawns: [
    { x: 220, y: 220 },
    { x: 740, y: 220 },
  ],
  weaponSpawns: [
    { x: 480, y: 140 },
    { x: 480, y: 295 },
    { x: 230, y: 460 },
    { x: 730, y: 460 },
  ],
  hazards: [
    {
      id: 'foso_crate_1',
      type: 'destructible_crate',
      x: 430,
      y: 143,
      w: 32,
      h: 32,
      health: 25,
      maxHealth: 25,
      itemDropChance: 1.0,
    },
    {
      id: 'foso_crate_2',
      type: 'destructible_crate',
      x: 505,
      y: 143,
      w: 32,
      h: 32,
      health: 25,
      maxHealth: 25,
      itemDropChance: 1.0,
    },
  ],
  ambientSound: 'warehouse',
};

// -------------------------------------------------------------
// MUNDO 9: AZOTEA HOTEL (Cielo crepuscular sobre el rascacielos)
// -------------------------------------------------------------
const azoteaWorld: WorldConfig = {
  id: 'azotea',
  name: 'Azotea Hotel',
  subtitle: 'Cielo Carmesí',
  description: 'Estructura metálica suspendida sobre el letrero de neón luminoso de un hotel con vistas a la metrópolis.',
  mechanicLabel: 'Duelos en suspensión y plataformas elevadas',
  mechanicsDescription: 'Puente central con elevadores de mantenimiento laterales y drop de suministros aéreos.',
  preview: '/assets/aistudio/image_e12875f3.png',
  sky: ['#5a2503', '#3d1602', '#1b0900'],
  parallaxLayers: [
    { id: 'bg_image', speed: 0.1, type: 'image', imageUrl: '/assets/aistudio/image_e12875f3.png' },
  ],
  platforms: [
    // Puente central metálico sobre el letrero HOTEL
    { x: 235, y: 345, w: 490, h: 28, isOneWay: false, theme: 'warehouse' },
    // Elevador lateral izquierdo
    { x: 195, y: 275, w: 85, h: 18, isOneWay: true, theme: 'warehouse' },
    // Elevador lateral derecho
    { x: 680, y: 275, w: 85, h: 18, isOneWay: true, theme: 'warehouse' },
    // Suelo inferior base
    { x: -10, y: 510, w: 980, h: 35, isOneWay: false, theme: 'warehouse' },
    // Muros laterales
    { x: 0, y: 0, w: 20, h: 540, isOneWay: false, theme: 'warehouse' },
    { x: 940, y: 0, w: 20, h: 540, isOneWay: false, theme: 'warehouse' },
  ],
  props: [],
  spawns: [
    { x: 310, y: 300 },
    { x: 650, y: 300 },
  ],
  weaponSpawns: [
    { x: 480, y: 305 },
    { x: 235, y: 235 },
    { x: 720, y: 235 },
  ],
  hazards: [
    {
      id: 'azotea_crate_center',
      type: 'destructible_crate',
      x: 470,
      y: 313,
      w: 32,
      h: 32,
      health: 25,
      maxHealth: 25,
      itemDropChance: 1.0,
    },
  ],
  ambientSound: 'warehouse',
};

export const WORLDS: WorldConfig[] = [
  classicWorld,
  puertoWorld,
  fundicionWorld,
  cyberpunkWorld,
  toxicoWorld,
  fosoWorld,
  azoteaWorld,
];

export function getWorldConfig(id: string): WorldConfig {
  const found = WORLDS.find((w) => w.id === id);
  return found || classicWorld;
}
