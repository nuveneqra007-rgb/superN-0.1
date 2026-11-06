import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

// ==============================================================================
// slice_santa_throw.js — Recorte inteligente de la fila superior (5 frames)
// para la animación de Lanzar hacia arriba (Throw Up / Bombas) de Santa Claus.
// - Ignora la fila inferior de 2 frames.
// - Elimina el fondo ajedrezado haciéndolo 100% transparente.
// - Aplica Escalado Uniforme para igualar exactamente el tamaño base de Santa en walk (296 px).
// - Ancla el pivote (los pies en targetGroundY=314) y cuerpo centrado en X=160.
// ==============================================================================

export function sliceSantaThrow() {
  const inputPath = path.resolve('public/assets/aistudio/image_cb9f7bf2.png');
  if (!fs.existsSync(inputPath)) {
    console.error('No se encontró el archivo de origen:', inputPath);
    return;
  }

  const srcBuf = fs.readFileSync(inputPath);
  const srcPng = PNG.sync.read(srcBuf);
  const W = srcPng.width;
  const H = Math.floor(srcPng.height / 2); // 286 px (solo la fila superior de 5 frames)

  function isBgColor(r, g, b) {
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    // Cuadros ajedrezados en tonos grises neutros
    return maxC - minC <= 16 && minC >= 70 && maxC <= 235;
  }

  // Flood fill desde el perímetro exterior de la fila superior
  const isBg = new Uint8Array(W * H);
  const queue = [];
  for (let x = 0; x < W; x++) {
    queue.push(x, 0, x, H - 1);
    isBg[x] = 1;
    isBg[(H - 1) * W + x] = 1;
  }
  for (let y = 0; y < H; y++) {
    queue.push(0, y, W - 1, y);
    isBg[y * W] = 1;
    isBg[y * W + (W - 1)] = 1;
  }
  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    const dirs = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
    for (const [nx, ny] of dirs) {
      if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
        const pos = ny * W + nx;
        if (!isBg[pos]) {
          const idx = (ny * W + nx) * 4;
          const r = srcPng.data[idx];
          const g = srcPng.data[idx + 1];
          const b = srcPng.data[idx + 2];
          if (isBgColor(r, g, b)) {
            isBg[pos] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  // 5 regiones de los 5 frames de la fila superior
  const slices = [
    { startX: 25, endX: 200 },
    { startX: 220, endX: 420 },
    { startX: 425, endX: 620 },
    { startX: 625, endX: 827 }, // Frame 4 (index 3): brazo completamente extendido hacia la derecha/arriba
    { startX: 828, endX: 1015 } // Frame 5 (index 4): recuperación
  ];

  const cellW = 320;
  const cellH = 320;
  const destCols = 5;
  const destRows = 1;
  const destPng = new PNG({ width: cellW * destCols, height: cellH * destRows });
  destPng.data.fill(0); // 100% transparente

  const targetFeetCenterInCell = 160; // Centrado en la celda
  const targetGroundY = 314; // Sincronizado idénticamente con santaclo_walk y santaclo_melee
  const baseCharH = 296; // Altura de Santa en santaclo_walk
  const sourceCharH = 203; // Altura de pie en image_cb9f7bf2.png
  const scale = baseCharH / sourceCharH; // Factor de escala uniforme (~1.458128)

  const frameMetaList = [];

  slices.forEach((slice, fIdx) => {
    let minX = 9999, maxX = -1, minY = 9999, maxY = -1;
    let minFeetX = 9999, maxFeetX = -1;

    for (let y = 0; y < H; y++) {
      for (let x = slice.startX; x <= slice.endX; x++) {
        if (!isBg[y * W + x]) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          if (y >= 260) {
            if (x < minFeetX) minFeetX = x;
            if (x > maxFeetX) maxFeetX = x;
          }
        }
      }
    }

    const feetCenter = Math.round((minFeetX + maxFeetX) / 2);
    const destCellX = fIdx * cellW;

    const srcBoxW = maxX - minX + 1;
    const srcBoxH = maxY - minY + 1;
    const scaledBoxW = Math.round(srcBoxW * scale);
    const scaledBoxH = Math.round(srcBoxH * scale);

    const destFeetX = destCellX + targetFeetCenterInCell;
    const destFeetY = targetGroundY;

    const feetOffsetInBoxX = (feetCenter - minX) * scale;
    const feetOffsetInBoxY = (maxY - minY) * scale;

    const destBoxX = Math.round(destFeetX - feetOffsetInBoxX);
    const destBoxY = Math.round(destFeetY - feetOffsetInBoxY);

    for (let dy = 0; dy < scaledBoxH; dy++) {
      const sy = Math.floor(dy / scale) + minY;
      if (sy > maxY) continue;
      const targetY = destBoxY + dy;
      if (targetY < 0 || targetY >= cellH) continue;

      for (let dx = 0; dx < scaledBoxW; dx++) {
        const sx = Math.floor(dx / scale) + minX;
        if (sx > maxX) continue;
        const targetX = destBoxX + dx;
        if (targetX < destCellX || targetX >= destCellX + cellW) continue;

        if (!isBg[sy * W + sx]) {
          const sIdx = (sy * W + sx) * 4;
          const dIdx = (targetY * destPng.width + targetX) * 4;
          destPng.data[dIdx] = srcPng.data[sIdx];
          destPng.data[dIdx + 1] = srcPng.data[sIdx + 1];
          destPng.data[dIdx + 2] = srcPng.data[sIdx + 2];
          destPng.data[dIdx + 3] = srcPng.data[sIdx + 3];
        }
      }
    }

    frameMetaList.push({
      index: fIdx,
      x: destBoxX,
      y: destBoxY,
      w: scaledBoxW,
      h: scaledBoxH,
      anchorX: Math.round(destFeetX - destBoxX),
      anchorY: Math.round(destFeetY - destBoxY),
      cellX: destCellX,
      cellY: 0,
      cellW: cellW,
      cellH: cellH,
      groundY: targetGroundY,
      centerX: targetFeetCenterInCell,
      phase: fIdx <= 2 ? 'windup' : (fIdx === 3 ? 'active' : 'recovery'),
      durationTicks: fIdx === 3 ? 3 : 4,
    });
  });

  const outBuf = PNG.sync.write(destPng);
  const targets = [
    'public/assets/sprites/player/santaclo_throw_up.png',
    'assets/sprites/player/santaclo_throw_up.png',
    'public/assets/characters/santaclo/throw_up.png',
    'assets/characters/santaclo/throw_up.png',
  ];

  for (const t of targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t, outBuf);
  }

  // Generar meta JSON
  const metaObj = {
    id: 'santaclo_throw_up',
    image: '/assets/sprites/player/santaclo_throw_up.png',
    cols: 5,
    rows: 1,
    totalFrames: 5,
    width: cellW * destCols,
    height: cellH * destRows,
    releaseFrame: 3, // Frame 4 (0-indexed 3): brazo completamente extendido
    frames: frameMetaList,
    frameDurations: [4, 4, 3, 3, 4],
  };

  const metaJsonStr = JSON.stringify(metaObj, null, 2);
  const metaTargets = [
    'public/assets/sprites/player/santaclo_throw_up.meta.json',
    'assets/sprites/player/santaclo_throw_up.meta.json',
  ];
  for (const mt of metaTargets) {
    const dir = path.dirname(mt);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(mt, metaJsonStr);
  }

  console.log(`[SliceSantaThrow] Generados 5 frames con escala uniforme (296px) y anclaje a targetGroundY=${targetGroundY}`);
  return metaObj;
}

sliceSantaThrow();
