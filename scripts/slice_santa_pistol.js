import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

// ==============================================================================
// slice_santa_pistol.js — Recorte inteligente de la fila superior (4 frames)
// para la animación santaclo_pistol_shoot / santaclo_one_hand_shoot
// ==============================================================================

export function sliceSantaPistol() {
  const inputPath = path.resolve('public/assets/aistudio/image_e439e566.png');
  if (!fs.existsSync(inputPath)) {
    console.error('No se encontró el archivo de origen:', inputPath);
    return;
  }

  const srcBuf = fs.readFileSync(inputPath);
  const srcPng = PNG.sync.read(srcBuf);
  const W = srcPng.width;
  const H = 286; // Fila superior (exactamente la mitad superior)

  function isBgColor(r, g, b) {
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    return (maxC - minC <= 12 && minC >= 75 && maxC <= 215);
  }

  // Flood-fill desde el perímetro exterior para eliminar el fondo ajedrezado
  const isBg = new Uint8Array(W * H);
  const queue = [];

  for (let x = 0; x < W; x++) {
    queue.push(x, 0, x, H - 1);
    isBg[0 * W + x] = 1;
    isBg[(H - 1) * W + x] = 1;
  }
  for (let y = 0; y < H; y++) {
    queue.push(0, y, W - 1, y);
    isBg[y * W + 0] = 1;
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
          const idx = (ny * srcPng.width + nx) * 4;
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

  // Definición de las 4 regiones horizontales de los 4 frames
  const frameSlices = [
    { startX: 20, endX: 250 },
    { startX: 260, endX: 560 },
    { startX: 565, endX: 780 },
    { startX: 790, endX: 1000 }
  ];

  // Crear imagen de destino: 4 frames en 1 fila (1280x320 px, 320x320 por frame)
  const cellW = 320;
  const cellH = 320;
  const destCols = 4;
  const destRows = 1;
  const destPng = new PNG({ width: cellW * destCols, height: cellH * destRows });
  destPng.data.fill(0); // Transparente 100%

  const targetFeetCenterInCell = 125;
  const targetGroundY = 314; // Sincronizado con santaclo_melee y santaclo_walk

  frameSlices.forEach((slice, fIdx) => {
    // 1. Encontrar límites reales y centro de pies del frame
    let minX = 9999, maxX = -1, minY = 9999, maxY = -1;
    let minFeetX = 9999, maxFeetX = -1;

    for (let y = 0; y < H; y++) {
      for (let x = slice.startX; x < slice.endX; x++) {
        if (!isBg[y * W + x]) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;

          if (y >= 270) {
            if (x < minFeetX) minFeetX = x;
            if (x > maxFeetX) maxFeetX = x;
          }
        }
      }
    }

    const feetCenter = Math.round((minFeetX + maxFeetX) / 2);
    const destCellX = fIdx * cellW;
    const destFeetCenterX = destCellX + targetFeetCenterInCell;
    const offsetX = destFeetCenterX - feetCenter;
    const offsetY = targetGroundY - maxY;

    console.log(`Copiando Frame ${fIdx}: bbox=[${minX}..${maxX}], y=[${minY}..${maxY}], feetCenter=${feetCenter} -> destFeetX=${destFeetCenterX}, offsetY=${offsetY}`);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (!isBg[y * W + x]) {
          const dx = x + offsetX;
          const dy = y + offsetY;
          if (dx >= destCellX && dx < destCellX + cellW && dy >= 0 && dy < cellH) {
            const sIdx = (y * srcPng.width + x) * 4;
            const dIdx = (dy * destPng.width + dx) * 4;
            destPng.data[dIdx] = srcPng.data[sIdx];
            destPng.data[dIdx + 1] = srcPng.data[sIdx + 1];
            destPng.data[dIdx + 2] = srcPng.data[sIdx + 2];
            destPng.data[dIdx + 3] = srcPng.data[sIdx + 3];
          }
        }
      }
    }
  });

  // Guardar en las rutas requeridas
  const outPath1 = path.resolve('public/assets/sprites/player/santaclo_pistol_shoot.png');
  const outPath2 = path.resolve('public/assets/sprites/player/santaclo_one_hand_shoot.png');
  const outPath3 = path.resolve('assets/characters/santaclo/pistol_shoot.png');
  const outPath4 = path.resolve('public/assets/characters/santaclo/pistol_shoot.png');

  const buf = PNG.sync.write(destPng);
  fs.writeFileSync(outPath1, buf);
  fs.writeFileSync(outPath2, buf);
  if (fs.existsSync(path.dirname(outPath3))) fs.writeFileSync(outPath3, buf);
  if (fs.existsSync(path.dirname(outPath4))) fs.writeFileSync(outPath4, buf);

  console.log(`[SliceSantaPistol] Hojas de sprites generadas exitosamente en:\n- ${outPath1}\n- ${outPath2}`);
}

sliceSantaPistol();
