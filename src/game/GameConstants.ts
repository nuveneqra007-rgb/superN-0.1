// =============================================================
// SuperN — GameConstants.ts
// Ground Truth: AS3 original + SFR (Odex64) + BotExtended (NearHuscarl)
// =============================================================

export const GameConstants = {
  // ─── FÍSICA ───────────────────────────────────────────────
  Gravity: 980,
  RunSpeed: 260,
  SprintSpeed: 350,
  JumpVelocity: -600,
  GroundFriction: 0.75,
  AirFriction: 0.92,

  // ─── STAMINA / ENERGÍA ────────────────────────────────────
  MaxStamina: 100,
  StaminaCostRoll: 25,
  StaminaCostJump: 15,
  StaminaCostSprintPerTick: 1.2,
  StaminaRegenPerTick: 0.5,

  EnergyRechargeQuick: 1.5,
  EnergyRechargeNormal: 1.0,
  EnergyRechargeSlow: 0.5,

  // ─── HITBOXES ─────────────────────────────────────────────
  HitboxStand: { x: 28, y: 48 },
  HitboxCrouch: { x: 28, y: 24 },
  PlatformDropTicks: 12,

  // ─── DODGE ROLL ───────────────────────────────────────────
  RollDurationTicks: 18,
  RollSpeed: 200,
  RollCooldownTicks: 12,
  RollExtinguishesFire: true,

  // ─── SALUD Y COMBATE ──────────────────────────────────────
  MaxHealth: 100,
  HealthRegenPerTick: 0.1,
  HealthRegenDelay: 72,
  HitstunTicksStrong: 48,
  HitstunTicksLight: 24,
  GetUpInvulTicks: 48,

  // ─── SALUD POR TIER ───────────────────────────────────────
  Health_ExtremelyWeak: 35,
  Health_VeryWeak: 50,
  Health_Weak: 65,
  Health_BelowNormal: 80,
  Health_Normal: 100,
  Health_AboveNormal: 125,
  Health_Strong: 150,
  Health_VeryStrong: 200,
  Health_ExtremelyStrong: 250,
  Health_UltraStrong: 300,

  // ─── VELOCIDAD MULTIPLICADORES ────────────────────────────
  Speed_ExtremelySlow: 0.60,
  Speed_VerySlow: 0.70,
  Speed_Slow: 0.80,
  Speed_BelowNormal: 0.90,
  Speed_Normal: 1.00,
  Speed_AboveNormal: 1.10,
  Speed_VeryFast: 1.35,

  // ─── DAÑO CAUSADO ─────────────────────────────────────────
  DD_None: 0.00,
  DD_VeryLow: 0.50,
  DD_Low: 0.75,
  DD_BelowNormal: 0.90,
  DD_Normal: 1.00,
  DD_AboveNormal: 1.10,
  DD_High: 1.25,
  DD_VeryHigh: 1.50,
  DD_ExtremelyHigh: 2.00,
  DD_UltraHigh: 5.00,
  DD_OnePunch: 10.0,

  // ─── DAÑO RECIBIDO ────────────────────────────────────────
  DT_Unbeatable: 0.00,
  DT_UltraResistant: 0.10,
  DT_VeryResistant: 0.50,
  DT_Resistant: 0.75,
  DT_Normal: 1.00,
  DT_Vulnerable: 1.25,
  DT_VeryVulnerable: 1.50,
  DT_Defenseless: 10.0,

  // ─── MELEE — PUÑOS ────────────────────────────────────────
  FistsDamage: [6, 7, 8],
  FistsKbX: [150, 180, 280],
  FistsKbY: [-80, -100, -180],
  FistsCooldownTicks: 12,
  FistsComboWindowTicks: 20,
  DisarmChanceAtLowHP: 0.40,
  DisarmHPThreshold: 25,

  // ─── MELEE — ARMAS ────────────────────────────────────────
  MacheteCombo: [8, 9, 10],
  AxeCombo: [11, 12, 13],
  SwordCombo: [13, 14, 15],
  KickDamage: 10,
  JumpKickDamage: 4,

  // ─── PISTOLA ──────────────────────────────────────────────
  PistolDamage: 15,
  PistolMag: 12,
  PistolCooldown: 12,
  PistolSpeed: 900,
  PistolAccuracy: 1.0,

  // ─── MAGNUM ───────────────────────────────────────────────
  MagnumDamage: 25,
  MagnumMag: 6,
  MagnumCooldown: 16,
  MagnumSpeed: 900,
  MagnumAccuracy: 0.5,

  // ─── UZI ──────────────────────────────────────────────────
  UziDamage: 12,
  UziMag: 25,
  UziCooldown: 8, // fast firing
  UziSpeed: 650,
  UziAccuracy: 6.0,

  // ─── RIFLE ────────────────────────────────────────────────
  RifleDamage: 18,
  RifleMag: 25,
  RifleCooldown: 12,
  RifleSpeed: 900,
  RifleAccuracy: 3.0,

  // ─── SHOTGUN ──────────────────────────────────────────────
  ShotgunDamagePerPellet: 20,
  ShotgunPellets: 4,
  ShotgunShotsInMag: 8,
  ShotgunCooldown: 18,
  ShotgunSpeed: 650,
  ShotgunSpread: 4.3,

  // ─── SNIPER ───────────────────────────────────────────────
  SniperDamage: 30,
  SniperMag: 5,
  SniperCooldown: 36,
  SniperSpeed: 2700,
  SniperAccuracy: 0.0,

  // ─── BAZOOKA ──────────────────────────────────────────────
  BazookaDamage: 35,
  BazookaExplosionRadius: 80,
  BazookaMag: 3,
  BazookaCooldown: 24,
  BazookaSpeed: 900,

  // ─── FLAMETHROWER ─────────────────────────────────────────
  FlameDmgPerTick: 15,
  FlameMag: 60,
  FlameRange: 160,
  FlameSpread: 6.0,
  OnFireDuration: 180,

  // ─── GRENADES ─────────────────────────────────────────────
  GrenadeTimerTicks: 144, // ~2.4s
  GrenadeExplosionRadius: 80,
  GrenadeDamage: 25,
  GrenadeMag: 3,

  // ─── MOLOTOV ──────────────────────────────────────────────
  MolotovDamage: 20,
  MolotovMag: 3,
  MolotovFireZone: 60,

  // ─── IA / BOTS ────────────────────────────────────────────
  AI_DetectionRange: 600,
  AI_MeleeRange: 60,
  AI_GunPreferredRange: 300,
  AI_DodgeReactionTicks: 6,
  AI_FleeHPThreshold: 25,
  AI_WpnSearchNearby: 20,
  AI_WpnSearchInSight: 120,
};
