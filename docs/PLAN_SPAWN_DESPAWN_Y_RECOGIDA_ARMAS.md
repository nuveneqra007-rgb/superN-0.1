# Plan: Sistema Limpio de Aparición, Desaparición y Recogida de Armas

## Problemas Reales Identificados

1. **Reaparición inmediata y armas encimadas en el mismo punto (`WeaponSpawnSlot`)**:
   - Cuando un jugador o bot recoge el arma de un spawn, `slot.currentWeaponId` pasa a `null`, pero **`slot.timer` no se reinicia**. Si el temporizador estaba a pocos ticks de `spawnInterval`, reaparece otra arma casi al instante en el mismo lugar.
   - Al inicializar la ronda (`timer = idx * 180`), los últimos slots arrancan muy cerca del límite del ciclo y reemplazan el arma al poco de empezar.
   - `destroyWeaponAtSpawnSlot` no limpia armas residuales dentro del radio del punto de spawn si `currentWeaponId` perdió sincronía (p. ej. al desplazarse en cintas).

2. **Armas sueltas o de cajas que nunca desaparecen**:
   - Las armas arrojadas al cambiar de equipamiento o generadas por cajas (`crates`) y suministros (`coop`) no tienen tiempo de vida (`maxLifeTicks`), acumulándose indefinidamente en el suelo.

3. **Bug de recogida múltiple / bucle al haber armas acumuladas**:
   - `isP1SlotEmpty` y `isP2SlotEmpty` evalúan `handgun === null` y `primary === null` por separado, aunque ambos comparten la **única ranura de arma de fuego `[M]`**. Si tienes un rifle (`primary`), `handgun === null` da `true` y provoca intercambios automáticos no deseados y bucles infinitos cada frame al soltar una pistola y volver a recoger el rifle en el mismo sitio.
   - El bucle `for` de `s.worldWeapons` permite que un mismo combatiente recoja/intercambie **múltiples armas en el mismo tick** cuando están apiladas en un mismo punto.
   - Al pisar el arma recién soltada a los pies (`pickupCooldownTicks = 0`), la vuelve a recoger inmediatamente; o al pisar la misma arma que ya lleva equipada, genera confusión de reemplazo/balas en lugar de recargar limpiamente si le faltan balas o ignorarla si está llena.

4. **Deficiencia en El Gimnasio (`trainingWorld`)**:
   - Solo tiene 1 punto de spawn (`480, 320`), sin rotación dinámica en las plataformas laterales ni ciclo vivo de aparición/desaparición.

---

## Solución Detallada (Móvil, Escritorio y Gimnasio)

### Fase 1: Ciclo de Vida Vivo en Puntos de Spawn y Gimnasio (`WorldData.ts` & `ArenaCanvas.tsx`)
1. **En `WorldData.ts` (`trainingWorld`)**:
   - Configurar 3 puntos de spawn en lugares clave del gimnasio (`{ x: 480, y: 320 }`, `{ x: 180, y: 390 }`, `{ x: 780, y: 390 }`) para probar movimiento y recogida con ritmo dinámico.
2. **En `ArenaCanvas.tsx` (`WorldWeaponEntity` y `WeaponSpawnSlot`)**:
   - Añadir a `WorldWeaponEntity`: `ageTicks: number`, `maxLifeTicks?: number`, `pickupCooldownTicks?: number`, `ammo?: number`.
   - En `initializeWeaponSpawnSlots`: iniciar `timer: 0` con `spawnInterval` escalonado (`720`–`900` ticks = 12–15 s; `600`–`720` ticks en gimnasio) para que ningún arma inicial desaparezca justo al iniciar la ronda.
   - Al recoger un arma perteneciente a un `spawnSlotIndex`: limpiar `slot.currentWeaponId = null` **y reiniciar `slot.timer = 0`** (o a un retardo controlado para que tarde un tiempo natural en reaparecer la siguiente).
   - En `destroyWeaponAtSpawnSlot` / `instantiateWeaponAtSpawnSlot`: eliminar **cualquier** arma de spawn previa vinculada al `slotIndex` o ubicada dentro de `< 34 px` del spawn point antes de crear la nueva. Nunca habrá 2 armas encimadas.
   - Las armas caídas al suelo (por intercambio o destrucción de cajas) reciben `maxLifeTicks = 900` (15 s) y `pickupCooldownTicks = 40` (~0.66 s al soltarse) para desaparecer limpiamente si nadie las toma.

### Fase 2: Feedback Visual de Aparición y Desaparición (`renderGame`)
- **Aparición**: aura de entrada breve durante los primeros `18` ticks + chispas cian.
- **Aviso previo a desaparecer**: durante los últimos `150` ticks (~2.5 s) de `maxLifeTicks` o del ciclo `spawnInterval - slot.timer` en un punto de spawn, el sprite del arma parpadea (`alpha` alternado) antes de desmaterializarse con partículas.

### Fase 3: Recogida Determinista Anti-Bug para P1, Bots y Móvil (`updateGame`)
1. **Validación real de ranura ocupada (`handgun || primary`)**:
   - La ranura de arma de fuego `[M]` se considera vacía **únicamente** cuando `handgun === null && primary === null`.
2. **Máximo 1 recogida por combatiente por tick + Cooldown de recogida (`22` ticks)**:
   - Evaluar todas las armas en rango (`< 32 px`) con `pickupCooldownTicks <= 0`, seleccionar **solo la más cercana** y procesarla una única vez por jugador/bot en ese tick (evitando recoger en cascada pilas enteras al mantener agachado en escritorio o con el joystick PSP hacia abajo en móvil).
3. **Manejo inteligente del arma repetida / munición**:
   - Si el jugador ya tiene equipada esa **misma arma de fuego** (`currentFirearm.type === w.weaponType`):
     - Si le falta munición (`currentAmmo < wData.magSize`), la recoge solo para **recargar munición hasta `magSize`** (consumiendo el arma del suelo sin soltar otra igual en bucle).
     - Si ya tiene munición llena (`>= magSize`), o es la misma arma melee ya equipada en su ranura, **no la recoge automáticamente** (evita reemplazos infinitos).
   - Al soltar el arma anterior en los pies, conserva su munición restante (`ammo`) y nace con `pickupCooldownTicks = 42` y ligero desplazamiento lateral para no re-equiparse sola en el mismo instante.

---

## Verificación
- `npm run lint` (`tsc --noEmit`) y `npm run build` (`tsc && vite build`) deben pasar sin errores.
