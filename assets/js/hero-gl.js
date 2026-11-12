// Generative hero placeholder: slow light through frosted glass, with a faint
// prismatic split at the edges. Shown only until a real hero video is set in
// content/site.json. Renders at reduced resolution and pauses when off-screen.

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}
// Offsets travel on circles, so the smoke flows continuously and loops
// seamlessly (90 s) instead of drifting into darker or emptier states.
vec2 orbit(float t, float r, float ph) { float a = t * 0.0698 + ph; return r * vec2(cos(a), sin(a)); }
float field(vec2 uv, float t) {
  vec2 q = vec2(fbm(uv + orbit(t, 0.45, 0.0)), fbm(uv + vec2(5.2, 1.3) + orbit(t, 0.4, 2.1)));
  float f = fbm(uv + 1.8 * q + orbit(t, 0.22, 4.2));
  // Soft folds of light, like a lit fabric or frosted glass.
  float light = smoothstep(0.24, 0.78, f);
  float ridge = smoothstep(0.06, 0.0, abs(f - 0.62)) * 0.35;
  return light * 0.8 + ridge;
}
void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 0.9 + uPointer * 0.05;
  float t = uTime;
  float k = 0.006;
  vec3 col = vec3(field(p + vec2(k, 0.0), t), field(p, t), field(p - vec2(k, 0.0), t));
  float lum = dot(col, vec3(0.333));
  // Mostly monochrome; only a whisper of the colour separation on the folds.
  col = mix(vec3(lum), col, 0.4) * vec3(1.12, 0.88, 0.72);
  vec3 base = vec3(0.16, 0.14, 0.13);
  float vig = smoothstep(1.3, 0.1, length((uv - vec2(0.6, 0.6)) * vec2(1.0, 1.25)));
  col = base + col * (0.4 + 0.62 * vig);
  col += (hash(gl_FragCoord.xy + floor(t * 24.0)) - 0.5) * 0.018;
  gl_FragColor = vec4(col, 1.0);
}`;

const VERT = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';

export function start(canvas, { reduced = false } = {}) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
  if (!gl) return;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
  const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uPointer = gl.getUniformLocation(prog, 'uPointer');

  const small = innerWidth < 768;
  const scale = small ? 0.35 : 0.5;
  const resize = () => {
    const w = Math.max(2, Math.round(canvas.clientWidth * scale));
    const h = Math.max(2, Math.round(canvas.clientHeight * scale));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
  };
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { ptr.tx = e.clientX / innerWidth - 0.5; ptr.ty = 0.5 - e.clientY / innerHeight; }, { passive: true });

  let visible = true, raf = 0, last = 0;
  const t0 = performance.now();
  const draw = now => {
    raf = 0;
    // The hero stays pinned under the page, so also stop once it is covered.
    if (!visible || document.hidden || scrollY > innerHeight * 1.05) return;
    // ~30 fps is plenty for slow light and halves GPU work.
    if (now - last < 32) { raf = requestAnimationFrame(draw); return; }
    last = now;
    resize();
    ptr.x += (ptr.tx - ptr.x) * 0.05; ptr.y += (ptr.ty - ptr.y) * 0.05;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (now - t0) / 1000);
    gl.uniform2f(uPointer, ptr.x, ptr.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!reduced) raf = requestAnimationFrame(draw);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(canvas);
  document.addEventListener('visibilitychange', kick);
  addEventListener('scroll', () => { if (scrollY <= innerHeight * 1.05) kick(); }, { passive: true });
  addEventListener('resize', () => { if (reduced) { last = 0; kick(); } }, { passive: true });
  kick();
}
