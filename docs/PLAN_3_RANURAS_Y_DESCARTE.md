# Plan de Implementación: Equipamiento de 3 Ranuras Simultáneas y Descarte por Munición Agotada

## 1. Objetivo
Permitir que el jugador lleve hasta **3 objetos equipados a la vez** y pueda usar cualquiera de los tres al instante mediante su tecla dedicada, sin necesidad de cambiar manualmente de ranura:
1. **`[N]` / `[F]` — Ranura Melee:** Espadas, katanas, machetes, cuchillos, bates (o puños `Fists` por defecto).
2. **`[M]` / `[G]` — Ranura Arma de Fuego:** Pistolas, revólveres, escopetas, rifles, bazooka, M79, lanzallamas, láser, arco.
3. **`[,]` / `[H]` / `[L]` — Ranura Granadas:** Granadas, molotovs, C4, minas.

Además, **toda arma de fuego se suelta/descarta automáticamente al quedarse sin munición (`ammo <= 0`)** en combate real.

---

## 2. Arquitectura de Cambios

### Pilar 1: Unificación de 3 Ranuras en `PlayerInventory` y `FighterBar.tsx`
- En `PlayerState.ts` (`PlayerInventory`):
  - Consolidar el inventario visible del jugador en **3 ranuras**:
    1. `melee` (siempre `WeaponType.Fists` o el arma melee recogida).
    2. `firearm` (o unificación de `handgun`/`primary` en un único espacio de arma de fuego activa).
    3. `throwable` (inventario de granadas/arrojadizas).
- En `FighterBar.tsx`:
  - Mostrar exactamente **3 cajas de equipamiento** con su indicador de tecla (`N`, `M`, `,`), su icono y su contador de balas/granadas, iluminando la ranura que el jugador está utilizando en ese momento.

### Pilar 2: Auto-equipamiento por Tecla de Acción (`ArenaCanvas.tsx`)
- **Al presionar `N` / `F` (Combate Melee):**
  - Selecciona automáticamente la ranura `melee` (`inventory.melee` o `Fists`), desenfunda la espada/machete/puños y ejecuta el golpe/combo aunque el último objeto usado haya sido un arma de fuego.
- **Al pulsar o mantener `M` / `G` (Arma de Fuego):**
  - Selecciona automáticamente el arma de fuego equipada (`inventory.firearm` / `primary` / `handgun`). Si la ranura está vacía, reproduce `playDryFire()` sin disparar.
  - Si tiene arma con munición, apunta al mantener `M`/`G` y dispara al pulsar/soltar según las métricas ya implementadas.
- **Al presionar `,` / `H` / `L` (Granadas):**
  - Lanza la granada disponible en el inventario de granadas sin perder ni sustituir el arma melee ni el arma de fuego equipadas.
- **Al recoger armas del suelo / Estante de Práctica:**
  - Si recoge un arma melee → reemplaza/suelta el melee anterior en la ranura `melee`.
  - Si recoge cualquier arma de fuego → reemplaza/suelta el arma de fuego anterior en la ranura `firearm`.
  - Si recoge granadas → se acumulan en la ranura `throwable`.

### Pilar 3: Descarte Automático al Agotarse la Munición
- Cuando un jugador (P1 o P2) dispara su última bala y **`ammo <= 0`** (en modos de combate `vsBot`, `local1v1`, `coop`; en Modo Práctica se mantiene munición infinita para entrenar):
  1. Se espera a que termine el frame/ráfaga actual del último disparo (`!isPistolShooting && !isRifleShooting && burstRemaining <= 0`).
  2. Se **suelta automáticamente el arma vacía** (se limpia la ranura de arma de fuego a `null`, se cancela `isAiming`, se pasa a `equipState = 'holstered'`, y `equippedWeapon` vuelve a `inventory.melee` / `Fists`).
  3. Se muestra un texto flotante breve `¡SIN MUNICIÓN!` y un efecto visual/sonoro discreto de arma descartada.

---

## 3. Fases de Implementación
1. **Fase 1 — HUD y Modelo de 3 Ranuras:**
   Actualizar `FighterBar.tsx` y `ArenaCanvas.tsx` (`buildFighterBarData` + recogida de armas) para operar con 3 ranuras específicas (`Melee [N]`, `Fuego [M]`, `Granada [,]`).
2. **Fase 2 — Uso Simultáneo por Tecla (`N` / `M` / `,`):**
   Hacer que pulsar `N` active automáticamente `melee`, pulsar/mantener `M`/`G` active automáticamente el arma de fuego equipada, y `,` lance granadas sin bloquear las otras ranuras.
3. **Fase 3 — Descarte Automático al Llegar a 0 Balas:**
   Implementar el descarte automático al agotarse la munición en P1, P2 y Bots (conservando munición infinita en Modo Práctica).
4. **Fase 4 — Validación:**
   Probar llevando Katana + Pistola/Rifle + Granadas a la vez, alternando entre `N`, `M` y `,`, verificando que al llegar a 0 balas se suelte automáticamente + `npm run lint` y `npm run build`.
