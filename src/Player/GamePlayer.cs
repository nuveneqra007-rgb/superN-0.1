// =============================================================
// GamePlayer.cs — Jugador completo y funcional para Godot 4
// Auto-contenido: física, input, animación, salud, combate
// =============================================================

using Godot;
using System;

namespace SuperN;

public partial class GamePlayer : CharacterBody2D
{
    // ─── Exports ──────────────────────────────────────────────
    [Export] public int   PlayerId    { get; set; } = 1;
    [Export] public bool  IsBot       { get; set; } = false;
    [Export] public Color PlayerColor { get; set; } = new Color(0.2f, 0.6f, 1f);

    // ─── Física ───────────────────────────────────────────────
    private const float Gravity     = 980f;
    private const float RunSpeed    = 220f;
    private const float JumpVelocity = -520f;
    private const float Friction    = 0.78f;

    // ─── Combate ──────────────────────────────────────────────
    public float Health    { get; private set; } = 100f;
    public float MaxHealth { get; private set; } = 100f;
    public bool  IsAlive   => Health > 0f;

    private int  _attackCooldown  = 0;
    private bool _facingRight     = true;

    // ─── Nodos hijos ──────────────────────────────────────────
    private ColorRect    _body      = null!;
    private ColorRect    _head      = null!;
    private Label        _nameLabel = null!;
    private ProgressBar  _hpBar     = null!;
    private Label        _stateLabel = null!;
    private Area2D       _meleeBox  = null!;

    // ─── Bot IA simple ────────────────────────────────────────
    private GamePlayer? _target;
    private float _botActionTimer = 0f;
    private float _botJumpTimer   = 0f;
    private string _currentState  = "idle";

    public override void _Ready()
    {
        _body       = GetNode<ColorRect>("Body");
        _head       = GetNode<ColorRect>("Head");
        _nameLabel  = GetNode<Label>("NameLabel");
        _hpBar      = GetNode<ProgressBar>("HPBar");
        _stateLabel = GetNode<Label>("StateLabel");
        _meleeBox   = GetNode<Area2D>("MeleeBox");

        _body.Color = PlayerColor;
        _head.Color = PlayerColor.Lightened(0.3f);
        _nameLabel.Text = IsBot ? "BOT" : $"P{PlayerId}";

        _hpBar.MaxValue = MaxHealth;
        _hpBar.Value    = Health;

        AddToGroup("players");
    }

    public override void _PhysicsProcess(double delta)
    {
        if (!IsAlive) return;

        float dt = (float)delta;
        var vel = Velocity;

        // ─── Gravedad ─────────────────────────────────────────
        if (!IsOnFloor())
            vel.Y += Gravity * dt;
        else if (vel.Y > 0)
            vel.Y = 0;

        // ─── Input ────────────────────────────────────────────
        float moveX = 0f;
        bool  jump  = false;
        bool  melee = false;

        if (!IsBot)
        {
            moveX = Input.GetAxis("move_left", "move_right");
            jump  = Input.IsActionJustPressed("jump");
            melee = Input.IsActionJustPressed("attack_melee");
        }
        else
        {
            GetBotInput(dt, ref moveX, ref jump, ref melee);
        }

        // ─── Movimiento horizontal ────────────────────────────
        if (MathF.Abs(moveX) > 0.1f)
        {
            vel.X = moveX * RunSpeed;
            _facingRight = moveX > 0;
            _currentState = "run";
        }
        else
        {
            vel.X *= Friction;
            if (MathF.Abs(vel.X) < 5f) { vel.X = 0; _currentState = "idle"; }
        }

        // ─── Salto ────────────────────────────────────────────
        if (jump && IsOnFloor())
        {
            vel.Y = JumpVelocity;
            _currentState = "jump";
        }

        if (!IsOnFloor())
            _currentState = vel.Y < 0 ? "jump" : "fall";

        // ─── Melee ────────────────────────────────────────────
        if (_attackCooldown > 0) _attackCooldown--;

        if (melee && _attackCooldown == 0 && IsOnFloor())
        {
            _attackCooldown = 30; // 0.5s cooldown
            _currentState = "attack";
            DoMeleeAttack();
        }

        // ─── Flip del sprite ──────────────────────────────────
        Scale = new Vector2(_facingRight ? 1 : -1, 1);

        Velocity = vel;
        MoveAndSlide();

        UpdateVisuals();
    }

    private void GetBotInput(float dt, ref float moveX, ref bool jump, ref bool melee)
    {
        if (_target == null || !_target.IsAlive) return;

        float dist = _target.GlobalPosition.X - GlobalPosition.X;
        float absDist = MathF.Abs(dist);

        // Moverse hacia el objetivo
        moveX = dist > 0 ? 1f : -1f;

        // Atacar si está cerca
        if (absDist < 60f)
        {
            moveX = 0;
            melee = true;
        }

        // Saltar ocasionalmente
        _botJumpTimer -= dt;
        if (_botJumpTimer <= 0 && IsOnFloor())
        {
            if (GD.Randf() < 0.3f) jump = true;
            _botJumpTimer = 0.8f + GD.Randf() * 1.5f;
        }
    }

    private void DoMeleeAttack()
    {
        // Detectar jugadores en el área de melee
        var bodies = _meleeBox.GetOverlappingBodies();
        foreach (var body in bodies)
        {
            if (body is GamePlayer other && other != this)
            {
                other.TakeDamage(15f, (_facingRight ? 1 : -1) * 180f, -300f);
            }
        }
    }

    public void TakeDamage(float amount, float knockX, float knockY)
    {
        if (!IsAlive) return;
        Health = MathF.Max(0, Health - amount);
        _hpBar.Value = Health;

        // Knockback
        var vel = Velocity;
        vel.X = knockX;
        vel.Y = knockY;
        Velocity = vel;

        _currentState = "hitstun";

        if (Health <= 0)
        {
            _currentState = "dead";
            _body.Color = new Color(0.4f, 0.1f, 0.1f);
            SetPhysicsProcess(false);
            EmitSignal(SignalName.PlayerDied, PlayerId);
        }
    }

    private void UpdateVisuals()
    {
        // Color según estado
        _body.Color = _currentState switch
        {
            "attack"  => PlayerColor.Lightened(0.5f),
            "hitstun" => new Color(1f, 0.3f, 0.1f),
            "dead"    => new Color(0.3f, 0.05f, 0.05f),
            _         => PlayerColor,
        };

        _stateLabel.Text = _currentState;
        _hpBar.Value     = Health;
    }

    public void SetTarget(GamePlayer target) => _target = target;

    [Signal] public delegate void PlayerDiedEventHandler(int playerId);
}
