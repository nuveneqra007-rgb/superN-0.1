// =============================================================
// WeaponData.cs — Definición declarativa de las 13 armas
// Ground Truth: Weapons.as (AS3 original Superfighters)
// =============================================================

namespace SuperN;

public enum WeaponType
{
    // Melee
    Fists,   // base
    Machete, // Weapons.as:122
    Axe,     // Weapons.as:98
    Sword,   // Weapons.as:110

    // Firearms
    Pistol,       // Weapons.as:167
    Magnum,       // Weapons.as:261
    Uzi,          // Weapons.as:217
    Rifle,        // Weapons.as:192
    Shotgun,      // Weapons.as:243
    Sniper,       // Weapons.as:280
    Bazooka,      // Weapons.as:298
    Flamethrower, // Weapons.as:324

    // Throwables
    Grenade, // Weapons.as:142
    Molotov, // Weapons.as:150

    // Power-ups
    Slowmo05,
    Slowmo10,
    Pills,
    Medkit
}

public enum WeaponCategory { Melee, Firearm, Throwable, Powerup }

public record WeaponData(
    WeaponType   Type,
    string       Name,
    WeaponCategory Category,
    float        Damage,
    int          MagSize,       // -1 = infinito (melee)
    int          CooldownTicks, // ticks @ 60Hz entre ataques
    float        ProjectileSpeed,
    float        AccuracyDeg,   // ángulo máx de desvío
    int          PelletCount = 1,
    float        ExplosionRadius = 0f,
    bool         HasLaserSight = false,
    int          OnFireDuration = 0  // ticks que prende fuego al objetivo
);

public static class WeaponDatabase
{
    public static readonly IReadOnlyDictionary<WeaponType, WeaponData> All =
        new Dictionary<WeaponType, WeaponData>
        {
            // ── MELEE ──────────────────────────────────────────────────
            [WeaponType.Fists] = new(
                WeaponType.Fists, "Fists", WeaponCategory.Melee,
                Damage: 6f,  // combo: 6/7/8 — ver GameConstants.FistsDamage
                MagSize: -1, CooldownTicks: GameConstants.FistsCooldownTicks,
                ProjectileSpeed: 0f, AccuracyDeg: 0f
            ),
            [WeaponType.Machete] = new(
                WeaponType.Machete, "Machete", WeaponCategory.Melee,
                Damage: 8f,  // combo: 8/9/10
                MagSize: -1, CooldownTicks: 12,
                ProjectileSpeed: 0f, AccuracyDeg: 0f
            ),
            [WeaponType.Axe] = new(
                WeaponType.Axe, "Axe", WeaponCategory.Melee,
                Damage: 11f, // combo: 11/12/13 — Weapons.as:98
                MagSize: -1, CooldownTicks: 12,
                ProjectileSpeed: 0f, AccuracyDeg: 0f
            ),
            [WeaponType.Sword] = new(
                WeaponType.Sword, "Sword", WeaponCategory.Melee,
                Damage: 13f, // combo: 13/14/15 — Weapons.as:110
                MagSize: -1, CooldownTicks: 14,
                ProjectileSpeed: 0f, AccuracyDeg: 0f
            ),

            // ── FIREARMS ───────────────────────────────────────────────
            [WeaponType.Pistol] = new(
                WeaponType.Pistol, "Pistol", WeaponCategory.Firearm,
                Damage: GameConstants.PistolDamage,
                MagSize: GameConstants.PistolMag,
                CooldownTicks: GameConstants.PistolCooldown,
                ProjectileSpeed: GameConstants.PistolSpeed,
                AccuracyDeg: GameConstants.PistolAccuracy
            ),
            [WeaponType.Magnum] = new(
                WeaponType.Magnum, "Magnum", WeaponCategory.Firearm,
                Damage: GameConstants.MagnumDamage,
                MagSize: GameConstants.MagnumMag,
                CooldownTicks: GameConstants.MagnumCooldown,
                ProjectileSpeed: GameConstants.MagnumSpeed,
                AccuracyDeg: GameConstants.MagnumAccuracy
            ),
            [WeaponType.Uzi] = new(
                WeaponType.Uzi, "Uzi", WeaponCategory.Firearm,
                Damage: GameConstants.UziDamage,
                MagSize: GameConstants.UziMag,
                CooldownTicks: GameConstants.UziCooldown,
                ProjectileSpeed: GameConstants.UziSpeed,
                AccuracyDeg: GameConstants.UziAccuracy
            ),
            [WeaponType.Rifle] = new(
                WeaponType.Rifle, "Rifle", WeaponCategory.Firearm,
                Damage: GameConstants.RifleDamage,
                MagSize: GameConstants.RifleMag,
                CooldownTicks: GameConstants.RifleCooldown,
                ProjectileSpeed: GameConstants.RifleSpeed,
                AccuracyDeg: GameConstants.RifleAccuracy
            ),
            [WeaponType.Shotgun] = new(
                WeaponType.Shotgun, "Shotgun", WeaponCategory.Firearm,
                Damage: GameConstants.ShotgunDamagePerPellet,
                MagSize: GameConstants.ShotgunShotsInMag,
                CooldownTicks: GameConstants.ShotgunCooldown,
                ProjectileSpeed: GameConstants.ShotgunSpeed,
                AccuracyDeg: GameConstants.ShotgunSpread,
                PelletCount: GameConstants.ShotgunPellets
            ),
            [WeaponType.Sniper] = new(
                WeaponType.Sniper, "Sniper", WeaponCategory.Firearm,
                Damage: GameConstants.SniperDamage,
                MagSize: GameConstants.SniperMag,
                CooldownTicks: GameConstants.SniperCooldown,
                ProjectileSpeed: GameConstants.SniperSpeed,
                AccuracyDeg: GameConstants.SniperAccuracy,
                HasLaserSight: true
            ),
            [WeaponType.Bazooka] = new(
                WeaponType.Bazooka, "Bazooka", WeaponCategory.Firearm,
                Damage: GameConstants.BazookaDamage,
                MagSize: GameConstants.BazookaMag,
                CooldownTicks: GameConstants.BazookaCooldown,
                ProjectileSpeed: GameConstants.BazookaSpeed,
                AccuracyDeg: 2.0f,
                ExplosionRadius: GameConstants.BazookaExplosionRadius
            ),
            [WeaponType.Flamethrower] = new(
                WeaponType.Flamethrower, "Flamethrower", WeaponCategory.Firearm,
                Damage: GameConstants.FlameDmgPerTick,
                MagSize: GameConstants.FlameMag,
                CooldownTicks: 2,   // disparo continuo cada 2 ticks
                ProjectileSpeed: GameConstants.FlameRange,
                AccuracyDeg: GameConstants.FlameSpread,
                OnFireDuration: GameConstants.OnFireDuration
            ),

            // ── THROWABLES ─────────────────────────────────────────────
            [WeaponType.Grenade] = new(
                WeaponType.Grenade, "Grenade", WeaponCategory.Throwable,
                Damage: GameConstants.GrenadeDamage,
                MagSize: GameConstants.GrenadeMag,
                CooldownTicks: 0,
                ProjectileSpeed: 400f,
                AccuracyDeg: 0f,
                ExplosionRadius: GameConstants.GrenadeExplosionRadius
            ),
            [WeaponType.Molotov] = new(
                WeaponType.Molotov, "Molotov", WeaponCategory.Throwable,
                Damage: GameConstants.MolotovDamage,
                MagSize: GameConstants.MolotovMag,
                CooldownTicks: 0,
                ProjectileSpeed: 350f,
                AccuracyDeg: 0f,
                OnFireDuration: GameConstants.OnFireDuration
            ),
        };

    public static WeaponData Get(WeaponType type) => All[type];
}
