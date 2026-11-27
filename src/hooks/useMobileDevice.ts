// =============================================================
// useMobileDevice.ts — Detección de móvil, orientación y fullscreen
// =============================================================

import { useState, useEffect, useCallback } from 'react';

export interface MobileDeviceState {
  isMobile: boolean;
  isPortrait: boolean;
  isFullscreen: boolean;
  viewportWidth: number;
  viewportHeight: number;
  enterFullscreenLandscape: () => Promise<void>;
}

function getViewportSize(): { width: number; height: number } {
  if (typeof window === 'undefined') return { width: 1280, height: 720 };
  const vv = window.visualViewport;
  return {
    width: Math.round(vv ? vv.width : window.innerWidth),
    height: Math.round(vv ? vv.height : window.innerHeight),
  };
}

function detectMobile(): boolean {
  if (typeof window === 'undefined') return false;
  const hasTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const { width, height } = getViewportSize();
  const smallViewport = Math.min(width, height) <= 900;
  return (hasTouch && smallViewport) || coarsePointer;
}

export function useMobileDevice(): MobileDeviceState {
  const [isMobile, setIsMobile] = useState<boolean>(() => detectMobile());
  const [viewport, setViewport] = useState<{ width: number; height: number }>(() => getViewportSize());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() =>
    typeof document !== 'undefined' ? Boolean(document.fullscreenElement) : false
  );

  const isPortrait = viewport.height > viewport.width;

  useEffect(() => {
    const update = () => {
      setIsMobile(detectMobile());
      setViewport(getViewportSize());
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    window.visualViewport?.addEventListener('resize', update);
    document.addEventListener('fullscreenchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      window.visualViewport?.removeEventListener('resize', update);
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
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    enterFullscreenLandscape,
  };
}
