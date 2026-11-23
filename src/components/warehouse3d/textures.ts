// ==============================================================================
// textures.ts — Generador Procedural de Texturas PBR para Warehouse 09 (3D)
// Cero dependencias externas (Zero-404): genera mapas Albedo (sRGB), Roughness,
// Bump, Alpha y Emissive en memoria con soporte de filtrado anisotrópico.
// ==============================================================================

import * as THREE from 'three';

export interface WarehouseTextureSet {
  concreteColor: THREE.CanvasTexture;
  concreteRoughness: THREE.CanvasTexture;
  concreteBump: THREE.CanvasTexture;
  puddleMask: THREE.CanvasTexture;
  steelWallColor: THREE.CanvasTexture;
  steelWallRoughness: THREE.CanvasTexture;
  steelWallBump: THREE.CanvasTexture;
  graffitiLeftColor: THREE.CanvasTexture;
  graffitiBackColor: THREE.CanvasTexture;
  graffitiRightColor: THREE.CanvasTexture;
  woodCrateColor: THREE.CanvasTexture;
  woodCrateBump: THREE.CanvasTexture;
  woodCrateRoughness: THREE.CanvasTexture;
  grateAlpha: THREE.CanvasTexture;
  grateColor: THREE.CanvasTexture;
  drumRedColor: THREE.CanvasTexture;
  drumTealColor: THREE.CanvasTexture;
  drumRoughness: THREE.CanvasTexture;
  cityColor: THREE.CanvasTexture;
  cityEmissive: THREE.CanvasTexture;
  lampGlowMap: THREE.CanvasTexture;
  dispose: () => void;
}

// PRNG determinista rápido para texturas consistentes entre cargas
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas context unavailable');
  }
  return [canvas, ctx];
}

export function createWarehouseTextures(maxAnisotropy: number): WarehouseTextureSet {
  const created: THREE.Texture[] = [];
  const register = (
    canvas: HTMLCanvasElement,
    isColor: boolean,
    repeatX = 1,
    repeatY = 1
  ): THREE.CanvasTexture => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.anisotropy = Math.min(8, Math.max(1, maxAnisotropy));
    tex.needsUpdate = true;
    created.push(tex);
    return tex;
  };

  // ---------------------------------------------------------------------------
  // 1. Suelo de Hormigón Húmedo, Grietas y Mapa de Charcos
  // ---------------------------------------------------------------------------
  const floorSize = 1024;
  const [fColCanvas, fColCtx] = makeCanvas(floorSize, floorSize);
  const [fRoughCanvas, fRoughCtx] = makeCanvas(floorSize, floorSize);
  const [fBumpCanvas, fBumpCtx] = makeCanvas(floorSize, floorSize);
  const [puddleCanvas, puddleCtx] = makeCanvas(floorSize, floorSize);
  const randFloor = mulberry32(901);

  fColCtx.fillStyle = '#252930';
  fColCtx.fillRect(0, 0, floorSize, floorSize);
  fRoughCtx.fillStyle = '#d4d4d4'; // ~0.83 roughness en hormigón seco
  fRoughCtx.fillRect(0, 0, floorSize, floorSize);
  fBumpCtx.fillStyle = '#808080';
  fBumpCtx.fillRect(0, 0, floorSize, floorSize);
  puddleCtx.fillStyle = '#000000';
  puddleCtx.fillRect(0, 0, floorSize, floorSize);

  // Grano mineral y manchas de aceite/humedad
  for (let i = 0; i < 4200; i++) {
    const x = randFloor() * floorSize;
    const y = randFloor() * floorSize;
    const r = 1 + randFloor() * 5;
    const shade = 26 + Math.floor(randFloor() * 28);
    fColCtx.fillStyle = `rgba(${shade}, ${shade + 3}, ${shade + 7}, 0.28)`;
    fColCtx.fillRect(x, y, r, r);

    const bVal = 110 + Math.floor(randFloor() * 36);
    fBumpCtx.fillStyle = `rgba(${bVal}, ${bVal}, ${bVal}, 0.32)`;
    fBumpCtx.fillRect(x, y, r, r);
  }

  // Juntas de losas industriales
  fColCtx.strokeStyle = 'rgba(10, 12, 16, 0.72)';
  fColCtx.lineWidth = 4;
  fBumpCtx.strokeStyle = 'rgb(42, 42, 42)';
  fBumpCtx.lineWidth = 5;
  for (let g = 0; g <= floorSize; g += 256) {
    fColCtx.beginPath();
    fColCtx.moveTo(g, 0);
    fColCtx.lineTo(g, floorSize);
    fColCtx.moveTo(0, g);
    fColCtx.lineTo(floorSize, g);
    fColCtx.stroke();

    fBumpCtx.beginPath();
    fBumpCtx.moveTo(g, 0);
    fBumpCtx.lineTo(g, floorSize);
    fBumpCtx.moveTo(0, g);
    fBumpCtx.lineTo(floorSize, g);
    fBumpCtx.stroke();
  }

  // Grietas orgánicas en hormigón
  for (let c = 0; c < 14; c++) {
    let cx = randFloor() * floorSize;
    let cy = randFloor() * floorSize;
    let angle = randFloor() * Math.PI * 2;
    fColCtx.strokeStyle = 'rgba(11, 13, 16, 0.75)';
    fColCtx.lineWidth = 1.6;
    fBumpCtx.strokeStyle = 'rgb(28, 28, 28)';
    fBumpCtx.lineWidth = 2.4;
    fColCtx.beginPath();
    fBumpCtx.beginPath();
    fColCtx.moveTo(cx, cy);
    fBumpCtx.moveTo(cx, cy);
    const segs = 10 + Math.floor(randFloor() * 14);
    for (let s = 0; s < segs; s++) {
      angle += (randFloor() - 0.5) * 0.9;
      cx += Math.cos(angle) * (12 + randFloor() * 18);
      cy += Math.sin(angle) * (12 + randFloor() * 18);
      fColCtx.lineTo(cx, cy);
      fBumpCtx.lineTo(cx, cy);
    }
    fColCtx.stroke();
    fBumpCtx.stroke();
  }

  // Zonas de charcos húmedos (rugosidad muy baja = reflejo intenso, color más oscuro)
  const puddleCenters = [
    { x: 0.48, y: 0.56, rx: 195, ry: 118, rot: -0.15 },
    { x: 0.30, y: 0.44, rx: 135, ry: 85, rot: 0.25 },
    { x: 0.69, y: 0.49, rx: 155, ry: 95, rot: -0.22 },
    { x: 0.52, y: 0.32, rx: 120, ry: 72, rot: 0.1 },
    { x: 0.22, y: 0.71, rx: 110, ry: 68, rot: -0.3 },
    { x: 0.78, y: 0.70, rx: 125, ry: 75, rot: 0.18 },
  ];

  for (const p of puddleCenters) {
    const px = p.x * floorSize;
    const py = p.y * floorSize;

    // Oscurece el hormigón húmedo alrededor del charco
    fColCtx.save();
    fColCtx.translate(px, py);
    fColCtx.rotate(p.rot);
    const colGrad = fColCtx.createRadialGradient(0, 0, p.rx * 0.15, 0, 0, p.rx * 1.15);
    colGrad.addColorStop(0, 'rgba(8, 11, 16, 0.72)');
    colGrad.addColorStop(0.65, 'rgba(13, 16, 22, 0.45)');
    colGrad.addColorStop(1, 'rgba(13, 16, 22, 0)');
    fColCtx.fillStyle = colGrad;
    fColCtx.scale(1, p.ry / p.rx);
    fColCtx.beginPath();
    fColCtx.arc(0, 0, p.rx * 1.15, 0, Math.PI * 2);
    fColCtx.fill();
    fColCtx.restore();

    // Baja rugosidad en el mapa (negro = espejo húmedo, gris claro = seco)
    fRoughCtx.save();
    fRoughCtx.translate(px, py);
    fRoughCtx.rotate(p.rot);
    const rGrad = fRoughCtx.createRadialGradient(0, 0, p.rx * 0.2, 0, 0, p.rx);
    rGrad.addColorStop(0, 'rgba(12, 12, 12, 0.96)');
    rGrad.addColorStop(0.55, 'rgba(32, 32, 32, 0.9)');
    rGrad.addColorStop(1, 'rgba(212, 212, 212, 0)');
    fRoughCtx.fillStyle = rGrad;
    fRoughCtx.scale(1, p.ry / p.rx);
    fRoughCtx.beginPath();
    fRoughCtx.arc(0, 0, p.rx, 0, Math.PI * 2);
    fRoughCtx.fill();
    fRoughCtx.restore();

    // Máscara clara de charcos para la capa clearcoat
    puddleCtx.save();
    puddleCtx.translate(px, py);
    puddleCtx.rotate(p.rot);
    const mGrad = puddleCtx.createRadialGradient(0, 0, p.rx * 0.25, 0, 0, p.rx * 0.95);
    mGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    mGrad.addColorStop(0.7, 'rgba(210, 210, 210, 0.85)');
    mGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    puddleCtx.fillStyle = mGrad;
    puddleCtx.scale(1, p.ry / p.rx);
    puddleCtx.beginPath();
    puddleCtx.arc(0, 0, p.rx * 0.95, 0, Math.PI * 2);
    puddleCtx.fill();
    puddleCtx.restore();
  }

  const concreteColor = register(fColCanvas, true, 1, 1);
  const concreteRoughness = register(fRoughCanvas, false, 1, 1);
  const concreteBump = register(fBumpCanvas, false, 1, 1);
  const puddleMask = register(puddleCanvas, false, 1, 1);

  // ---------------------------------------------------------------------------
  // 2. Chapa Metálica Acanalada y Oxidada (Muros y Techo)
  // ---------------------------------------------------------------------------
  const wallSize = 512;
  const [wColCanvas, wColCtx] = makeCanvas(wallSize, wallSize);
  const [wRoughCanvas, wRoughCtx] = makeCanvas(wallSize, wallSize);
  const [wBumpCanvas, wBumpCtx] = makeCanvas(wallSize, wallSize);
  const randWall = mulberry32(412);

  wColCtx.fillStyle = '#242b33';
  wColCtx.fillRect(0, 0, wallSize, wallSize);
  wRoughCtx.fillStyle = '#8e8e8e';
  wRoughCtx.fillRect(0, 0, wallSize, wallSize);
  wBumpCtx.fillStyle = '#808080';
  wBumpCtx.fillRect(0, 0, wallSize, wallSize);

  const ribCount = 16;
  const ribW = wallSize / ribCount;
  for (let i = 0; i < ribCount; i++) {
    const x = i * ribW;
    const gradCol = wColCtx.createLinearGradient(x, 0, x + ribW, 0);
    gradCol.addColorStop(0, '#181d24');
    gradCol.addColorStop(0.28, '#2d3640');
    gradCol.addColorStop(0.55, '#394450');
    gradCol.addColorStop(0.85, '#1d232a');
    gradCol.addColorStop(1, '#161a20');
    wColCtx.fillStyle = gradCol;
    wColCtx.fillRect(x, 0, ribW, wallSize);

    const gradBump = wBumpCtx.createLinearGradient(x, 0, x + ribW, 0);
    gradBump.addColorStop(0, '#444444');
    gradBump.addColorStop(0.45, '#dadada');
    gradBump.addColorStop(1, '#444444');
    wBumpCtx.fillStyle = gradBump;
    wBumpCtx.fillRect(x, 0, ribW, wallSize);
  }

  // Juntas horizontales de paneles y remaches
  for (const hy of [128, 256, 384]) {
    wColCtx.fillStyle = 'rgba(10, 12, 15, 0.72)';
    wColCtx.fillRect(0, hy, wallSize, 4);
    wBumpCtx.fillStyle = '#222222';
    wBumpCtx.fillRect(0, hy, wallSize, 4);
  }

  // Chorretones de óxido y mugre industrial
  for (let r = 0; r < 34; r++) {
    const rx = randWall() * wallSize;
    const ry = randWall() * wallSize;
    const rw = 8 + randWall() * 28;
    const rh = 35 + randWall() * 140;
    const rGrad = wColCtx.createLinearGradient(rx, ry, rx, ry + rh);
    rGrad.addColorStop(0, 'rgba(118, 52, 24, 0.62)');
    rGrad.addColorStop(0.5, 'rgba(84, 35, 16, 0.4)');
    rGrad.addColorStop(1, 'rgba(60, 26, 14, 0)');
    wColCtx.fillStyle = rGrad;
    wColCtx.fillRect(rx, ry, rw, rh);

    // El óxido es mucho más áspero que el acero
    wRoughCtx.fillStyle = 'rgba(235, 235, 235, 0.75)';
    wRoughCtx.fillRect(rx, ry, rw, rh * 0.7);
  }

  const steelWallColor = register(wColCanvas, true, 3, 2);
  const steelWallRoughness = register(wRoughCanvas, false, 3, 2);
  const steelWallBump = register(wBumpCanvas, false, 3, 2);

  // ---------------------------------------------------------------------------
  // 3. Paneles de Grafiti Warehouse 09 (Izquierda, Fondo, Derecha)
  // ---------------------------------------------------------------------------
  const drawGraffitiPanel = (
    labels: Array<{ text: string; x: number; y: number; size: number; color: string; rot: number; font?: string }>
  ): THREE.CanvasTexture => {
    const [gCanvas, gCtx] = makeCanvas(512, 512);
    gCtx.drawImage(wColCanvas, 0, 0);

    // Capa de humedad y desgaste base
    const dirt = gCtx.createLinearGradient(0, 0, 0, 512);
    dirt.addColorStop(0, 'rgba(8, 10, 14, 0.35)');
    dirt.addColorStop(0.5, 'rgba(12, 14, 18, 0.12)');
    dirt.addColorStop(1, 'rgba(6, 7, 9, 0.68)');
    gCtx.fillStyle = dirt;
    gCtx.fillRect(0, 0, 512, 512);

    for (const item of labels) {
      gCtx.save();
      gCtx.translate(item.x, item.y);
      gCtx.rotate(item.rot);
      gCtx.font = item.font ?? `900 ${item.size}px "Chakra Petch", Impact, sans-serif`;
      gCtx.textBaseline = 'middle';
      // Halo spray exterior
      gCtx.shadowColor = item.color;
      gCtx.shadowBlur = 10;
      gCtx.fillStyle = item.color;
      gCtx.globalAlpha = 0.76;
      gCtx.fillText(item.text, 0, 0);
      // Goteos de spray
      gCtx.shadowBlur = 0;
      gCtx.globalAlpha = 0.45;
      for (let d = 0; d < 6; d++) {
        const dx = (d * 23) % Math.max(40, item.text.length * item.size * 0.45);
        gCtx.fillRect(dx, item.size * 0.35, 3, 14 + (d % 3) * 11);
      }
      gCtx.restore();
    }

    return register(gCanvas, true, 1, 1);
  };

  const graffitiLeftColor = drawGraffitiPanel([
    { text: 'WAREHOUSE 09', x: 38, y: 84, size: 50, color: '#cbd5e1', rot: -0.04 },
    { text: 'FIGHTERS', x: 56, y: 245, size: 62, color: '#67e8f9', rot: -0.07 },
    { text: 'SCRAP', x: 255, y: 390, size: 44, color: '#f59e0b', rot: 0.05 },
  ]);

  const graffitiBackColor = drawGraffitiPanel([
    { text: 'FIGHTERS', x: 75, y: 210, size: 46, color: '#94a3b8', rot: -0.05 },
    { text: 'NO EXIT', x: 300, y: 315, size: 42, color: '#ea580c', rot: 0.02 },
  ]);

  const graffitiRightColor = drawGraffitiPanel([
    { text: 'DANGER', x: 155, y: 295, size: 54, color: '#dc2626', rot: -0.03 },
    { text: 'SCRAP', x: 90, y: 170, size: 40, color: '#94a3b8', rot: 0.06 },
  ]);

  // ---------------------------------------------------------------------------
  // 4. Madera Industrial para Cajas Reforzadas
  // ---------------------------------------------------------------------------
  const woodSize = 512;
  const [wdColC, wdColCtx] = makeCanvas(woodSize, woodSize);
  const [wdBumpC, wdBumpCtx] = makeCanvas(woodSize, woodSize);
  const [wdRoughC, wdRoughCtx] = makeCanvas(woodSize, woodSize);
  const randWood = mulberry32(777);

  wdColCtx.fillStyle = '#4e3927';
  wdColCtx.fillRect(0, 0, woodSize, woodSize);
  wdBumpCtx.fillStyle = '#888888';
  wdBumpCtx.fillRect(0, 0, woodSize, woodSize);
  wdRoughCtx.fillStyle = '#dcdcdc';
  wdRoughCtx.fillRect(0, 0, woodSize, woodSize);

  const plankH = woodSize / 5;
  for (let p = 0; p < 5; p++) {
    const py = p * plankH;
    const tone = (randWood() - 0.5) * 18;
    wdColCtx.fillStyle = `rgb(${78 + tone}, ${56 + tone * 0.7}, ${38 + tone * 0.5})`;
    wdColCtx.fillRect(0, py + 2, woodSize, plankH - 4);

    // Vetas de madera
    for (let v = 0; v < 28; v++) {
      const vy = py + 5 + randWood() * (plankH - 10);
      wdColCtx.strokeStyle = `rgba(34, 22, 13, ${0.18 + randWood() * 0.25})`;
      wdColCtx.lineWidth = 1 + randWood() * 2;
      wdColCtx.beginPath();
      wdColCtx.moveTo(0, vy);
      wdColCtx.bezierCurveTo(170, vy + (randWood() - 0.5) * 8, 340, vy + (randWood() - 0.5) * 8, woodSize, vy);
      wdColCtx.stroke();

      wdBumpCtx.strokeStyle = 'rgba(110, 110, 110, 0.35)';
      wdBumpCtx.beginPath();
      wdBumpCtx.moveTo(0, vy);
      wdBumpCtx.lineTo(woodSize, vy);
      wdBumpCtx.stroke();
    }

    // Separación oscura entre tablones
    wdColCtx.fillStyle = '#1b130d';
    wdColCtx.fillRect(0, py, woodSize, 3);
    wdBumpCtx.fillStyle = '#242424';
    wdBumpCtx.fillRect(0, py, woodSize, 4);
  }

  // Sello stencil discreto en la caja
  wdColCtx.fillStyle = 'rgba(20, 16, 12, 0.55)';
  wdColCtx.font = 'bold 34px monospace';
  wdColCtx.fillText('WH-09', 36, 225);

  const woodCrateColor = register(wdColC, true, 1, 1);
  const woodCrateBump = register(wdBumpC, false, 1, 1);
  const woodCrateRoughness = register(wdRoughC, false, 1, 1);

  // ---------------------------------------------------------------------------
  // 5. Rejilla Metálica Perforada de Pasarelas
  // ---------------------------------------------------------------------------
  const grateSize = 256;
  const [grColC, grColCtx] = makeCanvas(grateSize, grateSize);
  const [grAlphaC, grAlphaCtx] = makeCanvas(grateSize, grateSize);

  grColCtx.fillStyle = '#3c4550';
  grColCtx.fillRect(0, 0, grateSize, grateSize);
  grAlphaCtx.fillStyle = '#ffffff';
  grAlphaCtx.fillRect(0, 0, grateSize, grateSize);

  const step = 32;
  for (let gx = 4; gx < grateSize; gx += step) {
    for (let gy = 4; gy < grateSize; gy += step) {
      grAlphaCtx.fillStyle = '#000000';
      grAlphaCtx.fillRect(gx, gy, step - 9, step - 9);
      grColCtx.fillStyle = '#20262e';
      grColCtx.fillRect(gx - 1, gy - 1, step - 7, step - 7);
    }
  }

  const grateColor = register(grColC, true, 5, 2);
  const grateAlpha = register(grAlphaC, false, 5, 2);

  // ---------------------------------------------------------------------------
  // 6. Bidones Metálicos Desgastados
  // ---------------------------------------------------------------------------
  const makeDrumColor = (baseHex: string, stripeHex: string, seed: number) => {
    const [dC, dCtx] = makeCanvas(256, 256);
    const rng = mulberry32(seed);
    dCtx.fillStyle = baseHex;
    dCtx.fillRect(0, 0, 256, 256);
    dCtx.fillStyle = stripeHex;
    dCtx.fillRect(0, 96, 256, 48);

    for (let i = 0; i < 60; i++) {
      const rx = rng() * 256;
      const ry = rng() * 256;
      const rw = 8 + rng() * 34;
      const rh = 4 + rng() * 22;
      dCtx.fillStyle = `rgba(92, 42, 20, ${0.28 + rng() * 0.45})`;
      dCtx.fillRect(rx, ry, rw, rh);
    }
    return register(dC, true, 1, 1);
  };

  const drumRedColor = makeDrumColor('#6f241f', '#9b6b3a', 101);
  const drumTealColor = makeDrumColor('#1f424a', '#5f767b', 202);

  const [drRoughC, drRoughCtx] = makeCanvas(256, 256);
  drRoughCtx.fillStyle = '#7c7c7c';
  drRoughCtx.fillRect(0, 0, 256, 256);
  const rngDr = mulberry32(303);
  for (let i = 0; i < 80; i++) {
    const v = Math.floor(140 + rngDr() * 105);
    drRoughCtx.fillStyle = `rgb(${v},${v},${v})`;
    drRoughCtx.fillRect(rngDr() * 256, rngDr() * 256, 12 + rngDr() * 24, 6 + rngDr() * 18);
  }
  const drumRoughness = register(drRoughC, false, 1, 1);

  // ---------------------------------------------------------------------------
  // 7. Horizonte Urbano Nocturno tras los Ventanales
  // ---------------------------------------------------------------------------
  const [cityColC, cityColCtx] = makeCanvas(1024, 512);
  const [cityEmC, cityEmCtx] = makeCanvas(1024, 512);
  const randCity = mulberry32(555);

  const skyGrad = cityColCtx.createLinearGradient(0, 0, 0, 512);
  skyGrad.addColorStop(0, '#070d19');
  skyGrad.addColorStop(0.65, '#101d34');
  skyGrad.addColorStop(1, '#1a2740');
  cityColCtx.fillStyle = skyGrad;
  cityColCtx.fillRect(0, 0, 1024, 512);

  cityEmCtx.fillStyle = '#03060c';
  cityEmCtx.fillRect(0, 0, 1024, 512);

  // Siluetas de edificios y cuadrículas de ventanas encendidas
  let bx = 0;
  while (bx < 1024) {
    const bw = 42 + Math.floor(randCity() * 68);
    const bh = 160 + Math.floor(randCity() * 270);
    const by = 512 - bh;

    cityColCtx.fillStyle = '#090e18';
    cityColCtx.fillRect(bx, by, bw - 4, bh);

    // Aguja o antena ocasional
    if (randCity() > 0.65) {
      cityColCtx.fillStyle = '#0c1320';
      cityColCtx.fillRect(bx + bw * 0.45, by - 36, 4, 36);
      cityEmCtx.fillStyle = '#ef4444';
      cityEmCtx.fillRect(bx + bw * 0.45 - 1, by - 38, 6, 5);
    }

    const cols = Math.max(2, Math.floor((bw - 14) / 11));
    const rows = Math.max(4, Math.floor((bh - 20) / 14));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (randCity() > 0.56) {
          const wx = bx + 7 + c * 11;
          const wy = by + 12 + r * 14;
          const warm = randCity() > 0.48;
          const wColor = warm
            ? randCity() > 0.4
              ? '#fbbf24'
              : '#fb923c'
            : '#7dd3fc';
          cityEmCtx.fillStyle = wColor;
          cityEmCtx.globalAlpha = 0.45 + randCity() * 0.55;
          cityEmCtx.fillRect(wx, wy, 5, 7);
          cityColCtx.fillStyle = wColor;
          cityColCtx.fillRect(wx, wy, 5, 7);
        }
      }
    }
    cityEmCtx.globalAlpha = 1;
    bx += bw;
  }

  // Resplandor urbano suave en la base del horizonte
  const horizonEm = cityEmCtx.createLinearGradient(0, 290, 0, 512);
  horizonEm.addColorStop(0, 'rgba(30, 58, 108, 0)');
  horizonEm.addColorStop(1, 'rgba(56, 105, 175, 0.35)');
  cityEmCtx.fillStyle = horizonEm;
  cityEmCtx.fillRect(0, 290, 1024, 222);

  const cityColor = register(cityColC, true, 1, 1);
  cityColor.wrapS = THREE.ClampToEdgeWrapping;
  cityColor.wrapT = THREE.ClampToEdgeWrapping;

  const cityEmissive = register(cityEmC, true, 1, 1);
  cityEmissive.wrapS = THREE.ClampToEdgeWrapping;
  cityEmissive.wrapT = THREE.ClampToEdgeWrapping;

  // ---------------------------------------------------------------------------
  // 8. Halo Suave Radial para Conos/Brillos de Lámparas
  // ---------------------------------------------------------------------------
  const [lgC, lgCtx] = makeCanvas(256, 256);
  const rad = lgCtx.createRadialGradient(128, 128, 4, 128, 128, 124);
  rad.addColorStop(0, 'rgba(255, 224, 170, 1)');
  rad.addColorStop(0.28, 'rgba(255, 138, 48, 0.65)');
  rad.addColorStop(0.65, 'rgba(220, 65, 15, 0.16)');
  rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  lgCtx.fillStyle = rad;
  lgCtx.fillRect(0, 0, 256, 256);
  const lampGlowMap = register(lgC, true, 1, 1);
  lampGlowMap.wrapS = THREE.ClampToEdgeWrapping;
  lampGlowMap.wrapT = THREE.ClampToEdgeWrapping;

  return {
    concreteColor,
    concreteRoughness,
    concreteBump,
    puddleMask,
    steelWallColor,
    steelWallRoughness,
    steelWallBump,
    graffitiLeftColor,
    graffitiBackColor,
    graffitiRightColor,
    woodCrateColor,
    woodCrateBump,
    woodCrateRoughness,
    grateAlpha,
    grateColor,
    drumRedColor,
    drumTealColor,
    drumRoughness,
    cityColor,
    cityEmissive,
    lampGlowMap,
    dispose: () => {
      for (const tex of created) {
        tex.dispose();
      }
    },
  };
}
