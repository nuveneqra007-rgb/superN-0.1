// =============================================================
// MainMenu.cs — Lógica del menú principal
// =============================================================

using Godot;

namespace SuperN;

public partial class MainMenu : Control
{
    private Button _btnPlay = null!;
    private Button _btnQuit = null!;

    public override void _Ready()
    {
        _btnPlay = GetNode<Button>("VBox/BtnPlay");
        _btnQuit = GetNode<Button>("VBox/BtnQuit");

        _btnPlay.Pressed += OnPlay;
        _btnQuit.Pressed += OnQuit;

        // Animación de entrada
        Modulate = Colors.Transparent;
        var tween = CreateTween();
        tween.TweenProperty(this, "modulate:a", 1.0f, 0.5f);
    }

    private void OnPlay()
    {
        // Transición a Arena con fade
        var tween = CreateTween();
        tween.TweenProperty(this, "modulate:a", 0.0f, 0.3f);
        tween.TweenCallback(Callable.From(() =>
            GetTree().ChangeSceneToFile("res://scenes/levels/Arena.tscn")));
    }

    private void OnQuit() => GetTree().Quit();
}
