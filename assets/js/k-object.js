// KROMAKOPIA brand object: a chrome "K" with its orange "copy" offset behind it
// (chroma + copy, the registration split of the wordmark, made physical).
// Lit only by a tiny generated studio environment: softboxes and one orange panel.
// Renders while visible; one static frame under reduced motion.
import * as THREE from '../vendor/three/three.module.js';

function kShape() {
  const s = new THREE.Shape();
  const pts = [
    [-0.9, -1.2], [-0.9, 1.2], [-0.34, 1.2], [-0.34, 0.2], [0.4, 1.2], [1.06, 1.2],
    [0.16, 0.02], [1.1, -1.2], [0.44, -1.2], [-0.1, -0.44], [-0.34, -0.12], [-0.34, -1.2]
  ];
  s.moveTo(...pts[0]);
  pts.slice(1).forEach(p => s.lineTo(...p));
  s.closePath();
  return s;
}

function studioEnvironment(renderer) {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x161616);
  const geo = new THREE.PlaneGeometry(1, 1);
  const panel = (w, h, hex, power, x, y, z) => {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(power), side: THREE.DoubleSide }));
    m.scale.set(w, h, 1);
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    env.add(m);
    return m;
  };
  panel(6, 3.2, 0xffffff, 3.2, -5, 4, 5);     // key softbox, upper left
  panel(1.6, 9, 0xfff3ea, 1.7, 6.5, 0, 2.5);  // strip light, right
  panel(6, 6, 0xf26b38, 2.6, 4, -3.5, -5);    // orange bounce, low behind
  panel(10, 1.2, 0xffffff, 1.1, 0, 6.5, -1);  // top line
  panel(24, 24, 0x262626, 1, 0, -9, 0);       // dim floor
  // In front of the letter (behind the camera): what its flat faces mirror.
  panel(16, 7, 0xffffff, 0.45, 0, 0, 9);      // broad fill
  panel(12, 0.7, 0xffffff, 4.5, 1, 2.2, 8);   // crisp highlight line
  panel(10, 0.5, 0xf26b38, 3, -1, -2.4, 8);   // low orange line
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.02).texture;
  env.traverse(o => o.material?.dispose());
  geo.dispose();
  pmrem.dispose();
  return tex;
}

export function start(host, { reduced = false } = {}) {
  const canvas = document.createElement('canvas');
  host.append(canvas);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    canvas.remove();
    return null;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.debug.checkShaderErrors = false; // production: skip sync shader log reads

  const scene = new THREE.Scene();
  scene.environment = studioEnvironment(renderer);
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 40);
  camera.position.set(0, 0, 8.4);

  const geometry = new THREE.ExtrudeGeometry(kShape(), { depth: 0.46, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.06, bevelSegments: 4, curveSegments: 1 });
  geometry.center();
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xf4f2ef, metalness: 1, roughness: 0.14, clearcoat: 0.5, clearcoatRoughness: 0.12 });
  const copper = new THREE.MeshStandardMaterial({ color: 0xf26b38, metalness: 1, roughness: 0.34 });
  const front = new THREE.Mesh(geometry, chrome);
  const copy = new THREE.Mesh(geometry, copper);
  copy.position.set(0.16, -0.1, -0.42);
  const object = new THREE.Group();
  object.add(copy, front);
  scene.add(object);

  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = e => {
    if (e.pointerType !== 'mouse') return;
    ptr.tx = (e.clientX / innerWidth) * 2 - 1;
    ptr.ty = (e.clientY / innerHeight) * 2 - 1;
  };
  addEventListener('pointermove', onMove, { passive: true });

  const size = () => {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(() => { size(); if (reduced) draw(performance.now()); });

  const t0 = performance.now();
  const draw = now => {
    const t = (now - t0) / 1000;
    ptr.x += (ptr.tx - ptr.x) * 0.06;
    ptr.y += (ptr.ty - ptr.y) * 0.06;
    // A slow sway rather than a full spin keeps the letter readable.
    object.rotation.y = (reduced ? -0.42 : Math.sin(t * 0.38) * 0.62 - 0.18) + ptr.x * 0.22;
    object.rotation.x = (reduced ? 0.06 : Math.sin(t * 0.27) * 0.08) + ptr.y * 0.12;
    object.position.y = reduced ? 0 : Math.sin(t * 0.6) * 0.06;
    renderer.render(scene, camera);
  };

  let visible = false, running = false;
  const sync = () => {
    const run = visible && !document.hidden && !reduced;
    if (run === running) return;
    running = run;
    renderer.setAnimationLoop(run ? draw : null);
  };
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); if (visible && reduced) draw(performance.now()); });
  io.observe(host);
  document.addEventListener('visibilitychange', sync);
  ro.observe(host);
  size();
  draw(performance.now());
  host.classList.add('is-ready');

  return {
    destroy() {
      renderer.setAnimationLoop(null);
      io.disconnect(); ro.disconnect();
      document.removeEventListener('visibilitychange', sync);
      removeEventListener('pointermove', onMove);
      geometry.dispose(); chrome.dispose(); copper.dispose();
      scene.environment?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      host.classList.remove('is-ready');
    }
  };
}
