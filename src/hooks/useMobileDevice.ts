// =============================================================
// useMobileDevice.ts — Detección de móvil, orientación y fullscreen
// =============================================================

import { useState, useEffect, useCallback } from 'react';

export interface MobileDeviceState {
  isMobile: boolean;
  isPortrait: boolean;
  isFullscreen: boolean;
  enterFullscreenLandscape: () => Promise<void>;
}

function detectMobile(): boolean {
  if (typeof window === 'undefined') return false;
  const hasTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const smallViewport = Math.min(window.innerWidth, window.innerHeight) <= 900;
  return (hasTouch && smallViewport) || coarsePointer;
}

export function useMobileDevice(): MobileDeviceState {
  const [isMobile, setIsMobile] = useState<boolean>(() => detectMobile());
  const [isPortrait, setIsPortrait] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : false
  );
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() =>
    typeof document !== 'undefined' ? Boolean(document.fullscreenElement) : false
  );

  useEffect(() => {
    const update = () => {
      setIsMobile(detectMobile());
      setIsPortrait(window.innerHeight > window.innerWidth);
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    document.addEventListener('fullscreenchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      document.removeEventListener('fullscreenchange', update);
    };
  }, []);

  const enterFullscreenLandscape = useCallback(async () => {
    try {
      const docEl = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
      };
      if (!document.fullscreenElement) {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        }
      }
      const orientation = screen.orientation as ScreenOrientation & {
        lock?: (type: string) => Promise<void>;
      };
      if (orientation && typeof orientation.lock === 'function') {
        await orientation.lock('landscape').catch(() => {});
      }
    } catch {
      // Navegadores móviles (ej. iOS Safari) pueden restringir requestFullscreen sin gesto directo
    }
  }, []);

  return {
    isMobile,
    isPortrait,
    isFullscreen,
    enterFullscreenLandscape,
  };
}
