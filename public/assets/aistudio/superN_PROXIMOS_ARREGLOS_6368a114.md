# superN — Próximos arreglos (GDD v3)

**Fecha:** 2026-10-29 · **Stack:** React 19 + TypeScript + Canvas 2D + Tailwind + Vite
**Base:** auditoría de capturas + lectura del código. Reemplaza a `superN_auditoria_GDD.md` (v2), que tenía dos errores corregidos aquí (ver sección 1).

Rutas relativas a `src/`. `AC` = `components/ArenaCanvas.tsx`. Marcas: ✅ confirmado en código · 📷 visto en captura · ❓ solo se comprueba jugando.

---

## 1. Correcciones al informe anterior

| Antes dije | Realidad verificada |
|---|---|
| "La tecla G no hace nada" | G **dispara** en el esquema WASD de J1 (`game/PlayerController.ts:271-309`). La granada es **R o L**. El error es que la UI promete "G = granada" (`components/ModeSelectScreen.tsx:234-237`). |
| Salto flotante, roll lento, falta salto variable (valores de `GameConstants`) | Eso aplica solo a `PhysicsStep`. El jugador camina con `PLAYER_CONFIG`: gravedad 1200 subiendo / 1950 cayendo, salto variable, roll 420 (más rápido que correr 310), 0.24 s de invulnerabilidad. **Esas partes ya están bien.** |

---

## 2. Decisiones de diseño (propuestas, cambiables antes de empezar)

| # | Tema | Decisión propuesta |
|---|---|---|
| D1 | Controles 1 jugador | WASD **o** flechas · **N** melee · **M** disparo · **,** granada |
| D2 | Controles 1v1 | J1: WASD + **F** melee, **G** disparo, **H** granada · J2: flechas + **N** melee, **M** disparo, **,** granada. (Evita que las dos manos se pisen) |
| D3 | Bot al iniciar | IA **activa** por defecto; "Práctica (bot quieto)" pasa a ser un toggle en el menú de pausa |
| D4 | Estamina | Opción arcade: rodar con cooldown, salto y carrera sin gasto (revisar tras jugarlo) |
| D5 | Código de Phaser | Eliminar los 4 archivos y desinstalar la dependencia |
| D6 | ESC | Abre un menú de pausa: Continuar · Reiniciar ronda · Práctica · Controles · Salir (con confirmación) |

---

## 3. Bugs y problemas verificados (de más a menos grave)

| ID | Problema | Dónde | Prio |
|---|---|---|---|
| B-01 | **Sin timestep fijo**: `loop` llama `updateGame(); renderGame();` por frame. A 144 Hz el juego va ~2.4× más rápido; a 30 fps, a la mitad. | `AC:8027-8035`, `AC:1765` | 🔴 |
| B-02 | **Dos motores de física** sobre el mismo luchador: `PlayerController` al caminar/saltar y `PhysicsStep` (gravedad 980, salto −600) al ser golpeado/derribado. Causa saltos de inercia al cambiar de estado. | `AC:1765` vs `AC:5330-5347`; `PlayerController.ts` vs `GameConstants.ts` | 🔴 |
| B-03 | **R reinicia la ronda y también es la granada de J1 en 1v1**: lanzar una granada reinicia la partida. | `AC:1278`, `PlayerController.ts:275` | 🔴 |
| B-04 | **Teclas pegadas** al cambiar de pestaña (sin `blur`/`visibilitychange`); se usa `e.key` (depende del layout) en vez de `e.code`. | `AC:1265-1326` | 🔴 |
| B-05 | **UI de controles no coincide con el código** (G, J/K/L, etc.). | `ModeSelectScreen.tsx:234-237` vs `PlayerController.ts` | 🔴 |
| B-06 | **Bot nace quieto** (`botQuiet: true`) hasta que se pulsa B. | `AC:1030`, `AC:4898` | 🟠 |
| B-07 | **Teclas de debug activas** (R, B, C/T/Y) y **ESC sale al menú sin confirmar**. | `AC:1278-1311` | 🟠 |
| B-08 | **Hit-stun con valores a mano** en ~12 sitios (14–24 ticks) mientras `GameConstants.HitstunTicksLight/Strong` (24/48) casi no se usan. | `AC:2403, 2507, 2517, 2642, 3224, 3234, 4020, 4137, 4147, 4246, 4747, 4756` | 🟠 |
| B-09 | **No hay hit-stop** (pausa al impactar). | ausente en todo el proyecto | 🟠 |
| B-10 | **Modo infinito**: `rounds = 999` hace que el HUD cree 999 casillas. | `MatchSetupModal.tsx:90`, `AC:8051-8078` | 🟠 |
| B-11 | **Marcador**: dibuja `maxRounds` casillas, pero se gana con `floor(maxRounds/2)+1`. | `AC:8051-8078`, `AC:1623` | 🟠 |
| B-12 | **Estamina de P1 nunca se gasta**; la del bot sí (inconsistencia). | `AC:4968`, `AC:6325` | 🟡 |
| B-13 | **Duplicación de estado**: `s.p1` y `s.p1Controller` guardan copias paralelas de posición/velocidad/FSM. | `AC:1026-1028`, `AC:1765` | 🟡 |
| B-14 | **Agarre**: coloca al rival de forma rígida, sin forcejeo ni soltado por daño. | `AC:1827-1850` | 🟡 |
| B-15 | **~1,600 líneas de código muerto de Phaser** y la dependencia instalada. | `scenes/MainScene.ts`, `entities/Player.ts`, `entities/NinjaPlayer.ts`, `game/NinjaController.ts`, `package.json` | 🟡 |
| B-16 | **`ArenaCanvas.tsx` = 8,137 líneas** (318 KB). | `AC` | 🟡 |

---

## 4. Plan por lotes (cada lote se prueba antes del siguiente)

### LOTE 0 — Limpieza segura ✅ HECHO
- [x] Borrar `scenes/MainScene.ts`, `entities/Player.ts`, `entities/NinjaPlayer.ts`, `game/NinjaController.ts` (B-15, D5)
- [x] `npm uninstall phaser`
- [x] `npm run lint` y `npm run build` sin errores; el juego abre igual
- [x] Hacer commit antes (reversible con git)

### LOTE 1 — Fundación ✅ HECHO (más el lote 1.5: lecturas de teclas viejas migradas a `Controls.ts`, ESC no pausa al terminar la partida, la pausa limpia teclas al reanudar)
- [x] **B-01** Acumulador a pasos de 1000/60 ms con tope de 100 ms; `renderGame()` una vez por frame. Limpiar `keysJustPressed` al final de **cada** `updateGame`. (`PlayerController.update(1/60)` ya recibe paso fijo: encaja directo.)
- [x] **B-04** Migrar a `e.code`; listeners `blur` y `visibilitychange` que vacíen `keys` y `keysJustPressed`; `preventDefault` también en `Comma`, `Period`, `Slash` durante la partida.
- [x] **B-03 / B-05 / D1 / D2** Crear `game/Controls.ts` como **única fuente de verdad** de las teclas; `PlayerController`, `ModeSelectScreen` y el README leen de ahí. Quitar R como granada.
- [x] **B-06 / D3** `botQuiet: false` por defecto; toggle de práctica en la pausa.
- [x] **B-07 / D6** R, B (y demás debug) solo con `?debug=1`; ESC abre pausa retro con Continuar · Reiniciar ronda · Práctica · Controles · Salir (confirmar).

**Aceptación:** misma distancia recorrida en 3 s a 60 Hz, 144 Hz y con FPS limitados a 30; mantener D y cambiar de pestaña deja al ninja quieto; cada tecla de la tabla D1/D2 funciona y coincide con la UI; lanzar granada no reinicia nada.

### LOTE 2 — Física unificada y game feel (🟠)
- [ ] **B-02** Decidir **un solo motor**. Recomendado: llevar a `PhysicsStep` los valores de `PLAYER_CONFIG` (gravedad 1200/1950, terminal 850) o enrutar los estados Hitstun/KnockedDown/GetUp por el mismo controlador. Probar: ser golpeado en el aire y en el suelo, derribo, levantarse.
- [ ] **B-08** Función única `applyHit(target, { damage, kbX, kbY, stunTicks, hitStop })` y tabla de stun por arma en `game/WeaponData.ts`. Primero **mover** los números actuales sin cambiarlos; balancear después.
- [ ] **B-09** `hitStop` en el estado: 3–4 ticks por golpe normal, 6 en golpe final de combo; durante el hit-stop se congela la simulación pero el shake sigue.
- [ ] Feedback de impacto: flash blanco de 2 frames, partículas de sangre/chispa según el knockback, sonido distinto por arma.
- [ ] **B-12 / D4** P1 sin gasto de estamina (alinear con el bot o retirar el gasto del bot).
- [ ] ❓ Medir: ¿el combo de 3 golpes tiene huecos muertos? ¿la ventana para encadenar es cómoda?

### LOTE 3 — UI (🟠/🟡)
- [ ] **UI-01** Quitar la barra de vida sobre la cabeza (`AC:7730-7741`); dejar solo la tarjeta del HUD (`AC:7914-7928`) y el nametag.
- [ ] **B-10 / B-11** Marcador con `floor(maxRounds/2)+1` casillas; en modo infinito mostrar **número de victorias**, no casillas.
- [ ] **UI-04** Truncar con "…" el nombre del arma según `measureText` (`AC:7941`); "KATANA TRADICIONAL", "LANZALLAMAS" y "FRANCOTIRADOR" se salen.
- [ ] **UI-10** Contador de munición del jugador **y del bot** en las tarjetas (`AC:7944-8020`).
- [ ] **UI-03** Contraste: contorno de 1 px claro en el sprite del jugador y borde superior claro en las plataformas (`game/WorldData.ts`).
- [ ] **UI-05** Acentos 📷 (CóMO, MATóN…): el código escribe `CÓMO` en mayúscula, así que probar en el navegador la fuente que se está usando; si falla, cambiar a una con Latin-1 completo y esperar `document.fonts.ready` antes de pintar.
- [ ] **UI-06** Un solo idioma (`strings.ts`).
- [ ] **UI-07** Selector de rondas con la opción activa resaltada; filas del modal con foco visible; quitar la flecha `◂` suelta junto a "GAME MODE"; renombrar esa fila a "ROUNDS" (`MatchSetupModal.tsx`).
- [ ] **UI-08** Quitar `max-w-[960px]` del canvas (`AC:8102`) para que la arena use más pantalla, manteniendo 16:9.
- [ ] **UI-09** Texto mínimo de 12 px en menús (hoy hay `text-[8px]` y `text-[9px]`).
- [ ] **UI-11** Fondo de tuberías con parpadeo de luz en el menú de inicio.
- [ ] Baja: alinear tarjetas de personajes, ocultar slots `EMPTY`, rehacer o quitar las barras segmentadas del inicio.

### LOTE 4 — Arquitectura (🟡)
- [ ] **B-13** Dejar a `PlayerController` como única fuente de posición/velocidad/FSM de P1 y que `s.p1` lea de él.
- [ ] **B-16** Partir `ArenaCanvas.tsx`, una extracción por vez y jugar 2 minutos entre cada una: 1) input, 2) HUD (`drawRetroHUD`), 3) render del mundo, 4) render de luchadores, 5) proyectiles y granadas, 6) integración de bots. Meta: orquestador < 600 líneas.
- [ ] Tests (vitest) de `PhysicsStep`, `CombatSystem`, `PlayerFSM` y `GrenadeSystem`: caída sobre plataforma, one-way, coyote, multiplicadores de daño, transiciones FSM.

### LOTE 5 — Bots y colisiones (🟡) ❓
- [ ] Aleatoriedad con semilla (`?seed=123`) para reproducir bugs.
- [ ] Que los 15 arquetipos de `game/BotData.ts` se sientan distintos (alcance, agresividad, reacción 200–400 ms).
- [ ] Bot que va por armas sin atascarse bajo plataformas.
- [ ] Tunneling en plataformas finas a velocidad alta de caída; esquinas; spawns libres; proyectiles que atraviesan plataformas.
- [ ] **B-14** Forcejeo/soltado por daño en el agarre.

### LOTE 6 — Assets y originalidad (🟡)
- [ ] Mover lo crudo de `public/assets/aistudio/` (~45 archivos, incluye capturas) fuera de `public/`.
- [ ] Borrar duplicados `Agent_2.png` y `Assassin_2.png` sueltos.
- [ ] Comprobar si se usan `spritesheet.jpg` y `walk_sheet.jpg` (el JPG no tiene transparencia).
- [ ] Unificar formato (`Flashbang.svg`, `Smoke.svg` entre PNG) y actualizar "13 armas" en `index.html` y README (hay 60+ PNG).
- [ ] Bots: usar la hoja del Ninja con **cambio de paleta** por arquetipo en vez de imágenes estáticas.
- [ ] Hoja de efectos (sangre, chispa, humo, casquillos).
- [ ] **Antes de publicar:** `GameConstants.ts` declara sus valores como "AS3 original + SFR + BotExtended" y el sitio se describe como "clon de Superfighters Deluxe". Renombrar bots, armas y estados, recalibrar con tu propio playtest, y usar arte propio o con licencia clara.

Comando para listar assets sin referencias (revisar a mano antes de borrar):
```bash
cd public/assets && for f in $(find . -type f); do b=$(basename "$f"); grep -rqF "$b" ../../src || echo "SIN USO: $f"; done
```

---

---

## LOTE 7 — Multi-bot (1 jugador contra N bots, todos contra todos) 🆕

**Lo que pidió el dueño del proyecto**
1. En la pantalla de selección, reemplazar el cuadro "NUMBER OF ROUNDS" por **"NUMBER OF BOTS" (1–5)**. Las rondas se eligen **una sola vez**, en el modal del mundo (la fila "GAME MODE" pasa a llamarse "ROUNDS"); hoy el selector de rondas aparece duplicado.
2. **Un slot por bot** con ◄ ► para elegir su personaje, como en la referencia: tarjeta PLAYER 1 arriba, tarjetas COM debajo y slots `EMPTY` atenuados para los vacíos.
3. Todos los bots **pelean entre sí y contra el jugador** (todos contra todos).

### Por qué no es un cambio de pantalla (verificado en el código)

| Hecho | Consecuencia |
|---|---|
| `ArenaCanvas.tsx` tiene **926 usos de `bot.`** más `botScore`, `botAI`, `botGrenades`, `botQuiet`, `botFaction`: el motor asume **1 jugador vs 1 bot** | Hay que convertir el bot único en una lista de luchadores |
| El combate está escrito en **dos direcciones separadas** (jugador→bot en `:2403-2642`, bot→jugador en `:4020-4756`) | Para que un bot golpee a otro bot hay que generalizar a "atacante→objetivo" (esto es el B-08 `applyHit`) |
| `BotAI.evaluate(bot, ai, target, …)` **ya recibe un `target` por parámetro** (`game/BotFSM.ts`) | Elegir objetivo entre varios es fácil; es la parte barata |
| Marcador por rondas: `p1Score` vs `botScore`; la ronda termina cuando uno muere | Pasa a "último en pie gana la ronda" |
| Los proyectiles **ya traen `shooterId`**; falta verificarlo en granadas y explosiones | Añadir `ownerId` donde falte para no autolesionarse y atribuir bajas |

**Conclusión:** la pantalla es trabajo de horas; el motor es trabajo de días y tocarlo antes de unificar física y daño (B-02, B-08, B-13) es la forma más segura de romper el juego. Orden recomendado:

| Paso | Qué | Riesgo | Depende de |
|---|---|---|---|
| **7.1** | UI y datos: selector de bots, rondas solo en el modal, slots con ◄ ► por bot. El motor usa solo el primer slot; `ENGINE_MAX_BOTS = 1` hasta terminar 7.4 | Bajo | nada |
| **7.2** | Prerrequisitos: B-02 (una sola física), B-08 (`applyHit(atacante, objetivo, …)`), B-13 (un solo estado por luchador) | Medio | Lote 2 |
| **7.3** | Refactor sin cambio de comportamiento: `bot` → `bots[0]`, `botScore` → marcador por luchador, `botAI`/`botGrenades` por bot. Con 1 bot el juego debe sentirse **idéntico** | Alto | 7.2 |
| **7.4** | Todos contra todos: daño entre cualquier par, `ownerId` en granadas/explosiones (las balas ya traen `shooterId`), elección de objetivo, "último en pie", HUD para N bots, subir `ENGINE_MAX_BOTS` a 5 | Alto | 7.3 |
| **7.5** | Spawns y armas para N luchadores; colores por bot (cambio de paleta) y nametags | Medio | 7.4 |

### 7.1 Detalle de la UI (se puede hacer ya)

- Modelo de datos: `BotSlotConfig = { faction: BotFaction | 'random'; team: 'independent'; difficulty: 'easy' | 'normal' | 'hard' }` y `botSlots: BotSlotConfig[]` pasado desde el menú hasta `ArenaCanvas` (hoy solo viaja un `botFaction`).
- Pantalla de selección: PLAYER 1 centrado arriba; debajo una fila de tarjetas COM (una por bot) con ◄ ► para el personaje (por defecto RANDOM) y su dificultad; slots `EMPTY` atenuados hasta el máximo; pista inferior "↑↓←→ NAVEGAR · SPACE ACEPTAR · ESC VOLVER". Contenedor con scroll interno o rejilla de 2 filas para que no desborde.
- Cuadro "NUMBER OF BOTS": 1 a 5 (constante `MAX_BOTS`, la referencia llega a 7); cambia cuántos slots están activos. Navegación con flechas, opción activa resaltada.
- Modal del mundo: fila "GAME MODE" → "ROUNDS" (1/3/5/7/infinito). Quitar el selector de rondas de la pantalla de selección.
- Si `RANDOM`, sortear la facción **al empezar la partida** (no al pulsar), y mostrar el nombre real al comenzar la ronda.

**Prompt P-7.1**
> En `MainMenu.tsx` (pantalla de selección) reemplaza el cuadro "NUMBER OF ROUNDS" por "NUMBER OF BOTS" con opciones 1–5 (constante `MAX_BOTS = 5`), con la opción activa resaltada y navegable con flechas. Debajo de PLAYER 1 muestra una tarjeta COM por cada bot activo, cada una con ◄ ► para elegir facción (por defecto RANDOM) y su dificultad (easy/normal/hard), y slots `EMPTY` atenuados hasta MAX_BOTS. En `MatchSetupModal.tsx` renombra la fila "GAME MODE" a "ROUNDS"; las rondas solo se eligen ahí. Crea el tipo `BotSlotConfig` y pasa `botSlots: BotSlotConfig[]` desde el menú hasta `ArenaCanvas`. `ArenaCanvas` por ahora usa solo `botSlots[0]` (mantén `botFaction` funcionando) y define `ENGINE_MAX_BOTS = 1`: si el usuario elige más bots, muestra un aviso "N bots llegará pronto" y juega con 1. No toques la lógica de combate.

### 7.4 Reglas del todos contra todos (diseño)

- **Objetivo del bot:** el enemigo vivo más cercano, con memoria: si alguien lo golpeó en los últimos ~3 s, lo prioriza; si no, el más cercano; en empate, el de menos vida. Reevaluar cada ~30 ticks para que no cambie de objetivo en cada frame.
- **Ronda:** la gana el último luchador vivo; el marcador pasa a ser por luchador. Victoria de partida = el jugador gana si supera al mejor bot (definir si empatar cuenta).
- **Daño:** `applyHit(atacante, objetivo, …)` entre cualquier par, sin daño a uno mismo; granadas y explosiones dañan a todos en radio; proyectiles con `ownerId`.
- **HUD:** tarjeta grande del jugador y tarjetas compactas (nombre, barra, arma) por bot, con color propio; los eliminados se atenúan.
- **Equipos (opcional, después):** el campo `team` del slot ya queda previsto para "bots contra bots" o equipos.

---

## LOTE 8 — IA que pelee como un oponente de verdad 🆕

**Estado actual** (`game/BotFSM.ts`, 258 líneas, 8 estados): ataca siempre que entra en rango melee, esquiva solo si el arquetipo está en una lista de 5 tipos y con enfriamiento fijo de 40 ticks, huye con poca vida solo si va con puños, y su elección de estado es la misma para el mismo caso. Eso se siente predecible y, a la vez, robótico.

| Mejora | Cómo | Dónde |
|---|---|---|
| **Tiempo de reacción** | `reactionTicks` por dificultad (≈ 28 / 18 / 10 ticks): cuando aparece una amenaza, el bot espera ese tiempo antes de reaccionar | `BotFSM.evaluate` |
| **Puntería imperfecta** | `aimError` en px que decrece con la dificultad; falla de vez en cuando incluso a corta distancia | disparo del bot en `ArenaCanvas` |
| **Distancia ideal según arma** | Armas de fuego: mantiene distancia y retrocede si el rival se acerca; melee: se acerca en ráfagas y se separa tras un combo | estados `Strafe` / `Chase` |
| **Ritmo de ataque** | Tras un combo, pausa corta o retirada en lugar de atacar sin parar | estado `Attack` |
| **Fintas y cambios de patrón** | Temporizadores aleatorios que cambian avanzar / esperar / rodear, para que no repita lo mismo | `strafeTicks`, `Chase` |
| **Esquiva por probabilidad, no por lista** | Todos los tipos pueden esquivar con probabilidad por dificultad (rodar bajo golpes, saltar proyectiles) | quitar la lista `canDodge` |
| **Uso de granadas y armas** | Granada cuando el rival está agrupado o detrás de cobertura; cambia a melee sin munición; recoge armas solo si el rival no está encima | `Pickup`, `Cover` |
| **Verticalidad** | Usar plataformas para ganar altura y esquivar, no solo seguir en el suelo | movimiento del bot |
| **Memoria de objetivo (multi-bot)** | Ver 7.4 | `target` |

**Parámetros por dificultad (punto de partida a calibrar jugando)**

| | Easy | Normal | Hard |
|---|---|---|---|
| Reacción | 28 ticks | 18 | 10 |
| Probabilidad de esquivar | 25% | 50% | 80% |
| Error de puntería | alto | medio | bajo |
| Pausas tras combo | largas | medias | cortas |

**Reglas para que sea "justo":** el bot no lee teclas ni conoce el futuro; solo ve posición, vida y proyectiles dentro de un rango de detección. La IA debe poder derrotarse por patrones, no ser perfecta.

**Prompt P-8.1**
> En `game/BotFSM.ts` añade a `BotFSMData` los campos `reactionTicks`, `aimError`, `dodgeChance` y `comboPauseTicks`, inicializados según la dificultad del slot (easy/normal/hard). Haz que cuando aparezca una amenaza el bot espere `reactionTicks` antes de cambiar de estado. Sustituye la lista `canDodge` por una probabilidad `dodgeChance`. Tras terminar un combo, el bot hace una pausa de `comboPauseTicks` o retrocede en vez de reatacar al instante. Añade un temporizador aleatorio que alterne avanzar, esperar y rodear. No cambies la firma de `BotAI.evaluate` salvo para recibir el objetivo ya elegido. Muéstrame el diff.

**Pruebas:** con la misma arena, tres partidas seguidas contra el mismo bot no deben repetir el patrón; en Hard debe costar ganar pero ser posible; en Easy debe fallar disparos y reaccionar tarde de forma visible.

---

---

## LOTE 9 — Inventario por ranuras y HUD de ranuras 🆕

Pedido: que el protagonista guarde a la vez un arma cuerpo a cuerpo (o puños), una de mano, una principal y los lanzables, y que la barra superior muestre un cuadrito por ranura con el icono del arma y el contador, como la imagen de referencia.

| Paso | Qué | Riesgo | Se detalla en |
|---|---|---|---|
| 9.1 | Modelo de inventario por ranuras: `equippedWeapon` pasa a ser el arma de la ranura activa; recoger guarda en la ranura y suelta la anterior; teclas 1–4 para cambiar | Medio | `PROMPT_superN_armas_y_multibot.md`, fase F1 |
| 9.2 | HUD de ranuras como componente React encima de la arena; modo compacto para varios bots | Medio | Fase F2 |

**Hallazgos del código:** `equippedWeapon` tiene 114 usos (52 del jugador); recoger un arma hoy reemplaza la anterior y reinicia la munición al cargador (`ArenaCanvas.tsx:5990-6030`); las granadas ya tienen inventario propio; las armas ya traen `category` e `iconUrl` (53 iconos, incluido `Fist.png`).

**Decisiones abiertas:** el inventario multi-ranura es del jugador (y del J2 en 1v1); los bots siguen con una sola arma. La barra de energía blanca se oculta mientras la estamina del jugador no se gaste.

**Orden recomendado ahora:** A (arranque con puños) → B (prerrequisitos) → F1 (inventario) → C → D → E + F2 (multi-bot y HUD).

---

---

## LOTE 10 — Cadáveres, apilamiento y bots que se quedan parados 🆕

**Observado jugando (capturas):** 1) los bots se ven distintos y se distinguen ✅; 2) solo pelean entre sí tras recibir daño del jugador; 3) recogen armas y se quedan quietos; 4) varios bots terminan **amontonados en el mismo punto con la vida llena**, y sus nametags se pisan ("JEFEABERSEBKER"); 5) al morir, los cuerpos **se quedan flotando** donde murieron.

### 10.1 Cadáveres que no caen — causa confirmada ✅
`PhysicsStep.tick` empieza con `if (!p.isAlive) return;` (`game/PhysicsStep.ts:24`). En `ArenaCanvas.tsx` se llama a `tick` también para los muertos (`:6284`, `:6339`), pero la función no hace nada: sin gravedad, sin colisión, sin fricción. Quien muere en el aire (por una explosión, un golpe hacia arriba o un salto) queda colgado.

**Arreglo:** que los muertos sigan siendo simulados (gravedad, colisión con plataformas, fricción y límites), sin lógica de combate.

### 10.2 Bots amontonados y quietos — causa probable (hipótesis, confirmar con el overlay de 10.5)
- Cuando dos bots están a menos de ~60 px la IA pasa a `Attack`; si están casi encima (`targetDist ≤ 24`) deja de moverse (`moveX = 0`), así que **no actualiza hacia dónde mira**. El golpe (`CombatSystem.resolveMelee`) usa una caja **delante** del atacante, empezando a 10 px de su centro: si el rival está detrás o exactamente encima, **falla siempre**. Resultado: golpean al aire, sin daño, sin moverse.
- Con arma de fuego, el estado `Strafe` mueve al bot de lado a lado y **mira hacia donde camina, no hacia el objetivo**, así que dispara de lado o al vacío y parece que "esperara una señal".
- Posible agravante: el retraso de reacción (`pendingTimer`) se reinicia cada vez que el estado deseado cambia; si parpadea entre `Chase` y `Pickup`, el bot se queda en su estado anterior (`Idle`).

### 10.3 Pelear desde el inicio
`pickTarget` ya elige al enemigo más cercano (incluidos otros bots) y solo prioriza al atacante reciente. Para que la pelea sea real desde el primer segundo hay que arreglar 10.2 (si no, el contacto entre bots no produce daño).

### 10.4 Nametags que se pisan
Cuando dos luchadores están a menos de ~40 px en x, desplazar verticalmente la etiqueta del segundo (y los siguientes) unos 10 px cada una, o atenuarla.

### 10.5 Overlay de depuración (para confirmar la causa)
Con `?debug=1`, mostrar sobre cada bot en texto pequeño: estado de IA actual y pendiente, id del objetivo, distancia, `facingRight` y si `melee`/`fire` es verdadero. En 30 segundos se ve si están en `Attack` pegando al aire, en `Strafe` mirando mal o en `Idle`.

### Prompt P-10 (pegar por partes; la parte 1 es independiente y segura)

**Parte 1, cadáveres**
> En `game/PhysicsStep.ts`, cambia `tick` para que los luchadores muertos sigan siendo simulados: quita el `return` temprano por `!p.isAlive`, de modo que `applyGravity`, `applyMovement`, `resolveCollisions` y `clampToBounds` se ejecuten también para ellos. Evita que se re-ejecute la lógica de muerte por caída al vacío (`:148`) si ya están muertos, y que `PlayerFSM.tick` pueda revivirlos. Con fricción de suelo el cuerpo debe frenarse y quedar tumbado en el suelo o en la plataforma. No cambies el combate. Muéstrame el diff.

**Parte 2, overlay de depuración**
> Con `?debug=1`, dibuja sobre cada bot (en el canvas) un texto pequeño con: `ai.currentState`, `ai.pendingState`, `inst.currentTargetId`, distancia al objetivo, `facingRight`, y si `botInput.melee` o `botInput.fire` son verdaderos en ese tick. Sin `?debug=1` no se dibuja nada.

**Parte 3, orientación y apilamiento**
> En el bucle de IA de bots de `ArenaCanvas.tsx`, antes de ejecutar melee o disparo en los estados `Attack` y `Strafe`, fija `bot.facingRight = target.x >= bot.x` (si `|dx| < 2`, conserva la orientación actual). Si el bot está en `Attack` y `|dx| < 14`, haz que dé un paso corto hacia atrás (`moveX` en dirección contraria al objetivo durante ~8 ticks) para recuperar separación y que el golpe conecte. En `Strafe`, el disparo siempre debe salir hacia el objetivo, no hacia donde se desplaza. No cambies los valores de daño.

**Parte 4, no quedarse atascados**
> En `BotFSM.evaluate`, no reinicies `pendingTimer` si el estado deseado vuelve al estado actual; solo reinicia cuando el estado deseado cambie a uno distinto del pendiente. Añade una detección de bloqueo: si el bot lleva más de 90 ticks en `Idle` o `Chase` con objetivo vivo y se ha desplazado menos de 10 px, fuerza `currentState = Chase`, limpia `pendingState` y `pendingTimer`, y haz un salto si el objetivo está por encima.

**Parte 5, nametags**
> En el render de nametags, si dos luchadores vivos están a menos de 40 px en x, desplaza verticalmente la etiqueta de cada uno posterior en 10 px por cada solapamiento, para que no se superpongan.

**Pruebas**
| Prueba | Aprueba si |
|---|---|
| Morir en el aire (explosión, golpe hacia arriba, salto) | El cuerpo cae y se queda tumbado en el suelo o la plataforma |
| 3 bots solos 60 s sin tocarlos | Se pegan entre sí desde el inicio y baja la vida de alguno |
| Bot con pistola a distancia | Mira al objetivo y dispara hacia él mientras se mueve de lado |
| Dos bots encima uno del otro | Se separan un paso y el golpe conecta, o uno recibe daño |
| `?debug=1` | Los textos muestran estado, objetivo y distancia sin errores |
| Nametags | No se superponen cuando los luchadores están juntos |

---

## LOTE 11 — Integración de Nuevos Mapas Auténticos y Personajes Jugables (Gymrat y Santa Claus) 🆕

**Contexto:** Se han suministrado los 26 assets originales (6 mapas oficiales y 20 hojas de sprites de animación) que completan la visión de Superfighters / superN, permitiendo pasar de 1 único personaje con animaciones completas (Ninja) a **3 personajes totalmente jugables con animación frame a frame**, e incorporar **6 arenas de combate** con sus mecánicas, fondos y colisiones.

### 11.1 Catálogo de los 6 Mapas / Escenarios Nuevos

| # | Archivo | Dimensiones | Nombre del Escenario | Atmósfera y Elementos Visuales | Mecánica / Colisiones de Plataformas |
|---|---|---|---|---|---|
| **M1** | `image_26e47cf6.png` | 720×360 | **Puerto Maldito** | Barco pirata amarrado en muelle nocturno, grúa de carga, cajas, luna menguante y caja de suministros en paracaídas. | Cubierta del barco (2 niveles), camarote interior accesible, muelle de madera, grúa elevada y plataformas con pasarelas. |
| **M2** | `image_57664f22.png` | 1359×700 | **Fundición Siderúrgica** | Calentadores industriales rojos incandescentes, conductos de ventilación, franjas de advertencia y rodillos. | Suelo con cinta transportadora activa, plataformas de rejas metálicas superiores (Nivel 2) y barriles inflamables. |
| **M3** | `image_43c2b272.png` | 1365×707 | **Metro Neón / Cyberpunk** | Cuadrícula cian fluorescente, cadenas metálicas suspendidas, plataformas flotantes y escaleras de mano. | Plataforma central elevada, cadenas con cajas de balanceo, escaleras transitables y vacío inferior con caídas letales. |
| **M4** | `image_6f961c12.png` | 1364×702 | **Laboratorio Tóxico** | Pantallas de fósforo verde radiactivo, bloques misterio `?`, torres de rejilla y foso de pinchos. | Foso inferior con pinchos (daño por caída), bloques `?` con armas aleatorias, y plataformas flotantes simétricas. |
| **M5** | `image_3d8d2fc4.png` | 1365×706 | **Foso Clandestino "БОЙ!"** | Arena clandestina de supervivencia con grafiti cirílico "БОЙ!" en amarillo, torres de rejilla y cajas. | Plataforma central de combate, pilares de salto para combate vertical, y lecho de pinchos en los laterales. |
| **M6** | `image_e12875f3.png` | 1359×699 | **Azotea Hotel Noir** | Letrero gigante de neón "HOTEL", luna llena dorada, skyline con ventanas encendidas y caja aérea. | Pasarela sobre el letrero de neón, plataformas de andamio colgantes en los extremos y caída libre hacia la ciudad. |

### 11.2 Catálogo de Spritesheets de Animación para GYMRAT (9 Hojas)

| Acción | Archivo | Dimensiones | Frames | Descripción y Animación |
|---|---|---|---|---|
| **Caminar (Walk)** | `image_effc215b.png` | 942×1024 | 6 frames (3x2) | Ciclo de paso firme con zancada pesada de culturista. |
| **Correr (Run)** | `image_d9b6c0f7.png` | 942×1024 | 6 frames (3x2) | Esprint con brazos en guardia y torso inclinado hacia adelante. |
| **Salto y Caída (Jump / Fall)** | `image_eaab78e9.png` | 942×1024 | 6 frames (3x2) | Agache de impulso, despegue vertical, ápice de salto, caída con brazos abiertos y aterrizaje. |
| **Rodar / Esquivar (Roll / Dodge)** | `image_e759561c.png` | 942×1024 | 6 frames (3x2) | Agache rápido, bola compacta de rodamiento en el suelo, giro completo y recuperación en guardia. |
| **Combo Melee Completo** | `image_2e9f4148.png` | 942×1024 | 6 frames (3x2) | Jab frontal izquierdo, gancho derecho directo, patada alta frontal y rodillazo contundente. |
| **Puñetazo Directo (One-Hand)** | `image_2a1be181.png` | 1024×572 | 5 frames horiz. | Preparación de guardia, estirada de puño directo, impacto y retorno rápido a guardia. |
| **Uppercut Ascendente** | `image_b8733588.png` | 1024×572 | 5 frames horiz. | Agache con puño bajo, elevación explosiva de puñetazo al mentón y reajuste. |
| **Smash a Dos Manos (Overhead)** | `image_83b492a7.png` | 1024×572 | 6 frames horiz. | Elevación de ambos puños cerrados sobre la cabeza, salto y martillazo hacia el suelo con impacto sísmico. |
| **Disparo de Armas (Fire)** | `image_398d54e5.png` / `image_bd904280.png` | 1024×572 | 4 frames horiz. | Secuencia con retroceso de disparo para pistolas de una mano y rifles/escopetas a dos manos con destello de boca (muzzle flash). |

### 11.3 Catálogo de Spritesheets de Animación para SANTA CLAUS (11 Hojas)

| Acción | Archivo | Dimensiones | Frames | Descripción y Animación |
|---|---|---|---|---|
| **Caminar (Walk)** | `image_5715b30b.png` | 1024×572 | 6 frames horiz. | Marcha pesada con saco a la espalda, abrigo rojo ondeando y barba al viento. |
| **Correr (Run)** | `image_a14e1ec4.png` | 1024×506 | 6 frames horiz. | Carrera acelerada con paso largo y saco sujeto firmemente. |
| **Salto y Caída (Jump / Fall)** | `image_d0f432a9.png` | 942×1024 | 6 frames arco | Salto con impulso de piernas, vuelo con saco flotando y caída firme con botas de nieve. |
| **Rodar / Esquivar (Roll / Dodge)** | `image_f93f6e95.png` | 1024×572 | 6 frames horiz. | Voltereta esférica rodando sobre el saco de regalos y levantamiento en guardia. |
| **Combo Melee Puño + Patada** | `image_9dd6ac40.png` | 1024×572 | 5 frames horiz. | Puñetazo con guantelete negro seguido de patada de talón demoledora. |
| **Gancho Contundente (Hook)** | `image_586ddefc.png` | 1024×572 | 5 frames horiz. | Golpe curvo amplio con estela blanca de impacto y giro de hombro. |
| **Smash con Saco a Dos Manos** | `image_3dfbebce.png` | 1024×572 | 5 frames horiz. | Carga del saco de regalos a dos manos en alto y golpeo demoledor contra el suelo (generando nube de polvo). |
| **Disparo Pistola (1 Mano)** | `image_c5cac62a.png` | 1024×572 | 8 frames (4x2) | Apuntado con revólver/pistola, fogonazo naranja brillante, retroceso y rearme. |
| **Disparo Escopeta/Rifle (2 Manos)** | `image_1a71215a.png` | 1024×572 | 8 frames (4x2) | Sujeción de arma larga a dos manos, llamarada expansiva y retroceso con empuje de hombro. |
| **Lanzamiento / Granada (Throw)** | `image_2089daed.png` | 1024×572 | 7 frames horiz. | Preparación de lanzamiento hacia atrás, impulso de brazo y suelta parabólica de granada o regalo explosivo. |

---

### 11.4 Pasos de Implementación Técnica

1. **Sub-Lote 11.A — Mundos y Selector de Escenarios (`WorldData.ts` y `MatchSetupModal.tsx`)**:
   - Integrar los 6 mundos en `WORLDS` de `WorldData.ts` con sus geometrías de plataformas, temas visuales y fondos oficiales (`image_26e47cf6.png`, `image_57664f22.png`, `image_43c2b272.png`, `image_6f961c12.png`, `image_3d8d2fc4.png`, `image_e12875f3.png`).
   - Añadir los mapas a `MAP_OPTIONS` en `MatchSetupModal.tsx` con sus nombres oficiales (`PUERTO MALDITO`, `FUNDICIÓN ROJA`, `METRO NEÓN`, `ZONA TÓXICA`, `FOSO "БОЙ!"`, `AZOTEA HOTEL`) y soporte en la previsualización.
   - En `ArenaCanvas.tsx`: Pintar el fondo oficial centrado y ajustado al canvas (960×540) según el mundo seleccionado.

2. **Sub-Lote 11.B — Activación de Personajes (`MainMenu.tsx` y `LandingScreen.tsx`)**:
   - Cambiar `isPlayable: true` y tag `JUGABLE` para GYMRAT y SANTA CLAUS en `PROTAGONISTS` de `MainMenu.tsx` y `LandingScreen.tsx`.
   - Permitir elegir a Gymrat o Santa Claus como P1 o P2 en modo 1 Jugador y 2 Jugadores sin restricciones.

3. **Sub-Lote 11.C — Motor de Animación para Múltiples Personajes (`ArenaCanvas.tsx`)**:
   - Crear el mapa de hojas de sprites por facción (`CHARACTER_SPRITE_SHEETS[faction]`):
     * Cargar las hojas de `idle`, `walk`, `run`, `jump`, `roll`, `melee`, `smash`, `shoot_1h`, `shoot_2h` y `throw` para Ninja, Gymrat y Santa Claus.
   - Implementar el cortador de frames (frame slicing):
     * Para hojas de 6 frames en 3×2 (`942×1024`): ancho frame = 314 px, alto frame = 512 px.
     * Para tiras horizontales (`1024×572`): ancho frame = `1024 / numFrames`, alto frame = 572 px.
     * Para tiras dobles 4×2 (`1024×572`): ancho frame = 256 px, alto frame = 286 px.
   - Conectar el estado del FSM (`currentState`: idle, walk, run, jump, fall, roll, melee, shoot, throw) al spritesheet correspondiente del personaje seleccionado.

4. **Sub-Lote 11.D — Verificación y Playtest**:
   - Compilación limpia con `npm run lint` y `npm run build`.
   - Comprobar que caminar, correr, saltar, rodar y golpear con Gymrat y Santa Claus se visualizan con sus animaciones exclusivas y fluidas a 60 fps.
   - Comprobar que los 6 escenarios cargan sus fondos, colisiones y plataformas correctamente.

---

## 5. Pruebas obligatorias por lote

| Prueba | Cómo | Aprueba si |
|---|---|---|
| Velocidad a distintos Hz | DevTools → Rendering → FPS; monitor de 144 Hz | Misma distancia en 3 s (±2%) |
| Teclas pegadas | Mantener D, cambiar de pestaña y volver | Ninja quieto |
| Controles | Cada tecla en 1P y en 1v1 | Responde y coincide con la UI |
| Ghosting | Dos jugadores corriendo + atacando | Se registran todas las teclas |
| Granada en 1v1 | Lanzarla con J1 | No reinicia la ronda |
| Hit-stop / stun | Golpear al bot y al jugador | Pausa visible; stun distinto por golpe |
| Transición de físicas | Golpear en el aire, derribar, levantarse | Sin saltos de posición ni de velocidad |
| Marcador | 1, 3, 5, 7 rondas e infinito | Casillas = victorias necesarias; infinito muestra número |
| Selección de Personajes | Elegir Ninja, Gymrat o Santa Claus | Los 3 son seleccionables e inician el combate con sus sprites |
| Animación de Combate | Probar caminar, correr, saltar, rodar y golpear con cada personaje | Muestra sus spritesheets dedicados sin deformación |
| 6 Escenarios | Seleccionar cada mapa en el modal de configuración | Carga el fondo oficial, plataformas y colisiones correctas |
| Móvil | Abrir en teléfono | Arena legible, sin teclas pegadas |
| Build | `npm run lint && npm run build` | Sin errores nuevos |

---

## 6. Plantilla de registro (copiar por cada cambio)

```markdown
## [ID] Nombre del módulo
- **Fecha:** AAAA-MM-DD
- **Lote / Prioridad:** (0-11) / (Alta | Media | Baja)
- **Estado:** ☐ Pendiente  ☐ En curso  ☐ Probado  ☐ Cerrado

### Problema
### Estado deseado
### Solución aplicada (archivos y valores)
### Prompt exacto usado
### Pruebas
- [ ] 60 Hz  - [ ] 144 Hz  - [ ] Móvil  - [ ] Sin regresiones en: ______
### Notas
```

---

## 7. Orden sugerido para empezar

1. ✅ Lotes 0, 1 y 1.5 → 2. **Lote 11 (Nuevos Mapas y Activación de Gymrat y Santa Claus)** → 3. Lote 2 (B-02, B-08, B-09) → 4. **7.1 UI de bots** → 5. Lote 3 (UI) → 6. 7.3 y 7.4 (multi-bot) → 7. Lote 8 (IA) → 8. Lotes 4–6.

Cada paso es un commit pequeño; si algo se rompe, se vuelve atrás solo ese paso.
