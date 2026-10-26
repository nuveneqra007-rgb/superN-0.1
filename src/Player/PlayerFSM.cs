using System.Collections.Generic;

// =============================================================
// PlayerFSM.cs — Lógica de transiciones de la máquina de estados
// Mapeado desde PlayerState.as, PlayerAnimation.as
// SIN dependencias de Godot — lógica pura de simulación
// =============================================================

namespace SuperN;

public static class PlayerFSM
{
	private static readonly Dictionary<PlayerFSMState, int> Priorities = new()
	{
		[PlayerFSMState.Idle]        = 1,
		[PlayerFSMState.Walk]        = 2,
		[PlayerFSMState.Run]         = 3,
		[PlayerFSMState.Sprint]      = 3,
		[PlayerFSMState.Jump]        = 4,
		[PlayerFSMState.Fall]        = 4,
		[PlayerFSMState.Crouch]      = 3,
		[PlayerFSMState.CrouchSlide] = 5,
		[PlayerFSMState.Roll]        = 8, // ininterrumpible
		[PlayerFSMState.Dive]        = 6,
		[PlayerFSMState.WallSlide]   = 5,
		[PlayerFSMState.LedgeHang]   = 7,
		[PlayerFSMState.LedgeClimb]  = 9, // bloquea input
		[PlayerFSMState.MeleeAttack] = 6,
		[PlayerFSMState.RangedAim]   = 5,
		[PlayerFSMState.RangedFire]  = 6,
		[PlayerFSMState.ThrowWeapon] = 7,
		[PlayerFSMState.Hitstun]     = 8,
		[PlayerFSMState.KnockedDown] = 9,
		[PlayerFSMState.GetUp]       = 9, // bloquea input
		[PlayerFSMState.Dead]        = 10,
	};

	/// <summary>
	/// Intenta transicionar al nuevo estado.
	/// Retorna true si la transición fue exitosa.
	/// </summary>
	public static bool TryTransition(PlayerState player, PlayerFSMState next)
	{
		if (player.FSM == next) return true;
		if (!CanTransition(player.FSM, next)) return false;

		OnExitState(player, player.FSM);
		player.FSM = next;
		player.StateTicks = 0;
		OnEnterState(player, next);
		return true;
	}

	private static bool CanTransition(PlayerFSMState current, PlayerFSMState next)
	{
		// Dead no puede salir (sólo en reset de partida)
		if (current == PlayerFSMState.Dead) return false;

		// Roll es ininterrumpible excepto muerte o hitstun
		if (current == PlayerFSMState.Roll &&
			next != PlayerFSMState.Dead && next != PlayerFSMState.Hitstun)
			return false;

		// LedgeClimb bloquea todo input
		if (current == PlayerFSMState.LedgeClimb && next != PlayerFSMState.Dead)
			return false;

		// GetUp bloquea todo input
		if (current == PlayerFSMState.GetUp && next != PlayerFSMState.Dead)
			return false;

		// Estados de alta prioridad no son interrumpidos por estados de baja prioridad
		int currPrio = Priorities[current];
		int nextPrio = Priorities[next];
		if (currPrio > 5 && nextPrio < currPrio &&
			next != PlayerFSMState.Idle && next != PlayerFSMState.Fall)
			return false;

		return true;
	}

	private static void OnEnterState(PlayerState p, PlayerFSMState state)
	{
		switch (state)
		{
			case PlayerFSMState.Roll:
				p.RollTicks = GameConstants.RollDurationTicks;
				// Rodar apaga el fuego (SPEC.md)
				if (p.IsOnFire) { p.IsOnFire = false; p.FireTicks = 0; }
				break;

			case PlayerFSMState.CrouchSlide:
				p.SlideTicks = 16; // 16 ticks = ~266ms
				break;

			case PlayerFSMState.Hitstun:
				// HitstunTicks se setea desde el atacante
				break;

			case PlayerFSMState.GetUp:
				p.GetUpTicks = 20;
				p.InvulnerabilityTicks = GameConstants.GetUpInvulTicks;
				break;

			case PlayerFSMState.KnockedDown:
				p.KnockdownTicks = 48;
				break;

			case PlayerFSMState.Dead:
				p.IsAlive = false;
				p.RespawnTicks = 180; // 3 segundos a 60Hz
				break;
		}
	}

	private static void OnExitState(PlayerState p, PlayerFSMState state)
	{
		// Limpieza de contadores al salir
		switch (state)
		{
			case PlayerFSMState.MeleeAttack:
				// Ventana de combo ya manejada en tick
				break;
		}
	}

	/// <summary>
	/// Actualiza contadores del estado actual — llamar cada tick.
	/// </summary>
	public static void Tick(PlayerState p)
	{
		p.StateTicks++;
		if (p.InvulnerabilityTicks > 0) p.InvulnerabilityTicks--;
		if (p.AttackCooldown > 0) p.AttackCooldown--;

		// OnFire tick damage
		if (p.IsOnFire)
		{
			p.FireTicks--;
			// El daño de fuego se aplica en el sistema de combate
			if (p.FireTicks <= 0) p.IsOnFire = false;
		}

		switch (p.FSM)
		{
			case PlayerFSMState.Roll:
				p.RollTicks--;
				if (p.RollTicks <= 0) TryTransition(p, PlayerFSMState.Idle);
				break;

			case PlayerFSMState.CrouchSlide:
				p.SlideTicks--;
				if (p.SlideTicks <= 0) TryTransition(p, PlayerFSMState.Crouch);
				break;

			case PlayerFSMState.Hitstun:
				p.HitstunTicks--;
				if (p.HitstunTicks <= 0) TryTransition(p, PlayerFSMState.Idle);
				break;

			case PlayerFSMState.KnockedDown:
				p.KnockdownTicks--;
				if (p.KnockdownTicks <= 0) TryTransition(p, PlayerFSMState.GetUp);
				break;

			case PlayerFSMState.GetUp:
				p.GetUpTicks--;
				if (p.GetUpTicks <= 0) TryTransition(p, PlayerFSMState.Idle);
				break;

			case PlayerFSMState.MeleeAttack:
				if (p.ComboWindowTicks > 0) p.ComboWindowTicks--;
				if (p.ComboWindowTicks <= 0 && p.StateTicks > 8)
				{
					p.ComboStep = 0;
					TryTransition(p, PlayerFSMState.Idle);
				}
				break;
		}
	}
}
