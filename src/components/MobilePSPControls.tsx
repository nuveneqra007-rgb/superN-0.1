// =============================================================
// MobilePSPControls.tsx — Controles táctiles estilo PSP (Multi-Touch)
// Lado izquierdo: Joystick analógico virtual (caminar, correr, saltar, agacharse, apuntar)
// Lado derecho: Botonera clásica PSP (△ Granada, □ Melee, ○ Disparo/Apunte, ✕ Saltar)
// + Botón E (Armero en Práctica) y Pausa.
// =============================================================

import React, { useRef, useState, useCallback } from 'react';

interface MobilePSPControlsProps {
  onVirtualKey: (code: string, pressed: boolean) => void;
}

export const MobilePSPControls: React.FC<MobilePSPControlsProps> = ({
  onVirtualKey,
}) => {
  const stickBaseRef = useRef<HTMLDivElement>(null);
  const stickPointerIdRef = useRef<number | null>(null);
  const activeStickKeysRef = useRef<Set<string>>(new Set());
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [pressedBtns, setPressedBtns] = useState<Record<string, boolean>>({});

  const updateStickKeys = useCallback(
    (nextKeys: Set<string>) => {
      const prev = activeStickKeysRef.current;
      prev.forEach((k) => {
        if (!nextKeys.has(k)) {
          onVirtualKey(k, false);
        }
      });
      nextKeys.forEach((k) => {
        if (!prev.has(k)) {
          onVirtualKey(k, true);
        }
      });
      activeStickKeysRef.current = nextKeys;
    },
    [onVirtualKey]
  );

  const processStickPosition = useCallback(
    (clientX: number, clientY: number) => {
      const base = stickBaseRef.current;
      if (!base) return;
      const rect = base.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const maxRadius = rect.width * 0.42;

      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist > maxRadius) {
        const scale = maxRadius / dist;
        dx *= scale;
        dy *= scale;
      }

      setKnobPos({ x: dx, y: dy });

      const normX = dx / maxRadius;
      const normY = dy / maxRadius;
      const next = new Set<string>();

      // Eje horizontal (deadzone 0.22, correr > 0.72)
      if (normX < -0.22) {
        next.add('KeyA');
        if (Math.abs(normX) > 0.72) next.add('ShiftLeft');
      } else if (normX > 0.22) {
        next.add('KeyD');
        if (Math.abs(normX) > 0.72) next.add('ShiftLeft');
      }

      // Eje vertical (arriba = saltar/apuntar arriba, abajo = agachar/apuntar abajo)
      if (normY < -0.45) {
        next.add('KeyW');
      } else if (normY > 0.42) {
        next.add('KeyS');
      }

      updateStickKeys(next);
    },
    [updateStickKeys]
  );

  const resetStick = useCallback(() => {
    stickPointerIdRef.current = null;
    setKnobPos({ x: 0, y: 0 });
    updateStickKeys(new Set());
  }, [updateStickKeys]);

  const bindActionButton = (id: string, keyCode: string) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setPressedBtns((prev) => ({ ...prev, [id]: true }));
      onVirtualKey(keyCode, true);
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setPressedBtns((prev) => ({ ...prev, [id]: false }));
      onVirtualKey(keyCode, false);
    },
    onPointerCancel: (e: React.PointerEvent) => {
      e.preventDefault();
      setPressedBtns((prev) => ({ ...prev, [id]: false }));
      onVirtualKey(keyCode, false);
    },
  });

  return (
    <div className="fixed inset-0 z-40 pointer-events-none select-none touch-none">
      {/* LADO IZQUIERDO: Joystick Virtual Estilo PSP */}
      <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 pointer-events-auto">
        <div
          ref={stickBaseRef}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            stickPointerIdRef.current = e.pointerId;
            processStickPosition(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (stickPointerIdRef.current !== e.pointerId) return;
            e.preventDefault();
            processStickPosition(e.clientX, e.clientY);
          }}
          onPointerUp={(e) => {
            if (stickPointerIdRef.current !== e.pointerId) return;
            e.preventDefault();
            resetStick();
          }}
          onPointerCancel={(e) => {
            if (stickPointerIdRef.current !== e.pointerId) return;
            resetStick();
          }}
          className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-neutral-900/45 border-2 border-white/25 shadow-[0_0_16px_rgba(0,0,0,0.6)] flex items-center justify-center touch-none"
        >
          {/* Anillo interior PSP */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/10 pointer-events-none" />

          {/* Knob móvil texturizado PSP */}
          <div
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            }}
            className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-neutral-600/85 to-neutral-900/90 border-2 border-white/40 shadow-[0_4px_10px_rgba(0,0,0,0.8)] flex items-center justify-center pointer-events-none"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-white/15 bg-neutral-800/80" />
          </div>
        </div>
      </div>

      {/* LADO DERECHO: Botonera PSP (△, □, ○, ✕) */}
      <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 w-36 h-36 sm:w-40 sm:h-40 pointer-events-auto">
        {/* △ Triángulo (Arriba) — Granadas */}
        <button
          {...bindActionButton('triangle', 'Comma')}
          aria-label="Granada"
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 sm:w-13 sm:h-13 rounded-full border-2 flex flex-col items-center justify-center transition-transform touch-none ${
            pressedBtns.triangle
              ? 'bg-emerald-500/80 border-emerald-200 scale-90'
              : 'bg-neutral-900/55 border-emerald-400/70'
          } shadow-lg`}
        >
          <span className="text-base font-black text-emerald-300 leading-none">△</span>
          <span className="text-[6px] font-mono-code text-white/75 uppercase">Bomba</span>
        </button>

        {/* □ Cuadrado (Izquierda) — Melee / Espada */}
        <button
          {...bindActionButton('square', 'KeyN')}
          aria-label="Combate Melee"
          className={`absolute top-1/2 left-0 -translate-y-1/2 w-12 h-12 sm:w-13 sm:h-13 rounded-full border-2 flex flex-col items-center justify-center transition-transform touch-none ${
            pressedBtns.square
              ? 'bg-pink-500/80 border-pink-200 scale-90'
              : 'bg-neutral-900/55 border-pink-400/70'
          } shadow-lg`}
        >
          <span className="text-base font-black text-pink-300 leading-none">□</span>
          <span className="text-[6px] font-mono-code text-white/75 uppercase">Melee</span>
        </button>

        {/* ○ Círculo (Derecha) — Disparar / Apuntar */}
        <button
          {...bindActionButton('circle', 'KeyM')}
          aria-label="Disparar o Apuntar"
          className={`absolute top-1/2 right-0 -translate-y-1/2 w-12 h-12 sm:w-13 sm:h-13 rounded-full border-2 flex flex-col items-center justify-center transition-transform touch-none ${
            pressedBtns.circle
              ? 'bg-rose-500/85 border-rose-200 scale-90'
              : 'bg-neutral-900/55 border-rose-400/75'
          } shadow-lg`}
        >
          <span className="text-base font-black text-rose-300 leading-none">○</span>
          <span className="text-[6px] font-mono-code text-white/75 uppercase">Fuego</span>
        </button>

        {/* ✕ Equis (Abajo) — Saltar */}
        <button
          {...bindActionButton('cross', 'KeyW')}
          aria-label="Saltar"
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 sm:w-13 sm:h-13 rounded-full border-2 flex flex-col items-center justify-center transition-transform touch-none ${
            pressedBtns.cross
              ? 'bg-sky-500/85 border-sky-200 scale-90'
              : 'bg-neutral-900/55 border-sky-400/75'
          } shadow-lg`}
        >
          <span className="text-base font-black text-sky-300 leading-none">✕</span>
          <span className="text-[6px] font-mono-code text-white/75 uppercase">Salto</span>
        </button>
      </div>
    </div>
  );
};
