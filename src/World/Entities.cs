// =============================================================
// Projectile.cs — Nodo de proyectil (bala, cohete, llama)
// =============================================================

using Godot;
using System;

namespace SuperN;

public partial class Projectile : Area2D
{
    private float _damage;
    private int   _onFireDuration;
    private float _explosionRadius;
    private int   _pelletCount;
    private PlayerState? _shooter;

    private Vector2 _velocity;
    private int     _lifeTicks;
    private const int MaxLifeTicks = 120; // 2s

    public void Init(Vector2 startPos, Vector2 velocity, float damage,
                     int onFireDuration, float explosionRadius,
                     PlayerState shooterState, int pelletCount = 1)
    {
        GlobalPosition   = startPos;
        _velocity        = velocity;
        _damage          = damage;
        _onFireDuration  = onFireDuration;
        _explosionRadius = explosionRadius;
        _shooter         = shooterState;
        _pelletCount     = pelletCount;
    }

    public override void _PhysicsProcess(double delta)
    {
        GlobalPosition += _velocity * (float)delta;
        _lifeTicks++;

        if (_lifeTicks >= MaxLifeTicks)
            QueueFree();
    }

    public override void _Ready()
    {
        BodyEntered += OnBodyEntered;
    }

    private void OnBodyEntered(Node2D body)
    {
        if (body is not Player targetPlayer) return;
        if (_shooter != null && targetPlayer.State.Id == _shooter.Id) return;

        if (_explosionRadius > 0)
        {
            // Proyectil explosivo — splash damage a todos en radio
            var players = GetTree().GetNodesInGroup("players");
            foreach (var node in players)
            {
                if (node is Player p)
                {
                    var hit = CombatSystem.ResolveExplosion(
                        p.State, GlobalPosition.X, GlobalPosition.Y,
                        _explosionRadius, _damage);
                    p.ApplyHit(hit);
                }
            }
            // Spawn de efecto de explosión
            EmitSignal(SignalName.Exploded, GlobalPosition);
        }
        else
        {
            for (int i = 0; i < _pelletCount; i++)
            {
                var hit = CombatSystem.ResolveProjectile(
                    _shooter ?? new PlayerState(),
                    targetPlayer.State,
                    WeaponType.Pistol, // aproximación — el daño ya está calculado
                    GlobalPosition.X, GlobalPosition.Y);
                targetPlayer.ApplyHit(hit);
            }
        }

        QueueFree();
    }

    [Signal] public delegate void ExplodedEventHandler(Vector2 position);
}

// =============================================================
// GrenadeNode.cs — Granada con temporizador o impacto (Molotov)
// =============================================================

public partial class GrenadeNode : RigidBody2D
{
    private float _damage;
    private float _radius;
    private int   _timerTicks;
    private bool  _isMolotov;
    private PlayerState? _shooter;
    private int   _elapsed;

    public void Init(Vector2 startPos, Vector2 velocity, float damage,
                     float radius, int timerTicks, bool isMolotov,
                     PlayerState shooterState)
    {
        GlobalPosition = startPos;
        LinearVelocity = velocity;
        GravityScale   = 1f;
        _damage        = damage;
        _radius        = radius;
        _timerTicks    = timerTicks;
        _isMolotov     = isMolotov;
        _shooter       = shooterState;
    }

    public override void _PhysicsProcess(double delta)
    {
        _elapsed++;
        if (_timerTicks > 0 && _elapsed >= _timerTicks)
            Explode();
    }

    public override void _Ready()
    {
        BodyEntered += (body) =>
        {
            if (_isMolotov) Explode(); // Molotov explota al impactar
        };
    }

    private void Explode()
    {
        var players = GetTree().GetNodesInGroup("players");
        foreach (var node in players)
        {
            if (node is Player p)
            {
                var hit = CombatSystem.ResolveExplosion(
                    p.State, GlobalPosition.X, GlobalPosition.Y,
                    _radius, _damage);
                p.ApplyHit(hit);
            }
        }
        EmitSignal(SignalName.Exploded, GlobalPosition, _isMolotov);
        QueueFree();
    }

    [Signal] public delegate void ExplodedEventHandler(Vector2 pos, bool isMolotov);
}

// =============================================================
// WorldWeapon.cs — Arma en suelo esperando ser recogida
// =============================================================

public partial class WorldWeapon : Area2D
{
    public WeaponType WeaponType { get; private set; }

    public void Init(WeaponType type, Vector2 position)
    {
        WeaponType     = type;
        GlobalPosition = position;
    }

    public override void _Ready()
    {
        BodyEntered += (body) =>
        {
            if (body is not Player player) return;
            var state = player.State;

            // Recoger agachándose o si no tiene arma (Player.as)
            bool canPickup = state.FSM == PlayerFSMState.Crouch ||
                             state.EquippedWeapon == WeaponType.Fists;
            if (!canPickup) return;

            var wpn = WeaponDatabase.Get(WeaponType);
            state.EquippedWeapon = WeaponType;
            state.Ammo           = wpn.MagSize;
            QueueFree();
        };
    }
}
