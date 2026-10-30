// =============================================================
// BotData.ts — Arquetipos de bots y facciones
// Ground Truth: BotExtended (NearHuscarl/BotExtended)
// =============================================================

import { GameConstants } from './GameConstants';
import { WeaponType } from './WeaponData';

export enum BotFaction {
  Ninja = 'Ninja',
  Thug = 'Thug',
  Punk = 'Punk',
  Biker = 'Biker',
  Gangster = 'Gangster',
  Police = 'Police',
  MetroCop = 'MetroCop',
  Zombie = 'Zombie',
  Soldier = 'Soldier',
  Agent = 'Agent',
  Assassin = 'Assassin',
  Sniper = 'Sniper',
  Cowboy = 'Cowboy',
  Mutant = 'Mutant',
  Boss_Berserker = 'Boss_Berserker',
  Boss_Tank = 'Boss_Tank',
}

export enum BotAIType {
  Grunt = 'Grunt',
  Hulk = 'Hulk',
  Hard = 'Hard',
  Soldier = 'Soldier',
  AssassinMelee = 'AssassinMelee',
  AssassinRange = 'AssassinRange',
  Cowboy = 'Cowboy',
  Zombie = 'Zombie',
}

export const MAX_BOTS = 5;

export interface BotSlotConfig {
  faction: BotFaction | 'RANDOM';
  difficulty: 'easy' | 'normal' | 'hard';
  team: 'independent';
}

export interface BotArchetypeData {
  faction: BotFaction;
  name: string;
  aiType: BotAIType;
  maxHealth: number;
  speedModifier: number;
  damageDealtModifier: number;
  damageTakenModifier: number;
  meleeForceModifier: number;
  equipWeaponChance: number;
  preferredWeapon?: WeaponType;
  description: string;
  spriteUrl?: string;
}

export const BotArchetypeDatabase: Record<BotFaction, BotArchetypeData> = {
  [BotFaction.Thug]: {
    faction: BotFaction.Thug,
    name: 'Matón',
    aiType: BotAIType.Grunt,
    maxHealth: GameConstants.Health_BelowNormal, // 80 HP
    speedModifier: GameConstants.Speed_Normal, // 1.00
    damageDealtModifier: GameConstants.DD_BelowNormal, // 0.90
    damageTakenModifier: GameConstants.DT_Normal, // 1.00
    meleeForceModifier: 1.0,
    equipWeaponChance: 0.7,
    preferredWeapon: WeaponType.Machete,
    description: 'Enemigo común callejero, busca saquear objetos y combate cuerpo a cuerpo.',
    spriteUrl: '/assets/sprites/bot/thug.png',
  },
  [BotFaction.Punk]: {
    faction: BotFaction.Punk,
    name: 'Punk',
    aiType: BotAIType.Grunt,
    maxHealth: GameConstants.Health_BelowNormal, // 80 HP
    speedModifier: GameConstants.Speed_Normal, // 1.00
    damageDealtModifier: GameConstants.DD_BelowNormal, // 0.90
    damageTakenModifier: GameConstants.DT_Normal, // 1.00
    meleeForceModifier: 1.0,
    equipWeaponChance: 1.0,
    preferredWeapon: WeaponType.Machete,
    description: 'Rebelde agresivo siempre armado con armas blancas y gran empuje.',
    spriteUrl: '/assets/sprites/bot/punk.png',
  },
  [BotFaction.Biker]: {
    faction: BotFaction.Biker,
    name: 'Motero',
    aiType: BotAIType.Grunt,
    maxHealth: GameConstants.Health_BelowNormal, // 80 HP
    speedModifier: GameConstants.Speed_Normal, // 1.00
    damageDealtModifier: GameConstants.DD_BelowNormal, // 0.90
    damageTakenModifier: GameConstants.DT_Normal, // 1.00
    meleeForceModifier: 1.1,
    equipWeaponChance: 0.8,
    preferredWeapon: WeaponType.Machete,
    description: 'Peleador callejero que recupera 4 HP al golpear cuerpo a cuerpo y puede desarmar.',
    spriteUrl: '/assets/sprites/bot/biker.png',
  },
  [BotFaction.Gangster]: {
    faction: BotFaction.Gangster,
    name: 'Gánster',
    aiType: BotAIType.Grunt,
    maxHealth: GameConstants.Health_BelowNormal, // 80 HP
    speedModifier: GameConstants.Speed_Normal, // 1.00
    damageDealtModifier: GameConstants.DD_BelowNormal, // 0.90
    damageTakenModifier: GameConstants.DT_Normal, // 1.00
    meleeForceModifier: 1.0,
    equipWeaponChance: 1.0,
    preferredWeapon: WeaponType.Uzi,
    description: 'Miembro de banda urbana armado con subfusil Uzi y revólver de alta cadencia.',
    spriteUrl: '/assets/sprites/bot/gangster.png',
  },
  [BotFaction.Police]: {
    faction: BotFaction.Police,
    name: 'Policía',
    aiType: BotAIType.Grunt,
    maxHealth: GameConstants.Health_BelowNormal, // 80 HP
    speedModifier: GameConstants.Speed_Normal, // 1.00
    damageDealtModifier: GameConstants.DD_BelowNormal, // 0.90
    damageTakenModifier: GameConstants.DT_Normal, // 1.00
    meleeForceModifier: 1.0,
    equipWeaponChance: 1.0,
    preferredWeapon: WeaponType.Pistol,
    description: 'Oficial de policía equipado con porra y pistola de servicio reglamentaria.',
    spriteUrl: '/assets/sprites/bot/police.png',
  },
  [BotFaction.MetroCop]: {
    faction: BotFaction.MetroCop,
    name: 'MetroCop',
    aiType: BotAIType.Grunt,
    maxHealth: GameConstants.Health_BelowNormal, // 80 HP
    speedModifier: GameConstants.Speed_Normal, // 1.00
    damageDealtModifier: GameConstants.DD_BelowNormal, // 0.90
    damageTakenModifier: GameConstants.DT_Normal, // 1.00
    meleeForceModifier: 1.0,
    equipWeaponChance: 1.0,
    preferredWeapon: WeaponType.Shotgun,
    description: 'Fuerza antidisturbios táctica con escopeta de perdigones y mira láser.',
    spriteUrl: '/assets/sprites/bot/metrocop.png',
  },
  [BotFaction.Mutant]: {
    faction: BotFaction.Mutant,
    name: 'Mutante',
    aiType: BotAIType.Hulk,
    maxHealth: GameConstants.Health_Strong, // 150 HP
    speedModifier: GameConstants.Speed_Slow, // 0.80
    damageDealtModifier: GameConstants.DD_AboveNormal, // 1.10
    damageTakenModifier: GameConstants.DT_Normal, // 1.00
    meleeForceModifier: 1.5,
    equipWeaponChance: 0.3,
    preferredWeapon: WeaponType.Axe,
    description: 'Mutante descomunal de enorme resistencia y fuerza de empuje brutal.',
    spriteUrl: '/assets/sprites/bot/mutant.png',
  },
  [BotFaction.Zombie]: {
    faction: BotFaction.Zombie,
    name: 'Zombi',
    aiType: BotAIType.Zombie,
    maxHealth: GameConstants.Health_Weak, // 65 HP
    speedModifier: GameConstants.Speed_VerySlow, // 0.70
    damageDealtModifier: GameConstants.DD_BelowNormal, // 0.90
    damageTakenModifier: GameConstants.DT_Normal, // 1.00
    meleeForceModifier: 0.9,
    equipWeaponChance: 0.0,
    description: 'Muerto viviente incansable cuyos arañazos infectan al objetivo.',
    spriteUrl: '/assets/sprites/bot/zombie.png',
  },
  [BotFaction.Soldier]: {
    faction: BotFaction.Soldier,
    name: 'Soldado',
    aiType: BotAIType.Soldier,
    maxHealth: GameConstants.Health_BelowNormal, // 80 HP
    speedModifier: GameConstants.Speed_Normal, // 1.00
    damageDealtModifier: GameConstants.DD_BelowNormal, // 0.90
    damageTakenModifier: GameConstants.DT_Normal, // 1.00
    meleeForceModifier: 1.0,
    equipWeaponChance: 1.0,
    preferredWeapon: WeaponType.Rifle,
    description: 'Militar de asalto táctico entrenado en cobertura y disparos penetrantes.',
    spriteUrl: '/assets/sprites/bot/soldier.png',
  },
  [BotFaction.Agent]: {
    faction: BotFaction.Agent,
    name: 'Agente',
    aiType: BotAIType.Hard,
    maxHealth: GameConstants.Health_BelowNormal, // 80 HP
    speedModifier: GameConstants.Speed_AboveNormal, // 1.10
    damageDealtModifier: GameConstants.DD_BelowNormal, // 0.90
    damageTakenModifier: GameConstants.DT_Normal, // 1.00
    meleeForceModifier: 1.0,
    equipWeaponChance: 1.0,
    preferredWeapon: WeaponType.Pistol,
    description: 'Agente secreto de élite con traje negro, gafas, reflejos rápidos y dodge roll.',
    spriteUrl: '/assets/sprites/bot/agent.png',
  },
  [BotFaction.Assassin]: {
    faction: BotFaction.Assassin,
    name: 'Asesino',
    aiType: BotAIType.AssassinMelee,
    maxHealth: GameConstants.Health_BelowNormal, // 80 HP
    speedModifier: GameConstants.Speed_VeryFast, // 1.35
    damageDealtModifier: GameConstants.DD_BelowNormal, // 0.90
    damageTakenModifier: GameConstants.DT_Normal, // 1.00
    meleeForceModifier: 1.2,
    equipWeaponChance: 0.9,
    preferredWeapon: WeaponType.Machete,
    description: 'Ninja veloz con máscara y traje azul, armado con katana/machete hiperrápido.',
    spriteUrl: '/assets/sprites/player/Assassin_2.png',
  },
  [BotFaction.Cowboy]: {
    faction: BotFaction.Cowboy,
    name: 'Pistolero',
    aiType: BotAIType.Cowboy,
    maxHealth: GameConstants.Health_BelowNormal, // 80 HP
    speedModifier: GameConstants.Speed_AboveNormal, // 1.10
    damageDealtModifier: GameConstants.DD_AboveNormal, // 1.10
    damageTakenModifier: GameConstants.DT_Normal, // 1.00
    meleeForceModifier: 0.9,
    equipWeaponChance: 1.0,
    preferredWeapon: WeaponType.Magnum,
    description: 'Tirador del viejo oeste con sombrero, Magnum .44 y 15% probabilidad de desarmar.',
    spriteUrl: '/assets/sprites/bot/cowboy.png',
  },
  [BotFaction.Sniper]: {
    faction: BotFaction.Sniper,
    name: 'Francotirador',
    aiType: BotAIType.Hard,
    maxHealth: GameConstants.Health_Weak, // 65 HP
    speedModifier: GameConstants.Speed_Slow, // 0.80
    damageDealtModifier: GameConstants.DD_AboveNormal, // 1.10
    damageTakenModifier: GameConstants.DT_Normal, // 1.00
    meleeForceModifier: 0.8,
    equipWeaponChance: 1.0,
    preferredWeapon: WeaponType.Sniper,
    description: 'Tirador de élite con visor rojo y rifle de precisión con mira láser.',
    spriteUrl: '/assets/sprites/bot/sniper.png',
  },
  [BotFaction.Boss_Berserker]: {
    faction: BotFaction.Boss_Berserker,
    name: 'Jefe Berserker',
    aiType: BotAIType.Hulk,
    maxHealth: GameConstants.Health_AboveNormal, // 125 HP
    speedModifier: GameConstants.Speed_VeryFast, // 1.35
    damageDealtModifier: GameConstants.DD_High, // 1.25
    damageTakenModifier: GameConstants.DT_Resistant, // 0.75
    meleeForceModifier: 2.2,
    equipWeaponChance: 1.0,
    preferredWeapon: WeaponType.Axe,
    description: 'Jefe implacable con gorra, torso al aire y hacha; roba 5 HP por impacto.',
    spriteUrl: '/assets/sprites/bot/berserker.png',
  },
  [BotFaction.Boss_Tank]: {
    faction: BotFaction.Boss_Tank,
    name: 'Jefe Tanque',
    aiType: BotAIType.Hulk,
    maxHealth: GameConstants.Health_VeryStrong, // 200 HP
    speedModifier: GameConstants.Speed_VerySlow, // 0.70
    damageDealtModifier: GameConstants.DD_AboveNormal, // 1.10
    damageTakenModifier: GameConstants.DT_VeryResistant, // 0.50 (deflects projectiles)
    meleeForceModifier: 2.5,
    equipWeaponChance: 0.8,
    preferredWeapon: WeaponType.Bazooka,
    description: 'Jefe robot acorazado con ojos rojos y armadura que reduce el daño un 50%.',
    spriteUrl: '/assets/sprites/bot/tank.png',
  },
  [BotFaction.Ninja]: {
    faction: BotFaction.Ninja,
    name: 'Ninja',
    aiType: BotAIType.Grunt,
    maxHealth: 100,
    speedModifier: 1.15,
    damageDealtModifier: 1.0,
    damageTakenModifier: 1.0,
    meleeForceModifier: 1.0,
    equipWeaponChance: 1.0,
    preferredWeapon: WeaponType.Katana,
    description: 'Guerrero sigiloso de las sombras y único protagonista jugable. Rápido, letal y disciplinado con traje negro y detalles ámbar.',
    spriteUrl: '/assets/sprites/player/ninja.png',
  },
};

/**
 * Las 15 facciones canónicas exclusivas de bots rivales (IA estática)
 */
export const CANONICAL_BOT_FACTIONS: BotFaction[] = [
  BotFaction.Thug,
  BotFaction.Punk,
  BotFaction.Biker,
  BotFaction.Gangster,
  BotFaction.Police,
  BotFaction.MetroCop,
  BotFaction.Mutant,
  BotFaction.Zombie,
  BotFaction.Soldier,
  BotFaction.Agent,
  BotFaction.Assassin,
  BotFaction.Cowboy,
  BotFaction.Sniper,
  BotFaction.Boss_Berserker,
  BotFaction.Boss_Tank,
];

export function getBotArchetype(faction: BotFaction): BotArchetypeData {
  return BotArchetypeDatabase[faction] || BotArchetypeDatabase[BotFaction.Ninja];
}
