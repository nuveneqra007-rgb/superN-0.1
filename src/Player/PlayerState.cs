// =============================================================
// PlayerState.cs — FSM + Estado puro del jugador
// 21 estados canónicos de PlayerAnimation.as:43
// =============================================================

namespace SuperN;

public enum PlayerFSMState
{
    Idle,         // 0 - En pie, quieto
    Walk,         // 1 - Caminando
    Run,          // 2 - Corriendo
    Sprint,       // 3 - Sprint (consume stamina)
    Jump,         // 4 - En aire, subiendo
    Fall,         // 5 - Cayendo
    Crouch,       // 6 - Agachado
    CrouchSlide,  // 7 - Slide (16 ticks)
    Roll,         // 8 - Dodge roll (18 ticks, ininterrumpible)
    Dive,         // 9 - Salto de buceo
    WallSlide,    // 10 - Deslizando en pared
    LedgeHang,    // 11 - Colgando de borde
    LedgeClimb,   // 12 - Subiendo borde (bloquea input)
    MeleeAttack,  // 13 - Ataque melee
    RangedAim,    // 14 - Apuntando con arma
    RangedFire,   // 15 - Disparando
    ThrowWeapon,  // 16 - Lanzando arma (36 ticks)
    Hitstun,      // 17 - Aturdido (24-48 ticks)
    KnockedDown,  // 18 - Derribado en suelo
    GetUp,        // 19 - Levantándose (bloquea input)
    Dead          // 20 - Muerto (ragdoll)
}

public class PlayerState
{
    // ─── Identidad ────────────────────────────────────────────
    public int Id { get; set; }
    public string Name { get; set; } = "Fighter";
    public bool IsBot { get; set; }

    // ─── FSM ──────────────────────────────────────────────────
    public PlayerFSMState FSM { get; set; } = PlayerFSMState.Idle;
    public int StateTicks { get; set; }    // ticks en el estado actual

    // ─── Posición y física ────────────────────────────────────
    public float X { get; set; }
    public float Y { get; set; }
    public float VelocityX { get; set; }
    public float VelocityY { get; set; }
    public bool  FacingRight { get; set; } = true;
    public bool  OnGround { get; set; }
    public bool  OnOneWayPlatform { get; set; }

    // ─── Salud y stamina ──────────────────────────────────────
    public float Health { get; set; }    = GameConstants.MaxHealth;
    public float MaxHealth { get; set; } = GameConstants.MaxHealth;
    public float Stamina { get; set; }   = GameConstants.MaxStamina;
    public bool  IsAlive { get; set; }   = true;
    public bool  IsOnFire { get; set; }
    public int   FireTicks { get; set; }
    public int   InvulnerabilityTicks { get; set; }

    // ─── Arma equipada ────────────────────────────────────────
    public WeaponType EquippedWeapon { get; set; } = WeaponType.Fists;
    public int Ammo { get; set; }
    public int AttackCooldown { get; set; }
    public int ComboStep { get; set; }
    public int ComboWindowTicks { get; set; }

    // ─── Contadores de estado ─────────────────────────────────
    public int RollTicks { get; set; }
    public int SlideTicks { get; set; }
    public int HitstunTicks { get; set; }
    public int KnockdownTicks { get; set; }
    public int GetUpTicks { get; set; }
    public int RespawnTicks { get; set; }
    public int PlatformDropTicks { get; set; }
    public int CoyoteTicks { get; set; }    // tiempo de gracia al borde

    // ─── Estadísticas de partida ──────────────────────────────
    public int Kills { get; set; }
    public int Deaths { get; set; }

    // ─── Modificadores (BotExtended system) ───────────────────
    public float SpeedModifier       { get; set; } = GameConstants.Speed_Normal;
    public float DamageDealtModifier { get; set; } = GameConstants.DD_Normal;
    public float DamageTakenModifier { get; set; } = GameConstants.DT_Normal;
    public float HealthModifier      { get; set; } = 1f;
}
