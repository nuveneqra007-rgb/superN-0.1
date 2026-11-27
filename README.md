# superN — Juego Web Táctico de Lucha y Disparos 2D

🎮 **Juega ahora directamente desde tu navegador (sin descargar nada ni clonar el repositorio):**  
👉 **[https://supern01.vercel.app/](https://supern01.vercel.app/)**

<p align="left">
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/HTML5_Canvas_2D-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5 Canvas 2D" />
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

**superN** es un juego web de acción, plataformas y combate táctico 2D inspirado en *Superfighters Deluxe*. Funciona directamente en navegadores de escritorio y teléfonos móviles (con controles táctiles estilo PSP), ejecutando una simulación determinista a **60 Hz** con física arcade, arsenal variado, inventario de 3 ranuras activas y combates contra bots de IA o en modo práctica.

---

## 🌐 Jugar en línea (Sin descargas)

No necesitas instalar programas ni descargar código fuente para jugar:
1. Abre **[https://supern01.vercel.app/](https://supern01.vercel.app/)** desde cualquier navegador moderno (Chrome, Safari, Firefox, Edge).
2. En **PC**, navega con teclado o ratón.
3. En **teléfono móvil**, gira la pantalla en **horizontal** para activar el modo pantalla completa y los controles táctiles PSP.

---

## 🛠️ Tecnologías Utilizadas (Formulación del Juego y Despliegue)

| Área | Icono | Tecnología / Herramienta | Función en el proyecto |
|---|---|---|---|
| **Interfaz & Estado** | <img src="https://cdn.simpleicons.org/react/61DAFB" width="20" height="20" alt="React" /> <img src="https://cdn.simpleicons.org/typescript/3178C6" width="20" height="20" alt="TypeScript" /> | **React 19** + **TypeScript 5** | Arquitectura modular de pantallas, HUD reactivo (`FighterBar`), armería interactiva y tipado estricto. |
| **Estilos & Iconos** | <img src="https://cdn.simpleicons.org/tailwindcss/06B6D4" width="20" height="20" alt="Tailwind CSS" /> <img src="https://cdn.simpleicons.org/lucide/F56565" width="20" height="20" alt="Lucide" /> | **Tailwind CSS v4** + **Lucide React** | Diseño retro arcade responsivo, modales apaisados y controles táctiles adaptados a móviles. |
| **Motor 2D (60 Hz)** | <img src="https://cdn.simpleicons.org/html5/E34F26" width="20" height="20" alt="HTML5 Canvas" /> | **HTML5 Canvas 2D** | Simulación física de paso fijo (`1000 / 60 ms`), partículas, fuego multicapa, hit-stop, screen-shake y pixel-art nítido (`imageSmoothingEnabled = false`). |
| **Escena 3D (Escritorio)** | <img src="https://cdn.simpleicons.org/threedotjs/ffffff" width="20" height="20" alt="Three.js" /> | **Three.js** (`WebGLRenderer` + `RoomEnvironment`) | Portada 3D PBR atmosférica con niebla, luces dinámicas, lluvia y reflejos en navegadores de escritorio. |
| **Audio Procedural** | 🔊 | **Web Audio API** (`SoundEffects.ts`) | Síntesis de disparos, explosiones, motosierra, látigo, golpes y gong en tiempo real sin descarga de audios pesados. |
| **Empaquetado** | <img src="https://cdn.simpleicons.org/vite/646CFF" width="20" height="20" alt="Vite" /> | **Vite 6** + **tsc** | Compilación rápida, tree-shaking y verificación de tipos (`npm run lint` / `npm run build`). |
| **Despliegue / Hosting** | <img src="https://cdn.simpleicons.org/vercel/ffffff" width="20" height="20" alt="Vercel" /> | **Vercel** | Despliegue web continuo accesible al instante desde **[https://supern01.vercel.app/](https://supern01.vercel.app/)**. |

---

## 📱 Adaptación Total a Móvil (Modo Horizontal + Controles PSP)

**superN** cuenta con una adaptación nativa para jugar cómodamente desde teléfonos móviles sin recortes ni caídas de rendimiento:

1. **Guardia de Orientación Horizontal y Pantalla Completa (`useMobileDevice.ts`, `MobileOrientationGuard.tsx`)**
   - Detecta automáticamente dispositivos táctiles/móviles y monitorea el área visible real (`window.visualViewport`).
   - Si el usuario abre el juego en vertical (*Portrait*), muestra un aviso bloqueante solicitando girar el teléfono en horizontal (*Landscape*).
   - Al rotar a horizontal, solicita entrar en **pantalla completa** (`requestFullscreen` + bloqueo `landscape`) e incluye un botón flotante discreto `FullScreen` por si el navegador móvil requiere confirmación táctil directa.

2. **Portada Optimizada a 60 FPS en Teléfonos (`LandingScreen.tsx`)**
   - En dispositivos móviles se omite automáticamente la escena 3D WebGL de Three.js (`Warehouse3DCanvas`) y los bucles de parallax por ratón, cargando en su lugar un fondo 2D ligero que evita congelamientos y sobrecalentamiento al abrir la web.

3. **Experiencia Exclusiva de 1 Jugador en Móvil (`ModeSelectScreen.tsx`)**
   - En pantallas móviles se filtra el modo `2 JUGADORES` (teclado compartido), dejando listos y optimizados los modos pensados para juego táctil individual:
     - **Duelo vs Bot (IA)** (1 a 5 bots configurables).
     - **Modo Práctica (El Gimnasio)** con armería infinita y tutorial paso a paso.

4. **Resolución Adaptativa Exacta por Dispositivo y Cámara Dinámica (`ArenaCanvas.tsx`, `MainMenu.tsx`, `MatchSetupModal.tsx`, `WorldSelectScreen.tsx`, `FighterBar.tsx`)**
   - **Arena sin franjas negras**: En combate móvil, el `<canvas>` adopta las dimensiones exactas del área útil de la pantalla del teléfono multiplicadas por su `devicePixelRatio` (hasta 2×) y aplica una cámara 2D suavizada enfocada en Player 1 y el rival más cercano para apreciar personajes, armas y proyectiles con total claridad. Desde el menú de **Pausa**, puede alternarse entre `EXACTA (ZOOM+)` y `CLÁSICA 16:9`.
   - **UI y Modales Apaisados**: La barra de luchadores (`FighterBar` en modo compacto), el selector `1 vs Bot` (`MainMenu`), el modal rápido de mapa/rondas (`MatchSetupModal`), la selección de mundo y el menú de pausa se reorganizan horizontalmente con escalado dinámico y scroll seguro para adaptarse a cualquier altura de pantalla móvil (~320–430 px).

5. **Controles Táctiles Multi-Touch Estilo PSP (`MobilePSPControls.tsx`)**
   - **Joystick Analógico Izquierdo**: Captura independiente por puntero (`setPointerCapture`) que permite caminar, **correr automáticamente** al llevar el stick al borde exterior, saltar/agacharse/rodar y graduar el ángulo de mira al disparar.
   - **Botonera PSP Derecha**:
     - `□` **Melee**: Golpes cuerpo a cuerpo, combos de espada, motosierra continua, látigo, silla, etc.
     - `○` **Fuego**: Disparar o mantener presionado para apuntar (y flujo continuo de llamas con el Lanzallamas Napalm).
     - `△` **Bomba**: Lanzar granadas, cócteles molotov, C4, minas o pelotas de béisbol.
     - `✕` **Salto**: Salto rápido independiente del joystick.
   - **Barra Superior Táctil Integrada**: Acceso directo sin solapamientos a `PAUSA`, `ARMAS` (Armería interactiva en Práctica) y `GUÍA`.

---

## ⚔️ Mecánicas Principales del Juego

* **Inventario Rápido de 3 Ranuras Activas**:
  * **Ranura 1 (`N` / `□`)**: Arma cuerpo a cuerpo o puños (`Fists`, Katana, Motosierra encendida, Cadena, Látigo, Silla, Asta de Bandera, Almohada Cósmica, etc.).
  * **Ranura 2 (`M` / `○`)**: Arma de fuego equipada (pistola, subfusil, escopeta, francotirador, bazuca, lanzagranadas, **Lanzallamas Napalm** con chorro continuo de fuego vivo, láser, arco o bengalas). Al agotarse la munición en combate, el arma se suelta automáticamente.
  * **Ranura 3 (`,` / `△`)**: Explosivos y arrojadizas (Granada Frag, Humo, Cegadora, Cóctel Molotov, C4, Mina de proximidad y Pelota de Béisbol).
* **Ciclo Vivo de Armas en el Mapa**: Aparición y sustitución periódica en puntos designados (incluyendo 3 spawns rotativos en *El Gimnasio*), parpadeo visual previo antes de desaparecer, recogida determinista del objeto más cercano sin bucles y recarga de balas al recoger la misma arma con cargador incompleto.
* **Personajes Jugables**: **Ninja** (combo de 3 tajos con espada), **Gymrat** (combos pesados) y **Santa Claus** (golpes devastadores y retroceso de armas calibrado).

---

## 🕹️ Controles en Escritorio (`src/game/Controls.ts`)

### Modo 1 Jugador (Solitario / Práctica vs Bot)
* **Moverse:** `A` / `D` o **Flechas** (`←` `→`)
* **Salto:** `W`, `↑` o `Espacio`
* **Agacharse / Recoger o Intercambiar Arma:** `S` o `↓`
* **Rodar (Invulnerabilidad breve):** `S` + Movimiento (o `↓` + Movimiento)
* **Correr (Sprint):** Mantener `Q`, `Shift Izquierdo` o `.` (Punto)
* **Ataque Cuerpo a Cuerpo (Melee):** `N` (mantener con Motosierra para corte continuo)
* **Disparar / Apuntar Arma de Fuego:** `M` (toque rápido dispara; mantener apunta con dirección o dispara chorro continuo con Lanzallamas)
* **Lanzar Granada / Arrojadizo:** `,` (Coma)
* **Cambio Rápido de Ranuras:** Teclas `1`, `2`, `3`, `4`
* **Armería en Modo Práctica:** `E` (cerca del estante) | **Guía Tutorial:** `H`
* **Pausa:** `ESC`

### Modo 1v1 Local (Dos Jugadores en el Mismo Teclado — Solo Escritorio)

| Acción | Jugador 1 (WASD) | Jugador 2 (Flechas) |
|---|---|---|
| **Moverse** | `A` / `D` | `←` / `→` |
| **Salto** | `W` o `Espacio` | `↑` |
| **Agacharse** | `S` | `↓` |
| **Rodar** | `S` + Movimiento | `↓` + Movimiento |
| **Correr** | `Shift Izquierdo` o `Q` | `.` (Punto) o `/` |
| **Melee** | `F` | `N` |
| **Disparo** | `G` | `M` |
| **Granada / Bomba** | `H` (o `L` / `,`) | `,` (o `L`) |
| **Ranuras (1–4)** | `1`, `2`, `3`, `4` | `7`, `8`, `9`, `0` |

---

## 💻 Desarrollo Local (Opcional para Colaboradores)

Si deseas modificar el código fuente o contribuir al proyecto localmente:

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo (puerto 3000)
npm run dev

# 3. Verificar tipos y generar build de producción
npm run lint && npm run build
```

### Estructura Principal

```text
superN-0.1/
├── docs/                       # Planes maestros y documentación técnica
├── public/assets/              # Spritesheets, frameMeta.json, armas y fondos
├── src/
│   ├── hooks/
│   │   └── useMobileDevice.ts  # Detección táctil, orientación, viewport y fullscreen
│   ├── components/
│   │   ├── ArenaCanvas.tsx     # Motor 60Hz, física, cámara móvil adaptativa y render 2D
│   │   ├── MobileOrientationGuard.tsx
│   │   ├── MobilePSPControls.tsx
│   │   ├── LandingScreen.tsx
│   │   ├── Warehouse3DCanvas.tsx
│   │   ├── ModeSelectScreen.tsx
│   │   ├── MainMenu.tsx
│   │   ├── MatchSetupModal.tsx
│   │   ├── WorldSelectScreen.tsx
│   │   ├── ArsenalView.tsx
│   │   └── FighterBar.tsx
│   └── game/                   # Controls, CharacterData, WeaponData, WeaponFireSystem,
│                               # WeaponRenderer, WorldData, GrenadeSystem, BotFSM, PhysicsStep
├── index.html
├── package.json
└── vite.config.ts
```

> ⚠️ **Nota de Desarrollo:**  
> Al modificar animaciones o fotogramas en `src/game/CharacterData.ts`, coordina siempre los cambios con `public/assets/sprites/player/frameMeta.json` y los metadatos de escala uniforme.
