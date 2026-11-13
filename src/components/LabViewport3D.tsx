import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { STATIONS } from '../data/scenarios';
import { buildLabScene, LabSceneRig } from '../scene/instruments';
import { updateInsightBoardCanvas } from '../scene/textures';
import {
  CrtReportPage,
  DidacticReport,
  PipelineState,
  ProcessedStats,
  ScenarioDataset,
  StationId,
} from '../types/lab';
import { labAudio } from '../utils/sound';

interface LabViewport3DProps {
  scenario: ScenarioDataset;
  pipeline: PipelineState;
  stats: ProcessedStats;
  activeStation: StationId | null;
  crtReportPage: CrtReportPage;
  report: DidacticReport;
  cameraPresetTrigger: number;
  onSelectObject: (glossaryId: string, stationId: StationId) => void;
  onSelectCrtButton?: (page: CrtReportPage) => void;
  onOrbitExplore?: (stationId: StationId | null) => void;
}

const OVERVIEW_POS = new THREE.Vector3(0, 6.2, 11.4);
const OVERVIEW_TARGET = new THREE.Vector3(0, 0.75, 0);

const _mouse = new THREE.Vector2();
const _desiredPos = new THREE.Vector3().copy(OVERVIEW_POS);
const _desiredTarget = new THREE.Vector3().copy(OVERVIEW_TARGET);

function createParticleGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.55)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function isInstrumentEnergized(
  stationId: StationId,
  pipeline: PipelineState,
  activeStation: StationId | null
): boolean {
  if (stationId === 4 || stationId === 5 || stationId === 6) return true;
  if (activeStation === stationId) return true;
  if (
    stationId === 2 &&
    (pipeline.removeNulls ||
      pipeline.deduplicate ||
      pipeline.filterOutliers ||
      pipeline.normalizeScale)
  ) {
    return true;
  }
  return false;
}

function createCrtPhosphorShaderMaterial(
  emissiveTexture: THREE.CanvasTexture,
  initialQuality: number
): {
  material: THREE.MeshPhysicalMaterial;
  uniforms: {
    uCrtTime: { value: number };
    uCrtQuality: { value: number };
    uCrtHover: { value: number };
    uCrtImpact: { value: number };
  };
} {
  const uniforms = {
    uCrtTime: { value: 0 },
    uCrtQuality: { value: initialQuality },
    uCrtHover: { value: 0 },
    uCrtImpact: { value: 0 },
  };

  const material = new THREE.MeshPhysicalMaterial({
    map: emissiveTexture,
    emissiveMap: emissiveTexture,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 1.05,
    roughness: 0.16,
    metalness: 0.04,
    clearcoat: 0.78,
    clearcoatRoughness: 0.1,
  });

  material.customProgramCacheKey = () => 'retro-crt-scanline-v2';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uCrtTime = uniforms.uCrtTime;
    shader.uniforms.uCrtQuality = uniforms.uCrtQuality;
    shader.uniforms.uCrtHover = uniforms.uCrtHover;
    shader.uniforms.uCrtImpact = uniforms.uCrtImpact;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `
      #include <common>
      uniform float uCrtTime;
      uniform float uCrtQuality;
      uniform float uCrtHover;
      uniform float uCrtImpact;

      vec2 crtBarrelUv(vec2 uv) {
        vec2 centered = uv * 2.0 - 1.0;
        float r2 = dot(centered, centered);
        vec2 warped = centered * (1.0 + 0.065 * r2);
        float noiseAmp = (1.0 - clamp(uCrtQuality, 0.0, 1.0)) * 0.0022 + uCrtImpact * 0.0035;
        warped.x += sin(uv.y * 28.0 + uCrtTime * 14.0) * noiseAmp;
        return warped * 0.5 + 0.5;
      }

      vec4 sampleCrtScreen(sampler2D tex, vec2 rawUv) {
        vec2 uv = crtBarrelUv(rawUv);
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
          return vec4(0.02, 0.05, 0.06, 1.0);
        }

        float shift = 0.0014 + uCrtImpact * 0.0018;
        float r = texture2D(tex, clamp(uv + vec2(shift, 0.0), 0.0, 1.0)).r;
        float g = texture2D(tex, uv).g;
        float b = texture2D(tex, clamp(uv - vec2(shift, 0.0), 0.0, 1.0)).b;
        vec3 col = vec3(r, g, b);

        float scanline = 0.88 + 0.12 * sin(uv.y * 320.0 + uCrtTime * 1.5);
        float grille = 0.96 + 0.04 * sin(uv.x * 460.0);
        float beamPos = fract(uCrtTime * 0.22);
        float beam = exp(-pow((uv.y - (1.0 - beamPos)) * 11.0, 2.0)) * (0.18 + uCrtHover * 0.12 + uCrtImpact * 0.25);

        vec2 d = abs(uv - 0.5) * 2.0;
        float vig = clamp(1.0 - dot(d * d, vec2(0.22, 0.26)), 0.48, 1.0);

        float boost = 1.0 + uCrtHover * 0.08 + uCrtImpact * 0.22;
        col = (col * scanline * grille * boost + vec3(0.06, 0.22, 0.25) * beam) * vig;
        return vec4(col, 1.0);
      }
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `
      #ifdef USE_MAP
        vec4 sampledDiffuseColor = sampleCrtScreen( map, vMapUv );
        diffuseColor *= sampledDiffuseColor;
      #endif
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      `
      #ifdef USE_EMISSIVEMAP
        vec4 emissiveColor = sampleCrtScreen( emissiveMap, vEmissiveMapUv );
        totalEmissiveRadiance *= emissiveColor.rgb;
      #endif
      `
    );
  };

  return { material, uniforms };
}

export const LabViewport3D: React.FC<LabViewport3DProps> = ({
  scenario,
  pipeline,
  stats,
  activeStation,
  crtReportPage,
  report,
  cameraPresetTrigger,
  onSelectObject,
  onSelectCrtButton,
  onOrbitExplore,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rigRef = useRef<LabSceneRig | null>(null);
  const crtUniformsRef = useRef<{
    uCrtTime: { value: number };
    uCrtQuality: { value: number };
    uCrtHover: { value: number };
    uCrtImpact: { value: number };
  } | null>(null);
  const crtHoverTargetRef = useRef(0);
  const crtImpactRef = useRef(0);
  const onSelectRef = useRef(onSelectObject);
  onSelectRef.current = onSelectObject;
  const onSelectCrtButtonRef = useRef(onSelectCrtButton);
  onSelectCrtButtonRef.current = onSelectCrtButton;
  const onOrbitExploreRef = useRef(onOrbitExplore);
  onOrbitExploreRef.current = onOrbitExplore;
  const activeStationRef = useRef<StationId | null>(activeStation);
  activeStationRef.current = activeStation;
  const pipelineRef = useRef<PipelineState>(pipeline);
  pipelineRef.current = pipeline;

  const cameraTransitionActiveRef = useRef(false);
  const [webglError, setWebglError] = useState(false);

  // Sync camera target whenever station or overview trigger changes
  useEffect(() => {
    if (activeStation) {
      const meta = STATIONS.find((s) => s.id === activeStation);
      if (meta) {
        _desiredPos.set(...meta.cameraPos);
        _desiredTarget.set(...meta.cameraTarget);
        cameraTransitionActiveRef.current = true;
      }
    } else {
      _desiredPos.copy(OVERVIEW_POS);
      _desiredTarget.copy(OVERVIEW_TARGET);
      cameraTransitionActiveRef.current = true;
    }
  }, [activeStation, cameraPresetTrigger]);

  // Sync live data & CRT phosphor metrics into the 3D rig
  useEffect(() => {
    const rig = rigRef.current;
    if (rig) {
      rig.updateFromState(scenario, pipeline, stats, activeStation);
      rig.setCrtPage(crtReportPage);
      updateInsightBoardCanvas(
        rig.insightBoardCanvas,
        rig.insightBoardTexture,
        scenario,
        stats,
        crtReportPage,
        report
      );
    }
    if (crtUniformsRef.current) {
      crtUniformsRef.current.uCrtQuality.value = stats.qualityScore / 100;
    }
  }, [scenario, pipeline, stats, activeStation, crtReportPage, report]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c121e);
    scene.fog = new THREE.FogExp2(0x0c121e, 0.026);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      80
    );
    camera.position.copy(OVERVIEW_POS);

    // Studio Environment Reflection (mandatory on all devices)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.72;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // 3-Point Retro Lab Lighting (Warm Tungsten/Amber Lamp + Cool Indigo Night Fill + Cyan Rim)
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x3f2414, 0.82);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffe4bd, 2.0);
    keyLight.position.set(5.5, 10.5, 7);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(2048, 2048);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 30;
      keyLight.shadow.camera.left = -9.5;
      keyLight.shadow.camera.right = 9.5;
      keyLight.shadow.camera.top = 6;
      keyLight.shadow.camera.bottom = -6;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const deskLampLight = new THREE.PointLight(0xffb347, 2.8, 12, 1.8);
    deskLampLight.position.set(-5.7, 2.1, -0.8);
    scene.add(deskLampLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.95);
    rimLight.position.set(-7.5, 5.5, -7);
    scene.add(rimLight);

    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softbox = new THREE.RectAreaLight(0xe0f2fe, 1.4, 11, 2.8);
      softbox.position.set(0, 6.2, 2.8);
      softbox.lookAt(0, 0.5, 0);
      scene.add(softbox);
    }

    // Build Procedural Laboratory Instruments
    const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const rig = buildLabScene(isSoftwareGl, maxAnisotropy);
    rigRef.current = rig;
    scene.add(rig.root);

    // Apply Emissive Phosphor Texture & CRT Scanline Distortion Shader to the CRT Monitor
    const { material: crtShaderMat, uniforms: crtUniforms } =
      createCrtPhosphorShaderMaterial(
        rig.insightBoardTexture,
        stats.qualityScore / 100
      );
    crtUniformsRef.current = crtUniforms;
    if (!Array.isArray(rig.crtScreen.material)) {
      rig.crtScreen.material.dispose();
    }
    rig.crtScreen.material = crtShaderMat;

    rig.updateFromState(scenario, pipeline, stats, activeStation);
    rig.setCrtPage(crtReportPage);
    updateInsightBoardCanvas(
      rig.insightBoardCanvas,
      rig.insightBoardTexture,
      scenario,
      stats,
      crtReportPage,
      report
    );

    // Subtle Floating Retro-Lab Dust & Phosphor Motes
    const PARTICLE_COUNT = 160;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(PARTICLE_COUNT * 3);
    const particleBase = new Float32Array(PARTICLE_COUNT * 3);
    const particlePhase = new Float32Array(PARTICLE_COUNT);
    const particleColors = new Float32Array(PARTICLE_COUNT * 3);
    const palette = [
      new THREE.Color(0xf59e0b), // Warm Nixie Amber
      new THREE.Color(0x22d3ee), // Phosphor Cyan
      new THREE.Color(0xfde68a), // Tungsten Dust Cream
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const px = (Math.random() - 0.5) * 16.5;
      const py = -0.3 + Math.random() * 4.4;
      const pz = (Math.random() - 0.5) * 7.5;
      particlePos[i * 3] = px;
      particlePos[i * 3 + 1] = py;
      particlePos[i * 3 + 2] = pz;
      particleBase[i * 3] = px;
      particleBase[i * 3 + 1] = py;
      particleBase[i * 3 + 2] = pz;
      particlePhase[i] = Math.random() * Math.PI * 2;

      const c = palette[i % palette.length];
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleTex = createParticleGlowTexture();
    const particleMat = new THREE.PointsMaterial({
      size: 0.085,
      map: particleTex,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      sizeAttenuation: true,
    });
    const ambientParticles = new THREE.Points(particleGeo, particleMat);
    ambientParticles.frustumCulled = false;
    scene.add(ambientParticles);

    // Depth of Field (DoF) Post-Processing Pipeline (Hardware GPUs)
    let composer: EffectComposer | null = null;
    let bokehPass: BokehPass | null = null;
    if (!isSoftwareGl) {
      const w = container.clientWidth;
      const h = Math.max(1, container.clientHeight);
      composer = new EffectComposer(renderer);
      composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      composer.setSize(w, h);
      composer.addPass(new RenderPass(scene, camera));

      bokehPass = new BokehPass(scene, camera, {
        focus: OVERVIEW_POS.distanceTo(OVERVIEW_TARGET),
        aperture: 0.00072,
        maxblur: 0.0036,
      });
      composer.addPass(bokehPass);
      composer.addPass(new OutputPass());
    }

    // Pre-compile shaders on hardware GPUs
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(OVERVIEW_TARGET);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.minDistance = 2.8;
    controls.maxDistance = 19.5;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI / 2 - 0.06;
    controls.update();

    const startCamPos = new THREE.Vector3();
    let userOrbitTracking = false;
    let orbitReportedForGesture = false;

    let lastHoveredStation: StationId | null = null;
    let lastHoveredEnergized = false;

    const clearHoverFeedback = () => {
      if (lastHoveredStation !== null) {
        lastHoveredStation = null;
        lastHoveredEnergized = false;
        crtHoverTargetRef.current = 0;
        rig.setHoveredStation(null, false);
        labAudio.stopStaticHover();
      }
    };

    const handleControlsStart = () => {
      cameraTransitionActiveRef.current = false;
      startCamPos.copy(camera.position);
      userOrbitTracking = true;
      orbitReportedForGesture = false;
      clearHoverFeedback();
    };

    const handleControlsChange = () => {
      if (!userOrbitTracking || orbitReportedForGesture) return;
      if (camera.position.distanceTo(startCamPos) > 0.14) {
        orbitReportedForGesture = true;
        onOrbitExploreRef.current?.(activeStationRef.current);
      }
    };

    const handleControlsEnd = () => {
      userOrbitTracking = false;
    };

    controls.addEventListener('start', handleControlsStart);
    controls.addEventListener('change', handleControlsChange);
    controls.addEventListener('end', handleControlsEnd);

    // Raycasting for Click & Hover on 3D Instruments
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);

    let pointerDownX = 0;
    let pointerDownY = 0;
    let lastHoverTime = 0;

    const updateMouse = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
      labAudio.unlock();
    };

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverTime < 65) return;
      lastHoverTime = now;

      if (userOrbitTracking) return;

      updateMouse(e.clientX, e.clientY);
      raycaster.setFromCamera(_mouse, camera);
      const hits = raycaster.intersectObjects(rig.interactables, false);
      renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab';

      if (hits.length > 0) {
        const hitObj = hits[0].object;
        const stationId = hitObj.userData.stationId as StationId | undefined;
        if (stationId) {
          const energized = isInstrumentEnergized(
            stationId,
            pipelineRef.current,
            activeStationRef.current
          );
          if (stationId !== lastHoveredStation || energized !== lastHoveredEnergized) {
            lastHoveredStation = stationId;
            lastHoveredEnergized = energized;
            rig.setHoveredStation(stationId, energized);
            crtHoverTargetRef.current = stationId === 6 ? 1 : 0;
            if (energized) {
              labAudio.startStaticHover(stationId);
              labAudio.triggerHaptic(4);
            } else {
              labAudio.stopStaticHover();
            }
          }
          return;
        }
      }

      clearHoverFeedback();
    };

    const onPointerLeave = () => {
      renderer.domElement.style.cursor = 'grab';
      clearHoverFeedback();
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
      if (dist > 6) return; // Ignore orbit drags

      updateMouse(e.clientX, e.clientY);
      raycaster.setFromCamera(_mouse, camera);
      const hits = raycaster.intersectObjects(rig.interactables, false);
      if (hits.length > 0) {
        const hitObj = hits[0].object;
        const crtPage = hitObj.userData.crtPage as CrtReportPage | undefined;
        const glossaryId = hitObj.userData.glossaryId as string | undefined;
        const stationId = hitObj.userData.stationId as StationId | undefined;
        if (crtPage) {
          labAudio.playGearSnap(6);
          labAudio.triggerHaptic([12, 18, 8]);
          rig.triggerSelectImpulse(6);
          rig.setCrtPage(crtPage);
          crtImpactRef.current = 1.0;
          onSelectCrtButtonRef.current?.(crtPage);
        } else if (glossaryId && stationId) {
          labAudio.playGearSnap(stationId);
          labAudio.triggerHaptic([12, 18, 8]);
          rig.triggerSelectImpulse(stationId);
          if (stationId === 6) {
            crtImpactRef.current = 1.0;
          }
          onSelectRef.current(glossaryId, stationId);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // Resize observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (composer) {
        composer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    // Render Loop (GPU rAF + Software-WebGL fence pacing)
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
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

    function tick() {
      if (disposed) return;
      const dt = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (cameraTransitionActiveRef.current) {
        const safeDt = Math.min(dt, 0.05);
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _desiredPos.x, 5.5, safeDt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _desiredPos.y, 5.5, safeDt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _desiredPos.z, 5.5, safeDt);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, _desiredTarget.x, 6.0, safeDt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _desiredTarget.y, 6.0, safeDt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _desiredTarget.z, 6.0, safeDt);

        if (
          camera.position.distanceTo(_desiredPos) < 0.03 &&
          controls.target.distanceTo(_desiredTarget) < 0.02
        ) {
          cameraTransitionActiveRef.current = false;
        }
      }

      controls.update();
      rig.animate(dt, elapsed);
      if (crtUniformsRef.current) {
        const safeCrtDt = Math.min(dt, 0.05);
        crtUniformsRef.current.uCrtTime.value = elapsed;
        crtUniformsRef.current.uCrtHover.value = THREE.MathUtils.damp(
          crtUniformsRef.current.uCrtHover.value,
          crtHoverTargetRef.current,
          10,
          safeCrtDt
        );
        crtImpactRef.current = THREE.MathUtils.damp(
          crtImpactRef.current,
          0,
          9,
          safeCrtDt
        );
        crtUniformsRef.current.uCrtImpact.value = crtImpactRef.current;
      }

      // Gently drift ambient retro-lab particles
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ph = particlePhase[i];
        const bx = particleBase[i * 3];
        const by = particleBase[i * 3 + 1];
        const bz = particleBase[i * 3 + 2];
        posAttr.setXYZ(
          i,
          bx + Math.sin(elapsed * 0.25 + ph) * 0.18,
          by + Math.cos(elapsed * 0.32 + ph * 1.3) * 0.16,
          bz + Math.sin(elapsed * 0.21 + ph * 0.7) * 0.16
        );
      }
      posAttr.needsUpdate = true;

      if (composer && bokehPass) {
        const focusDist = camera.position.distanceTo(controls.target);
        const uniforms = bokehPass.uniforms as Record<string, { value: number }>;
        if (uniforms.focus) {
          uniforms.focus.value = THREE.MathUtils.damp(
            uniforms.focus.value,
            focusDist,
            8,
            Math.min(dt, 0.05)
          );
        }
        composer.render();
      } else {
        renderer.render(scene, camera);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('start', handleControlsStart);
      controls.removeEventListener('change', handleControlsChange);
      controls.removeEventListener('end', handleControlsEnd);
      controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      labAudio.stopStaticHover();
      particleGeo.dispose();
      particleMat.dispose();
      particleTex.dispose();
      if (composer) {
        composer.dispose();
      }
      crtShaderMat.dispose();
      crtUniformsRef.current = null;
      rig.dispose();
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      rigRef.current = null;
    };
    // Intentionally run once on mount; data/camera updates flow via refs & effects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (webglError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0C121E] p-8 text-center">
        <div className="max-w-md bg-[#121A29] border border-[#2A3950] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[#F1F5F9] mb-2">
            Visualização 3D Indisponível
          </h2>
          <p className="text-sm text-[#94A3B8]">
            Seu navegador não pôde inicializar o contexto WebGL neste momento.
            Os controles e estatísticas do laboratório continuam ativos abaixo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-full relative select-none"
      aria-label="Bancada interativa 3D do Ateliê de Dados"
    />
  );
};
