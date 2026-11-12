// 3D Reels Orbit: vertical 9:16 cards on a horizontal orbit with a floor
// reflection. Drag (with inertia and snapping) or the arrow buttons turn it; a
// click on the front card opens its detail. Only the front card plays video, and
// only when one is set in content/reels.json. Renders on demand while visible.
import * as THREE from '../vendor/three/three.module.js';

const W = 1, H = 16 / 9, R = 2.55;

function maskTexture(reflection) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 228;
  const g = c.getContext('2d');
  const r = 14;
  g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
  if (reflection) {
    // The mirrored card shows its image bottom next to the floor: fade upwards.
    const grad = g.createLinearGradient(0, c.height, 0, c.height * 0.45);
    grad.addColorStop(0, '#fff'); grad.addColorStop(1, '#000');
    g.fillStyle = grad;
  } else g.fillStyle = '#fff';
  g.beginPath();
  g.roundRect(0, 0, c.width, c.height, r);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  return t;
}

export function start({ stage, items, reduced = false, background = 0xf5f3ee, onFront, onOpen }) {
  const canvas = document.createElement('canvas');
  canvas.className = 'reels-gl';
  canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    return null;
  }
  stage.append(canvas);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.debug.checkShaderErrors = false;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(background, 6.2, 11.5); // back cards dissolve into the page colour
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
  const camBase = new THREE.Vector3(0, 1.15, R + 5.4);
  const lookAt = new THREE.Vector3(0, -0.05, R * 0.3);

  const geo = new THREE.PlaneGeometry(W, H);
  const cardMask = maskTexture(false);
  const reflMask = maskTexture(true);
  const loader = new THREE.TextureLoader();
  const ring = new THREE.Group();
  scene.add(ring);
  const n = items.length;
  const step = (Math.PI * 2) / n;
  const cards = items.map((item, i) => {
    const mat = new THREE.MeshBasicMaterial({ color: 0xe9e6df, alphaMap: cardMask, alphaTest: 0.5 });
    const rmat = new THREE.MeshBasicMaterial({ color: 0xe9e6df, alphaMap: reflMask, transparent: true, opacity: 0.2, depthWrite: false });
    const pivot = new THREE.Group();
    pivot.rotation.y = i * step;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.z = R;
    mesh.userData.index = i;
    const refl = new THREE.Mesh(geo, rmat);
    refl.scale.y = -1;
    refl.position.set(0, -H - 0.04, R);
    pivot.add(mesh, refl);
    ring.add(pivot);
    const card = { item, mesh, refl, mat, rmat, poster: null, video: null, videoTex: null };
    loader.load(item.poster, tex => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      card.poster = tex;
      if (!card.videoTex) { mat.map = rmat.map = tex; mat.color.set(0xffffff); rmat.color.set(0xffffff); mat.needsUpdate = rmat.needsUpdate = true; }
      kick();
    });
    return card;
  });
  const meshes = cards.map(c => c.mesh);

  // Orbit state: `rot` is the continuous angle; it settles on a card index.
  const s = { rot: 0, target: 0, vel: 0, drag: false, startX: 0, lastX: 0, moved: 0, front: -1, px: 0, py: 0, tpx: 0, tpy: 0 };
  const wrapIndex = k => ((k % n) + n) % n;
  const goTo = k => { s.target = k * step; kick(); };
  const frontIndex = () => wrapIndex(Math.round(s.rot / step));

  // Front-card video (only when a real video URL is configured).
  const setVideo = idx => {
    cards.forEach((c, i) => {
      if (i === idx && c.item.video) {
        if (!c.video) {
          const v = document.createElement('video');
          Object.assign(v, { muted: true, loop: true, playsInline: true, crossOrigin: 'anonymous', preload: 'auto', src: c.item.video });
          v.addEventListener('playing', () => {
            if (!c.videoTex) c.videoTex = new THREE.VideoTexture(v);
            c.videoTex.colorSpace = THREE.SRGBColorSpace;
            c.mat.map = c.rmat.map = c.videoTex;
            c.mat.needsUpdate = c.rmat.needsUpdate = true;
            kick();
          });
          c.video = v;
        }
        if (!reduced) c.video.play().catch(() => {});
      } else if (c.video && !c.video.paused) {
        c.video.pause();
        if (c.poster) { c.mat.map = c.rmat.map = c.poster; c.mat.needsUpdate = c.rmat.needsUpdate = true; }
      }
    });
  };
  const playing = () => cards.some(c => c.video && !c.video.paused);

  // Input: drag with inertia, click to open or bring a card to the front.
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const pick = e => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    return raycaster.intersectObjects(meshes, false)[0]?.object.userData.index ?? -1;
  };
  const pxPerCard = () => Math.max(160, canvas.clientWidth * 0.26);
  canvas.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    s.drag = true; s.startX = s.lastX = e.clientX; s.moved = 0; s.vel = 0;
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add('is-grabbing');
  });
  canvas.addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse') {
      const r = canvas.getBoundingClientRect();
      s.tpx = ((e.clientX - r.left) / r.width) * 2 - 1;
      s.tpy = ((e.clientY - r.top) / r.height) * 2 - 1;
    }
    if (s.drag) {
      const dx = e.clientX - s.lastX;
      s.lastX = e.clientX;
      s.moved = Math.max(s.moved, Math.abs(e.clientX - s.startX));
      const d = (dx / pxPerCard()) * step;
      s.rot -= d; s.target = s.rot; s.vel = -d;
    } else if (e.pointerType === 'mouse') {
      canvas.classList.toggle('is-pointing', pick(e) === frontIndex());
    }
    kick();
  });
  const release = e => {
    if (!s.drag) return;
    s.drag = false;
    canvas.classList.remove('is-grabbing');
    if (s.moved < 6) {
      const hit = pick(e);
      if (hit >= 0) {
        if (hit === frontIndex()) onOpen?.(hit);
        else {
          let k = Math.round(s.rot / step), diff = wrapIndex(hit - wrapIndex(k));
          if (diff > n / 2) diff -= n;
          goTo(k + diff);
        }
      }
      return;
    }
    // Project the fling a little, then snap to the nearest card.
    s.target = Math.round((s.rot + s.vel * 10) / step) * step;
    kick();
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('pointerleave', () => { s.tpx = s.tpy = 0; kick(); });

  // Render on demand while visible.
  const size = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the whole orbit in frame on narrower stages.
    camera.fov = w / h < 1.25 ? 38 : 30;
    camera.updateProjectionMatrix();
    kick();
  };
  let visible = false, running = false, settle = 0;
  const tick = () => {
    if (!s.drag) s.rot += (s.target - s.rot) * (reduced ? 1 : 0.11);
    s.px += (s.tpx - s.px) * 0.08; s.py += (s.tpy - s.py) * 0.08;
    ring.rotation.y = -s.rot;
    camera.position.set(camBase.x + s.px * 0.35, camBase.y - s.py * 0.18, camBase.z);
    camera.lookAt(lookAt);
    cards.forEach((c, i) => {
      let d = i * step - s.rot;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      const f = Math.pow(Math.max(0, Math.cos(d)), 6);
      const sc = 1 + f * 0.14;
      // Cards turn halfway back towards the viewer so side cards stay legible.
      c.mesh.rotation.y = c.refl.rotation.y = -d * 0.5;
      c.mesh.scale.set(sc, sc, 1);
      c.mesh.position.y = (sc - 1) * H * 0.5;
      c.refl.scale.set(sc, -sc, 1);
      c.refl.position.y = -H * 0.5 - sc * H * 0.5 - 0.04;
    });
    const fi = frontIndex();
    if (fi !== s.front) { s.front = fi; onFront?.(fi); setVideo(fi); }
    renderer.render(scene, camera);
    const moving = s.drag || Math.abs(s.target - s.rot) > 0.0005 || Math.abs(s.tpx - s.px) > 0.002 || Math.abs(s.tpy - s.py) > 0.002;
    if (moving || playing()) settle = 10;
    if (settle-- <= 0) stop();
  };
  function stop() { if (running) { running = false; renderer.setAnimationLoop(null); } }
  function kick() { settle = 10; if (!running && visible && !document.hidden) { running = true; renderer.setAnimationLoop(tick); } }
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) kick();
    else { stop(); cards.forEach(c => c.video?.pause()); }
  });
  io.observe(stage);
  const ro = new ResizeObserver(size);
  ro.observe(stage);
  const onVis = () => { if (document.hidden) { stop(); cards.forEach(c => c.video?.pause()); } else { setVideo(s.front); kick(); } };
  document.addEventListener('visibilitychange', onVis);
  size();

  return {
    next() { goTo(Math.round(s.target / step) + 1); },
    prev() { goTo(Math.round(s.target / step) - 1); },
    front: frontIndex,
    destroy() {
      stop(); io.disconnect(); ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      cards.forEach(c => {
        c.mat.dispose(); c.rmat.dispose(); c.poster?.dispose(); c.videoTex?.dispose();
        if (c.video) { c.video.pause(); c.video.removeAttribute('src'); c.video.load(); }
      });
      geo.dispose(); cardMask.dispose(); reflMask.dispose();
      renderer.dispose(); renderer.forceContextLoss();
      canvas.remove();
    }
  };
}
