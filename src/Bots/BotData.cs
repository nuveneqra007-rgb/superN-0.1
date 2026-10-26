using System.Collections.Generic;

// =============================================================
// BotData.cs — Arquetipos de bots y facciones
// Ground Truth: BotExtended (NearHuscarl/BotExtended)
// =============================================================

namespace SuperN;

// ─── Facciones (BotExtended BotFaction) ───────────────────────
public enum BotFaction
{
	None,
	// Grunts
	Thug, Punk, Biker, Gangster, Police, MetroCop,
	// Horda
	Zombie,
	// Elite
	Soldier, Agent, Assassin, Sniper, Cowboy,
	// Especiales
	Mutant, Survivor, Pyromaniac,
	// Jefes
	Boss_Berserker, Boss_Kingpin, Boss_Tank, Boss_Generic
}

// ─── Arquetipo de IA (BotExtended BotAI) ─────────────────────
public enum BotAIType
{
	Grunt,          // Sigue y ataca, sin dodge
	Hulk,           // Melee agresivo, ignora proyectiles
	Hard,           // Dodge + cobertura
	Soldier,        // Armas pesadas + Hard
	AssassinMelee,  // Ultra-rápido, melee puro
	AssassinRange,  // Ultra-rápido, disparo preciso
	Cowboy,         // Rápido + pistolero
	Zombie          // Avanza lento en línea recta
}

// ─── Datos del arquetipo ───────────────────────────────────────
public record BotArchetypeData(
	BotFaction  Faction,
	BotAIType   AIType,
	int         MaxHealth,           // BotExtended Health constants
	float       SpeedModifier,       // BotExtended Speed constants
	float       DamageDealtModifier, // BotExtended DamageDealt
	float       DamageTakenModifier, // BotExtended DamageTaken
	float       MeleeForceModifier,  // 1.0 = normal, 1.5 = strong
	float       EquipWeaponChance,   // 0-1 probabilidad de llevar arma
	WeaponType? PreferredWeapon = null
);

// ─── Base de datos de arquetipos ──────────────────────────────
public static class BotArchetypeDatabase
{
	public static readonly IReadOnlyDictionary<BotFaction, BotArchetypeData> All =
		new Dictionary<BotFaction, BotArchetypeData>
		{
			// ── GRUNTS ────────────────────────────────────────────────
			[BotFaction.Thug] = new(
				BotFaction.Thug, BotAIType.Grunt,
				MaxHealth: GameConstants.Health_BelowNormal,   // 80
				SpeedModifier: GameConstants.Speed_Normal,
				DamageDealtModifier: GameConstants.DD_BelowNormal,
				DamageTakenModifier: GameConstants.DT_Normal,
				MeleeForceModifier: 1.0f,
				EquipWeaponChance: 0.6f
			),
			[BotFaction.Punk] = new(
				BotFaction.Punk, BotAIType.Grunt,
				MaxHealth: GameConstants.Health_BelowNormal,
				SpeedModifier: GameConstants.Speed_Normal,
				DamageDealtModifier: GameConstants.DD_BelowNormal,
				DamageTakenModifier: GameConstants.DT_Normal,
				MeleeForceModifier: 1.0f,
				EquipWeaponChance: 1.0f // siempre armado
			),
			[BotFaction.Biker] = new(
				BotFaction.Biker, BotAIType.Grunt,
				MaxHealth: GameConstants.Health_BelowNormal,
				SpeedModifier: GameConstants.Speed_Normal,
				DamageDealtModifier: GameConstants.DD_BelowNormal,
				DamageTakenModifier: GameConstants.DT_Normal,
				MeleeForceModifier: 1.0f,
				EquipWeaponChance: 0.6f
			),
			[BotFaction.Gangster] = new(
				BotFaction.Gangster, BotAIType.Grunt,
				MaxHealth: GameConstants.Health_BelowNormal,
				SpeedModifier: GameConstants.Speed_Normal,
				DamageDealtModifier: GameConstants.DD_BelowNormal,
				DamageTakenModifier: GameConstants.DT_Normal,
				MeleeForceModifier: 1.0f,
				EquipWeaponChance: 1.0f
			),
			[BotFaction.Police] = new(
				BotFaction.Police, BotAIType.Grunt,
				MaxHealth: GameConstants.Health_BelowNormal,
				SpeedModifier: GameConstants.Speed_Normal,
				DamageDealtModifier: GameConstants.DD_BelowNormal,
				DamageTakenModifier: GameConstants.DT_Normal,
				MeleeForceModifier: 1.0f,
				EquipWeaponChance: 1.0f,
				PreferredWeapon: WeaponType.Pistol
			),
			[BotFaction.MetroCop] = new(
				BotFaction.MetroCop, BotAIType.Grunt,
				MaxHealth: GameConstants.Health_BelowNormal,
				SpeedModifier: GameConstants.Speed_BelowNormal,
				DamageDealtModifier: GameConstants.DD_BelowNormal,
				DamageTakenModifier: GameConstants.DT_Normal,
				MeleeForceModifier: 1.0f,
				EquipWeaponChance: 1.0f
			),

			// ── HULKS ─────────────────────────────────────────────────
			[BotFaction.Mutant] = new(
				BotFaction.Mutant, BotAIType.Hulk,
				MaxHealth: GameConstants.Health_Strong,   // 150
				SpeedModifier: GameConstants.Speed_Slow,
				DamageDealtModifier: GameConstants.DD_AboveNormal,
				DamageTakenModifier: GameConstants.DT_Normal,
				MeleeForceModifier: 1.5f, // Strong
				EquipWeaponChance: 0.2f
			),

			// ── ZOMBIES ───────────────────────────────────────────────
			[BotFaction.Zombie] = new(
				BotFaction.Zombie, BotAIType.Zombie,
				MaxHealth: GameConstants.Health_BelowNormal,
				SpeedModifier: GameConstants.Speed_VerySlow,
				DamageDealtModifier: GameConstants.DD_BelowNormal,
				DamageTakenModifier: GameConstants.DT_Normal,
				MeleeForceModifier: 1.0f,
				EquipWeaponChance: 0.0f
			),

			// ── ELITE ─────────────────────────────────────────────────
			[BotFaction.Soldier] = new(
				BotFaction.Soldier, BotAIType.Soldier,
				MaxHealth: GameConstants.Health_BelowNormal,
				SpeedModifier: GameConstants.Speed_BelowNormal,
				DamageDealtModifier: GameConstants.DD_BelowNormal,
				DamageTakenModifier: GameConstants.DT_Normal,
				MeleeForceModifier: 1.0f,
				EquipWeaponChance: 1.0f,
				PreferredWeapon: WeaponType.Rifle
			),
			[BotFaction.Assassin] = new(
				BotFaction.Assassin, BotAIType.AssassinMelee,
				MaxHealth: GameConstants.Health_BelowNormal,
				SpeedModifier: GameConstants.Speed_VeryFast,  // ×1.35
				DamageDealtModifier: GameConstants.DD_BelowNormal,
				DamageTakenModifier: GameConstants.DT_Normal,
				MeleeForceModifier: 1.0f,
				EquipWeaponChance: 0.5f,
				PreferredWeapon: WeaponType.Machete
			),
			[BotFaction.Cowboy] = new(
				BotFaction.Cowboy, BotAIType.Cowboy,
				MaxHealth: GameConstants.Health_BelowNormal,
				SpeedModifier: GameConstants.Speed_AboveNormal,
				DamageDealtModifier: GameConstants.DD_AboveNormal,
				DamageTakenModifier: GameConstants.DT_Normal,
				MeleeForceModifier: 1.0f,
				EquipWeaponChance: 1.0f,
				PreferredWeapon: WeaponType.Magnum
			),
			[BotFaction.Sniper] = new(
				BotFaction.Sniper, BotAIType.Hard,
				MaxHealth: GameConstants.Health_BelowNormal,
				SpeedModifier: GameConstants.Speed_BelowNormal,
				DamageDealtModifier: GameConstants.DD_Normal,
				DamageTakenModifier: GameConstants.DT_Normal,
				MeleeForceModifier: 1.0f,
				EquipWeaponChance: 1.0f,
				PreferredWeapon: WeaponType.Sniper
			),

			// ── JEFES ─────────────────────────────────────────────────
			[BotFaction.Boss_Berserker] = new(
				BotFaction.Boss_Berserker, BotAIType.Hulk,
				MaxHealth: GameConstants.Health_VeryStrong, // 200
				SpeedModifier: GameConstants.Speed_AboveNormal,
				DamageDealtModifier: GameConstants.DD_AboveNormal,
				DamageTakenModifier: GameConstants.DT_Resistant,
				MeleeForceModifier: 2.0f,
				EquipWeaponChance: 0.5f
			),
			[BotFaction.Boss_Tank] = new(
				BotFaction.Boss_Tank, BotAIType.Hulk,
				MaxHealth: GameConstants.Health_ExtremelyStrong, // 250
				SpeedModifier: GameConstants.Speed_ExtremelySlow,
				DamageDealtModifier: GameConstants.DD_VeryHigh,
				DamageTakenModifier: GameConstants.DT_VeryResistant,
				MeleeForceModifier: 3.0f,
				EquipWeaponChance: 0.0f
			),
		};

	public static BotArchetypeData Get(BotFaction faction) => All[faction];
}
