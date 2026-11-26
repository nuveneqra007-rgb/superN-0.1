# Plan Maestro: Lógica de Disparo Diferenciada y Sistema de Audio Táctico

## 1. Objetivo
Darle al juego la respuesta táctil y sonora de un título completo de acción/combate:
- Cada acción de **combate cuerpo a cuerpo** (puños, combos de espada/katana, cuchillo, bates, porra eléctrica) debe sonar distinta en el aire y al impactar.
- Cada **arma de fuego o especial** debe tener su propia **lógica balística real** y su **perfil de sonido único**. En particular, armas como la **Bazooka** no disparan una bala convencional, sino un **misil/cohete** con estela, colisión contra entorno/enemigos y explosión letal por impacto y onda expansiva.

---

## 2. Diagnóstico del Estado Actual
1. **Duplicación en disparos (`src/components/ArenaCanvas.tsx`):** Existen ~25 llamadas repetidas a `s.projectiles.push({...})` repartidas entre P1, P2 y Bots según la animación (`pistol`, `rifle`, `heavy`).
2. **Balística uniforme:** Las armas especiales como `Bazooka`, `GLauncher`, `Flamethrower`, `Lazer` y `Bow` necesitan un comportamiento propio y consistente en un único motor de disparo.
3. **Audio poco diferenciado (`src/game/SoundEffects.ts` y `ArenaCanvas.tsx`):**
   - `WeaponData.soundType` solo distingue 6 valores (`punch`, `pistol`, `shotgun`, `magnum`, `sniper`, `explosion`).
   - Muchos golpes y disparos en `ArenaCanvas.tsx` siguen llamando a `sounds.playPunch()`.
   - Falta variación sutil de tono (*pitch jitter*) y control de polifonía para que ráfagas rápidas (Uzi, M60) no saturen el Web Audio API.

---

## 3. Arquitectura de la Solución

### Pilar 1: Contrato Balístico y Sonoro en `WeaponData.ts`
Añadir a `WeaponData` dos campos declarativos claros:
- **`ballisticType`**:
  - `bullet`: Pistolas, Revólveres, SMGs, Rifles, M60 (bala rápida, trazador y casquillo).
  - `silenced_bullet`: `SilencedPistol`, `SilencedUzi` (trazador discreto, sin fogonazo brillante).
  - `pellet_spread`: `Shotgun`, `SawedOff`, `DarkShotgun` (múltiples perdigones en abanico con caída de daño por distancia).
  - `sniper_pierce`: `Sniper` (proyectil de altísima velocidad, estela larga y alto impacto).
  - `rocket`: **`Bazooka`** — dispara un **misil real** con propulsión, estela de humo/fuego frame a frame, explosión al tocar enemigo, suelo o pared, daño letal directo + onda expansiva (`explosionRadius`) + retroceso físico al tirador.
  - `grenade_launcher`: **`GLauncher`** — granada propulsada con arco parabólico (gravedad), rebote opcional y detonación explosiva.
  - `flame_stream`: **`Flamethrower`** — partículas ígneas de corto alcance en abanico que aplican fuego continuo (`isOnFire`) y daño por tick.
  - `laser_beam`: **`Lazer`** — haz energético instantáneo con resplandor y quemadura.
  - `arrow`: **`Bow`** — flecha física con gravedad suave.
- **`soundProfile`**:
  - Melee: `fist`, `knife`, `blade_heavy` (katana/sword/machete), `blunt_wood` (bat/cuestick/chair), `blunt_metal` (pipe/hammer), `shock`, `chainsaw`.
  - Fuego/Especial: `pistol`, `silenced`, `magnum`, `smg`, `rifle`, `shotgun`, `sniper`, `bazooka`, `glauncher`, `flamethrower`, `lazer`, `bow`.

### Pilar 2: Motor Unificado `src/game/WeaponFireSystem.ts`
Centralizar en un solo módulo (usado por P1, P2 y Bots):
1. **Cálculo del punto de salida (Muzzle Origin):**
   Calcular la punta del cañón a partir de la posición de la mano (`resolveHandAnchor` / dirección) y longitud del arma para que balas, misiles y llamas salgan del cañón real.
2. **Generación del proyectil según `ballisticType`:**
   - **Misil de Bazooka (`rocket`):** entidad con `isRocket: true`, sprite/forma de cohete orientado al vector velocidad, emisión continua de humo gris/naranja en cada frame de vuelo, y al colisionar con cualquier combatiente o plataforma sólida dispara `triggerExplosion(...)` con daño letal en el centro y onda expansiva radial.
   - **Lanzagranadas (`grenade_launcher`):** proyectil con gravedad que detona al impacto directo o tras corto temporizador.
   - **Lanzallamas (`flame_stream`):** partículas de fuego con vida corta y colisión en cono.
   - **Escopetas / Rifles / Pistolas:** dispersión en radianes (`accuracyDeg`), multi-pellet en escopetas y expulsión de casquillo visual.
3. **Retroceso físico (`recoil`) y disparo en vacío:**
   - Empuje sutil hacia atrás al tirador (mayor en `Shotgun`, `Magnum`, `Sniper` y `Bazooka`).
   - Si `ammo === 0`: reproducir `sounds.playDryFire()` sin crear proyectil.

### Pilar 3: Sistema de Audio Enriquecido (`src/game/SoundEffects.ts`)
Ampliar el sintetizador Web Audio API con variación aleatoria de *pitch* (`±5%`) y envolventes limpias:
1. **Combate cuerpo a cuerpo (Puños / Patadas):**
   - `playMeleeSwing(comboStep)`: *whoosh* de aire (más grave en patada / 3er golpe).
   - `playMeleeHit(heavy)`: impacto seco de puño vs golpe pesado con sub-grave.
2. **Combate con armas blancas y contundentes:**
   - `playKnifeSlash()` y `playSwordComboSlash(step)`: corte agudo rápido para cuchillo; *swish* de acero resonante para katana/espada con progresión tonal en los 3 pasos del combo.
   - `playBladeHit()`: corte limpio metálico al conectar.
   - `playBluntSwing()` / `playBluntHit(material)`: impacto hueco de madera (`Bat`) o resonancia metálica (`Pipe`/`Hammer`).
   - `playShockHit()`: descarga eléctrica rápida para `ShockBaton`.
   - `playChainsawAttack()`: zumbido agresivo de sierra para `Chainsaw`.
3. **Armas de fuego y especiales:**
   - `pistol`: detonación corta y seca.
   - `silenced`: *pffft* amortiguado + clic de corredera.
   - `magnum`: estampido grave con cola metálica.
   - `smg`: disparo ágil de calibre ligero (ideal para ráfagas de Uzi/MP50).
   - `rifle`: golpe de pólvora de medio/largo alcance (Rifle, Assault, M60).
   - `shotgun`: descarga amplia de ruido + sutil sonido de bombeo (*pump*).
   - `sniper`: grieta supersónica aguda + eco largo.
   - **`bazooka`**: ignición presurizada (*whoosh* grave de lanzamiento) + silbido ascendente/descendente + `playExplosion()` profunda al detonar el misil.
   - `glauncher`: *thunk* hueco de tubo lanzagranadas + explosión al detonar.
   - `flamethrower`: siseo de llama presurizada.
   - `lazer`: barrido sintético futurista.
   - `bow`: vibración seca de cuerda tensada.

---

## 4. Fases de Implementación

1. **Fase 1 — Contratos y Audio (`WeaponData.ts` + `SoundEffects.ts`):**
   Definir `ballisticType` y `soundProfile` en `WeaponData.ts` y crear todos los métodos de sonido diferenciados en `SoundEffects.ts` con variación de pitch y protección contra saturación.
2. **Fase 2 — Motor Unificado de Disparo (`WeaponFireSystem.ts`) y Misil de Bazooka:**
   Extraer la creación de proyectiles de `ArenaCanvas.tsx` a `WeaponFireSystem.ts`, implementando el misil real de la Bazooka (estela, colisión y explosión letal), más `GLauncher`, `Flamethrower`, `Lazer` y `Bow`.
3. **Fase 3 — Integración Sonora en Combate Cuerpo a Cuerpo y Armas:**
   Conectar los sonidos correctos en `ArenaCanvas.tsx` y `CombatSystem.ts` para puños, combos de espada/cuchillo, contundentes, eléctricas y disparos de P1, P2 y Bots.
4. **Fase 4 — Pruebas en El Gimnasio y Build:**
   Probar cada familia de arma (melee, pistola, rifle, escopeta, francotirador, bazooka, lanzagranadas, lanzallamas, láser, arco) + `npm run lint` y `npm run build`.
