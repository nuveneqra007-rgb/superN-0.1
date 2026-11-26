# Plan de Corrección: Balística Real de Escopetas y Armas Especiales

## 1. Diagnóstico de Armas con Disparo Bugueado o Inusual

### A. Escopetas (`Shotgun`, `SawedOff`, `DarkShotgun`) — `pellet_spread`
1. **Doble división de daño:** En `WeaponData.ts`, `damage` ya está definido *por perdigón* (`Shotgun = 20`, `SawedOff = 12`, `DarkShotgun = 9`), pero `WeaponFireSystem.ts` dividía `totalDamage / count`, reduciendo cada perdigón a `5`, `2` y `1.8`.
2. **Dispersión casi nula:** `ShotgunSpread = 4.3°` dividido entre 2 daba `±1.07°`, haciendo que todos los perdigones salieran en fila recta como un solo tiro.
3. **Alcance excesivo:** Con `maxLifeTicks = 38`, los perdigones cruzaban casi media arena (~450 px) en lugar de comportarse como arma de corto alcance.
4. **Retroceso visual exagerado en `rifle_shoot`:** En el Frame 3 de `rifle_shoot` (`ArenaCanvas.tsx`), el offset `translate(14, -18) rotate(-0.65)` desplazaba el arma fuera de la mano hacia arriba/atrás, dando la impresión visual de soltar/lanzar la escopeta al disparar.

### B. Lanzagranadas (`GLauncher`) — `grenade_launcher`
- **Bug de sprite lanzado:** `WeaponFireSystem.ts` marcaba `isGrenade: true` con `weaponType: WeaponType.GLauncher`. El renderizador (`ArenaCanvas.tsx`) buscaba `s.weaponImages[pr.weaponType]`, dibujando **el lanzagranadas completo girando por el aire** en lugar de una granada de 40mm.

### C. Bazooka (`Bazooka`) — `rocket`
- Velocidad inicial demasiado alta (`900 px/s`) y daño base bajo (`35`) para un cohete pesado. Debe partir más visible (`~460 px/s` acelerando en vuelo) con daño directo letal (`~65`) y onda expansiva amplia (`110 px`).

### D. Lanzallamas (`Flamethrower`), Láser (`Lazer`) y Arco (`Bow`)
- **`Flamethrower`**: ajustar cono corto de llamas (`maxLifeTicks: 18`) con quemadura garantizada y expansión visual.
- **`Bow`**: eliminar chispas de pólvora al disparar (`sparkCount: 0`) y mantener arco parabólico silencioso.
- **`Lazer`**: haz energético limpio de alta velocidad con destello cian.

---

## 2. Solución Propuesta (Fases)

### Fase A — Balística real de Escopetas (`WeaponFireSystem.ts` + `WeaponData.ts`)
- Usar `damage` **por perdigón** sin dividir entre `count` en `pellet_spread` (calibrando `Shotgun` a `11 × 5 = 55 máx a quemarropa`, `SawedOff` a `9 × 6 = 54`, `DarkShotgun` a `10 × 5 = 50`).
- **Abanico real de cartucho:**
  - `Shotgun`: `16°` de apertura en cono.
  - `DarkShotgun`: `18°` de apertura.
  - `SawedOff`: `24°` de apertura amplia.
  - Distribuir los perdigones equitativamente dentro del cono (`-spread/2` a `+spread/2`) + pequeña variación aleatoria para garantizar abanico visible y consistente.
- **Corto alcance y caída de daño:**
  - `maxLifeTicks` corto (`18` ticks para `SawedOff`, `21` para `Shotgun` y `DarkShotgun`, equivalente a ~200–240 px).
  - En el loop de impacto (`ArenaCanvas.tsx`), aplicar caída de daño lineal según `lifeTicks / maxLifeTicks` (100% a quemarropa, bajando hasta ~40% al límite del alcance).
- **Renderizado de perdigones:** dibujar cada perdigón como balín brillante corto con estela sutil de dispersión.

### Fase B — Corrección de Lanzagranadas (`GLauncher`), Bazooka y Especiales
- Añadir `isLauncherRound?: boolean` en `FiredProjectileSpec` para que `GLauncher` dibuje una **cápsula explosiva de 40mm** (cuerpo verde oliva, punta dorada) en lugar del sprite del lanzagranadas.
- Ajustar `Bazooka` para que el cohete sea claramente visible en vuelo (velocidad inicial `460 px/s` acelerando a `820 px/s`, explosión letal `65` de daño + `110 px` radio).
- Quitar chispas de pólvora en `Bow` (`sparkCount: 0`).

### Fase C — Suavizado del Retroceso Visual en `rifle_shoot` (`ArenaCanvas.tsx`)
- Reducir el salto exagerado del Frame 3 en `rifle_shoot` (`translate(14, -18) rotate(-0.65)` → `translate(16, -4) rotate(-0.22)`) manteniendo el arma firmemente agarrada en la mano del protagonista durante el retroceso.

### Fase D — Verificación
- Probar en El Gimnasio `Shotgun`, `SawedOff`, `DarkShotgun`, `GLauncher`, `Bazooka`, `Flamethrower`, `Lazer` y `Bow` + `npm run lint` y `npm run build`.
