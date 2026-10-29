// =============================================================
// NinjaPlayer.ts — Prefab de Jugador Exclusivo del Ninja para Phaser Arcade
// Mantiene estricta separación: Player (animado, solo Ninja) vs Bot (estático)
// =============================================================

import Phaser from 'phaser';
import { NINJA_CONFIG, NinjaState } from '../game/NinjaController';
import { isOneHandWeapon, isPistolWeapon, isRifleWeapon, isSwordWeapon, isThrowableWeapon, isTwoHandWeapon, WeaponType } from '../game/WeaponData';
import { PlayerInput } from './Player';

export interface NinjaPlayerOptions {
  textureKey?: string;
  speedMultiplier?: number;
  maxHp?: number;
  input: PlayerInput;
}

/**
 * Entidad exclusiva del Ninja (Protagonista único).
 * Aislada sin heredar de otros personajes para garantizar que su movimiento
 * y comportamiento permanezcan independientes.
 */
export class NinjaPlayer extends Phaser.Physics.Arcade.Sprite {
  public readonly playerNumber: 1 | 2;
  public hp: number;
  public maxHp: number;
  public isInvulnerable: boolean = false;
  public isPistolShooting: boolean = false;
  public isRifleShooting: boolean = false;
  public isThrowing: boolean = false;
  public hasHeavyRifleEquipped: boolean = false;
  public state: NinjaState = NinjaState.Idle;
  public characterState: string = 'desarmado';
  public facing: 'left' | 'right' = 'right';
  public speedMultiplier: number;

  private ninjaInput: PlayerInput;
  private currentWeapon: string | null = null;

  // Timers internos de física (ms)
  private rollTimer: number = 0;
  private rollCooldownTimer: number = 0;
  private rollDirection: -1 | 1 = 1;
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private shootCooldownTimer: number = 0;
  private pistolShootTimer: number = 0;
  private rifleShootTimer: number = 0;
  private throwTimer: number = 0;
  private throwHasReleased: boolean = false;

  // Combo melee Ninja (3 Filas: Puñetazo, Patada, Uppercut)
  private attackTimer: number = 0;
  private comboStep: number = 0;
  private comboWindowTimer: number = 0;
  private comboBuffered: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    playerNumber: 1 | 2,
    options: NinjaPlayerOptions
  ) {
    // El sprite oficial del Ninja: pixel art negro con detalles naranja
    super(scene, x, y, options.textureKey || 'ninja_sprite');

    this.playerNumber = playerNumber;
    this.maxHp = options.maxHp ?? 100;
    this.hp = this.maxHp;
    this.speedMultiplier = options.speedMultiplier ?? 1.15;
    this.ninjaInput = options.input;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setBounce(0, 0);
    this.setScale(1.4);

    if (this.body) {
      this.body.setSize(NINJA_CONFIG.HITBOX_WIDTH, NINJA_CONFIG.HITBOX_HEIGHT_STAND);
      this.body.setOffset(4, 4);
    }
  }

  public equipWeapon(weaponName: string): void {
    this.currentWeapon = weaponName;
    if (isOneHandWeapon(weaponName as WeaponType)) {
      this.characterState = 'arma_una_mano';
      this.hasHeavyRifleEquipped = false;
    } else if (isRifleWeapon(weaponName as WeaponType)) {
      this.characterState = 'arma_dos_manos';
      this.hasHeavyRifleEquipped = true;
    } else if (isTwoHandWeapon(weaponName as WeaponType)) {
      this.characterState = 'arma_dos_manos';
      this.hasHeavyRifleEquipped = false;
    } else if (isPistolWeapon(weaponName as WeaponType)) {
      this.characterState = 'arma_una_mano';
      this.hasHeavyRifleEquipped = false;
    } else if (isSwordWeapon(weaponName as WeaponType)) {
      this.characterState = 'espada';
      this.hasHeavyRifleEquipped = false;
    } else {
      this.characterState = 'desarmado';
      this.hasHeavyRifleEquipped = false;
    }
  }

  public takeDamage(amount: number): boolean {
    if (this.isInvulnerable) return false;
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) {
      this.hp = 0;
      this.state = NinjaState.Dead;
      this.setVelocity(0, 0);
      return true;
    }
    return false;
  }

  public update(_time: number, delta: number): void {
    const onFloor = (this.body?.blocked.down || this.body?.touching.down) ?? false;
    const input = this.ninjaInput.poll();

    // Actualización de buffers temporales
    if (this.coyoteTimer > 0) this.coyoteTimer -= delta;
    if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= delta;
    if (this.rollCooldownTimer > 0) this.rollCooldownTimer -= delta;
    if (this.shootCooldownTimer > 0) this.shootCooldownTimer -= delta;

    if (input.jumpPressed) {
      this.jumpBufferTimer = 100; // ms
    }

    // Actualización de ventana de combo melee Ninja (tecla N)
    if (this.comboWindowTimer > 0) {
      this.comboWindowTimer -= delta;
      if (this.comboWindowTimer <= 0 && this.state !== NinjaState.Attack) {
        this.comboStep = 0;
      }
    }

    // Lógica de disparo con pistolas a una mano (pistol_shoot - 4 frames)
    // Permite disparar caminando (velocidad de caminar, no correr) y orienta según dirección
    if (this.isPistolShooting) {
      this.pistolShootTimer -= delta;

      const moveDir = input.left && !input.right ? -1 : input.right && !input.left ? 1 : 0;
      if (moveDir !== 0) {
        this.facing = moveDir > 0 ? 'right' : 'left';
        this.setVelocityX(moveDir * NINJA_CONFIG.WALK_SPEED * this.speedMultiplier);
      } else {
        this.setVelocityX(0);
      }
      this.setFlipX(this.facing === 'left');

      if (this.anims?.animationManager?.exists('pistol_shoot') && this.anims.currentAnim?.key !== 'pistol_shoot') {
        this.anims.play('pistol_shoot', true);
      }

      if (this.pistolShootTimer <= 0) {
        this.isPistolShooting = false;
        if (moveDir !== 0 && onFloor) {
          this.state = NinjaState.Walk;
          if (this.anims?.animationManager?.exists('ninja_walk')) {
            this.anims.play('ninja_walk', true);
          }
        } else {
          this.state = onFloor ? NinjaState.Idle : NinjaState.Fall;
          this.anims?.stop();
          this.setTexture('ninja_sprite');
        }
      }
      return;
    }

    // Lógica de disparo con rifles/escopetas a dos manos (rifle_shoot - 4 frames con retroceso en frame 3)
    if (this.isRifleShooting) {
      this.rifleShootTimer -= delta;

      const moveDir = input.left && !input.right ? -1 : input.right && !input.left ? 1 : 0;
      if (moveDir !== 0) {
        this.facing = moveDir > 0 ? 'right' : 'left';
        this.setVelocityX(moveDir * NINJA_CONFIG.WALK_SPEED * 0.82 * this.speedMultiplier);
      } else {
        this.setVelocityX(0);
      }
      this.setFlipX(this.facing === 'left');

      if (this.anims?.animationManager?.exists('rifle_shoot') && this.anims.currentAnim?.key !== 'rifle_shoot') {
        this.anims.play('rifle_shoot', true);
      }

      if (this.rifleShootTimer <= 0) {
        this.isRifleShooting = false;
        if (moveDir !== 0 && onFloor) {
          this.state = NinjaState.Walk;
          if (this.anims?.animationManager?.exists('ninja_walk')) {
            this.anims.play('ninja_walk', true);
          }
        } else {
          this.state = onFloor ? NinjaState.Idle : NinjaState.Fall;
          this.anims?.stop();
          this.setTexture('ninja_sprite');
        }
      }
      return;
    }

    // Lógica de lanzamiento de objetos arrojadizos (throw_up - 5 frames, suelta en frame 3)
    // Movimiento: El personaje se detiene mientras ejecuta el lanzamiento
    if (this.isThrowing) {
      this.throwTimer -= delta;
      this.setVelocityX(0);

      const moveDir = input.left && !input.right ? -1 : input.right && !input.left ? 1 : 0;
      if (moveDir !== 0) {
        this.facing = moveDir > 0 ? 'right' : 'left';
      }
      this.setFlipX(this.facing === 'left');

      if (this.anims?.animationManager?.exists('throw_up') && this.anims.currentAnim?.key !== 'throw_up') {
        this.anims.play('throw_up', true);
      }

      if (this.throwTimer <= 0) {
        this.isThrowing = false;
        this.state = onFloor ? NinjaState.Idle : NinjaState.Fall;
        this.anims?.stop();
        this.setTexture('ninja_sprite');
      }
      return;
    }

    // Lógica de ataque melee / arma a una mano / arma a dos manos Ninja (One-Shot, bloqueo de movimiento)
    if (this.state === NinjaState.Attack) {
      this.setVelocityX(0);
      this.attackTimer -= delta;

      const isSword = this.currentWeapon && isSwordWeapon(this.currentWeapon as WeaponType);
      const isTwoHand = this.currentWeapon && isTwoHandWeapon(this.currentWeapon as WeaponType);
      const isOneHand = this.currentWeapon && isOneHandWeapon(this.currentWeapon as WeaponType);
      const animKey = isSword
        ? 'one_hand_attack'
        : isTwoHand
        ? 'two_hand_attack'
        : isOneHand
        ? 'one_hand_attack'
        : (this.comboStep === 0 ? 'ninja_punch' : this.comboStep === 1 ? 'ninja_kick' : 'ninja_uppercut');

      if ((isSword || (!isTwoHand && !isOneHand)) && input.meleePressed && this.comboStep < 2) {
        this.comboBuffered = true;
      }

      if (this.anims?.animationManager?.exists(animKey) && this.anims.currentAnim?.key !== animKey) {
        this.anims.play(animKey, true);
      }

      if (this.attackTimer <= 0) {
        if ((isSword || (!isTwoHand && !isOneHand)) && this.comboBuffered && this.comboStep < 2) {
          this.comboStep++;
          this.attackTimer = isSword ? 220 : 330;
          this.comboBuffered = false;
          this.comboWindowTimer = 450;
          const nextAnimKey = isSword
            ? 'one_hand_attack'
            : (this.comboStep === 1 ? 'ninja_kick' : 'ninja_uppercut');
          if (this.anims?.animationManager?.exists(nextAnimKey)) {
            this.anims.play(nextAnimKey, true);
          }
        } else {
          this.state = onFloor ? NinjaState.Idle : NinjaState.Fall;
          this.anims?.stop();
          this.setTexture('ninja_sprite');
          if ((!isSword && (isTwoHand || isOneHand)) || this.comboStep >= 2) {
            this.comboStep = 0;
            this.comboWindowTimer = 0;
          } else {
            this.comboStep++;
            this.comboWindowTimer = 450;
          }
        }
      }
      return;
    }

    // ─────────────────────────────────────────────────────────
    // ⚠️ REGLA DE ORO - TECLAS SEPARADAS (NO MEZCLAR)
    // 1. Tecla "," (coma) o "L": EXCLUSIVA para lanzar bombas/granadas (throw_up)
    // 2. Tecla "M": EXCLUSIVA para disparar armas de fuego (pistolas, rifles, escopetas)
    // 3. Tecla "N": EXCLUSIVA para golpes cuerpo a cuerpo (puños, espadas, hachas)
    // ─────────────────────────────────────────────────────────

    // 1. LANZAR BOMBAS / GRANADAS (Tecla ',' / 'L' / 'G')
    if (input.grenadePressed && onFloor && this.state !== NinjaState.Roll && !this.isThrowing) {
      this.isThrowing = true;
      this.throwTimer = 340;
      this.throwHasReleased = false;
      this.setVelocityX(0); // El personaje se detiene mientras ejecuta el lanzamiento
      const moveDir = input.left && !input.right ? -1 : input.right && !input.left ? 1 : 0;
      if (moveDir !== 0) {
        this.facing = moveDir > 0 ? 'right' : 'left';
      }
      this.setFlipX(this.facing === 'left');
      if (this.anims?.animationManager?.exists('throw_up')) {
        this.anims.play('throw_up', true);
      }
      return;
    }

    // 2. DISPARAR ARMAS DE FUEGO (Tecla 'M' / 'K')
    if (input.shootPressed && onFloor && this.state !== NinjaState.Roll && !this.isThrowing) {
      const isRifle = this.currentWeapon && isRifleWeapon(this.currentWeapon as WeaponType);
      const isPistol = this.currentWeapon && isPistolWeapon(this.currentWeapon as WeaponType);

      if (isRifle && !this.isRifleShooting) {
        this.isRifleShooting = true;
        this.rifleShootTimer = 340;
        const moveDir = input.left && !input.right ? -1 : input.right && !input.left ? 1 : 0;
        if (moveDir !== 0) {
          this.facing = moveDir > 0 ? 'right' : 'left';
          this.setVelocityX(moveDir * NINJA_CONFIG.WALK_SPEED * 0.82 * this.speedMultiplier);
        }
        this.setFlipX(this.facing === 'left');
        if (this.anims?.animationManager?.exists('rifle_shoot')) {
          this.anims.play('rifle_shoot', true);
        }
        return;
      }

      if (isPistol && !this.isPistolShooting) {
        this.isPistolShooting = true;
        this.pistolShootTimer = 330;
        const moveDir = input.left && !input.right ? -1 : input.right && !input.left ? 1 : 0;
        if (moveDir !== 0) {
          this.facing = moveDir > 0 ? 'right' : 'left';
          this.setVelocityX(moveDir * NINJA_CONFIG.WALK_SPEED * this.speedMultiplier);
        }
        this.setFlipX(this.facing === 'left');
        if (this.anims?.animationManager?.exists('pistol_shoot')) {
          this.anims.play('pistol_shoot', true);
        }
        return;
      }
    }

    // 3. GOLPES CUERPO A CUERPO (Tecla 'N' / 'J')
    if (input.meleePressed && onFloor && this.state !== NinjaState.Roll && !this.isThrowing) {
      const isTwoHand = this.currentWeapon && isTwoHandWeapon(this.currentWeapon as WeaponType);
      const isOneHand = this.currentWeapon && isOneHandWeapon(this.currentWeapon as WeaponType);

      this.state = NinjaState.Attack;

      if (isTwoHand) {
        // Ataque a dos manos (Golpe pesado): One Shot, más lento (450ms) y contundente
        this.comboStep = 0;
        this.attackTimer = 450;
        this.comboBuffered = false;
        this.setVelocityX(0);
        if (this.anims?.animationManager?.exists('two_hand_attack')) {
          this.anims.play('two_hand_attack', true);
        }
      } else if (isOneHand) {
        // Ataque a una mano: velocidad mayor (200ms) y One Shot
        this.comboStep = 0;
        this.attackTimer = 200;
        this.comboBuffered = false;
        this.setVelocityX(0);
        if (this.anims?.animationManager?.exists('one_hand_attack')) {
          this.anims.play('one_hand_attack', true);
        }
      } else {
        // Combo Melee desarmado / puñetazo
        this.attackTimer = 330;
        this.comboBuffered = false;
        this.setVelocityX(0);
        const animKey = this.comboStep === 0 ? 'ninja_punch' : this.comboStep === 1 ? 'ninja_kick' : 'ninja_uppercut';
        if (this.anims?.animationManager?.exists(animKey)) {
          this.anims.play(animKey, true);
        }
      }
      return;
    }

    // Lógica exclusiva de Rodada / Evasión Ninja (7 frames sin loop)
    if (this.state === NinjaState.Roll) {
      this.rollTimer -= delta;
      this.isInvulnerable = (NINJA_CONFIG.ROLL_DURATION * 1000 - this.rollTimer) <= (NINJA_CONFIG.ROLL_INVULNERABLE_DURATION * 1000);
      this.setVelocityX(this.rollDirection * NINJA_CONFIG.ROLL_SPEED * this.speedMultiplier);

      // Reproducir animación 'ninja_roll' de 7 fotogramas una sola vez
      if (this.anims?.animationManager?.exists('ninja_roll') && this.anims.currentAnim?.key !== 'ninja_roll') {
        this.anims.play('ninja_roll', true);
      }

      if (this.rollTimer <= 0) {
        this.rollTimer = 0;
        this.isInvulnerable = false;
        if (this.body) {
          this.body.setSize(NINJA_CONFIG.HITBOX_WIDTH, NINJA_CONFIG.HITBOX_HEIGHT_STAND);
        }
        this.rollCooldownTimer = NINJA_CONFIG.ROLL_COOLDOWN * 1000;

        // Transición: al terminar la rodada, vuelve a idle o walk/run según las teclas que mantenga
        const moveDir = input.left && !input.right ? -1 : input.right && !input.left ? 1 : 0;
        if (moveDir !== 0 && onFloor) {
          if (moveDir === this.rollDirection) {
            this.setVelocityX(this.rollDirection * (NINJA_CONFIG.RUN_THRESHOLD + 20) * this.speedMultiplier);
            this.state = NinjaState.Run;
            if (this.anims?.animationManager?.exists('ninja_run')) {
              this.anims.play('ninja_run', true);
            }
          } else {
            this.setVelocityX(moveDir * NINJA_CONFIG.INITIAL_WALK_SPEED * this.speedMultiplier);
            this.state = NinjaState.Walk;
            if (this.anims?.animationManager?.exists('ninja_walk')) {
              this.anims.play('ninja_walk', true);
            }
          }
        } else {
          this.state = onFloor ? NinjaState.Idle : NinjaState.Fall;
          this.anims?.stop();
          this.setTexture('ninja_sprite');
        }
      }
    } else {
      // Iniciar rodada
      if (input.rollPressed && this.rollCooldownTimer <= 0 && onFloor) {
        this.state = NinjaState.Roll;
        this.rollTimer = NINJA_CONFIG.ROLL_DURATION * 1000;
        const dir = input.left ? -1 : input.right ? 1 : (this.facing === 'right' ? 1 : -1);
        this.rollDirection = dir;
        this.facing = dir > 0 ? 'right' : 'left';
        this.setFlipX(this.facing === 'left');
        this.isInvulnerable = true;
        if (this.body) {
          this.body.setSize(NINJA_CONFIG.HITBOX_WIDTH, NINJA_CONFIG.HITBOX_HEIGHT_ROLL);
        }
        this.setVelocityX(this.rollDirection * NINJA_CONFIG.ROLL_SPEED * this.speedMultiplier);
        if (this.anims?.animationManager?.exists('ninja_roll')) {
          this.anims.play('ninja_roll', true);
        }
      } else {
        // Movimiento horizontal autónomo del Ninja con inercia progresiva estilo Superfighters
        const dt = delta / 1000;
        const currentVx = this.body?.velocity.x ?? 0;
        const moveDir = input.left && !input.right ? -1 : input.right && !input.left ? 1 : 0;

        if (moveDir === 0) {
          // Al soltar las teclas: frena gradualmente con inercia
          if (Math.abs(currentVx) > 0) {
            const sign = Math.sign(currentVx);
            const nextSpeed = Math.abs(currentVx) - NINJA_CONFIG.DECELERATION * dt;
            if (nextSpeed <= 10) {
              this.setVelocityX(0);
            } else {
              this.setVelocityX(sign * nextSpeed);
            }
          }
        } else {
          // Tecla de dirección pulsada: orientar personaje (flip_h)
          this.facing = moveDir > 0 ? 'right' : 'left';

          if (currentVx !== 0 && Math.sign(currentVx) !== moveDir) {
            // Derrape al invertir bruscamente de sentido
            const speed = Math.abs(currentVx) - NINJA_CONFIG.TURN_DECELERATION * dt;
            if (speed <= 0) {
              this.setVelocityX(moveDir * NINJA_CONFIG.INITIAL_WALK_SPEED * this.speedMultiplier);
            } else {
              this.setVelocityX(Math.sign(currentVx) * speed);
            }
          } else {
            // Arrancar a paso lento inicial y acelerar progresivamente
            if (Math.abs(currentVx) < NINJA_CONFIG.INITIAL_WALK_SPEED * this.speedMultiplier) {
              this.setVelocityX(moveDir * NINJA_CONFIG.INITIAL_WALK_SPEED * this.speedMultiplier);
            }
            const currentSpeed = Math.abs(this.body?.velocity.x ?? 0);
            const targetSpeed = (this.hasHeavyRifleEquipped ? NINJA_CONFIG.WALK_SPEED * 0.82 : NINJA_CONFIG.RUN_SPEED) * this.speedMultiplier;
            const nextSpeed = Math.min(targetSpeed, currentSpeed + NINJA_CONFIG.ACCELERATION * dt);
            this.setVelocityX(moveDir * nextSpeed);
          }
        }
      }
    }

    // Salto Ninja con Coyote Time y Buffer
    if (this.state !== NinjaState.Roll) {
      const canJump = (onFloor || this.coyoteTimer > 0) && this.jumpBufferTimer > 0;
      if (canJump) {
        this.setVelocityY(-NINJA_CONFIG.JUMP_FORCE);
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.state = NinjaState.Jump;
      }
    }

    // Estado visual, animaciones sincronizadas de caminar y correr (6 frames) y caída
    if (this.state !== NinjaState.Roll) {
      const currentSpeed = Math.abs(this.body?.velocity.x ?? 0);
      const runThreshold = NINJA_CONFIG.RUN_THRESHOLD * this.speedMultiplier;

      if (!onFloor) {
        const vy = this.body?.velocity.y ?? 0;
        this.state = vy < 0 ? NinjaState.Jump : NinjaState.Fall;

        // Reproducir animación 'ninja_jump' de 6 fotogramas (pausando en el frame de caída si sigue en el aire)
        if (this.anims?.animationManager?.exists('ninja_jump')) {
          if (vy < 320) {
            if (this.anims.currentAnim?.key !== 'ninja_jump' || !this.anims.isPlaying) {
              this.anims.play('ninja_jump', true);
            }
          } else {
            // Mantener el frame 4 (caída libre) mientras continúe en el aire
            if (this.anims.currentAnim?.key === 'ninja_jump') {
              this.anims.pause();
              this.setFrame(4);
            }
          }
        }
      } else if (currentSpeed > 10) {
        if (!this.hasHeavyRifleEquipped && currentSpeed >= runThreshold) {
          this.state = NinjaState.Run;
          // Reproducir animación 'ninja_run' de 6 fotogramas
          if (this.anims?.animationManager?.exists('ninja_run')) {
            this.anims.play('ninja_run', true);
          } else if (this.anims?.animationManager?.exists('ninja_walk')) {
            this.anims.play('ninja_walk', true);
          }
        } else {
          this.state = NinjaState.Walk;
          // Reproducir animación 'ninja_walk' de 6 fotogramas
          if (this.anims?.animationManager?.exists('ninja_walk')) {
            this.anims.play('ninja_walk', true);
          }
        }
      } else {
        // Al soltar el teclado o frenar por completo, detener animación y volver a idle
        this.state = NinjaState.Idle;
        this.anims?.stop();
        this.setTexture('ninja_sprite');
      }
      // Invertir el sprite horizontalmente (flip_h) según la dirección del movimiento
      this.setFlipX(this.facing === 'left');
    }
  }
}
