// =============================================================
// BotController.cs — Controlador de IA que alimenta Player.SetBotInput
// Basado en BotExtended BotFSM states y BotInfos.cs
// =============================================================

using Godot;

namespace SuperN;

public partial class BotController : Node
{
    private Player     _botPlayer  = null!;
    private Player?    _target     = null;
    private BotFSMData _ai         = null!;
    private BotArchetypeData _arch = null!;

    private float _strafeDirX = 1f;
    private int   _strafeChangeTicks = 0;

    public void Init(Player botPlayer, Player? humanTarget)
    {
        _botPlayer = botPlayer;
        _target    = humanTarget;
        _arch      = BotArchetypeDatabase.Get(botPlayer.BotFaction);
        _ai        = new BotFSMData { AIType = _arch.AIType };
    }

    public override void _PhysicsProcess(double delta)
    {
        if (!_botPlayer.State.IsAlive) return;

        var state  = _botPlayer.State;
        var target = _target?.State;

        // Evaluar IA
        float nearestWpnDist = FindNearestWeaponDist();
        bool  projectileIncoming = CheckProjectileIncoming();

        BotAIState aiState = BotFSM.Evaluate(
            state, _ai, target, projectileIncoming, nearestWpnDist);

        // Traducir estado IA a input
        TranslateAIToInput(aiState, state, target);
    }

    private void TranslateAIToInput(BotAIState aiState, PlayerState bot, PlayerState? target)
    {
        float moveX  = 0f;
        bool  jump   = false;
        bool  crouch = false;
        bool  melee  = false;
        bool  fire   = false;

        float targetDist = target != null
            ? MathF.Abs(target.X - bot.X)
            : float.MaxValue;

        switch (aiState)
        {
            case BotAIState.Idle:
                // Pequeña patrulla aleatoria
                moveX = MathF.Sin(Time.GetTicksMsec() * 0.001f) > 0 ? 0.3f : -0.3f;
                break;

            case BotAIState.Chase:
                if (target != null)
                    moveX = target.X > bot.X ? 1f : -1f;
                // Saltar si hay plataforma o obstáculo en medio
                jump = bot.OnGround && ShouldJumpToReachTarget(bot, target);
                break;

            case BotAIState.Attack:
                // Melee range — atacar
                melee = true;
                // Acercarse un poco más si no está dentro del hitbox
                if (targetDist > GameConstants.AI_MeleeRange * 0.7f)
                    moveX = target != null && target.X > bot.X ? 1f : -1f;
                break;

            case BotAIState.Strafe:
                // Cambiar dirección de strafe cada ~60 ticks
                _strafeChangeTicks++;
                if (_strafeChangeTicks > 60)
                {
                    _strafeDirX = -_strafeDirX;
                    _strafeChangeTicks = 0;
                }
                moveX = _strafeDirX * 0.6f;

                // Apuntar y disparar
                fire = bot.AttackCooldown <= 0 && bot.Ammo > 0;

                // Ajustar distancia preferida
                if (target != null && targetDist < 80f)
                    moveX = bot.X > target.X ? 1f : -1f; // alejarse
                break;

            case BotAIState.Dodge:
                // Roll o salto para esquivar proyectil
                if (bot.OnGround && bot.Stamina >= GameConstants.StaminaCostRoll)
                    crouch = true; // activar slide/roll
                else
                    jump = bot.OnGround;
                break;

            case BotAIState.Flee:
                // Huir en dirección opuesta al objetivo
                if (target != null)
                    moveX = target.X > bot.X ? -1f : 1f;
                jump = bot.OnGround && ShouldJumpToReachTarget(bot, target);
                break;

            case BotAIState.Pickup:
                // Moverse hacia el arma más cercana
                var wpnPos = FindNearestWeaponPosition(bot);
                if (wpnPos.HasValue)
                    moveX = wpnPos.Value.X > bot.X ? 1f : -1f;
                break;

            case BotAIState.Cover:
                crouch = true;
                moveX  = 0f;
                break;
        }

        _botPlayer.SetBotInput(moveX, jump, crouch, melee, fire);
    }

    // ─── Helpers ──────────────────────────────────────────────

    private bool ShouldJumpToReachTarget(PlayerState bot, PlayerState? target)
    {
        if (target == null) return false;
        // Saltar si el objetivo está más arriba que el bot
        return target.Y < bot.Y - 32f;
    }

    private float FindNearestWeaponDist()
    {
        // Busca WorldWeapon nodes en la escena
        var weapons = GetTree().GetNodesInGroup("world_weapons");
        float minDist = float.MaxValue;
        var botPos = _botPlayer.GlobalPosition;

        foreach (var node in weapons)
        {
            if (node is Node2D wpn)
            {
                float d = botPos.DistanceTo(wpn.GlobalPosition);
                if (d < minDist) minDist = d;
            }
        }
        return minDist;
    }

    private Vector2? FindNearestWeaponPosition(PlayerState bot)
    {
        var weapons = GetTree().GetNodesInGroup("world_weapons");
        float minDist = float.MaxValue;
        Vector2? closest = null;

        foreach (var node in weapons)
        {
            if (node is Node2D wpn)
            {
                float d = MathF.Sqrt(MathF.Pow(wpn.GlobalPosition.X - bot.X, 2) +
                                     MathF.Pow(wpn.GlobalPosition.Y - bot.Y, 2));
                if (d < minDist) { minDist = d; closest = wpn.GlobalPosition; }
            }
        }
        return closest;
    }

    private bool CheckProjectileIncoming()
    {
        // Detectar proyectiles en el grupo "projectiles" cercanos al bot
        var projectiles = GetTree().GetNodesInGroup("projectiles");
        var botPos = _botPlayer.GlobalPosition;

        foreach (var node in projectiles)
        {
            if (node is Node2D proj)
            {
                float d = botPos.DistanceTo(proj.GlobalPosition);
                if (d < 120f) return true;
            }
        }
        return false;
    }
}
