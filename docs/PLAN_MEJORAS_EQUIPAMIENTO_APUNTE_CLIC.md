# Plan de Mejoras: Equipamiento Corporal, Apuntado con `M` y Disparo por Clic

## 1. Objetivo General
Implementar un sistema táctico coherente y predecible donde:
1. Todas las armas equipadas (machete, pistolas, revólveres, escopetas, rifles, granadas) permanezcan **guardadas en su sitio corporal** (espalda, cintura o cinturón) mientras no se usan, sin flotar en el aire ni en las manos.
2. **`M` (mantenida)** sea exclusivamente para **desenfundar y apuntar**, ajustando la mira con las flechas de forma independiente al movimiento.
3. **Clic izquierdo** sea exclusivamente para **disparar**, respetando reglas estrictas por tipo de arma (1 tiro en semiautomáticas/escopetas, **ráfaga de 3–4 balas por clic** en automáticas) y **conservando intacta la dirección de mira después de disparar**.
4. **Tecla de combate (`N` / `F`)** saque el arma cuerpo a cuerpo (machete, katana, bate, etc.), ejecute el golpe y la devuelva a su sitio al terminar.

---

## 2. Arquitectura de Estados de Equipamiento (`WeaponEquipState`)

Añadir en `PlayerState.ts` una máquina de estados explícita para el porte del arma:
- `holstered`: Arma guardada en espalda/cintura/cinturón; manos libres.
- `drawing`: Transición rápida (`3–4 ticks`) al presionar `M` o tecla de combate.
- `using`: Ejecutando ataque melee con machete/arma blanca/contundente o lanzamiento de granada.
- `aiming`: Manteniendo `M` con arma de fuego desenfundada y mira activa.
- `firing`: Retroceso temporal del disparo (`~8–12 ticks`) tras hacer clic; **al terminar vuelve a `aiming` sin reiniciar `aimAngle` ni `aimFacingRight`**.
- `holstering`: Transición rápida (`3–4 ticks`) al soltar `M` o finalizar el golpe melee, devolviendo el arma a su sitio equipado.

---

## 3. Equipamiento Invisible en Reposo (Solo HUD de Ranuras)

En `WeaponRenderer.ts`, cuando el arma esté en `holstered` o `holstering` (durante `Idle`, `Walk`, `Run`, `Jump`, `Crouch`, `Roll` sin usar):
- **No se dibuja ningún arma sobre el cuerpo** (ni en la mano, ni en la espalda, ni en la cintura). El personaje mantiene su silueta 100% limpia y el equipamiento activo se muestra exclusivamente en el HUD de ranuras (`1–4`).
- **Al atacar (`N`/`F`), apuntar (`M`/`G` mantenida) o disparar (`M`/`G` pulsada):** el arma aparece inmediatamente en la mano con su puño envolvente (`drawGripHand`).
- **Al soltar o terminar de disparar/golpear:** el arma desaparece automáticamente de la vista y regresa a estado equipado en el HUD.

---

## 4. Controles Exactos (`M` / `G` Dual: Pulsar = Disparar · Mantener = Apuntar)

| Acción | Control | Comportamiento Exacto |
|---|---|---|
| **Disparar (toque rápido)** | **Pulsar `M` o `G`** (`< 8 ticks`) | Saca el arma y **dispara inmediatamente** según el tipo de arma (1 tiro en semi/escopeta/revólver; ráfaga de 3–4 balas en automáticas). Al terminar, el arma desaparece de la vista. |
| **Apuntar y Graduar Mira** | **Mantener `M` o `G`** (`≥ 8 ticks`) | Desenfunda el arma y entra en `aiming` con retícula/arco visible. Las flechas (`↑`, `↓`, `←`, `→`) gradúan `aimAngle` y `aimFacingRight` de forma independiente al movimiento (`WASD`). |
| **Disparar tras Apuntar** | **Soltar `M` o `G`** (o clic mientras apunta) | Dispara exactamente en el ángulo y dirección graduados y, al terminar la animación de disparo, el arma desaparece de la vista. |
| **Combate Melee** | **Tecla de combate (`N` / `F`)** | Saca el machete/arma blanca, golpea y al terminar desaparece de la vista. |
| **Granadas** | **Tecla de granada (`,` / `H` / `L`)** | Acción especial de lanzamiento parabólico; desaparece tras lanzar. |

---

## 5. Persistencia de la Mira y Reglas de Disparo por Tipo de Arma

### 5.1. Independencia y Persistencia de la Mira
- Nuevos campos en `PlayerState.ts`:
  - `aimFacingRight: boolean` (dirección horizontal hacia donde apunta la mira).
  - `aimAngle: number` (ángulo vertical relativo en radianes, ej. `-Math.PI / 2` arriba hasta `+Math.PI / 2` abajo).
- Al entrar en `aiming` (presionar `M`): `aimFacingRight` se inicializa con `p.facingRight` y `aimAngle = 0`.
- Mientras mantenga `M`:
  - Las flechas ajustan `aimAngle` y `aimFacingRight`.
  - Si el personaje camina (p. ej. con `A`/`D` o conserva inercia), la mira **no se sobreescribe** con la dirección de movimiento.
  - Si apunta **hacia arriba** y dispara, las balas/cohetes/perdigones salen **hacia arriba**; si apunta **hacia abajo**, salen **hacia abajo**.
- Después de hacer clic (`firing`):
  - Se ejecuta la animación temporal de disparo/retroceso.
  - Al terminar `firing`, el personaje **regresa automáticamente a `aiming` conservando el mismo `aimAngle` y `aimFacingRight`** mientras siga manteniendo `M`.

### 5.2. Reglas de Disparo por Clic
1. **Semiautomáticas (`Pistol`, `Pistol45`, `SilencedPistol`, `Revolver`, `Magnum`, `Sniper`, `Bazooka`, `GLauncher`, `FlareGun`, `Lazer`, `Bow`):**
   - **1 disparo por clic** (requiere soltar y volver a hacer clic para el siguiente tiro, respetando `cooldownTicks`).
2. **Escopetas (`Shotgun`, `SawedOff`, `DarkShotgun`):**
   - **1 disparo por clic** que libera los múltiples perdigones en abanico como una sola acción.
3. **Automáticas (`MachinePistol`, `Uzi`, `SilencedUzi`, `TommyGun`, `SMG`, `MP50`, `Rifle`, `Assault`, `Carbine`, `M60`, `Flamethrower`):**
   - **Ráfaga acotada de 3 o 4 balas por clic** (`burstRemaining = 3 | 4`, disparando 1 bala cada `3–4 ticks`), seguida de un pequeño enfriamiento (`burstCooldownTicks = 12`) antes de aceptar el siguiente clic.
   - **Nunca dispara de forma infinita** aunque se deje presionado el clic.
   - Todas las automáticas también apuntan con `M` y mantienen la mira durante y después de la ráfaga.

---

## 6. Fases de Implementación Propuestas

1. **Fase 1 — Estados de Equipamiento (`WeaponEquipState`) y Renderizado Corporal (`espalda / cintura`):**
   - Añadir `equipState`, `equipTransitionTicks`, `aimFacingRight`, `burstRemaining` y `burstCooldownTicks` en `PlayerState.ts`.
   - Implementar `renderHolsteredWeapon()` en `WeaponRenderer.ts` (diagonal en espalda para armas largas/machetes, funda lateral en cintura para pistolas/cuchillos) y transiciones `drawing` / `holstering` sin objetos flotantes.
2. **Fase 2 — Separación de Controles (`M` apunta + Flechas ajustan mira + Clic dispara) y Persistencia de Mira:**
   - Capturar `mousedown` (`clickFireJust`) en `ArenaCanvas.tsx`.
   - Hacer que `M` desenfunde y active `aiming` (y guarde al soltar `M`), que las flechas ajusten `aimAngle` / `aimFacingRight` independientemente del movimiento, y que tras `firing` vuelva a `aiming` preservando la mira exacta.
3. **Fase 3 — Reglas por Tipo de Arma (Ráfaga de 3–4 balas en automáticas vs 1 tiro por clic en semiautomáticas/escopetas):**
   - Implementar el controlador de ráfaga acotada (`burstRemaining` + `burstCooldownTicks`) en `ArenaCanvas.tsx` para todas las armas automáticas, garantizando 1 acción por clic en semiautomáticas/revólver/escopetas.
4. **Fase 4 — Validación Integral y Pruebas:**
   - Verificar todos los criterios de aceptación (machete, revólver, pistola, escopeta, automática en ráfaga, granadas, apunte arriba/abajo/izquierda/derecha con persistencia) + `npm run lint` y `npm run build`.
