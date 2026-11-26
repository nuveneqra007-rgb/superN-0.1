# Plan de Implementación: Sistema de Empuñe Realista de Armas (Protagonistas)

## 1. Principio Rector: Preservación de Identidad Única
El sistema **no alterará, reemplazará ni homogenizará** los spritesheets, proporciones, `drawScale`, estadísticas ni animaciones propias de ninguno de los 3 protagonistas:
- **Ninja (`ninja`)**: Mantiene su silueta ágil, guantes/muñequeras oscuras y animaciones shinobi propias.
- **Gymrat (`gymrat`)**: Mantiene su complexión robusta, estilo callejero/pesas, tonos de piel/vendas y spritesheets propios (respetando sus animaciones integradas cuando correspondan).
- **Santa Claus (`santaclo`)**: Mantiene su silueta, guantes característicos y spritesheets propios (respetando sus animaciones integradas cuando correspondan).

Cada protagonista contará con su **propio perfil de anclaje de manos y estilo de guante/puño**, calibrado sobre sus sprites originales sin modificar el arte base del personaje.

---

## 2. Diagnóstico del Estado Actual
Actualmente, en `src/components/ArenaCanvas.tsx` (línea ~10734), cuando un personaje tiene un arma equipada y no está ejecutando un ataque, el juego la dibuja con una única llamada fija:
```ts
ctx.drawImage(wImg, 8, -6, 32, 16);
```
Esto genera 4 problemas visibles en los 3 protagonistas:
1. **Desacople corporal:** El arma flota en `(8, -6)` sin acompañar el vaivén de `Walk`/`Run`, el descenso al `Crouch`, ni la postura de `Jump`/`Fall`.
2. **Sin pivote de empuñadura:** Se dibuja desde la esquina superior izquierda del PNG a un tamaño fijo `32×16`, por lo que cuchillos, katanas, pistolas y rifles no coinciden con la palma de la mano.
3. **Sin mano envolvente:** El arma queda superpuesta encima del sprite del personaje, sin dedos o guante que cierren sobre el mango.
4. **Inconsistencia entre ataques e idle:** Durante el combate, `ArenaCanvas` ya tiene offsets específicos para `pistol_shoot` y `rifle_shoot`, pero al terminar el disparo el arma "salta" de vuelta a `(8, -6)`.

---

## 3. Arquitectura Propuesta (4 Pilares)

### Pilar 1: Configuración de Agarre por Arma (`WeaponGripConfig`)
Definir en `src/game/WeaponGripData.ts` (o dentro de `WeaponData.ts`) la geometría física de cada `WeaponType`:
- **`carryPose`**:
  - `one_hand_blade`: Cuchillo, Machete, Katana, Espada.
  - `one_hand_blunt`: Bate, Baton, ShockBaton, Tubería, Martillo, Cadena, Látigo, Taco.
  - `two_hand_heavy`: Hacha, Motosierra, Silla, Asta.
  - `pistol`: Pistolas, Revólver, Uzi, MachinePistol, FlareGun.
  - `rifle`: Rifles, Escopetas, Francotirador, M60, Bazooka, Lanzallamas, Lazer, Arco.
  - `throwable`: Granada, Molotov, C4, Mina, Béisbol.
- **`gripX`, `gripY`** (normalizado `0..1`): Punto exacto del mango/empuñadura en el sprite del arma. Será el pivote de rotación y anclaje.
- **`foregripX`, `foregripY`** (opcional, `0..1`): Punto de apoyo de la segunda mano en `rifle` y `two_hand_heavy`.
- **`drawW`, `drawH`**: Dimensiones proporcionales reales por arma (ej. Cuchillo `18×10`, Pistola `20×12`, Katana `38×12`, Rifle `40×16`, Bazooka `46×18`).
- **`idleAngle`**: Ángulo de porte natural en radianes (ej. cuchillo ligeramente inclinado hacia abajo/adelante, katana diagonal, rifle horizontal/ligeramente inclinado).

### Pilar 2: Perfil de Mano Único por Protagonista (`CharacterHandProfile`)
Definir en `src/game/CharacterData.ts` un perfil independiente para `'ninja'`, `'gymrat'` y `'santaclo'` (con fallback seguro para bots):
- **Anclajes por estado de movimiento:**
  - `idle`: `(handX, handY, angle)` + micro-bobbing por `animFrame`.
  - `walk`: tabla/curva por frame de caminata para acompañar el balanceo del brazo de cada personaje.
  - `run`: tabla/curva por frame de carrera (mayor inclinación hacia adelante).
  - `jump` / `fall`: ajuste vertical del brazo en el aire.
  - `crouch`: desplazamiento vertical real (`+14px` a `+16px` según la altura agachada de cada protagonista) para que el arma baje con la mano.
  - `roll`: ocultar arma o pegarla a la espalda rotada durante la voltereta.
  - `knockedDown` / `hitstun`: rotación solidaria con el torso caído.
- **Identidad de mano (`handStyle`) por protagonista:**
  - `ninja`: guante oscuro shinobi (`#1e293b` / borde `#0f172a`, muñequera sutil).
  - `gymrat`: mano piel/vendaje deportivo (`#d99b78` / venda `#e2e8f0`).
  - `santaclo`: guante blanco/crema con puño rojo o piel según pose (`#f8fafc` / borde `#cbd5e1`).
- **Respeto a `hasBuiltInGun`:** Cuando `Gymrat` o `Santa` ejecuten animaciones cuyos spritesheets ya incluyen el arma dibujada (`pistol_shoot`, `rifle_shoot`, etc.), se respeta su sprite original sin duplicar el arma encima; pero en `Idle`, `Walk`, `Run`, `Jump` y `Crouch` sí empuñarán físicamente el arma recogida.

### Pilar 3: Renderizado en 3 Capas + Doble Agarre + Feedback de Recogida
En el nuevo módulo `src/game/WeaponRenderer.ts`:
1. **Capa 1 — Sprite del protagonista:** Se dibuja el frame normal del personaje sin alterar.
2. **Capa 2 — Arma anclada por pivote:**
   - `ctx.translate(handX, handY)`
   - `ctx.rotate(handAngle + weapon.idleAngle)`
   - `ctx.drawImage(wImg, -gripX * drawW, -gripY * drawH, drawW, drawH)`
3. **Capa 3 — Puño envolvente (`drawGripHand`):**
   - Se dibuja la mano/puño con el `handStyle` del protagonista justo sobre `(handX, handY)` (y si `carryPose` es `rifle` o `two_hand_heavy`, también la mano de apoyo sobre `(foregripX, foregripY)` transformado).
   - Esto cierra visualmente los dedos/guante sobre la empuñadura, eliminando el efecto de "arma pegada encima".
4. **Animación de recogida (Pickup Snap):**
   - Al recoger un arma del suelo o cambiar de ranura, un temporizador corto (`6 ticks`) aplica un pop de escala (`1.18 -> 1.0`) y un giro rápido hacia el ángulo de porte, dando sensación táctil de agarrarla al instante.

### Pilar 4: Modo de Calibración en El Gimnasio (Opcional / Debug)
- Flag opcional en modo práctica (`El Gimnasio`) para visualizar el punto de mano del protagonista y el punto `grip` del arma, permitiendo ajustar al píxel cualquier arma para Ninja, Gymrat y Santa sin adivinar coordenadas.

---

## 4. Fases de Implementación

1. **Fase 1 — Contratos y `WeaponRenderer.ts`:**
   Crear `WeaponGripData.ts`, añadir `CharacterHandProfile` por protagonista en `CharacterData.ts` y conectar `WeaponRenderer.ts` en `ArenaCanvas.tsx` reemplazando el `drawImage(wImg, 8, -6, 32, 16)` genérico.
2. **Fase 2 — Puño envolvente (`drawGripHand`), doble agarre y animación de recogida:**
   Implementar la capa de mano/guante personalizada para `ninja`, `gymrat` y `santaclo`, la segunda mano en rifles/armas pesadas, y el tween de 6 ticks al recoger/equipar.
3. **Fase 3 — Calibración fina por protagonista y familia de armas:**
   Ajustar escalas, `gripX/gripY`, `idleAngle` y offsets por estado (`Idle`, `Walk`, `Run`, `Jump`, `Crouch`, `Roll`) de forma independiente para Ninja, Gymrat y Santa.
4. **Fase 4 — Validación:**
   Probar en El Gimnasio recogiendo armas de todas las categorías con los 3 protagonistas y validar `npm run lint` + `npm run build`.
