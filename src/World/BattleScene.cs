// =============================================================
// BattleScene.cs — Escena principal de combate
// Orquesta jugadores, bots, proyectiles, armas y rondas
// =============================================================

using Godot;

namespace SuperN;

public partial class BattleScene : Node2D
{
    // ─── Exports ──────────────────────────────────────────────
    [Export] public int MaxRounds { get; set; } = 3;
    [Export] public BotFaction BotFaction { get; set; } = BotFaction.Thug;

    // ─── Nodos ────────────────────────────────────────────────
    private Player         _human   = null!;
    private Player         _bot     = null!;
    private BotController  _botCtrl = null!;
    private Node           _projectileContainer = null!;
    private Node           _weaponContainer     = null!;

    // Armas precargadas
    private readonly PackedScene _projectileScene =
        GD.Load<PackedScene>("res://scenes/entities/Projectile.tscn");
    private readonly PackedScene _grenadeScene =
        GD.Load<PackedScene>("res://scenes/entities/Grenade.tscn");
    private readonly PackedScene _worldWeaponScene =
        GD.Load<PackedScene>("res://scenes/entities/WorldWeapon.tscn");

    // ─── Estado de ronda ──────────────────────────────────────
    private int _humanScore;
    private int _botScore;
    private int _currentRound = 1;
    private bool _roundActive;

    // Spawn de armas cada 20s (1200 ticks @ 60Hz) — AS3 original
    private int _weaponSpawnTimer = 0;
    private const int WeaponSpawnInterval = 1200;

    private static readonly WeaponType[] SpawnableWeapons =
    [
        WeaponType.Pistol, WeaponType.Magnum, WeaponType.Uzi, WeaponType.Rifle,
        WeaponType.Shotgun, WeaponType.Sniper, WeaponType.Bazooka,
        WeaponType.Flamethrower, WeaponType.Grenade, WeaponType.Molotov,
        WeaponType.Axe, WeaponType.Sword, WeaponType.Machete,
    ];

    public override void _Ready()
    {
        _human  = GetNode<Player>("Players/Human");
        _bot    = GetNode<Player>("Players/Bot");
        _botCtrl= GetNode<BotController>("BotController");
        _projectileContainer = GetNode("Projectiles");
        _weaponContainer     = GetNode("WorldWeapons");

        _botCtrl.Init(_bot, _human);

        // Conectar señales de disparo
        _human.FireWeapon += OnFireWeapon;
        _bot.FireWeapon   += OnFireWeapon;

        StartRound();
    }

    public override void _PhysicsProcess(double delta)
    {
        if (!_roundActive) return;

        // Spawn periódico de armas
        _weaponSpawnTimer++;
        if (_weaponSpawnTimer >= WeaponSpawnInterval)
        {
            SpawnRandomWeapon();
            _weaponSpawnTimer = 0;
        }

        // Daño de fuego por tick
        CombatSystem.TickFireDamage(_human.State);
        CombatSystem.TickFireDamage(_bot.State);

        // Verificar fin de ronda
        if (!_human.State.IsAlive || !_bot.State.IsAlive)
            EndRound();
    }

    // ─── Disparo ──────────────────────────────────────────────
    private void OnFireWeapon(int weaponTypeInt, int direction)
    {
        var shooter = weaponTypeInt >= 0 ? _human : _bot;
        var wpnType = (WeaponType)Math.Abs(weaponTypeInt);
        var wpn     = WeaponDatabase.Get(wpnType);

        if (wpn.Category == WeaponCategory.Throwable)
        {
            SpawnGrenade(shooter, wpnType, direction);
            return;
        }

        SpawnProjectile(shooter, wpnType, direction, wpn);
    }

    private void SpawnProjectile(Player shooter, WeaponType wpnType,
                                  int direction, WeaponData wpn)
    {
        if (_projectileScene == null) return;
        var proj = _projectileScene.Instantiate<Projectile>();
        _projectileContainer.AddChild(proj);

        // Dispersión (AccuracyDeg)
        float angle = DegToRad(
            (GD.Randf() * 2f - 1f) * wpn.AccuracyDeg) * direction;

        proj.Init(
            startPos: shooter.GlobalPosition + new Vector2(direction * 16f, -8f),
            velocity: new Vector2(
                MathF.Cos(angle) * wpn.ProjectileSpeed * direction,
                MathF.Sin(angle) * wpn.ProjectileSpeed),
            damage: wpn.Damage * shooter.State.DamageDealtModifier,
            onFireDuration: wpn.OnFireDuration,
            explosionRadius: wpn.ExplosionRadius,
            shooterState: shooter.State,
            pelletCount: wpn.PelletCount
        );
        proj.AddToGroup("projectiles");
    }

    private void SpawnGrenade(Player thrower, WeaponType type, int direction)
    {
        if (_grenadeScene == null) return;
        var grenade = _grenadeScene.Instantiate<GrenadeNode>();
        _projectileContainer.AddChild(grenade);

        grenade.Init(
            startPos: thrower.GlobalPosition + new Vector2(direction * 12f, -10f),
            velocity: new Vector2(direction * 280f, -350f),
            damage:   WeaponDatabase.Get(type).Damage,
            radius:   type == WeaponType.Grenade
                ? GameConstants.GrenadeExplosionRadius
                : GameConstants.MolotovFireZone,
            timerTicks: type == WeaponType.Grenade
                ? GameConstants.GrenadeTimerTicks
                : 0, // Molotov explota al impacto
            isMolotov: type == WeaponType.Molotov,
            shooterState: thrower.State
        );
        grenade.AddToGroup("projectiles");
    }

    // ─── Spawns de armas ──────────────────────────────────────
    private void SpawnRandomWeapon()
    {
        if (_worldWeaponScene == null) return;
        var wpnNode = _worldWeaponScene.Instantiate<WorldWeapon>();
        _weaponContainer.AddChild(wpnNode);
        wpnNode.AddToGroup("world_weapons");

        // Elegir arma y posición aleatoria de spawn
        int idx = GD.RandRange(0, SpawnableWeapons.Length - 1);
        var spawnPoints = GetTree().GetNodesInGroup("weapon_spawn");
        Vector2 pos = spawnPoints.Count > 0
            ? ((Node2D)spawnPoints[GD.RandRange(0, spawnPoints.Count - 1)]).GlobalPosition
            : new Vector2(GD.RandfRange(100, 860), 200f);

        wpnNode.Init(SpawnableWeapons[idx], pos);
    }

    // ─── Gestión de rondas ────────────────────────────────────
    private void StartRound()
    {
        _roundActive = true;
        _weaponSpawnTimer = WeaponSpawnInterval / 2; // primera arma a los 10s

        // Emitir evento de inicio de ronda para UI
        EmitSignal(SignalName.RoundStarted, _currentRound, MaxRounds,
                   _humanScore, _botScore);
    }

    private void EndRound()
    {
        _roundActive = false;

        bool humanWon = _human.State.IsAlive;
        if (humanWon) _humanScore++;
        else          _botScore++;

        EmitSignal(SignalName.RoundEnded, humanWon, _humanScore, _botScore);

        if (_humanScore >= Mathf.CeilToInt(MaxRounds / 2f + 0.01f) ||
            _botScore   >= Mathf.CeilToInt(MaxRounds / 2f + 0.01f))
        {
            EmitSignal(SignalName.MatchEnded, _humanScore > _botScore);
        }
        else
        {
            _currentRound++;
            GetTree().CreateTimer(2.0).Timeout += () => GetTree().ReloadCurrentScene();
        }
    }

    // ─── Señales ──────────────────────────────────────────────
    [Signal] public delegate void RoundStartedEventHandler(
        int round, int maxRounds, int p1Score, int p2Score);
    [Signal] public delegate void RoundEndedEventHandler(
        bool humanWon, int p1Score, int p2Score);
    [Signal] public delegate void MatchEndedEventHandler(bool humanWon);

    private static float DegToRad(float deg) => deg * MathF.PI / 180f;
}
