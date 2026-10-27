// =============================================================
// src/entities/Player.ts — Entidad Jugador para Phaser 3
// Movimiento instantáneo, coyote time, jump buffer, dodge roll con invulnerabilidad
// =============================================================

import Phaser from 'phaser';

export const PLAYER_CONFIG = {
  WALK_SPEED: 150,
  RUN_SPEED: 250,
  JUMP_VELOCITY: -440,
  ROLL_SPEED: 340,
  ROLL_DURATION: 400,     // ms
  ROLL_COOLDOWN: 550,     // ms
  INVULN_TIME: 250,       // ms
  COYOTE_TIME: 90,        // ms
  JUMP_BUFFER: 100,       // ms
  SHOOT_COOLDOWN: 220,    // ms
  KNOCKBACK: 90,          // impulso horizontal al disparar
} as const;

export const PLAYER_CONTROLS = {
  P1: {
    left: 'LEFT',
    right: 'RIGHT',
    jump: 'UP',
    roll: 'DOWN',
    melee: 'N',
    shoot: 'M',
    grenade: 'COMMA',
    run: 'PERIOD',
  },
  P2: {
    left: 'A',
    right: 'D',
    jump: 'W',
    roll: 'S',
    melee: 'J',
    shoot: 'K',
    grenade: 'L',
    run: 'Q',
  },
  VS_BOT_COMBINED: {
    left: ['LEFT', 'A'],
    right: ['RIGHT', 'D'],
    jump: ['UP', 'W', 'SPACE'],
    roll: ['DOWN', 'S'],
    melee: ['N', 'J'],
    shoot: ['M', 'K'],
    grenade: ['G', 'COMMA', 'L'],
    run: ['PERIOD', 'Q', 'SHIFT'],
  },
} as const;

export enum PlayerState {
  Idle = 'Idle',
  Walk = 'Walk',
  Run = 'Run',
  Jump = 'Jump',
  Fall = 'Fall',
  Roll = 'Roll',
  Dead = 'Dead',
}

export interface PlayerInputState {
  left: boolean;
  right: boolean;
  jumpPressed: boolean;
  rollPressed: boolean;
  run: boolean;
  meleePressed: boolean;
  shootPressed: boolean;
  grenadePressed: boolean;
}

export interface PlayerInput {
  poll(): PlayerInputState;
}

// -------------------------------------------------------------
// Implementación: KeyboardInput (Phaser.Input.Keyboard)
// -------------------------------------------------------------
export class KeyboardInput implements PlayerInput {
  private keys: Record<string, Phaser.Input.Keyboard.Key> = {};
  private jumpKeyJustDown: boolean = false;
  private rollKeyJustDown: boolean = false;
  private meleeKeyJustDown: boolean = false;
  private shootKeyJustDown: boolean = false;
  private grenadeKeyJustDown: boolean = false;
  private prevJump: boolean = false;
  private prevRoll: boolean = false;
  private prevMelee: boolean = false;
  private prevShoot: boolean = false;
  private prevGrenade: boolean = false;

  constructor(scene: Phaser.Scene, private playerNumber: 1 | 2, private isVsBot: boolean = false) {
    if (!scene.input.keyboard) return;

    const keyboard = scene.input.keyboard;
    const addKey = (code: string | number) => {
      const k = typeof code === 'string' ? Phaser.Input.Keyboard.KeyCodes[code as keyof typeof Phaser.Input.Keyboard.KeyCodes] : code;
      if (k !== undefined) {
        this.keys[String(code)] = keyboard.addKey(k);
      }
    };

    if (this.isVsBot) {
      // J1 acepta ambos esquemas a la vez en modo vsBot
      ['LEFT', 'RIGHT', 'UP', 'DOWN', 'A', 'D', 'W', 'S', 'SPACE', 'N', 'J', 'M', 'K', 'G', 'COMMA', 'L', 'PERIOD', 'Q', 'SHIFT'].forEach(addKey);
    } else if (playerNumber === 1) {
      // J1 en modo 1v1 Local: Flechas + N, M, COMMA, PERIOD
      ['LEFT', 'RIGHT', 'UP', 'DOWN', 'N', 'M', 'COMMA', 'PERIOD'].forEach(addKey);
    } else {
      // J2 en modo 1v1 Local: WASD + J, K, L, Q
      ['A', 'D', 'W', 'S', 'J', 'K', 'L', 'Q'].forEach(addKey);
    }
  }

  private isDown(code: string): boolean {
    return !!this.keys[code]?.isDown;
  }

  public poll(): PlayerInputState {
    let left = false;
    let right = false;
    let jump = false;
    let roll = false;
    let run = false;
    let melee = false;
    let shoot = false;
    let grenade = false;

    if (this.isVsBot) {
      left = this.isDown('LEFT') || this.isDown('A');
      right = this.isDown('RIGHT') || this.isDown('D');
      jump = this.isDown('UP') || this.isDown('W') || this.isDown('SPACE');
      roll = this.isDown('DOWN') || this.isDown('S');
      run = this.isDown('PERIOD') || this.isDown('Q') || this.isDown('SHIFT');
      melee = this.isDown('N') || this.isDown('J');
      shoot = this.isDown('M') || this.isDown('K');
      grenade = this.isDown('G') || this.isDown('COMMA') || this.isDown('L');
    } else if (this.playerNumber === 1) {
      left = this.isDown('LEFT');
      right = this.isDown('RIGHT');
      jump = this.isDown('UP');
      roll = this.isDown('DOWN');
      run = this.isDown('PERIOD');
      melee = this.isDown('N');
      shoot = this.isDown('M');
      grenade = this.isDown('COMMA');
    } else {
      left = this.isDown('A');
      right = this.isDown('D');
      jump = this.isDown('W');
      roll = this.isDown('S');
      run = this.isDown('Q');
      melee = this.isDown('J');
      shoot = this.isDown('K');
      grenade = this.isDown('L');
    }

    const jumpPressed = jump && !this.prevJump;
    const rollPressed = roll && !this.prevRoll;
    const meleePressed = melee && !this.prevMelee;
    const shootPressed = shoot && !this.prevShoot;
    const grenadePressed = grenade && !this.prevGrenade;

    this.prevJump = jump;
    this.prevRoll = roll;
    this.prevMelee = melee;
    this.prevShoot = shoot;
    this.prevGrenade = grenade;

    return {
      left,
      right,
      jumpPressed,
      rollPressed,
      run,
      meleePressed,
      shootPressed,
      grenadePressed,
    };
  }
}

// -------------------------------------------------------------
// Implementación: BotInput (Stub simple de IA para pruebas)
// -------------------------------------------------------------
export class BotInput implements PlayerInput {
  private tickCount: number = 0;

  constructor(
    private selfGetter: () => Player | null,
    private rivalGetter: () => Player | null
  ) {}

  public poll(): PlayerInputState {
    this.tickCount++;
    const self = this.selfGetter();
    const rival = this.rivalGetter();

    if (!self || !rival) {
      return {
        left: false,
        right: false,
        jumpPressed: false,
        rollPressed: false,
        run: false,
        meleePressed: false,
        shootPressed: false,
        grenadePressed: false,
      };
    }

    const dx = rival.x - self.x;
    const dy = rival.y - self.y;
    const dist = Math.abs(dx);

    const left = dx < -25;
    const right = dx > 25;
    const run = dist > 180;
    const jumpPressed = dy < -40 && (this.tickCount % 45 === 0);
    const meleePressed = dist <= 45 && (this.tickCount % 20 === 0);
    const shootPressed = dist > 90 && dist < 320 && (this.tickCount % 35 === 0);
    const rollPressed = dist > 40 && dist < 120 && (this.tickCount % 90 === 0);
    const grenadePressed = dist > 160 && (this.tickCount % 180 === 0);

    return {
      left,
      right,
      jumpPressed,
      rollPressed,
      run,
      meleePressed,
      shootPressed,
      grenadePressed,
    };
  }
}

export interface PlayerOptions {
  textureKey: string;
  speedMultiplier: number;
  maxHp: number;
  input: PlayerInput;
}

// -------------------------------------------------------------
// Clase Player (Extiende Phaser.Physics.Arcade.Sprite)
// -------------------------------------------------------------
export class Player extends Phaser.Physics.Arcade.Sprite {
  public readonly playerNumber: 1 | 2;
  public hp: number;
  public maxHp: number;
  public isInvulnerable: boolean = false;
  public state: PlayerState = PlayerState.Idle;
  public facing: 'left' | 'right' = 'right';
  public speedMultiplier: number;

  private playerInput: PlayerInput;
  private armaActual: string | null = null;

  // Timers internos de física (ms)
  private rollTimer: number = 0;
  private rollCooldownTimer: number = 0;
  private rollDirection: -1 | 1 = 1;
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private shootCooldownTimer: number = 0;

  // ── Sincronización de Animación y Spritesheet (14 frames) ──
  // Base: Assassin (/assets/sprites/player/Assassin_2.png)
  // Para extender a otros personajes (Punk, Gánster, Policía, Mutante, etc.):
  // Cargar su spritesheet (1024x1024, 4x4, 14 frames) y mapear con estos mismos timers.
  public currentFrame: number = 0;
  public frameTimer: number = 0;
  public animationSpeed: number = 1.0;
  public isMovingHorizontally: boolean = false;
  public static readonly SPRITESHEET_COLS = 4;
  public static readonly SPRITESHEET_ROWS = 4;
  public static readonly TOTAL_WALK_FRAMES = 14;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    playerNumber: 1 | 2,
    options: PlayerOptions
  ) {
    super(scene, x, y, options.textureKey);

    this.playerNumber = playerNumber;
    this.maxHp = options.maxHp;
    this.hp = options.maxHp;
    this.speedMultiplier = options.speedMultiplier || 1.0;
    this.playerInput = options.input;

    // Registrar en escena y sistema de físicas Arcade
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configuración física Arcade
    this.setCollideWorldBounds(true);
    this.setBounce(0, 0);
    this.setScale(1.4);

    if (this.body) {
      this.body.setSize(34, 64);
      this.body.setOffset(4, 4);
    }
  }

  public recogerArma(arma: string): void {
    this.armaActual = arma;
  }

  public disparar(): void {
    if (!this.armaActual || this.shootCooldownTimer > 0) return;

    this.shootCooldownTimer = PLAYER_CONFIG.SHOOT_COOLDOWN;
    console.log(`P${this.playerNumber} dispara con ${this.armaActual}`);

    // Knockback sutil opuesto a la dirección que mira
    const knockDir = this.facing === 'right' ? -1 : 1;
    this.setVelocityX(knockDir * PLAYER_CONFIG.KNOCKBACK);
  }

  public golpear(): void {
    console.log(`P${this.playerNumber} ejecuta golpe cuerpo a cuerpo`);
  }

  public recibirDanio(cantidad: number): boolean {
    this.hp = Math.max(0, this.hp - cantidad);
    if (this.hp <= 0) {
      this.hp = 0;
      this.state = PlayerState.Dead;
      this.setVelocity(0, 0);
      return true;
    }
    return false;
  }

  public lanzarGranada(): void {
    console.log(`P${this.playerNumber} lanza granada`);
  }

  public update(_time: number, delta: number): void {
    // 1. Detección de suelo
    const onFloor = (this.body?.blocked.down || this.body?.touching.down) ?? false;

    // 2. Decrementar timers
    if (this.rollCooldownTimer > 0) {
      this.rollCooldownTimer = Math.max(0, this.rollCooldownTimer - delta);
    }
    if (this.shootCooldownTimer > 0) {
      this.shootCooldownTimer = Math.max(0, this.shootCooldownTimer - delta);
    }

    if (onFloor) {
      this.coyoteTimer = PLAYER_CONFIG.COYOTE_TIME;
    } else if (this.coyoteTimer > 0) {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - delta);
    }

    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - delta);
    }

    // 3. Consultar input
    const inState = this.playerInput.poll();

    if (inState.jumpPressed) {
      this.jumpBufferTimer = PLAYER_CONFIG.JUMP_BUFFER;
    }

    // 4. LÓGICA DE RODADA (Dodge Roll)
    if (this.state === PlayerState.Roll) {
      this.rollTimer -= delta;

      // Invulnerabilidad activa durante los primeros INVULN_TIME ms
      const elapsed = PLAYER_CONFIG.ROLL_DURATION - this.rollTimer;
      this.isInvulnerable = elapsed <= PLAYER_CONFIG.INVULN_TIME;

      // Parpadeo de transparencia durante invulnerabilidad
      if (this.isInvulnerable) {
        this.setAlpha(Math.floor(elapsed / 40) % 2 === 0 ? 0.4 : 0.85);
      } else {
        this.setAlpha(1);
      }

      // Impulso horizontal sostenido durante la rodada
      this.setVelocityX(this.rollDirection * PLAYER_CONFIG.ROLL_SPEED);

      if (this.rollTimer <= 0) {
        this.state = onFloor ? PlayerState.Idle : PlayerState.Fall;
        this.isInvulnerable = false;
        this.setAlpha(1);
        this.setVelocityX(0);
      }
      return; // Bloquea caminar, saltar o voltear mientras rueda
    }

    // Iniciar rodada en el suelo
    if (inState.rollPressed && onFloor && this.rollCooldownTimer <= 0) {
      this.state = PlayerState.Roll;
      this.rollTimer = PLAYER_CONFIG.ROLL_DURATION;
      this.rollCooldownTimer = PLAYER_CONFIG.ROLL_COOLDOWN;
      this.isInvulnerable = true;

      // Dirección del roll: si hay tecla pulsada, usarla; si no, la que mira
      if (inState.left) {
        this.rollDirection = -1;
      } else if (inState.right) {
        this.rollDirection = 1;
      } else {
        this.rollDirection = this.facing === 'right' ? 1 : -1;
      }
      return;
    }

    // 5. MOVIMIENTO HORIZONTAL Y SINCRONIZACIÓN DE ANIMACIÓN
    let moveDir: -1 | 0 | 1 = 0;
    if (inState.left && !inState.right) moveDir = -1;
    else if (inState.right && !inState.left) moveDir = 1;

    // Detección de movimiento horizontal activo
    this.isMovingHorizontally = (inState.left || inState.right) && onFloor && moveDir !== 0;

    if (moveDir !== 0) {
      this.facing = moveDir === 1 ? 'right' : 'left';
      this.setFlipX(moveDir === -1);

      const targetSpeed = inState.run ? PLAYER_CONFIG.RUN_SPEED : PLAYER_CONFIG.WALK_SPEED;
      const actualVx = moveDir * targetSpeed * this.speedMultiplier;
      this.setVelocityX(actualVx);

      // Sincronización exacta de velocidad y fotogramas (elimina flotación o deslizamiento):
      // animationSpeed escala directamente con la velocidad actual respecto a la velocidad base
      const currentSpeed = Math.abs(actualVx);
      const baseSpeed = PLAYER_CONFIG.WALK_SPEED;
      this.animationSpeed = currentSpeed > 0 ? currentSpeed / baseSpeed : 1.0;

      // Duración del frame inversamente proporcional a animationSpeed
      const frameDurationMs = 50 / this.animationSpeed;
      this.frameTimer += delta;
      if (this.frameTimer >= frameDurationMs) {
        this.frameTimer = 0;
        this.currentFrame = (this.currentFrame + 1) % Player.TOTAL_WALK_FRAMES;
      }
    } else {
      // Al soltar las teclas, detener la animación y mostrar fotograma estático (idle / frame 0)
      this.setVelocityX(0);
      this.frameTimer = 0;
      this.currentFrame = 0;
      this.animationSpeed = 1.0;
      this.isMovingHorizontally = false;
    }

    // 6. SALTO (Coyote Time + Jump Buffer)
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.setVelocityY(PLAYER_CONFIG.JUMP_VELOCITY);
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
    }

    // 7. ACCIONES
    if (inState.shootPressed) {
      this.disparar();
    }
    if (inState.meleePressed) {
      this.golpear();
    }
    if (inState.grenadePressed) {
      this.lanzarGranada();
    }

    // 8. ACTUALIZAR MÁQUINA DE ESTADOS
    const currentVy = this.body?.velocity.y ?? 0;
    if (!onFloor) {
      this.state = currentVy < 0 ? PlayerState.Jump : PlayerState.Fall;
    } else if (moveDir !== 0) {
      this.state = inState.run ? PlayerState.Run : PlayerState.Walk;
    } else {
      this.state = PlayerState.Idle;
    }
  }
}
