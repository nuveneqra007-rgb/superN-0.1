// =============================================================
// PhysicsStep.cs — Simulación determinista de física 2D
// 60 Hz, AABB sin motor externo
// Basado en Player.as, PlayerState.as
// =============================================================

using System;
using System.Collections.Generic; 

namespace SuperN;

public record PhysicsRect(float X, float Y, float W, float H);

public static class PhysicsStep
{
	private const float DeltaTime = 1f / 60f; // tick fijo

	/// <summary>
	/// Avanza la física de un jugador un tick.
	/// Plataformas se pasan como lista de rectángulos (x, y = esquina sup-izq).
	/// </summary>
	public static void Tick(PlayerState p, IReadOnlyList<PhysicsRect> platforms)
	{
		if (!p.IsAlive) return;

		ApplyGravity(p);
		ApplyMovement(p);
		ResolveCollisions(p, platforms);
		ClampToBounds(p);
	}

	private static void ApplyGravity(PlayerState p)
	{
		// Sin gravedad durante ledge hang, roll en suelo, o slide
		if (p.FSM is PlayerFSMState.LedgeHang or PlayerFSMState.LedgeClimb)
			return;

		p.VelocityY += GameConstants.Gravity * DeltaTime;

		// Velocidad de caída máxima (terminal velocity)
		const float maxFall = 800f;
		if (p.VelocityY > maxFall) p.VelocityY = maxFall;
	}

	private static void ApplyMovement(PlayerState p)
	{
		// Aplicar fricción
		if (p.OnGround)
			p.VelocityX *= GameConstants.GroundFriction;
		else
			p.VelocityX *= GameConstants.AirFriction;

		// Velocidad de roll (sobrescribe VelocityX si está en roll)
		if (p.FSM == PlayerFSMState.Roll)
		{
			float dir = p.FacingRight ? 1f : -1f;
			p.VelocityX = dir * GameConstants.RollSpeed;
		}

		// Mover
		p.X += p.VelocityX * DeltaTime;
		p.Y += p.VelocityY * DeltaTime;
	}

	private static void ResolveCollisions(PlayerState p,
										   IReadOnlyList<PhysicsRect> platforms)
	{
		float hw = GameConstants.HitboxStand.X / 2f;
		float hh = (p.FSM is PlayerFSMState.Crouch or
							 PlayerFSMState.Roll or
							 PlayerFSMState.CrouchSlide
			? GameConstants.HitboxCrouch.Y
			: GameConstants.HitboxStand.Y) / 2f;

		p.OnGround = false;

		foreach (var plat in platforms)
		{
			// Skip one-way platform si cae desde arriba y timer activo
			bool isOneWay = plat.H <= 8f; // plataformas finas = one-way
			if (isOneWay && p.PlatformDropTicks > 0) continue;

			float platRight  = plat.X + plat.W;
			float platBottom = plat.Y + plat.H;

			// AABB overlap check
			bool overlapX = p.X + hw > plat.X && p.X - hw < platRight;
			bool overlapY = p.Y + hh > plat.Y && p.Y - hh < platBottom;

			if (!overlapX || !overlapY) continue;

			// Penetración en cada eje
			float penLeft   = (p.X + hw) - plat.X;
			float penRight  = platRight - (p.X - hw);
			float penTop    = (p.Y + hh) - plat.Y;
			float penBottom = platBottom - (p.Y - hh);

			// One-way: sólo colisión desde arriba
			if (isOneWay)
			{
				if (p.VelocityY >= 0 && penTop < penBottom && penTop < 12f)
				{
					p.Y     = plat.Y - hh;
					p.VelocityY = 0f;
					p.OnGround  = true;
					// Coyote time
					p.CoyoteTicks = 6;
				}
				continue;
			}

			// Plataforma sólida — resolver eje con menor penetración
			float minPen = MathF.Min(MathF.Min(penLeft, penRight),
									 MathF.Min(penTop,  penBottom));

			if (minPen == penTop && p.VelocityY >= 0)
			{
				p.Y = plat.Y - hh;
				p.VelocityY = 0f;
				p.OnGround  = true;
				p.CoyoteTicks = 6;

				// Knockdown al aterrizar tras caída fuerte → no implementado aquí
			}
			else if (minPen == penBottom && p.VelocityY < 0)
			{
				p.Y = platBottom + hh;
				p.VelocityY = 0f;
			}
			else if (minPen == penLeft)
			{
				p.X = plat.X - hw;
				p.VelocityX = 0f;
			}
			else if (minPen == penRight)
			{
				p.X = platRight + hw;
				p.VelocityX = 0f;
			}
		}

		// Actualizar coyote time
		if (!p.OnGround && p.CoyoteTicks > 0)
			p.CoyoteTicks--;
	}

	private static void ClampToBounds(PlayerState p)
	{
		// Matar al jugador si cae fuera del mapa
		const float killY = 800f;
		if (p.Y > killY)
		{
			p.Health = 0f;
			PlayerFSM.TryTransition(p, PlayerFSMState.Dead);
		}
	}
}
