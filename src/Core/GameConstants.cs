// =============================================================
// SuperN — GameConstants.cs
// Ground Truth: AS3 original + SFR (Odex64) + BotExtended (NearHuscarl)
// Fuentes: reference/as3/ (442 clases) · Odex64/SFR · NearHuscarl/BotExtended
// =============================================================

using Godot;

namespace SuperN;

public static class GameConstants
{
    // ─── FÍSICA ───────────────────────────────────────────────
    // El original corre a ~30fps. Godot usa 60Hz PhysicsProcess.
    // Velocidades en px/s (no px/frame).

    /// Gravedad en px/s² — equivalente a 0.5u/tick @ 30fps original
    public const float Gravity          = 980f;

    /// Velocidad de carrera px/s — 130px/frame @ 30fps × 2
    public const float RunSpeed         = 260f;

    /// Velocidad de sprint px/s
    public const float SprintSpeed      = 350f;

    /// Impulso de salto (negativo = arriba en Godot Y-axis)  PlayerState.as
    public const float JumpVelocity     = -600f;

    /// Fricción multiplicador por frame en suelo
    public const float GroundFriction   = 0.75f;

    /// Fricción multiplicador por frame en aire
    public const float AirFriction      = 0.92f;

    // ─── STAMINA / ENERGÍA ────────────────────────────────────
    // PlayerState.as:817, Player.as:7773

    public const float MaxStamina              = 100f;
    public const float StaminaCostRoll         = 25f;
    public const float StaminaCostJump         = 15f;
    public const float StaminaCostSprintPerTick = 1.2f;
    public const float StaminaRegenPerTick     = 0.5f;

    // BotExtended: EnergyRecharge modifiers
    public const float EnergyRechargeQuick  = 1.5f;
    public const float EnergyRechargeNormal = 1.0f;
    public const float EnergyRechargeSlow   = 0.5f;

    // ─── HITBOXES ─────────────────────────────────────────────
    // Player.as:5069 (normal) | Player.as:3910 (crouch)

    public static readonly Vector2 HitboxStand  = new(28f, 48f);
    public static readonly Vector2 HitboxCrouch = new(28f, 24f);

    /// Ticks que la colisión con one-way platform está desactivada (Player.as:3562)
    public const int PlatformDropTicks = 12;

    // ─── DODGE ROLL ───────────────────────────────────────────
    // PlayerAnimation.as:43

    /// Duración del roll en ticks @ 60Hz (18 ticks = ~300ms)
    public const int   RollDurationTicks = 18;

    /// Velocidad horizontal fija durante roll en px/s
    public const float RollSpeed         = 200f;

    /// Cooldown tras roll antes de poder volver a rodar
    public const int   RollCooldownTicks = 12;

    /// Rodar apaga el estado OnFire (SPEC.md)
    public const bool  RollExtinguishesfire = true;

    // ─── SALUD Y COMBATE ──────────────────────────────────────
    // PlayerState.as:282, :721, :717, :858, :903

    public const float MaxHealth           = 100f;
    public const float HealthRegenPerTick  = 0.1f;
    public const int   HealthRegenDelay    = 72;   // frames sin daño para activar regen
    public const int   HitstunTicksStrong  = 48;   // golpe fuerte
    public const int   HitstunTicksLight   = 24;   // golpe leve
    public const int   GetUpInvulTicks     = 48;   // invulnerabilidad al levantarse

    // ─── SALUD POR TIER — BotExtended Health ──────────────────

    public const int Health_ExtremelyWeak  = 35;
    public const int Health_VeryWeak       = 50;
    public const int Health_Weak           = 65;
    public const int Health_BelowNormal    = 80;
    public const int Health_Normal         = 100;
    public const int Health_AboveNormal    = 125;
    public const int Health_Strong         = 150;
    public const int Health_VeryStrong     = 200;
    public const int Health_ExtremelyStrong= 250;
    public const int Health_UltraStrong    = 300;

    // ─── VELOCIDAD MULTIPLICADORES — BotExtended Speed ────────

    public const float Speed_ExtremelySlow = 0.60f;
    public const float Speed_VerySlow      = 0.70f;
    public const float Speed_Slow          = 0.80f;
    public const float Speed_BelowNormal   = 0.90f;
    public const float Speed_Normal        = 1.00f;
    public const float Speed_AboveNormal   = 1.10f;
    public const float Speed_VeryFast      = 1.35f;

    // ─── DAÑO CAUSADO — BotExtended DamageDealt ───────────────

    public const float DD_None          = 0.00f;
    public const float DD_VeryLow       = 0.50f;
    public const float DD_Low           = 0.75f;
    public const float DD_BelowNormal   = 0.90f;
    public const float DD_Normal        = 1.00f;
    public const float DD_AboveNormal   = 1.10f;
    public const float DD_High          = 1.25f;
    public const float DD_VeryHigh      = 1.50f;
    public const float DD_ExtremelyHigh = 2.00f;
    public const float DD_UltraHigh     = 5.00f;
    public const float DD_OnePunch      = 10.0f;

    // ─── DAÑO RECIBIDO — BotExtended DamageTaken ──────────────

    public const float DT_Unbeatable       = 0.00f;
    public const float DT_UltraResistant   = 0.10f;
    public const float DT_VeryResistant    = 0.50f;
    public const float DT_Resistant        = 0.75f;
    public const float DT_Normal           = 1.00f;
    public const float DT_Vulnerable       = 1.25f;
    public const float DT_VeryVulnerable   = 1.50f;
    public const float DT_Defenseless      = 10.0f;

    // ─── MELEE — PUÑOS ────────────────────────────────────────
    // Weapons.as:134

    public static readonly float[] FistsDamage  = [6f, 7f, 8f];
    public static readonly float[] FistsKbX     = [150f, 180f, 280f];
    public static readonly float[] FistsKbY     = [-80f, -100f, -180f];
    public const int   FistsCooldownTicks        = 12;   // 6 frames × 2
    public const int   FistsComboWindowTicks     = 20;
    public const float DisarmChanceAtLowHP       = 0.40f; // Player.as:4319
    public const float DisarmHPThreshold         = 25f;

    // ─── MELEE — ARMAS ────────────────────────────────────────
    // Weapons.as:98 (axe), :110 (sword), :122 (machete)

    public static readonly float[] MacheteCombo = [8f, 9f, 10f];
    public static readonly float[] AxeCombo     = [11f, 12f, 13f];
    public static readonly float[] SwordCombo   = [13f, 14f, 15f];
    public const float KickDamage               = 10f;   // PlayerState.as:7550
    public const float JumpKickDamage           = 4f;    // PlayerState.as:134 + Knockdown

    // ─── PISTOLA ──────────────────────────────────────────────
    // Weapons.as:167

    public const float PistolDamage    = 15f;
    public const int   PistolMag       = 12;
    public const int   PistolCooldown  = 12;   // 6 frames × 2
    public const float PistolSpeed     = 900f; // px/s
    public const float PistolAccuracy  = 1.0f; // grados desvío

    // ─── MAGNUM ───────────────────────────────────────────────
    // Weapons.as:261

    public const float MagnumDamage    = 25f;
    public const int   MagnumMag       = 6;
    public const int   MagnumCooldown  = 16;
    public const float MagnumSpeed     = 900f;
    public const float MagnumAccuracy  = 0.5f;

    // ─── UZI ──────────────────────────────────────────────────
    // Weapons.as:217

    public const float UziDamage    = 12f;
    public const int   UziMag       = 25;
    public const int   UziCooldown  = 12;
    public const float UziSpeed     = 600f;
    public const float UziAccuracy  = 6.0f;

    // ─── RIFLE ────────────────────────────────────────────────
    // Weapons.as:192

    public const float RifleDamage    = 18f;
    public const int   RifleMag       = 25;
    public const int   RifleCooldown  = 12;
    public const float RifleSpeed     = 900f;
    public const float RifleAccuracy  = 3.0f;

    // ─── SHOTGUN (4 postas por disparo) ───────────────────────
    // Weapons.as:243 — 32 postas totales / 4 por disparo = 8 disparos

    public const float ShotgunDamagePerPellet = 20f;
    public const int   ShotgunPellets          = 4;
    public const int   ShotgunShotsInMag       = 8;
    public const int   ShotgunCooldown         = 6;    // 3 frames × 2
    public const float ShotgunSpeed            = 600f;
    public const float ShotgunSpread           = 4.3f;

    // ─── SNIPER ───────────────────────────────────────────────
    // Weapons.as:280

    public const float SniperDamage    = 30f;
    public const int   SniperMag       = 5;
    public const int   SniperCooldown  = 36;   // 18 frames × 2
    public const float SniperSpeed     = 2700f;
    public const float SniperAccuracy  = 0.0f; // mira láser perfecta

    // ─── BAZOOKA ──────────────────────────────────────────────
    // Weapons.as:298

    public const float BazookaDamage         = 35f;
    public const float BazookaExplosionRadius = 80f;
    public const int   BazookaMag            = 3;
    public const int   BazookaCooldown       = 20;
    public const float BazookaSpeed          = 900f;

    // ─── FLAMETHROWER ─────────────────────────────────────────
    // Weapons.as:324

    public const float FlameDmgPerTick = 15f;
    public const int   FlameMag        = 60;
    public const float FlameRange      = 140f;
    public const float FlameSpread     = 6.0f;
    public const int   OnFireDuration  = 180; // ticks en llamas tras ser alcanzado

    // ─── GRENADES ─────────────────────────────────────────────
    // Weapons.as:142 — 72 frames @ 30fps × 2 = 144 ticks @ 60Hz (~2.4s)

    public const int   GrenadeTimerTicks    = 144;
    public const float GrenadeExplosionRadius = 80f;
    public const float GrenadeDamage        = 25f;
    public const int   GrenadeMag           = 3;

    // ─── MOLOTOV ──────────────────────────────────────────────
    // Weapons.as:150

    public const float MolotovDamage   = 20f;
    public const int   MolotovMag      = 3;
    public const float MolotovFireZone = 60f;

    // ─── POWER-UPS ────────────────────────────────────────────

    public const float SlowmoFactor    = 0.5f;  // tiempo × 0.5
    public const float SlowmoDuration5 = 5.0f;  // segundos
    public const float SlowmoDuration10= 10.0f;
    public const float PillsHeal       = 25f;
    public const float MedkitHeal      = 50f;

    // ─── IA / BOTS ────────────────────────────────────────────
    // BotExtended WpnSearchRange, BotInfos.cs

    public const float AI_DetectionRange    = 600f;
    public const float AI_MeleeRange        = 60f;
    public const float AI_GunPreferredRange = 300f;
    public const float AI_DodgeReactionTicks= 6f;
    public const float AI_FleeHPThreshold  = 25f;
    public const float AI_WpnSearchNearby  = 20f;
    public const float AI_WpnSearchInSight = 80f;
}
