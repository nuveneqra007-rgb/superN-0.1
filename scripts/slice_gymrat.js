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

sliceGymratWalk();
sliceGymratRun();
sliceGymratJump();
sliceGymratRoll();

export { sliceGymratWalk, sliceGymratRun, sliceGymratJump, sliceGymratRoll };

