# Plan de Implementación: Enfunde Táctico y Apuntado Direccional

## 1. Visión General
Este plan introduce dos mecánicas complementarias para darle al juego una sensación táctica y visualmente limpia (al estilo *Superfighters* / *Metal Slug*):
1. **Enfunde Táctico ("Equipado en mochila/funda, desenfunde solo al usar"):** Ningún arma melee, de fuego o granada queda flotando en las manos mientras el personaje está quieto, caminando o corriendo. Todo queda guardado/equipado en su equipo y **sale a la mano únicamente al atacar, disparar, lanzar o apuntar**.
2. **Apuntado Manual Direccional (Mantener `M` + Direcciones):** Al sostener la tecla de disparo con un arma de fuego, el protagonista saca el arma, entra en postura de apunte y puede **ajustar el ángulo de mira** con `Arriba / Abajo / Izquierda / Derecha` viendo una retícula/línea de mira real antes de disparar.

---

## 2. Mecánica 1: Sistema de Enfunde Táctico (Zero Floating Weapons)

### 2.1. Regla de Visibilidad en Mano
- **Estado por defecto (`Idle`, `Walk`, `Run`, `Jump`, `Crouch`, `Roll`):**
  - El arma equipada **NO se dibuja en la mano**. Las manos del protagonista (`Ninja`, `Gymrat`, `Santa`) quedan libres, respetando al 100% sus animaciones originales sin objetos flotando.
  - Opcional visual limpio: en lugar de flotar en la mano, el arma primaria/melee equipada puede mostrarse **colgada en la espalda / mochila** (inclinada sobre el torso trasero) o **guardada en funda**, o permanecer puramente en el HUD de ranuras (`1–4`) para una silueta 100% limpia. *(Se recomienda mostrar un detalle sutil en espalda/cinturón solo si queda integrado al torso, y nunca en la mano).*
- **Estado activo (Desenfunde automático):**
  - **Melee (`N` / `F`):** Al presionar combate con Machete, Katana, Cuchillo, Bate, etc., el arma aparece inmediatamente en la mano durante toda la animación de ataque (`isOneHandAttacking`, `isTwoHandAttacking`, `isBladeAttacking`) + una breve ventana de guardia post-golpe (~`18 ticks` / `0.3s`) por si encadena combo, y luego se vuelve a guardar.
  - **Fuego (`M` / `G`):** Aparece en la mano al **apuntar** (`isAiming`) y durante la animación de disparo (`isPistolShooting`, `isRifleShooting`, o `20 ticks` tras disparar armas pesadas), guardándose al soltar y terminar el retroceso.
  - **Arrojadizas (`,` / `H` / `L`):** Se mantienen guardadas y solo se dibujan en la mano durante `throw_up` hasta el frame de liberación.

### 2.2. Cambios Técnicos Requeridos
- En `src/game/PlayerState.ts`: añadir `weaponDrawGuardTicks?: number` (ventana breve tras un ataque/disparo antes de enfundar) e `isAiming?: boolean`, `aimAngle?: number`.
- En `src/game/WeaponRenderer.ts`:
  - `renderEquippedWeaponIdle(...)` solo renderiza el arma en mano cuando `pose.isAiming || pose.isAttacking || pose.isShooting || (pose.weaponGuardTicks || 0) > 0`.
  - Cuando no está activa, opcionalmente dibujar el arma **enfundada en la espalda** (rotada en diagonal detrás del torso) si el usuario desea ver qué lleva equipado en la mochila/espalda sin que flote en la mano.

---

## 3. Mecánica 2: Apuntado Manual Direccional (Mantener `M` + Direcciones)

### 3.1. Flujo de Input ("Toque Rápido vs Apunte Preciso")
Para no perder velocidad en peleas rápidas y a la vez permitir disparos angulados de precisión:

1. **Armas Semiautomáticas y Pesadas** (`Pistol`, `Pistol45`, `SilencedPistol`, `Magnum`, `Revolver`, `Shotgun`, `SawedOff`, `DarkShotgun`, `Sniper`, `Bazooka`, `GLauncher`, `FlareGun`, `Lazer`, `Bow`):
   - **Toque rápido (`M` < `8 ticks` / ~130ms):** dispara directo al frente como hasta ahora (combate ágil instantáneo).
   - **Mantener `M` (`>= 8 ticks`):** entra en **Postura de Apuntado (`isAiming = true`)**:
     - El protagonista se planta en el suelo (sin saltar ni desplazarse rápido) y saca el arma apuntando al frente (`aimAngle = 0`).
     - Usar **`Arriba / Abajo / Izquierda / Derecha` (`W/A/S/D` o `Flechas`)** ajusta el ángulo objetivo en **8 direcciones o barrido suave** (`-85°` arriba, `-45°` diagonal arriba, `0°` frente, `+45°` diagonal abajo, `+85°` abajo si está en plataforma elevada/aire; `Izquierda`/`Derecha` voltea `facingRight` al instante).
     - **Al soltar `M`:** dispara el proyectil (bala, cartucho de escopeta, cohete de Bazooka, granada 40mm de M79, flecha o bengala) **exactamente en la dirección `aimAngle`**.
   - Cancelación segura: si presiona **Rodar (`Abajo + Dirección` rápido en toque)** o recibe un golpe (`Hitstun` / `KnockedDown`), cancela el apunte sin gastar munición.

2. **Armas Automáticas** (`MachinePistol`, `Uzi`, `SilencedUzi`, `TommyGun`, `SMG`, `MP50`, `Rifle`, `Assault`, `Carbine`, `M60`, `Flamethrower`):
   - Al mantener `M`, **disparan en ráfaga continua** mientras el jugador puede inclinar libremente el ángulo hacia arriba o abajo con `Arriba / Abajo` y girar con `Izquierda / Derecha` (barra de fuego estilo *Metal Slug* / *Contra*).

### 3.2. Animación Visual de Apunte y Retícula Táctica
- **Arma orientada en mano:**
  - En `WeaponRenderer.ts`, durante `isAiming`, el arma se dibuja en la postura de tiro (`pistol` o `rifle` a dos manos con `drawGripHand`) rotada exactamente a `aimAngle`.
  - Si `aimAngle` apunta arriba o abajo (`|aimAngle| > 0.3`), la mano sube o baja ligeramente siguiendo el arco del hombro para que la pose sea anatómica en `Ninja`, `Gymrat` y `Santa`.
- **Retícula / Línea de Mira:**
  - **Armas balísticas (`Pistol`, `Rifle`, `Shotgun`, `Sniper`, `Lazer`):** línea punteada táctica desde la boca del cañón hasta `160–280 px` (o hasta el primer obstáculo/enemigo, y mira láser roja continua en `Sniper` y `Lazer`) + pequeña cruz/punto en el extremo.
  - **Armas parabólicas (`GLauncher` M79, `FlareGun`, `Bow`):** **arco punteado predicho** (`8–10` puntos simulando `vy` y `gravity`) para que el jugador vea exactamente dónde caerá la granada 40mm o la flecha!

### 3.3. Balística Angulada en `WeaponFireSystem.ts`
- Añadir `aimAngle?: number` (radianes relativos a la dirección `facingRight`) a `FireWeaponParams`:
  - Calcular la boca del cañón rotada:
    `muzzleX = shooter.x + dir * Math.cos(aimAngle) * barrelLen`
    `muzzleY = (shooter.y - 6) + Math.sin(aimAngle) * barrelLen`
  - Calcular el vector velocidad rotado por `aimAngle + spreadAngle`:
    `vx = dir * speed * Math.cos(aimAngle + spreadAngle)`
    `vy = speed * Math.sin(aimAngle + spreadAngle)`
  - Funciona automáticamente para **todas las armas**: balas, perdigones de escopeta en abanico angulado, misil recto diagonal de **Bazooka**, granada parabólica de **M79**, bengala, láser y flechas!

---

## 4. Fases de Implementación Propuestas

1. **Fase 1 — Enfunde Táctico (Zero Floating Weapons):**
   - Añadir `weaponGuardTicks` en `PlayerState.ts`.
   - Ocultar el arma en mano durante reposo/caminata/carrera en `WeaponRenderer.ts` y `ArenaCanvas.tsx`, desenfundando automáticamente al atacar, disparar o entrar en guardia breve (con opción de mostrar arma colgada en espalda/funda).
2. **Fase 2 — Estado de Apuntado (`isAiming` + `aimAngle`) y Bloqueo de Movimiento:**
   - Capturar `M` mantenida + direcciones (`Arriba/Abajo/Izquierda/Derecha`) en `ArenaCanvas.tsx` para P1 (y P2 en 1v1 local), diferenciando toque rápido vs apunte sostenido y ráfaga direccional en automáticas.
3. **Fase 3 — Balística Angulada (`aimAngle` en `WeaponFireSystem.ts`) + Retícula / Arco de Mira:**
   - Rotar `muzzleX/Y` y `(vx, vy)` de todos los proyectiles según `aimAngle`.
   - Dibujar el arma rotada en mano durante `isAiming` + retícula punteada / láser / arco parabólico para M79, FlareGun y Bow.
4. **Fase 4 — Pruebas en El Gimnasio y Build:**
   - Probar enfunde + desenfunde con machete, pistola, escopeta, M79, bazooka y granadas + apuntado en 8 direcciones + `npm run lint` y `npm run build`.
