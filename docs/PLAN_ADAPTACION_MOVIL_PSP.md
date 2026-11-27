# Plan Maestro: Adaptación Total para Móvil + Controles Estilo PSP

## 1. Objetivo
Adaptar completamente **superN** para jugar cómodamente en teléfonos móviles en orientación horizontal (**Landscape**), con pantalla completa, selección filtrada exclusivamente a **1 Jugador (vs Bot y Modo Práctica)** y controles táctiles **multi-touch estilo PSP** (Joystick izquierdo + botonera `△`, `□`, `○`, `✕`).

---

## 2. Arquitectura de la Solución

### A. Detección Móvil, Aviso de Giro Horizontal y Pantalla Completa
1. **`index.html`:** configurar `viewport-fit=cover`, `maximum-scale=1.0`, `user-scalable=no` para evitar zoom accidental o desplazamiento durante el combate táctil.
2. **`src/hooks/useMobileDevice.ts`:**
   - Detecta dispositivos táctiles/móviles (`pointer: coarse` / `maxTouchPoints > 0` con tamaño móvil/tablet).
   - Monitorea `resize` y `orientationchange` en tiempo real (`isPortrait`).
   - Expone `requestFullscreenLandscape()` para activar `requestFullscreen()` + `screen.orientation.lock('landscape')` con manejo seguro de permisos del navegador.
3. **`src/components/MobileOrientationGuard.tsx`:**
   - Si `isMobile && isPortrait`: bloquea la vista con un aviso claro y animado pidiendo **girar el teléfono en horizontal**.
   - Al detectar **horizontal (`landscape`)**: intenta entrar automáticamente en pantalla completa (y si el navegador móvil bloqueó la llamada automática sin gesto, activa fullscreen en el primer toque o mediante un banner/botón rápido `PANTALLA COMPLETA`).

### B. Modos Filtrados en Móvil (Solo 1 Jugador)
- En `src/components/ModeSelectScreen.tsx`:
  - Cuando `isMobile === true`, ocultar la opción `2 JUGADORES` (`1v1 Local` / `Cooperativo`), dejando visible únicamente **`1 JUGADOR`** (`DUELO VS BOT (IA)` y `MODO PRÁCTICA (GIMNASIO)`), además de `INSTRUCCIONES` y `CONFIGURACIÓN`.

### C. Controles Virtuales Multi-Touch Estilo PSP (`src/components/MobilePSPControls.tsx`)
- **Multi-touch real con `PointerEvents` (`pointerId` independiente por dedo):** permite mover/apuntar con el pulgar izquierdo mientras se ataca/salta con el derecho simultáneamente.
- **Lado Izquierdo — Joystick Virtual PSP:**
  - Centro muerto (`deadzone` ~20%) para evitar movimientos involuntarios.
  - Izquierda/Derecha: `KeyA` / `KeyD` (caminar); al superar `75%` del radio activa `ShiftLeft` (correr).
  - Arriba: `KeyW` (saltar o graduar mira hacia arriba mientras mantiene `○`).
  - Abajo: `KeyS` (agacharse / bajar de plataforma o graduar mira hacia abajo mientras mantiene `○`).
- **Lado Derecho — Botonera PSP (`△`, `□`, `○`, `✕`) + Auxiliares:**
  - **`□` (Cuadrado):** Ataque Melee (`KeyN`) — saca espada/machete o puños y golpea.
  - **`○` (Círculo):** Disparar / Apuntar (`KeyM`) — pulsación rápida dispara; mantener presionado activa la mira para graduar con el Joystick PSP y dispara al soltar.
  - **`△` (Triángulo):** Granadas (`Comma`) — lanza granada/molotov/C4.
  - **`✕` (Equis):** Saltar (`KeyW`) para combos aéreos rápidos.
  - **`E` (Armero):** visible en Modo Práctica para abrir el Estante de 53 Armas (`KeyE`).
  - **`PAUSA`:** acceso directo al menú de pausa (`Escape`).

### D. Adaptación del Viewport en `ArenaCanvas.tsx`
- En móvil horizontal, ocultar los hints de teclado largos del pie de página, ajustar `FighterBar` compacto arriba y escalar el `<canvas>` a `h-dvh w-screen` para aprovechar toda la pantalla.
