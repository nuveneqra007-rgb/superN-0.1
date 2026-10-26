// =============================================================
// GameArena.cs — Orquestador de la arena de combate
// Gestiona rondas, puntuación y UI
// =============================================================

using Godot;
using System;

namespace SuperN;

public partial class GameArena : Node2D
{
    private GamePlayer _p1 = null!;
    private GamePlayer _bot = null!;

    private Label _roundLabel  = null!;
    private Label _scoreLabel  = null!;
    private Label _msgLabel    = null!;

    private int _p1Score  = 0;
    private int _botScore = 0;
    private int _round    = 1;
    private const int MaxRounds = 5;
    private bool _roundActive = false;

    public override void _Ready()
    {
        _p1  = GetNode<GamePlayer>("Players/P1");
        _bot = GetNode<GamePlayer>("Players/Bot");

        _roundLabel = GetNode<Label>("HUD/RoundLabel");
        _scoreLabel = GetNode<Label>("HUD/ScoreLabel");
        _msgLabel   = GetNode<Label>("HUD/MsgLabel");

        _p1.PlayerDied  += OnPlayerDied;
        _bot.PlayerDied += OnPlayerDied;

        _bot.SetTarget(_p1);

        StartRound();
    }

    private void StartRound()
    {
        _roundActive = true;
        _roundLabel.Text = $"Round {_round} / {MaxRounds}";
        _scoreLabel.Text = $"P1: {_p1Score}   BOT: {_botScore}";
        _msgLabel.Text   = "¡PELEA!";

        GetTree().CreateTimer(1.5).Timeout += () => _msgLabel.Text = "";
    }

    private void OnPlayerDied(int playerId)
    {
        if (!_roundActive) return;
        _roundActive = false;

        bool p1Won = playerId != 1; // murió el Bot
        if (p1Won) _p1Score++;
        else       _botScore++;

        string winner = p1Won ? "¡JUGADOR 1 GANA!" : "¡BOT GANA!";
        _msgLabel.Text = winner;
        _scoreLabel.Text = $"P1: {_p1Score}   BOT: {_botScore}";

        if (_p1Score >= (MaxRounds / 2 + 1) || _botScore >= (MaxRounds / 2 + 1))
        {
            string match = _p1Score > _botScore ? "¡VICTORIA!" : "¡DERROTA!";
            GetTree().CreateTimer(3.0).Timeout += () =>
            {
                _msgLabel.Text = match + "  (R = reiniciar)";
            };
        }
        else
        {
            _round++;
            GetTree().CreateTimer(2.5).Timeout += () =>
                GetTree().ReloadCurrentScene();
        }
    }

    public override void _Process(double delta)
    {
        if (Input.IsActionJustPressed("ui_accept") || Input.IsKeyPressed(Key.R))
            GetTree().ReloadCurrentScene();
        if (Input.IsKeyPressed(Key.Escape))
            GetTree().ChangeSceneToFile("res://scenes/ui/MainMenu.tscn");
    }
}
