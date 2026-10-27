// =============================================================
// BotData.ts — Arquetipos de bots y facciones
// Ground Truth: BotExtended (NearHuscarl/BotExtended)
// =============================================================

import { GameConstants } from './GameConstants';
import { WeaponType } from './WeaponData';

export enum BotFaction {
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
    maxHealth: GameConstants.Health_BelowNormal,
    speedModifier: GameConstants.Speed_Normal,
    damageDealtModifier: GameConstants.DD_BelowNormal,
    damageTakenModifier: GameConstants.DT_Normal,
    meleeForceModifier: 1.0,
    equipWeaponChance: 0.6,
    description: 'Enemigo común básico, persigue y combate cuerpo a cuerpo.',
    spriteUrl: '/assets/sprites/bot/thug.png',
  },
  [BotFaction.Punk]: {
    faction: BotFaction.Punk,
    name: 'Punk',
    aiType: BotAIType.Grunt,
    maxHealth: GameConstants.Health_BelowNormal,
    speedModifier: GameConstants.Speed_Normal,
    damageDealtModifier: GameConstants.DD_BelowNormal,
    damageTakenModifier: GameConstants.DT_Normal,
    meleeForceModifier: 1.0,
    equipWeaponChance: 1.0,
    preferredWeapon: WeaponType.Machete,
    description: 'Agresivo y siempre equipado con armas blancas.',
    spriteUrl: '/assets/sprites/bot/punk.png',
  },
  [BotFaction.Biker]: {
    faction: BotFaction.Biker,
    name: 'Motero',
    aiType: BotAIType.Grunt,
    maxHealth: GameConstants.Health_Normal,
    speedModifier: GameConstants.Speed_Normal,
    damageDealtModifier: GameConstants.DD_Normal,
    damageTakenModifier: GameConstants.DT_Normal,
    meleeForceModifier: 1.1,
    equipWeaponChance: 0.7,
    description: 'Peleador callejero duro y contundente.',
    spriteUrl: '/assets/sprites/bot/biker.png',
  },
  [BotFaction.Gangster]: {
    faction: BotFaction.Gangster,
    name: 'Gánster',
    aiType: BotAIType.Grunt,
    maxHealth: GameConstants.Health_BelowNormal,
    speedModifier: GameConstants.Speed_Normal,
    damageDealtModifier: GameConstants.DD_BelowNormal,
    damageTakenModifier: GameConstants.DT_Normal,
    meleeForceModifier: 1.0,
    equipWeaponChance: 1.0,
    preferredWeapon: WeaponType.Uzi,
    description: 'Miembro de banda urbana armado con subfusil.',
    spriteUrl: '/assets/sprites/bot/gangster.png',
  },
  [BotFaction.Police]: {
    faction: BotFaction.Police,
    name: 'Policía',
    aiType: BotAIType.Grunt,
    maxHealth: GameConstants.Health_Normal,
    speedModifier: GameConstants.Speed_Normal,
    damageDealtModifier: GameConstants.DD_Normal,
    damageTakenModifier: GameConstants.DT_Normal,
    meleeForceModifier: 1.0,
    equipWeaponChance: 1.0,
    preferredWeapon: WeaponType.Pistol,
    description: 'Oficial de policía armado con pistola estándar.',
    spriteUrl: '/assets/sprites/bot/police.png',
  },
  [BotFaction.MetroCop]: {
    faction: BotFaction.MetroCop,
    name: 'MetroCop',
    aiType: BotAIType.Grunt,
    maxHealth: GameConstants.Health_AboveNormal,
    speedModifier: GameConstants.Speed_BelowNormal,
    damageDealtModifier: GameConstants.DD_Normal,
    damageTakenModifier: GameConstants.DT_Normal,
    meleeForceModifier: 1.0,
    equipWeaponChance: 1.0,
    preferredWeapon: WeaponType.Shotgun,
    description: 'Fuerza antidisturbios pesada con escopeta.',
    spriteUrl: '/assets/sprites/bot/metrocop.png',
  },
  [BotFaction.Mutant]: {
    faction: BotFaction.Mutant,
    name: 'Mutante',
    aiType: BotAIType.Hulk,
    maxHealth: GameConstants.Health_Strong, // 150
    speedModifier: GameConstants.Speed_Slow,
    damageDealtModifier: GameConstants.DD_AboveNormal,
    damageTakenModifier: GameConstants.DT_Normal,
    meleeForceModifier: 1.5,
    equipWeaponChance: 0.2,
    description: 'Monstruo tanque que ignora proyectiles y golpea con furia.',
    spriteUrl: '/assets/sprites/bot/mutant.png',
  },
  [BotFaction.Zombie]: {
    faction: BotFaction.Zombie,
    name: 'Zombi',
    aiType: BotAIType.Zombie,
    maxHealth: GameConstants.Health_BelowNormal,
    speedModifier: GameConstants.Speed_VerySlow,
    damageDealtModifier: GameConstants.DD_BelowNormal,
    damageTakenModifier: GameConstants.DT_Normal,
    meleeForceModifier: 1.0,
    equipWeaponChance: 0.0,
    description: 'Camina incansable hacia ti sin importar el daño.',
    spriteUrl: '/assets/sprites/bot/zombie.png',
  },
  [BotFaction.Soldier]: {
    faction: BotFaction.Soldier,
    name: 'Soldado',
    aiType: BotAIType.Soldier,
    maxHealth: GameConstants.Health_AboveNormal,
    speedModifier: GameConstants.Speed_Normal,
    damageDealtModifier: GameConstants.DD_Normal,
    damageTakenModifier: GameConstants.DT_Normal,
    meleeForceModifier: 1.0,
    equipWeaponChance: 1.0,
    preferredWeapon: WeaponType.Rifle,
    description: 'Militar entrenado, usa cobertura y rifle de asalto.',
    spriteUrl: '/assets/sprites/bot/soldier.png',
  },
  [BotFaction.Agent]: {
    faction: BotFaction.Agent,
    name: 'Agente',
    aiType: BotAIType.Hard,
    maxHealth: GameConstants.Health_Normal,
    speedModifier: GameConstants.Speed_AboveNormal,
    damageDealtModifier: GameConstants.DD_Normal,
    damageTakenModifier: GameConstants.DT_Normal,
    meleeForceModifier: 1.0,
    equipWeaponChance: 1.0,
    preferredWeapon: WeaponType.Pistol,
    description: 'Agente secreto de élite con reflejos rápidos y dodge.',
    spriteUrl: '/assets/sprites/bot/agent.png',
  },
  [BotFaction.Assassin]: {
    faction: BotFaction.Assassin,
    name: 'Asesino',
    aiType: BotAIType.AssassinMelee,
    maxHealth: GameConstants.Health_Normal,
    speedModifier: GameConstants.Speed_VeryFast, // ×1.35
    damageDealtModifier: GameConstants.DD_AboveNormal,
    damageTakenModifier: GameConstants.DT_Normal,
    meleeForceModifier: 1.2,
    equipWeaponChance: 0.8,
    preferredWeapon: WeaponType.Machete,
    description: 'Sombra hiperrápida armada con machete o espada.',
  },
  [BotFaction.Cowboy]: {
    faction: BotFaction.Cowboy,
    name: 'Pistolero',
    aiType: BotAIType.Cowboy,
    maxHealth: GameConstants.Health_Normal,
    speedModifier: GameConstants.Speed_AboveNormal,
    damageDealtModifier: GameConstants.DD_AboveNormal,
    damageTakenModifier: GameConstants.DT_Normal,
    meleeForceModifier: 1.0,
    equipWeaponChance: 1.0,
    preferredWeapon: WeaponType.Magnum,
    description: 'Tirador letal del viejo oeste con Magnum de alta precisión.',
  },
  [BotFaction.Sniper]: {
    faction: BotFaction.Sniper,
    name: 'Francotirador',
    aiType: BotAIType.Hard,
    maxHealth: GameConstants.Health_BelowNormal,
    speedModifier: GameConstants.Speed_BelowNormal,
    damageDealtModifier: GameConstants.DD_Normal,
    damageTakenModifier: GameConstants.DT_Normal,
    meleeForceModifier: 1.0,
    equipWeaponChance: 1.0,
    preferredWeapon: WeaponType.Sniper,
    description: 'Mantiene las distancias con mira láser y rifle potente.',
  },
  [BotFaction.Boss_Berserker]: {
    faction: BotFaction.Boss_Berserker,
    name: 'Jefe Berserker',
    aiType: BotAIType.Hulk,
    maxHealth: GameConstants.Health_VeryStrong, // 200
    speedModifier: GameConstants.Speed_AboveNormal,
    damageDealtModifier: GameConstants.DD_AboveNormal,
    damageTakenModifier: GameConstants.DT_Resistant,
    meleeForceModifier: 2.0,
    equipWeaponChance: 0.8,
    preferredWeapon: WeaponType.Axe,
    description: 'Jefe implacable con hacha gigante y resistencia brutal.',
  },
  [BotFaction.Boss_Tank]: {
    faction: BotFaction.Boss_Tank,
    name: 'Jefe Tanque',
    aiType: BotAIType.Hulk,
    maxHealth: GameConstants.Health_ExtremelyStrong, // 250
    speedModifier: GameConstants.Speed_ExtremelySlow,
    damageDealtModifier: GameConstants.DD_VeryHigh,
    damageTakenModifier: GameConstants.DT_VeryResistant,
    meleeForceModifier: 3.0,
    equipWeaponChance: 0.5,
    preferredWeapon: WeaponType.Bazooka,
    description: 'Coloso imparable fuertemente blindado.',
  },
};

export function getBotArchetype(faction: BotFaction): BotArchetypeData {
  return BotArchetypeDatabase[faction] || BotArchetypeDatabase[BotFaction.Agent];
}
