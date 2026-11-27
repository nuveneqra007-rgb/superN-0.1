# Plan de Corrección: Paridad de Apunte/Disparo en Gymrat, Santa y Controles 1v1 / Horda

## 1. Diagnóstico de Fallos Reales Detectados

### Fallo A: P1 no puede graduar la mira con `W/S/A/D` en `1v1` y `Horda (coop)`
- **Causa en código (`ArenaCanvas.tsx`):** El bloque de ajuste de `aimAngle` y `aimFacingRight` leía exclusivamente `ArrowLeft / ArrowRight / ArrowUp / ArrowDown` de forma fija.
- **Impacto:** En modos `local1v1` y `coop`, P1 controla con `WASD` + `G` (mientras las flechas pertenecen a P2), haciendo imposible graduar la mira para P1 con `W`, `S`, `A`, `D`. Además, P2 tampoco tenía implementado el sistema de apunte con `M` + flechas.

### Fallo B: `Gymrat` y `Santa` no respetan `aimAngle`, `aimFacingRight` ni las métricas nuevas de disparo
1. **Código legado en `pistol_shoot` Frame 2 (`ArenaCanvas.tsx` líneas 4262 y 4315):**
   - `Gymrat` y `Santa` usaban un bloque antiguo con `s.projectiles.push(...)` directo en lugar de `emitWeaponFire()`, ignorando `aimAngle`, `aimFacingRight`, el abanico de escopeta, el M79, el misil de Bazooka y los sonidos diferenciados.
2. **Pérdida de la mira durante el retardo de Frame 2:**
   - Como `Gymrat` y `Santa` disparan en el Frame 2 (`4–8 ticks` después de iniciar el disparo), al soltar `M`/`G` el estado `p1.isAiming` pasaba a `false` y borraba `p1.aimAngle = 0` antes de que la bala naciera.
3. **Giro al lado opuesto durante el disparo:**
   - Al terminar `isAiming`, el bloque `if (!p1.isAiming) { if (moveDir !== 0) p1.facingRight = moveDir > 0; }` giraba al personaje hacia la dirección opuesta si el jugador tocaba una tecla lateral durante la animación.
   - Sumado al empuje brusco `kickDir * 120` en Frame 3, provocaba que dispararan hacia un lado mientras el sprite miraba hacia el otro.
4. **Inconsistencia visual de `hasBuiltInGun`:**
   - Mientras `Gymrat` y `Santa` usan el sistema unificado de apunte (`isAiming` + retícula + arma en mano con su propio `CharacterHandProfile`), al pasar a `pistol_shoot` / `rifle_shoot` el flag `hasBuiltInGun` ocultaba el arma rotada, rompiendo la coherencia visual cuando disparan hacia arriba o abajo.

---

## 2. Plan de Solución (3 Fases)

### Fase 1 — Unificación de Controles de Apunte (`WASD` en 1v1/Horda + Paridad P2)
- Leer las direcciones de apunte desde `p1Controls` (`up`, `down`, `left`, `right`) cuando está manteniendo la tecla de apunte (`G` en 1v1/Horda, `M` en Solo), permitiendo que `W/S/A/D` gradúen `aimAngle` y `aimFacingRight` en 1v1/Horda y tanto `WASD` como `Flechas` en Solo.
- Añadir el mismo sistema de apunte (`M` mantenida + flechas) y ráfagas/semi para **Jugador 2** en `local1v1` / `coop`.

### Fase 2 — Paridad Total de `Gymrat` y `Santa` con el `Ninja`
- **Misma métrica instantánea y precisa de disparo:**
  - Unificar `pistol_shoot` Frame 2 de `Gymrat` y `Santa` con `emitWeaponFire(...)` (eliminando el `s.projectiles.push` legado).
  - Preservar `aimAngle` y `aimFacingRight` mientras `isPistolShooting`, `isRifleShooting` o `burstRemaining > 0` sigan activos (solo limpiar `aimAngle` cuando termine por completo la animación de disparo y no mantenga `M`/`G`).
  - Prohibir que `moveDir` gire `p1.facingRight` mientras esté disparando (`isPistolShooting || isRifleShooting || isAiming`).
  - Orientar el sprite siempre con `aimFacingRight` durante todo el ciclo de apunte y disparo, y evitar que `kickDir` invierta la orientación del personaje.

### Fase 3 — Verificación Integral
- Probar **Ninja**, **Gymrat** y **Santa** en Solo, 1v1 y Horda (apuntando arriba/abajo/izquierda/derecha con `WASD` en 1v1 y `M`/flechas en Solo) + `npm run lint` y `npm run build`.
