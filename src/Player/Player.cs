// =============================================================
// Player.cs — Nodo Godot 4 CharacterBody2D del jugador
// Conecta la simulación pura con el render de Godot
// =============================================================

using Godot;

using System;

namespace SuperN;

public partial class Player : CharacterBody2D
{
	// ─── Export vars (editor) ─────────────────────────────────
	[Export] public int   PlayerId       { get; set; } = 1;
	[Export] public bool  IsBot          { get; set; } = false;
	[Export] public BotFaction BotFaction { get; set; } = BotFaction.Thug;

	// ─── Nodos hijos ──────────────────────────────────────────
	private AnimatedSprite2D _sprite    = null!;
	private CollisionShape2D _standing  = null!;
	private CollisionShape2D _crouching = null!;
	private HealthBar        _healthBar = null!;

	// ─── Estado de simulación ─────────────────────────────────
	public  PlayerState State       { get; private set; } = null!;
	private BotFSMData  _botFSM     = null!;
	private BotArchetypeData? _arch = null;

	// ─── Input buffer (sólo jugador humano) ───────────────────
	private struct InputSnapshot
	{
		public float MoveX;
		public bool  Jump, Crouch, MeleeAttack, Fire, Throw, Sprint;
	}
	private InputSnapshot _input;

	public override void _Ready()
	{
		_sprite    = GetNode<AnimatedSprite2D>("Sprite");
		_standing  = GetNode<CollisionShape2D>("StandShape");
		_crouching = GetNode<CollisionShape2D>("CrouchShape");
		_healthBar = GetNode<HealthBar>("HealthBar");

		State = new PlayerState
		{
			Id    = PlayerId,
			IsBot = IsBot,
			X     = GlobalPosition.X,
			Y     = GlobalPosition.Y,
		};

		if (IsBot)
		{
			_arch   = BotArchetypeDatabase.Get(BotFaction);
			_botFSM = new BotFSMData { AIType = _arch.AIType };
			State.MaxHealth         = _arch.MaxHealth;
			State.Health            = _arch.MaxHealth;
			State.SpeedModifier     = _arch.SpeedModifier;
			State.DamageDealtModifier = _arch.DamageDealtModifier;
			State.DamageTakenModifier = _arch.DamageTakenModifier;
			if (_arch.PreferredWeapon.HasValue)
			{
				State.EquippedWeapon = _arch.PreferredWeapon.Value;
				State.Ammo           = WeaponDatabase.Get(State.EquippedWeapon).MagSize;
			}
		}
	}

	public override void _PhysicsProcess(double delta)
	{
		if (!State.IsAlive) return;

		// 1. Leer input
		if (!IsBot)
			ReadHumanInput();
		// Bot input se lee desde BotController

		// 2. Aplicar movimiento al estado
		ProcessMovement();

		// 3. Tick de FSM
		PlayerFSM.Tick(State);

		// 4. Sincronizar posición Godot ↔ simulación
		Velocity = new Vector2(State.VelocityX, State.VelocityY);
		MoveAndSlide();

		State.X = GlobalPosition.X;
		State.Y = GlobalPosition.Y;
		State.OnGround = IsOnFloor();

		// 5. Actualizar visuals
		UpdateAnimation();
		UpdateHealthBar();
	}

	private void ReadHumanInput()
	{
		_input = new InputSnapshot
		{
			MoveX       = Input.GetAxis("move_left", "move_right"),
			Jump        = Input.IsActionJustPressed("jump"),
			Crouch      = Input.IsActionPressed("crouch"),
			MeleeAttack = Input.IsActionJustPressed("attack_melee"),
			Fire        = Input.IsActionPressed("attack_fire"),
			Throw       = Input.IsActionJustPressed("throw_grenade"),
			Sprint      = Input.IsActionPressed("move_left") || Input.IsActionPressed("move_right"),
		};
	}

	private void ProcessMovement()
	{
		float speed = GameConstants.RunSpeed * State.SpeedModifier;

		// Horizontal
		if (MathF.Abs(_input.MoveX) > 0.1f &&
			State.FSM is not PlayerFSMState.Roll
					  and not PlayerFSMState.KnockedDown
					  and not PlayerFSMState.GetUp
					  and not PlayerFSMState.Hitstun)
		{
			State.VelocityX = _input.MoveX * speed;
			State.FacingRight = _input.MoveX > 0;

			if (State.OnGround)
				PlayerFSM.TryTransition(State, PlayerFSMState.Run);
		}
		else if (State.FSM != PlayerFSMState.Roll)
		{
			// Desacelerar
			State.VelocityX *= GameConstants.GroundFriction;
			if (State.OnGround && MathF.Abs(State.VelocityX) < 5f)
			{
				State.VelocityX = 0f;
				if (State.FSM == PlayerFSMState.Run)
					PlayerFSM.TryTransition(State, PlayerFSMState.Idle);
			}
		}

		// Salto — con coyote time
		if (_input.Jump && (State.OnGround || State.CoyoteTicks > 0) &&
			State.Stamina >= GameConstants.StaminaCostJump)
		{
			State.VelocityY = GameConstants.JumpVelocity;
			State.Stamina  -= GameConstants.StaminaCostJump;
			State.CoyoteTicks = 0;
			PlayerFSM.TryTransition(State, PlayerFSMState.Jump);
		}

		// Agacharse + Roll (agacharse mientras corre)
		if (_input.Crouch && State.OnGround)
		{
			if (State.FSM == PlayerFSMState.Run &&
				State.Stamina >= GameConstants.StaminaCostRoll &&
				State.AttackCooldown <= 0) // reutilizamos como roll cooldown
			{
				State.Stamina -= GameConstants.StaminaCostRoll;
				State.AttackCooldown = GameConstants.RollCooldownTicks;
				PlayerFSM.TryTransition(State, PlayerFSMState.Roll);
			}
			else if (State.FSM != PlayerFSMState.Roll)
			{
				PlayerFSM.TryTransition(State, PlayerFSMState.Crouch);
			}
		}
		else if (State.FSM == PlayerFSMState.Crouch && !_input.Crouch)
		{
			PlayerFSM.TryTransition(State, PlayerFSMState.Idle);
		}

		// Ataque melee
		if (_input.MeleeAttack && State.AttackCooldown <= 0 &&
			State.FSM is PlayerFSMState.Idle or PlayerFSMState.Run or PlayerFSMState.Crouch)
		{
			State.ComboStep = Math.Min(State.ComboStep, 2);
			State.ComboWindowTicks = GameConstants.FistsComboWindowTicks;
			State.AttackCooldown = GameConstants.FistsCooldownTicks;
			PlayerFSM.TryTransition(State, PlayerFSMState.MeleeAttack);
		}

		// Disparo
		if (_input.Fire && State.AttackCooldown <= 0 &&
			State.EquippedWeapon != WeaponType.Fists &&
			WeaponDatabase.Get(State.EquippedWeapon).Category == WeaponCategory.Firearm)
		{
			var wpn = WeaponDatabase.Get(State.EquippedWeapon);
			State.AttackCooldown = wpn.CooldownTicks;
			PlayerFSM.TryTransition(State, PlayerFSMState.RangedFire);
			// El proyectil se spawna desde el BattleScene
			EmitSignal(SignalName.FireWeapon, (int)State.EquippedWeapon,
					   State.FacingRight ? 1 : -1);
			State.Ammo--;
			if (State.Ammo <= 0) State.EquippedWeapon = WeaponType.Fists;
		}

		// Gravedad (sólo para fallback — Godot MoveAndSlide maneja el resto)
		if (!State.OnGround)
		{
			if (State.VelocityY > 0)
				PlayerFSM.TryTransition(State, PlayerFSMState.Fall);
		}

		// Stamina regen
		if (State.OnGround && State.FSM is PlayerFSMState.Idle or PlayerFSMState.Crouch)
			State.Stamina = MathF.Min(GameConstants.MaxStamina,
							 State.Stamina + GameConstants.StaminaRegenPerTick);

		// Sprite flip
		_sprite.FlipH = !State.FacingRight;
	}

	private void UpdateAnimation()
	{
		string anim = State.FSM switch
		{
			PlayerFSMState.Idle        => "idle",
			PlayerFSMState.Walk        => "walk",
			PlayerFSMState.Run         => "run",
			PlayerFSMState.Sprint      => "run",
			PlayerFSMState.Jump        => "jump",
			PlayerFSMState.Fall        => "fall",
			PlayerFSMState.Crouch      => "crouch",
			PlayerFSMState.CrouchSlide => "slide",
			PlayerFSMState.Roll        => "roll",
			PlayerFSMState.MeleeAttack => $"melee_{State.ComboStep + 1}",
			PlayerFSMState.RangedFire  => "fire",
			PlayerFSMState.Hitstun     => "hitstun",
			PlayerFSMState.KnockedDown => "knockdown",
			PlayerFSMState.GetUp       => "getup",
			PlayerFSMState.Dead        => "dead",
			_                          => "idle",
		};

		if (_sprite.Animation != anim)
			_sprite.Play(anim);

		// Hitbox swap
		_crouching.Disabled = State.FSM is not (PlayerFSMState.Crouch
											 or PlayerFSMState.Roll
											 or PlayerFSMState.CrouchSlide);
		_standing.Disabled = !_crouching.Disabled;
	}

	private void UpdateHealthBar()
	{
		_healthBar?.SetHealth(State.Health, State.MaxHealth);
	}

	// ─── Señales ──────────────────────────────────────────────
	[Signal] public delegate void FireWeaponEventHandler(int weaponType, int direction);
	[Signal] public delegate void PlayerDiedEventHandler(int playerId);

	// ─── API pública para BattleScene ─────────────────────────
	public void ApplyHit(HitResult hit)
	{
		// Ya aplicado en CombatSystem — sólo efectos visuales aquí
		if (!hit.DidHit) return;
		// Spawn de partículas de sangre, flash, etc.
	}

	public void SetBotInput(float moveX, bool jump, bool crouch,
							 bool melee, bool fire)
	{
		_input = new InputSnapshot
		{
			MoveX       = moveX,
			Jump        = jump,
			Crouch      = crouch,
			MeleeAttack = melee,
			Fire        = fire,
		};
	}
}
