// =============================================================
// WorldSelectScreen.tsx — Pantalla de selección de escenario
// Grilla de 3 mundos jugables con mecánicas diferenciadas
// =============================================================

import React from 'react';
import { ArrowLeft, Play, CheckCircle2, ShieldAlert, Sparkles, Box, Flame, Cog } from 'lucide-react';
import { WORLDS, WorldConfig } from '../game/WorldData';
import { sounds } from '../game/SoundEffects';

interface WorldSelectScreenProps {
  selectedWorldId: string | null;
  onSelectWorld: (worldId: string) => void;
  onStartGame: () => void;
  onBackToSelect: () => void;
  playerFactionName: string;
  botFactionName: string;
  rounds: number;
}

interface WorldThumbnailProps {
  worldId: string;
  previewUrl: string;
  alt: string;
  isSelected: boolean;
  subtitle: string;
}

const WorldThumbnail: React.FC<WorldThumbnailProps> = ({
  worldId,
  previewUrl,
  alt,
  isSelected,
  subtitle,
}) => {
  const [croppedUrl, setCroppedUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Si no requiere recorte (Arena Clásica o las 6 nuevas arenas de combate), usamos la imagen directa
    if (worldId !== 'desert' && worldId !== 'industrial') {
      setCroppedUrl(previewUrl);
      return;
    }

    // Desierto: recortar 33% superior para eliminar "FREE DESERT PLATFORMER TILESET"
    // Zona Industrial: recortar 31% superior para eliminar "INDUSTRIAL ZONE"
    const cropTopPercent = worldId === 'desert' ? 0.33 : 0.31;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = previewUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const targetWidth = 640;
        const targetHeight = 360; // Proporción exacta 16:9
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setCroppedUrl(previewUrl);
          return;
        }

        const sy = img.naturalHeight * cropTopPercent;
        const sh = img.naturalHeight * (1 - cropTopPercent);
        const sw = img.naturalWidth;
        const sx = 0;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
        setCroppedUrl(canvas.toDataURL('image/png'));
      } catch {
        setCroppedUrl(previewUrl);
      }
    };
    img.onerror = () => {
      setCroppedUrl(previewUrl);
    };
  }, [worldId, previewUrl]);

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-neutral-800 bg-black mb-3.5 shadow-inner">
      {croppedUrl ? (
        <img
          src={croppedUrl}
          alt={alt}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isSelected ? 'scale-105' : 'group-hover:scale-102 opacity-85 group-hover:opacity-100'
          }`}
        />
      ) : (
        <div className="w-full h-full overflow-hidden bg-neutral-900 flex items-end">
          <img
            src={previewUrl}
            alt={alt}
            style={
              worldId === 'desert'
                ? { transform: 'scale(1.5) translateY(18%)', transformOrigin: 'center bottom' }
                : worldId === 'industrial'
                ? { transform: 'scale(1.45) translateY(16%)', transformOrigin: 'center bottom' }
                : undefined
            }
            className={`w-full h-full object-cover object-bottom transition-transform duration-500 ${
              isSelected ? 'scale-105' : 'group-hover:scale-102 opacity-85 group-hover:opacity-100'
            }`}
          />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent pointer-events-none" />
      <span className="absolute bottom-2 left-2 text-[10px] font-mono-code font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-950/90 border border-neutral-700/80 text-cyan-300 pointer-events-none">
        {subtitle}
      </span>
    </div>
  );
};

export const WorldSelectScreen: React.FC<WorldSelectScreenProps> = ({
  selectedWorldId,
  onSelectWorld,
  onStartGame,
  onBackToSelect,
  playerFactionName,
  botFactionName,
  rounds,
}) => {
  const selectedWorld = WORLDS.find((w) => w.id === selectedWorldId);

  const handleSelect = (world: WorldConfig) => {
    sounds.playPickup();
    onSelectWorld(world.id);
  };

  const handleStart = () => {
    if (!selectedWorldId) return;
    sounds.playPickup();
    onStartGame();
  };

  const getWorldIcon = (id: string) => {
    switch (id) {
      case 'desert':
        return <Box className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'industrial':
        return <Flame className="w-4 h-4 text-orange-400 shrink-0" />;
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
  };

  return (
    <div className="relative w-full h-screen flex flex-col justify-between items-center bg-neutral-950 text-neutral-100 overflow-y-auto p-4 select-none">
      {/* Fondo ambiental */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-950/40 via-neutral-950 to-neutral-950 -z-10 pointer-events-none" />

      {/* Barra superior con Volver y resumen de match */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-3 px-1">
        <button
          onClick={() => {
            sounds.playPickup();
            onBackToSelect();
          }}
          className="flex items-center gap-1.5 px-4 min-h-[48px] bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-xl text-xs sm:text-sm font-bold text-neutral-300 hover:text-white transition shadow-sm cursor-pointer touch-manipulation"
          title="Volver a la selección de combatientes"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Volver</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono-code text-neutral-400 bg-neutral-900/80 border border-neutral-800 px-3 py-2 rounded-xl">
          <span className="text-cyan-300 font-bold">{playerFactionName}</span>
          <span className="text-neutral-500 font-bold">VS</span>
          <span className="text-rose-400 font-bold">{botFactionName}</span>
          <span className="text-neutral-600 hidden sm:inline">•</span>
          <span className="text-amber-300 hidden sm:inline">{rounds} Rondas</span>
        </div>
      </div>

      {/* Encabezado Principal */}
      <div className="text-center my-2">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-sky-400 via-cyan-200 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          ELIGE TU MUNDO
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-neutral-400 tracking-wide font-medium">
          Selecciona el campo de batalla táctico para la contienda
        </p>
      </div>

      {/* Grilla de 3 tarjetas de mundos */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 my-auto py-2">
        {WORLDS.map((world) => {
          const isSelected = world.id === selectedWorldId;
          return (
            <div
              key={world.id}
              onClick={() => handleSelect(world)}
              className={`relative flex flex-col justify-between rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden p-4 group touch-manipulation ${
                isSelected
                  ? 'bg-neutral-900/90 border-cyan-400 ring-2 ring-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.35)] -translate-y-1'
                  : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/90 hover:-translate-y-0.5'
              }`}
            >
              {/* Checkmark de selección */}
              {isSelected && (
                <div className="absolute top-3 right-3 z-10 bg-cyan-500 text-neutral-950 rounded-full p-1 shadow-lg animate-bounce-short">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                </div>
              )}

              {/* Miniatura del mundo recortada sin textos intrusivos */}
              <WorldThumbnail
                worldId={world.id}
                previewUrl={world.preview}
                alt={world.name}
                isSelected={isSelected}
                subtitle={world.subtitle}
              />

              {/* Título y etiqueta de mecánica */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors">
                    {world.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-bold py-1 px-2.5 rounded-lg mb-2.5 bg-neutral-950/80 border border-neutral-800 text-cyan-300">
                  {getWorldIcon(world.id)}
                  <span className="truncate">{world.mechanicLabel}</span>
                </div>

                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-3">
                  {world.description}
                </p>
              </div>

              {/* Caja informativa de mecánicas específicas */}
              <div className="p-2.5 bg-neutral-950/60 border border-neutral-800/80 rounded-xl text-[11px] text-neutral-400 leading-snug">
                <span className="font-bold text-neutral-300 block mb-0.5">Mecánica clave:</span>
                {world.mechanicsDescription}
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón de confirmación ¡ENTRAR A LA ARENA! */}
      <div className="w-full max-w-5xl mt-3 flex flex-col items-center">
        <button
          onClick={handleStart}
          disabled={!selectedWorldId}
          className={`w-full max-w-md min-h-[48px] h-14 py-3.5 px-6 font-black text-base sm:text-lg tracking-wider uppercase rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 touch-manipulation ${
            selectedWorldId
              ? 'bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-neutral-950 shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.65)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
              : 'bg-neutral-900 border border-neutral-800 text-neutral-500 cursor-not-allowed opacity-50'
          }`}
        >
          <Play className="w-5 h-5 fill-current shrink-0" />
          <span>¡ENTRAR A LA ARENA!</span>
        </button>

        <span className="text-[11px] font-mono-code text-neutral-500 mt-2">
          {selectedWorldId
            ? `Listo para combatir en: ${selectedWorld?.name}`
            : 'Selecciona uno de los 3 mundos arriba para continuar'}
        </span>
      </div>
    </div>
  );
};
