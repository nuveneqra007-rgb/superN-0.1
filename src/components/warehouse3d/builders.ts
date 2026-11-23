// ==============================================================================
// builders.ts — Ensambladores Modulares 3D del Almacén Clandestino (Warehouse 09)
// Cada objeto principal se construye como un THREE.Group compuesto (3–12+ partes)
// con pivotes apoyados en el suelo, variación de rugosidad (>= 0.25) y cero 404.
// ==============================================================================

import * as THREE from 'three';
import { WarehouseTextureSet } from './textures';

export interface HangingLampRig {
  pivot: THREE.Group;
  light: THREE.PointLight;
  bulbMat: THREE.MeshStandardMaterial;
  haloMesh: THREE.Mesh;
  baseIntensity: number;
  phase: number;
  swaySpeed: number;
  swayAmp: number;
}

export interface RippleRing {
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  phase: number;
  speed: number;
}

export interface WarehouseMaterials {
  concreteFloor: THREE.MeshPhysicalMaterial;
  corrugatedWall: THREE.MeshStandardMaterial;
  graffitiLeft: THREE.MeshStandardMaterial;
  graffitiBack: THREE.MeshStandardMaterial;
  graffitiRight: THREE.MeshStandardMaterial;
  structuralSteel: THREE.MeshStandardMaterial;
  darkIron: THREE.MeshStandardMaterial;
  rustedPipe: THREE.MeshStandardMaterial;
  catwalkGrate: THREE.MeshStandardMaterial;
  woodCrate: THREE.MeshStandardMaterial;
  woodTrim: THREE.MeshStandardMaterial;
  drumRed: THREE.MeshStandardMaterial;
  drumTeal: THREE.MeshStandardMaterial;
  brokenGlass: THREE.MeshPhysicalMaterial;
  cityMat: THREE.MeshStandardMaterial;
  lampShade: THREE.MeshStandardMaterial;
  dispose: () => void;
}

export function createWarehouseMaterials(
  tex: WarehouseTextureSet,
  isSoftwareGl: boolean
): WarehouseMaterials {
  const created: THREE.Material[] = [];
  const track = <T extends THREE.Material>(m: T): T => {
    created.push(m);
    return m;
  };

  const concreteFloor = track(
    new THREE.MeshPhysicalMaterial({
      map: tex.concreteColor,
      roughnessMap: tex.concreteRoughness,
      bumpMap: tex.concreteBump,
      bumpScale: 0.035,
      roughness: 0.94,
      metalness: 0.06,
      clearcoat: 1.0,
      clearcoatMap: tex.puddleMask,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.25,
    })
  );

  const corrugatedWall = track(
    new THREE.MeshStandardMaterial({
      map: tex.steelWallColor,
      roughnessMap: tex.steelWallRoughness,
      bumpMap: tex.steelWallBump,
      bumpScale: 0.045,
      roughness: 0.85,
      metalness: 0.45,
    })
  );

  const graffitiLeft = track(
    new THREE.MeshStandardMaterial({
      map: tex.graffitiLeftColor,
      roughnessMap: tex.steelWallRoughness,
      bumpMap: tex.steelWallBump,
      bumpScale: 0.04,
      roughness: 0.82,
      metalness: 0.35,
    })
  );

  const graffitiBack = track(
    new THREE.MeshStandardMaterial({
      map: tex.graffitiBackColor,
      roughnessMap: tex.steelWallRoughness,
      bumpMap: tex.steelWallBump,
      bumpScale: 0.04,
      roughness: 0.84,
      metalness: 0.35,
    })
  );

  const graffitiRight = track(
    new THREE.MeshStandardMaterial({
      map: tex.graffitiRightColor,
      roughnessMap: tex.steelWallRoughness,
      bumpMap: tex.steelWallBump,
      bumpScale: 0.04,
      roughness: 0.84,
      metalness: 0.35,
    })
  );

  const structuralSteel = track(
    new THREE.MeshStandardMaterial({
      color: 0x2a313a,
      roughness: 0.48,
      metalness: 0.82,
    })
  );

  const darkIron = track(
    new THREE.MeshStandardMaterial({
      color: 0x16191e,
      roughness: 0.62,
      metalness: 0.72,
    })
  );

  const rustedPipe = track(
    new THREE.MeshStandardMaterial({
      color: 0x4b3328,
      roughness: 0.74,
      metalness: 0.55,
    })
  );

  const catwalkGrate = track(
    new THREE.MeshStandardMaterial({
      map: tex.grateColor,
      alphaMap: tex.grateAlpha,
      alphaTest: 0.45,
      side: THREE.DoubleSide,
      roughness: 0.42,
      metalness: 0.85,
    })
  );

  const woodCrate = track(
    new THREE.MeshStandardMaterial({
      map: tex.woodCrateColor,
      roughnessMap: tex.woodCrateRoughness,
      bumpMap: tex.woodCrateBump,
      bumpScale: 0.028,
      roughness: 0.9,
      metalness: 0.04,
    })
  );

  const woodTrim = track(
    new THREE.MeshStandardMaterial({
      color: 0x3b2a1c,
      roughness: 0.88,
      metalness: 0.05,
    })
  );

  const drumRed = track(
    new THREE.MeshStandardMaterial({
      map: tex.drumRedColor,
      roughnessMap: tex.drumRoughness,
      roughness: 0.68,
      metalness: 0.62,
    })
  );

  const drumTeal = track(
    new THREE.MeshStandardMaterial({
      map: tex.drumTealColor,
      roughnessMap: tex.drumRoughness,
      roughness: 0.66,
      metalness: 0.64,
    })
  );

  const brokenGlass = track(
    new THREE.MeshPhysicalMaterial({
      color: 0x8fb4d9,
      roughness: 0.12,
      metalness: 0.05,
      transparent: true,
      opacity: isSoftwareGl ? 0.28 : 0.34,
      transmission: isSoftwareGl ? 0 : 0.35,
      ior: 1.5,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );

  const cityMat = track(
    new THREE.MeshStandardMaterial({
      map: tex.cityColor,
      emissiveMap: tex.cityEmissive,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 1.15,
      roughness: 0.9,
      metalness: 0.05,
    })
  );

  const lampShade = track(
    new THREE.MeshStandardMaterial({
      color: 0x1a1e24,
      roughness: 0.36,
      metalness: 0.88,
      side: THREE.DoubleSide,
    })
  );

  return {
    concreteFloor,
    corrugatedWall,
    graffitiLeft,
    graffitiBack,
    graffitiRight,
    structuralSteel,
    darkIron,
    rustedPipe,
    catwalkGrate,
    woodCrate,
    woodTrim,
    drumRed,
    drumTeal,
    brokenGlass,
    cityMat,
    lampShade,
    dispose: () => {
      for (const m of created) {
        m.dispose();
      }
    },
  };
}

// =============================================================================
// 1. Casco Estructural del Almacén, Ventanales Rotos, Vigas y Tuberías
// =============================================================================
export function buildWarehouseShell(mats: WarehouseMaterials): {
  group: THREE.Group;
  ripples: RippleRing[];
} {
  const group = new THREE.Group();
  const ripples: RippleRing[] = [];

  // Suelo de hormigón húmedo con charcos
  const floorGeo = new THREE.PlaneGeometry(24, 22);
  const floor = new THREE.Mesh(floorGeo, mats.concreteFloor);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 0.5);
  floor.receiveShadow = true;
  group.add(floor);

  // Ondas concéntricas sobre los charcos principales bajo las goteras
  const ripplePositions = [
    new THREE.Vector3(-0.4, 0.014, 1.3),
    new THREE.Vector3(-3.6, 0.014, -0.8),
    new THREE.Vector3(3.4, 0.014, 0.2),
  ];
  const ringGeo = new THREE.RingGeometry(0.18, 0.23, 28);
  for (let i = 0; i < ripplePositions.length; i++) {
    const rMat = new THREE.MeshBasicMaterial({
      color: 0x8bb8e8,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const rMesh = new THREE.Mesh(ringGeo, rMat);
    rMesh.rotation.x = -Math.PI / 2;
    rMesh.position.copy(ripplePositions[i]);
    group.add(rMesh);
    ripples.push({ mesh: rMesh, mat: rMat, phase: i * 1.1, speed: 0.85 + i * 0.14 });
  }

  // Muros laterales (izquierdo y derecho) con paneles de grafiti
  const sideWallGeo = new THREE.PlaneGeometry(21, 9.2);

  const leftWall = new THREE.Mesh(sideWallGeo, mats.graffitiLeft);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-10.8, 4.6, 0.2);
  leftWall.receiveShadow = true;
  group.add(leftWall);

  const rightWall = new THREE.Mesh(sideWallGeo, mats.graffitiRight);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(10.8, 4.6, 0.2);
  rightWall.receiveShadow = true;
  group.add(rightWall);

  // Zócalo estructural y columnas en I a lo largo de los muros
  const columnGeo = new THREE.BoxGeometry(0.36, 9.0, 0.44);
  const flangeGeo = new THREE.BoxGeometry(0.48, 9.0, 0.12);
  const basePlateGeo = new THREE.BoxGeometry(0.62, 0.16, 0.62);

  for (const side of [-1, 1]) {
    for (const cz of [-8.8, -4.4, 0.0, 4.4]) {
      const pilaster = new THREE.Group();
      const web = new THREE.Mesh(columnGeo, mats.structuralSteel);
      web.position.y = 4.5;
      web.castShadow = true;
      web.receiveShadow = true;
      pilaster.add(web);

      const frontFlange = new THREE.Mesh(flangeGeo, mats.darkIron);
      frontFlange.position.set(0, 4.5, 0.22);
      pilaster.add(frontFlange);

      const base = new THREE.Mesh(basePlateGeo, mats.darkIron);
      base.position.y = 0.08;
      pilaster.add(base);

      pilaster.position.set(side * 10.55, 0, cz);
      group.add(pilaster);
    }
  }

  // Pared trasera perforada (z = -9.6) con 4 grandes ventanales industriales
  // Base inferior continua (y = 0..3.7)
  const lowerBackWall = new THREE.Mesh(new THREE.BoxGeometry(22.4, 3.7, 0.45), mats.graffitiBack);
  lowerBackWall.position.set(0, 1.85, -9.6);
  lowerBackWall.receiveShadow = true;
  group.add(lowerBackWall);

  // Dintel superior continuo sobre los ventanales (y = 6.9..9.4)
  const upperBackWall = new THREE.Mesh(new THREE.BoxGeometry(22.4, 2.5, 0.45), mats.corrugatedWall);
  upperBackWall.position.set(0, 8.15, -9.6);
  group.add(upperBackWall);

  // Pilares entre los 4 ventanales (ventanas en X: [-6.45, -2.15, +2.15, +6.45], ancho ~3.2)
  const pierXs = [-9.6, -4.3, 0, 4.3, 9.6];
  const pierWidths = [2.6, 1.1, 1.1, 1.1, 2.6];
  for (let i = 0; i < pierXs.length; i++) {
    const pier = new THREE.Mesh(
      new THREE.BoxGeometry(pierWidths[i], 3.25, 0.52),
      mats.corrugatedWall
    );
    pier.position.set(pierXs[i], 5.3, -9.6);
    pier.castShadow = true;
    pier.receiveShadow = true;
    group.add(pier);
  }

  // Marcos metálicos cuadriculados y cristales parcialmente rotos en cada ventanal
  const windowCenters = [-6.45, -2.15, 2.15, 6.45];
  const winW = 3.2;
  const winH = 3.2;
  const sillGeo = new THREE.BoxGeometry(winW + 0.25, 0.14, 0.62);
  const vBarGeo = new THREE.BoxGeometry(0.06, winH, 0.08);
  const hBarGeo = new THREE.BoxGeometry(winW, 0.06, 0.08);

  // Forma triangular para simular cristal fragmentado
  const shardShape = new THREE.Shape();
  shardShape.moveTo(-0.46, -0.45);
  shardShape.lineTo(0.46, -0.45);
  shardShape.lineTo(0.46, 0.18);
  shardShape.lineTo(-0.08, -0.02);
  shardShape.lineTo(-0.46, 0.45);
  shardShape.closePath();
  const shardGeo = new THREE.ShapeGeometry(shardShape);

  for (let wIdx = 0; wIdx < windowCenters.length; wIdx++) {
    const wx = windowCenters[wIdx];
    const winGroup = new THREE.Group();
    winGroup.position.set(wx, 5.3, -9.58);

    const sill = new THREE.Mesh(sillGeo, mats.structuralSteel);
    sill.position.y = -winH / 2 - 0.04;
    winGroup.add(sill);

    const topFrame = new THREE.Mesh(sillGeo, mats.structuralSteel);
    topFrame.position.y = winH / 2 + 0.04;
    winGroup.add(topFrame);

    for (const vx of [-winW / 2, -winW / 6, winW / 6, winW / 2]) {
      const vBar = new THREE.Mesh(vBarGeo, mats.darkIron);
      vBar.position.x = vx;
      winGroup.add(vBar);
    }
    for (const hy of [-winH / 2, -winH / 6, winH / 6, winH / 2]) {
      const hBar = new THREE.Mesh(hBarGeo, mats.darkIron);
      hBar.position.y = hy;
      winGroup.add(hBar);
    }

    // Cristales parciales rotos dejando huecos abiertos a la lluvia
    for (let cell = 0; cell < 6; cell++) {
      if ((cell + wIdx) % 3 === 1) continue; // Hueco roto abierto
      const gx = ((cell % 3) - 1) * (winW / 3);
      const gy = (Math.floor(cell / 3) - 0.5) * (winH / 2.2);
      const pane = new THREE.Mesh(shardGeo, mats.brokenGlass);
      pane.position.set(gx, gy, 0);
      if ((cell + wIdx) % 2 === 0) pane.scale.x = -1;
      winGroup.add(pane);
    }

    group.add(winGroup);
  }

  // Techo oscuro, cerchas estructurales, ductos de ventilación y tuberías
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(24, 22), mats.corrugatedWall);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, 9.0, 0.2);
  group.add(ceiling);

  const trussBeamGeo = new THREE.BoxGeometry(22.0, 0.36, 0.28);
  for (const tz of [-7.8, -4.2, -0.6, 3.0, 6.2]) {
    const beam = new THREE.Mesh(trussBeamGeo, mats.structuralSteel);
    beam.position.set(0, 8.75, tz);
    group.add(beam);
  }

  // Tuberías cenitales paralelas con collarines
  const pipeGeo = new THREE.CylinderGeometry(0.11, 0.11, 20.5, 12);
  pipeGeo.rotateZ(Math.PI / 2);
  for (const [py, pz] of [
    [8.3, -7.2],
    [8.3, -6.75],
    [8.35, -2.5],
  ]) {
    const pipe = new THREE.Mesh(pipeGeo, mats.rustedPipe);
    pipe.position.set(0, py, pz);
    group.add(pipe);
  }

  // Conducto rectangular de ventilación en el techo
  const ventDuct = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.65, 16), mats.structuralSteel);
  ventDuct.position.set(1.6, 8.45, -2.2);
  group.add(ventDuct);

  // Puerta de salida trasera izquierda en sombra bajo la pasarela
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(2.1, 3.2, 0.22), mats.darkIron);
  doorFrame.position.set(-7.6, 1.6, -9.32);
  group.add(doorFrame);

  return { group, ripples };
}

// =============================================================================
// 2. Horizonte Urbano Nocturno detrás de los Ventanales
// =============================================================================
export function buildCityBackdrop(mats: WarehouseMaterials): THREE.Group {
  const group = new THREE.Group();

  // Telón panorámico de rascacielos iluminados
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(34, 15), mats.cityMat);
  backdrop.position.set(0, 6.4, -18.5);
  group.add(backdrop);

  // Siluetas de edificios intermedios para reforzar el paralaje exterior
  const towerDark = mats.darkIron;
  const towers = [
    { x: -7.5, w: 2.8, h: 12, z: -13.6 },
    { x: -1.8, w: 2.4, h: 10.5, z: -14.8 },
    { x: 3.2, w: 3.1, h: 13.0, z: -14.0 },
    { x: 8.0, w: 2.6, h: 11.2, z: -13.5 },
  ];
  for (const t of towers) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(t.w, t.h, 1.4), towerDark);
    mesh.position.set(t.x, t.h / 2 - 0.5, t.z);
    group.add(mesh);
  }

  return group;
}

// =============================================================================
// 3. Pasarelas Metálicas, Barandillas, Escaleras y Escalerillas
// =============================================================================
function buildRailingSegment(
  length: number,
  mats: WarehouseMaterials,
  alongZ = false
): THREE.Group {
  const g = new THREE.Group();
  const h = 1.02;
  const posts = Math.max(2, Math.round(length / 1.5) + 1);
  const postGeo = new THREE.CylinderGeometry(0.028, 0.028, h, 8);
  const railGeo = new THREE.CylinderGeometry(0.026, 0.026, length, 8);
  railGeo.rotateZ(Math.PI / 2);

  const topRail = new THREE.Mesh(railGeo, mats.structuralSteel);
  topRail.position.y = h;
  g.add(topRail);

  const midRail = new THREE.Mesh(railGeo, mats.structuralSteel);
  midRail.position.y = h * 0.52;
  g.add(midRail);

  for (let i = 0; i < posts; i++) {
    const t = i / (posts - 1) - 0.5;
    const post = new THREE.Mesh(postGeo, mats.darkIron);
    post.position.set(t * length, h / 2, 0);
    g.add(post);
  }

  if (alongZ) g.rotation.y = Math.PI / 2;
  return g;
}

function buildLadder(height: number, width: number, mats: WarehouseMaterials): THREE.Group {
  const g = new THREE.Group();
  const sideGeo = new THREE.CylinderGeometry(0.025, 0.025, height, 8);
  const rungGeo = new THREE.CylinderGeometry(0.018, 0.018, width, 8);
  rungGeo.rotateZ(Math.PI / 2);

  for (const sx of [-width / 2, width / 2]) {
    const rail = new THREE.Mesh(sideGeo, mats.darkIron);
    rail.position.set(sx, height / 2, 0);
    rail.castShadow = true;
    g.add(rail);
  }

  const rungCount = Math.floor(height / 0.36);
  for (let r = 1; r <= rungCount; r++) {
    const rung = new THREE.Mesh(rungGeo, mats.structuralSteel);
    rung.position.set(0, r * 0.34, 0);
    g.add(rung);
  }
  return g;
}

function buildCatwalkPlatform(
  width: number,
  depth: number,
  heightY: number,
  mats: WarehouseMaterials
): THREE.Group {
  const g = new THREE.Group();

  // Cubierta de rejilla metálica
  const deck = new THREE.Mesh(new THREE.BoxGeometry(width, 0.08, depth), mats.catwalkGrate);
  deck.position.y = heightY;
  deck.castShadow = true;
  deck.receiveShadow = true;
  g.add(deck);

  // Vigas perimetrales de borde
  const frontBeam = new THREE.Mesh(new THREE.BoxGeometry(width, 0.22, 0.14), mats.structuralSteel);
  frontBeam.position.set(0, heightY - 0.1, depth / 2);
  g.add(frontBeam);

  const backBeam = new THREE.Mesh(new THREE.BoxGeometry(width, 0.22, 0.14), mats.structuralSteel);
  backBeam.position.set(0, heightY - 0.1, -depth / 2);
  g.add(backBeam);

  // Pilares de soporte hasta el suelo (y = 0)
  const colGeo = new THREE.BoxGeometry(0.18, heightY, 0.18);
  for (const px of [-width / 2 + 0.25, width / 2 - 0.25]) {
    for (const pz of [-depth / 2 + 0.2, depth / 2 - 0.2]) {
      const col = new THREE.Mesh(colGeo, mats.darkIron);
      col.position.set(px, heightY / 2, pz);
      col.castShadow = true;
      col.receiveShadow = true;
      g.add(col);
    }
  }

  return g;
}

export function buildCatwalks(mats: WarehouseMaterials): THREE.Group {
  const group = new THREE.Group();

  // --- Pasarela Izquierda (y = 2.65) ---
  const leftDeck = buildCatwalkPlatform(8.4, 2.4, 2.65, mats);
  leftDeck.position.set(-6.3, 0, -3.2);
  group.add(leftDeck);

  const leftRail = buildRailingSegment(8.2, mats, false);
  leftRail.position.set(-6.3, 2.68, -2.04);
  group.add(leftRail);

  const leftLadder = buildLadder(2.75, 0.56, mats);
  leftLadder.position.set(-3.1, 0, -1.92);
  group.add(leftLadder);

  // Cables colgantes curvos bajo la pasarela izquierda
  const cableCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-9.5, 2.52, -2.1),
    new THREE.Vector3(-7.4, 1.85, -1.95),
    new THREE.Vector3(-5.2, 2.45, -2.05),
  ]);
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(cableCurve, 18, 0.032, 6, false),
    mats.darkIron
  );
  group.add(cable);

  // --- Pasarela Derecha Nivel Medio (y = 2.45) + Puente Trasero ---
  const rightLow = buildCatwalkPlatform(6.8, 3.2, 2.45, mats);
  rightLow.position.set(7.2, 0, -1.4);
  group.add(rightLow);

  const rightLowRail = buildRailingSegment(6.6, mats, false);
  rightLowRail.position.set(7.2, 2.48, 0.16);
  group.add(rightLowRail);

  // --- Pasarela Derecha Nivel Alto (y = 4.65) ---
  const rightHigh = buildCatwalkPlatform(7.2, 2.4, 4.65, mats);
  rightHigh.position.set(7.0, 0, -4.6);
  group.add(rightHigh);

  const rightHighRail = buildRailingSegment(7.0, mats, false);
  rightHighRail.position.set(7.0, 4.68, -3.44);
  group.add(rightHighRail);

  // Escalera vertical conectando nivel medio y alto en el lado derecho
  const rightLadder = buildLadder(2.4, 0.56, mats);
  rightLadder.position.set(5.1, 2.45, -3.32);
  group.add(rightLadder);

  // Escalera inclinada de acceso desde el suelo hacia la pasarela derecha baja
  const stairs = new THREE.Group();
  const stepCount = 9;
  const stepGeo = new THREE.BoxGeometry(1.15, 0.07, 0.34);
  for (let s = 0; s < stepCount; s++) {
    const step = new THREE.Mesh(stepGeo, mats.structuralSteel);
    step.position.set(0, (s + 0.5) * 0.27, s * 0.32);
    step.castShadow = true;
    stairs.add(step);
  }
  const stringerGeo = new THREE.BoxGeometry(0.08, 0.18, 3.7);
  for (const sx of [-0.58, 0.58]) {
    const stringer = new THREE.Mesh(stringerGeo, mats.darkIron);
    stringer.position.set(sx, 1.22, 1.3);
    stringer.rotation.x = -0.68;
    stairs.add(stringer);
  }
  stairs.position.set(4.15, 0, -0.35);
  stairs.rotation.y = -Math.PI / 2;
  group.add(stairs);

  // Cadena metálica colgando de la pasarela alta derecha (referencia polipasto)
  const chainGroup = new THREE.Group();
  const linkGeo = new THREE.TorusGeometry(0.06, 0.016, 6, 12);
  for (let c = 0; c < 11; c++) {
    const link = new THREE.Mesh(linkGeo, mats.darkIron);
    link.position.y = -c * 0.11;
    link.rotation.y = (c % 2) * (Math.PI / 2);
    chainGroup.add(link);
  }
  chainGroup.position.set(3.8, 4.5, -3.6);
  group.add(chainGroup);

  return group;
}

// =============================================================================
// 4. Utilería Industrial: Cajas Reforzadas, Bidones y Generador Pesado
// =============================================================================
function buildWoodenCrate(size: number, mats: WarehouseMaterials): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(size * 0.94, size * 0.94, size * 0.94),
    mats.woodCrate
  );
  body.position.y = size / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  // Marco perimetral y listones de refuerzo (silueta + lectura secundaria)
  const frameBar = size * 0.085;
  const edgeGeoX = new THREE.BoxGeometry(size, frameBar, frameBar);
  const edgeGeoY = new THREE.BoxGeometry(frameBar, size, frameBar);
  const edgeGeoZ = new THREE.BoxGeometry(frameBar, frameBar, size);
  const half = size / 2 - frameBar / 2;

  for (const sy of [frameBar / 2, size - frameBar / 2]) {
    for (const sz of [-half, half]) {
      const bx = new THREE.Mesh(edgeGeoX, mats.woodTrim);
      bx.position.set(0, sy, sz);
      g.add(bx);
    }
    for (const sx of [-half, half]) {
      const bz = new THREE.Mesh(edgeGeoZ, mats.woodTrim);
      bz.position.set(sx, sy, 0);
      g.add(bz);
    }
  }
  for (const sx of [-half, half]) {
    for (const sz of [-half, half]) {
      const by = new THREE.Mesh(edgeGeoY, mats.woodTrim);
      by.position.set(sx, size / 2, sz);
      g.add(by);
    }
  }

  // Esquinero metálico superior
  const cornerGeo = new THREE.BoxGeometry(frameBar * 1.15, frameBar * 1.15, frameBar * 1.15);
  for (const sx of [-half, half]) {
    for (const sz of [-half, half]) {
      const corner = new THREE.Mesh(cornerGeo, mats.darkIron);
      corner.position.set(sx, size - frameBar / 2, sz);
      g.add(corner);
    }
  }

  return g;
}

function buildSteelDrum(
  mat: THREE.MeshStandardMaterial,
  mats: WarehouseMaterials
): THREE.Group {
  const g = new THREE.Group();
  const h = 0.96;
  const r = 0.31;

  const shell = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 18), mat);
  shell.position.y = h / 2;
  shell.castShadow = true;
  shell.receiveShadow = true;
  g.add(shell);

  // Aros de refuerzo y rebordes superior/inferior
  const ribGeo = new THREE.TorusGeometry(r + 0.008, 0.015, 6, 18);
  ribGeo.rotateX(Math.PI / 2);
  for (const ry of [0.03, 0.34, 0.64, h - 0.03]) {
    const rib = new THREE.Mesh(ribGeo, mats.darkIron);
    rib.position.y = ry;
    g.add(rib);
  }

  // Tapón superior
  const bung = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 8), mats.structuralSteel);
  bung.position.set(0.12, h + 0.015, 0.08);
  g.add(bung);

  return g;
}

function buildGeneratorMachinery(mats: WarehouseMaterials): THREE.Group {
  const g = new THREE.Group();

  // Bancada inferior
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.22, 1.35), mats.darkIron);
  base.position.y = 0.11;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  // Bloque motor principal
  const block = new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.25, 1.1), mats.structuralSteel);
  block.position.set(-0.1, 0.84, 0);
  block.castShadow = true;
  block.receiveShadow = true;
  g.add(block);

  // Tanque cilíndrico lateral
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.15, 14), mats.rustedPipe);
  tank.rotation.z = Math.PI / 2;
  tank.position.set(0.15, 1.66, 0.12);
  tank.castShadow = true;
  g.add(tank);

  // Rejilla frontal del radiador
  for (let i = 0; i < 4; i++) {
    const louver = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.85), mats.darkIron);
    louver.position.set(0.79, 0.45 + i * 0.22, 0);
    g.add(louver);
  }

  // Escape vertical curvo
  const exhaustCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.55, 1.45, -0.15),
    new THREE.Vector3(-0.55, 2.25, -0.15),
    new THREE.Vector3(-0.85, 2.45, -0.15),
  ]);
  const exhaust = new THREE.Mesh(
    new THREE.TubeGeometry(exhaustCurve, 12, 0.075, 8, false),
    mats.darkIron
  );
  exhaust.castShadow = true;
  g.add(exhaust);

  return g;
}

export function buildIndustrialProps(mats: WarehouseMaterials): THREE.Group {
  const group = new THREE.Group();

  // Generador pesado bajo la pasarela izquierda
  const generator = buildGeneratorMachinery(mats);
  generator.position.set(-5.8, 0, -2.5);
  generator.rotation.y = 0.14;
  group.add(generator);

  // Grupo de cajas de madera a la derecha (suelo)
  const crateA = buildWoodenCrate(1.08, mats);
  crateA.position.set(5.9, 0, -2.8);
  crateA.rotation.y = -0.18;
  group.add(crateA);

  const crateB = buildWoodenCrate(0.86, mats);
  crateB.position.set(7.15, 0, -2.55);
  crateB.rotation.y = 0.24;
  group.add(crateB);

  const crateTop = buildWoodenCrate(0.72, mats);
  crateTop.position.set(6.05, 1.08, -2.85);
  crateTop.rotation.y = 0.35;
  group.add(crateTop);

  // Cajas sobre la pasarela derecha baja
  const catwalkCrate1 = buildWoodenCrate(0.8, mats);
  catwalkCrate1.position.set(6.2, 2.49, -1.6);
  catwalkCrate1.rotation.y = 0.12;
  group.add(catwalkCrate1);

  const catwalkCrate2 = buildWoodenCrate(0.66, mats);
  catwalkCrate2.position.set(7.2, 2.49, -1.35);
  catwalkCrate2.rotation.y = -0.25;
  group.add(catwalkCrate2);

  // Cajas junto al flanco izquierdo para equilibrar siluetas
  const leftCrate = buildWoodenCrate(0.92, mats);
  leftCrate.position.set(-8.6, 0, 1.2);
  leftCrate.rotation.y = 0.22;
  group.add(leftCrate);

  // Bidones metálicos oxidados
  const drumPositions: Array<{ x: number; y: number; z: number; red: boolean }> = [
    { x: -4.2, y: 0, z: -3.2, red: true },
    { x: -3.55, y: 0, z: -2.85, red: false },
    { x: 4.95, y: 0, z: -3.15, red: false },
    { x: 8.35, y: 2.49, z: -1.65, red: true },
    { x: 8.6, y: 0, z: 1.4, red: true },
  ];

  for (const d of drumPositions) {
    const drum = buildSteelDrum(d.red ? mats.drumRed : mats.drumTeal, mats);
    drum.position.set(d.x, d.y, d.z);
    group.add(drum);
  }

  return group;
}

// =============================================================================
// 5. Lámparas Colgantes de Jaula con Luz Cálida, Cono Volumétrico y Péndulo
// =============================================================================
export function buildHangingLamps(
  mats: WarehouseMaterials,
  tex: WarehouseTextureSet,
  isSoftwareGl: boolean
): { group: THREE.Group; rigs: HangingLampRig[] } {
  const group = new THREE.Group();
  const rigs: HangingLampRig[] = [];

  const configs = [
    // 3 lámparas principales delanteras
    { x: -4.3, z: -1.4, cordLen: 2.3, intensity: 14.5, castShadow: false, phase: 0.0 },
    { x: 0.0, z: -1.2, cordLen: 2.15, intensity: 17.5, castShadow: !isSoftwareGl, phase: 1.7 },
    { x: 4.3, z: -1.4, cordLen: 2.3, intensity: 14.5, castShadow: false, phase: 3.1 },
    // 3 lámparas secundarias traseras cerca de ventanales
    { x: -3.4, z: -6.2, cordLen: 2.7, intensity: 10.0, castShadow: false, phase: 2.3 },
    { x: 0.2, z: -6.3, cordLen: 2.65, intensity: 11.0, castShadow: false, phase: 4.2 },
    { x: 3.6, z: -6.2, cordLen: 2.7, intensity: 10.0, castShadow: false, phase: 5.4 },
  ];

  const canopyGeo = new THREE.CylinderGeometry(0.09, 0.12, 0.08, 10);
  const cordGeo = new THREE.CylinderGeometry(0.014, 0.014, 1, 6);
  const shadeGeo = new THREE.ConeGeometry(0.24, 0.18, 16, 1, true);
  const bulbGeo = new THREE.SphereGeometry(0.065, 12, 10);
  const cageRingGeo = new THREE.TorusGeometry(0.095, 0.008, 6, 14);
  cageRingGeo.rotateX(Math.PI / 2);
  const haloGeo = new THREE.PlaneGeometry(1.5, 1.5);

  for (let i = 0; i < configs.length; i++) {
    const cfg = configs[i];
    const pivot = new THREE.Group();
    pivot.position.set(cfg.x, 8.85, cfg.z);

    // Florón de techo
    const canopy = new THREE.Mesh(canopyGeo, mats.darkIron);
    pivot.add(canopy);

    // Cable colgante
    const cord = new THREE.Mesh(cordGeo, mats.darkIron);
    cord.scale.y = cfg.cordLen;
    cord.position.y = -cfg.cordLen / 2;
    pivot.add(cord);

    // Pantalla cónica metálica
    const fixtureY = -cfg.cordLen;
    const shade = new THREE.Mesh(shadeGeo, mats.lampShade);
    shade.position.y = fixtureY;
    pivot.add(shade);

    // Jaula protectora metálica
    const cageRing = new THREE.Mesh(cageRingGeo, mats.darkIron);
    cageRing.position.y = fixtureY - 0.14;
    pivot.add(cageRing);

    // Bombilla emisiva cálida
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xffb35c,
      emissive: new THREE.Color(0xff7722),
      emissiveIntensity: 3.2,
      roughness: 0.2,
      metalness: 0.0,
    });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.y = fixtureY - 0.07;
    pivot.add(bulb);

    // Halo atmosférico aditivo
    const haloMat = new THREE.MeshBasicMaterial({
      map: tex.lampGlowMap,
      transparent: true,
      opacity: 0.52,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.set(0, fixtureY - 0.08, 0.05);
    pivot.add(haloMesh);

    // Fuente puntual real de iluminación cálida
    const light = new THREE.PointLight(0xff8432, cfg.intensity, 15.5, 1.65);
    light.position.set(0, fixtureY - 0.15, 0);
    if (cfg.castShadow) {
      light.castShadow = true;
      light.shadow.mapSize.set(512, 512);
      light.shadow.bias = -0.002;
    }
    pivot.add(light);

    group.add(pivot);
    rigs.push({
      pivot,
      light,
      bulbMat,
      haloMesh,
      baseIntensity: cfg.intensity,
      phase: cfg.phase,
      swaySpeed: 0.72 + (i % 3) * 0.16,
      swayAmp: i < 3 ? 0.022 : 0.015,
    });
  }

  return { group, rigs };
}
