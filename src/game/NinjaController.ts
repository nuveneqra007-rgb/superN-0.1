// =============================================================
// NinjaController.ts — Controlador de Movimiento Exclusivo del Ninja
// Arquitectura Aislada: El Ninja es el único protagonista jugable.
// No hereda ni comparte lógica de movimiento con bots ni con otros personajes.
// =============================================================

import { PlatformCollider } from './PlayerController';

/**
 * Parámetros físicos exclusivos para el Ninja.
 * Calibrados para una respuesta ágil, precisa y táctica.
 */
export const NINJA_CONFIG = {
  // Velocidades en el suelo con inercia progresiva (px/s)
  INITIAL_WALK_SPEED: 130,     // Velocidad inicial al comenzar a caminar
  WALK_SPEED: 170,             // Velocidad de caminata base
  RUN_THRESHOLD: 200,          // Umbral de velocidad para cambio automático a Run
  RUN_SPEED: 320,              // Velocidad máxima de carrera (Run)

  // Inercia y aceleración progresiva (px/s²) estilo Superfighters
  ACCELERATION: 420,           // Al mantener pulsada la dirección: gana velocidad progresivamente
  DECELERATION: 480,           // Al soltar la tecla: frena gradualmente (inercia)
  TURN_DECELERATION: 920,      // Frenado con derrape al invertir dirección

  // Salto Ninja y Gravedad reactiva (subida controlada, caída rápida)
  JUMP_FORCE: 580,             // Impulso vertical hacia arriba
  GRAVITY_RISE: 1200,          // Gravedad mientras asciende (px/s²)
  GRAVITY_FALL: 1950,          // Gravedad reforzada en el descenso (px/s²)
  TERMINAL_VELOCITY: 880,      // Velocidad máxima vertical terminal
  VARIABLE_JUMP_CUTOFF: 0.5,   // Multiplicador si se suelta el botón de salto prematuramente

  // Gracia temporal y buffers para agilidad ninja (segundos)
  COYOTE_TIME: 0.09,           // Permite saltar ~90ms tras caer de un borde
  JUMP_BUFFER: 0.10,           // Registra la pulsación de salto ~100ms antes de tocar suelo

  // Rodar / Evasión Ninja (Roll)
  ROLL_SPEED: 430,             // Desplazamiento rápido al rodar
  ROLL_DURATION: 0.36,         // Duración del roll (~360 ms)
  ROLL_COOLDOWN: 0.26,         // Cooldown posterior (~260 ms)
  ROLL_INVULNERABLE_DURATION: 0.24, // Ventana de esquiva con invulnerabilidad (~240 ms)

  // Hitbox específica del Ninja (px)
  HITBOX_WIDTH: 34,
  HITBOX_HEIGHT_STAND: 64,
  HITBOX_HEIGHT_ROLL: 34,
} as const;

/**
 * Estados propios del ciclo de vida y movimiento del Ninja
 */
export enum NinjaState {
  Idle = 'Idle',
  Walk = 'Walk',
  Run = 'Run',
  Jump = 'Jump',
  Fall = 'Fall',
  Roll = 'Roll',
  Crouch = 'Crouch',
  Attack = 'Attack',
  Dead = 'Dead',
}

/**
 * Esquema de entradas del jugador procesadas para el Ninja
 */
export interface NinjaInput {
  moveDir: -1 | 0 | 1;   // -1: Izquierda, 0: Neutral, 1: Derecha
  run: boolean;          // Modificador de carrera rápida
  jump: boolean;         // Disparo inicial de salto (just down)
  jumpHeld: boolean;     // Salto sostenido (para salto variable)
  roll: boolean;         // Disparo de rodada táctica (just down)
  dropThrough?: boolean; // Bajar de plataformas atravesables
}

/**
 * Controlador de física y movimiento autónomo para el Ninja
 */
export class NinjaController {
  // Posición central en el mundo
  public x: number;
  public y: number;

  // Velocidades lineales (px/s)
  public vx: number = 0;
  public vy: number = 0;

  // Estado del Ninja
  public state: NinjaState = NinjaState.Idle;

  // Orientación (true = derecha, false = izquierda)
  public facingRight: boolean = true;

  // Flags físicas
  public isOnFloor: boolean = false;
  public isInvulnerable: boolean = false;

  // Dimensiones actuales de hitbox
  private _hitboxHeight: number = NINJA_CONFIG.HITBOX_HEIGHT_STAND;

  // Temporizadores internos
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private rollTimer: number = 0;
  private rollCooldownTimer: number = 0;
  private rollDirection: -1 | 1 = 1;

  // Plataforma que se está atravesando hacia abajo
  private dropThroughIgnored: PlatformCollider | null = null;
  private dropThroughTimer: number = 0;

  constructor(startX: number, startY: number) {
    this.x = startX;
    this.y = startY;
  }

  public get hitboxWidth(): number {
    return NINJA_CONFIG.HITBOX_WIDTH;
  }

  public get hitboxHeight(): number {
    return this._hitboxHeight;
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.state = NinjaState.Idle;
    this.isOnFloor = false;
    this.isInvulnerable = false;
    this._hitboxHeight = NINJA_CONFIG.HITBOX_HEIGHT_STAND;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.rollTimer = 0;
    this.rollCooldownTimer = 0;
  }

  /**
   * Actualización del movimiento del Ninja por frame con delta-time estricto
   */
  public update(dt: number, input: NinjaInput, platforms: PlatformCollider[]): void {
    // 1. Descuento de temporizadores
    if (this.coyoteTimer > 0) this.coyoteTimer -= dt;
    if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= dt;
    if (this.rollCooldownTimer > 0) this.rollCooldownTimer -= dt;

    if (this.dropThroughTimer > 0) {
      this.dropThroughTimer -= dt;
      if (this.dropThroughTimer <= 0) {
        this.dropThroughIgnored = null;
      }
    }

    if (input.jump) {
      this.jumpBufferTimer = NINJA_CONFIG.JUMP_BUFFER;
    }

    // 2. Manejo de Rodada (Roll)
    if (this.state === NinjaState.Roll) {
      this.rollTimer -= dt;
      this.isInvulnerable = (NINJA_CONFIG.ROLL_DURATION - this.rollTimer) <= NINJA_CONFIG.ROLL_INVULNERABLE_DURATION;

      // Movimiento continuo en la dirección fija de la rodada
      this.vx = this.rollDirection * NINJA_CONFIG.ROLL_SPEED;

      // Finalización de la rodada
      if (this.rollTimer <= 0) {
        this.rollTimer = 0;
        this.isInvulnerable = false;
        this._hitboxHeight = NINJA_CONFIG.HITBOX_HEIGHT_STAND;
        this.rollCooldownTimer = NINJA_CONFIG.ROLL_COOLDOWN;
        this.state = this.isOnFloor ? NinjaState.Idle : NinjaState.Fall;
      }
    } else {
      // Iniciar rodada si hay comando y está disponible
      const canRoll = input.roll && this.rollCooldownTimer <= 0 && this.isOnFloor;
      if (canRoll) {
        this.state = NinjaState.Roll;
        this.rollTimer = NINJA_CONFIG.ROLL_DURATION;
        this.rollDirection = input.moveDir !== 0 ? input.moveDir : (this.facingRight ? 1 : -1);
        this.facingRight = this.rollDirection > 0;
        this.isInvulnerable = true;
        this._hitboxHeight = NINJA_CONFIG.HITBOX_HEIGHT_ROLL;
        this.vx = this.rollDirection * NINJA_CONFIG.ROLL_SPEED;
      } else {
        // Movimiento horizontal instantáneo
        if (input.moveDir !== 0) {
          const speed = input.run ? NINJA_CONFIG.RUN_SPEED : NINJA_CONFIG.WALK_SPEED;
          this.vx = input.moveDir * speed;
          this.facingRight = input.moveDir > 0;
        } else {
          this.vx = 0;
        }
      }
    }

    // 3. Salto con Coyote Time y Jump Buffer
    if (this.state !== NinjaState.Roll) {
      const canJump = (this.isOnFloor || this.coyoteTimer > 0) && this.jumpBufferTimer > 0;

      if (canJump) {
        this.vy = -NINJA_CONFIG.JUMP_FORCE;
        this.isOnFloor = false;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.state = NinjaState.Jump;
      }
    }

    // 4. Salto variable (si el jugador suelta el botón de salto durante el ascenso)
    if (this.vy < 0 && !input.jumpHeld && this.state !== NinjaState.Roll) {
      this.vy *= NINJA_CONFIG.VARIABLE_JUMP_CUTOFF;
    }

    // 5. Aplicación de Gravedad Asimétrica
    if (!this.isOnFloor && this.state !== NinjaState.Roll) {
      const gravity = this.vy < 0 ? NINJA_CONFIG.GRAVITY_RISE : NINJA_CONFIG.GRAVITY_FALL;
      this.vy += gravity * dt;
      if (this.vy > NINJA_CONFIG.TERMINAL_VELOCITY) {
        this.vy = NINJA_CONFIG.TERMINAL_VELOCITY;
      }
    }

    // 6. Integración de posición y colisiones con el entorno
    this.resolveMovement(dt, platforms, input.dropThrough);

    // 7. Actualización de estado visual
    if (this.state !== NinjaState.Roll) {
      if (!this.isOnFloor) {
        this.state = this.vy < 0 ? NinjaState.Jump : NinjaState.Fall;
      } else if (Math.abs(this.vx) > 0) {
        this.state = input.run ? NinjaState.Run : NinjaState.Walk;
      } else {
        this.state = NinjaState.Idle;
      }
    }
  }

  private resolveMovement(dt: number, platforms: PlatformCollider[], dropThrough?: boolean): void {
    // Movimiento horizontal
    this.x += this.vx * dt;
    this.resolveHorizontalCollisions(platforms);

    // Movimiento vertical
    const wasOnFloor = this.isOnFloor;
    this.y += this.vy * dt;
    this.isOnFloor = false;
    this.resolveVerticalCollisions(platforms, dropThrough);

    // Si acaba de salir del suelo sin saltar, activar coyote time
    if (wasOnFloor && !this.isOnFloor && this.vy >= 0) {
      this.coyoteTimer = NINJA_CONFIG.COYOTE_TIME;
    }
  }

  private resolveHorizontalCollisions(platforms: PlatformCollider[]): void {
    const halfW = this.hitboxWidth / 2;
    const halfH = this._hitboxHeight / 2;

    for (const plat of platforms) {
      if (plat.isOneWay) continue;

      const pLeft = plat.x;
      const pRight = plat.x + plat.w;
      const pTop = plat.y;
      const pBottom = plat.y + plat.h;

      const nLeft = this.x - halfW;
      const nRight = this.x + halfW;
      const nTop = this.y - halfH;
      const nBottom = this.y + halfH;

      if (nRight > pLeft && nLeft < pRight && nBottom > pTop + 4 && nTop < pBottom - 4) {
        if (this.vx > 0) {
          this.x = pLeft - halfW;
          this.vx = 0;
        } else if (this.vx < 0) {
          this.x = pRight + halfW;
          this.vx = 0;
        }
      }
    }
  }

  private resolveVerticalCollisions(platforms: PlatformCollider[], dropThrough?: boolean): void {
    const halfW = this.hitboxWidth / 2;
    const halfH = this._hitboxHeight / 2;

    for (const plat of platforms) {
      if (plat.isOneWay) {
        if (dropThrough && this.dropThroughIgnored !== plat) {
          this.dropThroughIgnored = plat;
          this.dropThroughTimer = 0.25;
          continue;
        }
        if (this.dropThroughIgnored === plat) continue;
      }

      const pLeft = plat.x;
      const pRight = plat.x + plat.w;
      const pTop = plat.y;
      const pBottom = plat.y + plat.h;

      const nLeft = this.x - halfW + 4;
      const nRight = this.x + halfW - 4;
      const nTop = this.y - halfH;
      const nBottom = this.y + halfH;

      // Colisión contra el suelo
      if (nRight > pLeft && nLeft < pRight) {
        if (this.vy >= 0 && nBottom >= pTop && nBottom - (this.vy * 0.05) <= pTop + 12) {
          this.y = pTop - halfH;
          this.vy = 0;
          this.isOnFloor = true;
        } else if (!plat.isOneWay && this.vy < 0 && nTop <= pBottom && nTop - (this.vy * 0.05) >= pBottom - 12) {
          this.y = pBottom + halfH;
          this.vy = 0;
        }
      }
    }
  }
}
