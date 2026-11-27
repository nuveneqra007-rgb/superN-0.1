// =============================================================
// MobileOrientationGuard.tsx — Aviso de giro horizontal + Fullscreen móvil
// =============================================================

import React, { useEffect } from 'react';
import { Maximize2, RotateCw, Smartphone } from 'lucide-react';
import { useMobileDevice } from '../hooks/useMobileDevice';

interface MobileOrientationGuardProps {
  children: React.ReactNode;
}

export const MobileOrientationGuard: React.FC<MobileOrientationGuardProps> = ({ children }) => {
  const { isMobile, isPortrait, isFullscreen, enterFullscreenLandscape } = useMobileDevice();

  // Al girar a horizontal en móvil, intentar entrar en pantalla completa automáticamente
  useEffect(() => {
    if (isMobile && !isPortrait && !isFullscreen) {
      void enterFullscreenLandscape();
    }
  }, [isMobile, isPortrait, isFullscreen, enterFullscreenLandscape]);

  return (
    <div
      className="relative w-full h-dvh overflow-hidden touch-none"
      onTouchStart={() => {
        if (isMobile && !isPortrait && !isFullscreen) {
          void enterFullscreenLandscape();
        }
      }}
    >
      {children}

      {/* Botón flotante discreto abajo-centro (entre controles) si el navegador bloqueó fullscreen automático */}
      {isMobile && !isPortrait && !isFullscreen && (
        <button
          onClick={() => void enterFullscreenLandscape()}
          className="fixed bottom-1.5 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-1 px-2 py-1 rounded-md bg-black/75 border border-amber-400/60 text-amber-300 text-[9px] font-bold uppercase tracking-wider shadow-lg active:scale-95"
          title="Activar pantalla completa"
        >
          <Maximize2 className="w-3 h-3" />
          <span>FullScreen</span>
        </button>
      )}

      {/* Overlay bloqueante cuando el móvil está en orientación vertical (Portrait) */}
      {isMobile && isPortrait && (
        <div className="fixed inset-0 z-[100] bg-neutral-950/98 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="relative mb-6 flex items-center justify-center">
            <div className="w-24 h-24 rounded-2xl bg-amber-500/10 border-2 border-amber-400/60 flex items-center justify-center shadow-[0_0_35px_rgba(245,158,11,0.25)]">
              <Smartphone className="w-12 h-12 text-amber-300 animate-pulse -rotate-90 transition-transform duration-700" />
            </div>
            <RotateCw className="w-7 h-7 text-cyan-400 absolute -top-2 -right-2 animate-spin" style={{ animationDuration: '4s' }} />
          </div>

          <h2 className="text-xl font-black tracking-wide text-white uppercase mb-2">
            Gira tu teléfono en horizontal
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-xs leading-relaxed mb-5">
            <strong className="text-amber-300">superN</strong> está diseñado para jugarse en modo horizontal (Landscape) con controles estilo PSP en pantalla completa.
          </p>

          <div className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-[11px] font-mono-code text-cyan-300">
            Al girarlo a horizontal se activará la pantalla completa
          </div>
        </div>
      )}
    </div>
  );
};
