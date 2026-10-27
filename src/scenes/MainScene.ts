// =============================================================
// src/scenes/MainScene.ts — Escena Phaser 3 para superN
// Lee GameMode y personajes del registry y configura jugadores y físicas
// =============================================================

import Phaser from 'phaser';
import { Player, KeyboardInput, BotInput } from '../entities/Player';
import { GameMode } from '../components/ModeSelectScreen';
import { getWorldConfig, WorldConfig } from '../game/WorldData';
import { BotFaction, getBotArchetype } from '../game/BotData';

export class MainScene extends Phaser.Scene {
  private p1!: Player;
  private p2!: Player;
  private platformsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private worldConfig!: WorldConfig;

  constructor() {
    super({ key: 'MainScene' });
  }

  public preload(): void {
    // Los sprites y texturas se precargan o asocian mediante atlas o paths estáticos
    this.load.image('p1_sprite', '/assets/sprites/player/Assassin_2.png');
    this.load.image('bot_sprite', '/assets/sprites/bot/Agent_2.png');
    this.load.image('platform_block', '/assets/backgrounds/warehouse.jpg');
  }

  public create(): void {
    // 1. Leer GameMode y configuraciones seleccionadas del registry de Phaser
    const mode = (this.registry.get('gameMode') as GameMode) || 'vsBot';
    const p1Faction = (this.registry.get('playerFaction') as BotFaction) || BotFaction.Assassin;
    const p2Faction = (this.registry.get('rivalFaction') as BotFaction) || BotFaction.Thug;
    const worldId = (this.registry.get('worldId') as string) || 'classic';

    this.worldConfig = getWorldConfig(worldId);
    const p1Arch = getBotArchetype(p1Faction);
    const p2Arch = getBotArchetype(p2Faction);

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

    // 3. Crear J1 con KeyboardInput
    const p1Input = new KeyboardInput(this, 1, mode === 'vsBot');
    this.p1 = new Player(this, spawnP1.x, spawnP1.y, 1, {
      textureKey: 'p1_sprite',
      speedMultiplier: p1Arch.speedModifier,
      maxHp: 100,
      input: p1Input,
    });

    // 4. Crear J2 (KeyboardInput si es local1v1, o BotInput si es vsBot)
    if (mode === 'local1v1') {
      const p2Input = new KeyboardInput(this, 2, false);
      this.p2 = new Player(this, spawnP2.x, spawnP2.y, 2, {
        textureKey: 'bot_sprite',
        speedMultiplier: p2Arch.speedModifier,
        maxHp: 100,
        input: p2Input,
      });
    } else {
      const botInput = new BotInput(
        () => this.p2,
        () => this.p1
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
