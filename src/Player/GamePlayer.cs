// =============================================================
// GamePlayer.cs — Jugador/Bot con sprite real, sin deformación
// Usa Sprite2D.FlipH para girar — NUNCA modifica Scale
// =============================================================

using Godot;
using System;

namespace SuperN;

public partial class GamePlayer : CharacterBody2D
{
    // ─── Exports ──────────────────────────────────────────────
    [Export] public int  PlayerId { get; set; } = 1;
    [Export] public bool IsBot    { get; set; } = false;

    // ─── Física ───────────────────────────────────────────────
    private const float Gravity      = 980f;
    private const float RunSpeed     = 230f;
    private const float JumpVelocity = -530f;
    private const float Friction     = 0.80f;

    // ─── Combate ──────────────────────────────────────────────
    public float Health    { get; private set; } = 100f;
    public const float MaxHealth = 100f;
    public bool  IsAlive   => Health > 0f;

    private int   _attackCooldown = 0;
    private int   _hitstunTimer   = 0;
    private bool  _facingRight    = true;
    private string _state         = "idle";

    // ─── Nodos ────────────────────────────────────────────────
    private Sprite2D    _sprite  = null!;
    private ProgressBar _hpBar   = null!;
    private Area2D      _melee   = null!;

    // ─── Bot IA ───────────────────────────────────────────────
    private GamePlayer? _target;
    private float _botJumpTimer = 0f;

    // ─── Señales ──────────────────────────────────────────────
    [Signal] public delegate void PlayerDiedEventHandler(int playerId);

    // ══════════════════════════════════════════════════════════
    public override void _Ready()
    {
        _sprite = GetNode<Sprite2D>("Sprite");
        _hpBar  = GetNode<ProgressBar>("HPBar");
        _melee  = GetNode<Area2D>("MeleeBox");

        // Sprite arranca mirando a la derecha
        _sprite.FlipH = false;

        AddToGroup("players");
    }

    // ══════════════════════════════════════════════════════════
    public override void _PhysicsProcess(double delta)
    {
        if (!IsAlive) return;

        float dt  = (float)delta;
        var   vel = Velocity;

        // ── Gravedad ──────────────────────────────────────────
        if (!IsOnFloor())
            vel.Y += Gravity * dt;
        else if (vel.Y > 0f)
            vel.Y = 0f;

        // ── Hitstun: no puede moverse ──────────────────────────
        if (_hitstunTimer > 0)
        {
            _hitstunTimer--;
            vel.X *= 0.85f;
            Velocity = vel;
            MoveAndSlide();
            UpdateSprite();
            return;
        }

        // ── Input ─────────────────────────────────────────────
        float moveX = 0f;
        bool  jump  = false;
        bool  melee = false;

        if (!IsBot)
            GetPlayerInput(ref moveX, ref jump, ref melee);
        else
            GetBotInput(dt, ref moveX, ref jump, ref melee);

        // ── Movimiento horizontal ──────────────────────────────
        if (MathF.Abs(moveX) > 0.05f)
        {
            vel.X        = moveX * RunSpeed;
            _facingRight = moveX > 0f;
            _state       = IsOnFloor() ? "run" : _state;
        }
        else
        {
            vel.X *= Friction;
            if (MathF.Abs(vel.X) < 4f) { vel.X = 0f; }
            if (IsOnFloor()) _state = "idle";
        }

        // ── Salto ─────────────────────────────────────────────
        if (jump && IsOnFloor())
        {
            vel.Y  = JumpVelocity;
            _state = "jump";
        }

        // ── Estado en el aire ─────────────────────────────────
        if (!IsOnFloor())
            _state = vel.Y < 0f ? "jump" : "fall";

        // ── Melee ─────────────────────────────────────────────
        if (_attackCooldown > 0) _attackCooldown--;

        if (melee && _attackCooldown == 0 && IsOnFloor())
        {
            _attackCooldown = 28;   // ~0.47 s a 60 fps
            _state          = "attack";
            DoMelee();
        }

        Velocity = vel;
        MoveAndSlide();
        UpdateSprite();
    }

    // ── Input jugador humano ───────────────────────────────────
    private static void GetPlayerInput(ref float moveX, ref bool jump, ref bool melee)
    {
        moveX = Input.GetAxis("move_left", "move_right");
        jump  = Input.IsActionJustPressed("jump");
        melee = Input.IsActionJustPressed("attack_melee");
    }

    // ── IA del bot ────────────────────────────────────────────
    private void GetBotInput(float dt, ref float moveX, ref bool jump, ref bool melee)
    {
        if (_target == null || !_target.IsAlive) return;

        float dx    = _target.GlobalPosition.X - GlobalPosition.X;
        float absDx = MathF.Abs(dx);

        if (absDx > 55f)
            moveX = dx > 0f ? 1f : -1f;   // perseguir
        else
        {
            moveX = 0f;
            melee = true;                   // atacar si está cerca
        }

        // Salto aleatorio
        _botJumpTimer -= dt;
        if (_botJumpTimer <= 0f && IsOnFloor())
        {
            if (GD.Randf() < 0.25f) jump = true;
            _botJumpTimer = 0.9f + GD.Randf() * 1.4f;
        }
    }

    // ── Golpe melee ───────────────────────────────────────────
    private void DoMelee()
    {
        foreach (var body in _melee.GetOverlappingBodies())
        {
            if (body is GamePlayer other && other != this && other.IsAlive)
            {
                float kbX = (_facingRight ? 1f : -1f) * 200f;
                other.TakeDamage(14f, kbX, -280f);
            }
        }
    }

    // ── Recibir daño ──────────────────────────────────────────
    public void TakeDamage(float amount, float knockX, float knockY)
    {
        if (!IsAlive) return;

        Health = MathF.Max(0f, Health - amount);
        _hpBar.Value = Health;

        var vel = Velocity;
        vel.X = knockX;
        vel.Y = knockY;
        Velocity = vel;

        _hitstunTimer = 18;
        _state        = "hitstun";

        if (Health <= 0f)
        {
            _state = "dead";
            SetPhysicsProcess(false);
            EmitSignal(SignalName.PlayerDied, PlayerId);
        }
    }

    // ── Actualizar sprite: solo FlipH, nunca Scale ────────────
    private void UpdateSprite()
    {
        // Girar mirando en la dirección correcta SIN deformar
        _sprite.FlipH = !_facingRight;

        // Modulate (color tinte) para feedback visual
        _sprite.Modulate = _state switch
        {
            "hitstun" => new Color(1f, 0.35f, 0.1f, 1f),   // naranja al recibir golpe
            "attack"  => new Color(1f, 1f,    0.4f, 1f),   // amarillo al atacar
            "dead"    => new Color(0.5f, 0.5f, 0.5f, 0.7f),// gris al morir
            _         => Color.FromHsv(0f, 0f, 1f, 1f),    // blanco normal
        };
    }

    // ── API pública ───────────────────────────────────────────
    public void SetTarget(GamePlayer target) => _target = target;
}
