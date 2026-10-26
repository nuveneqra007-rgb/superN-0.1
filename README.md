# superN — 2D Platform Fighter

Un clon de **Superfighters Deluxe** construido desde cero en **Godot 4 C#**.

## 🎮 Fuentes de ingeniería inversa

| Repo | Uso |
|---|---|
| [Odex64/SFR](https://github.com/Odex64/SFR) | Stats de armas, constantes de física |
| [NearHuscarl/BotExtended](https://github.com/NearHuscarl/BotExtended) | Arquetipos de bots, facciones, modificadores |
| `reference/as3/` (442 clases) | Ground truth del juego original Flash |

## 📁 Estructura

```
superN-0.1/
├── src/
│   ├── Core/        # GameConstants.cs (toda la física y combate)
│   ├── Player/      # PlayerState.cs, PlayerFSM.cs (21 estados)
│   ├── Weapons/     # WeaponData.cs (13 armas canónicas)
│   ├── Bots/        # BotData.cs, BotFSM.cs (8 estados IA)
│   ├── World/       # Mapas, hazards, plataformas
│   └── UI/          # HUD, menús
├── scenes/          # Escenas Godot (.tscn)
├── assets/          # Sprites, sonidos
└── docs/            # Documentación
```

## 🔧 Requisitos

- Godot 4.3+ con soporte C# (.NET 8)
- .NET SDK 8.0

## ▶️ Cómo abrir

1. Instalar [Godot 4 .NET](https://godotengine.org/download/)
2. Abrir Godot → Import → seleccionar `project.godot`
3. `Build` → `F5` para ejecutar
