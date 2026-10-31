// ==============================================================================
// slice_gymrat.js — Cortador y empaquetador automático de spritesheets para Gymrat
// superN (Fase 1 GDD v3): divide imágenes 3x2, elimina fondo de cuadros y líneas
// divisorias, ajusta la caja del personaje y alinea el punto de contacto al suelo.
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

function sliceGymratWalk() {
  const inputPath = path.resolve('public/assets/aistudio/image_effc215b.png');
  if (!fs.existsSync(inputPath)) {
    console.error('No se encontró el archivo de origen para walk:', inputPath);
    return;
  }

  const srcBuf = fs.readFileSync(inputPath);
  const srcPng = PNG.sync.read(srcBuf);

  const cellRects = [
    { f: 0, x0: 10, x1: 300, y0: 35, y1: 387 },
    { f: 1, x0: 325, x1: 615, y0: 35, y1: 387 },
    { f: 2, x0: 642, x1: 928, y0: 35, y1: 387 },
    { f: 3, x0: 10, x1: 300, y0: 625, y1: 1021 },
    { f: 4, x0: 325, x1: 615, y0: 625, y1: 1021 },
    { f: 5, x0: 642, x1: 928, y0: 625, y1: 1021 },
  ];

  const frames = [];

  cellRects.forEach(({ f, x0, x1, y0, y1 }) => {
    const W = x1 - x0 + 1;
    const H = y1 - y0 + 1;
    const isChar = new Uint8Array(W * H);
    const queue = [];

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = ((y0 + y) * srcPng.width + (x0 + x)) * 4;
        const r = srcPng.data[idx], g = srcPng.data[idx + 1], b = srcPng.data[idx + 2];
        if (r > 190 && g > 90 && g < 170 && b < 130) {
          isChar[y * W + x] = 1;
          queue.push([x, y]);
        }
      }
    }

    let head = 0;
    while (head < queue.length) {
      const [x, y] = queue[head++];
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
          const npos = ny * W + nx;
          if (!isChar[npos]) {
            const idx = ((y0 + ny) * srcPng.width + (x0 + nx)) * 4;
            const r = srcPng.data[idx], g = srcPng.data[idx + 1], b = srcPng.data[idx + 2];
            const maxC = Math.max(r, g, b);
            const minC = Math.min(r, g, b);
            const isChecker = (maxC - minC) < 18 && minC >= 70;
            if (!isChecker) {
              isChar[npos] = 1;
              queue.push([nx, ny]);
            }
          }
        }
      }
    }

    let minX = W, maxX = -1, minY = H, maxY = -1;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (isChar[y * W + x]) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const fw = maxX - minX + 1;
    const fh = maxY - minY + 1;

    const framePng = new PNG({ width: fw, height: fh });
    for (let y = 0; y < fh; y++) {
      for (let x = 0; x < fw; x++) {
        const srcX = x0 + minX + x;
        const srcY = y0 + minY + y;
        const inCellPos = (minY + y) * W + (minX + x);
        const destIdx = (y * fw + x) * 4;
        if (isChar[inCellPos]) {
          const srcIdx = (srcY * srcPng.width + srcX) * 4;
          framePng.data[destIdx] = srcPng.data[srcIdx];
          framePng.data[destIdx + 1] = srcPng.data[srcIdx + 1];
          framePng.data[destIdx + 2] = srcPng.data[srcIdx + 2];
          framePng.data[destIdx + 3] = 255;
        } else {
          framePng.data[destIdx] = 0;
          framePng.data[destIdx + 1] = 0;
          framePng.data[destIdx + 2] = 0;
          framePng.data[destIdx + 3] = 0;
        }
      }
    }

    frames.push({ f, fw, fh, png: framePng });
  });

  const CW = 280;
  const CH = 400;
  const outPng = new PNG({ width: CW * 6, height: CH });
  outPng.data.fill(0);

  frames.forEach((frame, idx) => {
    const offsetX = idx * CW + Math.floor((CW - frame.fw) / 2);
    const offsetY = CH - frame.fh;

    for (let y = 0; y < frame.fh; y++) {
      for (let x = 0; x < frame.fw; x++) {
        const srcIdx = (y * frame.fw + x) * 4;
        if (frame.png.data[srcIdx + 3] > 0) {
          const destX = offsetX + x;
          const destY = offsetY + y;
          const destIdx = (destY * outPng.width + destX) * 4;
          outPng.data[destIdx] = frame.png.data[srcIdx];
          outPng.data[destIdx + 1] = frame.png.data[srcIdx + 1];
          outPng.data[destIdx + 2] = frame.png.data[srcIdx + 2];
          outPng.data[destIdx + 3] = frame.png.data[srcIdx + 3];
        }
      }
    }
  });

  const outBuf = PNG.sync.write(outPng);
  const targets = [
    'public/assets/sprites/player/gymrat_walk.png',
    'assets/sprites/player/gymrat_walk.png',
    'public/assets/characters/gymrat/walk.png',
  ];

  for (const t of targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t, outBuf);
  }
  console.log(`[Walk] Generado: ${CW * 6}x${CH} (6 frames)`);
}

function sliceGymratRun() {
  const inputPath = path.resolve('public/assets/aistudio/image_d9b6c0f7.png');
  if (!fs.existsSync(inputPath)) {
    console.error('No se encontró el archivo de origen para run:', inputPath);
    return;
  }

  const srcBuf = fs.readFileSync(inputPath);
  const srcPng = PNG.sync.read(srcBuf);

  const cellRects = [
    { f: 0, x0: 10, x1: 300, y0: 35, y1: 387 },
    { f: 1, x0: 325, x1: 615, y0: 35, y1: 387 },
    { f: 2, x0: 642, x1: 928, y0: 35, y1: 387 },
    { f: 3, x0: 10, x1: 300, y0: 625, y1: 1021 },
    { f: 4, x0: 325, x1: 615, y0: 625, y1: 1021 },
    { f: 5, x0: 642, x1: 928, y0: 625, y1: 1021 },
  ];

  const frames = [];

  cellRects.forEach(({ f, x0, x1, y0, y1 }) => {
    const W = x1 - x0 + 1, H = y1 - y0 + 1;
    const isChar = new Uint8Array(W * H);
    const queue = [];

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = ((y0 + y) * srcPng.width + (x0 + x)) * 4;
        const r = srcPng.data[idx], g = srcPng.data[idx + 1], b = srcPng.data[idx + 2];
        if (r > 190 && g > 90 && g < 170 && b < 130) {
          isChar[y * W + x] = 1;
          queue.push([x, y]);
        }
      }
    }

    let head = 0;
    while (head < queue.length) {
      const [x, y] = queue[head++];
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
          const npos = ny * W + nx;
          if (!isChar[npos]) {
            const idx = ((y0 + ny) * srcPng.width + (x0 + nx)) * 4;
            const r = srcPng.data[idx], g = srcPng.data[idx + 1], b = srcPng.data[idx + 2];
            const maxC = Math.max(r, g, b), minC = Math.min(r, g, b);
            if (!((maxC - minC) < 18 && minC >= 70)) {
              isChar[npos] = 1;
              queue.push([nx, ny]);
            }
          }
        }
      }
    }

    let minX = W, maxX = -1, minY = H, maxY = -1;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (isChar[y * W + x]) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Centro del torso ponderado para compensar zancadas amplias y evitar desplazamientos erráticos
    let torsoX = [];
    const torsoBottom = minY + Math.floor((maxY - minY) * 0.55);
    for (let y = minY; y <= torsoBottom; y++) {
      for (let x = 0; x < W; x++) {
        if (isChar[y * W + x]) torsoX.push(x);
      }
    }
    const torsoCenter = torsoX.reduce((a, b) => a + b, 0) / torsoX.length;

    const fw = maxX - minX + 1;
    const fh = maxY - minY + 1;

    const framePng = new PNG({ width: fw, height: fh });
    for (let y = 0; y < fh; y++) {
      for (let x = 0; x < fw; x++) {
        const srcX = x0 + minX + x;
        const srcY = y0 + minY + y;
        const inCellPos = (minY + y) * W + (minX + x);
        const destIdx = (y * fw + x) * 4;
        if (isChar[inCellPos]) {
          const srcIdx = (srcY * srcPng.width + srcX) * 4;
          framePng.data[destIdx] = srcPng.data[srcIdx];
          framePng.data[destIdx + 1] = srcPng.data[srcIdx + 1];
          framePng.data[destIdx + 2] = srcPng.data[srcIdx + 2];
          framePng.data[destIdx + 3] = 255;
        } else {
          framePng.data[destIdx] = 0;
          framePng.data[destIdx + 1] = 0;
          framePng.data[destIdx + 2] = 0;
          framePng.data[destIdx + 3] = 0;
        }
      }
    }

    frames.push({
      f,
      fw,
      fh,
      png: framePng,
      torsoCenterRel: torsoCenter - minX,
    });
  });

  const CW = 300;
  const CH = 400;
  const targetTorsoX = 175;

  const outPng = new PNG({ width: CW * 6, height: CH });
  outPng.data.fill(0);

  frames.forEach((frame, idx) => {
    const destX0 = idx * CW;
    const offsetX = Math.round(destX0 + targetTorsoX - frame.torsoCenterRel);
    const offsetY = CH - frame.fh;

    for (let y = 0; y < frame.fh; y++) {
      for (let x = 0; x < frame.fw; x++) {
        const srcIdx = (y * frame.fw + x) * 4;
        if (frame.png.data[srcIdx + 3] > 0) {
          const dx = offsetX + x;
          const dy = offsetY + y;
          if (dx >= destX0 && dx < destX0 + CW && dy >= 0 && dy < CH) {
            const destIdx = (dy * outPng.width + dx) * 4;
            outPng.data[destIdx] = frame.png.data[srcIdx];
            outPng.data[destIdx + 1] = frame.png.data[srcIdx + 1];
            outPng.data[destIdx + 2] = frame.png.data[srcIdx + 2];
            outPng.data[destIdx + 3] = frame.png.data[srcIdx + 3];
          }
        }
      }
    }
  });

  const outBuf = PNG.sync.write(outPng);
  const targets = [
    'public/assets/sprites/player/gymrat_run.png',
    'assets/sprites/player/gymrat_run.png',
    'public/assets/characters/gymrat/run.png',
  ];

  for (const t of targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t, outBuf);
  }
  console.log(`[Run] Generado: ${CW * 6}x${CH} (6 frames, torso centrado y pies alineados)`);
}

function sliceGymratJump() {
  const inputPath = path.resolve('public/assets/aistudio/image_eaab78e9.png');
  if (!fs.existsSync(inputPath)) {
    console.error('No se encontró el archivo de origen para jump:', inputPath);
    return;
  }

  const srcBuf = fs.readFileSync(inputPath);
  const srcPng = PNG.sync.read(srcBuf);

  const boxes = [
    { f: 0, x0: 10, x1: 300, y0: 12, y1: 384, groundY: 374 },
    { f: 1, x0: 325, x1: 618, y0: 12, y1: 384, groundY: 374 },
    { f: 2, x0: 642, x1: 930, y0: 12, y1: 384, groundY: 374 },
    { f: 3, x0: 10, x1: 300, y0: 612, y1: 1018, groundY: 380 },
    { f: 4, x0: 325, x1: 618, y0: 612, y1: 1018, groundY: 380 },
    { f: 5, x0: 642, x1: 930, y0: 612, y1: 1018, groundY: 380 },
  ];

  const CW = 300;
  const CH = 400;
  const targetGroundY = CH - 15;
  const targetCenterX = CW / 2;

  const outPng = new PNG({ width: CW * 6, height: CH });
  outPng.data.fill(0); // 100% transparente

  boxes.forEach(({ f, x0, x1, y0, y1, groundY }) => {
    const W = x1 - x0 + 1, H = y1 - y0 + 1;
    const isChar = new Uint8Array(W * H);
    const queue = [];

    // Semilla en el color de piel de Gymrat
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = ((y0 + y) * srcPng.width + (x0 + x)) * 4;
        const r = srcPng.data[idx], g = srcPng.data[idx + 1], b = srcPng.data[idx + 2];
        if (r > 150 && g > 80 && (r - b) > 40) {
          isChar[y * W + x] = 1;
          queue.push([x, y]);
        }
      }
    }

    // Flood fill para contornos negros, botas y calzón evitando el tablero de ajedrez
    let head = 0;
    while (head < queue.length) {
      const [x, y] = queue[head++];
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
          const npos = ny * W + nx;
          if (!isChar[npos]) {
            const idx = ((y0 + ny) * srcPng.width + (x0 + nx)) * 4;
            const r = srcPng.data[idx], g = srcPng.data[idx + 1], b = srcPng.data[idx + 2];
            const maxC = Math.max(r, g, b);
            const minC = Math.min(r, g, b);
            // El tablero gris tiene baja saturación (maxC - minC <= 14) y brillo >= 65
            const isChecker = (maxC - minC <= 14) && minC >= 65;
            if (!isChecker) {
              isChar[npos] = 1;
              queue.push([nx, ny]);
            }
          }
        }
      }
    }

    // Centro del torso ponderado para alinear el pivote
    let sumX = 0, count = 0;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (isChar[y * W + x]) {
          sumX += x;
          count++;
        }
      }
    }
    const avgX = count > 0 ? (sumX / count) : (W / 2);

    const cellStartX = f * CW;
    const offsetX = Math.round(cellStartX + targetCenterX - avgX);
    const offsetY = targetGroundY - groundY;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (isChar[y * W + x]) {
          const destX = offsetX + x;
          const destY = offsetY + y;
          if (destX >= cellStartX && destX < cellStartX + CW && destY >= 0 && destY < CH) {
            const srcIdx = ((y0 + y) * srcPng.width + (x0 + x)) * 4;
            const destIdx = (destY * outPng.width + destX) * 4;
            outPng.data[destIdx] = srcPng.data[srcIdx];
            outPng.data[destIdx + 1] = srcPng.data[srcIdx + 1];
            outPng.data[destIdx + 2] = srcPng.data[srcIdx + 2];
            outPng.data[destIdx + 3] = 255;
          }
        }
      }
    }
  });

  const outBuf = PNG.sync.write(outPng);
  const targets = [
    'public/assets/sprites/player/gymrat_jump.png',
    'assets/sprites/player/gymrat_jump.png',
    'public/assets/characters/gymrat/jump.png',
  ];

  for (const t of targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t, outBuf);
  }
  console.log(`[Jump] Generado: ${CW * 6}x${CH} (6 frames: reposo, impulso x2, caída x2, aterrizaje)`);
}

function sliceGymratRoll() {
  const inputPath = path.resolve('public/assets/aistudio/image_e759561c.png');
  if (!fs.existsSync(inputPath)) {
    console.error('No se encontró el archivo de origen para roll:', inputPath);
    return;
  }

  const srcBuf = fs.readFileSync(inputPath);
  const srcPng = PNG.sync.read(srcBuf);

  const cells = [
    { f: 0, x0: 0, x1: 313, y0: 0, y1: 511, groundY: 387 },
    { f: 1, x0: 314, x1: 627, y0: 0, y1: 511, groundY: 387 },
    { f: 2, x0: 628, x1: 941, y0: 0, y1: 511, groundY: 387 },
    { f: 3, x0: 0, x1: 313, y0: 512, y1: 1023, groundY: 483 },
    { f: 4, x0: 314, x1: 627, y0: 512, y1: 1023, groundY: 483 },
    { f: 5, x0: 628, x1: 941, y0: 512, y1: 1023, groundY: 483 },
  ];

  const CW = 300;
  const CH = 400;
  const targetGroundY = CH - 15;
  const targetCenterX = CW / 2;

  const outPng = new PNG({ width: CW * 6, height: CH });
  outPng.data.fill(0);

  cells.forEach(({ f, x0, x1, y0, y1, groundY }) => {
    const W = x1 - x0 + 1, H = y1 - y0 + 1;
    const isChar = new Uint8Array(W * H);
    const queue = [];

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = ((y0 + y) * srcPng.width + (x0 + x)) * 4;
        const r = srcPng.data[idx], g = srcPng.data[idx + 1], b = srcPng.data[idx + 2];
        if (r > 150 && g > 80 && (r - b) > 40) {
          isChar[y * W + x] = 1;
          queue.push([x, y]);
        }
      }
    }

    let head = 0;
    while (head < queue.length) {
      const [x, y] = queue[head++];
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
          const npos = ny * W + nx;
          if (!isChar[npos]) {
            const idx = ((y0 + ny) * srcPng.width + (x0 + nx)) * 4;
            const r = srcPng.data[idx], g = srcPng.data[idx + 1], b = srcPng.data[idx + 2];
            const maxC = Math.max(r, g, b);
            const minC = Math.min(r, g, b);
            const isChecker = (maxC - minC <= 14) && minC >= 65;
            if (!isChecker) {
              isChar[npos] = 1;
              queue.push([nx, ny]);
            }
          }
        }
      }
    }

    let sumX = 0, count = 0;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (isChar[y * W + x]) {
          sumX += x;
          count++;
        }
      }
    }
    const avgX = count > 0 ? (sumX / count) : (W / 2);

    const cellStartX = f * CW;
    const offsetX = Math.round(cellStartX + targetCenterX - avgX);
    const offsetY = targetGroundY - groundY;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (isChar[y * W + x]) {
          const destX = offsetX + x;
          const destY = offsetY + y;
          if (destX >= cellStartX && destX < cellStartX + CW && destY >= 0 && destY < CH) {
            const srcIdx = ((y0 + y) * srcPng.width + (x0 + x)) * 4;
            const destIdx = (destY * outPng.width + destX) * 4;
            outPng.data[destIdx] = srcPng.data[srcIdx];
            outPng.data[destIdx + 1] = srcPng.data[srcIdx + 1];
            outPng.data[destIdx + 2] = srcPng.data[srcIdx + 2];
            outPng.data[destIdx + 3] = 255;
          }
        }
      }
    }
  });

  const outBuf = PNG.sync.write(outPng);
  const targets = [
    'public/assets/sprites/player/gymrat_roll.png',
    'assets/sprites/player/gymrat_roll.png',
    'public/assets/characters/gymrat/roll.png',
  ];

  for (const t of targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t, outBuf);
  }
  console.log(`[Roll] Generado: ${CW * 6}x${CH} (6 frames: voltereta completa con bolita recortada)`);
}

function sliceGymratMelee() {
  const inputPath = path.resolve('public/assets/aistudio/image_2e9f4148.png');
  if (!fs.existsSync(inputPath)) {
    console.error('No se encontró el archivo de origen para melee:', inputPath);
    return;
  }

  const srcBuf = fs.readFileSync(inputPath);
  const srcPng = PNG.sync.read(srcBuf);
  const W = srcPng.width;

  const frameRegions = [
    { f: 0, name: 'Frame 1 (Puño prep)', x0: 10, x1: 290, y0: 30, y1: 450, groundY: 387 },
    { f: 1, name: 'Frame 2 (Puño recto)', x0: 310, x1: 635, y0: 30, y1: 450, groundY: 387 },
    { f: 2, name: 'Frame 3 (Patada prep)', x0: 645, x1: 935, y0: 30, y1: 450, groundY: 387 },
    { f: 3, name: 'Frame 4 (Patada alta)', x0: 10, x1: 360, y0: 550, y1: 1015, groundY: 995 },
    { f: 4, name: 'Frame 5 (Rodillazo/Gancho)', x0: 375, x1: 645, y0: 550, y1: 1015, groundY: 995 },
    { f: 5, name: 'Frame 6 (Recuperación/Guardia)', x0: 650, x1: 935, y0: 550, y1: 1015, groundY: 995 },
  ];

  const CW = 350;
  const CH = 400;
  const targetGroundY = CH - 15;
  const targetTorsoX = 175;

  const outPng = new PNG({ width: CW * 6, height: CH });
  outPng.data.fill(0); // 100% transparente

  frameRegions.forEach((reg) => {
    const regW = reg.x1 - reg.x0 + 1;
    const regH = reg.y1 - reg.y0 + 1;
    const isChar = new Uint8Array(regW * regH);
    const queue = [];

    // Semilla en el color de piel de Gymrat
    for (let y = 0; y < regH; y++) {
      for (let x = 0; x < regW; x++) {
        const idx = ((reg.y0 + y) * W + (reg.x0 + x)) * 4;
        const r = srcPng.data[idx], g = srcPng.data[idx + 1], b = srcPng.data[idx + 2];
        if (r > 150 && g > 80 && (r - b) > 40) {
          isChar[y * regW + x] = 1;
          queue.push([x, y]);
        }
      }
    }

    // Flood fill para bordes, cabello, botas y calzón evitando el tablero de ajedrez
    let head = 0;
    while (head < queue.length) {
      const [x, y] = queue[head++];
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < regW && ny >= 0 && ny < regH) {
          const npos = ny * regW + nx;
          if (!isChar[npos]) {
            const idx = ((reg.y0 + ny) * W + (reg.x0 + nx)) * 4;
            const r = srcPng.data[idx], g = srcPng.data[idx + 1], b = srcPng.data[idx + 2];
            const maxC = Math.max(r, g, b);
            const minC = Math.min(r, g, b);
            const isChecker = (maxC - minC <= 14) && minC >= 65;
            if (!isChecker) {
              isChar[npos] = 1;
              queue.push([nx, ny]);
            }
          }
        }
      }
    }

    // Centro del torso / cabeza ponderado para alinear el pivote
    let minY = regH, maxY = -1;
    for (let y = 0; y < regH; y++) {
      for (let x = 0; x < regW; x++) {
        if (isChar[y * regW + x]) {
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    let sumX = 0, count = 0;
    const midH = minY + Math.floor((maxY - minY) * 0.5);
    for (let y = minY; y <= midH; y++) {
      for (let x = 0; x < regW; x++) {
        if (isChar[y * regW + x]) {
          sumX += (reg.x0 + x);
          count++;
        }
      }
    }
    const torsoCenterX = count > 0 ? (sumX / count) : ((reg.x0 + reg.x1) / 2);

    const cellStartX = reg.f * CW;
    const offsetX = Math.round(cellStartX + targetTorsoX - (torsoCenterX - reg.x0));
    const offsetY = targetGroundY - (reg.groundY - reg.y0);

    for (let y = 0; y < regH; y++) {
      for (let x = 0; x < regW; x++) {
        if (isChar[y * regW + x]) {
          const destX = offsetX + x;
          const destY = offsetY + y;
          if (destX >= cellStartX && destX < cellStartX + CW && destY >= 0 && destY < CH) {
            const srcIdx = ((reg.y0 + y) * W + (reg.x0 + x)) * 4;
            const destIdx = (destY * outPng.width + destX) * 4;
            outPng.data[destIdx] = srcPng.data[srcIdx];
            outPng.data[destIdx + 1] = srcPng.data[srcIdx + 1];
            outPng.data[destIdx + 2] = srcPng.data[srcIdx + 2];
            outPng.data[destIdx + 3] = 255;
          }
        }
      }
    }
  });

  const outBuf = PNG.sync.write(outPng);
  const targets = [
    'public/assets/sprites/player/gymrat_melee.png',
    'assets/sprites/player/gymrat_melee.png',
    'public/assets/characters/gymrat/melee.png',
  ];

  for (const t of targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t, outBuf);
  }
  console.log(`[Melee] Generado: ${CW * 6}x${CH} (6 frames: combo directo, patada y gancho con fondo transparente)`);
}

function sliceGymratOneHand() {
  const inputPath = path.resolve('public/assets/aistudio/image_2a1be181.png');
  if (!fs.existsSync(inputPath)) {
    console.error('No se encontró el archivo de origen para one hand:', inputPath);
    return;
  }

  const srcBuf = fs.readFileSync(inputPath);
  const srcPng = PNG.sync.read(srcBuf);
  const W = srcPng.width;
  const H = srcPng.height;

  const frames = [
    { f: 0, name: 'Frame 1 (Guardia)', inRegion: (x, y) => x <= 221 },
    { f: 1, name: 'Frame 2 (Carga/Windup)', inRegion: (x, y) => (y < 225 ? (x >= 222 && x <= 408) : (x >= 218 && x <= 408)) },
    { f: 2, name: 'Frame 3 (Extensión/Corte)', inRegion: (x, y) => (y >= 350 ? (x >= 405 && x <= 605) : (x >= 405 && x <= 650)) },
    { f: 3, name: 'Frame 4 (Follow-through)', inRegion: (x, y) => (y >= 350 ? (x >= 606 && x <= 798) : (x >= 651 && x <= 828)) },
    { f: 4, name: 'Frame 5 (Recuperación)', inRegion: (x, y) => (y >= 350 ? (x >= 799) : (x >= 829)) },
  ];

  const CW = 300;
  const CH = 400;
  const targetGroundY = CH - 15;
  const targetTorsoX = 150;
  const groundY = 434;

  const outPng = new PNG({ width: CW * 5, height: CH });
  outPng.data.fill(0); // 100% transparente

  frames.forEach((frame) => {
    const isChar = new Uint8Array(W * H);
    const queue = [];

    // Semilla en color de piel de Gymrat dentro de la región del frame
    for (let y = 100; y <= 450; y++) {
      for (let x = 0; x < W; x++) {
        if (frame.inRegion(x, y)) {
          const idx = (y * W + x) * 4;
          const r = srcPng.data[idx], g = srcPng.data[idx + 1], b = srcPng.data[idx + 2];
          if (r > 150 && g > 80 && (r - b) > 40) {
            isChar[y * W + x] = 1;
            queue.push([x, y]);
          }
        }
      }
    }

    // Flood fill 8 direcciones restringido a la región y evitando el tablero de ajedrez
    let head = 0;
    while (head < queue.length) {
      const [x, y] = queue[head++];
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < W && ny >= 100 && ny <= 450 && frame.inRegion(nx, ny)) {
          const npos = ny * W + nx;
          if (!isChar[npos]) {
            const idx = (ny * W + nx) * 4;
            const r = srcPng.data[idx], g = srcPng.data[idx + 1], b = srcPng.data[idx + 2];
            const maxC = Math.max(r, g, b);
            const minC = Math.min(r, g, b);
            const isChecker = (maxC - minC <= 14) && minC >= 65;
            if (!isChecker) {
              isChar[npos] = 1;
              queue.push([nx, ny]);
            }
          }
        }
      }
    }

    // Bounding box y cálculo de torso
    let minY = H, maxY = -1;
    for (let y = 100; y <= 450; y++) {
      for (let x = 0; x < W; x++) {
        if (isChar[y * W + x]) {
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    let sumTorsoX = 0, torsoCount = 0;
    const midH = minY + Math.floor((maxY - minY) * 0.5);
    for (let y = minY; y <= midH; y++) {
      for (let x = 0; x < W; x++) {
        if (isChar[y * W + x]) {
          sumTorsoX += x;
          torsoCount++;
        }
      }
    }
    const torsoX = torsoCount > 0 ? (sumTorsoX / torsoCount) : 0;

    const cellStartX = frame.f * CW;
    const offsetX = Math.round(cellStartX + targetTorsoX - torsoX);
    const offsetY = targetGroundY - groundY;

    for (let y = 100; y <= 450; y++) {
      for (let x = 0; x < W; x++) {
        if (isChar[y * W + x]) {
          const destX = offsetX + x;
          const destY = offsetY + y;
          if (destX >= cellStartX && destX < cellStartX + CW && destY >= 0 && destY < CH) {
            const srcIdx = (y * W + x) * 4;
            const destIdx = (destY * outPng.width + destX) * 4;
            outPng.data[destIdx] = srcPng.data[srcIdx];
            outPng.data[destIdx + 1] = srcPng.data[srcIdx + 1];
            outPng.data[destIdx + 2] = srcPng.data[srcIdx + 2];
            outPng.data[destIdx + 3] = 255;
          }
        }
      }
    }
  });

  const outBuf = PNG.sync.write(outPng);
  const targets = [
    'public/assets/sprites/player/gymrat_one_hand_attack.png',
    'assets/sprites/player/gymrat_one_hand_attack.png',
    'public/assets/characters/gymrat/one_hand_attack.png',
  ];

  for (const t of targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t, outBuf);
  }
  console.log(`[OneHand] Generado: ${CW * 5}x${CH} (5 frames: tajo/impacto a una mano con fondo transparente)`);
}

function sliceGymratPistol() {
  const inputPath = path.resolve('public/assets/aistudio/image_398d54e5.png');
  if (!fs.existsSync(inputPath)) {
    console.error('No se encontró el archivo de origen para pistol shoot:', inputPath);
    return;
  }

  const srcBuf = fs.readFileSync(inputPath);
  const srcPng = PNG.sync.read(srcBuf);
  const W = srcPng.width;
  const H = srcPng.height;

  const frames = [
    { f: 0, name: 'Frame 1 (Aim)', inRegion: (x, y) => x < 251 },
    { f: 1, name: 'Frame 2 (Flash/Shoot)', inRegion: (x, y) => x >= 251 && (y <= 250 ? x <= 574 : x < 555) },
    { f: 2, name: 'Frame 3 (Recoil)', inRegion: (x, y) => (y <= 250 ? x >= 575 : x >= 555) && x < 765 },
    { f: 3, name: 'Frame 4 (Recovery)', inRegion: (x, y) => x >= 765 },
  ];

  const CW = 360;
  const CH = 400;
  const targetGroundY = CH - 15; // 385 (alineado idéntico a walk, run, jump, roll, melee, oneHand)
  const targetTorsoX = 175;
  const groundY = 433;

  const outPng = new PNG({ width: CW * 4, height: CH });
  outPng.data.fill(0); // 100% transparente

  frames.forEach((frame) => {
    const isChar = new Uint8Array(W * H);
    const queue = [];

    // Semilla en el color de piel de Gymrat dentro de la región del frame
    for (let y = 100; y <= 450; y++) {
      for (let x = 0; x < W; x++) {
        if (frame.inRegion(x, y)) {
          const idx = (y * W + x) * 4;
          const r = srcPng.data[idx], g = srcPng.data[idx + 1], b = srcPng.data[idx + 2];
          if (r > 150 && g > 80 && (r - b) > 40) {
            isChar[y * W + x] = 1;
            queue.push([x, y]);
          }
        }
      }
    }

    // Flood fill de 8 direcciones para capturar el cuerpo, arma y fogonazo (muzzle flash) sin fondo
    let head = 0;
    while (head < queue.length) {
      const [x, y] = queue[head++];
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < W && ny >= 100 && ny <= 450 && frame.inRegion(nx, ny)) {
          const npos = ny * W + nx;
          if (!isChar[npos]) {
            const idx = (ny * W + nx) * 4;
            const r = srcPng.data[idx], g = srcPng.data[idx + 1], b = srcPng.data[idx + 2];
            const maxC = Math.max(r, g, b);
            const minC = Math.min(r, g, b);
            const isChecker = (maxC - minC <= 14) && minC >= 65;
            if (!isChecker) {
              isChar[npos] = 1;
              queue.push([nx, ny]);
            }
          }
        }
      }
    }

    // Centro del torso para alineación estable del pivote
    let sumTorsoX = 0, torsoCount = 0;
    for (let y = 140; y <= 300; y++) {
      for (let x = 0; x < W; x++) {
        if (isChar[y * W + x]) {
          const idx = (y * W + x) * 4;
          const r = srcPng.data[idx], g = srcPng.data[idx + 1], b = srcPng.data[idx + 2];
          if (r > 180 && g > 100 && g < 160 && b < 100) {
            sumTorsoX += x;
            torsoCount++;
          }
        }
      }
    }
    const torsoX = torsoCount > 0 ? (sumTorsoX / torsoCount) : 0;
    const cellStartX = frame.f * CW;
    const offsetX = Math.round(cellStartX + targetTorsoX - torsoX);
    const offsetY = targetGroundY - groundY;

    for (let y = 100; y <= 450; y++) {
      for (let x = 0; x < W; x++) {
        if (isChar[y * W + x]) {
          const destX = offsetX + x;
          const destY = offsetY + y;
          if (destX >= cellStartX && destX < cellStartX + CW && destY >= 0 && destY < CH) {
            const srcIdx = (y * W + x) * 4;
            const destIdx = (destY * outPng.width + destX) * 4;
            outPng.data[destIdx] = srcPng.data[srcIdx];
            outPng.data[destIdx + 1] = srcPng.data[srcIdx + 1];
            outPng.data[destIdx + 2] = srcPng.data[srcIdx + 2];
            outPng.data[destIdx + 3] = 255;
          }
        }
      }
    }
  });

  const outBuf = PNG.sync.write(outPng);
  const targets = [
    'public/assets/sprites/player/gymrat_pistol_shoot.png',
    'assets/sprites/player/gymrat_pistol_shoot.png',
    'public/assets/characters/gymrat/pistol_shoot.png',
  ];

  for (const t of targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t, outBuf);
  }
  console.log(`[PistolShoot] Generado: ${CW * 4}x${CH} (4 frames: apunte, disparo con fogonazo, retroceso, recuperación)`);
}

function sliceGymratTwoHand() {
  const inputPath = path.resolve('public/assets/aistudio/image_83b492a7.png');
  if (!fs.existsSync(inputPath)) {
    console.error('No se encontró el archivo de origen para two hand attack:', inputPath);
    return;
  }

  const srcBuf = fs.readFileSync(inputPath);
  const srcPng = PNG.sync.read(srcBuf);
  const W = srcPng.width;
  const H = srcPng.height;

  const isChar = new Uint8Array(W * H);
  const queue = [];

  for (let y = 50; y < 500; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      const r = srcPng.data[idx], g = srcPng.data[idx + 1], b = srcPng.data[idx + 2];
      if (r > 150 && g > 80 && (r - b) > 40) {
        isChar[y * W + x] = 1;
        queue.push([x, y]);
      }
    }
  }

  let head = 0;
  while (head < queue.length) {
    const [x, y] = queue[head++];
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < W && ny >= 50 && ny < 500) {
        const npos = ny * W + nx;
        if (!isChar[npos]) {
          const idx = (ny * W + nx) * 4;
          const r = srcPng.data[idx], g = srcPng.data[idx + 1], b = srcPng.data[idx + 2];
          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          const isChecker = (maxC - minC <= 14) && minC >= 65;
          if (!isChecker) {
            isChar[npos] = 1;
            queue.push([nx, ny]);
          }
        }
      }
    }
  }

  const cuts = [
    { f: 0, x0: 0, x1: 170, groundY: 434 },
    { f: 1, x0: 171, x1: 340, groundY: 434 },
    { f: 2, x0: 341, x1: 515, groundY: 434 },
    { f: 3, x0: 516, x1: 685, groundY: 432 },
    { f: 4, x0: 686, x1: 855, groundY: 432 },
    { f: 5, x0: 856, x1: 1023, groundY: 432 },
  ];

  const CW = 300;
  const CH = 400;
  const targetGroundY = CH - 15;
  const targetCenterX = 150;

  const outPng = new PNG({ width: CW * 6, height: CH });
  outPng.data.fill(0);

  cuts.forEach(({ f, x0, x1, groundY }) => {
    let sumX = 0, count = 0;
    for (let y = 0; y < H; y++) {
      for (let x = x0; x <= x1; x++) {
        if (isChar[y * W + x]) {
          sumX += x;
          count++;
        }
      }
    }
    const avgX = count > 0 ? (sumX / count) : ((x0 + x1) / 2);

    const cellStartX = f * CW;
    const offsetX = Math.round(cellStartX + targetCenterX - avgX);
    const offsetY = targetGroundY - groundY;

    for (let y = 0; y < H; y++) {
      for (let x = x0; x <= x1; x++) {
        if (isChar[y * W + x]) {
          const destX = offsetX + x;
          const destY = offsetY + y;
          if (destX >= cellStartX && destX < cellStartX + CW && destY >= 0 && destY < CH) {
            const srcIdx = (y * W + x) * 4;
            const destIdx = (destY * outPng.width + destX) * 4;
            outPng.data[destIdx] = srcPng.data[srcIdx];
            outPng.data[destIdx + 1] = srcPng.data[srcIdx + 1];
            outPng.data[destIdx + 2] = srcPng.data[srcIdx + 2];
            outPng.data[destIdx + 3] = 255;
          }
        }
      }
    }
  });

  const outBuf = PNG.sync.write(outPng);
  const targets = [
    'public/assets/sprites/player/gymrat_two_hand_attack.png',
    'assets/sprites/player/gymrat_two_hand_attack.png',
    'public/assets/characters/gymrat/two_hand_attack.png',
  ];

  for (const t of targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t, outBuf);
  }
  console.log(`[TwoHand] Generado: ${CW * 6}x${CH} (6 frames: guardia, elevación, cénit, azote, impacto en suelo, recuperación)`);
}

function sliceGymratRifle() {
  const inputPath = path.resolve('public/assets/aistudio/image_bd904280.png');
  if (!fs.existsSync(inputPath)) {
    console.error('No se encontró el archivo de origen para rifle shoot:', inputPath);
    return;
  }

  const srcBuf = fs.readFileSync(inputPath);
  const srcPng = PNG.sync.read(srcBuf);
  const W = srcPng.width;
  const H = srcPng.height;

  const isChar = new Uint8Array(W * H);
  const queue = [];

  for (let y = 50; y < 500; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      const r = srcPng.data[idx], g = srcPng.data[idx + 1], b = srcPng.data[idx + 2];
      const isSkin = (r > 150 && g > 80 && (r - b) > 40);
      const isFlash = (r > 200 && g > 180 && b < 100);
      if (isSkin || isFlash) {
        isChar[y * W + x] = 1;
        queue.push([x, y]);
      }
    }
  }

  let head = 0;
  while (head < queue.length) {
    const [x, y] = queue[head++];
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < W && ny >= 50 && ny < 500) {
        const npos = ny * W + nx;
        if (!isChar[npos]) {
          const idx = (ny * W + nx) * 4;
          const r = srcPng.data[idx], g = srcPng.data[idx + 1], b = srcPng.data[idx + 2];
          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          const isChecker = (maxC - minC <= 14) && minC >= 65;
          if (!isChecker) {
            isChar[npos] = 1;
            queue.push([nx, ny]);
          }
        }
      }
    }
  }

  const cuts = [
    { f: 0, x0: 0, x1: 247, footCenter: 111 },
    { f: 1, x0: 248, x1: 538, footCenter: 356 },
    { f: 2, x0: 539, x1: 772, footCenter: 650 },
    { f: 3, x0: 773, x1: 1023, footCenter: 879 },
  ];

  const CW = 360;
  const CH = 400;
  const targetGroundY = CH - 15; // 385 (alineado idéntico a todos los spritesheets de Gymrat)
  const targetCenterX = 160;
  const groundY = 434;

  const outPng = new PNG({ width: CW * 4, height: CH });
  outPng.data.fill(0);

  cuts.forEach(({ f, x0, x1, footCenter }) => {
    const cellStartX = f * CW;
    const offsetX = Math.round(cellStartX + targetCenterX - footCenter);
    const offsetY = targetGroundY - groundY;

    for (let y = 0; y < H; y++) {
      for (let x = x0; x <= x1; x++) {
        if (isChar[y * W + x]) {
          const destX = offsetX + x;
          const destY = offsetY + y;
          if (destX >= cellStartX && destX < cellStartX + CW && destY >= 0 && destY < CH) {
            const srcIdx = (y * W + x) * 4;
            const destIdx = (destY * outPng.width + destX) * 4;
            outPng.data[destIdx] = srcPng.data[srcIdx];
            outPng.data[destIdx + 1] = srcPng.data[srcIdx + 1];
            outPng.data[destIdx + 2] = srcPng.data[srcIdx + 2];
            outPng.data[destIdx + 3] = 255;
          }
        }
      }
    }
  });

  const outBuf = PNG.sync.write(outPng);
  const targets = [
    'public/assets/sprites/player/gymrat_rifle_shoot.png',
    'assets/sprites/player/gymrat_rifle_shoot.png',
    'public/assets/characters/gymrat/rifle_shoot.png',
  ];

  for (const t of targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t, outBuf);
  }
  console.log(`[RifleShoot] Generado: ${CW * 4}x${CH} (4 frames: apunte, disparo con fogonazo, retroceso, recuperación)`);
}

function sliceGymratThrowUp() {
  const inputPath = path.resolve('public/assets/aistudio/image_b8733588.png');
  if (!fs.existsSync(inputPath)) {
    console.error('No se encontró el archivo de origen para throw up:', inputPath);
    return;
  }

  const srcBuf = fs.readFileSync(inputPath);
  const srcPng = PNG.sync.read(srcBuf);
  const W = srcPng.width;
  const H = srcPng.height;

  const frames = [
    { f: 0, inRegion: (x, y) => x <= 223 },
    { f: 1, inRegion: (x, y) => x > 223 && x <= 418 },
    { f: 2, inRegion: (x, y) => x > 418 && (y < 230 ? x <= 618 : x <= 586) },
    { f: 3, inRegion: (x, y) => (y < 175 ? (x > 618 && x <= 860) : (y < 230 ? (x > 618 && x < 830) : (x > 586 && x < 830))) },
    { f: 4, inRegion: (x, y) => (y < 175 ? x >= 865 : x >= 830) },
  ];

  const CW = 360;
  const CH = 400;
  const targetGroundY = CH - 15; // 385
  const targetTorsoX = 160;
  const groundY = 434;

  const outPng = new PNG({ width: CW * 5, height: CH });
  outPng.data.fill(0);

  frames.forEach((frame) => {
    const isChar = new Uint8Array(W * H);
    const queue = [];

    for (let y = 100; y <= 450; y++) {
      for (let x = 0; x < W; x++) {
        if (frame.inRegion(x, y)) {
          const idx = (y * W + x) * 4;
          const r = srcPng.data[idx], g = srcPng.data[idx + 1], b = srcPng.data[idx + 2];
          if (r > 150 && g > 80 && (r - b) > 40) {
            isChar[y * W + x] = 1;
            queue.push([x, y]);
          }
        }
      }
    }

    let head = 0;
    while (head < queue.length) {
      const [x, y] = queue[head++];
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < W && ny >= 100 && ny <= 450 && frame.inRegion(nx, ny)) {
          const npos = ny * W + nx;
          if (!isChar[npos]) {
            const idx = (ny * W + nx) * 4;
            const r = srcPng.data[idx], g = srcPng.data[idx + 1], b = srcPng.data[idx + 2];
            const maxC = Math.max(r, g, b);
            const minC = Math.min(r, g, b);
            const isChecker = (maxC - minC <= 14) && minC >= 65;
            if (!isChecker) {
              isChar[npos] = 1;
              queue.push([nx, ny]);
            }
          }
        }
      }
    }

    let sumTorsoX = 0, torsoCount = 0;
    for (let y = 140; y <= 300; y++) {
      for (let x = 0; x < W; x++) {
        if (isChar[y * W + x]) {
          const idx = (y * W + x) * 4;
          const r = srcPng.data[idx], g = srcPng.data[idx + 1], b = srcPng.data[idx + 2];
          if (r > 180 && g > 100 && g < 160 && b < 100) {
            sumTorsoX += x;
            torsoCount++;
          }
        }
      }
    }
    const torsoX = torsoCount > 0 ? (sumTorsoX / torsoCount) : 0;
    const cellStartX = frame.f * CW;
    const offsetX = Math.round(cellStartX + targetTorsoX - torsoX);
    const offsetY = targetGroundY - groundY;

    for (let y = 100; y <= 450; y++) {
      for (let x = 0; x < W; x++) {
        if (isChar[y * W + x]) {
          const destX = offsetX + x;
          const destY = offsetY + y;
          if (destX >= cellStartX && destX < cellStartX + CW && destY >= 0 && destY < CH) {
            const srcIdx = (y * W + x) * 4;
            const destIdx = (destY * outPng.width + destX) * 4;
            outPng.data[destIdx] = srcPng.data[srcIdx];
            outPng.data[destIdx + 1] = srcPng.data[srcIdx + 1];
            outPng.data[destIdx + 2] = srcPng.data[srcIdx + 2];
            outPng.data[destIdx + 3] = 255;
          }
        }
      }
    }
  });

  const outBuf = PNG.sync.write(outPng);
  const targets = [
    'public/assets/sprites/player/gymrat_throw_up.png',
    'assets/sprites/player/gymrat_throw_up.png',
    'public/assets/characters/gymrat/throw_up.png',
    'dist/assets/sprites/player/gymrat_throw_up.png',
    'dist/assets/characters/gymrat/throw_up.png',
  ];

  for (const t of targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t, outBuf);
  }
  console.log(`[ThrowUp] Generado: ${CW * 5}x${CH} (5 frames: guardia, windup, release, follow-through, recuperación)`);
}

sliceGymratWalk();
sliceGymratRun();
sliceGymratJump();
sliceGymratRoll();
sliceGymratMelee();
sliceGymratOneHand();
sliceGymratPistol();
sliceGymratTwoHand();
sliceGymratRifle();
sliceGymratThrowUp();

export { sliceGymratWalk, sliceGymratRun, sliceGymratJump, sliceGymratRoll, sliceGymratMelee, sliceGymratOneHand, sliceGymratPistol, sliceGymratTwoHand, sliceGymratRifle, sliceGymratThrowUp };



