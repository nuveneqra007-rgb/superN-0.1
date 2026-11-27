# Plan de Mejora: Arsenal de Armas Responsivo (Modo Práctica y Menú Principal)

## 1. Diagnóstico del Problema Actual
1. **Modal atrapado en el contenedor del `<canvas>` (`ArenaCanvas.tsx` línea 11159):**
   - El modal del Estante de Armas (`showPracticeArsenal`) usa `absolute inset-0` dentro del contenedor del juego (`max-h-[75vh]` / `aspect-[16/9]`) con un hijo `h-[85vh]`, provocando que el modal sea más alto que su contenedor y se corte/desborde hacia abajo.
2. **Tarjetas demasiado altas en `ArsenalView.tsx`:**
   - Cada tarjeta mide ~165 px de alto en grilla de 2–4 columnas, lo que obliga a ~14–26 filas (~2,300+ px de altura total) para mostrar las 53 armas.
3. **Layout vertical roto en resoluciones `< 1024px` (`lg`):**
   - `grid-cols-1 lg:grid-cols-12` apila el panel lateral de detalles completo encima de la galería en ventanas medianas/pequeñas, dejando sin espacio visible a la grilla de armas.

---

## 2. Solución Propuesta

### Pilar 1: Contenedor `fixed` Adaptado al Viewport (`ArenaCanvas.tsx` y `ArsenalView.tsx`)
- Cambiar el modal de práctica a **`fixed inset-0 z-50 p-2 sm:p-4 flex items-center justify-center`** con un panel de **`w-full max-w-6xl h-[92dvh] max-h-[92dvh]`** para que nunca dependa ni se recorte por la altura del `<canvas>`.
- Asegurar que el contenedor raíz de `ArsenalView.tsx` use `h-full max-h-dvh overflow-hidden flex flex-col` para que tanto en el Menú Principal como en Modo Práctica encaje al 100% en cualquier pantalla (`720p`, `900p`, `1080p` o móvil).

### Pilar 2: Grilla Compacta de Alta Densidad para las 53 Armas
- Rediseñar las tarjetas de arma en un **formato compacto y legible** (~82 px de alto):
  - Miniatura pixel-art centrada + badge de munición/melee en esquina + nombre en 1 línea + pill de daño.
  - Grilla densa: `grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-2`.
  - Con 5–6 columnas y tarjetas de ~82 px, **30 a 42 armas se ven simultáneamente sin scroll** y las 53 armas caben cómodamente con un desplazamiento mínimo, manteniendo un scroll suave interno (`overflow-y-auto min-h-0`).

### Pilar 3: Panel de Detalle Fijado sin Aplastar la Grilla
- **En escritorio (`lg+`):** Split horizontal `lg:grid-cols-12` (panel izquierdo `lg:col-span-4` con stats + botón **"EQUIPAR ARMA"** fijado abajo; galería derecha `lg:col-span-8` con `min-h-0 overflow-y-auto`).
- **En pantallas `< lg`:** Reemplazar el `<aside>` apilado gigante por una **barra inferior compacta (`shrink-0`)** con miniatura, nombre, daño/alcance, botón de probar sonido y botón **"EQUIPAR ARMA"** siempre visible sin robar espacio a las armas.

---

## 3. Fases de Implementación
1. **Fase 1:** Corregir el posicionamiento `fixed inset-0` del modal en `ArenaCanvas.tsx` y la jerarquía `flex-1 min-h-0` de `ArsenalView.tsx`.
2. **Fase 2:** Implementar la grilla compacta de 5–6 columnas en `ArsenalView.tsx` y el panel inferior compacto para pantallas `< lg` (manteniendo el panel lateral en `lg+`).
3. **Fase 3:** Verificar en distintas resoluciones y validar `npm run lint` + `npm run build` + subida a GitHub.
