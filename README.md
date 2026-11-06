# superN — 2D Platform Tactical Fighter

Un juego de lucha y disparos táctico 2D en plataformas inspirado en **Superfighters Deluxe**, desarrollado con **React 19**, **TypeScript**, **HTML5 Canvas 2D** y **Tailwind CSS**, operando a 60 Hz deterministas con paso fijo de simulación.

---

> ⚠️ **ADVERTENCIA IMPORTANTE PARA DESARROLLADORES:**  
> **"No modificar los archivos de CharacterData.ts sin actualizar el GDD"**  
> Cualquier alteración en configuraciones de fotogramas, escalas (`UNIFORM_SCALE_MAP`), puntos de anclaje de pies o metadatos de hojas de sprites debe coordinarse estrictamente con el Documento de Diseño de Juego (`superN_PROXIMOS_ARREGLOS_6368a114.md` y `AUDITORIA_Y_VERIFICACION_GDD_V2.md`).

---

## 🚀 Cómo iniciar el juego localmente

Para ejecutar el proyecto en tu entorno local de desarrollo:

```bash
# 1. Instalar las dependencias del proyecto
npm install

# 2. Iniciar el servidor de desarrollo Vite
npm run dev
```

El juego estará disponible inmediatamente en tu navegador en:
`http://localhost:3000` (o `http://0.0.0.0:3000`).

Para verificar tipos y compilar la versión optimizada de producción:
```bash
npm run build
```

---

## 📁 Estructura del Proyecto y Ubicación de Assets

La arquitectura del proyecto sigue una estricta separación como fuente única de verdad:

```
superN/
├── public/
│   ├── assets/
│   │   ├── characters/                 # Retratos e idles canónicos (ninja, gymrat, santaclo)
│   │   │   ├── ninja/idle.png
│   │   │   ├── gymrat/idle.png
│   │   │   └── santaclo/idle.png
│   │   ├── sprites/
│   │   │   ├── player/                 # Spritesheets activos y metadatos subpíxel
│   │   │   │   ├── frameMeta.json      # Metadatos oficiales de recorte y anclaje a los pies
│   │   │   │   ├── ninja_*.png         # Hojas de animación Ninja (walk, run, jump, melee, roll...)
│   │   │   │   ├── gymrat_*.png        # Hojas de animación Gymrat (walk, run, jump, melee, roll...)
│   │   │   │   └── santaclo_*.png      # Hojas de animación Santa Claus (walk, run, jump, melee, pistol, rifle, throw...)
│   │   │   └── bot/                    # Spritesheets y arquetipos de IA (assassin, agent, etc.)
│   │   ├── weapons/                    # Sprites e iconos de armas (cuerpo a cuerpo, fuego, granadas)
│   │   └── aistudio/                   # Fondos oficiales de batalla y documentos del plan maestro
│   ├── contact_sheet.html              # Visor interactivo de hojas de sprites y bounding boxes
│   └── icon.svg                        # Favicon oficial del juego
├── scripts/                            # Herramientas de procesamiento y slicing de sprites
│   └── smart_slicer.ts                 # Cortador inteligente por detección de canal alfa
├── src/
│   ├── components/
│   │   ├── ArenaCanvas.tsx             # Motor de juego a 60Hz deterministas, física y renderizado Canvas 2D
│   │   ├── LandingScreen.tsx           # Portada con fondo Urban Noir y vitrina de personajes
│   │   ├── ModeSelectScreen.tsx        # Selección de modo de juego (1P vs Bot, 1v1 Local)
│   │   ├── MainMenu.tsx                # Selección de luchadores, configuración de bots y dificultad
│   │   ├── MatchSetupModal.tsx         # Selección de escenario y número de rondas
│   │   ├── ArsenalView.tsx             # Catálogo de armamento e inspección de estadísticas
│   │   ├── GameBackdrop.tsx            # Fondo ambiental compartido de tuberías y escaneo
│   │   └── FighterBar.tsx              # Componente HUD de barras de salud y slots de armas
│   └── game/
│       ├── Controls.ts                 # Fuente única de verdad de controles (KeyboardEvent.code)
│       ├── CharacterData.ts            # Fuente única de verdad de personajes, escalas y animaciones
│       ├── WeaponData.ts               # Fuente única de verdad de armas, agarres (1/2 manos) y daños
│       ├── WorldData.ts                # Fuente única de verdad de los 6 mapas oficiales y plataformas
│       ├── GrenadeSystem.ts            # Físicas de granadas, rebotes elásticos, C4/minas y detonaciones
│       ├── PlayerController.ts         # FSM de movimiento, salto variable y cinemática
│       ├── CombatSystem.ts             # Detección de colisiones e intercambios de daño
│       ├── BotData.ts & BotFSM.ts      # 15 arquetipos de bots, FSM y toma de decisiones
│       └── PhysicsStep.ts              # Simulación de física, gravedad, fricción y plataformas
├── index.html                          # Entrada HTML principal
├── package.json                        # Dependencias de npm y scripts de ejecución
├── tsconfig.json                       # Configuración de compilador TypeScript
└── vite.config.ts                      # Configuración de Vite y Tailwind v4
```

---

## 🕹️ Teclas de Control Reales (Fuente Única: `src/game/Controls.ts`)

Todos los controles son capturados a nivel físico mediante `KeyboardEvent.code` para garantizar consistencia absoluta en cualquier distribución de teclado (QWERTY, AZERTY, etc.):

### Modo 1 Jugador (Solitario / Práctica vs Bot)
* **Moverse:** `A` (Izquierda) / `D` (Derecha) o **Flechas** (`←` `→`)
* **Salto:** `W`, `↑` o `Espacio`
* **Agacharse:** `S` o `↓`
* **Rodar (Invulnerable ~0.24s):** `S` + Movimiento (o `↓` + Movimiento)
* **Correr (Sprint):** Mantener `Q`, `Shift Izquierdo` o `.` (Punto)
* **Ataque Cuerpo a Cuerpo (Melee):** `N` (alternativas: `F` / `J`)
* **Disparar Arma de Fuego:** `M` (alternativas: `G` / `K`)
* **Lanzar Granada / Explosivo:** `,` (Coma) (alternativas: `H` / `L`)
* **Selección de Arma Rápida (Ranuras 1–4):** Teclas `1`, `2`, `3`, `4`
* **Pausa:** `ESC` (abre el menú de pausa retro)

---

### Modo 1v1 Local (Dos Jugadores en el Mismo Teclado)

| Acción | Jugador 1 (WASD) | Jugador 2 (Flechas) |
|---|---|---|
| **Moverse** | `A` (Izquierda) / `D` (Derecha) | `←` (Izquierda) / `→` (Derecha) |
| **Salto** | `W` o `Espacio` | `↑` (Flecha Arriba) |
| **Agacharse** | `S` | `↓` (Flecha Abajo) |
| **Rodar** | `S` + Movimiento | `↓` + Movimiento |
| **Correr (Sprint)** | Mantener `Shift Izquierdo` o `Q` | Mantener `.` (Punto) o `/` (Barra) |
| **Melee (Golpe / Combo)** | `F` | `N` |
| **Disparo** | `G` | `M` |
| **Granada / Bomba** | `H` (o `L` / `,`) | `,` (Coma) (o `L`) |
| **Cambio de Ranura (1–4)**| Teclas numéricas `1`, `2`, `3`, `4` | Teclas numéricas `7`, `8`, `9`, `0` |
| **Menú de Pausa** | `ESC` | `ESC` |

---

## 🥊 Personajes Jugables y Estado

1. **Ninja (Shinobi Urbano):** Completado (Movimiento y Combate). Incluye combo triple de katana, lanzamiento y compatibilidad total con armas.
2. **Gymrat (Bestia de Gimnasio):** Completado (Movimiento y Combate). Patadas frontales, ganchos y proporciones masivas calibradas.
3. **Santa Claus (Santa Táctico):** Completado (Movimiento, Combate, Armas y Bombas). Soporte para armas a una mano (pistolas con retroceso físico), dos manos (rifles/pesadas), ciclo completo de animaciones y lanzamiento de bombas.

---

## 💥 Sistema de Bombas y Proyectiles
* **Rebotes en Infraestructura:** Las granadas y cócteles molotov rebotan elásticamente contra plataformas atravesables (*one-way*), paredes y techos, manteniendo su temporizador de detonación en el aire.
* **Adherencia Superficial:** C4 y Minas terrestres se adhieren firmemente a pisos, plataformas y paredes tras el impacto.
