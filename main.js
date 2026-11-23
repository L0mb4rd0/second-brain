import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// =========================================================
// 1. DATOS DE TU SECOND BRAIN (Edita o conecta a tu JSON)
// =========================================================
const CATEGORIES = [
  {
    id: 'reviews',
    name: 'Reviews',
    totalIdeas: 9,
    angle: Math.PI * 0.56,
    radius: 108,
    y: 18,
    sampleNotes: [
      { title: 'Revisión mensual Q4', body: 'Balance de metas cumplidas, aprendizajes clave y ajustes para el próximo trimestre.' },
      { title: 'Auditoría de hábitos', body: 'Evaluación semanal de bloques de enfoque profundo y horas de estudio.' }
    ]
  },
  {
    id: 'plans',
    name: 'Plans',
    totalIdeas: 36,
    angle: Math.PI * 0.42,
    radius: 92,
    y: 12,
    sampleNotes: [
      { title: 'Hoja de ruta anual', body: 'Objetivos principales divididos en hitos trimestrales medibles.' },
      { title: 'Plan de certificaciones', body: 'Cronograma de lecturas, simulacros y fechas de inscripción.' }
    ]
  },
  {
    id: 'trackside',
    name: 'Trackside knowledge',
    totalIdeas: 416,
    angle: -0.1,
    radius: 82,
    y: -4,
    sampleNotes: [
      { title: 'Notas de campo y operaciones', body: 'Observaciones prácticas recogidas directamente en terreno.' },
      { title: 'Patrones recurrentes', body: 'Errores frecuentes documentados junto con su protocolo de solución rápida.' }
    ]
  },
  {
    id: 'projects',
    name: 'Projects',
    totalIdeas: 39,
    angle: -Math.PI * 0.55,
    radius: 98,
    y: -14,
    sampleNotes: [
      { title: 'Second Brain WebGL', body: 'Arquitectura del grafo 3D publicado en GitHub Pages.' },
      { title: 'Automatización de reportes', body: 'Pipeline para transformar archivos Markdown en JSON interactivo.' }
    ]
  },
  {
    id: 'decisions',
    name: 'Decisions',
    totalIdeas: 29,
    angle: -Math.PI * 0.78,
    radius: 104,
    y: -10,
    sampleNotes: [
      { title: 'Matriz de riesgo y retorno', body: 'Criterios cuantitativos para aprobar o descartar iniciativas nuevas.' },
      { title: 'Registro de trade-offs', body: 'Documentación del contexto exacto al tomar una decisión importante.' }
    ]
  },
  {
    id: 'reference',
    name: 'Reference notes',
    totalIdeas: 264,
    angle: Math.PI * 0.92,
    radius: 96,
    y: 8,
    sampleNotes: [
      { title: 'Resúmenes de libros', body: 'Conceptos destilados en formato atómico y enlazados por tema.' },
      { title: 'Glosario técnico', body: 'Definiciones precisas, fórmulas y referencias rápidas de consulta.' }
    ]
  }
];

// =========================================================
// 2. ESCENA, CÁMARA, RENDER Y BLOOM
// =========================================================
const container = document.getElementById('canvas-container');
const labelsLayer = document.getElementById('labels-layer');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030406, 0.0014);

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 2000);
const HOME_CAM_POS = new THREE.Vector3(0, 20, 275);
const HOME_TARGET = new THREE.Vector3(0, 0, 0);
camera.position.copy(HOME_CAM_POS);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
container.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.15, // intensidad del brillo
  0.55, // radio
  0.18  // umbral
);
composer.addPass(bloomPass);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.minDistance = 55;
controls.maxDistance = 480;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.35;

// =========================================================
// 3. TEXTURAS PROCEDURALES
// =========================================================
function createCircleTexture(innerColor, midColor, outerColor) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, innerColor);
  grad.addColorStop(0.35, midColor);
  grad.addColorStop(1, outerColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function createPhotonRingTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const c = size / 2;

  const grad = ctx.createRadialGradient(c, c, c * 0.24, c, c, c);
  grad.addColorStop(0.0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.27, 'rgba(255,245,220,0.95)');
  grad.addColorStop(0.34, 'rgba(255,190,110,0.82)');
  grad.addColorStop(0.46, 'rgba(220,120,45,0.28)');
  grad.addColorStop(0.7, 'rgba(120,60,20,0.06)');
  grad.addColorStop(1.0, 'rgba(0,0,0,0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function createFlareTexture() {
  const w = 512;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, h / 2, w, h / 2);
  grad.addColorStop(0, 'rgba(255,180,90,0)');
  grad.addColorStop(0.3, 'rgba(255,210,145,0.45)');
  grad.addColorStop(0.5, 'rgba(255,250,235,0.95)');
  grad.addColorStop(0.7, 'rgba(255,210,145,0.45)');
  grad.addColorStop(1, 'rgba(255,180,90,0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2, w / 2, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

// =========================================================
// 4. AGUJERO NEGRO CENTRAL
// =========================================================
const blackHoleGroup = new THREE.Group();
scene.add(blackHoleGroup);

// Horizonte de eventos
const horizonMesh = new THREE.Mesh(
  new THREE.SphereGeometry(14.5, 48, 48),
  new THREE.MeshBasicMaterial({ color: 0x000000 })
);
blackHoleGroup.add(horizonMesh);

// Anillo de fotones (siempre orientado a cámara)
const haloSprite = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: createPhotonRingTexture(),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
haloSprite.scale.set(92, 92, 1);
blackHoleGroup.add(haloSprite);

// Destello horizontal tipo lente gravitacional
const flareSprite = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: createFlareTexture(),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0.9
  })
);
flareSprite.scale.set(165, 22, 1);
flareSprite.material.rotation = -0.11;
blackHoleGroup.add(flareSprite);

// Disco de acreción giratorio con shader GLSL
const diskUniforms = { uTime: { value: 0 } };
const diskMaterial = new THREE.ShaderMaterial({
  uniforms: diskUniforms,
  transparent: true,
  side: THREE.DoubleSide,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform float uTime;
    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      float r = length(p);
      if (r > 1.0 || r < 0.25) discard;
      float angle = atan(p.y, p.x);
      float swirl = 0.5 + 0.5 * sin(angle * 5.0 - uTime * 1.1 + r * 16.0);
      float innerRing = exp(-pow((r - 0.34) * 6.0, 2.0)) * 1.3;
      float outerDisk = exp(-pow((r - 0.52) * 3.4, 2.0)) * (0.3 + 0.35 * swirl);
      float alpha = clamp(innerRing + outerDisk, 0.0, 1.0) * smoothstep(1.0, 0.62, r) * smoothstep(0.25, 0.3, r);
      vec3 color = mix(vec3(1.0, 0.58, 0.2), vec3(1.0, 0.96, 0.86), clamp(innerRing, 0.0, 1.0));
      gl_FragColor = vec4(color * 1.3, alpha);
    }
  `
});

const accretionDisk = new THREE.Mesh(new THREE.PlaneGeometry(118, 118), diskMaterial);
accretionDisk.rotation.x = Math.PI * 0.45;
accretionDisk.rotation.y = 0.12;
blackHoleGroup.add(accretionDisk);

// =========================================================
// 5. GRAFO DE IDEAS (NODOS Y CONEXIONES)
// =========================================================
const graphGroup = new THREE.Group();
scene.add(graphGroup);

const allNodes = [];
const clusterCenters = [];

// Semilla determinista simple para mantener una distribución limpia
let seed = 42;
function rand() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

CATEGORIES.forEach((cat) => {
  const cx = Math.cos(cat.angle) * cat.radius;
  const cy = Math.sin(cat.angle) * cat.radius * 0.86;
  const cz = cat.y;
  const center = new THREE.Vector3(cx, cy, cz);
  clusterCenters.push({ ...cat, center });

  // Limitamos visualmente si hay miles para mantener 60 fps fluidos
  const renderCount = Math.min(cat.totalIdeas, 180);
  const spread = 20 + Math.sqrt(renderCount) * 2.2;

  for (let i = 0; i < renderCount; i++) {
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    const dist = Math.pow(rand(), 0.72) * spread;

    const pos = new THREE.Vector3(
      cx + dist * Math.sin(phi) * Math.cos(theta),
      cy + dist * Math.sin(phi) * Math.sin(theta),
      cz + dist * Math.cos(phi) * 0.85
    );

    // Evita que nodos invadan el horizonte de eventos
    if (pos.length() < 32) {
      pos.setLength(32 + rand() * 14);
    }

    const sample = cat.sampleNotes[i % cat.sampleNotes.length];
    allNodes.push({
      pos,
      category: cat.name,
      categoryId: cat.id,
      title: i < cat.sampleNotes.length ? sample.title : `${cat.name} #${i + 1}`,
      body: i < cat.sampleNotes.length
        ? sample.body
        : `Idea conectada dentro del grupo ${cat.name}. Reemplaza este texto conectando tus propios archivos Markdown.`
    });
  }
});

// Geometría de puntos para todos los nodos
const nodePositions = new Float32Array(allNodes.length * 3);
const nodeColors = new Float32Array(allNodes.length * 3);

allNodes.forEach((node, idx) => {
  nodePositions[idx * 3] = node.pos.x;
  nodePositions[idx * 3 + 1] = node.pos.y;
  nodePositions[idx * 3 + 2] = node.pos.z;

  const warmTint = node.pos.length() < 75 ? 1.0 : 0.85;
  nodeColors[idx * 3] = warmTint;
  nodeColors[idx * 3 + 1] = warmTint * 0.96;
  nodeColors[idx * 3 + 2] = warmTint * 0.92;
});

const nodesGeometry = new THREE.BufferGeometry();
nodesGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
nodesGeometry.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));

const nodesMaterial = new THREE.PointsMaterial({
  size: 2.8,
  map: createCircleTexture('rgba(255,255,255,1)', 'rgba(255,240,220,0.65)', 'rgba(255,255,255,0)'),
  vertexColors: true,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});

const nodesPoints = new THREE.Points(nodesGeometry, nodesMaterial);
graphGroup.add(nodesPoints);

// Conexiones entre nodos cercanos
const edgePositions = [];
const maxDist = 20;

for (let i = 0; i < allNodes.length; i++) {
  let connections = 0;
  for (let j = i + 1; j < allNodes.length && connections < 3; j++) {
    const d = allNodes[i].pos.distanceTo(allNodes[j].pos);
    if (d < maxDist) {
      edgePositions.push(
        allNodes[i].pos.x, allNodes[i].pos.y, allNodes[i].pos.z,
        allNodes[j].pos.x, allNodes[j].pos.y, allNodes[j].pos.z
      );
      connections++;
    }
  }
}

const edgesGeometry = new THREE.BufferGeometry();
edgesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
const edgesLines = new THREE.LineSegments(
  edgesGeometry,
  new THREE.LineBasicMaterial({
    color: 0xaab4c4,
    transparent: true,
    opacity: 0.16,
    depthWrite: false
  })
);
graphGroup.add(edgesLines);

// =========================================================
// 6. ÓRBITAS EXTERIORES Y ESTRELLAS DE FONDO
// =========================================================
const orbits = [];
const orbitConfigs = [
  { radius: 138, tiltX: 0.25, tiltY: 0.15, speed: 0.14, arcLen: Math.PI * 0.42 },
  { radius: 162, tiltX: -0.35, tiltY: 0.28, speed: -0.1, arcLen: Math.PI * 0.55 },
  { radius: 186, tiltX: 0.18, tiltY: -0.32, speed: 0.08, arcLen: Math.PI * 0.38 },
  { radius: 212, tiltX: -0.22, tiltY: -0.18, speed: 0.06, arcLen: Math.PI * 0.48 }
];

const cometTexture = createCircleTexture('rgba(255,255,255,1)', 'rgba(255,235,205,0.6)', 'rgba(255,255,255,0)');

orbitConfigs.forEach((cfg, idx) => {
  const pivot = new THREE.Group();
  pivot.rotation.set(cfg.tiltX, cfg.tiltY, idx * 1.1);
  scene.add(pivot);

  const segments = 64;
  const pts = [];
  const colors = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const a = t * cfg.arcLen;
    pts.push(new THREE.Vector3(Math.cos(a) * cfg.radius, Math.sin(a) * cfg.radius, 0));
    const fade = Math.pow(t, 2.2);
    colors.push(fade * 0.85, fade * 0.88, fade * 0.95);
  }

  const arcGeo = new THREE.BufferGeometry().setFromPoints(pts);
  arcGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const arcLine = new THREE.Line(
    arcGeo,
    new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55 })
  );
  pivot.add(arcLine);

  const head = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: cometTexture, transparent: true, blending: THREE.AdditiveBlending })
  );
  head.position.copy(pts[pts.length - 1]);
  head.scale.set(5.5, 5.5, 1);
  pivot.add(head);

  orbits.push({ pivot, speed: cfg.speed });
});

// Polvo espacial de fondo
const bgCount = 900;
const bgPos = new Float32Array(bgCount * 3);
for (let i = 0; i < bgCount; i++) {
  const r = 320 + rand() * 520;
  const theta = rand() * Math.PI * 2;
  const phi = Math.acos(2 * rand() - 1);
  bgPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  bgPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  bgPos[i * 3 + 2] = r * Math.cos(phi);
}
const bgGeo = new THREE.BufferGeometry();
bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
scene.add(
  new THREE.Points(
    bgGeo,
    new THREE.PointsMaterial({ color: 0x6b7485, size: 1.4, transparent: true, opacity: 0.45 })
  )
);

// =========================================================
// 7. ETIQUETAS HTML PROYECTADAS EN 3D Y TRANSICIÓN DE CÁMARA
// =========================================================
let currentCategoryIndex = -1;
const cameraAnim = {
  active: false,
  startPos: new THREE.Vector3(),
  endPos: new THREE.Vector3(),
  startTarget: new THREE.Vector3(),
  endTarget: new THREE.Vector3(),
  progress: 0
};

function flyTo(targetPos, camPos) {
  cameraAnim.startPos.copy(camera.position);
  cameraAnim.endPos.copy(camPos);
  cameraAnim.startTarget.copy(controls.target);
  cameraAnim.endTarget.copy(targetPos);
  cameraAnim.progress = 0;
  cameraAnim.active = true;
}

function focusCategory(index) {
  currentCategoryIndex = (index + clusterCenters.length) % clusterCenters.length;
  const cluster = clusterCenters[currentCategoryIndex];
  const offset = cluster.center.clone().normalize().multiplyScalar(85);
  offset.z += 55;
  flyTo(cluster.center, cluster.center.clone().add(offset));
}

function goHome() {
  currentCategoryIndex = -1;
  flyTo(HOME_TARGET, HOME_CAM_POS);
}

controls.addEventListener('start', () => {
  cameraAnim.active = false;
});

// Crear etiquetas flotantes para cada categoría
const labelItems = clusterCenters.map((cluster, idx) => {
  const el = document.createElement('div');
  el.className = 'cluster-label';
  el.innerHTML = `<span class="title">${cluster.name}</span><span class="count">${cluster.totalIdeas} ideas</span>`;
  el.addEventListener('click', () => focusCategory(idx));
  labelsLayer.appendChild(el);
  return { el, position: cluster.center };
});

// Etiqueta "Home" bajo el agujero negro
const centerHomeEl = document.createElement('div');
centerHomeEl.className = 'center-home-tag';
centerHomeEl.textContent = 'Home';
centerHomeEl.addEventListener('click', goHome);
labelsLayer.appendChild(centerHomeEl);

const tempVec = new THREE.Vector3();
function updateLabels() {
  const widthHalf = window.innerWidth / 2;
  const heightHalf = window.innerHeight / 2;

  labelItems.forEach(({ el, position }) => {
    tempVec.copy(position).project(camera);
    if (tempVec.z > 1) {
      el.style.display = 'none';
      return;
    }
    el.style.display = 'block';
    el.style.left = `${tempVec.x * widthHalf + widthHalf}px`;
    el.style.top = `${-tempVec.y * heightHalf + heightHalf}px`;
  });

  tempVec.set(0, -24, 0).project(camera);
  if (tempVec.z > 1) {
    centerHomeEl.style.display = 'none';
  } else {
    centerHomeEl.style.display = 'block';
    centerHomeEl.style.left = `${tempVec.x * widthHalf + widthHalf}px`;
    centerHomeEl.style.top = `${-tempVec.y * heightHalf + heightHalf}px`;
  }
}

// =========================================================
// 8. INTERACCIÓN CON NODOS Y CONTROLES DE INTERFAZ
// =========================================================
const noteModal = document.getElementById('note-modal');
const noteCategoryEl = document.getElementById('note-category');
const noteTitleEl = document.getElementById('note-title');
const noteBodyEl = document.getElementById('note-body');

function openNote(note) {
  noteCategoryEl.textContent = note.category;
  noteTitleEl.textContent = note.title;
  noteBodyEl.textContent = note.body;
  noteModal.classList.remove('hidden');
}

document.getElementById('btn-close-note').addEventListener('click', () => {
  noteModal.classList.add('hidden');
});

// Raycaster para detectar clic en nodos
const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 4.5;
const pointer = new THREE.Vector2();
let downPos = { x: 0, y: 0 };

renderer.domElement.addEventListener('pointerdown', (e) => {
  downPos = { x: e.clientX, y: e.clientY };
});

renderer.domElement.addEventListener('pointerup', (e) => {
  const distMoved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
  if (distMoved > 5) return;

  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(nodesPoints);
  if (hits.length > 0) {
    const node = allNodes[hits[0].index];
    if (node) openNote(node);
  }
});

// Poblar panel lateral "Pages"
const drawer = document.getElementById('pages-drawer');
const drawerContent = document.getElementById('drawer-content');

clusterCenters.forEach((cluster, idx) => {
  const group = document.createElement('div');
  group.className = 'drawer-group';

  const header = document.createElement('div');
  header.className = 'drawer-group-title';
  header.innerHTML = `${cluster.name} <span>${cluster.totalIdeas} ideas</span>`;
  header.addEventListener('click', () => {
    focusCategory(idx);
    drawer.classList.add('hidden');
  });

  const list = document.createElement('ul');
  list.className = 'drawer-notes';
  cluster.sampleNotes.forEach((sample) => {
    const li = document.createElement('li');
    li.textContent = sample.title;
    li.addEventListener('click', () => {
      focusCategory(idx);
      openNote({ category: cluster.name, title: sample.title, body: sample.body });
      drawer.classList.add('hidden');
    });
    list.appendChild(li);
  });

  group.appendChild(header);
  group.appendChild(list);
  drawerContent.appendChild(group);
});

// Botones HUD
let isPaused = false;
const btnPause = document.getElementById('btn-pause');

function zoomCamera(factor) {
  cameraAnim.active = false;
  const dir = camera.position.clone().sub(controls.target);
  const newLen = THREE.MathUtils.clamp(dir.length() * factor, controls.minDistance, controls.maxDistance);
  dir.setLength(newLen);
  camera.position.copy(controls.target).add(dir);
}

document.getElementById('btn-home').addEventListener('click', goHome);
document.getElementById('btn-reset').addEventListener('click', goHome);
document.getElementById('btn-zoom-in').addEventListener('click', () => zoomCamera(0.78));
document.getElementById('btn-zoom-out').addEventListener('click', () => zoomCamera(1.25));
document.getElementById('btn-prev-cat').addEventListener('click', () => focusCategory(currentCategoryIndex - 1));
document.getElementById('btn-next-cat').addEventListener('click', () => focusCategory(currentCategoryIndex + 1));

document.getElementById('btn-pages').addEventListener('click', () => {
  drawer.classList.toggle('hidden');
});
document.getElementById('btn-close-drawer').addEventListener('click', () => {
  drawer.classList.add('hidden');
});

btnPause.addEventListener('click', () => {
  isPaused = !isPaused;
  controls.autoRotate = !isPaused;
  btnPause.textContent = isPaused ? '▶' : '❚❚';
});

document.getElementById('btn-fullscreen').addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

// Redimensionado responsive
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// =========================================================
// 9. BUCLE DE ANIMACIÓN Y CONTADOR FPS
// =========================================================
const clock = new THREE.Clock();
const fpsCounter = document.getElementById('fps-counter');
let frames = 0;
let lastFpsTime = performance.now();

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);

  if (!isPaused) {
    diskUniforms.uTime.value += delta;
    orbits.forEach((o) => {
      o.pivot.rotation.z += o.speed * delta;
    });
  }

  if (cameraAnim.active) {
    controls.autoRotate = false;
    cameraAnim.progress = Math.min(cameraAnim.progress + delta * 1.15, 1);
    const k = easeInOutCubic(cameraAnim.progress);
    camera.position.lerpVectors(cameraAnim.startPos, cameraAnim.endPos, k);
    controls.target.lerpVectors(cameraAnim.startTarget, cameraAnim.endTarget, k);
    if (cameraAnim.progress >= 1) {
      cameraAnim.active = false;
      controls.autoRotate = !isPaused;
    }
  }

  controls.update();
  updateLabels();
  composer.render();

  frames++;
  const now = performance.now();
  if (now - lastFpsTime >= 500) {
    const fps = Math.round((frames * 1000) / (now - lastFpsTime));
    fpsCounter.textContent = `${fps} fps`;
    frames = 0;
    lastFpsTime = now;
  }
}

animate();
