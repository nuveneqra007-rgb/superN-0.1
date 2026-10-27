// =============================================================
// PlayerState.ts — FSM + Estado puro del jugador
// 21 estados canónicos de PlayerAnimation.as:43
// =============================================================

import { GameConstants } from './GameConstants';
import { WeaponType } from './WeaponData';

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
}

export interface PlayerState {
  id: number;
  name: string;
  isBot: boolean;

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

  // Estadísticas
  kills: number;
  deaths: number;

  // Modificadores
  speedModifier: number;
  damageDealtModifier: number;
  damageTakenModifier: number;
  meleeForceModifier: number;

  // Animación de caminata sincronizada con spritesheet
  animFrame: number;
  animFrameTimer: number;
  animSpeed: number;
  isMovingHorizontally: boolean;
}

export function createPlayerState(
  id: number,
  name: string,
  isBot: boolean,
  x: number,
  y: number
): PlayerState {
  return {
    id,
    name,
    isBot,
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
    kills: 0,
    deaths: 0,
    speedModifier: GameConstants.Speed_Normal,
    damageDealtModifier: GameConstants.DD_Normal,
    damageTakenModifier: GameConstants.DT_Normal,
    meleeForceModifier: 1.0,
    animFrame: 0,
    animFrameTimer: 0,
    animSpeed: 1.0,
    isMovingHorizontally: false,
  };
}
