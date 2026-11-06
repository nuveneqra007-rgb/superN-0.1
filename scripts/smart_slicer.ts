// ==============================================================================
// smart_slicer.js — Herramienta de Slicing Inteligente para superN (Fase 1)
// Detecta los límites reales de cada frame por transparencia (bounding boxes),
// calcula anclajes exactos en los pies (anchor), exporta frameMeta.json
// y genera un contact sheet visual (HTML interactivo y verificación gráfica).
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

export interface FrameMetaData {
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  anchorX: number; // Offset dentro del frame hasta el centro horizontal (pies)
  anchorY: number; // Offset dentro del frame hasta el suelo (pies)
  cellX: number;
  cellY: number;
  cellW: number;
  cellH: number;
  groundY: number; // Coordenada Y absoluta del suelo en el spritesheet
  centerX: number; // Coordenada X absoluta del centro en el spritesheet
  phase?: 'windup' | 'active' | 'recovery';
  durationTicks?: number;
}

export interface SheetMetaData {
  id: string;
  image: string;
  cols: number;
  rows: number;
  totalFrames: number;
  width: number;
  height: number;
  hitFrame?: number;
  releaseFrame?: number;
  frames: FrameMetaData[];
  frameDurations?: number[];
}

export interface SheetDefinition {
  id: string;
  file: string;
  cols: number;
  rows: number;
  totalFrames: number;
  framesPerRow?: number[];
  hitFrame?: number;
  releaseFrame?: number;
  // Duraciones estándar de ticks por frame [windup..., active..., recovery...]
  frameDurations?: number[];
  phases?: ('windup' | 'active' | 'recovery')[];
}

export const SHEETS_TO_PROCESS: SheetDefinition[] = [
  // ── NINJA ──
  {
    id: 'ninja_walk',
    file: 'public/assets/sprites/player/ninja_walk.png',
    cols: 6,
    rows: 1,
    totalFrames: 6,
    frameDurations: [4, 4, 4, 4, 4, 4],
  },
  {
    id: 'ninja_run',
    file: 'public/assets/sprites/player/ninja_run.png',
    cols: 6,
    rows: 1,
    totalFrames: 6,
    frameDurations: [3, 3, 3, 3, 3, 3],
  },
  {
    id: 'ninja_jump',
    file: 'public/assets/sprites/player/ninja_jump.png',
    cols: 3,
    rows: 2,
    totalFrames: 6,
    frameDurations: [4, 4, 5, 5, 4, 4],
  },
  {
    id: 'ninja_roll',
    file: 'public/assets/sprites/player/ninja_roll.png',
    cols: 7,
    rows: 1,
    totalFrames: 7,
    frameDurations: [2, 2, 2, 2, 2, 2, 3],
  },
  {
    id: 'ninja_melee',
    file: 'public/assets/sprites/player/ninja_melee.png',
    cols: 6,
    rows: 3,
    totalFrames: 18,
    framesPerRow: [6, 6, 6],
    hitFrame: 2,
    frameDurations: [2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 4, 4],
  },
  {
    id: 'ninja_one_hand_attack',
    file: 'public/assets/sprites/player/one_hand_attack.png',
    cols: 5,
    rows: 1,
    totalFrames: 5,
    hitFrame: 2,
    // Ataque rápido con filo: viento rápido (1 tick), golpe activo (2 ticks), recuperación (3 ticks)
    frameDurations: [2, 2, 2, 3, 3],
    phases: ['windup', 'windup', 'active', 'recovery', 'recovery'],
  },
  {
    id: 'ninja_two_hand_attack',
    file: 'public/assets/sprites/player/two_hand_attack.png',
    cols: 6,
    rows: 1,
    totalFrames: 6,
    hitFrame: 3,
    frameDurations: [3, 3, 2, 2, 4, 4],
    phases: ['windup', 'windup', 'windup', 'active', 'recovery', 'recovery'],
  },
  {
    id: 'ninja_pistol_shoot',
    file: 'public/assets/sprites/player/pistol_shoot.png',
    cols: 4,
    rows: 1,
    totalFrames: 4,
    frameDurations: [2, 1, 2, 3],
  },
  {
    id: 'ninja_rifle_shoot',
    file: 'public/assets/sprites/player/rifle_shoot.png',
    cols: 4,
    rows: 1,
    totalFrames: 4,
    frameDurations: [2, 1, 3, 3],
  },
  {
    id: 'ninja_throw_up',
    file: 'public/assets/sprites/player/throw_up.png',
    cols: 5,
    rows: 1,
    totalFrames: 5,
    releaseFrame: 2,
    frameDurations: [3, 3, 2, 3, 4],
  },

  // ── GYMRAT ──
  {
    id: 'gymrat_walk',
    file: 'public/assets/sprites/player/gymrat_walk.png',
    cols: 6,
    rows: 1,
    totalFrames: 6,
    frameDurations: [5, 5, 5, 5, 5, 5],
  },
  {
    id: 'gymrat_run',
    file: 'public/assets/sprites/player/gymrat_run.png',
    cols: 6,
    rows: 1,
    totalFrames: 6,
    frameDurations: [3, 3, 3, 3, 3, 3],
  },
  {
    id: 'gymrat_jump',
    file: 'public/assets/sprites/player/gymrat_jump.png',
    cols: 6,
    rows: 1,
    totalFrames: 6,
    frameDurations: [4, 4, 5, 5, 4, 4],
  },
  {
    id: 'gymrat_roll',
    file: 'public/assets/sprites/player/gymrat_roll.png',
    cols: 6,
    rows: 1,
    totalFrames: 6,
    frameDurations: [3, 2, 2, 2, 3, 3],
  },
  {
    id: 'gymrat_melee',
    file: 'public/assets/sprites/player/gymrat_melee.png',
    cols: 6,
    rows: 1,
    totalFrames: 6,
    hitFrame: 1,
    frameDurations: [3, 2, 2, 3, 4, 4],
  },
  {
    id: 'gymrat_one_hand_attack',
    file: 'public/assets/sprites/player/gymrat_one_hand_attack.png',
    cols: 5,
    rows: 1,
    totalFrames: 5,
    hitFrame: 2,
    frameDurations: [3, 2, 2, 4, 4],
    phases: ['windup', 'windup', 'active', 'recovery', 'recovery'],
  },
  {
    id: 'gymrat_two_hand_attack',
    file: 'public/assets/sprites/player/gymrat_two_hand_attack.png',
    cols: 6,
    rows: 1,
    totalFrames: 6,
    hitFrame: 3,
    frameDurations: [4, 4, 3, 2, 5, 5],
    phases: ['windup', 'windup', 'windup', 'active', 'recovery', 'recovery'],
  },
  {
    id: 'gymrat_pistol_shoot',
    file: 'public/assets/sprites/player/gymrat_pistol_shoot.png',
    cols: 4,
    rows: 1,
    totalFrames: 4,
    frameDurations: [2, 1, 3, 3],
  },
  {
    id: 'gymrat_rifle_shoot',
    file: 'public/assets/sprites/player/gymrat_rifle_shoot.png',
    cols: 4,
    rows: 1,
    totalFrames: 4,
    frameDurations: [2, 1, 3, 4],
  },
  {
    id: 'gymrat_throw_up',
    file: 'public/assets/sprites/player/gymrat_throw_up.png',
    cols: 5,
    rows: 1,
    totalFrames: 5,
    releaseFrame: 2,
    frameDurations: [3, 3, 2, 4, 4],
  },

  // ── SANTA CLAUS ──
  {
    id: 'santaclo_walk',
    file: 'public/assets/sprites/player/santaclo_walk.png',
    cols: 6,
    rows: 1,
    totalFrames: 6,
    frameDurations: [5, 5, 5, 5, 5, 5],
  },
  {
    id: 'santaclo_run',
    file: 'public/assets/sprites/player/santaclo_run.png',
    cols: 6,
    rows: 1,
    totalFrames: 6,
    frameDurations: [3, 3, 3, 3, 3, 3],
  },
  {
    id: 'santaclo_jump',
    file: 'public/assets/sprites/player/santaclo_jump.png',
    cols: 6,
    rows: 1,
    totalFrames: 6,
    frameDurations: [4, 4, 5, 5, 4, 4],
  },
  {
    id: 'santaclo_roll',
    file: 'public/assets/sprites/player/santaclo_roll.png',
    cols: 6,
    rows: 1,
    totalFrames: 6,
    frameDurations: [3, 2, 2, 2, 3, 3],
  },
  {
    id: 'santaclo_melee',
    file: 'public/assets/sprites/player/santaclo_melee.png',
    cols: 5,
    rows: 1,
    totalFrames: 5,
    hitFrame: 2,
    frameDurations: [4, 3, 2, 4, 5],
    phases: ['windup', 'windup', 'active', 'recovery', 'recovery'],
  },
  {
    id: 'santaclo_one_hand_attack',
    file: 'public/assets/sprites/player/santaclo_one_hand_attack.png',
    cols: 5,
    rows: 1,
    totalFrames: 5,
    hitFrame: 2,
    frameDurations: [4, 3, 2, 4, 5],
    phases: ['windup', 'windup', 'active', 'recovery', 'recovery'],
  },
  {
    id: 'santaclo_two_hand_attack',
    file: 'public/assets/sprites/player/santaclo_two_hand_attack.png',
    cols: 5,
    rows: 1,
    totalFrames: 5,
    hitFrame: 3,
    // Ataque pesado de Santa con saco: windup prolongado, golpe demoledor, y recovery pesado
    frameDurations: [5, 5, 4, 2, 6],
    phases: ['windup', 'windup', 'windup', 'active', 'recovery'],
  },
  {
    id: 'santaclo_pistol_shoot',
    file: 'public/assets/sprites/player/santaclo_pistol_shoot.png',
    cols: 4,
    rows: 1,
    totalFrames: 4,
    hitFrame: 1, // Frame 2 (0-indexed 1): disparo y fogonazo
    frameDurations: [2, 1, 3, 3],
    phases: ['windup', 'active', 'recovery', 'recovery'],
  },
  {
    id: 'santaclo_one_hand_shoot',
    file: 'public/assets/sprites/player/santaclo_one_hand_shoot.png',
    cols: 4,
    rows: 1,
    totalFrames: 4,
    hitFrame: 1,
    frameDurations: [2, 1, 3, 3],
    phases: ['windup', 'active', 'recovery', 'recovery'],
  },
  {
    id: 'santaclo_rifle_shoot',
    file: 'public/assets/sprites/player/santaclo_rifle_shoot.png',
    cols: 4,
    rows: 1,
    totalFrames: 4,
    hitFrame: 1, // Frame 2 (0-indexed 1): disparo con fogonazo
    frameDurations: [2, 1, 3, 4],
    phases: ['windup', 'active', 'recovery', 'recovery'],
  },
  {
    id: 'santaclo_two_hand_shoot',
    file: 'public/assets/sprites/player/santaclo_two_hand_shoot.png',
    cols: 4,
    rows: 1,
    totalFrames: 4,
    hitFrame: 1,
    frameDurations: [2, 1, 3, 4],
    phases: ['windup', 'active', 'recovery', 'recovery'],
  },
];

/**
 * Procesa un spritesheet individual y devuelve sus metadatos exactos
 */
export function analyzeSheet(def: SheetDefinition): SheetMetaData | null {
  const absPath = path.resolve(def.file);
  if (!fs.existsSync(absPath)) {
    console.warn(`[SmartSlicer] Archivo no encontrado: ${def.file}`);
    return null;
  }

  const buf = fs.readFileSync(absPath);
  const png = PNG.sync.read(buf);
  const W = png.width;
  const H = png.height;

  const cellW = Math.floor(W / def.cols);
  const cellH = Math.floor(H / def.rows);

  const frames: FrameMetaData[] = [];

  for (let i = 0; i < def.totalFrames; i++) {
    const col = i % def.cols;
    const row = Math.floor(i / def.cols);

    const cellX = col * cellW;
    const cellY = row * cellH;

    let minX = cellX + cellW;
    let maxX = cellX;
    let minY = cellY + cellH;
    let maxY = cellY;
    let opaquePixels = 0;

    for (let cy = 0; cy < cellH; cy++) {
      const y = cellY + cy;
      if (y >= H) continue;
      for (let cx = 0; cx < cellW; cx++) {
        const x = cellX + cx;
        if (x >= W) continue;
        const idx = (y * W + x) * 4;
        const a = png.data[idx + 3];
        if (a > 15) {
          opaquePixels++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (opaquePixels === 0) {
      // Fallback si la celda está vacía
      frames.push({
        index: i,
        x: cellX,
        y: cellY,
        w: cellW,
        h: cellH,
        anchorX: Math.round(cellW / 2),
        anchorY: cellH,
        cellX,
        cellY,
        cellW,
        cellH,
        groundY: cellY + cellH,
        centerX: cellX + Math.round(cellW / 2),
        phase: def.phases ? def.phases[i] : undefined,
        durationTicks: def.frameDurations ? def.frameDurations[i] : 4,
      });
      continue;
    }

    const frameW = maxX - minX + 1;
    const frameH = maxY - minY + 1;
    const centerX = Math.round((minX + maxX) / 2);
    const groundY = maxY; // El punto más bajo de los pies

    frames.push({
      index: i,
      x: minX,
      y: minY,
      w: frameW,
      h: frameH,
      anchorX: centerX - minX, // Offset relativo al marco cortado
      anchorY: groundY - minY, // Offset relativo al marco cortado (pies)
      cellX,
      cellY,
      cellW,
      cellH,
      groundY,
      centerX,
      phase: def.phases ? def.phases[i] : undefined,
      durationTicks: def.frameDurations ? def.frameDurations[i] : 4,
    });
  }

  const meta: SheetMetaData = {
    id: def.id,
    image: def.file.replace(/^public/, ''),
    cols: def.cols,
    rows: def.rows,
    totalFrames: def.totalFrames,
    width: W,
    height: H,
    hitFrame: def.hitFrame,
    releaseFrame: def.releaseFrame,
    frames,
    frameDurations: def.frameDurations,
  };

  return meta;
}

/**
 * Genera la página HTML interactiva de contact sheet para previsualizar visualmente
 * cada corte, los bounding boxes y los anclajes de pies.
 */
export function generateContactSheetHtml(allMeta: Record<string, SheetMetaData>): string {
  const jsonString = JSON.stringify(allMeta, null, 2);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>superN — Smart Slicing Contact Sheet Viewer</title>
  <style>
    body {
      background-color: #0f172a;
      color: #f8fafc;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      margin: 0;
      padding: 24px;
    }
    h1 {
      color: #38bdf8;
      margin-bottom: 6px;
      font-size: 22px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .subtitle {
      color: #94a3b8;
      font-size: 13px;
      margin-bottom: 24px;
    }
    .legend {
      display: flex;
      gap: 16px;
      background: #1e293b;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      font-size: 12px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .box {
      width: 14px;
      height: 14px;
      border-radius: 2px;
    }
    .box-cell { border: 1px dashed #64748b; background: rgba(100, 116, 139, 0.1); }
    .box-bbox { border: 1.5px solid #10b981; background: rgba(16, 185, 129, 0.15); }
    .box-anchor { background: #ef4444; border-radius: 50%; }
    .box-hit { border: 1.5px solid #f59e0b; background: rgba(245, 158, 11, 0.25); }

    .sheet-card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .sheet-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      border-bottom: 1px solid #334155;
      padding-bottom: 8px;
    }
    .sheet-title {
      font-weight: bold;
      font-size: 16px;
      color: #f1f5f9;
    }
    .sheet-badge {
      font-size: 11px;
      background: #0284c7;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .canvas-container {
      overflow-x: auto;
      background: repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%) 50% / 20px 20px;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #475569;
    }
    canvas {
      display: block;
      image-rendering: pixelated;
    }
    .frame-table {
      margin-top: 12px;
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      color: #cbd5e1;
    }
    .frame-table th, .frame-table td {
      border: 1px solid #334155;
      padding: 6px 10px;
      text-align: left;
    }
    .frame-table th {
      background: #0f172a;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <h1>Smart Slicing Contact Sheet Viewer</h1>
  <div class="subtitle">Verificación de bounding boxes por transparencia, anclajes de pies (anchor) y timing de frames</div>

  <div class="legend">
    <div class="legend-item"><div class="box box-cell"></div> Cuadrícula original (ancho / cols)</div>
    <div class="legend-item"><div class="box box-bbox"></div> Bounding Box real por transparencia</div>
    <div class="legend-item"><div class="box box-anchor"></div> Punto de anclaje de pies (Anchor)</div>
    <div class="legend-item"><div class="box box-hit"></div> Hit Frame (Momento de impacto)</div>
  </div>

  <div id="sheets-container"></div>

  <script>
    const SHEETS_DATA = ${jsonString};

    const container = document.getElementById('sheets-container');

    Object.values(SHEETS_DATA).forEach(meta => {
      const card = document.createElement('div');
      card.className = 'sheet-card';

      const header = document.createElement('div');
      header.className = 'sheet-header';
      header.innerHTML = \`
        <div class="sheet-title">\${meta.id}</div>
        <div>
          <span class="sheet-badge">\${meta.width}x\${meta.height} px</span>
          <span class="sheet-badge">\${meta.totalFrames} frames (\${meta.cols}x\${meta.rows})</span>
          \${meta.hitFrame !== undefined ? \`<span class="sheet-badge" style="background:#f59e0b">Hit: Frame \${meta.hitFrame}</span>\` : ''}
        </div>
      \`;
      card.appendChild(header);

      const canvasWrap = document.createElement('div');
      canvasWrap.className = 'canvas-container';

      const canvas = document.createElement('canvas');
      canvas.width = meta.width;
      canvas.height = meta.height;
      const ctx = canvas.getContext('2d');
      canvasWrap.appendChild(canvas);
      card.appendChild(canvasWrap);

      // Cargar la imagen original y dibujar overlays
      const img = new Image();
      img.src = meta.image;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);

        meta.frames.forEach((f) => {
          // 1. Cuadrícula nominal
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(f.cellX, f.cellY, f.cellW, f.cellH);
          ctx.setLineDash([]);

          // 2. Bounding Box detectado
          const isHit = meta.hitFrame === f.index;
          ctx.strokeStyle = isHit ? '#f59e0b' : '#10b981';
          ctx.lineWidth = 2;
          ctx.strokeRect(f.x, f.y, f.w, f.h);

          // 3. Anchor (Pies)
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(f.centerX, f.groundY, 4, 0, Math.PI * 2);
          ctx.fill();

          // 4. Etiqueta de frame
          ctx.fillStyle = isHit ? '#f59e0b' : '#38bdf8';
          ctx.font = '10px monospace';
          ctx.fillText(\`F\${f.index} (\${f.w}x\${f.h})\`, f.x + 3, Math.max(12, f.y - 4));
        });
      };

      // Tabla de metadatos de los frames
      const table = document.createElement('table');
      table.className = 'frame-table';
      table.innerHTML = \`
        <thead>
          <tr>
            <th>Frame</th>
            <th>BBox (x, y, w, h)</th>
            <th>Anchor (X, Y)</th>
            <th>Fase</th>
            <th>Duración (ticks)</th>
          </tr>
        </thead>
        <tbody>
          \${meta.frames.map(f => \`
            <tr style="\${meta.hitFrame === f.index ? 'background: rgba(245, 158, 11, 0.15)' : ''}">
              <td><strong>Frame \${f.index}</strong> \${meta.hitFrame === f.index ? '⚡ HIT' : ''}</td>
              <td>x:\${f.x}, y:\${f.y}, w:\${f.w}, h:\${f.h}</td>
              <td>(\${f.anchorX}, \${f.anchorY}) [Pies: \${f.centerX}, \${f.groundY}]</td>
              <td>\${f.phase || 'normal'}</td>
              <td>\${f.durationTicks || 4} ticks (\${Math.round(((f.durationTicks || 4) / 60) * 1000)}ms)</td>
            </tr>
          \`).join('')}
        </tbody>
      \`;
      card.appendChild(table);

      container.appendChild(card);
    });
  </script>
</body>
</html>`;
}

/**
 * Función principal: procesa todas las hojas, genera metadatos JSON y contact sheet.
 */
export function runSmartSlicer() {
  console.log('[SmartSlicer] Iniciando análisis inteligente de spritesheets...');
  const allMeta: Record<string, SheetMetaData> = {};

  for (const def of SHEETS_TO_PROCESS) {
    const meta = analyzeSheet(def);
    if (meta) {
      allMeta[def.id] = meta;

      // Guardar también archivo individual <sheet>.meta.json
      const indivPath = def.file.replace(/\.png$/, '.meta.json');
      fs.writeFileSync(indivPath, JSON.stringify(meta, null, 2));
    }
  }

  // 1. Guardar archivo global frameMeta.json en public/assets/sprites/player/ y src/game/
  const metaOutPath = path.resolve('public/assets/sprites/player/frameMeta.json');
  fs.writeFileSync(metaOutPath, JSON.stringify(allMeta, null, 2));
  console.log(`[SmartSlicer] Generado frameMeta.json con ${Object.keys(allMeta).length} hojas en: ${metaOutPath}`);

  const srcMetaOutPath = path.resolve('src/game/frameMeta.json');
  fs.writeFileSync(srcMetaOutPath, JSON.stringify(allMeta, null, 2));
  console.log(`[SmartSlicer] Generado src/game/frameMeta.json con ${Object.keys(allMeta).length} hojas en: ${srcMetaOutPath}`);

  // 2. Guardar contact_sheet.html para verificación visual
  const htmlOutPath = path.resolve('public/contact_sheet.html');
  const htmlContent = generateContactSheetHtml(allMeta);
  fs.writeFileSync(htmlOutPath, htmlContent);
  console.log(`[SmartSlicer] Generado visor visual contact_sheet.html en: ${htmlOutPath}`);

  return allMeta;
}

// Ejecución directa si se invoca con node
runSmartSlicer();
process.exit(0);

