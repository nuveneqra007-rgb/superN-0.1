// ==============================================================================
// slice_santa.js — Cortador y empaquetador automático de spritesheets para Santa Claus
// superN: divide imágenes horizontales de 6 frames, elimina fondo de cuadros,
// ajusta el recorte al cuerpo del personaje y alinea el punto de pivote (pies y torso)
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

/**
 * Flood fill para marcar el fondo ajedrezado desde los bordes exteriores.
 */
function floodFillBackground(png) {
  const W = png.width;
  const H = png.height;
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
          const idx = pos * 4;
          const r = png.data[idx];
          const g = png.data[idx + 1];
          const b = png.data[idx + 2];
          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          // Fondo ajedrezado (cuadros blancos, grises claros y azulados)
          const isChecker = (
            ((maxC - minC) <= 12 && minC >= 180) ||
            (b >= 230 && r >= 200 && g >= 210) ||
            (r >= 240 && g >= 240 && b >= 240)
          );
          if (isChecker) {
            isBg[pos] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  return isBg;
}

/**
 * Genera la animación de correr (run_santa) a partir de la nueva imagen horizontal de 6 frames (image_a14e1ec4.png).
 * Cuadrícula de 6 frames en línea horizontal (1920x320 px, 320x320 por frame):
 * - Eliminación del fondo ajedrezado haciéndolo 100% transparente.
 * - Recorte ceñido al cuerpo de Santa Claus.
 * - Alineación del punto de pivote: pies en la línea de suelo común targetGroundY = 315 (igual que walk_santa).
 * - Centro del torso alineado en targetCenterX = 160 px para evitar desplazamientos y teletransportaciones.
 */
export function sliceSantaRun() {
  const inputPath = path.resolve('public/assets/aistudio/image_a14e1ec4.png');
  if (!fs.existsSync(inputPath)) {
    console.error('No se encontró el archivo de origen para Santa Run:', inputPath);
    return;
  }

  const srcBuf = fs.readFileSync(inputPath);
  const srcPng = PNG.sync.read(srcBuf);
  const W = srcPng.width;
  const H = srcPng.height;

  function isChecker(r, g, b, a) {
    if (a < 10) return true;
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    return (maxC - minC <= 10 && minC >= 150);
  }

  // Flood fill desde los bordes exteriores para eliminar todo el fondo ajedrezado
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
    const cx = queue[head++];
    const cy = queue[head++];
    const neighbors = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
        const pos = ny * W + nx;
        if (!isBg[pos]) {
          const idx = pos * 4;
          if (isChecker(srcPng.data[idx], srcPng.data[idx + 1], srcPng.data[idx + 2], srcPng.data[idx + 3])) {
            isBg[pos] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  // 6 frames individuales en línea horizontal con centro de torso y suelo calibrados
  const cuts = [
    { f: 0, x0: 24, x1: 168, torsoX: 95.5, groundY: 346 },
    { f: 1, x0: 186, x1: 330, torsoX: 257.5, groundY: 346 },
    { f: 2, x0: 356, x1: 496, torsoX: 426.0, groundY: 346 },
    { f: 3, x0: 524, x1: 688, torsoX: 605.5, groundY: 346 },
    { f: 4, x0: 698, x1: 842, torsoX: 769.0, groundY: 346 },
    { f: 5, x0: 856, x1: 1000, torsoX: 928.5, groundY: 346 },
  ];

  const CW = 320;
  const CH = 320;
  const SCALE = 296 / 188; // 1.574468 — Escala idéntica a walk_santa (296 px de altura)
  const targetCenterX = 160;
  const targetGroundY = 315; // Misma altura de los pies que en walk_santa

  const outPng = new PNG({ width: CW * 6, height: CH });
  outPng.data.fill(0); // 100% transparente

  cuts.forEach((c) => {
    const cellStartX = c.f * CW;
    for (let destY = 0; destY < CH; destY++) {
      for (let destX = 0; destX < CW; destX++) {
        const srcX = Math.round(c.torsoX + (destX - targetCenterX) / SCALE);
        const srcY = Math.round(c.groundY + (destY - targetGroundY) / SCALE);
        if (srcX >= c.x0 && srcX <= c.x1 && srcY >= 150 && srcY <= 350) {
          const srcPos = srcY * W + srcX;
          if (!isBg[srcPos]) {
            const srcIdx = srcPos * 4;
            const outIdx = (destY * outPng.width + (cellStartX + destX)) * 4;
            outPng.data[outIdx] = srcPng.data[srcIdx];
            outPng.data[outIdx + 1] = srcPng.data[srcIdx + 1];
            outPng.data[outIdx + 2] = srcPng.data[srcIdx + 2];
            outPng.data[outIdx + 3] = 255;
          }
        }
      }
    }
  });

  const outBuf = PNG.sync.write(outPng);
  const targets = [
    'public/assets/sprites/player/santaclo_run.png',
    'assets/sprites/player/santaclo_run.png',
    'public/assets/characters/santaclo/run.png',
    'assets/characters/santaclo/run.png',
  ];

  for (const t of targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t, outBuf);
  }
  console.log(`[Santa Run] Generado con éxito: ${CW * 6}x${CH} (6 frames en cuadrícula 320x320 con suelo en y=315 y torso centrado)`);
}

/**
 * Genera la animación de caminar (walk_santa) a partir de la imagen horizontal de 6 frames,
 * escalada a la misma proporción y alineada con la línea de suelo en y=314.
 */
export function sliceSantaWalk() {
  const inputPath = path.resolve('public/assets/aistudio/image_5715b30b.png');
  if (!fs.existsSync(inputPath)) {
    console.error('No se encontró el archivo de origen para Santa Walk:', inputPath);
    return;
  }

  const srcBuf = fs.readFileSync(inputPath);
  const srcPng = PNG.sync.read(srcBuf);
  const W = srcPng.width;
  const H = srcPng.height;

  const isBg = floodFillBackground(srcPng);

  const cuts = [
    { f: 0, x0: 30, x1: 175, centerTorsoX: 100.0, groundY: 390 },
    { f: 1, x0: 175, x1: 340, centerTorsoX: 257.0, groundY: 390 },
    { f: 2, x0: 350, x1: 515, centerTorsoX: 429.0, groundY: 390 },
    { f: 3, x0: 520, x1: 685, centerTorsoX: 598.0, groundY: 390 },
    { f: 4, x0: 685, x1: 855, centerTorsoX: 765.0, groundY: 390 },
    { f: 5, x0: 855, x1: 1010, centerTorsoX: 928.0, groundY: 390 },
  ];

  const CW = 320;
  const CH = 320;
  const SCALE = 1.5; // Escala pixel art para igualar la altura visual de Santa Run (~296-300px)
  const targetCenterX = CW / 2; // 160 px
  const targetGroundY = 314;    // Misma línea de suelo que Santa Run

  const outPng = new PNG({ width: CW * 6, height: CH });
  outPng.data.fill(0); // 100% transparente

  cuts.forEach(({ f, x0, x1, centerTorsoX, groundY }) => {
    const cellStartX = f * CW;
    for (let sy = 180; sy <= 400; sy++) {
      for (let sx = x0; sx <= x1; sx++) {
        const pos = sy * W + sx;
        if (!isBg[pos]) {
          const relX = (sx - centerTorsoX) * SCALE;
          const relY = (sy - groundY) * SCALE;

          const destX = Math.round(cellStartX + targetCenterX + relX);
          const destY = Math.round(targetGroundY + relY);

          for (let dy = 0; dy <= 1; dy++) {
            for (let dx = 0; dx <= 1; dx++) {
              const px = destX + dx;
              const py = destY + dy;
              if (px >= cellStartX && px < cellStartX + CW && py >= 0 && py < CH) {
                const srcIdx = pos * 4;
                const destIdx = (py * outPng.width + px) * 4;
                outPng.data[destIdx] = srcPng.data[srcIdx];
                outPng.data[destIdx + 1] = srcPng.data[srcIdx + 1];
                outPng.data[destIdx + 2] = srcPng.data[srcIdx + 2];
                outPng.data[destIdx + 3] = 255;
              }
            }
          }
        }
      }
    }
  });

  const outBuf = PNG.sync.write(outPng);
  const targets = [
    'public/assets/sprites/player/santaclo_walk.png',
    'assets/sprites/player/santaclo_walk.png',
    'public/assets/characters/santaclo/walk.png',
  ];

  for (const t of targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t, outBuf);
  }
  console.log(`[Santa Walk] Generado con éxito: ${CW * 6}x${CH} (6 frames en cuadrícula 320x320 con suelo en y=314)`);
}

/**
 * Genera la animación de salto (jump_santa) a partir de la imagen diagonal en arco de 6 frames (image_d0f432a9.png).
 * Recorte individual respetando el contorno del personaje, eliminación del fondo ajedrezado,
 * alineación de pivote horizontal en centerX=153 y suelo base en y=312.
 */
export function sliceSantaJump() {
  const inputPath = path.resolve('public/assets/aistudio/image_d0f432a9.png');
  if (!fs.existsSync(inputPath)) {
    console.error('No se encontró el archivo de origen para Santa Jump:', inputPath);
    return;
  }

  const srcBuf = fs.readFileSync(inputPath);
  const srcPng = PNG.sync.read(srcBuf);
  const W = srcPng.width;
  const H = srcPng.height;

  // Detección de fondo ajedrezado gris
  function isChecker(r, g, b) {
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    return (maxC - minC <= 6 && minC >= 95 && maxC <= 200);
  }

  // Flood fill desde los 4 bordes externos para garantizar eliminación total del fondo
  const isBg = new Uint8Array(W * H);
  const q = [];
  for (let x = 0; x < W; x++) {
    q.push(x, 0, x, H - 1);
    isBg[0 * W + x] = 1;
    isBg[(H - 1) * W + x] = 1;
  }
  for (let y = 0; y < H; y++) {
    q.push(0, y, W - 1, y);
    isBg[y * W + 0] = 1;
    isBg[y * W + (W - 1)] = 1;
  }
  let head = 0;
  while (head < q.length) {
    const cx = q[head++];
    const cy = q[head++];
    for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
      if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
        const pos = ny * W + nx;
        if (!isBg[pos]) {
          const idx = pos * 4;
          if (isChecker(srcPng.data[idx], srcPng.data[idx + 1], srcPng.data[idx + 2])) {
            isBg[pos] = 1;
            q.push(nx, ny);
          }
        }
      }
    }
  }

  // Coordenadas individuales de cada uno de los 6 frames en arco diagonal
  // f0: Reposo / preparación en suelo
  // f1: Impulso inicial
  // f2: Impulso en ascenso
  // f3: Punto máximo (rodillas recogidas en el ápice)
  // f4: Caída libre
  // f5: Aterrizaje al tocar el suelo
  const cuts = [
    { f: 0, x0: 28, x1: 170, y0: 450, y1: 662, pivotX: 104, groundY: 661 },
    { f: 1, x0: 175, x1: 326, y0: 395, y1: 633, pivotX: 254.5, groundY: 631 },
    { f: 2, x0: 330, x1: 474, y0: 340, y1: 582, pivotX: 405.5, groundY: 580 },
    { f: 3, x0: 476, x1: 620, y0: 325, y1: 516, pivotX: 554, groundY: 540 },
    { f: 4, x0: 618, x1: 766, y0: 420, y1: 649, pivotX: 696.5, groundY: 647 },
    { f: 5, x0: 770, x1: 930, y0: 475, y1: 663, pivotX: 855, groundY: 662 },
  ];

  const CW = 320;
  const CH = 320;
  const SCALE = 1.34;
  const targetCenterX = 160;
  const targetGroundY = 312;

  const outPng = new PNG({ width: CW * 6, height: CH });
  outPng.data.fill(0); // 100% transparente

  cuts.forEach((c) => {
    const cellStartX = c.f * CW;
    for (let destY = 0; destY < CH; destY++) {
      for (let destX = 0; destX < CW; destX++) {
        const srcX = Math.round(c.pivotX + (destX - targetCenterX) / SCALE);
        const srcY = Math.round(c.groundY + (destY - targetGroundY) / SCALE);
        if (srcX >= c.x0 && srcX <= c.x1 && srcY >= c.y0 && srcY <= c.y1) {
          const srcPos = srcY * W + srcX;
          if (!isBg[srcPos]) {
            const srcIdx = srcPos * 4;
            const outIdx = (destY * outPng.width + (cellStartX + destX)) * 4;
            outPng.data[outIdx] = srcPng.data[srcIdx];
            outPng.data[outIdx + 1] = srcPng.data[srcIdx + 1];
            outPng.data[outIdx + 2] = srcPng.data[srcIdx + 2];
            outPng.data[outIdx + 3] = 255;
          }
        }
      }
    }
  });

  const outBuf = PNG.sync.write(outPng);
  const targets = [
    'public/assets/sprites/player/santaclo_jump.png',
    'assets/sprites/player/santaclo_jump.png',
    'public/assets/characters/santaclo/jump.png',
    'assets/characters/santaclo/jump.png',
  ];

  for (const t of targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t, outBuf);
  }
  console.log(`[Santa Jump] Generado con éxito: ${CW * 6}x${CH} (6 frames en cuadrícula 320x320 con pivote centrado y suelo en y=312)`);
}

/**
 * Genera la animación de rodar (roll_santa) a partir de la imagen horizontal de 6 frames (image_f93f6e95.png).
 * Recorte individual de los 6 frames respetando el cuerpo y la forma de bolita en frames 3 y 4,
 * eliminación del fondo ajedrezado, alineación con pivote centrado en centerX=160 y suelo en y=312.
 */
export function sliceSantaRoll() {
  const inputPath = path.resolve('public/assets/aistudio/image_f93f6e95.png');
  if (!fs.existsSync(inputPath)) {
    console.error('No se encontró el archivo de origen para Santa Roll:', inputPath);
    return;
  }

  const srcBuf = fs.readFileSync(inputPath);
  const srcPng = PNG.sync.read(srcBuf);
  const W = srcPng.width;
  const H = srcPng.height;

  function isChecker(r, g, b) {
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    return ((maxC - minC <= 12 && minC >= 180) || (r >= 235 && g >= 235 && b >= 235));
  }

  const isBg = new Uint8Array(W * H);
  const q = [];
  for (let x = 0; x < W; x++) {
    q.push(x, 0, x, H - 1);
    isBg[0 * W + x] = 1;
    isBg[(H - 1) * W + x] = 1;
  }
  for (let y = 0; y < H; y++) {
    q.push(0, y, W - 1, y);
    isBg[y * W + 0] = 1;
    isBg[y * W + (W - 1)] = 1;
  }
  let head = 0;
  while (head < q.length) {
    const cx = q[head++];
    const cy = q[head++];
    for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
      if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
        const pos = ny * W + nx;
        if (!isBg[pos]) {
          const idx = pos * 4;
          if (isChecker(srcPng.data[idx], srcPng.data[idx + 1], srcPng.data[idx + 2])) {
            isBg[pos] = 1;
            q.push(nx, ny);
          }
        }
      }
    }
  }

  // Coordenadas individuales para los 6 frames horizontales:
  // f0: Preparación / flexión
  // f1: Inclinación hacia la rodada
  // f2: Bolita 1 (recorte cuadrado que abarca la bolita completa)
  // f3: Bolita 2 (recorte cuadrado que abarca la rotación en el suelo)
  // f4: Desenrollándose / despegue hacia arriba
  // f5: Recuperación de pie en guardia
  const cuts = [
    { f: 0, x0: 30, x1: 180, y0: 155, y1: 350, pivotX: 104.5, groundY: 349 },
    { f: 1, x0: 195, x1: 340, y0: 175, y1: 350, pivotX: 265.5, groundY: 349 },
    { f: 2, x0: 360, x1: 500, y0: 200, y1: 350, pivotX: 429.5, groundY: 349 },
    { f: 3, x0: 520, x1: 665, y0: 205, y1: 350, pivotX: 593.5, groundY: 349 },
    { f: 4, x0: 690, x1: 835, y0: 170, y1: 350, pivotX: 762.0, groundY: 349 },
    { f: 5, x0: 850, x1: 1000, y0: 150, y1: 350, pivotX: 924.5, groundY: 349 },
  ];

  const CW = 320;
  const CH = 320;
  const SCALE = 1.48;
  const targetCenterX = 160;
  const targetGroundY = 312;

  const outPng = new PNG({ width: CW * 6, height: CH });
  outPng.data.fill(0); // 100% transparente

  cuts.forEach((c) => {
    const cellStartX = c.f * CW;
    for (let destY = 0; destY < CH; destY++) {
      for (let destX = 0; destX < CW; destX++) {
        const srcX = Math.round(c.pivotX + (destX - targetCenterX) / SCALE);
        const srcY = Math.round(c.groundY + (destY - targetGroundY) / SCALE);
        if (srcX >= c.x0 && srcX <= c.x1 && srcY >= c.y0 && srcY <= c.y1) {
          const srcPos = srcY * W + srcX;
          if (!isBg[srcPos]) {
            const srcIdx = srcPos * 4;
            const outIdx = (destY * outPng.width + (cellStartX + destX)) * 4;
            outPng.data[outIdx] = srcPng.data[srcIdx];
            outPng.data[outIdx + 1] = srcPng.data[srcIdx + 1];
            outPng.data[outIdx + 2] = srcPng.data[srcIdx + 2];
            outPng.data[outIdx + 3] = 255;
          }
        }
      }
    }
  });

  const outBuf = PNG.sync.write(outPng);
  const targets = [
    'public/assets/sprites/player/santaclo_roll.png',
    'assets/sprites/player/santaclo_roll.png',
    'public/assets/characters/santaclo/roll.png',
    'assets/characters/santaclo/roll.png',
  ];

  for (const t of targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t, outBuf);
  }
  console.log(`[Santa Roll] Generado con éxito: ${CW * 6}x${CH} (6 frames en cuadrícula 320x320 con pivote centrado y suelo en y=312)`);
}

/**
 * Genera la animación de Ataque Pesado a dos manos (two_hand_attack) para Santa Claus (image_3dfbebce.png).
 * Cuadrícula de 5 frames exactamente en línea horizontal (1600x320 px, 320x320 por frame):
 * - Eliminación del fondo ajedrezado haciéndolo 100% transparente.
 * - Recorte individual y alineación del pivote (los pies en targetGroundY=314) y torso centrado (targetCenterX=160).
 * - En Frame 4 (momento del azote y agachada contra el suelo), el pivote en los pies se mantiene en y=314
 *   para garantizar que no se hunda en el suelo.
 */
export function sliceSantaTwoHandAttack() {
  const inputPath = path.resolve('public/assets/aistudio/image_3dfbebce.png');
  if (!fs.existsSync(inputPath)) {
    console.error('No se encontró el archivo de origen para Santa Two-Hand Attack:', inputPath);
    return;
  }

  const srcBuf = fs.readFileSync(inputPath);
  const srcPng = PNG.sync.read(srcBuf);
  const W = srcPng.width;
  const H = srcPng.height;

  function isChecker(r, g, b) {
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    return (maxC - minC <= 8 && minC >= 165 && maxC <= 250);
  }

  const isBg = new Uint8Array(W * H);
  const q = [];
  for (let x = 0; x < W; x++) {
    q.push(x, 0, x, H - 1);
    isBg[0 * W + x] = 1;
    isBg[(H - 1) * W + x] = 1;
  }
  for (let y = 0; y < H; y++) {
    q.push(0, y, W - 1, y);
    isBg[y * W + 0] = 1;
    isBg[y * W + (W - 1)] = 1;
  }
  let head = 0;
  while (head < q.length) {
    const cx = q[head++];
    const cy = q[head++];
    for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
      if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
        const pos = ny * W + nx;
        if (!isBg[pos]) {
          const idx = pos * 4;
          if (isChecker(srcPng.data[idx], srcPng.data[idx + 1], srcPng.data[idx + 2])) {
            isBg[pos] = 1;
            q.push(nx, ny);
          }
        }
      }
    }
  }

  // 5 frames definidos con pivote horizontal centrado y suelo fijo en groundY=370
  const cuts = [
    { f: 0, x0: 8, x1: 185, y0: 120, y1: 375, pivotX: 95.0, groundY: 370 },
    { f: 1, x0: 220, x1: 395, y0: 120, y1: 375, pivotX: 304.0, groundY: 370 },
    { f: 2, x0: 395, x1: 595, y0: 120, y1: 375, pivotX: 500.0, groundY: 370 },
    { f: 3, x0: 595, x1: 820, y0: 100, y1: 385, pivotX: 712.0, groundY: 370 },
    { f: 4, x0: 820, x1: 1015, y0: 120, y1: 375, pivotX: 911.0, groundY: 370 },
  ];

  const CW = 320;
  const CH = 320;
  const SCALE = 1.25;
  const targetCenterX = 160;
  const targetGroundY = 314;

  const outPng = new PNG({ width: CW * 5, height: CH });
  outPng.data.fill(0); // 100% transparente

  cuts.forEach((c) => {
    const cellStartX = c.f * CW;
    for (let destY = 0; destY < CH; destY++) {
      for (let destX = 0; destX < CW; destX++) {
        const srcX = Math.round(c.pivotX + (destX - targetCenterX) / SCALE);
        const srcY = Math.round(c.groundY + (destY - targetGroundY) / SCALE);
        if (srcX >= c.x0 && srcX <= c.x1 && srcY >= c.y0 && srcY <= c.y1) {
          const srcPos = srcY * W + srcX;
          if (!isBg[srcPos]) {
            const srcIdx = srcPos * 4;
            const outIdx = (destY * outPng.width + (cellStartX + destX)) * 4;
            outPng.data[outIdx] = srcPng.data[srcIdx];
            outPng.data[outIdx + 1] = srcPng.data[srcIdx + 1];
            outPng.data[outIdx + 2] = srcPng.data[srcIdx + 2];
            outPng.data[outIdx + 3] = 255;
          }
        }
      }
    }
  });

  const outBuf = PNG.sync.write(outPng);
  const targets = [
    'public/assets/sprites/player/santaclo_two_hand_attack.png',
    'assets/sprites/player/santaclo_two_hand_attack.png',
    'public/assets/characters/santaclo/two_hand_attack.png',
    'assets/characters/santaclo/two_hand_attack.png',
  ];

  for (const t of targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t, outBuf);
  }
  console.log(`[Santa Two-Hand Attack] Generado con éxito: ${CW * 5}x${CH} (5 frames en cuadrícula 320x320 con suelo en y=314)`);
}

// Ejecutar si se invoca directamente
if (process.argv[1] && process.argv[1].endsWith('slice_santa.js')) {
  sliceSantaRun();
  sliceSantaWalk();
  sliceSantaJump();
  sliceSantaRoll();
  sliceSantaTwoHandAttack();
}


