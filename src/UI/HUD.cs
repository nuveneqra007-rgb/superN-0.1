// =============================================================
// HealthBar.cs — HUD bar de salud del jugador
// =============================================================

using Godot;

namespace SuperN;

public partial class HealthBar : Control
{
    private ProgressBar _bar   = null!;
    private Label       _label = null!;

    public override void _Ready()
    {
        _bar   = GetNode<ProgressBar>("Bar");
        _label = GetNode<Label>("Label");
    }

    public void SetHealth(float current, float max)
    {
        _bar.MaxValue = max;
        _bar.Value    = current;
        _label.Text   = $"{Mathf.CeilToInt(current)}/{Mathf.CeilToInt(max)}";

        // Color semáforo
        float pct = current / max;
        _bar.Modulate = pct switch
        {
            > 0.6f => new Color(0.2f, 0.9f, 0.3f),  // verde
            > 0.3f => new Color(1.0f, 0.8f, 0.0f),  // amarillo
            _      => new Color(1.0f, 0.2f, 0.1f),  // rojo
        };
    }
}

// =============================================================
// HUD.cs — HUD completo (salud, munición, stamina, rondas)
// =============================================================

public partial class HUD : CanvasLayer
{
    private Label      _roundLabel  = null!;
    private Label      _ammoLabel   = null!;
    private Label      _scoreLabel  = null!;
    private ProgressBar _staminaBar = null!;

    public override void _Ready()
    {
        _roundLabel  = GetNode<Label>("RoundLabel");
        _ammoLabel   = GetNode<Label>("AmmoLabel");
        _scoreLabel  = GetNode<Label>("ScoreLabel");
        _staminaBar  = GetNode<ProgressBar>("StaminaBar");
    }

    public void UpdateRound(int round, int maxRounds, int p1Score, int p2Score)
    {
        _roundLabel.Text = $"Round {round}/{maxRounds}";
        _scoreLabel.Text = $"{p1Score} - {p2Score}";
    }

    public void UpdatePlayerState(PlayerState p)
    {
        if (p.EquippedWeapon == WeaponType.Fists)
            _ammoLabel.Text = "●●●";
        else
        {
            var wpn = WeaponDatabase.Get(p.EquippedWeapon);
            _ammoLabel.Text = $"{p.EquippedWeapon}: {p.Ammo}/{wpn.MagSize}";
        }

        _staminaBar.Value    = p.Stamina;
        _staminaBar.MaxValue = GameConstants.MaxStamina;
    }
}
