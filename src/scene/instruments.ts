import * as THREE from 'three';
import {
  CrtReportPage,
  DataRecord,
  PipelineState,
  ProcessedStats,
  ScenarioDataset,
  StationId,
} from '../types/lab';
import {
  createContactShadowTexture,
  createCopperScaleTexture,
  createCrtControlStripTexture,
  createDialGaugeTexture,
  createInsightBoardCanvas,
  createSieveMeshTexture,
  createWalnutWoodTextures,
} from './textures';

export interface LabSceneRig {
  root: THREE.Group;
  interactables: THREE.Object3D[];
  stationAnchors: Record<StationId, THREE.Vector3>;
  urnCapsules: THREE.InstancedMesh;
  urnOutlierSpikes: THREE.InstancedMesh;
  sieveTrayGroup: THREE.Group;
  sieveDiverterArm: THREE.Mesh;
  sieveValidBeads: THREE.InstancedMesh;
  sieveDiscardBeads: THREE.InstancedMesh;
  balanceBeamGroup: THREE.Group;
  balancePointer: THREE.Mesh;
  histogramColumns: THREE.Mesh[];
  scatterBeads: THREE.InstancedMesh;
  regressionRod: THREE.Mesh;
  prismCore: THREE.Mesh;
  gearPrimary: THREE.Mesh;
  gearSecondary: THREE.Mesh;
  gearTertiary: THREE.Mesh;
  dialNeedlePivot: THREE.Group;
  insightBoardCanvas: HTMLCanvasElement;
  insightBoardTexture: THREE.CanvasTexture;
  crtScreen: THREE.Mesh;
  insightSignalLight: THREE.Mesh;
  stageRingMeshes: Record<StationId, THREE.Mesh>;
  updateFromState: (
    scenario: ScenarioDataset,
    pipeline: PipelineState,
    stats: ProcessedStats,
    activeStation: StationId | null
  ) => void;
  setHoveredStation: (stationId: StationId | null, isEnergized?: boolean) => void;
  triggerSelectImpulse: (stationId: StationId) => void;
  setCrtPage: (page: CrtReportPage) => void;
  animate: (dt: number, elapsed: number) => void;
  dispose: () => void;
}

const _dummy = new THREE.Object3D();
const _color = new THREE.Color();
const _targetScale = new THREE.Vector3();

function tagInteractable(
  obj: THREE.Object3D,
  glossaryId: string,
  stationId: StationId,
  interactables: THREE.Object3D[]
) {
  obj.userData.glossaryId = glossaryId;
  obj.userData.stationId = stationId;
  obj.layers.enable(1);
  interactables.push(obj);
}

function createGearGeometry(
  outerRadius: number,
  innerRadius: number,
  teeth: number,
  thickness: number
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;
  const toothDepth = outerRadius * 0.14;
  const baseR = outerRadius - toothDepth;

  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const a1 = a0 + step * 0.22;
    const a2 = a0 + step * 0.34;
    const a3 = a0 + step * 0.66;
    const a4 = a0 + step * 0.78;

    const p0x = Math.cos(a0) * baseR;
    const p0y = Math.sin(a0) * baseR;
    if (i === 0) shape.moveTo(p0x, p0y);
    else shape.lineTo(p0x, p0y);

    shape.lineTo(Math.cos(a1) * baseR, Math.sin(a1) * baseR);
    shape.lineTo(Math.cos(a2) * outerRadius, Math.sin(a2) * outerRadius);
    shape.lineTo(Math.cos(a3) * outerRadius, Math.sin(a3) * outerRadius);
    shape.lineTo(Math.cos(a4) * baseR, Math.sin(a4) * baseR);
  }
  shape.closePath();

  const hole = new THREE.Path();
  hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.012,
    bevelSegments: 2,
  });
  geo.center();
  return geo;
}

function createRoundedHousingGeometry(
  w: number,
  h: number,
  d: number,
  r: number
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const hw = w / 2;
  const hh = h / 2;
  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
  shape.lineTo(hw, hh - r);
  shape.quadraticCurveTo(hw, hh, hw - r, hh);
  shape.lineTo(-hw + r, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
  shape.lineTo(-hw, -hh + r);
  shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.03,
    bevelSegments: 3,
  });
  geo.center();
  return geo;
}

function createBezelFrameGeometry(
  outerW: number,
  outerH: number,
  innerW: number,
  innerH: number,
  r: number,
  depth: number
): THREE.ExtrudeGeometry {
  const outer = new THREE.Shape();
  const hw = outerW / 2;
  const hh = outerH / 2;
  outer.moveTo(-hw + r, -hh);
  outer.lineTo(hw - r, -hh);
  outer.quadraticCurveTo(hw, -hh, hw, -hh + r);
  outer.lineTo(hw, hh - r);
  outer.quadraticCurveTo(hw, hh, hw - r, hh);
  outer.lineTo(-hw + r, hh);
  outer.quadraticCurveTo(-hw, hh, -hw, hh - r);
  outer.lineTo(-hw, -hh + r);
  outer.quadraticCurveTo(-hw, -hh, -hw + r, -hh);

  const hole = new THREE.Path();
  const ihw = innerW / 2;
  const ihh = innerH / 2;
  const ir = Math.max(0.02, r * 0.55);
  hole.moveTo(-ihw + ir, -ihh);
  hole.lineTo(-ihw, -ihh + ir);
  hole.lineTo(-ihw, ihh - ir);
  hole.quadraticCurveTo(-ihw, ihh, -ihw + ir, ihh);
  hole.lineTo(ihw - ir, ihh);
  hole.quadraticCurveTo(ihw, ihh, ihw, ihh - ir);
  hole.lineTo(ihw, -ihh + ir);
  hole.quadraticCurveTo(ihw, -ihh, ihw - ir, -ihh);
  hole.lineTo(-ihw + ir, -ihh);
  outer.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(outer, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.01,
    bevelSegments: 2,
  });
  geo.center();
  return geo;
}

export function buildLabScene(
  isSoftwareGl: boolean,
  maxAnisotropy: number
): LabSceneRig {
  const root = new THREE.Group();
  const interactables: THREE.Object3D[] = [];
  const disposableGeos: THREE.BufferGeometry[] = [];
  const disposableMats: THREE.Material[] = [];
  const disposableTex: THREE.Texture[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    disposableGeos.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    disposableMats.push(m);
    return m;
  };

  // Textures
  const walnutTex = createWalnutWoodTextures(maxAnisotropy);
  const copperScaleTex = createCopperScaleTexture(maxAnisotropy);
  const sieveMeshTex = createSieveMeshTexture(maxAnisotropy);
  const dialGaugeTex = createDialGaugeTexture(maxAnisotropy);
  const contactShadowTex = createContactShadowTexture();
  const crtControlStripTex = createCrtControlStripTexture(maxAnisotropy);
  const insightBoard = createInsightBoardCanvas(maxAnisotropy);
  disposableTex.push(
    walnutTex.map,
    walnutTex.roughnessMap,
    copperScaleTex,
    sieveMeshTex,
    dialGaugeTex,
    contactShadowTex,
    crtControlStripTex,
    insightBoard.texture
  );

  // Calibrated PBR Material Library (Walnut, Brushed Copper, Bakelite, Enamel, Borosilicate Glass, Phosphor)
  const walnutBenchMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: walnutTex.map,
      roughnessMap: walnutTex.roughnessMap,
      roughness: 0.54,
      metalness: 0.04,
    })
  );

  const darkWalnutMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x4b2e1b,
      roughness: 0.56,
      metalness: 0.04,
    })
  );

  const copperBrassMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xd99b52,
      metalness: 0.92,
      roughness: 0.2,
      anisotropy: 0.8,
      clearcoat: 0.25,
    })
  );

  const agedBronzeMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x8c5f34,
      metalness: 0.85,
      roughness: 0.32,
    })
  );

  const retroTealEnamelMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x164e5a,
      metalness: 0.22,
      roughness: 0.28,
      clearcoat: 0.75,
    })
  );

  const bakeliteMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1a2232,
      metalness: 0.15,
      roughness: 0.42,
    })
  );

  const ceramicPorcelainMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xe6e1d6,
      metalness: 0.02,
      roughness: 0.3,
      clearcoat: 0.5,
    })
  );

  const cyanPhosphorMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x0891b2,
      emissiveIntensity: 0.85,
      roughness: 0.25,
      metalness: 0.1,
    })
  );

  const amberFilamentMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 1.1,
      roughness: 0.25,
      metalness: 0.1,
    })
  );

  const emeraldFluidMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x047857,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.08,
    })
  );

  const amberGlassMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xb45309,
      metalness: 0.0,
      roughness: 0.12,
      transparent: true,
      opacity: 0.62,
      clearcoat: 1.0,
      depthWrite: false,
    })
  );

  const glassMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xdbeafe,
      metalness: 0.0,
      roughness: 0.06,
      transmission: isSoftwareGl ? 0 : 0.88,
      transparent: true,
      opacity: isSoftwareGl ? 0.34 : 1.0,
      ior: 1.52,
      thickness: 0.35,
      clearcoat: 1.0,
      depthWrite: false,
    })
  );

  const contactShadowMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
    })
  );

  // =========================================================
  // 0. OBSERVATORY STUDIO FLOOR, WALNUT WORKBENCH & RETRO LAMP
  // =========================================================
  const studioFloorGeo = trackGeo(new THREE.CircleGeometry(40, 64));
  const studioFloorMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x0b101b,
      roughness: 0.9,
      metalness: 0.05,
    })
  );
  const studioFloor = new THREE.Mesh(studioFloorGeo, studioFloorMat);
  studioFloor.rotation.x = -Math.PI / 2;
  studioFloor.position.y = -2.1;
  studioFloor.receiveShadow = true;
  root.add(studioFloor);

  // Walnut Workbench Tabletop (beveled thick wood slab, top at y = 0)
  const benchGeo = trackGeo(createRoundedHousingGeometry(14.0, 4.1, 0.28, 0.26));
  benchGeo.rotateX(Math.PI / 2);
  const benchMesh = new THREE.Mesh(benchGeo, walnutBenchMat);
  benchMesh.position.y = -0.17;
  benchMesh.receiveShadow = true;
  benchMesh.castShadow = true;
  root.add(benchMesh);

  // Turned Vintage Wood & Brass Legs
  const legPts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.11, 0),
    new THREE.Vector2(0.11, 0.14),
    new THREE.Vector2(0.075, 0.22),
    new THREE.Vector2(0.125, 0.7),
    new THREE.Vector2(0.085, 1.35),
    new THREE.Vector2(0.13, 1.75),
    new THREE.Vector2(0.13, 1.84),
    new THREE.Vector2(0, 1.84),
  ];
  const turnedLegGeo = trackGeo(new THREE.LatheGeometry(legPts, 24));
  const legPositions: [number, number][] = [
    [-6.2, -1.58],
    [6.2, -1.58],
    [-6.2, 1.58],
    [6.2, 1.58],
  ];
  for (const [lx, lz] of legPositions) {
    const leg = new THREE.Mesh(turnedLegGeo, darkWalnutMat);
    leg.position.set(lx, -2.1, lz);
    leg.castShadow = true;
    root.add(leg);
  }

  // Front Console Copper & Bakelite Ruler Strip
  const rulerMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: copperScaleTex,
      metalness: 0.55,
      roughness: 0.34,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    })
  );
  const rulerGeo = trackGeo(new THREE.BoxGeometry(12.2, 0.025, 0.44));
  const rulerMesh = new THREE.Mesh(rulerGeo, rulerMat);
  rulerMesh.position.set(0, 0.015, 1.52);
  rulerMesh.receiveShadow = true;
  root.add(rulerMesh);

  // Curved Copper Conduit Pipes with Brass Flanges connecting stations
  const conduitCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5.5, 0.16, -0.82),
    new THREE.Vector3(-4.4, 0.28, -1.05),
    new THREE.Vector3(-3.3, 0.16, -0.85),
    new THREE.Vector3(-2.2, 0.26, -1.02),
    new THREE.Vector3(-1.1, 0.16, -0.85),
    new THREE.Vector3(0.0, 0.28, -1.04),
    new THREE.Vector3(1.1, 0.16, -0.85),
    new THREE.Vector3(2.2, 0.26, -1.02),
    new THREE.Vector3(3.3, 0.16, -0.85),
    new THREE.Vector3(4.4, 0.28, -1.05),
    new THREE.Vector3(5.5, 0.16, -0.82),
  ]);
  const conduitGeo = trackGeo(new THREE.TubeGeometry(conduitCurve, 96, 0.042, 14, false));
  const conduitMesh = new THREE.Mesh(conduitGeo, copperBrassMat);
  conduitMesh.castShadow = true;
  root.add(conduitMesh);

  // Retro Articulated Brass Banker/Lab Lamp on back-left corner
  const lampGroup = new THREE.Group();
  lampGroup.position.set(-6.5, 0, -1.42);
  root.add(lampGroup);

  const lampBasePts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.32, 0),
    new THREE.Vector2(0.3, 0.06),
    new THREE.Vector2(0.14, 0.12),
    new THREE.Vector2(0.05, 0.16),
  ];
  const lampBase = new THREE.Mesh(trackGeo(new THREE.LatheGeometry(lampBasePts, 28)), agedBronzeMat);
  lampBase.castShadow = true;
  lampGroup.add(lampBase);

  const lampArmCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.14, 0),
    new THREE.Vector3(-0.1, 1.05, -0.15),
    new THREE.Vector3(0.35, 1.85, 0.28),
    new THREE.Vector3(0.75, 1.72, 0.55),
  ]);
  const lampArm = new THREE.Mesh(
    trackGeo(new THREE.TubeGeometry(lampArmCurve, 32, 0.028, 12, false)),
    copperBrassMat
  );
  lampArm.castShadow = true;
  lampGroup.add(lampArm);

  const shadePts = [
    new THREE.Vector2(0.05, 0.22),
    new THREE.Vector2(0.18, 0.16),
    new THREE.Vector2(0.28, 0.0),
  ];
  const lampShade = new THREE.Mesh(
    trackGeo(new THREE.LatheGeometry(shadePts, 28)),
    retroTealEnamelMat
  );
  lampShade.position.set(0.76, 1.56, 0.58);
  lampShade.rotation.z = -0.35;
  lampShade.rotation.x = 0.25;
  lampShade.castShadow = true;
  lampGroup.add(lampShade);

  const lampBulb = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.09, 16, 12)),
    amberFilamentMat
  );
  lampBulb.position.set(0.76, 1.54, 0.58);
  lampGroup.add(lampBulb);

  const stationXs: Record<StationId, number> = {
    1: -5.5,
    2: -3.3,
    3: -1.1,
    4: 1.1,
    5: 3.3,
    6: 5.5,
  };

  const stationAnchors: Record<StationId, THREE.Vector3> = {
    1: new THREE.Vector3(stationXs[1], 0.9, 0),
    2: new THREE.Vector3(stationXs[2], 0.85, 0),
    3: new THREE.Vector3(stationXs[3], 0.95, 0),
    4: new THREE.Vector3(stationXs[4], 1.0, 0),
    5: new THREE.Vector3(stationXs[5], 0.95, 0),
    6: new THREE.Vector3(stationXs[6], 0.95, 0),
  };

  // Contact Shadows & Luminous Station Rings
  const stageRingMeshes = {} as Record<StationId, THREE.Mesh>;
  const shadowGeo = trackGeo(new THREE.PlaneGeometry(2.3, 2.3));
  const ringGeo = trackGeo(new THREE.RingGeometry(0.92, 0.98, 48));

  (Object.keys(stationXs) as unknown as StationId[]).forEach((sid) => {
    const sx = stationXs[sid];
    const cShadow = new THREE.Mesh(shadowGeo, contactShadowMat);
    cShadow.rotation.x = -Math.PI / 2;
    cShadow.position.set(sx, 0.008, 0);
    root.add(cShadow);

    const ringMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.0,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      })
    );
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(sx, 0.018, 0);
    root.add(ring);
    stageRingMeshes[sid] = ring;
  });

  // =========================================================
  // STATION 01: ERLENMEYER DE RECEPÇÃO & VÁLVULA COLETORA
  // =========================================================
  const st1 = new THREE.Group();
  st1.position.set(stationXs[1], 0, 0);
  root.add(st1);

  // Turned Walnut & Brass Circular Pedestal
  const st1BasePts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.76, 0),
    new THREE.Vector2(0.76, 0.08),
    new THREE.Vector2(0.68, 0.14),
    new THREE.Vector2(0.64, 0.2),
    new THREE.Vector2(0, 0.2),
  ];
  const st1Base = new THREE.Mesh(trackGeo(new THREE.LatheGeometry(st1BasePts, 40)), darkWalnutMat);
  st1Base.castShadow = true;
  st1Base.receiveShadow = true;
  st1.add(st1Base);
  tagInteractable(st1Base, 'raw-urn', 1, interactables);

  // Brass Heating Collar Ring
  const st1Ring = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.61, 0.035, 14, 40)),
    copperBrassMat
  );
  st1Ring.rotation.x = Math.PI / 2;
  st1Ring.position.y = 0.21;
  st1.add(st1Ring);

  // Realistic Sculpted Borosilicate Erlenmeyer Flask (LatheGeometry)
  const erlenPts = [
    new THREE.Vector2(0.01, 0.2),
    new THREE.Vector2(0.56, 0.2),
    new THREE.Vector2(0.62, 0.26),
    new THREE.Vector2(0.58, 0.44),
    new THREE.Vector2(0.32, 0.98),
    new THREE.Vector2(0.21, 1.24),
    new THREE.Vector2(0.21, 1.52),
    new THREE.Vector2(0.26, 1.58),
    new THREE.Vector2(0.22, 1.6),
  ];
  const erlenGeo = trackGeo(new THREE.LatheGeometry(erlenPts, 44));
  const erlenMesh = new THREE.Mesh(erlenGeo, glassMat);
  erlenMesh.renderOrder = 4;
  st1.add(erlenMesh);
  tagInteractable(erlenMesh, 'raw-urn', 1, interactables);

  // Copper Collar & Curved S-Pipe Intake Chute entering flask neck
  const flaskCollar = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.23, 0.23, 0.09, 28)),
    copperBrassMat
  );
  flaskCollar.position.y = 1.46;
  st1.add(flaskCollar);

  const intakeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.54, 0),
    new THREE.Vector3(0, 1.82, 0),
    new THREE.Vector3(0.35, 1.92, -0.15),
    new THREE.Vector3(0.65, 1.55, -0.35),
    new THREE.Vector3(0.7, 0.22, -0.55),
  ]);
  const intakePipe = new THREE.Mesh(
    trackGeo(new THREE.TubeGeometry(intakeCurve, 40, 0.045, 14, false)),
    copperBrassMat
  );
  intakePipe.castShadow = true;
  st1.add(intakePipe);
  tagInteractable(intakePipe, 'raw-urn', 1, interactables);

  // Side Pilot Vacuum Tube next to Erlenmeyer
  const pilotBulbPts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.11, 0),
    new THREE.Vector2(0.12, 0.32),
    new THREE.Vector2(0.08, 0.42),
    new THREE.Vector2(0.02, 0.48),
    new THREE.Vector2(0, 0.5),
  ];
  const pilotGlass = new THREE.Mesh(trackGeo(new THREE.LatheGeometry(pilotBulbPts, 24)), glassMat);
  pilotGlass.position.set(-0.56, 0.2, 0.28);
  pilotGlass.renderOrder = 4;
  st1.add(pilotGlass);
  tagInteractable(pilotGlass, 'raw-urn', 1, interactables);

  const pilotFilament = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.025, 0.025, 0.26, 12)),
    amberFilamentMat
  );
  pilotFilament.position.set(-0.56, 0.36, 0.28);
  st1.add(pilotFilament);

  // Instanced Sample Spheres inside Erlenmeyer
  const MAX_CAPSULES = 64;
  const capsuleGeo = trackGeo(new THREE.SphereGeometry(0.06, 16, 12));
  const capsuleMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.22,
      metalness: 0.18,
    })
  );
  const urnCapsules = new THREE.InstancedMesh(capsuleGeo, capsuleMat, MAX_CAPSULES);
  urnCapsules.frustumCulled = false;
  urnCapsules.castShadow = true;
  st1.add(urnCapsules);
  tagInteractable(urnCapsules, 'null-capsule', 1, interactables);

  // Outlier Spiky Crystals inside Erlenmeyer
  const spikeGeo = trackGeo(new THREE.OctahedronGeometry(0.082, 0));
  const spikeMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x991b1b,
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.35,
    })
  );
  const urnOutlierSpikes = new THREE.InstancedMesh(spikeGeo, spikeMat, 12);
  urnOutlierSpikes.frustumCulled = false;
  st1.add(urnOutlierSpikes);
  tagInteractable(urnOutlierSpikes, 'outlier-spike', 2, interactables);

  // =========================================================
  // STATION 02: CENTRÍFUGA VÁCUO-MECÂNICA & SIFÃO DE COBRE
  // =========================================================
  const st2 = new THREE.Group();
  st2.position.set(stationXs[2], 0, 0);
  root.add(st2);

  // Curved Walnut & Enamel Centrifuge Base Plinth
  const st2PlinthGeo = trackGeo(createRoundedHousingGeometry(1.72, 1.48, 0.14, 0.24));
  st2PlinthGeo.rotateX(Math.PI / 2);
  const st2Plinth = new THREE.Mesh(st2PlinthGeo, darkWalnutMat);
  st2Plinth.position.y = 0.07;
  st2Plinth.receiveShadow = true;
  st2Plinth.castShadow = true;
  st2.add(st2Plinth);

  // Curved Retro Teal Centrifuge Drum Housing (LatheGeometry)
  const drumPts = [
    new THREE.Vector2(0.01, 0.14),
    new THREE.Vector2(0.56, 0.14),
    new THREE.Vector2(0.6, 0.24),
    new THREE.Vector2(0.58, 0.62),
    new THREE.Vector2(0.46, 0.72),
    new THREE.Vector2(0.46, 0.78),
  ];
  const drumHousing = new THREE.Mesh(
    trackGeo(new THREE.LatheGeometry(drumPts, 40)),
    retroTealEnamelMat
  );
  drumHousing.position.set(-0.22, 0, -0.08);
  drumHousing.castShadow = true;
  st2.add(drumHousing);
  tagInteractable(drumHousing, 'sieve-mesh', 2, interactables);

  // Oscillating Sieve Ring + Trumpet Hopper
  const sieveTrayGroup = new THREE.Group();
  sieveTrayGroup.position.set(-0.22, 0.82, -0.08);
  st2.add(sieveTrayGroup);

  const trumpetPts = [
    new THREE.Vector2(0.45, 0),
    new THREE.Vector2(0.48, 0.08),
    new THREE.Vector2(0.32, 0.18),
    new THREE.Vector2(0.52, 0.42),
    new THREE.Vector2(0.48, 0.42),
    new THREE.Vector2(0.28, 0.18),
  ];
  const trumpetHopper = new THREE.Mesh(
    trackGeo(new THREE.LatheGeometry(trumpetPts, 36)),
    copperBrassMat
  );
  trumpetHopper.castShadow = true;
  sieveTrayGroup.add(trumpetHopper);
  tagInteractable(trumpetHopper, 'sieve-mesh', 2, interactables);

  const sieveScreenMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: sieveMeshTex,
      roughness: 0.42,
      metalness: 0.6,
    })
  );
  const sieveScreen = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.43, 0.43, 0.025, 32)),
    sieveScreenMat
  );
  sieveTrayGroup.add(sieveScreen);
  tagInteractable(sieveScreen, 'sieve-mesh', 2, interactables);

  // Brass Diverter Valve Lever
  const sieveDiverterArm = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.03, 0.04, 0.48, 12)),
    amberFilamentMat
  );
  sieveDiverterArm.rotation.z = Math.PI / 2;
  sieveDiverterArm.position.set(0.08, 0.66, 0.16);
  st2.add(sieveDiverterArm);

  // Curved Copper Siphon Pipe routing defects to Amber Carboy Bottle
  const siphonCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.24, 0.56, -0.08),
    new THREE.Vector3(0.48, 0.66, -0.02),
    new THREE.Vector3(0.56, 0.54, 0.14),
    new THREE.Vector3(0.56, 0.36, 0.2),
  ]);
  const siphonPipe = new THREE.Mesh(
    trackGeo(new THREE.TubeGeometry(siphonCurve, 28, 0.036, 12, false)),
    copperBrassMat
  );
  siphonPipe.castShadow = true;
  st2.add(siphonPipe);

  // Amber Glass Discard Carboy Bottle (LatheGeometry)
  const carboyPts = [
    new THREE.Vector2(0.01, 0.14),
    new THREE.Vector2(0.24, 0.14),
    new THREE.Vector2(0.28, 0.24),
    new THREE.Vector2(0.26, 0.42),
    new THREE.Vector2(0.11, 0.54),
    new THREE.Vector2(0.11, 0.62),
    new THREE.Vector2(0.14, 0.64),
  ];
  const discardCarboy = new THREE.Mesh(
    trackGeo(new THREE.LatheGeometry(carboyPts, 32)),
    amberGlassMat
  );
  discardCarboy.position.set(0.56, 0, 0.2);
  discardCarboy.renderOrder = 4;
  st2.add(discardCarboy);
  tagInteractable(discardCarboy, 'outlier-spike', 2, interactables);

  // Porcelain Valid Collection Bowl in front left
  const bowlPts = [
    new THREE.Vector2(0.01, 0.14),
    new THREE.Vector2(0.28, 0.14),
    new THREE.Vector2(0.4, 0.26),
    new THREE.Vector2(0.42, 0.36),
    new THREE.Vector2(0.38, 0.36),
    new THREE.Vector2(0.26, 0.18),
    new THREE.Vector2(0.01, 0.18),
  ];
  const validBowl = new THREE.Mesh(
    trackGeo(new THREE.LatheGeometry(bowlPts, 32)),
    ceramicPorcelainMat
  );
  validBowl.position.set(-0.34, 0, 0.38);
  validBowl.castShadow = true;
  validBowl.receiveShadow = true;
  st2.add(validBowl);
  tagInteractable(validBowl, 'sieve-mesh', 2, interactables);

  // Instanced Beads in Valid Bowl & Discard Carboy
  const smallBeadGeo = trackGeo(new THREE.SphereGeometry(0.038, 12, 10));
  const sieveValidBeads = new THREE.InstancedMesh(smallBeadGeo, emeraldFluidMat, 48);
  const discardBeadMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.2 })
  );
  const sieveDiscardBeads = new THREE.InstancedMesh(smallBeadGeo, discardBeadMat, 24);
  sieveValidBeads.frustumCulled = false;
  sieveDiscardBeads.frustumCulled = false;
  st2.add(sieveValidBeads);
  st2.add(sieveDiscardBeads);

  // =========================================================
  // STATION 03: BALANÇA ANALÍTICA VINTAGE & TUBOS BAROMÉTRICOS
  // =========================================================
  const st3 = new THREE.Group();
  st3.position.set(stationXs[3], 0, 0);
  root.add(st3);

  // Sculpted Walnut Rack Base
  const st3PlinthGeo = trackGeo(createRoundedHousingGeometry(1.78, 1.48, 0.14, 0.22));
  st3PlinthGeo.rotateX(Math.PI / 2);
  const st3Plinth = new THREE.Mesh(st3PlinthGeo, darkWalnutMat);
  st3Plinth.position.y = 0.07;
  st3Plinth.castShadow = true;
  st3Plinth.receiveShadow = true;
  st3.add(st3Plinth);
  tagInteractable(st3Plinth, 'scale-bars', 3, interactables);

  // Curved Walnut Test-Tube Rack Frame at rear
  const rackRailGeo = trackGeo(createRoundedHousingGeometry(1.48, 0.24, 0.05, 0.08));
  rackRailGeo.rotateX(Math.PI / 2);
  const rackRail = new THREE.Mesh(rackRailGeo, walnutBenchMat);
  rackRail.position.set(0, 0.56, -0.34);
  rackRail.castShadow = true;
  st3.add(rackRail);

  const rackPostGeo = trackGeo(new THREE.CylinderGeometry(0.028, 0.035, 0.5, 14));
  [-0.66, 0.66].forEach((px) => {
    const post = new THREE.Mesh(rackPostGeo, copperBrassMat);
    post.position.set(px, 0.35, -0.34);
    post.castShadow = true;
    st3.add(post);
  });

  // 7 Glass Test Tubes with Rounded Bottoms + Glowing Liquid Columns
  const tubePts = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(0.055, 0.02),
    new THREE.Vector2(0.075, 0.08),
    new THREE.Vector2(0.075, 0.92),
    new THREE.Vector2(0.09, 0.95),
    new THREE.Vector2(0.07, 0.95),
  ];
  const glassTubeGeo = trackGeo(new THREE.LatheGeometry(tubePts, 24));
  const fluidColGeo = trackGeo(new THREE.CylinderGeometry(0.058, 0.058, 0.82, 20));
  fluidColGeo.translate(0, 0.41, 0);

  const histogramColumns: THREE.Mesh[] = [];
  for (let i = 0; i < 7; i++) {
    const tx = -0.54 + i * 0.18;
    const tube = new THREE.Mesh(glassTubeGeo, glassMat);
    tube.position.set(tx, 0.16, -0.34);
    tube.renderOrder = 4;
    st3.add(tube);
    tagInteractable(tube, 'scale-bars', 3, interactables);

    const fluidMat = i === 3 ? amberFilamentMat : cyanPhosphorMat;
    const fluid = new THREE.Mesh(fluidColGeo, fluidMat);
    fluid.position.set(tx, 0.19, -0.34);
    fluid.scale.set(1, 0.3, 1);
    st3.add(fluid);
    histogramColumns.push(fluid);
    tagInteractable(fluid, 'scale-bars', 3, interactables);
  }

  // Vintage Brass Analytical Balance in foreground
  const fulcrumPts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.14, 0),
    new THREE.Vector2(0.11, 0.06),
    new THREE.Vector2(0.045, 0.14),
    new THREE.Vector2(0.032, 0.56),
    new THREE.Vector2(0.055, 0.6),
    new THREE.Vector2(0, 0.64),
  ];
  const fulcrum = new THREE.Mesh(
    trackGeo(new THREE.LatheGeometry(fulcrumPts, 24)),
    copperBrassMat
  );
  fulcrum.position.set(0, 0.14, 0.34);
  fulcrum.castShadow = true;
  st3.add(fulcrum);
  tagInteractable(fulcrum, 'scale-bars', 3, interactables);

  const balanceBeamGroup = new THREE.Group();
  balanceBeamGroup.position.set(0, 0.74, 0.34);
  st3.add(balanceBeamGroup);

  // Ornamental Curved Balance Beam (ExtrudeGeometry)
  const beamShape = new THREE.Shape();
  beamShape.moveTo(-0.62, 0);
  beamShape.quadraticCurveTo(-0.3, 0.09, 0, 0.06);
  beamShape.quadraticCurveTo(0.3, 0.09, 0.62, 0);
  beamShape.lineTo(0.62, -0.03);
  beamShape.quadraticCurveTo(0.3, 0.02, 0, -0.02);
  beamShape.quadraticCurveTo(-0.3, 0.02, -0.62, -0.03);
  beamShape.closePath();

  const beamGeo = trackGeo(
    new THREE.ExtrudeGeometry(beamShape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 2,
    })
  );
  beamGeo.center();
  const beamMesh = new THREE.Mesh(beamGeo, copperBrassMat);
  beamMesh.castShadow = true;
  balanceBeamGroup.add(beamMesh);
  tagInteractable(beamMesh, 'scale-bars', 3, interactables);

  // Concave Hanging Balance Pans
  const panPts = [
    new THREE.Vector2(0.001, -0.22),
    new THREE.Vector2(0.15, -0.21),
    new THREE.Vector2(0.21, -0.16),
    new THREE.Vector2(0.19, -0.15),
    new THREE.Vector2(0.14, -0.19),
    new THREE.Vector2(0.001, -0.2),
  ];
  const panGeo = trackGeo(new THREE.LatheGeometry(panPts, 24));
  const hangerGeo = trackGeo(new THREE.CylinderGeometry(0.008, 0.008, 0.22, 8));

  [-0.56, 0.56].forEach((px, idx) => {
    const pan = new THREE.Mesh(panGeo, idx === 0 ? emeraldFluidMat : amberFilamentMat);
    pan.position.set(px, 0, 0);
    balanceBeamGroup.add(pan);

    const hanger = new THREE.Mesh(hangerGeo, agedBronzeMat);
    hanger.position.set(px, -0.1, 0);
    balanceBeamGroup.add(hanger);
  });

  const balancePointer = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(0.026, 0.22, 12)),
    cyanPhosphorMat
  );
  balancePointer.position.set(0, 0.14, 0);
  balanceBeamGroup.add(balancePointer);

  // =========================================================
  // STATION 04: CÂMARA ÓPTICA DE DISPERSÃO & LENTES TELESCÓPICAS
  // =========================================================
  const st4 = new THREE.Group();
  st4.position.set(stationXs[4], 0, 0);
  root.add(st4);

  // Turned Walnut & Brass Circular Pedestal
  const st4BasePts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.84, 0),
    new THREE.Vector2(0.84, 0.09),
    new THREE.Vector2(0.74, 0.16),
    new THREE.Vector2(0.7, 0.22),
    new THREE.Vector2(0, 0.22),
  ];
  const st4Base = new THREE.Mesh(
    trackGeo(new THREE.LatheGeometry(st4BasePts, 40)),
    darkWalnutMat
  );
  st4Base.castShadow = true;
  st4Base.receiveShadow = true;
  st4.add(st4Base);

  // Curved Brass C-Arm Cradle holding Optical Sphere
  const cArmCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.2, 0),
    new THREE.Vector3(-0.78, 0.45, 0),
    new THREE.Vector3(-0.84, 1.0, 0),
    new THREE.Vector3(-0.56, 1.56, 0),
  ]);
  const cArmMesh = new THREE.Mesh(
    trackGeo(new THREE.TubeGeometry(cArmCurve, 36, 0.042, 14, false)),
    copperBrassMat
  );
  cArmMesh.castShadow = true;
  st4.add(cArmMesh);

  // Equatorial Brass Ring & Spherical Optical Chamber
  const gimbalRing = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.68, 0.032, 14, 48)),
    copperBrassMat
  );
  gimbalRing.position.y = 0.98;
  gimbalRing.rotation.x = Math.PI / 2 - 0.18;
  gimbalRing.castShadow = true;
  st4.add(gimbalRing);
  tagInteractable(gimbalRing, 'dispersion-prism', 4, interactables);

  const prismCore = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.64, 36, 28)),
    glassMat
  );
  prismCore.position.y = 0.98;
  prismCore.renderOrder = 4;
  st4.add(prismCore);
  tagInteractable(prismCore, 'dispersion-prism', 4, interactables);

  // Vintage Brass Microscope / Condenser Objective Lens Barrel on right
  const lensBarrelPts = [
    new THREE.Vector2(0.08, 0),
    new THREE.Vector2(0.14, 0.02),
    new THREE.Vector2(0.14, 0.18),
    new THREE.Vector2(0.1, 0.22),
    new THREE.Vector2(0.09, 0.38),
    new THREE.Vector2(0.12, 0.42),
    new THREE.Vector2(0.06, 0.44),
  ];
  const lensBarrel = new THREE.Mesh(
    trackGeo(new THREE.LatheGeometry(lensBarrelPts, 24)),
    copperBrassMat
  );
  lensBarrel.position.set(0.74, 0.98, 0.18);
  lensBarrel.rotation.z = Math.PI / 2;
  lensBarrel.rotation.y = 0.25;
  lensBarrel.castShadow = true;
  st4.add(lensBarrel);
  tagInteractable(lensBarrel, 'dispersion-prism', 4, interactables);

  // Glowing Cyan Laser Regression Rod inside Chamber
  const regressionRod = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.022, 0.022, 0.98, 14)),
    cyanPhosphorMat
  );
  regressionRod.position.set(0, 0.98, 0);
  regressionRod.rotation.z = Math.PI / 3;
  st4.add(regressionRod);
  tagInteractable(regressionRod, 'dispersion-prism', 4, interactables);

  // 3D Scatter Plot Luminous Beads (InstancedMesh)
  const scatterGeo = trackGeo(new THREE.SphereGeometry(0.038, 12, 10));
  const scatterMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x164e63,
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.15,
    })
  );
  const scatterBeads = new THREE.InstancedMesh(scatterGeo, scatterMat, MAX_CAPSULES);
  scatterBeads.frustumCulled = false;
  st4.add(scatterBeads);
  tagInteractable(scatterBeads, 'dispersion-prism', 4, interactables);

  // =========================================================
  // STATION 05: CALCULADORA ANALÓGICA A VÁLVULAS & MOSTRADOR
  // =========================================================
  const st5 = new THREE.Group();
  st5.position.set(stationXs[5], 0, 0);
  root.add(st5);

  // Sculpted Sloped Walnut Console Body (ExtrudeGeometry side profile)
  const consoleSide = new THREE.Shape();
  consoleSide.moveTo(-0.68, 0);
  consoleSide.lineTo(0.68, 0);
  consoleSide.lineTo(0.68, 0.22);
  consoleSide.quadraticCurveTo(0.65, 0.34, 0.22, 0.56);
  consoleSide.lineTo(-0.32, 1.04);
  consoleSide.quadraticCurveTo(-0.56, 1.12, -0.68, 0.94);
  consoleSide.closePath();

  const consoleGeo = trackGeo(
    new THREE.ExtrudeGeometry(consoleSide, {
      depth: 1.38,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.035,
      bevelSegments: 3,
    })
  );
  consoleGeo.center();
  consoleGeo.rotateY(-Math.PI / 2);
  const consoleBody = new THREE.Mesh(consoleGeo, walnutBenchMat);
  consoleBody.position.set(0, 0.54, -0.08);
  consoleBody.castShadow = true;
  consoleBody.receiveShadow = true;
  st5.add(consoleBody);
  tagInteractable(consoleBody, 'prediction-gears', 5, interactables);

  // Vintage Circular Voltmeter Dial on Slanted Face
  const dialFaceMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: dialGaugeTex,
      roughness: 0.35,
      metalness: 0.1,
    })
  );
  const dialFace = new THREE.Mesh(trackGeo(new THREE.CircleGeometry(0.4, 40)), dialFaceMat);
  dialFace.position.set(0, 0.72, 0.26);
  dialFace.rotation.x = -0.58;
  st5.add(dialFace);
  tagInteractable(dialFace, 'prediction-gears', 5, interactables);

  const dialBezel = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.41, 0.028, 12, 40)),
    copperBrassMat
  );
  dialBezel.position.set(0, 0.72, 0.26);
  dialBezel.rotation.x = -0.58;
  st5.add(dialBezel);

  // Dial Needle Pivot
  const dialNeedlePivot = new THREE.Group();
  dialNeedlePivot.position.set(0, 0.73, 0.28);
  dialNeedlePivot.rotation.x = -0.58;
  st5.add(dialNeedlePivot);

  const needleGeo = trackGeo(new THREE.ConeGeometry(0.022, 0.32, 8));
  needleGeo.translate(0, 0.13, 0);
  dialNeedlePivot.add(new THREE.Mesh(needleGeo, amberFilamentMat));

  const needleCap = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.042, 0.042, 0.03, 16)),
    copperBrassMat
  );
  needleCap.rotation.x = Math.PI / 2;
  dialNeedlePivot.add(needleCap);

  // 3 Glowing Vacuum Tubes (Thermionic Valves) mounted along top ridge
  const valveGlassPts = [
    new THREE.Vector2(0.01, 0),
    new THREE.Vector2(0.095, 0),
    new THREE.Vector2(0.098, 0.24),
    new THREE.Vector2(0.068, 0.31),
    new THREE.Vector2(0.018, 0.35),
    new THREE.Vector2(0, 0.38),
  ];
  const valveGlassGeo = trackGeo(new THREE.LatheGeometry(valveGlassPts, 24));
  const valveSocketGeo = trackGeo(new THREE.CylinderGeometry(0.105, 0.11, 0.06, 20));
  const valveCoreGeo = trackGeo(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 12));

  [-0.36, 0, 0.36].forEach((vx) => {
    const socket = new THREE.Mesh(valveSocketGeo, bakeliteMat);
    socket.position.set(vx, 1.08, -0.36);
    st5.add(socket);

    const core = new THREE.Mesh(valveCoreGeo, amberFilamentMat);
    core.position.set(vx, 1.22, -0.36);
    st5.add(core);

    const bulb = new THREE.Mesh(valveGlassGeo, glassMat);
    bulb.position.set(vx, 1.1, -0.36);
    bulb.renderOrder = 4;
    st5.add(bulb);
    tagInteractable(bulb, 'prediction-gears', 5, interactables);
  });

  // 3 Meshed Brass & Teal Gears mounted on front apron
  const gear1Geo = trackGeo(createGearGeometry(0.24, 0.06, 14, 0.06));
  const gear2Geo = trackGeo(createGearGeometry(0.17, 0.05, 10, 0.06));
  const gear3Geo = trackGeo(createGearGeometry(0.13, 0.04, 8, 0.06));

  const gearPrimary = new THREE.Mesh(gear1Geo, copperBrassMat);
  gearPrimary.rotation.x = Math.PI / 2;
  gearPrimary.position.set(-0.26, 0.24, 0.56);
  gearPrimary.castShadow = true;
  st5.add(gearPrimary);
  tagInteractable(gearPrimary, 'prediction-gears', 5, interactables);

  const gearSecondary = new THREE.Mesh(gear2Geo, retroTealEnamelMat);
  gearSecondary.rotation.x = Math.PI / 2;
  gearSecondary.position.set(0.14, 0.24, 0.56);
  gearSecondary.castShadow = true;
  st5.add(gearSecondary);
  tagInteractable(gearSecondary, 'prediction-gears', 5, interactables);

  const gearTertiary = new THREE.Mesh(gear3Geo, copperBrassMat);
  gearTertiary.rotation.x = Math.PI / 2;
  gearTertiary.position.set(0.42, 0.24, 0.44);
  gearTertiary.castShadow = true;
  st5.add(gearTertiary);

  // =========================================================
  // STATION 06: TERMINAL OSCILOSCÓPIO CRT EM NOGUEIRA
  // =========================================================
  const st6 = new THREE.Group();
  st6.position.set(stationXs[6], 0, 0);
  root.add(st6);

  // Curved Bronze/Walnut Pedestal Foot
  const crtFootPts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.55, 0),
    new THREE.Vector2(0.52, 0.08),
    new THREE.Vector2(0.22, 0.16),
    new THREE.Vector2(0.18, 0.28),
  ];
  const crtFoot = new THREE.Mesh(
    trackGeo(new THREE.LatheGeometry(crtFootPts, 32)),
    agedBronzeMat
  );
  crtFoot.castShadow = true;
  st6.add(crtFoot);
  tagInteractable(crtFoot, 'insight-board', 6, interactables);

  // Rounded Walnut CRT Monitor Cabinet (total depth = 0.72 + 2*0.035 = 0.79 -> front face at z = +0.395)
  const crtCabinetGroup = new THREE.Group();
  crtCabinetGroup.position.set(0, 0.84, 0.02);
  crtCabinetGroup.rotation.x = -0.15;
  st6.add(crtCabinetGroup);

  const crtShellGeo = trackGeo(createRoundedHousingGeometry(1.66, 1.14, 0.72, 0.16));
  const crtShell = new THREE.Mesh(crtShellGeo, walnutBenchMat);
  crtShell.castShadow = true;
  crtCabinetGroup.add(crtShell);
  tagInteractable(crtShell, 'insight-board', 6, interactables);

  // Tapered CRT Rear Tube Neck sticking out the back
  const neckPts = [
    new THREE.Vector2(0.42, 0),
    new THREE.Vector2(0.32, 0.22),
    new THREE.Vector2(0.15, 0.4),
    new THREE.Vector2(0.13, 0.56),
    new THREE.Vector2(0, 0.56),
  ];
  const crtNeck = new THREE.Mesh(
    trackGeo(new THREE.LatheGeometry(neckPts, 28)),
    bakeliteMat
  );
  crtNeck.rotation.x = -Math.PI / 2;
  crtNeck.position.z = -0.34;
  crtCabinetGroup.add(crtNeck);

  // Recessed Bakelite Monitor Bezel & Brushed Copper Trim (strictly in front of z = 0.395)
  const crtBezelGeo = trackGeo(
    createBezelFrameGeometry(1.34, 0.92, 1.18, 0.76, 0.08, 0.045)
  );
  const crtBezel = new THREE.Mesh(crtBezelGeo, bakeliteMat);
  crtBezel.position.set(-0.1, 0, 0.415);
  crtBezel.castShadow = true;
  crtCabinetGroup.add(crtBezel);
  tagInteractable(crtBezel, 'insight-board', 6, interactables);

  const crtCopperTrimGeo = trackGeo(
    createBezelFrameGeometry(1.38, 0.96, 1.3, 0.88, 0.09, 0.016)
  );
  const crtCopperTrim = new THREE.Mesh(crtCopperTrimGeo, copperBrassMat);
  crtCopperTrim.position.set(-0.1, 0, 0.4);
  crtCabinetGroup.add(crtCopperTrim);

  // Convex Curved CRT Phosphor Screen sitting cleanly inside the bezel (z = 0.415 > 0.395)
  const crtScreenGeo = trackGeo(new THREE.PlaneGeometry(1.2, 0.78, 20, 14));
  const crtPosAttr = crtScreenGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < crtPosAttr.count; i++) {
    const nx = crtPosAttr.getX(i) / 0.6;
    const ny = crtPosAttr.getY(i) / 0.39;
    const r2 = Math.min(1, nx * nx * 0.55 + ny * ny * 0.45);
    crtPosAttr.setZ(i, (1 - r2) * 0.024);
  }
  crtScreenGeo.computeVertexNormals();

  const crtScreenMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      map: insightBoard.texture,
      emissiveMap: insightBoard.texture,
      emissive: 0xffffff,
      emissiveIntensity: 0.85,
      roughness: 0.16,
      metalness: 0.04,
      clearcoat: 0.75,
      clearcoatRoughness: 0.1,
    })
  );
  const crtScreen = new THREE.Mesh(crtScreenGeo, crtScreenMat);
  crtScreen.position.set(-0.1, 0, 0.415);
  crtCabinetGroup.add(crtScreen);
  tagInteractable(crtScreen, 'insight-board', 6, interactables);

  // Right-hand Bakelite Control Strip (front face at z = 0.365 + 0.045 = 0.410) + Interactive Page Buttons
  const ctrlStripGeo = trackGeo(createRoundedHousingGeometry(0.2, 0.84, 0.02, 0.04));
  const ctrlStrip = new THREE.Mesh(ctrlStripGeo, bakeliteMat);
  ctrlStrip.position.set(0.69, 0, 0.365);
  crtCabinetGroup.add(ctrlStrip);

  const ctrlFaceplateMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: crtControlStripTex,
      roughness: 0.42,
      metalness: 0.12,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    })
  );
  const ctrlFaceplate = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(0.19, 0.78)),
    ctrlFaceplateMat
  );
  ctrlFaceplate.position.set(0.69, 0, 0.413);
  crtCabinetGroup.add(ctrlFaceplate);

  // Top quality/power pilot signal jewel lamp
  const jewelCollar = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.032, 0.008, 10, 20)),
    copperBrassMat
  );
  jewelCollar.position.set(0.69, 0.345, 0.415);
  crtCabinetGroup.add(jewelCollar);

  const beaconMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 1.15,
      roughness: 0.2,
    })
  );
  const insightSignalLight = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.026, 16, 12)),
    beaconMat
  );
  insightSignalLight.position.set(0.69, 0.345, 0.422);
  crtCabinetGroup.add(insightSignalLight);

  // 3 Interactive Side Controls for Report Pages: 01 SÍNTESE, 02 PADRÃO, 03 GUIA
  const knobCollarGeo = trackGeo(new THREE.TorusGeometry(0.056, 0.01, 10, 24));
  const knobGeo = trackGeo(new THREE.CylinderGeometry(0.046, 0.054, 0.052, 20));
  knobGeo.rotateX(Math.PI / 2);
  const knobPointerGeo = trackGeo(new THREE.BoxGeometry(0.014, 0.042, 0.014));
  const knobHitGeo = trackGeo(new THREE.CylinderGeometry(0.068, 0.068, 0.075, 16));
  knobHitGeo.rotateX(Math.PI / 2);

  const crtButtons: Array<{
    page: CrtReportPage;
    y: number;
    pivot: THREE.Group;
    collarMat: THREE.MeshStandardMaterial;
    pushEnergy: number;
  }> = [];

  (
    [
      { page: 'summary' as const, y: 0.195 },
      { page: 'patterns' as const, y: -0.03 },
      { page: 'howto' as const, y: -0.255 },
    ] as const
  ).forEach(({ page, y }) => {
    const collarMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x334155,
        emissive: 0x0e7490,
        emissiveIntensity: page === 'summary' ? 1.1 : 0.15,
        roughness: 0.28,
        metalness: 0.5,
      })
    );
    const collar = new THREE.Mesh(knobCollarGeo, collarMat);
    collar.position.set(0.69, y, 0.416);
    crtCabinetGroup.add(collar);

    const pivot = new THREE.Group();
    pivot.position.set(0.69, y, 0.44);
    crtCabinetGroup.add(pivot);

    const knob = new THREE.Mesh(knobGeo, page === 'howto' ? agedBronzeMat : copperBrassMat);
    knob.castShadow = true;
    pivot.add(knob);

    const pointerFin = new THREE.Mesh(knobPointerGeo, amberFilamentMat);
    pointerFin.position.set(0, 0.022, 0.026);
    pivot.add(pointerFin);

    // Invisible slightly larger hit target so side buttons are super easy to click in 3D
    const hitMat = trackMat(
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    const hitTarget = new THREE.Mesh(knobHitGeo, hitMat);
    pivot.add(hitTarget);

    [collar, knob, pointerFin, hitTarget].forEach((mesh) => {
      mesh.userData.crtPage = page;
      tagInteractable(mesh, 'insight-board', 6, interactables);
    });

    crtButtons.push({
      page,
      y,
      pivot,
      collarMat,
      pushEnergy: 0,
    });
  });

  let activeCrtPage: CrtReportPage = 'summary';
  function setCrtPage(page: CrtReportPage) {
    if (activeCrtPage !== page) {
      const btn = crtButtons.find((b) => b.page === page);
      if (btn) btn.pushEnergy = 1.0;
    }
    activeCrtPage = page;
  }

  // =========================================================
  // DYNAMIC ANIMATION TARGETS (SMOOTH DAMPING)
  // =========================================================
  const targetHistHeights = new Array(7).fill(0.3);
  let targetBeamTilt = 0;
  let targetNeedleAngle = 0;
  let targetRegAngle = Math.PI / 3;
  let targetRegY = 0.98;
  let targetDiverterAngle = 0;
  let sieveShakeEnergy = 0;
  let gearSpinVelocity = 0.45;

  const targetScatterPos: THREE.Vector3[] = Array.from(
    { length: MAX_CAPSULES },
    () => new THREE.Vector3(0, 0.98, 0)
  );
  const currScatterPos: THREE.Vector3[] = Array.from(
    { length: MAX_CAPSULES },
    () => new THREE.Vector3(0, 0.98, 0)
  );
  let activeScatterCount = 0;

  const stationGroups: Record<StationId, THREE.Group> = {
    1: st1,
    2: st2,
    3: st3,
    4: st4,
    5: st5,
    6: st6,
  };
  let currentActiveStation: StationId | null = null;
  let hoveredStation: StationId | null = null;
  let hoveredEnergized = false;
  let gearSpinBoost = 0;
  let balanceTapOffset = 0;
  let needleTapOffset = 0;
  const selectImpulses: Record<StationId, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };

  function setHoveredStation(stationId: StationId | null, isEnergized = false) {
    hoveredStation = stationId;
    hoveredEnergized = isEnergized;
  }

  function triggerSelectImpulse(stationId: StationId) {
    selectImpulses[stationId] = 1.0;
    if (stationId === 2) {
      sieveShakeEnergy = Math.max(sieveShakeEnergy, 0.95);
    } else if (stationId === 3) {
      balanceTapOffset = 0.11;
    } else if (stationId === 5) {
      gearSpinBoost = 3.6;
      needleTapOffset = 0.24;
    }
  }

  function updateFromState(
    scenario: ScenarioDataset,
    pipeline: PipelineState,
    stats: ProcessedStats,
    activeStation: StationId | null
  ) {
    currentActiveStation = activeStation;

    // 2. Station 01: Populate Raw Erlenmeyer Capsules + Outlier Spikes
    let capIdx = 0;
    let spikeIdx = 0;
    scenario.records.forEach((rec: DataRecord, i: number) => {
      const row = Math.floor(i / 11);
      const col = i % 11;
      const angle = col * 0.57 + row * 0.42;
      const maxRad = Math.max(0.1, 0.44 - row * 0.075);
      const rad = ((i % 4) / 3) * maxRad;
      const py = 0.28 + row * 0.13 + (i % 3) * 0.02;
      const px = Math.cos(angle) * rad;
      const pz = Math.sin(angle) * rad;

      if (rec.defect === 'outlier' && spikeIdx < 12) {
        _dummy.position.set(px, py + 0.04, pz);
        _dummy.rotation.set(i * 0.5, i * 0.7, 0);
        const visibleScale = pipeline.filterOutliers ? 0.001 : 1.0;
        _dummy.scale.setScalar(visibleScale);
        _dummy.updateMatrix();
        urnOutlierSpikes.setMatrixAt(spikeIdx, _dummy.matrix);
        spikeIdx++;
      } else if (capIdx < MAX_CAPSULES) {
        _dummy.position.set(px, py, pz);
        _dummy.rotation.set(0, 0, 0);
        _dummy.scale.setScalar(1.0);
        _dummy.updateMatrix();
        urnCapsules.setMatrixAt(capIdx, _dummy.matrix);

        if (rec.defect === 'null') _color.setHex(0x64748b);
        else if (rec.defect === 'duplicate') _color.setHex(0x22d3ee);
        else if (rec.defect === 'scale') _color.setHex(0xf59e0b);
        else _color.setHex(0x10b981);

        urnCapsules.setColorAt(capIdx, _color);
        capIdx++;
      }
    });
    urnCapsules.count = capIdx;
    urnCapsules.instanceMatrix.needsUpdate = true;
    if (urnCapsules.instanceColor) urnCapsules.instanceColor.needsUpdate = true;

    urnOutlierSpikes.count = spikeIdx;
    urnOutlierSpikes.instanceMatrix.needsUpdate = true;

    // 3. Station 02: Centrifuge Beads in Porcelain Bowl & Amber Carboy
    const activeFiltersCount =
      (pipeline.removeNulls ? 1 : 0) +
      (pipeline.deduplicate ? 1 : 0) +
      (pipeline.filterOutliers ? 1 : 0) +
      (pipeline.normalizeScale ? 1 : 0);
    targetDiverterAngle = -0.35 + activeFiltersCount * 0.18;
    sieveShakeEnergy = 1.0;

    const validDisplay = Math.min(48, stats.validCount);
    for (let i = 0; i < validDisplay; i++) {
      const a = i * 0.72;
      const r = 0.05 + ((i % 5) / 5) * 0.2;
      _dummy.position.set(-0.34 + Math.cos(a) * r, 0.23 + Math.floor(i / 18) * 0.04, 0.38 + Math.sin(a) * r);
      _dummy.scale.setScalar(1);
      _dummy.updateMatrix();
      sieveValidBeads.setMatrixAt(i, _dummy.matrix);
    }
    sieveValidBeads.count = validDisplay;
    sieveValidBeads.instanceMatrix.needsUpdate = true;

    const discardDisplay = Math.min(24, stats.discardedCount);
    for (let i = 0; i < discardDisplay; i++) {
      const a = i * 0.9;
      const r = 0.04 + ((i % 3) / 3) * 0.14;
      _dummy.position.set(0.56 + Math.cos(a) * r, 0.21 + Math.floor(i / 9) * 0.05, 0.2 + Math.sin(a) * r);
      _dummy.scale.setScalar(1);
      _dummy.updateMatrix();
      sieveDiscardBeads.setMatrixAt(i, _dummy.matrix);
    }
    sieveDiscardBeads.count = discardDisplay;
    sieveDiscardBeads.instanceMatrix.needsUpdate = true;

    // 4. Station 03: Test Tube Liquid Heights & Analytical Balance Tilt
    for (let i = 0; i < 7; i++) {
      targetHistHeights[i] = 0.08 + stats.histogramBins[i] * 0.92;
    }
    targetBeamTilt = -stats.skewRatio * 0.26;

    // 5. Station 04: 3D Scatter Cloud inside Optical Sphere
    const xMin = scenario.xMin;
    const xMax = scenario.xMax;
    const yMin = stats.minY;
    const yMax = Math.max(stats.minY + 1, stats.maxY);

    activeScatterCount = Math.min(MAX_CAPSULES, stats.cleanRecords.length);
    for (let i = 0; i < activeScatterCount; i++) {
      const rec = stats.cleanRecords[i];
      const nx = THREE.MathUtils.clamp((rec.x - xMin) / Math.max(1, xMax - xMin), -0.1, 1.1);
      const ny = THREE.MathUtils.clamp((rec.y - yMin) / Math.max(1, yMax - yMin), 0, 1);
      const nz = ((i % 5) - 2) * 0.065;

      targetScatterPos[i].set((nx - 0.5) * 0.72, 0.62 + ny * 0.72, nz);

      if (pipeline.highlightMode === 'cluster') {
        if (ny > 0.66) _color.setHex(0x10b981);
        else if (ny > 0.33) _color.setHex(0x22d3ee);
        else _color.setHex(0xf59e0b);
      } else {
        _color.setHex(stats.correlation >= 0 ? 0x10b981 : 0x22d3ee);
      }
      scatterBeads.setColorAt(i, _color);
    }
    scatterBeads.count = activeScatterCount;
    if (scatterBeads.instanceColor) scatterBeads.instanceColor.needsUpdate = true;

    const normSlope =
      ((stats.slope * (xMax - xMin)) / Math.max(1, yMax - yMin)) * 0.9;
    targetRegAngle =
      Math.PI / 2 - Math.atan(THREE.MathUtils.clamp(normSlope, -1.2, 1.2));
    targetRegY = 0.98;

    // 6. Station 05: Dial Needle & Meshed Gears
    const predMin = scenario.id === 'cafe' ? 800 : scenario.id === 'sleep' ? 40 : 40;
    const predMax = scenario.id === 'cafe' ? 2600 : scenario.id === 'sleep' ? 100 : 360;
    const predRatio = THREE.MathUtils.clamp(
      (stats.predictedY - predMin) / Math.max(1, predMax - predMin),
      0,
      1
    );
    targetNeedleAngle = THREE.MathUtils.degToRad(125 - predRatio * 250);
    gearSpinVelocity = 0.35 + pipeline.modelWeight * 0.7;

    // 7. Station 06: CRT Pilot Signal Jewel (screen canvas is updated with active report page in LabViewport3D)
    const beaconMatRef = insightSignalLight.material as THREE.MeshStandardMaterial;
    if (stats.qualityScore >= 80) {
      beaconMatRef.color.setHex(0x10b981);
      beaconMatRef.emissive.setHex(0x059669);
    } else {
      beaconMatRef.color.setHex(0xf59e0b);
      beaconMatRef.emissive.setHex(0xd97706);
    }
  }

  function animate(dt: number, elapsed: number) {
    const safeDt = Math.min(dt, 0.05);

    // Tactile station rings & spring-loaded mechanical click recoil
    for (let id = 1; id <= 6; id++) {
      const sid = id as StationId;
      const imp = selectImpulses[sid];
      if (imp > 0.002) {
        selectImpulses[sid] = THREE.MathUtils.damp(imp, 0, 11, safeDt);
      } else {
        selectImpulses[sid] = 0;
      }

      const currImp = selectImpulses[sid];
      const isActive = currentActiveStation === sid;
      const isHovered = hoveredStation === sid;
      const ring = stageRingMeshes[sid];
      const ringMat = ring.material as THREE.MeshBasicMaterial;

      const shimmer =
        isHovered && hoveredEnergized ? Math.sin(elapsed * 18) * 0.07 : 0;
      const targetOp = Math.min(
        1,
        (isActive ? 0.8 : isHovered ? (hoveredEnergized ? 0.52 : 0.34) : 0.0) +
          currImp * 0.45 +
          shimmer
      );
      ringMat.opacity = THREE.MathUtils.damp(ringMat.opacity, targetOp, 14, safeDt);

      // Tint ring warm amber on hover/click impulse, cyan when settled active
      if (currImp > 0.15 || (isHovered && hoveredEnergized && !isActive)) {
        _color.setHex(0xf59e0b);
      } else {
        _color.setHex(0x22d3ee);
      }
      ringMat.color.lerp(_color, Math.min(1, safeDt * 14));

      const targetScale =
        1.0 + (isHovered ? 0.035 : 0.0) + currImp * 0.075;
      const nextRingScale = THREE.MathUtils.damp(ring.scale.x, targetScale, 14, safeDt);
      ring.scale.set(nextRingScale, nextRingScale, 1);

      // Subtle mechanical detent dip & spring return on station assembly
      stationGroups[sid].position.y = -0.022 * Math.sin(currImp * Math.PI);
    }

    const prismTargetScale = 1.0 + selectImpulses[4] * 0.09;
    const nextPrismScale = THREE.MathUtils.damp(prismCore.scale.x, prismTargetScale, 14, safeDt);
    prismCore.scale.setScalar(nextPrismScale);

    if (sieveShakeEnergy > 0.01) {
      sieveShakeEnergy = THREE.MathUtils.damp(sieveShakeEnergy, 0, 3.2, safeDt);
      sieveTrayGroup.position.x = -0.22 + Math.sin(elapsed * 32) * 0.03 * sieveShakeEnergy;
      sieveTrayGroup.position.z = -0.08 + Math.cos(elapsed * 26) * 0.02 * sieveShakeEnergy;
    } else {
      sieveTrayGroup.position.x = THREE.MathUtils.damp(sieveTrayGroup.position.x, -0.22, 8, safeDt);
      sieveTrayGroup.position.z = THREE.MathUtils.damp(sieveTrayGroup.position.z, -0.08, 8, safeDt);
    }
    sieveDiverterArm.rotation.y = THREE.MathUtils.damp(
      sieveDiverterArm.rotation.y,
      targetDiverterAngle,
      6,
      safeDt
    );

    for (let i = 0; i < 7; i++) {
      const col = histogramColumns[i];
      const nextY = THREE.MathUtils.damp(col.scale.y, targetHistHeights[i], 6, safeDt);
      col.scale.set(1, nextY, 1);
    }
    balanceTapOffset = THREE.MathUtils.damp(balanceTapOffset, 0, 10, safeDt);
    balanceBeamGroup.rotation.z = THREE.MathUtils.damp(
      balanceBeamGroup.rotation.z,
      targetBeamTilt + balanceTapOffset,
      7,
      safeDt
    );

    for (let i = 0; i < activeScatterCount; i++) {
      currScatterPos[i].x = THREE.MathUtils.damp(currScatterPos[i].x, targetScatterPos[i].x, 6.5, safeDt);
      currScatterPos[i].y = THREE.MathUtils.damp(currScatterPos[i].y, targetScatterPos[i].y, 6.5, safeDt);
      currScatterPos[i].z = THREE.MathUtils.damp(currScatterPos[i].z, targetScatterPos[i].z, 6.5, safeDt);
      _dummy.position.copy(currScatterPos[i]);
      _dummy.rotation.set(0, 0, 0);
      _targetScale.setScalar(1);
      _dummy.scale.copy(_targetScale);
      _dummy.updateMatrix();
      scatterBeads.setMatrixAt(i, _dummy.matrix);
    }
    scatterBeads.instanceMatrix.needsUpdate = true;

    regressionRod.rotation.z = THREE.MathUtils.damp(
      regressionRod.rotation.z,
      targetRegAngle,
      6,
      safeDt
    );
    regressionRod.position.y = THREE.MathUtils.damp(
      regressionRod.position.y,
      targetRegY,
      6,
      safeDt
    );

    gearSpinBoost = THREE.MathUtils.damp(gearSpinBoost, 0, 7, safeDt);
    const hoverGearBoost = hoveredStation === 5 ? 0.55 : 0;
    const effectiveGearVel = gearSpinVelocity + gearSpinBoost + hoverGearBoost;
    gearPrimary.rotation.y += safeDt * effectiveGearVel;
    gearSecondary.rotation.y -= safeDt * effectiveGearVel * (14 / 10);
    gearTertiary.rotation.y += safeDt * effectiveGearVel * (14 / 8);

    needleTapOffset = THREE.MathUtils.damp(needleTapOffset, 0, 9, safeDt);
    dialNeedlePivot.rotation.z = THREE.MathUtils.damp(
      dialNeedlePivot.rotation.z,
      targetNeedleAngle + needleTapOffset,
      8,
      safeDt
    );

    // Animate CRT right-hand side buttons (rotary detent + push recoil + glowing indicator collar)
    for (let i = 0; i < crtButtons.length; i++) {
      const btn = crtButtons[i];
      const isBtnActive = btn.page === activeCrtPage;
      btn.pushEnergy = THREE.MathUtils.damp(btn.pushEnergy, 0, 12, safeDt);
      const targetRot = isBtnActive ? -0.65 : 0.45;
      btn.pivot.rotation.z = THREE.MathUtils.damp(btn.pivot.rotation.z, targetRot, 12, safeDt);
      btn.pivot.position.z = 0.44 - Math.sin(btn.pushEnergy * Math.PI) * 0.016;

      if (isBtnActive) {
        _color.setHex(0xf59e0b);
        btn.collarMat.emissive.lerp(_color, Math.min(1, safeDt * 12));
        btn.collarMat.emissiveIntensity = THREE.MathUtils.damp(
          btn.collarMat.emissiveIntensity,
          1.35,
          12,
          safeDt
        );
      } else {
        _color.setHex(0x0e7490);
        btn.collarMat.emissive.lerp(_color, Math.min(1, safeDt * 12));
        btn.collarMat.emissiveIntensity = THREE.MathUtils.damp(
          btn.collarMat.emissiveIntensity,
          hoveredStation === 6 ? 0.55 : 0.15,
          12,
          safeDt
        );
      }
    }
  }

  function dispose() {
    disposableGeos.forEach((g) => g.dispose());
    disposableMats.forEach((m) => m.dispose());
    disposableTex.forEach((t) => t.dispose());
  }

  return {
    root,
    interactables,
    stationAnchors,
    urnCapsules,
    urnOutlierSpikes,
    sieveTrayGroup,
    sieveDiverterArm,
    sieveValidBeads,
    sieveDiscardBeads,
    balanceBeamGroup,
    balancePointer,
    histogramColumns,
    scatterBeads,
    regressionRod,
    prismCore,
    gearPrimary,
    gearSecondary,
    gearTertiary,
    dialNeedlePivot,
    insightBoardCanvas: insightBoard.canvas,
    insightBoardTexture: insightBoard.texture,
    crtScreen,
    insightSignalLight,
    stageRingMeshes,
    updateFromState,
    setHoveredStation,
    triggerSelectImpulse,
    setCrtPage,
    animate,
    dispose,
  };
}
