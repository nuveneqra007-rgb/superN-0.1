import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const inputPath = path.resolve('public/assets/aistudio/image_64431225.png');
const srcBuf = fs.readFileSync(inputPath);
const srcPng = PNG.sync.read(srcBuf);
console.log(`Dimensions: ${srcPng.width}x${srcPng.height}`);

const W = srcPng.width;
const H = Math.floor(srcPng.height / 2); // Row 1

function isBgColor(r, g, b) {
  const maxC = Math.max(r, g, b);
  const minC = Math.min(r, g, b);
  return (maxC - minC <= 14 && minC >= 70 && maxC <= 220);
}

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

// Check non-bg pixels across X
const nonBgColCount = new Int32Array(W);
for (let x = 0; x < W; x++) {
  for (let y = 0; y < H; y++) {
    if (!isBg[y * W + x]) nonBgColCount[x]++;
  }
}

let inSprite = false;
let start = 0;
const spans = [];
for (let x = 0; x < W; x++) {
  if (nonBgColCount[x] > 0) {
    if (!inSprite) {
      inSprite = true;
      start = x;
    }
  } else {
    if (inSprite) {
      inSprite = false;
      spans.push({ start, end: x - 1, width: x - start });
    }
  }
}
if (inSprite) spans.push({ start, end: W - 1, width: W - start });

console.log('Detected spans in row 1:', JSON.stringify(spans, null, 2));

spans.forEach((span, i) => {
  let minY = 9999, maxY = -1, minFeetX = 9999, maxFeetX = -1;
  for (let y = 0; y < H; y++) {
    for (let x = span.start; x <= span.end; x++) {
      if (!isBg[y * W + x]) {
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (y >= H - 25) {
          if (x < minFeetX) minFeetX = x;
          if (x > maxFeetX) maxFeetX = x;
        }
      }
    }
  }
  console.log(`Span ${i}: X=[${span.start}..${span.end}], Y=[${minY}..${maxY}], feet maxY=${maxY}, feetCenter=${Math.round((minFeetX + maxFeetX)/2)}`);
});
