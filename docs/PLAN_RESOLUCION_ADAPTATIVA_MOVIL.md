# Plan: Resolución Especial y Adaptación Exacta por Dispositivo Móvil

## Diagnóstico (Basado en código y capturas de 1 vs Bot en móvil)

1. **Pantalla de configuración `1 vs Bot` (`MainMenu.tsx`)**:
   - La tarjeta de `PLAYER 1` se corta en su mitad superior debajo del encabezado y los controles inferiores (`NUMBER OF BOTS` y `ACCEPT`) se recortan abajo porque apila elementos verticalmente asumiendo alturas de escritorio (>700 px), cuando en móvil horizontal la altura real ronda **340–430 px** aunque el ancho supere `768 px` (disparando clases `md:` como el footer de teclado).

2. **Modal de inicio rápido (`MatchSetupModal.tsx`)**:
   - Su vista previa (`h-36 sm:h-40`) más las 4 filas apiladas y el pie de teclas superan los 420 px de alto, cortando la caja superior y las opciones inferiores en teléfonos horizontales.

3. **Viewport de combate en móvil (`ArenaCanvas.tsx`)**:
   - El `<canvas>` está fijado a `960x540` (`16:9`) con `object-contain`. En teléfonos apaisados modernos (`19.5:9` o `20:9`, p. ej. `844x390`), deja amplias franjas negras laterales y reduce la escala visual de personajes, armas y proyectiles.

---

## Arquitectura de Solución

### Fase 1: Medición Real de Viewport en `useMobileDevice.ts` y Contenedor Adaptativo Exacto
- Ampliar `useMobileDevice()` para exponer `viewportWidth` y `viewportHeight` reactivos (`window.innerWidth/innerHeight` + `visualViewport`).
- Crear un wrapper ligero reutilizable o utilidad de escala exacta (`MobileResponsiveStage.tsx`) que ajuste el diseño exactamente al tamaño de pantalla del móvil actual sin cortes ni desbordamientos.

### Fase 2: Rediseño Landscape & Escala Exacta para `1 vs Bot` (`MainMenu.tsx` y `MatchSetupModal.tsx`)
- **`MainMenu.tsx`**:
  - Cuando `isMobile` es true, ocultar siempre el `footer` de atajos de teclado de escritorio (evitando dependencia engañosa de `md:` en teléfonos anchos).
  - En modo `1 vs Bot`, distribuir la pantalla en horizontal (2 columnas equilibradas que caben en ~340 px de alto) con auto-ajuste proporcional al viewport del móvil:
    - Columna izquierda: tarjeta `PLAYER 1`, selector `BOTS (1-5)` y botón `ACCEPT / SELECT STAGE`.
    - Columna derecha: grilla horizontal `COM 1 .. COM 5` compacta con retratos, facción y dificultad siempre visibles sin cortes.
- **`MatchSetupModal.tsx`**:
  - En `isMobile`, usar un layout horizontal de **2 columnas lado a lado** (izquierda: preview del mapa; derecha: `FIGHT!`, `MAP`, `ROUNDS`, `RESET`) dentro de `max-h-[92dvh]`, eliminando el pie de teclas en móvil para que quepa entero y grande sin ningún recorte.

### Fase 3: Resolución Exacta de Arena + Cámara Inteligente Móvil (`ArenaCanvas.tsx`)
- Medir en tiempo real el contenedor del `<canvas>` en móvil (`viewportSizeRef` con `ResizeObserver`) y adaptar el buffer del `<canvas>` a la resolución exacta del teléfono (`width = Math.round(cw * dpr)`, `height = Math.round(ch * dpr)`, con `dpr = Math.min(window.devicePixelRatio || 1, 2)`).
- Implementar una **cámara 2D adaptativa clamped al mapa (`960x540`)** para móvil (activada por defecto en móvil y conmutable desde el menú de Pausa entre `PANTALLA COMPLETA` y `CLÁSICA 16:9`):
  - En modo `PANTALLA COMPLETA`, calcula `zoom = Math.max(cw / ARENA_WIDTH, (ch / ARENA_HEIGHT) * 1.06)` (llenando todo el ancho real del teléfono sin franjas negras) y sigue suavemente la posición de P1 / combate en vertical y horizontal dentro de los límites `[0..ARENA_WIDTH]` × `[0..ARENA_HEIGHT]`.
  - Mantener `ctx.imageSmoothingEnabled = false` para preservar el pixel art nítido sobre la resolución nativa del teléfono, y corregir el orden de render (HUD de fin de ronda / anuncios y coordenadas limpias).

---

## Verificación
- `npm run lint` (`tsc --noEmit`) y `npm run build` (`tsc && vite build`) deben pasar con 0 errores.
