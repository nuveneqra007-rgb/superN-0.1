# superN — Informe Exhaustivo de Auditoría y Verificación del Código (GDD v2)

**Fecha:** 29 de Octubre de 2026  
**Proyecto:** `superN` (React 19 + TypeScript + Canvas 2D + Tailwind v4 + Vite)  
**Archivo Auditado Principal:** `src/components/ArenaCanvas.tsx` (8,137 líneas), `src/game/PlayerController.ts`, `src/game/GameConstants.ts`, `src/game/PhysicsStep.ts`, `src/game/CombatSystem.ts`, `src/game/WeaponData.ts`, `src/game/BotData.ts`, `src/components/MatchSetupModal.tsx`, `src/components/ModeSelectScreen.tsx`, `package.json`, y carpeta `public/`.

---

## 0. Verificación del Resumen Ejecutivo (Hallazgos 1 al 10)

| # | Hallazgo Documentado | Estado en Código | Ubicación Exacta (`archivo:línea`) | Detalle Técnico Confirmado |
|---|---|---|---|---|
| **1** | **Sin Timestep Fijo (60 Hz determinista es falso hoy)** | ✅ **CONFIRMADO (CRÍTICO)** | `src/components/ArenaCanvas.tsx:8027-8035`, `1765` | `const loop = () => { updateGame(); renderGame(); animId = requestAnimationFrame(loop); }`. En `updateGame()`, `p1Controller.update(1/60, ...)` se invoca directamente una vez por cada frame del navegador. En monitores de 144 Hz o 240 Hz el juego se acelera a **2.4× - 4.0×**; en móviles a 30 fps, corre a la mitad. No hay acumulador de tiempo ni `dt` real. |
| **2** | **Teclas pegadas al cambiar de ventana/pestaña** | ✅ **CONFIRMADO (CRÍTICO)** | `src/components/ArenaCanvas.tsx:1265-1326` | Solo hay listeners de `keydown` y `keyup` en `window`. No existen manejadores de `blur` ni de `document.visibilitychange`. Si el usuario hace Alt+Tab o cambia de pestaña mientras camina, `stateRef.current.keys[key]` queda permanentemente en `true`. Además, se utiliza `e.key.toLowerCase()` sensible a la distribución del teclado en lugar del físico `e.code`. |
| **3** | **Controles inconsistentes entre UI, README y Código** | ✅ **CONFIRMADO (CRÍTICO)** | `src/game/PlayerController.ts:272-309`, `ArenaCanvas.tsx:1982-1985`, `ModeSelectScreen.tsx:234-237` | **Inconsistencia severa:** En `ModeSelectScreen.tsx:234` la UI indica `J1: WASD - N (MELEE) - M (DISPARO) - G (GRANADA)`. En cambio, en `PlayerController.ts:275`, para el esquema `wasd_p1`, la tecla `G` está mapeada a **DISPARO** (`fire`), mientras que la granada lee `R` o `L`. Además, en `ArenaCanvas.tsx:1278`, presionar `R` ejecuta inmediatamente `restartRound()`. |
| **4** | **Teclas de debug activas en producción** | ✅ **CONFIRMADO (ALTO)** | `src/components/ArenaCanvas.tsx:1278-1311` | `R` reinicia la ronda al instante sin confirmación; `B` alterna el bot entre inmóvil y activo; `C` y `T` ciclan granadas de P1; `Y` cicla granadas de P2; **`ESC` cierra abruptamente la partida y expulsa al menú** sin menú de pausa ni advertencia. |
| **5** | **Hit-stun con valores mágicos dispersos** | ✅ **CONFIRMADO (ALTO)** | `src/components/ArenaCanvas.tsx:2403, 2507, 2517, 2642, 3224, 3234, 4020, 4137, 4147, 4246, 4747, 4756` vs `GameConstants.ts:41-42` | `GameConstants.HitstunTicksLight` (24) y `HitstunTicksStrong` (48) están definidos pero casi nunca se usan. En `ArenaCanvas.tsx` hay 12 asignaciones manuales en duro (`bot.hitstunTicks = 14`, `16`, `18`, `20`, `24`), descoordinadas con el estándar de Superfighters. |
| **6** | **Inexistencia de Hit-stop (Freeze frames)** | ✅ **CONFIRMADO (MEDIO)** | `src/components/ArenaCanvas.tsx` (ausente en todo el proyecto) | No existe la propiedad `hitStopTicks` ni `hitStop` en `GameState` ni en `PlayerState`. Los impactos no congelan momentáneamente la animación de atacante y defensor, reduciendo drásticamente la contundencia de los golpes arcade. |
| **7** | **Doble barra de vida en pantalla de juego** | ✅ **CONFIRMADO (MEDIO)** | `src/components/ArenaCanvas.tsx:7730-7741` vs `:7914-7928` | Se dibuja una barra de vida overhead sobre la cabeza del personaje en el mundo (`:7730-7735`) y simultáneamente la tarjeta retro en la esquina superior izquierda del HUD (`:7914-7928`). |
| **8** | **Marcador de rondas dibuja casillas fantasmas** | ✅ **CONFIRMADO (MEDIO)** | `src/components/ArenaCanvas.tsx:8051-8078`, `MatchSetupModal.tsx:90` | La partida termina al llegar a `Math.floor(maxRounds / 2) + 1` victorias (ej. al llegar a 3 en mejor de 5). Sin embargo, el HUD dibuja `maxRounds` (5) casillas, por lo que las 2 casillas finales siempre quedan vacías. Peor aún: en modo infinito (`maxRounds = 999`), el HUD intenta iterar e instanciar 999 `<div>`s en el header. |
| **9** | **Código muerto masivo de Phaser 3** | ✅ **CONFIRMADO (LIMPIEZA)** | `src/scenes/MainScene.ts`, `src/entities/Player.ts`, `src/entities/NinjaPlayer.ts`, `src/game/NinjaController.ts`, `package.json:14` | El juego real corre 100% sobre HTML5 Canvas 2D en `ArenaCanvas.tsx`. La escena de Phaser 3 y sus prefabs de física arcade están completamente desconectados (cero imports en la app viva), pero `phaser` sigue ocupando ~1.5 MB en el bundle. |
| **10** | **Doble motor de física conflictivo en un mismo personaje** | ✅ **CONFIRMADO (ARQUITECTURA)** | `ArenaCanvas.tsx:1765` vs `:5330`, `PlayerController.ts:10-43` vs `GameConstants.ts:8-14` | Cuando P1 camina o salta, sus coordenadas son calculadas por `PlayerController` (Gravedad 1200/1950, Salto -560, Run 310). Cuando P1 es golpeado, derribado o aturdido, pasa a ser controlado por `PhysicsStep.tick()` (Gravedad 980, Salto -600, Fricción 0.75/0.92). Esto genera saltos visuales y desincronizaciones de inercia al transicionar de estado. |

---

## 1. Verificación Detallada por Lotes

### LOTE 1: Arquitectura y Rendimiento

#### 1.1 Timestep fijo de 60 Hz
* **Estado:** ✅ **Confirmado.**
* **Ubicación:** `src/components/ArenaCanvas.tsx:8027-8035`.
* **Evidencia:**
  ```typescript
  const loop = () => {
    updateGame();
    renderGame();
    animId = requestAnimationFrame(loop);
  };
  ```
* **Diagnóstico:** Cada llamada a `requestAnimationFrame` ejecuta exactamente un tick lógico (`updateGame()`) sin verificar cuánto tiempo ha transcurrido. En monitores modernos de 120Hz, 144Hz o 165Hz, el juego se ejecuta al doble o más de la velocidad prevista.
* **Corrección planificada:** Implementar un acumulador de tiempo determinista:
  ```typescript
  const FIXED_STEP = 1 / 60;
  const MAX_ACCUMULATOR = 0.25; // Prevenir spiral of death
  let lastTime = performance.now();
  let accumulator = 0;

  const loop = (now: number) => {
    let dt = (now - lastTime) / 1000;
    lastTime = now;
    if (dt > MAX_ACCUMULATOR) dt = MAX_ACCUMULATOR;
    accumulator += dt;

    while (accumulator >= FIXED_STEP) {
      updateGameFixed(FIXED_STEP);
      accumulator -= FIXED_STEP;
    }
    renderGame();
    animId = requestAnimationFrame(loop);
  };
  ```

#### 1.2 Manejo de inputs del navegador y eventos de pérdida de foco
* **Estado:** ✅ **Confirmado.**
* **Ubicación:** `src/components/ArenaCanvas.tsx:1265-1326`.
* **Evidencia:**
  1. No existen `window.addEventListener('blur', ...)` ni `document.addEventListener('visibilitychange', ...)`. Cuando se pierde el foco, el objeto `stateRef.current.keys` mantiene activas las teclas que estaban pulsadas.
  2. Se evalúa `e.key.toLowerCase()`. En teclados franceses (AZERTY) o alemanes (QWERTZ), `W` es `Z` o `A` es `Q`, rompiendo la jugabilidad.
  3. `e.preventDefault()` solo se aplica a las 4 flechas y la barra espaciadora (`:1270-1272`), omitiendo teclas como Tab, WASD o teclas de ataque.
* **Corrección planificada:** 
  - Limpiar el buffer de teclas en `blur` y `visibilitychange`.
  - Migrar la detección a `e.code` (ej. `KeyW`, `KeyA`, `KeyS`, `KeyD`, `ArrowUp`, `KeyN`, `KeyM`, `KeyG`).

#### 1.3 Controles Canónicos y Fuente Única de Verdad
* **Estado:** ✅ **Confirmado.**
* **Ubicación:** `src/game/PlayerController.ts:261-312`, `ArenaCanvas.tsx:1980-2300`, `ModeSelectScreen.tsx:228-240`.
* **Evidencia del conflicto actual:**
  - En `ModeSelectScreen.tsx:234`: `J1: WASD - N (MELEE) - M (DISPARO) - G (GRANADA)`.
  - En `PlayerController.ts:275` (esquema `wasd_p1`):
    - `melee`: `F`, `J` (o `N` si es `!is1v1`).
    - `fire`: `G`, `K` (o `M` si es `!is1v1`).
    - `throwGrenade`: `R`, `L` (o `,` si es `!is1v1`).
  - En `ArenaCanvas.tsx:1278`: la tecla `R` está capturada para `restartRound()`. Por lo tanto, si el jugador presiona `R` para lanzar una granada en el esquema WASD, la ronda se reinicia inmediatamente.
* **Solución requerida:** Estandarizar un único mapa de controles universal documentado en `GameConstants.ts` o `ControlsConfig.ts` sin ambigüedad entre 1P (vs Bot) y 2P (Local 1v1).

#### 1.4 Teclas de debug y sistema de pausa
* **Estado:** ✅ **Confirmado.**
* **Ubicación:** `src/components/ArenaCanvas.tsx:1278-1311`.
* **Evidencia:**
  - `ESC` (`:1308`): llama directamente a `onExitToMenu()`, destruyendo la sesión actual sin preguntar.
  - `R` (`:1278`): reinicia la ronda al vuelo.
  - `B` (`:1298`): congela/descongela la IA del bot.
  - `C`, `T`, `Y` (`:1281-1296`): alternan el tipo de granada equipado instantáneamente.
* **Solución requerida:** 
  - Aislar las teclas de debug tras una bandera condicional (`import.meta.env.DEV` o toggle de opciones).
  - Al presionar `ESC`, pausar el bucle de juego y desplegar un modal retro de Pausa con opciones: `REANUDAR (ESC / SPACE)`, `REINICIAR RONDA (R)`, `SALIR AL MENÚ`.

---

### LOTE 2: Física y Combate

#### 2.1 Hit-stop (Impact Freeze Frames)
* **Estado:** ✅ **Confirmado (Inexistente).**
* **Ubicación:** `src/components/ArenaCanvas.tsx` y `CombatSystem.ts`.
* **Detalle:** Al impactar con golpe cuerpo a cuerpo o bala pesada, tanto el atacante como el agredido continúan actualizando su lógica en el siguiente frame sin retención visual.
* **Solución:** Agregar `hitStopTicks: number` en `GameState`. Mientras `hitStopTicks > 0`, omitir la actualización de física y lógica de animación durante 2-4 frames en impactos regulares y 6-8 frames en golpes críticos/pesados, manteniendo el renderizado y screen shake.

#### 2.2 Hit-stun canónico y Knockback
* **Estado:** ✅ **Confirmado.**
* **Ubicación:** `src/components/ArenaCanvas.tsx:2403-2518`, `4020-4756`, `GameConstants.ts:41-42`.
* **Detalle:** En lugar de centralizarse en `CombatSystem.ts`, las asignaciones de `hitstunTicks` están duplicadas y dispersas en más de 12 bloques `if/else` con números arbitrarios (`14`, `16`, `18`, `20`, `24`).
* **Solución:** Centralizar el cálculo de stun y knockback exclusivamente en `CombatSystem.applyHit(attacker, victim, hitData)`.

#### 2.3 Sistema de Grapple (Agarre y Lanzamiento)
* **Estado:** ✅ **Confirmado.**
* **Ubicación:** `src/components/ArenaCanvas.tsx:1827-1850`, `3525-3550`.
* **Detalle:** El agarre existe, pero cuando P1 agarra al Bot (o viceversa), el personaje retenido se ancla rígidamente a `bot.x = p1.x + p1FacingDir * 24; bot.y = p1.y`. No hay opción de escape por forcejeo del defensor, ni animación específica de forcejeo.

#### 2.4 Parámetros de Movimiento y Stamina
* **Estado:** ✅ **Confirmado.**
* **Ubicaciones:** `src/game/GameConstants.ts:8-25`, `src/game/PlayerController.ts:10-43`, `src/components/ArenaCanvas.tsx:6325`.
* **Discrepancias críticas halladas:**
  1. **Stamina de P1 nunca disminuye:** `p1.stamina` nunca se resta al saltar, rodar o golpear. En `ArenaCanvas.tsx:6325` solo se envía al HUD como lectura (`p1Stamina: p1.stamina`), manteniéndose en 100% permanente.
  2. **Stamina del Bot sí se resta al saltar:** en `ArenaCanvas.tsx:4968` el bot paga `StaminaCostJump = 15`.
  3. **Dos tablas de física simultáneas:**
     - `GameConstants.ts`: `JumpVelocity: -600`, `Gravity: 980`, `RunSpeed: 260`, `RollSpeed: 200`.
     - `PLAYER_CONFIG` (`PlayerController.ts`): `JUMP_FORCE: 560`, `GRAVITY_RISE: 1200`, `GRAVITY_FALL: 1950`, `RUN_SPEED: 310`, `ROLL_SPEED: 420`.
     - Dependiendo de si el jugador está en movimiento (`PlayerController`) o en hitstun (`PhysicsStep`), los valores de gravedad y velocidad cambian drásticamente.

---

### LOTE 3: Interfaz de Usuario (UI)

* **UI-01: Doble barra de vida:** ✅ **Confirmado.** Líneas `7730-7735` (overhead) y `7914-7928` (HUD superior). Se debe eliminar la barra overhead pequeña sobre la cabeza y mantener únicamente la tarjeta retro superior izquierda.
* **UI-02: Casillas de marcador de rondas:** ✅ **Confirmado.** Líneas `8051` y `8068`. Muestra `maxRounds` casillas en vez de los puntos necesarios para ganar (`Math.floor(maxRounds / 2) + 1`). En partidas infinitas (`maxRounds = 999`), revienta la interfaz al intentar renderizar 999 casillas.
* **UI-03: Bot (COM) info card:** ✅ **Confirmado.** Líneas `7944-8020`. La caja superior derecha ya fue parcialmente restaurada en el turno anterior, pero faltan los datos dinámicos de facción/nombre real y munición.
* **UI-04: Recorte de nombre de armas:** ✅ **Confirmado.** Líneas `7941` y `8012`. Nombres largos como `LANZALLAMAS` o `FRANCOTIRADOR` no se truncan con el ancho de la caja (226px), solapándose con los bordes.
* **UI-05: Portada / Menú Principal:** ✅ **Verificado y Actualizado.** Título `superN` en una sola línea, la `N` grande en rojo sangre, texto secundario `LUCHA, ESQUIVA, SOBREVIVE` en rojo sangre, botón centrado sin elementos sobrantes.
* **UI-06: Selector de personajes:** ✅ **Confirmado.** `src/components/MainMenu.tsx`. Permite seleccionar entre las 15 facciones canónicas y la opción `RANDOM`.
* **UI-07: Selector de rondas en modal:** ✅ **Confirmado.** `src/components/MatchSetupModal.tsx:32-38`. Opciones `INFINITE`, `5 ROUNDS`, `3 ROUNDS`, `7 ROUNDS`, `1 ROUND`. Requiere que el HUD maneje el modo infinito con un símbolo `∞` en lugar de crear un array de 999 casillas.
* **UI-08: Resolución y responsive:** ✅ **Confirmado.** Líneas `8040` y `8102`. Canvas fijado en 960×540, contenido dentro de contenedor centrado con relación de aspecto 16:9 y `imageRendering: pixelated`.
* **UI-09: Modal de fin de partida:** ✅ **Confirmado.** Líneas `8106-8126`. Incluye marcador final, ganador y botones `REVANCHA (R)` y `SALIR AL MENÚ`.
* **UI-10: Contador de munición en HUD:** ✅ **Confirmado.** Líneas `7938-7942` y `8009-8013`. Las tarjetas de P1 y del Bot muestran únicamente el nombre del arma, sin indicar las balas restantes (ej. `12 / 12`).
* **UI-11: Indicadores de estado:** ✅ **Confirmado.** Se solicitó en la referencia visual iconos circulares amarillos en la esquina.
* **UI-12: Menú de Pausa:** ✅ **Confirmado (Ausente).** Actualmente `ESC` aborta la partida al menú sin menú de pausa.
* **UI-13: Pantalla de Selección de Modo:** ✅ **Confirmado.** `ModeSelectScreen.tsx` funcional con selección vsBot y 1v1 Local.

---

### LOTE 4: Limpieza y Deuda Técnica

* **4.1 Código muerto (Phaser 3):**
  - **Archivos huérfanos confirmados:**
    - `src/scenes/MainScene.ts` (260 líneas)
    - `src/entities/Player.ts` (140 líneas)
    - `src/entities/NinjaPlayer.ts` (190 líneas)
    - `src/game/NinjaController.ts` (240 líneas)
  - **En `package.json`:** `"phaser": "^4.2.1"` está instalado como dependencia directa, pero ningún archivo activo en la aplicación lo importa.
* **4.2 Estado redundante en `ArenaCanvas.tsx`:**
  - `s.p1` (instancia de `PlayerState`) y `s.p1Controller` (instancia de `PlayerController`) duplican `x`, `y`, `facingRight`, `isOnFloor`, `state`/`fsm`. En cada tick se sincronizan manualmente en decenas de líneas.
* **4.3 Uso de `any` y advertencias de TypeScript:**
  - `npm run lint` (`tsc --noEmit`) compila limpiamente (0 errores tipográficos actuales), pero la duplicación de estado entre controladores introduce fragilidad.

---

### LOTE 5: IA y Comportamiento de Bots

* **Estado de quietud del bot (`botQuiet`):**
  - En `src/components/ArenaCanvas.tsx:1030`, `botQuiet` inicia en `true` por requerimiento explícito previo ("Los bots deben seguir quietos").
  - Si se presiona `B` (`:1298`), el bot activa su FSM (`BotFSM.ts`) con detección de proximidad, persecución, salto y combate cuerpo a cuerpo/armas.
* **Perfiles de IA:** Definidos en `src/game/BotData.ts` con 8 arquetipos (`Grunt`, `Hulk`, `Hard`, `Soldier`, `AssassinMelee`, `AssassinRange`, `Cowboy`, `Zombie`).

---

### LOTE 6: Assets y Recursos

* **Sprites:**
  - Ninja: spritesheets individuales en `/public/assets/sprites/player/` (`ninja_walk.png`, `ninja_run.png`, `ninja_jump.png`, `ninja_roll.png`, `one_hand_attack.png`, `two_hand_attack.png`, `throw_up.png`).
  - Bots: spritesheets individuales en `/public/assets/sprites/bot/` (`agent.png`, `assassin.png`, `berserker.png`, `biker.png`, `tank.png`, `thug.png`, etc.).
* **Armas:** 35+ iconos de armas en formato PNG en `/public/assets/weapons/`.
* **Archivos residuales temporales en `/public/assets/aistudio/`:**
  - Existen capturas y adjuntos subidos en turnos previos (`Captura_desde_...png`, `image_...png`, `Gemini_Generated_Image_...jpeg`).
* **Archivos duplicados en raíz de `/public/`:**
  - `public/Agent_2.png` y `public/Assassin_2.png` son copias redundantes de los archivos que ya existen en `/public/assets/sprites/bot/`.

---

## 2. Tabla de Discrepancias Críticas Detectadas

| Componente | Lo que dice la UI / Documentación | Lo que hace el código actualmente | Consecuencia directa |
|---|---|---|---|
| **Lanzar Granada (J1)** | UI (`ModeSelectScreen.tsx:234`): Tecla **`G`** | `PlayerController.ts:277`: Teclas **`R`**, **`L`** o **`,`** | Presionar `G` dispara el arma de fuego (`fire`), no lanza la granada. Presionar `R` reinicia la ronda completa. |
| **Lanzar Granada (J2)** | UI (`ModeSelectScreen.tsx:237`): Tecla **`L`** | `PlayerController.ts:298`: Teclas **`,`** o **`3`** | J2 presiona `L` y no ocurre nada. |
| **Golpe Melee (J2)** | UI: Tecla **`J`** | `PlayerController.ts:294`: Tecla **`N`** o **`1`** | J2 no puede golpear con la tecla descrita en pantalla. |
| **Disparo (J2)** | UI: Tecla **`K`** | `PlayerController.ts:296`: Tecla **`M`** o **`2`** | J2 no puede disparar con la tecla descrita en pantalla. |
| **Casillas de Marcador** | Partida a N rondas | Pinta `maxRounds` casillas fijas | Si la partida es a 5 rondas, gana quien llegue a 3; las casillas 4 y 5 quedan desiertas permanentemente. En modo infinito intenta pintar 999 casillas. |
| **Stamina del Ninja (P1)** | Indicador al 100% en HUD | `p1.stamina` nunca se decrementa | El jugador tiene estamina infinita, puede saltar y rodar sin penalización. |
| **Tecla ESC en Partida** | Botón visual: `SALIR (ESC)` | Cierra abruptamente el juego (`onExitToMenu`) | El jugador pierde su partida por accidente si roza ESC; no hay pausa. |

---

## 3. Puntos donde Requiero tu Decisión o Ayuda

Antes de proceder a la refactorización e implementación de cambios en el código, necesito tu confirmación en los siguientes **5 puntos clave de diseño y arquitectura**:

### 1. Esquema Canónico Definitivo de Controles
Actualmente la UI de selección de modo, el código de `PlayerController.ts` y las instrucciones en pantalla se contradicen entre sí.
¿Cuál de los siguientes esquemas prefieres que sea el estándar oficial y definitivo?

* **Opción A (Recomendada - Estilo Superfighters Arcade):**
  * **Jugador 1 (WASD):**
    * Mover: `A` / `D`
    * Salto: `W`
    * Agacharse: `S`
    * Rodar: `S` + Movimiento
    * Correr: Mantener `Q` o `Shift`
    * Golpe Melee: `N`
    * Disparar: `M`
    * Lanzar Granada/Bomba: `,` (coma) o `G`
  * **Jugador 2 (Flechas en 1v1 Local):**
    * Mover: `Flecha Izquierda` / `Flecha Derecha`
    * Salto: `Flecha Arriba`
    * Agacharse: `Flecha Abajo`
    * Rodar: `Flecha Abajo` + Movimiento
    * Correr: Mantener `.` (punto)
    * Golpe Melee: `J`
    * Disparar: `K`
    * Lanzar Granada/Bomba: `L`
* **Opción B (Alternativa de dos bloques cercanos):**
  * J1 usa `WASD` con `F` (Melee), `G` (Disparo), `H` (Granada).
  * J2 usa `Flechas` con `N` (Melee), `M` (Disparo), `,` (Granada).

### 2. Comportamiento Predeterminado de la IA del Bot
En la tarea anterior instruiste: *"Los bots deben seguir quietos"*. Por ello, en el código actual el bot inicia con `botQuiet = true` (modo saco de entrenamiento) y solo se mueve si se pulsa la tecla de debug `B`.
¿Cómo prefieres que quede para el juego final?
* **Opción A:** En partidas normales (vs Bot), la IA del bot está **activa por defecto** para combatir al jugador, y se incluye un botón o modo de práctica explícito para dejarlo quieto.
* **Opción B:** Mantener al bot quieto por defecto hasta que el usuario decida activarlo.

### 3. Sistema de Stamina / Energía en P1
Actualmente el Ninja tiene estamina infinita (el indicador marca 100% y jamás baja).
¿Deseas que activemos el consumo de stamina clásico de Superfighters?
* **Opción A (Fiel a Superfighters):** Rodar cuesta 25% de stamina, saltar cuesta 15%, y correr consume progresivamente. Si la stamina llega a 0, el Ninja no puede rodar ni esprintar hasta recuperarse.
* **Opción B (Arcade libre):** Rodar tiene solo cooldown de tiempo (sin gastar stamina) y los saltos son ilimitados.

### 4. Eliminación de Dependencias y Código Muerto de Phaser 3
`src/scenes/MainScene.ts`, `src/entities/Player.ts`, `src/entities/NinjaPlayer.ts`, y `src/game/NinjaController.ts` son reliquias de una implementación previa en Phaser 3 que no se utilizan en absoluto. La dependencia `phaser` en `package.json` pesa más de 1.5 MB innecesariamente.
* ¿Confirmas que eliminemos estos 4 archivos muertos y desinstalemos el paquete `phaser` de `package.json` para dejar el proyecto limpio y ligero?

### 5. Menú de Pausa con la Tecla ESC
Actualmente al pulsar `ESC` en combate, la partida se destruye inmediatamente y regresa al menú.
* ¿Confirmas implementar un menú de pausa retro dentro del Canvas/Overlay con las opciones:
  1. `CONTINUAR (ESC / SPACE)`
  2. `REINICIAR RONDA (R)`
  3. `SALIR AL MENÚ PRINCIPAL`?
