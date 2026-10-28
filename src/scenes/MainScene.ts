// =============================================================
// src/scenes/MainScene.ts — Escena Phaser 3 para superN
// Lee GameMode y personajes del registry y configura jugadores y físicas
// Separación estricta: Player (animado, solo Ninja) vs Bot (estático)
// =============================================================

import Phaser from 'phaser';
import { NinjaPlayer } from '../entities/NinjaPlayer';
import { Player, KeyboardInput, BotInput } from '../entities/Player';
import { GameMode } from '../components/ModeSelectScreen';
import { getWorldConfig, WorldConfig } from '../game/WorldData';
import { BotFaction, getBotArchetype } from '../game/BotData';

export class MainScene extends Phaser.Scene {
  private p1!: NinjaPlayer;
  private p2!: NinjaPlayer | Player;
  private platformsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private worldConfig!: WorldConfig;

  constructor() {
    super({ key: 'MainScene' });
  }

  public preload(): void {
    // Protagonista único Ninja
    this.load.image('ninja_sprite', '/assets/sprites/player/ninja.png');
    this.load.spritesheet('ninja_walk', '/assets/sprites/player/ninja_walk.png', {
      frameWidth: 170,
      frameHeight: 290,
    });
    this.load.spritesheet('ninja_run', '/assets/sprites/player/ninja_run.png', {
      frameWidth: 170,
      frameHeight: 290,
    });
    this.load.spritesheet('ninja_roll', '/assets/sprites/player/ninja_roll.png', {
      frameWidth: 200,
      frameHeight: 290,
    });
    this.load.spritesheet('ninja_jump', '/assets/sprites/player/ninja_jump.png', {
      frameWidth: 200,
      frameHeight: 290,
    });
    this.load.spritesheet('ninja_melee', '/assets/sprites/player/ninja_melee.png', {
      frameWidth: 220,
      frameHeight: 290,
    });
    this.load.spritesheet('one_hand_attack', '/assets/sprites/player/one_hand_attack.png', {
      frameWidth: 220,
      frameHeight: 290,
    });
    this.load.spritesheet('two_hand_attack', '/assets/sprites/player/two_hand_attack.png', {
      frameWidth: 220,
      frameHeight: 290,
    });
    this.load.spritesheet('pistol_shoot', '/assets/sprites/player/pistol_shoot.png', {
      frameWidth: 220,
      frameHeight: 290,
    });
    this.load.spritesheet('rifle_shoot', '/assets/sprites/player/rifle_shoot.png', {
      frameWidth: 256,
      frameHeight: 290,
    });
    this.load.spritesheet('throw_up', '/assets/sprites/player/throw_up.png', {
      frameWidth: 256,
      frameHeight: 290,
    });
    this.load.image('bot_sprite', '/assets/sprites/bot/thug.png');
    this.load.image('platform_block', '/assets/backgrounds/warehouse.jpg');
  }

  public create(): void {
    // 1. Leer GameMode y configuraciones seleccionadas del registry de Phaser
    const mode = (this.registry.get('gameMode') as GameMode) || 'vsBot';
    const p1Faction = BotFaction.Ninja;
    const p2Faction = mode === 'local1v1'
      ? BotFaction.Ninja
      : ((this.registry.get('rivalFaction') as BotFaction) || BotFaction.Thug);
    const worldId = (this.registry.get('worldId') as string) || 'classic';

    this.worldConfig = getWorldConfig(worldId);
    const p1Arch = getBotArchetype(p1Faction);
    const p2Arch = getBotArchetype(p2Faction);

    // Animación de caminar de 6 fotogramas para el Ninja
    if (!this.anims.exists('ninja_walk')) {
      this.anims.create({
        key: 'ninja_walk',
        frames: this.anims.generateFrameNumbers('ninja_walk', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1,
      });
    }

    // Animación de carrera de 6 fotogramas para el Ninja
    if (!this.anims.exists('ninja_run')) {
      this.anims.create({
        key: 'ninja_run',
        frames: this.anims.generateFrameNumbers('ninja_run', { start: 0, end: 5 }),
        frameRate: 14,
        repeat: -1,
      });
    }

    // Animación de rodada (roll) de 7 fotogramas para el Ninja (sin loop)
    if (!this.anims.exists('ninja_roll')) {
      this.anims.create({
        key: 'ninja_roll',
        frames: this.anims.generateFrameNumbers('ninja_roll', { start: 0, end: 6 }),
        frameRate: 20,
        repeat: 0,
      });
    }

    // Animación de salto de 6 fotogramas en 2 filas x 3 columnas para el Ninja
    if (!this.anims.exists('ninja_jump')) {
      this.anims.create({
        key: 'ninja_jump',
        frames: this.anims.generateFrameNumbers('ninja_jump', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: 0,
      });
    }

    // Animaciones del Combo Melee del Ninja con tecla única 'N' (One Shot, 3 Filas):
    // Fila 1: Puñetazo (frames 0 a 5)
    if (!this.anims.exists('ninja_punch')) {
      this.anims.create({
        key: 'ninja_punch',
        frames: this.anims.generateFrameNumbers('ninja_melee', { start: 0, end: 5 }),
        frameRate: 18,
        repeat: 0,
      });
    }

    // Fila 2: Patada (frames 6 a 11)
    if (!this.anims.exists('ninja_kick')) {
      this.anims.create({
        key: 'ninja_kick',
        frames: this.anims.generateFrameNumbers('ninja_melee', { start: 6, end: 11 }),
        frameRate: 18,
        repeat: 0,
      });
    }

    // Fila 3: Uppercut (frames 12 a 17)
    if (!this.anims.exists('ninja_uppercut')) {
      this.anims.create({
        key: 'ninja_uppercut',
        frames: this.anims.generateFrameNumbers('ninja_melee', { start: 12, end: 17 }),
        frameRate: 18,
        repeat: 0,
      });
    }

    // Animación de Ataque a una mano de 5 fotogramas (rápido, One Shot)
    if (!this.anims.exists('one_hand_attack')) {
      this.anims.create({
        key: 'one_hand_attack',
        frames: this.anims.generateFrameNumbers('one_hand_attack', { start: 0, end: 4 }),
        frameRate: 24, // Mayor velocidad que los puños
        repeat: 0,
      });
    }

    // Animación de Ataque a dos manos (Golpe pesado) de 6 fotogramas (más lento, One Shot)
    if (!this.anims.exists('two_hand_attack')) {
      this.anims.create({
        key: 'two_hand_attack',
        frames: this.anims.generateFrameNumbers('two_hand_attack', { start: 0, end: 5 }),
        frameRate: 14, // Más lento por ser golpe pesado
        repeat: 0,
      });
    }

    // Animación de Ataque a una mano (Pistolas) de 4 fotogramas (Frame 3: retroceso/recarga)
    if (!this.anims.exists('pistol_shoot')) {
      this.anims.create({
        key: 'pistol_shoot',
        frames: this.anims.generateFrameNumbers('pistol_shoot', { start: 0, end: 3 }),
        frameRate: 12,
        repeat: 0,
      });
    }

    // Animación de Ataque a dos manos (Rifles/Escopetas) de 4 fotogramas (Frame 3: fuerte retroceso)
    if (!this.anims.exists('rifle_shoot')) {
      this.anims.create({
        key: 'rifle_shoot',
        frames: this.anims.generateFrameNumbers('rifle_shoot', { start: 0, end: 3 }),
        frameRate: 12,
        repeat: 0,
      });
    }

    // Animación de Lanzamiento (throw_up) de 5 fotogramas (Frame 3: soltar objeto)
    if (!this.anims.exists('throw_up')) {
      this.anims.create({
        key: 'throw_up',
        frames: this.anims.generateFrameNumbers('throw_up', { start: 0, end: 4 }),
        frameRate: 14,
        repeat: 0,
      });
    }

    // 2. Construir plataformas estáticas según el mundo elegido
    this.platformsGroup = this.physics.add.staticGroup();
    this.worldConfig.platforms.forEach((plat) => {
      const rect = this.add.rectangle(
        plat.x + plat.w / 2,
        plat.y + plat.h / 2,
        plat.w,
        plat.h,
        0x334155
      );
      this.physics.add.existing(rect, true);
      this.platformsGroup.add(rect);
    });

    const spawnP1 = this.worldConfig.spawns[0] || { x: 200, y: 460 };
    const spawnP2 = this.worldConfig.spawns[1] || { x: 760, y: 460 };

    // 3. Crear J1 (siempre Ninja) con KeyboardInput
    const p1Input = new KeyboardInput(this, 1, mode === 'vsBot');
    this.p1 = new NinjaPlayer(this, spawnP1.x, spawnP1.y, 1, {
      textureKey: 'ninja_sprite',
      speedMultiplier: p1Arch.speedModifier,
      maxHp: 100,
      input: p1Input,
    });

    // 4. Crear J2 (NinjaPlayer si es local1v1, o Bot estático si es vsBot)
    if (mode === 'local1v1') {
      const p2Input = new KeyboardInput(this, 2, false);
      this.p2 = new NinjaPlayer(this, spawnP2.x, spawnP2.y, 2, {
        textureKey: 'ninja_sprite',
        speedMultiplier: p2Arch.speedModifier,
        maxHp: 100,
        input: p2Input,
      });
    } else {
      const botInput = new BotInput(
        () => this.p2 as Player,
        () => this.p1 as unknown as Player
      );
      this.p2 = new Player(this, spawnP2.x, spawnP2.y, 2, {
        textureKey: 'bot_sprite',
        speedMultiplier: p2Arch.speedModifier,
        maxHp: p2Arch.maxHealth,
        input: botInput,
      });
    }

    // 5. Añadir colliders con las plataformas del mundo
    this.physics.add.collider(this.p1, this.platformsGroup);
    this.physics.add.collider(this.p2, this.platformsGroup);
  }

  public override update(time: number, delta: number): void {
    if (this.p1) this.p1.update(time, delta);
    if (this.p2) this.p2.update(time, delta);
  }
}
