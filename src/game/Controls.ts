// =============================================================
// Controls.ts — Fuente de Verdad para Controles de superN
// Basado en GDD v3 (Decisiones D1 y D2)
// Usa KeyboardEvent.code (independiente del layout de teclado)
// con compatibilidad hacia atrás para event.key en minúsculas.
// =============================================================

export interface ControlBinding {
  left: string[];
  right: string[];
  up: string[];
  down: string[];
  run: string[];
  melee: string[];
  fire: string[];
  grenade: string[];
}

export const CONTROLS = {
  // Modo 1 Jugador (Solitario / Práctica vs Bot): WASD o Flechas indistintamente
  SOLO: {
    left: ['KeyA', 'ArrowLeft', 'a', 'arrowleft'],
    right: ['KeyD', 'ArrowRight', 'd', 'arrowright'],
    up: ['KeyW', 'ArrowUp', 'Space', 'w', 'arrowup', ' '],
    down: ['KeyS', 'ArrowDown', 's', 'arrowdown'],
    run: ['ShiftLeft', 'ShiftRight', 'KeyQ', 'Period', 'shift', 'q', '.'],
    melee: ['KeyN', 'KeyF', 'KeyJ', 'n', 'f', 'j'],
    fire: ['KeyM', 'KeyG', 'KeyK', 'm', 'g', 'k'],
    grenade: ['Comma', 'KeyH', 'KeyL', ',', 'comma', 'h', 'l'],
  } as ControlBinding,

  // Modo 1v1 Local — Jugador 1 (WASD + F / G / H)
  LOCAL_1V1_P1: {
    left: ['KeyA', 'a'],
    right: ['KeyD', 'd'],
    up: ['KeyW', 'Space', 'w', ' '],
    down: ['KeyS', 's'],
    run: ['ShiftLeft', 'KeyQ', 'shift', 'q'],
    melee: ['KeyF', 'f'],
    fire: ['KeyG', 'g'],
    grenade: ['KeyH', 'h'],
  } as ControlBinding,

  // Modo 1v1 Local — Jugador 2 (Flechas + N / M / Coma)
  LOCAL_1V1_P2: {
    left: ['ArrowLeft', 'arrowleft'],
    right: ['ArrowRight', 'arrowright'],
    up: ['ArrowUp', 'arrowup'],
    down: ['ArrowDown', 'arrowdown'],
    run: ['Period', 'Slash', '.', '/'],
    melee: ['KeyN', 'n'],
    fire: ['KeyM', 'm'],
    grenade: ['Comma', ',', 'comma'],
  } as ControlBinding,
} as const;

/**
 * Textos canónicos para HUD, Pantallas de selección y Menú de Pausa
 */
export const CONTROLS_TEXT = {
  SOLO_TITLE: '1 JUGADOR (VS BOT)',
  SOLO_MOVE: 'WASD o Flechas',
  SOLO_ACTIONS: 'N (Melee) · M (Disparo) · , (Granada)',
  SOLO_FULL: 'WASD o Flechas · N (Melee) · M (Disparo) · , (Granada)',

  P1_1V1_TITLE: 'JUGADOR 1 (1v1)',
  P1_1V1_MOVE: 'WASD',
  P1_1V1_ACTIONS: 'F (Melee) · G (Disparo) · H (Granada)',
  P1_1V1_FULL: 'WASD · F (Melee) · G (Disparo) · H (Granada)',

  P2_1V1_TITLE: 'JUGADOR 2 (1v1)',
  P2_1V1_MOVE: 'FLECHAS',
  P2_1V1_ACTIONS: 'N (Melee) · M (Disparo) · , (Granada)',
  P2_1V1_FULL: 'FLECHAS · N (Melee) · M (Disparo) · , (Granada)',

  ROLL_HINT: 'Abajo + Dirección = Rodar (invulnerable ~0.24s)',
  PAUSE_HINT: 'ESC = Menú de Pausa',
};

/**
 * Comprueba si al menos una de las teclas configuradas está presionada.
 */
export function isAnyPressed(
  keys: Record<string, boolean>,
  bindings: readonly string[] | string[]
): boolean {
  for (let i = 0; i < bindings.length; i++) {
    if (keys[bindings[i]]) return true;
  }
  return false;
}
