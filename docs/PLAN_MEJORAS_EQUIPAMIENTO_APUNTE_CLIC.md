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

## 3. Equipamiento Visible en Cuerpo (Espalda / Cintura / Cinturón)

En `WeaponRenderer.ts`, cuando el arma esté en `holstered` (o durante `Walk`, `Run`, `Jump`, `Crouch`, `Idle` sin usar):
- **Armas largas y de filo medio/grande** (`Rifle`, `Assault`, `Carbine`, `M60`, `Shotgun`, `SawedOff`, `DarkShotgun`, `Sniper`, `Bazooka`, `GLauncher`, `Flamethrower`, `Katana`, `Sword`, `Machete`, `Axe`, `Bat`, `Chainsaw`, `Hammer`):
  - Se dibujan **enfundadas en diagonal sobre la espalda/mochila** (detrás del torso del personaje, acompañando la inclinación del cuerpo al caminar, correr o agacharse).
- **Armas cortas de una mano** (`Pistol`, `Pistol45`, `SilencedPistol`, `Magnum`, `Revolver`, `Uzi`, `SilencedUzi`, `MachinePistol`, `Knife`, `Baton`, `ShockBaton`):
  - Se dibujan **pegadas en funda lateral en la cintura/cadera**.
- **Granadas:**
  - Compactas y pegadas al cinturón/bolsillo táctico del torso (nunca flotando separadas), saliendo a la mano solo en `throw_up`.
- **Al entrar en `drawing` / `aiming` / `using`:** el arma desaparece de la espalda/cintura y aparece en la mano con el puño envolvente (`drawGripHand`).

---

## 4. Separación Estricta de Controles

| Acción | Control | Comportamiento Exacto |
|---|---|---|
| **Desenfundar y Apuntar** | **`M` mantenida** | Saca el arma de fuego y mantiene `aiming`. Al soltar `M`, pasa a `holstering` → `holstered`. |
| **Ajustar Mira** | **Flechas (`↑`, `↓`, `←`, `→`)** mientras mantiene `M` | Ajusta `aimAngle` (arriba/abajo/diagonal) y `aimFacingRight` (izquierda/derecha) de forma **independiente de la dirección de movimiento**. |
| **Disparar** | **Clic izquierdo** (en el canvas) | Dispara el arma desenfundada en la dirección actual de la mira (`aimAngle` + `aimFacingRight`). |
| **Combate Melee** | **Tecla de combate (`N` / `F`)** | Saca el machete/arma blanca, golpea y al terminar vuelve a guardarlo. |
| **Granadas** | **Tecla de granada (`,` / `H` / `L`)** | Acción especial de lanzamiento parabólico independiente del apunte recto. |

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
