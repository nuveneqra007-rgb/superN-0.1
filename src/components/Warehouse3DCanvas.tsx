// ==============================================================================
// Warehouse3DCanvas.tsx — Escena WebGL 3D Realista PBR (Warehouse 09)
// - Iluminación mixta: luz fría de tormenta exterior + 6 lámparas cálidas vivas
// - Suelo húmedo con charcos reflectantes (clearcoat + ondas) y lluvia instanciada
// - Parallax suavizado con amortiguación exponencial + protección Software WebGL
// ==============================================================================

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createWarehouseTextures } from './warehouse3d/textures';
import {
  buildCatwalks,
  buildCityBackdrop,
  buildHangingLamps,
  buildIndustrialProps,
  buildWarehouseShell,
  createWarehouseMaterials,
} from './warehouse3d/builders';

interface Warehouse3DCanvasProps {
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  onUnavailable?: () => void;
}

interface RainDropState {
  x: number;
  y: number;
  z: number;
  speed: number;
  len: number;
}

interface DustMoteState {
  x: number;
  y: number;
  z: number;
  phase: number;
  speed: number;
  scale: number;
}

// Objetos matemáticos preasignados fuera del bucle (cero GC por fotograma)
const _dummy = new THREE.Object3D();
const _baseCamPos = new THREE.Vector3(0, 3.08, 7.65);
const _baseLookAt = new THREE.Vector3(0, 2.75, -4.2);
const _curCamLook = new THREE.Vector3(0, 2.75, -4.2);

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export const Warehouse3DCanvas: React.FC<Warehouse3DCanvasProps> = ({
  pointerRef,
  onUnavailable,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const onUnavailableRef = useRef(onUnavailable);
  onUnavailableRef.current = onUnavailable;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      onUnavailableRef.current?.();
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.16;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.imageRendering = 'auto';
    container.innerHTML = '';
    container.appendChild(canvas);

    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    renderer.setSize(width, height, false);

    // Escena, niebla atmosférica y mapa ambiental PMREM
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060a12);
    scene.fog = new THREE.FogExp2(0x060a12, 0.031);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.44;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Cámara perspectiva centrada en el encuadre del almacén
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 75);
    camera.position.copy(_baseCamPos);
    camera.lookAt(_baseLookAt);

    // Iluminación fría de tormenta exterior + contraste cálido de lámparas
    const hemiLight = new THREE.HemisphereLight(0x4b77ab, 0x161210, 0.85);
    scene.add(hemiLight);

    const stormDirLight = new THREE.DirectionalLight(0x7fb4eb, 1.55);
    stormDirLight.position.set(1.6, 9.2, -15.8);
    stormDirLight.target.position.set(0, 1.4, 0);
    scene.add(stormDirLight.target);
    if (!isSoftwareGl) {
      stormDirLight.castShadow = true;
      stormDirLight.shadow.mapSize.set(1024, 1024);
      stormDirLight.shadow.camera.near = 2;
      stormDirLight.shadow.camera.far = 32;
      stormDirLight.shadow.camera.left = -12;
      stormDirLight.shadow.camera.right = 12;
      stormDirLight.shadow.camera.top = 10;
      stormDirLight.shadow.camera.bottom = -4;
      stormDirLight.shadow.bias = -0.0005;
      stormDirLight.shadow.normalBias = 0.02;
    }
    scene.add(stormDirLight);

    // Texturas PBR procedurales, materiales y arquitectura 3D
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const textures = createWarehouseTextures(maxAnisotropy);
    const materials = createWarehouseMaterials(textures, isSoftwareGl);

    const { group: shellGroup, ripples } = buildWarehouseShell(materials);
    scene.add(shellGroup);

    const cityGroup = buildCityBackdrop(materials);
    scene.add(cityGroup);

    const catwalksGroup = buildCatwalks(materials);
    scene.add(catwalksGroup);

    const propsGroup = buildIndustrialProps(materials);
    scene.add(propsGroup);

    const { group: lampsGroup, rigs: lampRigs } = buildHangingLamps(
      materials,
      textures,
      isSoftwareGl
    );
    scene.add(lampsGroup);

    // -------------------------------------------------------------------------
    // Lluvia instanciada detrás de los ventanales y filtrándose por huecos rotos
    // -------------------------------------------------------------------------
    const rainCount = 260;
    const rainGeo = new THREE.BoxGeometry(0.014, 0.55, 0.014);
    const rainMat = new THREE.MeshBasicMaterial({
      color: 0xa6c9eb,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
    });
    const rainMesh = new THREE.InstancedMesh(rainGeo, rainMat, rainCount);
    rainMesh.frustumCulled = false;

    const rainDrops: RainDropState[] = [];
    for (let i = 0; i < rainCount; i++) {
      const isInteriorDrip = i >= 210;
      rainDrops.push({
        x: (Math.random() - 0.5) * 18.5,
        y: Math.random() * 9.5,
        z: isInteriorDrip ? -8.6 + Math.random() * 6.5 : -10.4 - Math.random() * 3.8,
        speed: isInteriorDrip ? 7.5 + Math.random() * 3.2 : 12.0 + Math.random() * 5.0,
        len: isInteriorDrip ? 0.45 + Math.random() * 0.35 : 0.8 + Math.random() * 0.65,
      });
    }
    scene.add(rainMesh);

    // -------------------------------------------------------------------------
    // Polvo ambiental en suspensión bajo los conos de luz
    // -------------------------------------------------------------------------
    const dustCount = 120;
    const dustGeo = new THREE.SphereGeometry(0.022, 6, 6);
    const dustMat = new THREE.MeshBasicMaterial({
      color: 0xffd2a1,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    });
    const dustMesh = new THREE.InstancedMesh(dustGeo, dustMat, dustCount);
    dustMesh.frustumCulled = false;

    const dustMotes: DustMoteState[] = [];
    for (let i = 0; i < dustCount; i++) {
      dustMotes.push({
        x: (Math.random() - 0.5) * 14.5,
        y: 0.6 + Math.random() * 6.6,
        z: -6.5 + Math.random() * 9.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.35 + Math.random() * 0.5,
        scale: 0.5 + Math.random() * 1.1,
      });
    }
    scene.add(dustMesh);

    // Precalentar shaders cuando hay GPU real
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // -------------------------------------------------------------------------
    // Gestión de tamaño, pérdida de contexto y bucle de animación
    // -------------------------------------------------------------------------
    let disposed = false;
    let frameId = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    const handleResize = () => {
      if (disposed || !container) return;
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener('resize', handleResize);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      onUnavailableRef.current?.();
    };
    canvas.addEventListener('webglcontextlost', handleContextLost);

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      gl.flush();
      const poll = () => {
        if (disposed) {
          gl.deleteSync(sync);
          return;
        }
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function updateScene(dt: number) {
      elapsed += dt;

      // 1. Parallax suavizado de cámara con respiración cinemática sutil
      const ptr = pointerRef.current;
      const breathX = Math.sin(elapsed * 0.42) * 0.06;
      const breathY = Math.cos(elapsed * 0.56) * 0.04;

      const targetCamX = _baseCamPos.x + ptr.x * 1.05 + breathX;
      const targetCamY = _baseCamPos.y - ptr.y * 0.42 + breathY;
      const targetLookX = _baseLookAt.x + ptr.x * 0.35;
      const targetLookY = _baseLookAt.y - ptr.y * 0.16;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 4.4, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 4.4, dt);
      _curCamLook.x = THREE.MathUtils.damp(_curCamLook.x, targetLookX, 4.4, dt);
      _curCamLook.y = THREE.MathUtils.damp(_curCamLook.y, targetLookY, 4.4, dt);
      camera.lookAt(_curCamLook);

      // 2. Balanceo pendular y parpadeo eléctrico orgánico en las 6 lámparas
      for (const rig of lampRigs) {
        rig.pivot.rotation.z = Math.sin(elapsed * rig.swaySpeed + rig.phase) * rig.swayAmp;
        rig.pivot.rotation.x = Math.cos(elapsed * rig.swaySpeed * 0.7 + rig.phase) * rig.swayAmp * 0.6;

        const flickerWave =
          0.88 +
          0.08 * Math.sin(elapsed * 5.2 + rig.phase) +
          0.05 * Math.sin(elapsed * 13.7 + rig.phase * 2.1);
        const microDip =
          Math.sin(elapsed * 1.9 + rig.phase * 3.3) > 0.965 ? 0.62 : 1.0;
        const factor = flickerWave * microDip;

        rig.light.intensity = rig.baseIntensity * factor;
        rig.bulbMat.emissiveIntensity = 2.9 * factor;
        const haloMat = rig.haloMesh.material as THREE.MeshBasicMaterial;
        haloMat.opacity = 0.48 * factor;
        rig.haloMesh.lookAt(camera.position);
      }

      // 3. Lluvia instanciada en caída diagonal
      for (let i = 0; i < rainCount; i++) {
        const drop = rainDrops[i];
        drop.y -= drop.speed * dt;
        drop.x -= drop.speed * 0.14 * dt;
        if (drop.y < 0.05) {
          drop.y = 8.8 + Math.random() * 1.4;
          drop.x = (Math.random() - 0.5) * 18.5;
        }
        _dummy.position.set(drop.x, drop.y, drop.z);
        _dummy.rotation.set(0, 0, -0.14);
        _dummy.scale.set(1, drop.len, 1);
        _dummy.updateMatrix();
        rainMesh.setMatrixAt(i, _dummy.matrix);
      }
      rainMesh.instanceMatrix.needsUpdate = true;

      // 4. Motas de polvo flotando en la atmósfera
      for (let i = 0; i < dustCount; i++) {
        const m = dustMotes[i];
        const py = m.y + Math.sin(elapsed * m.speed + m.phase) * 0.25;
        const px = m.x + Math.cos(elapsed * m.speed * 0.7 + m.phase) * 0.18;
        _dummy.position.set(px, py, m.z);
        _dummy.rotation.set(0, 0, 0);
        _dummy.scale.setScalar(m.scale);
        _dummy.updateMatrix();
        dustMesh.setMatrixAt(i, _dummy.matrix);
      }
      dustMesh.instanceMatrix.needsUpdate = true;

      // 5. Ondas en los charcos bajo goteras
      for (const r of ripples) {
        const t = (elapsed * r.speed + r.phase) % 1;
        const scale = 0.35 + t * 2.4;
        r.mesh.scale.setScalar(scale);
        r.mat.opacity = (1 - t) * 0.32;
      }
    }

    function tick() {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      updateScene(dt);
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    if (isSoftwareGl) {
      // Primer render limpio y bucle gobernado por afterDraw
      updateScene(0.016);
      renderer.render(scene, camera);
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('webglcontextlost', handleContextLost);

      const disposedGeos = new Set<THREE.BufferGeometry>();
      const disposedMats = new Set<THREE.Material>();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry && !disposedGeos.has(mesh.geometry)) {
          disposedGeos.add(mesh.geometry);
          mesh.geometry.dispose();
        }
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const mat of mats) {
            if (!disposedMats.has(mat)) {
              disposedMats.add(mat);
              mat.dispose();
            }
          }
        }
      });

      materials.dispose();
      textures.dispose();
      envRT.dispose();
      renderer.dispose();
      if (canvas.parentElement === container) {
        container.removeChild(canvas);
      }
    };
  }, [pointerRef]);

  return <div ref={mountRef} className="w-full h-full" />;
};

export default Warehouse3DCanvas;
