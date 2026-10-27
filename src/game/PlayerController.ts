// =============================================================
// PlayerController.ts — Controlador de Movimiento 2D Arcade
// Sensación: seca, instantánea y responsiva estilo Superfighters Deluxe
// SIN inercia ni aceleración suave. Tipado estricto sin `any`.
// =============================================================

/**
 * Parámetros de configuración ajustables para calibrar el 'game feel'.
 */
export const PLAYER_CONFIG = {
  // Velocidades horizontales instantáneas (px/s)
  WALK_SPEED: 180,
  RUN_SPEED: 300,

  // Salto y Gravedad asimétrica (caída más rápida que la subida)
  JUMP_FORCE: 560,             // Impulso vertical hacia arriba (vy = -JUMP_FORCE)
  GRAVITY_RISE: 1200,          // Gravedad mientras sube (px/s²)
  GRAVITY_FALL: 1950,          // Gravedad reforzada mientras cae para caída rápida (px/s²)
  TERMINAL_VELOCITY: 850,      // Velocidad máxima de caída vertical (px/s)
  VARIABLE_JUMP_CUTOFF: 0.5,   // Multiplicador al soltar el botón de salto en el aire

  // Tiempos de gracia (segundos)
  COYOTE_TIME: 0.09,           // ~90 ms tras abandonar una plataforma
  JUMP_BUFFER: 0.10,           // ~100 ms para registrar pulsación previa al aterrizaje

  // Rodar (Roll)
  ROLL_SPEED: 420,             // Impulso constante durante la rodada (px/s)
  ROLL_DURATION: 0.38,         // Duración fija (~380 ms)
  ROLL_COOLDOWN: 0.28,         // Cooldown posterior (~280 ms)
  ROLL_INVULNERABLE_DURATION: 0.24, // Ventana inicial de invulnerabilidad (~240 ms)

  // Dimensiones del collider (px)
  HITBOX_WIDTH: 28,
  HITBOX_HEIGHT_STAND: 48,
  HITBOX_HEIGHT_ROLL: 26,
} as const;

/**
 * Estados finitos del jugador (FSM)
 */
export enum PlayerState {
  Idle = 'Idle',
  Walk = 'Walk',
  Run = 'Run',
  Jump = 'Jump',
  Fall = 'Fall',
  Roll = 'Roll',
}

/**
 * Entrada procesada por frame
 */
export interface PlayerInput {
  moveDir: -1 | 0 | 1;   // Dirección horizontal: -1 (izq), 0 (quieto), 1 (der)
  run: boolean;          // Mantener presionado correr
  jump: boolean;         // Pulsación inicial de salto (trigger)
  jumpHeld: boolean;     // Mantener pulsado botón de salto
  roll: boolean;         // Pulsación de rodar (trigger)
  dropThrough?: boolean; // Bajar a través de plataformas one-way (abajo + salto)
}

/**
 * Rectángulo de colisión del entorno (plataformas y paredes)
 */
export interface PlatformCollider {
  x: number;
  y: number;
  w: number;
  h: number;
  isOneWay?: boolean;
}

export class PlayerController {
  // Posición en el centro del personaje
  public x: number;
  public y: number;

  // Velocidades en px/s
  public vx: number = 0;
  public vy: number = 0;

  // Estado FSM
  public state: PlayerState = PlayerState.Idle;

  // Orientación del sprite (true = mira a la derecha, false = mira a la izquierda)
  public facingRight: boolean = true;

  // Estado del suelo
  public isOnFloor: boolean = false;

  // Flag opcional de invulnerabilidad (durante los primeros frames de Roll)
  public isInvulnerable: boolean = false;

  // Altura actual interna del collider
  private _hitboxHeight: number = PLAYER_CONFIG.HITBOX_HEIGHT_STAND;

  // Temporizadores internos (en segundos)
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private rollTimer: number = 0;
  private rollCooldownTimer: number = 0;
  private rollDirection: -1 | 1 = 1;
  private dropThroughTimer: number = 0;

  constructor(initialX: number, initialY: number, facingRight: boolean = true) {
    this.x = initialX;
    this.y = initialY;
    this.facingRight = facingRight;
    this.rollDirection = facingRight ? 1 : -1;
  }

  /**
   * Getter para indicar si el sprite debe dibujarse volteado horizontalmente.
   * flipX = true cuando mira hacia la izquierda.
   */
  public get flipX(): boolean {
    return !this.facingRight;
  }

  /**
   * Altura actual del hitbox (se reduce al rodar).
   */
  public get currentHitboxHeight(): number {
    return this._hitboxHeight;
  }

  public get currentHitboxWidth(): number {
    return PLAYER_CONFIG.HITBOX_WIDTH;
  }

  /**
   * Progreso de la rodada actual de 0.0 (inicio) a 1.0 (final).
   */
  public get rollProgress(): number {
    if (this.rollTimer <= 0) return 0;
    return Math.min(1, Math.max(0, 1 - (this.rollTimer / PLAYER_CONFIG.ROLL_DURATION)));
  }

  /**
   * Modifica la altura del collider manteniendo los pies firmemente anclados al suelo.
   */
  private setHitboxHeight(newHeight: number): void {
    if (this._hitboxHeight === newHeight) return;
    const oldHalf = this._hitboxHeight / 2;
    const newHalf = newHeight / 2;
    // Anclaje en los pies: desplazar el centro Y exactamente la diferencia
    this.y += (oldHalf - newHalf);
    this._hitboxHeight = newHeight;
  }

  /**
   * Actualización principal del frame con paso de tiempo delta (dt en segundos).
   */
  public update(dt: number, input: PlayerInput, platforms: PlatformCollider[]): void {
    if (dt <= 0) return;
    // Prevenir delta times excesivos tras pausas o pérdida de foco
    const clampedDt = Math.min(dt, 0.05);

    // 1. Actualizar temporizadores
    this.updateTimers(clampedDt, input);

    // 2. Gestionar la rodada (Roll)
    const isRolling = this.handleRoll(clampedDt, input);

    if (!isRolling) {
      // 3. Movimiento horizontal instantáneo (SIN inercia)
      this.handleHorizontalMovement(input);

      // 4. Salto con Coyote time, Jump buffer y corte variable
      this.handleJump(input);
    }

    // 5. Aplicar gravedad asimétrica y velocidad terminal
    this.applyGravity(clampedDt);

    // 6. Integración de posición y resolución de colisiones sólida
    this.integrateAndCollide(clampedDt, platforms);

    // 7. Determinar estado FSM final para este frame
    this.updateState(input);
  }

  /**
   * Actualiza los temporizadores de salto, coyote, cooldown de roll y descenso.
   */
  private updateTimers(dt: number, input: PlayerInput): void {
    // Coyote time: se reinicia si está en el suelo, decrece si está en el aire
    if (this.isOnFloor) {
      this.coyoteTimer = PLAYER_CONFIG.COYOTE_TIME;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }

    // Jump buffer: almacena la intención de saltar por ~100 ms
    if (input.jump) {
      this.jumpBufferTimer = PLAYER_CONFIG.JUMP_BUFFER;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    }

    // Cooldown de rodada
    if (this.rollCooldownTimer > 0) {
      this.rollCooldownTimer = Math.max(0, this.rollCooldownTimer - dt);
    }

    // Descenso de plataformas one-way
    if (input.dropThrough) {
      this.dropThroughTimer = 0.25;
    } else if (this.dropThroughTimer > 0) {
      this.dropThroughTimer = Math.max(0, this.dropThroughTimer - dt);
    }
  }

  /**
   * Manejo de la acción de rodar (Roll).
   * Devuelve true si el personaje está actualmente rodando.
   */
  private handleRoll(dt: number, input: PlayerInput): boolean {
    // Si ya está rodando:
    if (this.rollTimer > 0) {
      this.rollTimer -= dt;

      // Velocidad constante y fija en la dirección bloqueada del roll
      this.vx = this.rollDirection * PLAYER_CONFIG.ROLL_SPEED;

      // Ventana inicial de invulnerabilidad
      const elapsed = PLAYER_CONFIG.ROLL_DURATION - this.rollTimer;
      this.isInvulnerable = elapsed <= PLAYER_CONFIG.ROLL_INVULNERABLE_DURATION;

      if (this.rollTimer <= 0) {
        // Roll completado: aplicar cooldown y restaurar altura del hitbox manteniendo los pies
        this.rollTimer = 0;
        this.isInvulnerable = false;
        this.rollCooldownTimer = PLAYER_CONFIG.ROLL_COOLDOWN;
        this.setHitboxHeight(PLAYER_CONFIG.HITBOX_HEIGHT_STAND);
      }
      return true;
    }

    // Iniciar rodada si se cumplen todas las condiciones:
    // - Input de roll activo
    // - En el suelo
    // - Cooldown finalizado
    if (input.roll && this.isOnFloor && this.rollCooldownTimer <= 0) {
      this.rollTimer = PLAYER_CONFIG.ROLL_DURATION;
      // Impulso en la dirección que mira; si se presiona una dirección, usarla
      if (input.moveDir !== 0) {
        this.facingRight = input.moveDir > 0;
      }
      this.rollDirection = this.facingRight ? 1 : -1;
      this.vx = this.rollDirection * PLAYER_CONFIG.ROLL_SPEED;
      this.isInvulnerable = true;
      this.setHitboxHeight(PLAYER_CONFIG.HITBOX_HEIGHT_ROLL);
      this.state = PlayerState.Roll;
      return true;
    }

    this.isInvulnerable = false;
    return false;
  }

  /**
   * Movimiento horizontal directo y seco (arcade, sin aceleración gradual).
   */
  private handleHorizontalMovement(input: PlayerInput): void {
    if (input.moveDir === 0) {
      // Parada en seco inmediata: SIN inercia ni deslizamiento
      this.vx = 0;
    } else {
      // Caminar por defecto; correr solo si se mantiene 'run' Y hay dirección
      const targetSpeed = input.run ? PLAYER_CONFIG.RUN_SPEED : PLAYER_CONFIG.WALK_SPEED;
      this.vx = input.moveDir * targetSpeed;

      // Voltear el sprite según la última dirección (sin voltear si dir == 0)
      this.facingRight = input.moveDir > 0;
      this.rollDirection = input.moveDir;
    }
  }

  /**
   * Sistema de salto con coyote time, jump buffer y corte al soltar.
   */
  private handleJump(input: PlayerInput): void {
    const canJump = this.isOnFloor || this.coyoteTimer > 0;
    const wantsToJump = this.jumpBufferTimer > 0;

    if (wantsToJump && canJump && this.rollTimer <= 0) {
      // Impulso vertical instantáneo
      this.vy = -PLAYER_CONFIG.JUMP_FORCE;
      this.isOnFloor = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
    }

    // Salto variable: si se suelta el botón mientras asciende, cortar la velocidad vertical
    if (!input.jumpHeld && this.vy < 0) {
      this.vy *= PLAYER_CONFIG.VARIABLE_JUMP_CUTOFF;
    }
  }

  /**
   * Gravedad asimétrica: la caída es más rápida que la subida.
   */
  private applyGravity(dt: number): void {
    // Si está en el suelo y no tiene impulso hacia arriba, mantener vy = 0
    if (this.isOnFloor && this.vy >= 0) {
      this.vy = 0;
      return;
    }

    // Seleccionar gravedad según la dirección vertical:
    // Al caer (vy >= 0) se aplica GRAVITY_FALL para una caída ágil y seca
    const currentGravity = this.vy >= 0 ? PLAYER_CONFIG.GRAVITY_FALL : PLAYER_CONFIG.GRAVITY_RISE;
    this.vy += currentGravity * dt;

    // Limitar a la velocidad terminal de caída
    if (this.vy > PLAYER_CONFIG.TERMINAL_VELOCITY) {
      this.vy = PLAYER_CONFIG.TERMINAL_VELOCITY;
    }
  }

  /**
   * Integración de movimiento y resolución sólida de colisiones frente a plataformas del mapa.
   * Evita desbordes y colisiones erróneas con el suelo como si fueran paredes.
   */
  private integrateAndCollide(dt: number, platforms: PlatformCollider[]): void {
    const halfWidth = this.currentHitboxWidth / 2;
    const halfHeight = this.currentHitboxHeight / 2;

    // 1. Movimiento horizontal
    const prevX = this.x;
    this.x += this.vx * dt;

    // Colisión horizontal: SÓLO con paredes sólidas (nunca suelo ni techos)
    for (const plat of platforms) {
      if (plat.isOneWay) continue;

      const platRight = plat.x + plat.w;
      const platBottom = plat.y + plat.h;

      const feetY = this.y + halfHeight;
      const headY = this.y - halfHeight;

      // Si los pies están a nivel o por encima de la superficie, o la cabeza por debajo de la base,
      // NO es una pared lateral — es suelo o techo
      if (feetY <= plat.y + 4 || headY >= platBottom - 4) {
        continue;
      }

      // Colisión contra pared izquierda de plataforma (moviéndose hacia la derecha)
      if (this.vx > 0 && prevX + halfWidth <= plat.x + 2 && this.x + halfWidth > plat.x) {
        this.x = plat.x - halfWidth;
        this.vx = 0;
      }
      // Colisión contra pared derecha de plataforma (moviéndose hacia la izquierda)
      else if (this.vx < 0 && prevX - halfWidth >= platRight - 2 && this.x - halfWidth < platRight) {
        this.x = platRight + halfWidth;
        this.vx = 0;
      }
    }

    // 2. Movimiento vertical
    const prevY = this.y;
    this.y += this.vy * dt;
    this.isOnFloor = false;

    // Colisión vertical
    for (const plat of platforms) {
      const isOneWay = !!plat.isOneWay;
      if (isOneWay && this.dropThroughTimer > 0) continue;

      const platRight = plat.x + plat.w;
      const platBottom = plat.y + plat.h;

      // Debe haber solapamiento horizontal
      const overlapX = (this.x + halfWidth > plat.x + 2) && (this.x - halfWidth < platRight - 2);
      if (!overlapX) continue;

      const prevFeet = prevY + halfHeight;
      const currentFeet = this.y + halfHeight;
      const prevHead = prevY - halfHeight;
      const currentHead = this.y - halfHeight;

      if (isOneWay) {
        // Plataformas one-way: aterrizaje sólo desde arriba cayendo
        if (this.vy >= 0 && prevFeet <= plat.y + 8 && currentFeet >= plat.y) {
          this.y = plat.y - halfHeight;
          this.vy = 0;
          this.isOnFloor = true;
        }
      } else {
        // Plataforma sólida
        // Aterrizaje en el suelo
        if (this.vy >= 0 && prevFeet <= plat.y + 12 && currentFeet >= plat.y) {
          this.y = plat.y - halfHeight;
          this.vy = 0;
          this.isOnFloor = true;
        }
        // Golpe contra techo
        else if (this.vy < 0 && prevHead >= platBottom - 12 && currentHead <= platBottom) {
          this.y = platBottom + halfHeight;
          this.vy = 0;
        }
      }
    }

    // Apoyo continuo: si vy >= 0 y estamos sobre una plataforma superior, fijar al suelo
    if (!this.isOnFloor && this.vy >= 0) {
      const currentFeet = this.y + halfHeight;
      for (const plat of platforms) {
        if (plat.isOneWay && this.dropThroughTimer > 0) continue;
        const platRight = plat.x + plat.w;
        const overlapX = (this.x + halfWidth > plat.x + 2) && (this.x - halfWidth < platRight - 2);
        if (overlapX) {
          // Si los pies están dentro de un margen estrecho (0 a 5px de la superficie)
          if (currentFeet >= plat.y - 1 && currentFeet <= plat.y + 5) {
            this.y = plat.y - halfHeight;
            this.vy = 0;
            this.isOnFloor = true;
            break;
          }
        }
      }
    }

    // 3. Límites estrictos de la arena (impiden desbordes o salir de órbita)
    const minX = halfWidth + 10;
    const maxX = 960 - halfWidth - 10;
    if (this.x < minX) {
      this.x = minX;
      this.vx = 0;
    } else if (this.x > maxX) {
      this.x = maxX;
      this.vx = 0;
    }

    if (this.y > 600) {
      this.y = 500 - halfHeight;
      this.vy = 0;
      this.isOnFloor = true;
    }
  }

  /**
   * Actualiza el estado de la máquina de estados FSM según la física actual.
   */
  private updateState(input: PlayerInput): void {
    // Si está rodando, mantener estado Roll
    if (this.rollTimer > 0) {
      this.state = PlayerState.Roll;
      return;
    }

    // En el aire
    if (!this.isOnFloor) {
      this.state = this.vy < 0 ? PlayerState.Jump : PlayerState.Fall;
      return;
    }

    // En el suelo
    if (input.moveDir === 0 || this.vx === 0) {
      this.state = PlayerState.Idle;
    } else if (input.run) {
      this.state = PlayerState.Run;
    } else {
      this.state = PlayerState.Walk;
    }
  }

  /**
   * Forzar teletransporte o reaparición en posición específica.
   */
  public setPosition(newX: number, newY: number): void {
    this.x = newX;
    this.y = newY;
    this.vx = 0;
    this.vy = 0;
    this.isOnFloor = false;
    this.rollTimer = 0;
    this.isInvulnerable = false;
    this._hitboxHeight = PLAYER_CONFIG.HITBOX_HEIGHT_STAND;
  }
}
