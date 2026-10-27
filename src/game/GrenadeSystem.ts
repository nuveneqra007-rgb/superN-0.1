// =============================================================
// GrenadeSystem.ts — Sistema de Gestión y Ciclo de Vida de Granadas
// Límite configurable de munición, inventario multiclase y proyectiles visuales
// =============================================================

export enum GrenadeType {
  Frag = 'Frag',           // Granada de fragmentación (Alto impacto explosivo)
  Smoke = 'Smoke',         // Granada de humo (Cortina táctica densa que reduce visibilidad)
  Flashbang = 'Flashbang', // Granada cegadora (Flash cegador + aturdimiento masivo)
  Molotov = 'Molotov',     // Cóctel incendiario (Zona persistente de llamas y quemaduras)
}

export interface GrenadeConfig {
  type: GrenadeType;
  name: string;
  shortName: string;
  description: string;
  iconUrl: string;
  color: string;
  glowColor: string;
  damage: number;
  explosionRadius: number;
  fuseTicks: number;          // Duración de la mecha a 60 FPS (ej. 85 ticks = ~1.4 s)
  detonateOnImpact: boolean;  // True para Molotov (detona al impactar suelo/combatiente)
  burnDurationTicks?: number; // Duración del fuego si aplica
  stunTicks?: number;         // Duración del aturdimiento para flashbang
  smokeDurationTicks?: number;// Duración de la cortina de humo
}

export const GRENADE_DATABASE: Record<GrenadeType, GrenadeConfig> = {
  [GrenadeType.Frag]: {
    type: GrenadeType.Frag,
    name: 'Granada de Fragmentación',
    shortName: 'FRAG',
    description: 'Explosivo de fragmentación con daño destructivo y metralla expansiva.',
    iconUrl: '/assets/weapons/Grenade.png',
    color: '#10b981',
    glowColor: '#34d399',
    damage: 75,
    explosionRadius: 90,
    fuseTicks: 85,
    detonateOnImpact: false,
  },
  [GrenadeType.Smoke]: {
    type: GrenadeType.Smoke,
    name: 'Granada de Humo Táctico',
    shortName: 'HUMO',
    description: 'Despliega una densa cortina de humo que desorienta y nubla la visión del rival.',
    iconUrl: '/assets/weapons/Smoke.svg',
    color: '#94a3b8',
    glowColor: '#cbd5e1',
    damage: 10,
    explosionRadius: 135,
    fuseTicks: 70,
    detonateOnImpact: false,
    smokeDurationTicks: 360, // ~6 segundos de humo
  },
  [GrenadeType.Flashbang]: {
    type: GrenadeType.Flashbang,
    name: 'Granada Cegadora / Stun',
    shortName: 'CEGADORA',
    description: 'Ráfaga de luz cegadora y onda sónica que aturde y desarma a los enemigos cercanos.',
    iconUrl: '/assets/weapons/Flashbang.svg',
    color: '#facc15',
    glowColor: '#fef08a',
    damage: 20,
    explosionRadius: 125,
    fuseTicks: 60,
    detonateOnImpact: false,
    stunTicks: 70, // ~1.15 segundos de aturdimiento total (Hitstun)
  },
  [GrenadeType.Molotov]: {
    type: GrenadeType.Molotov,
    name: 'Cóctel Molotov',
    shortName: 'MOLOTOV',
    description: 'Botella incendiaria que estalla al impactar, dejando una zona de fuego abrasador.',
    iconUrl: '/assets/weapons/Molotov.png',
    color: '#f97316',
    glowColor: '#fb923c',
    damage: 40,
    explosionRadius: 80,
    fuseTicks: 0,
    detonateOnImpact: true,
    burnDurationTicks: 300, // ~5 segundos de zona de llamas activa
  },
};

export const ALL_GRENADE_TYPES: GrenadeType[] = [
  GrenadeType.Frag,
  GrenadeType.Smoke,
  GrenadeType.Flashbang,
  GrenadeType.Molotov,
];

// Límite máximo global configurable de granadas por combatiente
export const GRENADE_MAX_CAPACITY = 8;
export const GRENADE_INITIAL_COUNT = 3;

export interface GrenadeInventory {
  activeType: GrenadeType;
  ammo: Record<GrenadeType, number>;
  maxTotal: number;
}

/**
 * Crea un inventario inicial de granadas con límite máximo configurable.
 */
export function createGrenadeInventory(
  maxTotal: number = GRENADE_MAX_CAPACITY,
  initialType: GrenadeType = GrenadeType.Frag,
  initialCount: number = GRENADE_INITIAL_COUNT
): GrenadeInventory {
  return {
    activeType: initialType,
    ammo: {
      [GrenadeType.Frag]: initialType === GrenadeType.Frag ? initialCount : 0,
      [GrenadeType.Smoke]: initialType === GrenadeType.Smoke ? initialCount : 0,
      [GrenadeType.Flashbang]: initialType === GrenadeType.Flashbang ? initialCount : 0,
      [GrenadeType.Molotov]: initialType === GrenadeType.Molotov ? initialCount : 0,
    },
    maxTotal,
  };
}

/**
 * Retorna la suma total de granadas que posee el combatiente en su inventario.
 */
export function getTotalGrenades(inv: GrenadeInventory): number {
  if (!inv || !inv.ammo) return 0;
  return Object.values(inv.ammo).reduce((acc, count) => acc + count, 0);
}

/**
 * Comprueba si el combatiente tiene espacio disponible para recoger más granadas.
 */
export function canAddGrenade(inv: GrenadeInventory, _type: GrenadeType, amount: number = 1): boolean {
  if (!inv) return false;
  return getTotalGrenades(inv) + amount <= inv.maxTotal;
}

/**
 * Añade granadas al inventario respetando estrictamente el límite máximo.
 * Retorna la cantidad efectiva que se pudo añadir.
 */
export function addGrenades(inv: GrenadeInventory, type: GrenadeType, amount: number = 2): number {
  if (!inv || !inv.ammo) return 0;
  const currentTotal = getTotalGrenades(inv);
  const availableSpace = Math.max(0, inv.maxTotal - currentTotal);
  const toAdd = Math.min(amount, availableSpace);

  if (toAdd > 0) {
    inv.ammo[type] = (inv.ammo[type] || 0) + toAdd;
    // Si no teníamos granadas equipadas de ningún tipo, activar la que acabamos de recoger
    if (inv.ammo[inv.activeType] <= 0) {
      inv.activeType = type;
    }
  }

  return toAdd;
}

/**
 * Alterna al siguiente tipo de granada disponible en el inventario.
 */
export function cycleGrenadeType(inv: GrenadeInventory): GrenadeType {
  if (!inv) return GrenadeType.Frag;
  const types = ALL_GRENADE_TYPES;
  const currentIndex = types.indexOf(inv.activeType);

  // Probar secuencialmente los siguientes tipos
  for (let offset = 1; offset <= types.length; offset++) {
    const nextType = types[(currentIndex + offset) % types.length];
    if (inv.ammo[nextType] > 0) {
      inv.activeType = nextType;
      return nextType;
    }
  }

  // Si todas están en 0, ciclar normalmente al siguiente tipo visual
  const nextType = types[(currentIndex + 1) % types.length];
  inv.activeType = nextType;
  return nextType;
}

/**
 * Consume una granada del tipo activo si hay disponible.
 * Si se agotan las de ese tipo, auto-selecciona el siguiente tipo que tenga munición.
 */
export function consumeGrenade(inv: GrenadeInventory): GrenadeType | null {
  if (!inv || !inv.ammo) return null;
  const currentCount = inv.ammo[inv.activeType] || 0;
  if (currentCount <= 0) {
    // Si la actual está vacía, intentar cambiar a otra con munición
    for (const t of ALL_GRENADE_TYPES) {
      if ((inv.ammo[t] || 0) > 0) {
        inv.activeType = t;
        inv.ammo[t]--;
        return t;
      }
    }
    return null;
  }

  const thrownType = inv.activeType;
  inv.ammo[thrownType]--;

  // Si se vació este tipo y quedan otros tipos con granadas, cambiar automáticamente
  if (inv.ammo[thrownType] <= 0) {
    for (const t of ALL_GRENADE_TYPES) {
      if ((inv.ammo[t] || 0) > 0) {
        inv.activeType = t;
        break;
      }
    }
  }

  return thrownType;
}

/**
 * Entidad física de recogida de granadas en el mundo (World Pickup).
 */
export interface GrenadePickupEntity {
  id: number;
  grenadeType: GrenadeType;
  amount: number;
  x: number;
  y: number;
  baseY: number;
  bobTicks: number;
}
