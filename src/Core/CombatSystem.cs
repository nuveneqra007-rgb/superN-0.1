// =============================================================
// CombatSystem.cs — Detección de golpes, daño y knockback
// Lógica pura — sin dependencias de Godot
// Basado en PlayerState.as y Weapons.as
// =============================================================

using System;

namespace SuperN;

public record HitResult(
	bool  DidHit,
	float DamageDealt,
	float KnockbackX,
	float KnockbackY,
	int   HitstunTicks,
	bool  CausedKnockdown,
	bool  IgnitedTarget
);

public static class CombatSystem
{
	/// <summary>
	/// Calcula si el atacante impacta al defensor con su ataque melee actual.
	/// Usa hitboxes rectangulares centradas en el atacante (Weapons.as).
	/// </summary>
	public static HitResult ResolveMelee(PlayerState attacker, PlayerState defender)
	{
		if (!defender.IsAlive || defender.InvulnerabilityTicks > 0)
			return Miss();

		var wpn = WeaponDatabase.Get(attacker.EquippedWeapon);
		int step = Math.Clamp(attacker.ComboStep, 0, 2);

		// Hitbox del golpe: rectangular frente al atacante
		float hitW = wpn.Category == WeaponCategory.Melee ? 48f : 30f;
		float hitH = 44f;
		float dirX = attacker.FacingRight ? 1f : -1f;
		float hitCx = attacker.X + dirX * (hitW / 2f + 8f);
		float hitCy = attacker.Y;

		if (!RectsOverlap(hitCx, hitCy, hitW, hitH,
						  defender.X, defender.Y,
						  GameConstants.HitboxStand.X, GameConstants.HitboxStand.Y))
			return Miss();

		// Daño con combo step
		float baseDmg = attacker.EquippedWeapon switch
		{
			WeaponType.Fists   => GameConstants.FistsDamage[step],
			WeaponType.Machete => GameConstants.MacheteCombo[step],
			WeaponType.Axe     => GameConstants.AxeCombo[step],
			WeaponType.Sword   => GameConstants.SwordCombo[step],
			_                  => wpn.Damage
		};

		float dmg = ApplyModifiers(baseDmg, attacker.DamageDealtModifier,
											  defender.DamageTakenModifier);

		// Knockback
		float kbX = attacker.FacingRight
			? GameConstants.FistsKbX[step]
			: -GameConstants.FistsKbX[step];
		float kbY = GameConstants.FistsKbY[step];

		// Hitstun — golpe 3 del combo → más fuerte
		int hitstun = step == 2
			? GameConstants.HitstunTicksStrong
			: GameConstants.HitstunTicksLight;

		bool knockdown = step == 2 && defender.Health - dmg <= 0.01f;

		// Probabilidad de desarme al tercer golpe con HP baja (Player.as:4319)
		if (step == 2 && defender.Health < GameConstants.DisarmHPThreshold)
		{
			float roll = PseudoRandom(attacker.Id ^ defender.Id ^ attacker.StateTicks);
			if (roll < GameConstants.DisarmChanceAtLowHP)
				DisarmPlayer(defender);
		}

		ApplyDamage(defender, dmg, hitstun, kbX, kbY);

		return new HitResult(
			DidHit: true,
			DamageDealt: dmg,
			KnockbackX: kbX,
			KnockbackY: kbY,
			HitstunTicks: hitstun,
			CausedKnockdown: knockdown,
			IgnitedTarget: false
		);
	}

	/// <summary>
	/// Aplica daño de proyectil al defensor.
	/// </summary>
	public static HitResult ResolveProjectile(
		PlayerState attacker,
		PlayerState defender,
		WeaponType  weaponType,
		float       projX, float projY)
	{
		if (!defender.IsAlive || defender.InvulnerabilityTicks > 0)
			return Miss();

		// Colisión punto-caja
		float hw = GameConstants.HitboxStand.X / 2f;
		float hh = GameConstants.HitboxStand.Y / 2f;
		if (projX < defender.X - hw || projX > defender.X + hw ||
			projY < defender.Y - hh || projY > defender.Y + hh)
			return Miss();

		var wpn = WeaponDatabase.Get(weaponType);
		float dmg = ApplyModifiers(wpn.Damage, attacker.DamageDealtModifier,
											   defender.DamageTakenModifier);

		bool ignited = wpn.OnFireDuration > 0;
		if (ignited)
		{
			defender.IsOnFire   = true;
			defender.FireTicks  = wpn.OnFireDuration;
		}

		float kbX = projX > defender.X ? -80f : 80f;
		float kbY = -60f;
		ApplyDamage(defender, dmg, GameConstants.HitstunTicksLight, kbX, kbY);

		return new HitResult(true, dmg, kbX, kbY,
			GameConstants.HitstunTicksLight, false, ignited);
	}

	/// <summary>
	/// Aplica daño de explosión — radio splash con daño reducido por distancia.
	/// </summary>
	public static HitResult ResolveExplosion(
		PlayerState defender,
		float       epicenterX, float epicenterY,
		float       radius, float damage)
	{
		if (!defender.IsAlive || defender.InvulnerabilityTicks > 0)
			return Miss();

		float dist = MathF.Sqrt(
			MathF.Pow(defender.X - epicenterX, 2) +
			MathF.Pow(defender.Y - epicenterY, 2));

		if (dist > radius) return Miss();

		// Daño cae linealmente con la distancia
		float factor = 1f - (dist / radius);
		float dmg = damage * factor;

		float kbX = defender.X > epicenterX ? 300f : -300f;
		float kbY = -400f;
		ApplyDamage(defender, dmg, GameConstants.HitstunTicksStrong, kbX, kbY);

		return new HitResult(true, dmg, kbX, kbY,
			GameConstants.HitstunTicksStrong, true, false);
	}

	/// <summary>
	/// Tick de daño de fuego — llamar cada frame mientras IsOnFire.
	/// </summary>
	public static float TickFireDamage(PlayerState p)
	{
		if (!p.IsOnFire || p.FireTicks <= 0) return 0f;
		// El Flamethrower hace daño cada 2 ticks
		if (p.StateTicks % 2 != 0) return 0f;

		float dmg = GameConstants.FlameDmgPerTick * p.DamageTakenModifier;
		p.Health = MathF.Max(0f, p.Health - dmg);
		if (p.Health <= 0f) PlayerFSM.TryTransition(p, PlayerFSMState.Dead);
		return dmg;
	}

	// ─── Helpers privados ──────────────────────────────────────

	private static void ApplyDamage(PlayerState p, float dmg,
									 int hitstunTicks, float kbX, float kbY)
	{
		p.Health = MathF.Max(0f, p.Health - dmg);
		p.VelocityX = kbX;
		p.VelocityY = kbY;

		if (p.Health <= 0f)
		{
			PlayerFSM.TryTransition(p, PlayerFSMState.Dead);
			return;
		}

		p.HitstunTicks = hitstunTicks;
		PlayerFSM.TryTransition(p, PlayerFSMState.Hitstun);
	}

	private static void DisarmPlayer(PlayerState p)
	{
		p.EquippedWeapon = WeaponType.Fists;
		p.Ammo = 0;
	}

	private static float ApplyModifiers(float base_, float dealt, float taken)
		=> base_ * dealt * taken;

	private static bool RectsOverlap(float ax, float ay, float aw, float ah,
									  float bx, float by, float bw, float bh)
	{
		float halfAW = aw / 2f; float halfAH = ah / 2f;
		float halfBW = bw / 2f; float halfBH = bh / 2f;
		return MathF.Abs(ax - bx) < halfAW + halfBW &&
			   MathF.Abs(ay - by) < halfAH + halfBH;
	}

	private static HitResult Miss() =>
		new(false, 0f, 0f, 0f, 0, false, false);

	/// PRNG determinista — sin Math.Random en simulación
	private static float PseudoRandom(int seed)
	{
		uint s = (uint)seed;
		s ^= s << 13; s ^= s >> 17; s ^= s << 5;
		return (s & 0xFFFF) / 65535f;
	}
}
