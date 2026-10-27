# superN — 2D Platform Tactical Fighter

Un clon rápido y táctico de **Superfighters Deluxe** adaptado para la web con **React**, **TypeScript**, **HTML5 Canvas** y **Tailwind CSS**, corriendo con física determinista a 60 Hz.

## 🎮 Características Portadas

- **Física canónica a 60 Hz**: Gravedad, fricción en suelo y aire, caída de plataformas unidireccionales (*one-way platforms*), saltos con coyote time.
- **21 Estados de Luchador**: Idle, Carrera, Salto, Caída, Agacharse, Slide, Dodge Roll (esquiva que extingue fuego), Ataques Melee con combo de 3 golpes, Disparo, Lanzamiento de granadas, Hitstun, Knockdown, Levantamiento con invulnerabilidad y Muerte.
- **Arsenal de 13 Armas**:
  - *Melee*: Puños (combo 6/7/8 dmg), Machete, Hacha, Espada.
  - *Armas de fuego*: Pistola 9mm, Magnum .44, Uzi, Rifle de asalto, Escopeta (4 perdigones por disparo), Francotirador con mira láser, Bazuca con daño radial y Lanzallamas.
  - *Arrojadizas*: Granadas con temporizador y rebote, Cóctel Molotov con área incendiaria.
- **Inteligencia Artificial de Bots**:
  - Arquetipos fieles al ground truth de *BotExtended* (Matón, Punk, Motero, Gánster, Policía, MetroCop, Mutante, Zombi, Soldado, Agente, Asesino, Pistolero, Francotirador, Berserker, Tanque).
  - Máquina de estados: *Chase*, *Strafe*, *Attack*, *Dodge* de proyectiles con roll/jump, *Flee* con poca salud, *Pickup* de armas del suelo y *Cover*.
- **Bodega Industrial (Warehouse)**: Escenario 960x540 con plataformas elevadas, cajas, y reaparición periódica de armas cada 15 segundos.
- **Efectos de Audio Procedimentales**: Síntesis de sonido con Web Audio API para puñetazos, detonaciones de armas de fuego, explosiones, saltos, rodadas y gongs de fin de ronda.

## 🕹️ Controles

| Tecla | Acción |
|---|---|
| **A / D** ó **← / →** | Moverse / Correr |
| **W** ó **↑** / **Espacio** | Saltar |
| **S** ó **↓** | Agacharse / Dodge Roll (en carrera) |
| **N** ó **J** | Ataque cuerpo a cuerpo (combo) |
| **M** ó **K** | Disparar arma de fuego |
| **G** | Lanzar granada / molotov |
| **R** | Reiniciar ronda |
| **ESC** | Volver al menú principal |

## 🚀 Ejecución en Desarrollo

```bash
npm install
npm run dev
```
Dev server activo en `http://0.0.0.0:3000`.
