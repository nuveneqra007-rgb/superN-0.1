# Plan: Reparación de Armería, Motosierra, Arrojadizas/Especiales y Fuego Real del Lanzallamas Napalm

## Auditoría Real de Fallos Detectados

1. **Motosierra (`Chainsaw`), Cadena (`Chain`) y Asta de Bandera (`Flagpole`) inoperantes**:
   - En `WeaponData.ts`, `WeaponType.Chainsaw`, `WeaponType.Chain` y `WeaponType.Flagpole` faltaban en `TWO_HAND_WEAPONS` y en `WEAPON_HIT_FRAMES`, por lo que al pulsar `N` caían al fallback de puñetazos desarmados y nunca atacaban con el arma.
   - `Chainsaw` carecía de mecánica de motor encendido / corte continuo al mantener `N`, vibración visual, chispas metálicas y sonido de sierra sostenida.

2. **Armas Melee Especiales sin alcance o respuesta propia (`Whip`, `Chain`, `Chair`, `Flagpole`, `Pillow`)**:
   - `Whip` (Látigo de Cuero Trenzado) usaba el mismo alcance corto (`58 px`) que un cuchillo y carecía de estela larga de latigazo.
   - `Chair` (Silla Plegable de Acero), `Flagpole` (Asta de Bandera) y `Pillow` (Almohada Cósmica) compartían exactamente la misma hitbox y empuje genérico en lugar de reflejar alcance largo (`Flagpole`/`Chain`), sillazo amplio (`Chair`) o empuje cómico masivo con plumas/chispas blancas (`Pillow`).
   - `Pillow` tenía `carryPose: 'one_hand_blunt'` en `WeaponGripData.ts` pese a ser arma a dos manos.

3. **Objetos Arrojadizos y Estimulantes en Armería (`Baseball`, `Molotov`, `C4`, `Mine`, `StrengthBoost`, `SloMo10`)**:
   - `handleEquipPracticeWeapon()` en `ArenaCanvas.tsx` convertía `Baseball`, `C4` y `Mine` a `GrenadeType.Frag` dentro de `s.p1Grenades` y no soportaba la categoría `'powerup'` (`StrengthBoost`, `SloMo10`).
   - Al pulsar Coma (`,`) o cambiar a `'throwable'`, `switchFighterSlot()` pisaba `p1.equippedWeapon` con `Grenade` / `Molotov`, impidiendo usar `Baseball`, `C4` o `Mine` equipados desde el armero o el suelo.
   - Faltaban los efectos activos en combate para `StrengthBoost` (+150% daño melee temporal con aura púrpura) y `SloMo10` (ralentización temporal de rivales y proyectiles enemigos con tinte cian).

4. **Lanzallamas Napalm (`Flamethrower`) — "tira como un humito"**:
   - `WeaponFireSystem.ts` generaba solo `3` círculos pequeños con `maxLifeTicks = 18` (~100 px cortos).
   - Al impactar paredes/plataformas en `ArenaCanvas.tsx`, emitía partículas grises (`#cbd5e1`) que parecían humo en lugar de brasas de fuego.
   - `renderGame()` dibujaba un solo círculo semitransparente sin núcleo incandescente ni expansión en cono sobre el rango entre tirador y enemigo, y no permitía flujo continuo sostenido al mantener pulsado `M` / botón `○ Fuego`.

---

## Plan de Implementación

### Fase 1: Catálogo, Agarres y Hit Frames (`WeaponData.ts`, `WeaponGripData.ts`)
- Añadir `WeaponType.Chainsaw`, `WeaponType.Chain` y `WeaponType.Flagpole` a `TWO_HAND_WEAPONS` y a `WEAPON_HIT_FRAMES`.
- Ajustar `WeaponGripData.ts` para que `Pillow` use `two_hand_heavy` y mejorar visibilidad/proporción de `Chain`, `Whip`, `Chair`, `Flagpole` y `Chainsaw`.

### Fase 2: Lanzallamas Napalm — Fuego Real en Cono y Flujo Sostenido (`WeaponFireSystem.ts` + `ArenaCanvas.tsx`)
- En `WeaponFireSystem.ts` (`flame_stream`): generar **7 proyectiles de llama por pulso** con velocidad `340–440 px/s`, `maxLifeTicks = 28..36` (rango efectivo ~200–250 px entre tirador y rival) y dispersión cónica natural.
- En `ArenaCanvas.tsx`:
  - Soportar emisión continua de llamas mientras se mantiene pulsado `M` / botón táctil `○` con `Flamethrower` (además de ráfaga abundante al toque corto).
  - En `renderGame()` (`pr.isFlame`): renderizar fuego multicapa animado (halo rojo-naranja, cuerpo naranja brillante y núcleo blanco-amarillo incandescente que se expande a lo largo del rango).
  - En colisión de `pr.isFlame`: cambiar chispas grises a brasas naranjas/doradas (`#f97316`), aplicar ignición directa (`isOnFire = true`, `fireTicks = 180`) y dejar pequeñas zonas de fuego temporal en el suelo al impactar plataformas.

### Fase 3: Motosierra Encendida + Perfiles Únicos de Melee (`ArenaCanvas.tsx`)
- **Motosierra (`Chainsaw`)**:
  - Al pulsar o mantener `N` con `Chainsaw`, enciende la hoja (`isChainsawRevving`), vibra en mano con humo/chispas metálicas, reproduce el rugido de motor y realiza cortes rápidos continuos cada 9 ticks hacia adelante (`reachX = 74`) contra enemigos, cajas y barriles.
- **Látigo (`Whip`) y Cadena (`Chain`)**: alcance extendido (`reachX = 104`), estela larga tipo látigo y sonido de chasquido metálico/cuero.
- **Silla (`Chair`) y Asta de Bandera (`Flagpole`)**: alcance amplio (`reachX = 108` para `Chair`, `122` para `Flagpole`) con derribo y empuje táctico claro.
- **Almohada Cósmica (`Pillow`)**: daño ligero (`6`) con retroceso explosivo cómico (`kbX: 460`, `kbY: -220`) y chispas blancas `"¡ALMOHADAZO CÓSMICO!"`.

### Fase 4: Reparación de Armería Práctica, Arrojadizas y Estimulantes (`ArenaCanvas.tsx`)
- En `handleEquipPracticeWeapon`:
  - Si `weaponType` es `Baseball`, `C4` o `Mine`, conservar exactamente `p1.equippedWeapon = weaponType` y `p1.ammo = 999` (sin convertirlo a `GrenadeType.Frag`), dejando `weaponGuardTicks = 120` para verlo en mano.
  - Si `wSlot === 'powerup'` (`StrengthBoost`, `SloMo10`), equiparlo en mano listo para usar o activarlo directamente con `N`, `M` o `,` (con efecto real de Super Fuerza ×2.5 o Slo-Mo durante 8–10 segundos!).
- En `switchFighterSlot` y lógica de lanzamiento `,`: respetar el `WeaponType` arrojable activo (`Baseball`, `C4`, `Mine`, `Molotov`, `Grenade`) mientras tenga `ammo > 0` antes de volver al selector rotativo de granadas.

---

## Verificación
- `npm run lint` (`tsc --noEmit`) y `npm run build` (`tsc && vite build`) deben pasar con 0 errores.
