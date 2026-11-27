# Plan Maestro: Optimización de Rendimiento Inicial y Adaptación Total a Resolución Móvil

## Diagnóstico Real (Observado en código y capturas de dispositivo móvil)

1. **Lagueo / frisado severo en Pantalla Inicial (`LandingScreen.tsx` + `Warehouse3DCanvas.tsx`)**:
   - La portada monta `Warehouse3DCanvas` (escena WebGL Three.js PBR con `RoomEnvironment` PMREM, mapa de sombras `1024x1024`, 6 luces dinámicas con flicker, texturas procedurales con anisotropía, 260 partículas de lluvia, 120 motas de polvo y loop continuo `requestAnimationFrame`), además de un segundo loop `requestAnimationFrame` en `LandingScreen` para parallax de ratón y doble filtro `drop-shadow` sobre el SVG del título.
   - En GPUs móviles esto produce caída drástica de FPS y bloqueo táctil al abrir la app.

2. **Desajuste visual en Arena y Controles PSP en Móvil Horizontal (Imágenes 1 y 2)**:
   - El botón flotante `PAUSA` + `ARMAS (E)` de `MobilePSPControls` (`top-2 left-2`) se superpone al texto del HUD superior (`EL GIMNASIO | RONDA 1`).
   - Existe un botón `PAUSA (ESC)` duplicado en la barra superior de `ArenaCanvas`.
   - La barra superior + `FighterBar` ocupan demasiado alto vertical, reduciendo el `<canvas>` 16:9 al centro y generando franjas negras amplias a ambos lados.
   - El botón `[ MOSTRAR GUÍA TUTORIAL (H) ]` es desproporcionado sobre el canvas en pantallas móviles.

3. **Desbordamiento de Modales y Menús en Landscape Móvil (Imagen 3)**:
   - El modal `PARTIDA EN PAUSA` se recorta verticalmente arriba y abajo sin scroll interno ni distribución compacta.
   - `ModeSelectScreen` usa `flex-col` debajo de `768px`, apilando columnas en pantallas landscape de poca altura (~360–420 px).
   - `WorldSelectScreen` usa `grid-cols-1 md:grid-cols-3`, apilando los 3 mundos verticalmente en teléfonos con ancho < 768 px en lugar de aprovechar el formato apaisado.

---

## Arquitectura de Solución

### Fase 1: Portada Ligera y Fluida en Móvil (`LandingScreen.tsx`)
- Detectar `isMobile` mediante `useMobileDevice()`.
- En móvil, omitir el montaje de `Warehouse3DCanvas` (WebGL 3D PBR) y renderizar directamente el fondo ligero `/assets/backgrounds/warehouse.jpg` con viñeta CSS simple (sin capas ni blur costosos).
- Desactivar el loop `requestAnimationFrame` de micro-parallax de ratón cuando `isMobile === true`.
- Usar `h-dvh` en lugar de `h-screen` para respetar barras del navegador móvil.

### Fase 2: Arena Fullscreen, HUD Compacto y Controles PSP sin Colisiones (`ArenaCanvas.tsx`, `FighterBar.tsx`, `MobilePSPControls.tsx`)
- **FighterBar (`FighterBar.tsx`)**: Agregar soporte `compactMobile?: boolean` (o estilos responsivos compactos en alturas/pantallas móviles) que reduzca retratos, barras de HP y cajas de ranura (`[N]`, `[M]`, `[,]`) para ocupar ~42 px de alto sin desbordar.
- **ArenaCanvas (`ArenaCanvas.tsx`)**:
  - En móvil (`isMobile`), eliminar paddings innecesarios (`p-0`), ocultar el botón redundante `PAUSA (ESC)` de la derecha (ya existe en el HUD táctil PSP) y compactar el título de ronda/modo en una franja mínima arriba.
  - Hacer que el contenedor del `<canvas>` use `flex-1 min-h-0 w-full flex items-center justify-center` y el `<canvas>` use `max-w-full max-h-full w-auto h-auto aspect-[16/9]`, maximizando la arena en pantallas horizontales.
  - Reducir el tamaño del botón flotante `[ GUÍA ]` y del cuadro tutorial en móvil para no tapar al jugador ni los controles.
- **MobilePSPControls (`MobilePSPControls.tsx`)**:
  - Reubicar los accesos rápidos `PAUSA` y `ARMAS (E)` arriba a la **derecha** (`top-1.5 right-2`) o en zona libre sin tapar el título ni el HUD izquierdo del jugador.
  - Ajustar tamaño y márgenes del joystick (`w-28 h-28`) y botonera (`w-36 h-36`) para que resulten cómodos y no tapen la parte central de combate.

### Fase 3: Adaptación de Modales de Pausa y Menús de Selección a Móvil Horizontal
- **Modales en `ArenaCanvas.tsx`** (`PARTIDA EN PAUSA`, `GUÍA DE CONTROLES`, confirmación de salida, fin de partida):
  - Envolver el panel en `max-h-[90dvh] overflow-y-auto`, con padding compacto (`p-3 sm:p-6`), botones en grid de 2 columnas en móvil para opciones de práctica y textos claros adaptados a táctil.
- **Menús de navegación (`ModeSelectScreen.tsx`, `MainMenu.tsx`, `WorldSelectScreen.tsx`)**:
  - Usar `h-dvh` y distribuciones horizontales (`flex-row` / `grid-cols-3`) pensadas para landscape desde `sm`/móvil horizontal, asegurando cero recortes verticales en resoluciones como `667x375` o `844x390`.

---

## Criterios de Aceptación
- `LandingScreen` carga de forma inmediata sin congelamientos en móvil.
- En modo práctica y combate en móvil horizontal: cero superposición entre `PAUSA`/`ARMAS` y el HUD; `<canvas>` ocupa todo el alto útil restante; `FighterBar` legible y sin cortes.
- Todos los botones del modal `PARTIDA EN PAUSA` visibles y accesibles sin cortes en móvil horizontal.
- `npm run lint` y `npm run build` pasan con 0 errores.
