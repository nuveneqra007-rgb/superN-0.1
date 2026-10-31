// =============================================================
// PlayerState.ts — FSM + Estado puro del jugador
// 21 estados canónicos de PlayerAnimation.as:43
// =============================================================

import { GameConstants } from './GameConstants';
import { WeaponType } from './WeaponData';
import { BotFaction } from './BotData';

export enum PlayerFSMState {
  Idle = 'Idle',                 // 0 - En pie, quieto
  Walk = 'Walk',                 // 1 - Caminando
  Run = 'Run',                   // 2 - Corriendo
  Sprint = 'Sprint',             // 3 - Sprint (consume stamina)
  Jump = 'Jump',                 // 4 - En aire, subiendo
  Fall = 'Fall',                 // 5 - Cayendo
  Crouch = 'Crouch',             // 6 - Agachado
  CrouchSlide = 'CrouchSlide',   // 7 - Slide (16 ticks)
  Roll = 'Roll',                 // 8 - Dodge roll (18 ticks, ininterrumpible)
  Dive = 'Dive',                 // 9 - Salto de buceo
  WallSlide = 'WallSlide',       // 10 - Deslizando en pared
  LedgeHang = 'LedgeHang',       // 11 - Colgando de borde
  LedgeClimb = 'LedgeClimb',     // 12 - Subiendo borde
  MeleeAttack = 'MeleeAttack',   // 13 - Ataque melee
  RangedAim = 'RangedAim',       // 14 - Apuntando con arma
  RangedFire = 'RangedFire',     // 15 - Disparando
  ThrowWeapon = 'ThrowWeapon',   // 16 - Lanzando arma
  Hitstun = 'Hitstun',           // 17 - Aturdido
  KnockedDown = 'KnockedDown',   // 18 - Derribado en suelo
  GetUp = 'GetUp',               // 19 - Levantándose
  Dead = 'Dead',                 // 20 - Muerto
  ArmaDosManos = 'arma_dos_manos', // Estado del personaje al equipar arma pesada a dos manos
}

export type WeaponSlotType = 'melee' | 'handgun' | 'primary' | 'throwable';

export interface PlayerInventory {
  melee: WeaponType;
  handgun: { type: WeaponType; ammo: number } | null;
  primary: { type: WeaponType; ammo: number } | null;
  activeSlot: WeaponSlotType;
}

export interface PlayerState {
  id: number;
  name: string;
  isBot: boolean;
  faction?: BotFaction;

  // Inventario por ranuras (J1 y J2 humano en local1v1)
  inventory?: PlayerInventory;
  slotCooldownTicks?: number;

  // FSM
  fsm: PlayerFSMState;
  stateTicks: number;

  // Posición y física
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  facingRight: boolean;
  onGround: boolean;
  onOneWayPlatform: boolean;

  // Salud y stamina
  health: number;
  maxHealth: number;
  stamina: number;
  isAlive: boolean;
  isOnFire: boolean;
  fireTicks: number;
  invulnerabilityTicks: number;

  // Arma equipada
  equippedWeapon: WeaponType;
  ammo: number;
  attackCooldown: number;
  comboStep: number;
  comboWindowTicks: number;

  // Contadores de estado
  rollTicks: number;
  slideTicks: number;
  hitstunTicks: number;
  knockdownTicks: number;
  getUpTicks: number;
  respawnTicks: number;
  platformDropTicks: number;
  coyoteTicks: number;
  hitFlashTicks: number;

  // Estadísticas
  kills: number;
  deaths: number;
  lastAttackerId?: number;
  lastHitTicks?: number;

  // Modificadores
  speedModifier: number;
  damageDealtModifier: number;
  damageTakenModifier: number;
  meleeForceModifier: number;
  lifestealOnHit?: number;

  // Animación de caminata sincronizada con spritesheet
  animFrame: number;
  animFrameTimer: number;
  animSpeed: number;
  isMovingHorizontally: boolean;

  // Animación de aterrizaje vinculada a la física (Gymrat)
  gymratLandingTicks?: number;
  gymratPrevOnGround?: boolean;

  // Nuevas mecánicas avanzadas de melee (Heavy Smash, Slide, Grapple)
  heavyChargeTicks: number;
  isChargingHeavy: boolean;
  isSliding: boolean;
  isGrappling: boolean;
  isGrabbed: boolean;
  grabbedTargetId: number | null;
  grappleTicks: number;

  // Sistema de Combo Melee con Spritesheet de 3 Filas (Ninja: Puñetazo, Patada, Uppercut)
  isMeleeComboAttacking?: boolean;
  meleeComboStep: number;
  meleeAnimFrame: number;
  meleeAnimTimer: number;
  meleeHasHit: boolean;
  comboBuffered?: boolean;

  // Set de animación de Ataque a una mano (one_hand_attack - 5 frames rápidos)
  isOneHandAttacking?: boolean;
  oneHandAnimFrame?: number;
  oneHandAnimTimer?: number;
  oneHandHasHit?: boolean;

  // Set exclusivo de combate con Espada del Ninja (one_hand_attack - 3 tajos mortales y fluidos)
  isSwordAttacking?: boolean;
  swordComboStep?: number;
  swordAnimFrame?: number;
  swordAnimTimer?: number;
  swordHasHit?: boolean;
  swordComboBuffered?: boolean;
  swordComboWindowTicks?: number;

  // Set de animación de Ataque a dos manos (two_hand_attack - 6 frames pesados)
  isTwoHandAttacking?: boolean;
  twoHandAnimFrame?: number;
  twoHandAnimTimer?: number;
  twoHandHasHit?: boolean;

  // Set de animación de Ataque a una mano (Pistolas) (pistol_shoot - 4 frames con retroceso en frame 3)
  isPistolShooting?: boolean;
  pistolAnimFrame?: number;
  pistolAnimTimer?: number;
  pistolHasFired?: boolean;
  pistolHasRecoilApplied?: boolean;

  // Set de animación de Ataque a dos manos (Rifles/Escopetas) (rifle_shoot - 4 frames con retroceso en frame 3)
  isRifleShooting?: boolean;
  rifleAnimFrame?: number;
  rifleAnimTimer?: number;
  rifleHasFired?: boolean;
  rifleHasRecoilApplied?: boolean;

  // Set de animación de Lanzamiento (throw_up - 5 frames One Shot, suelta en frame 3)
  isThrowing?: boolean;
  throwAnimFrame?: number;
  throwAnimTimer?: number;
  throwHasReleased?: boolean;
  throwInitialInertia?: number;

  // Estado del personaje según arma equipada ('arma_dos_manos' | 'arma_una_mano' | 'pistola' | 'rifle' | 'arrojadiza' | 'desarmado')
  characterState?: string;
  weaponState?: 'arma_dos_manos' | 'arma_una_mano' | 'pistola' | 'rifle' | 'arrojadiza' | 'desarmado';
}

export function createPlayerState(
  id: number,
  name: string,
  isBot: boolean,
  x: number,
  y: number,
  faction?: BotFaction
): PlayerState {
  return {
    id,
    name,
    isBot,
    faction,
    fsm: PlayerFSMState.Idle,
    stateTicks: 0,
    x,
    y,
    velocityX: 0,
    velocityY: 0,
    facingRight: id === 1,
    onGround: false,
    onOneWayPlatform: false,
    health: GameConstants.MaxHealth,
    maxHealth: GameConstants.MaxHealth,
    stamina: GameConstants.MaxStamina,
    isAlive: true,
    isOnFire: false,
    fireTicks: 0,
    invulnerabilityTicks: 0,
    equippedWeapon: WeaponType.Fists,
    ammo: 0,
    attackCooldown: 0,
    comboStep: 0,
    comboWindowTicks: 0,
    rollTicks: 0,
    slideTicks: 0,
    hitstunTicks: 0,
    knockdownTicks: 0,
    getUpTicks: 0,
    respawnTicks: 0,
    platformDropTicks: 0,
    coyoteTicks: 0,
    hitFlashTicks: 0,
    kills: 0,
    deaths: 0,
    lastHitTicks: 9999,
    speedModifier: GameConstants.Speed_Normal,
    damageDealtModifier: GameConstants.DD_Normal,
    damageTakenModifier: GameConstants.DT_Normal,
    meleeForceModifier: 1.0,
    animFrame: 0,
    animFrameTimer: 0,
    animSpeed: 1.0,
    isMovingHorizontally: false,
    heavyChargeTicks: 0,
    isChargingHeavy: false,
    isSliding: false,
    isGrappling: false,
    isGrabbed: false,
    grabbedTargetId: null,
    grappleTicks: 0,
    isMeleeComboAttacking: false,
    meleeComboStep: 0,
    meleeAnimFrame: 0,
    meleeAnimTimer: 0,
    meleeHasHit: false,
    comboBuffered: false,
    isOneHandAttacking: false,
    oneHandAnimFrame: 0,
    oneHandAnimTimer: 0,
    oneHandHasHit: false,
    isSwordAttacking: false,
    swordComboStep: 0,
    swordAnimFrame: 0,
    swordAnimTimer: 0,
    swordHasHit: false,
    swordComboBuffered: false,
    swordComboWindowTicks: 0,
    isTwoHandAttacking: false,
    twoHandAnimFrame: 0,
    twoHandAnimTimer: 0,
    twoHandHasHit: false,
    characterState: 'desarmado',
    weaponState: 'desarmado',
  };
}
