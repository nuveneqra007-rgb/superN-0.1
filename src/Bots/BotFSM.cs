// =============================================================
// BotFSM.cs — Máquina de estados de la IA del bot
// Basado en BotExtended BotAI types + BotInfos.cs
// =============================================================

using System;

namespace SuperN;

public enum BotAIState
{
    Idle,    // Sin enemigos cercanos — patrulla aleatoria
    Chase,   // Acercarse al objetivo (sin arma de fuego en rango)
    Strafe,  // Con arma de fuego en rango — moverse lateral + disparar
    Attack,  // Enemigo en rango melee — ejecutar combo
    Dodge,   // Proyectil entrante detectado — roll o salto
    Flee,    // HP < umbral sin arma — huir hacia spawn de arma
    Pickup,  // Arma en suelo cercana — ir a recoger
    Cover    // Recibiendo disparo + obstáculo cerca — agacharse
}

public class BotFSMData
{
    public BotAIState CurrentState { get; set; } = BotAIState.Idle;
    public int        StateTicks   { get; set; }
    public BotAIType  AIType       { get; set; }

    // Cooldowns de decisión
    public int DodgeCooldown  { get; set; }
    public int AttackCooldown { get; set; }
    public int FleeTimer      { get; set; }

    // Target tracking
    public float TargetX { get; set; }
    public float TargetY { get; set; }
    public bool  HasTarget { get; set; }
}

public static class BotFSM
{
    public static BotAIState Evaluate(
        PlayerState bot,
        BotFSMData  ai,
        PlayerState? target,
        bool        projectileIncoming,
        float       nearestWeaponDist)
    {
        ai.StateTicks++;
        if (ai.DodgeCooldown > 0) ai.DodgeCooldown--;

        // Sin objetivo → Idle
        if (target == null || !target.IsAlive)
            return BotAIState.Idle;

        float dist = MathF.Sqrt(
            MathF.Pow(target.X - bot.X, 2) +
            MathF.Pow(target.Y - bot.Y, 2));

        // ── Prioridad 1: Dodge ────────────────────────────────
        // Sólo bots con IA Hard, Soldier, Assassin o Cowboy
        if (projectileIncoming && ai.DodgeCooldown <= 0 &&
            ai.AIType is BotAIType.Hard or BotAIType.Soldier
                      or BotAIType.AssassinMelee or BotAIType.AssassinRange
                      or BotAIType.Cowboy)
        {
            ai.DodgeCooldown = 30; // 0.5s cooldown entre dodges
            return BotAIState.Dodge;
        }

        // ── Prioridad 2: Flee ─────────────────────────────────
        if (bot.Health <= GameConstants.AI_FleeHPThreshold &&
            bot.EquippedWeapon == WeaponType.Fists)
        {
            return BotAIState.Flee;
        }

        // ── Prioridad 3: Recoger arma ─────────────────────────
        if (bot.EquippedWeapon == WeaponType.Fists &&
            nearestWeaponDist <= GameConstants.AI_WpnSearchInSight)
        {
            return BotAIState.Pickup;
        }

        // ── Prioridad 4: Ataque melee ─────────────────────────
        if (dist <= GameConstants.AI_MeleeRange)
        {
            return BotAIState.Attack;
        }

        // ── Prioridad 5: Cobertura ────────────────────────────
        // Sólo Hard/Soldier con obstáculo cerca
        if (ai.AIType is BotAIType.Hard or BotAIType.Soldier &&
            bot.Health < 50f && projectileIncoming)
        {
            return BotAIState.Cover;
        }

        // ── Prioridad 6: Strafe (tiene arma de fuego en rango) ─
        bool hasRangedWeapon = bot.EquippedWeapon != WeaponType.Fists &&
            WeaponDatabase.Get(bot.EquippedWeapon).Category == WeaponCategory.Firearm;

        if (hasRangedWeapon && dist <= GameConstants.AI_DetectionRange)
        {
            return BotAIState.Strafe;
        }

        // ── Prioridad 7: Chase ────────────────────────────────
        if (dist <= GameConstants.AI_DetectionRange)
        {
            return ai.AIType == BotAIType.Zombie
                ? BotAIState.Chase  // zombie siempre va directo
                : BotAIState.Chase;
        }

        return BotAIState.Idle;
    }
}
