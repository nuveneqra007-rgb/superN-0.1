# Especificación Técnica — Animación de Agarre a Una Mano (`one_hand_attack`)

> **Alcance:** Integración unificada del agarre a una mano (**Corte / Impacto rápido**) para el **Ninja** (y compatibilidad con el resto de protagonistas) sobre `one_hand_attack.png`.

---

## 1. Armas Cubiertas (7)

Todas estas armas pertenecen a `ONE_HAND_WEAPONS` (`WeaponGrip = 'oneHand'`) en [`src/game/WeaponData.ts`](../src/game/WeaponData.ts) y activan `isOneHandAttacking` en [`src/components/ArenaCanvas.tsx`](../src/components/ArenaCanvas.tsx):

| Arma (`WeaponType`) | Categoría | Tipo de golpe | `hitFrame` | Sonido | Estela VFX (Ninja) |
|---|---|---|---|---|---|
| `Katana` | Filo (`isOneHandBladeWeapon`) | Corte rápido | `2` | `playSwordSwing()` | Arco acero `#38bdf8` (`r = 40`) |
| `Machete` | Filo (`isOneHandBladeWeapon`) | Corte rápido | `2` | `playSwordSwing()` | Arco acero `#38bdf8` (`r = 40`) |
| `Knife` (Cuchillo) | Filo (`isOneHandBladeWeapon`) | Corte relámpago | `1` | `playSwordSwing()` | Arco acero `#38bdf8` (`r = 40`) |
| `Baton` | Contundente (`isOneHandBluntWeapon`) | Impacto rápido | `2` | `playPunch()` | Arco ámbar `#f59e0b` (`r = 36`) |
| `ShockBaton` | Contundente (`isOneHandBluntWeapon`) | Impacto eléctrico | `2` | `playPunch()` | Arco eléctrico `#60a5fa` (`r = 36`, blur `18`) |
| `Whip` | Contundente (`isOneHandBluntWeapon`) | Impacto rápido | `2` | `playPunch()` | Arco ámbar `#f59e0b` (`r = 36`) |
| `CueStick` | Contundente (`isOneHandBluntWeapon`) | Impacto rápido | `2` | `playPunch()` | Arco ámbar `#f59e0b` (`r = 36`) |

---

## 2. Spritesheet y Metadatos (Ninja)

- **Imagen:** `/assets/sprites/player/one_hand_attack.png`
- **Metadatos:** `/assets/sprites/player/one_hand_attack.meta.json`
- **Dimensiones:** `1100 × 290 px` · **Grilla:** `5 cols × 1 row` (`220 × 290 px` por celda)
- **Línea de suelo (`groundY`):** `274 px` · **Altura visible:** `234 px` (vs `249 px` en `ninja_walk`)

### Escala uniforme (`UNIFORM_SCALE_MAP` en `src/game/CharacterData.ts`)

```ts
ninja_one_hand_attack: {
  scaleFactor: 249 / 234, // 1.0641 — iguala la estatura base de ninja_walk
  feetYRatio: 274 / 290,  // 0.9448 — alinea los pies al suelo sin hundimiento
  feetCenterXInCell: 110, // centro horizontal del cuerpo en celda de 220px
}
```

### Línea de tiempo por fotograma (`frameDurations = [2, 2, 2, 3, 3]` = `12 ticks` ≈ `200 ms` a `60 fps`)

| Frame | Fase | Duración (ticks) | Pose / Rol | Rotación del arma en mano |
|---|---|---|---|---|
| `0` | `windup` | `2` | Guardia inicial | `(12, -2)`, `-0.25 rad` |
| `1` | `windup` | `2` | Brazo atrás cargando golpe/corte | `(18, -14)`, `-0.70 rad` |
| `2` | `active` | `2` | **Extensión máxima / Hit frame por defecto** | `(26, -2)`, `+0.20 rad` |
| `3` | `recovery` | `3` | Seguimiento descendente | `(22, 8)`, `+0.65 rad` |
| `4` | `recovery` | `3` | Retorno a guardia (`Idle`) | `(16, 2)`, `+0.10 rad` |

---

## 3. Reglas de Ejecución y Hitbox (`ArenaCanvas.tsx`)

1. **Prioridad de agarre:**
   - Si el arma está en `TWO_HAND_WEAPONS` → `isTwoHandAttacking`.
   - Si el arma está en `ONE_HAND_WEAPONS` (excluyendo `Fists`) y el personaje tiene `one_hand_attack` → `isOneHandAttacking`.
   - Con esto, el Ninja deja de desviarse al spritesheet externo de Assassin (`assasin-asm_sword_triple_combo_3a606114.png`) cuando equipa `Katana` o `Machete`.
2. **Bloqueo de movimiento durante el golpe:** `velocityX = 0`, `fsm = PlayerFSMState.MeleeAttack`.
3. **Alcance y resolución de impacto:**
   - `reachX = 58 px` (Ninja / Santa) · `reachX = 65 px` (GymRat) · `reachY = 34 px`.
   - Se dispara una sola vez por ataque (`oneHandHasHit`) al alcanzar `getWeaponHitFrame(equippedWeapon, 2)`.
   - Al completar el frame `4` (`totalOneHandFrames = 5`), reinicia `isOneHandAttacking = false` y vuelve a `PlayerFSMState.Idle`.
