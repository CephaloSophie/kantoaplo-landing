// cosmic-scene.jsx
// Cosmic visualisation: Cephalo Sophie (galaxy) → Kanto Aplo (star)
// → 6 editor planets orbiting, with Tektôn & Logos as moons of Héphaïstos.

const W = 1920;
const H = 1080;
const CX = W / 2;
const CY = H / 2;

// ── Editor data ─────────────────────────────────────────────────────────────
const EDITORS = {
  hephaistos: {
    name: 'Héphaïstos',
    greek: 'ἭΦΑΙΣΤΟΣ',
    role: 'La Forge',
    color: '#E84A4A',
    desc: "Dieu grec de la forge, le divin artisan de l'Olympe. Éditeur de création de blocs Blockly — il forge les outils que les bâtisseurs utilisent.",
    orbitR: 320,
    orbitSpeed: 0.07,
    startAngle: 0.2,
    size: 56,
    moons: [
      { name: 'Tektôn', greek: 'ΤΈΚΤΩΝ', color: '#C9963A', orbitR: 95, orbitSpeed: 0.55, size: 22, role: 'Le Bâtisseur', desc: "Τέκτων — l'artisan, le charpentier, le constructeur. Éditeur visuel de pages, funnels, applications et quiz par glisser-déposer. Lune en orbite proche autour d'Héphaïstos." },
      { name: 'Logos', greek: 'ΛΌΓΟΣ', color: '#3D8EE8', orbitR: 130, orbitSpeed: 0.40, size: 22, role: 'La Logique', desc: "Λόγος — la raison, la règle qui gouverne. Éditeur visuel d'APIs REST : routes, règles métier, authentification. Lune en orbite extérieure d'Héphaïstos." },
    ],
  },
  mantis: {
    name: 'Mantis',
    greek: 'ΜΆΝΤΙΣ',
    role: 'Le Prophète',
    color: '#8B5CF6',
    desc: "L'oracle, le devin — celui qui lit les signes invisibles. Couche analytique et prédictive : dashboards, ML sans code, prédictions temps réel.",
    orbitR: 460,
    orbitSpeed: 0.05,
    startAngle: 1.4,
    size: 48,
  },
  hermes: {
    name: 'Hermès',
    greek: 'ἙΡΜΗ͂Σ',
    role: 'Le Messager',
    color: '#E8714A',
    desc: "Messager des dieux, maître des passages. Moteur d'orchestration : workflows visuels, agents IA autonomes, circulation des données.",
    orbitR: 600,
    orbitSpeed: 0.038,
    startAngle: 2.7,
    size: 52,
  },
  synergos: {
    name: 'Synergos',
    greek: 'ΣΥΝΕΡΓΟΣ',
    role: 'Le Collaborateur',
    color: '#2DD4A0',
    desc: "Σύν (ensemble) + ἔργον (travail). Couche d'intégration universelle : bases de données, APIs tierces, services cloud, coffre-fort de credentials.",
    orbitR: 740,
    orbitSpeed: 0.030,
    startAngle: 4.1,
    size: 50,
  },
  kairos: {
    name: 'Kairos',
    greek: 'ΚΑΙΡΟΣ',
    role: "L'Opportunité",
    color: '#F472B6',
    desc: "Le moment juste, l'instant décisif. Module d'expérimentation statistique : tests A/B, calcul de significance, déploiement automatique de la variante gagnante.",
    orbitR: 870,
    orbitSpeed: 0.024,
    startAngle: 5.5,
    size: 44,
  },
};

const KANTO_APLO = {
  name: 'Kanto Aplo',
  greek: 'ΚΆΝΤΟ ΑΠΛΌ',
  role: 'L\'Étoile · Rends-le Simple',
  desc: "Plateforme SaaS no-code et low-code multi-tenant. Permet à tout Scripteur de créer des applications métier complètes : interfaces, APIs, workflows, analytique.",
  size: 140,
};

const CEPHALO = {
  name: 'Cephalo Sophie',
  greek: 'ΚΕΦΑΛΗ ΣΟΦΙΑ',
  role: 'La Galaxie · La Tête Sage',
  color: '#C9963A',
  desc: "L'intelligence qui précède l'action. La société mère qui conçoit, architecture et déploie KANTO APLO — 15 ans d'expertise Python, SQL, IA, cloud.",
};

// Five additional solar systems within the Cephalo Sophie galaxy.
// Visible in the wide galaxy view; positioned around the outskirts.
// Each is just a tiny star with its own faint orbit dots — placeholders
// for future products in the Cephalo Sophie ecosystem.
const OTHER_SYSTEMS = [
  { id: 'sys2', x: CX - 2200, y: CY - 1400, color: '#7FB7E8', name: 'Σύστημα Β', planets: 3 },
  { id: 'sys3', x: CX + 2400, y: CY - 1100, color: '#E8B87F', name: 'Σύστημα Γ', planets: 4 },
  { id: 'sys4', x: CX - 2600, y: CY + 900,  color: '#B87FE8', name: 'Σύστημα Δ', planets: 2 },
  { id: 'sys5', x: CX + 2100, y: CY + 1500, color: '#7FE8B8', name: 'Σύστημα Ε', planets: 5 },
  { id: 'sys6', x: CX - 1800, y: CY + 1700, color: '#E87FB8', name: 'Σύστημα ΣΤ', planets: 3 },
];

// ── Helper: position of a body at time t ───────────────────────────────────
function bodyPosition(editor, t) {
  const angle = editor.startAngle + t * editor.orbitSpeed * Math.PI * 2;
  return {
    x: CX + Math.cos(angle) * editor.orbitR,
    y: CY + Math.sin(angle) * editor.orbitR,
    angle,
  };
}

function moonPosition(parent, moon, t) {
  const p = bodyPosition(parent, t);
  const angle = t * moon.orbitSpeed * Math.PI * 2;
  return {
    x: p.x + Math.cos(angle) * moon.orbitR,
    y: p.y + Math.sin(angle) * moon.orbitR,
  };
}

// ── Camera scenes ───────────────────────────────────────────────────────────
// Each scene = {targetX, targetY, zoom, startTime, endTime, focus?: editor key}
// Each scene now includes ~3s extra pause time before next transition.
const SCENES = [
  // 0: Galaxy intro — Cephalo Sophie + 5 other systems visible
  { id: 'galaxy',     start: 0,   end: 11,  tx: CX, ty: CY, zoom: 0.45, label: 'galaxy' },
  // 1: Pull into Kanto Aplo solar system overview
  { id: 'system',     start: 11,  end: 22,  tx: CX, ty: CY, zoom: 1.0,  label: 'system' },
  // 2: Kanto Aplo close-up
  { id: 'kanto',      start: 22,  end: 33,  tx: CX, ty: CY, zoom: 2.4,  label: 'kanto' },
  // 3: Héphaïstos + its 2 moons visible
  { id: 'hephaistos', start: 33,  end: 45,  zoom: 2.4, focus: 'hephaistos', label: 'hephaistos' },
  // 3b: Tektôn moon close-up
  { id: 'tekton',     start: 45,  end: 55,  zoom: 4.5, focusMoon: { parent: 'hephaistos', moon: 0 }, label: 'tekton' },
  // 3c: Logos moon close-up
  { id: 'logos',      start: 55,  end: 65,  zoom: 4.5, focusMoon: { parent: 'hephaistos', moon: 1 }, label: 'logos' },
  // 4: Mantis
  { id: 'mantis',     start: 65,  end: 75,  zoom: 2.8, focus: 'mantis', label: 'mantis' },
  // 5: Hermès
  { id: 'hermes',     start: 75,  end: 85,  zoom: 2.6, focus: 'hermes', label: 'hermes' },
  // 6: Synergos
  { id: 'synergos',   start: 85,  end: 95,  zoom: 2.6, focus: 'synergos', label: 'synergos' },
  // 7: Kairos
  { id: 'kairos',     start: 95,  end: 105, zoom: 2.7, focus: 'kairos', label: 'kairos' },
  // 8: Pull back out to galaxy
  { id: 'outro',      start: 105, end: 115, tx: CX, ty: CY, zoom: 0.45, label: 'galaxy' },
];

const TOTAL_DURATION = 115;

// Get current camera state with smooth interpolation between scenes
function getCamera(t) {
  // Find current and next scene
  let current = SCENES[0];
  for (let i = 0; i < SCENES.length; i++) {
    if (t >= SCENES[i].start && t < SCENES[i].end) {
      current = SCENES[i];
      break;
    }
    if (t >= SCENES[i].end) current = SCENES[i];
  }

  const resolveTarget = (scene, time) => {
    if (scene.focusMoon) {
      const parent = EDITORS[scene.focusMoon.parent];
      const moon = parent.moons[scene.focusMoon.moon];
      const pos = moonPosition(parent, moon, time);
      return { tx: pos.x, ty: pos.y };
    }
    if (scene.focus) {
      const editor = EDITORS[scene.focus];
      const pos = bodyPosition(editor, time);
      return { tx: pos.x, ty: pos.y };
    }
    return { tx: scene.tx, ty: scene.ty };
  };

  // Smooth transition during first 2.2s of each scene (slower, more cinematic)
  const transitionDur = 2.2;
  const localT = t - current.start;

  if (localT < transitionDur) {
    // Find prev scene
    const idx = SCENES.indexOf(current);
    const prev = idx > 0 ? SCENES[idx - 1] : current;
    const prevTarget = resolveTarget(prev, t);
    const curTarget = resolveTarget(current, t);
    const k = Easing.easeInOutCubic(clamp(localT / transitionDur, 0, 1));
    return {
      tx: prevTarget.tx + (curTarget.tx - prevTarget.tx) * k,
      ty: prevTarget.ty + (curTarget.ty - prevTarget.ty) * k,
      zoom: prev.zoom + (current.zoom - prev.zoom) * k,
      label: current.label,
      sceneId: current.id,
      sceneLocalT: localT,
      sceneDur: current.end - current.start,
    };
  }

  const target = resolveTarget(current, t);
  return {
    tx: target.tx,
    ty: target.ty,
    zoom: current.zoom,
    label: current.label,
    sceneId: current.id,
    sceneLocalT: localT,
    sceneDur: current.end - current.start,
  };
}

// ── Galaxy background (Cephalo Sophie) ──────────────────────────────────────
function GalaxyBackdrop({ camera }) {
  // Pre-compute static stars
  const stars = React.useMemo(() => {
    const arr = [];
    const seed = (i) => {
      const x = Math.sin(i * 9301 + 49297) * 233280;
      return x - Math.floor(x);
    };
    for (let i = 0; i < 600; i++) {
      arr.push({
        x: seed(i) * W * 3 - W,
        y: seed(i + 1000) * H * 3 - H,
        size: seed(i + 2000) * 2 + 0.3,
        opacity: seed(i + 3000) * 0.7 + 0.2,
        twinkleOffset: seed(i + 4000) * Math.PI * 2,
      });
    }
    return arr;
  }, []);

  // Galaxy spiral arms (cephalo) — visible when far out
  const galaxyOpacity = clamp(1.2 - camera.zoom * 0.7, 0, 1);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Deep space gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, #1a1530 0%, #0a0817 40%, #050410 100%)',
      }} />

      {/* Galaxy arms (Cephalo Sophie) — gold-tinted */}
      <div style={{
        position: 'absolute',
        left: CX - 1400, top: CY - 1400,
        width: 2800, height: 2800,
        opacity: galaxyOpacity,
        background: `
          radial-gradient(ellipse 60% 30% at 50% 50%, rgba(201, 150, 58, 0.18) 0%, transparent 70%),
          radial-gradient(ellipse 30% 60% at 50% 50%, rgba(201, 150, 58, 0.12) 0%, transparent 70%),
          radial-gradient(circle at 50% 50%, rgba(255, 220, 150, 0.25) 0%, rgba(201, 150, 58, 0.08) 30%, transparent 60%)
        `,
        transform: `rotate(${camera.zoom * 5}deg)`,
        filter: 'blur(8px)',
        pointerEvents: 'none',
      }} />

      {/* Spiral arm wisps */}
      <svg style={{ position: 'absolute', left: CX - 1400, top: CY - 1400, width: 2800, height: 2800, opacity: galaxyOpacity * 0.6 }}>
        <defs>
          <radialGradient id="armGrad" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#ffe9b8" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#C9963A" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#C9963A" stopOpacity="0" />
          </radialGradient>
        </defs>
        {[0, 1, 2].map(i => (
          <ellipse
            key={i}
            cx={1400} cy={1400}
            rx={1200} ry={300}
            fill="url(#armGrad)"
            transform={`rotate(${i * 60} 1400 1400)`}
          />
        ))}
      </svg>

      {/* Stars */}
      {stars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: s.x, top: s.y,
          width: s.size, height: s.size,
          background: '#ffffff',
          borderRadius: '50%',
          opacity: s.opacity,
          boxShadow: s.size > 1.5 ? `0 0 ${s.size * 3}px rgba(255,255,255,0.6)` : 'none',
        }} />
      ))}
    </div>
  );
}

// ── Comets ──────────────────────────────────────────────────────────────────
function Comets() {
  const t = useTime();

  // 4 comets with different paths and timings — slower, more graceful
  const comets = [
    { period: 28, offset: 0,   startX: -300, startY: 200,  endX: W + 300, endY: H - 100, hue: '#ffe9b8' },
    { period: 38, offset: 9,   startX: W + 200, startY: 100, endX: -200, endY: H - 300, hue: '#a8d8ff' },
    { period: 32, offset: 18,  startX: -200, startY: H - 200, endX: W + 200, endY: 100, hue: '#ffd9a8' },
    { period: 45, offset: 26,  startX: W + 200, startY: H - 100, endX: -200, endY: 250, hue: '#ffffff' },
  ];

  return (
    <>
      {comets.map((c, i) => {
        const cycleT = ((t + c.offset) % c.period) / c.period;
        // Comet visible only during first 22% of its cycle (slower travel)
        if (cycleT > 0.22) return null;
        const k = cycleT / 0.22;
        const x = c.startX + (c.endX - c.startX) * k;
        const y = c.startY + (c.endY - c.startY) * k;
        const dx = c.endX - c.startX;
        const dy = c.endY - c.startY;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        const opacity = k < 0.1 ? k * 10 : k > 0.9 ? (1 - k) * 10 : 1;

        return (
          <div key={i} style={{
            position: 'absolute',
            left: x, top: y,
            width: 0, height: 0,
            transform: `rotate(${angle}deg)`,
            opacity,
            pointerEvents: 'none',
          }}>
            {/* tail */}
            <div style={{
              position: 'absolute',
              right: 0, top: -2,
              width: 180, height: 4,
              background: `linear-gradient(to left, ${c.hue}, transparent)`,
              borderRadius: 2,
              filter: 'blur(1px)',
            }} />
            {/* head */}
            <div style={{
              position: 'absolute',
              left: -4, top: -4,
              width: 8, height: 8,
              background: c.hue,
              borderRadius: '50%',
              boxShadow: `0 0 16px ${c.hue}, 0 0 32px ${c.hue}`,
            }} />
          </div>
        );
      })}
    </>
  );
}

// ── Kanto Aplo Star ─────────────────────────────────────────────────────────
function KantoAploStar() {
  const t = useTime();
  const pulse = 1 + Math.sin(t * 0.8) * 0.025;
  const size = KANTO_APLO.size * pulse;

  return (
    <div style={{
      position: 'absolute',
      left: CX, top: CY,
      transform: 'translate(-50%, -50%)',
    }}>
      {/* Outer glow halo — much dimmer */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        width: size * 3, height: size * 3,
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(circle, rgba(255, 200, 100, 0.12) 0%, rgba(180, 100, 200, 0.06) 35%, rgba(80, 200, 130, 0.03) 60%, transparent 78%)',
        borderRadius: '50%',
        filter: 'blur(16px)',
      }} />
      {/* Mid glow */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        width: size * 1.6, height: size * 1.6,
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(circle, rgba(255, 220, 150, 0.28) 0%, rgba(200, 130, 70, 0.14) 45%, transparent 75%)',
        borderRadius: '50%',
        filter: 'blur(6px)',
      }} />
      {/* Star body — gold→green→violet gradient (slightly muted) */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        width: size, height: size,
        transform: 'translate(-50%, -50%)',
        background: `
          radial-gradient(circle at 35% 30%, #fae8c0 0%, #e8c47a 22%, #C9963A 48%, #5fa86b 72%, #8B5CF6 100%)
        `,
        borderRadius: '50%',
        boxShadow: 'inset -10px -10px 30px rgba(80, 30, 100, 0.45), 0 0 24px rgba(255, 200, 100, 0.22)',
      }} />
      {/* Surface flares — slower and dimmer */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        width: size * 0.9, height: size * 0.9,
        transform: `translate(-50%, -50%) rotate(${t * 3}deg)`,
        background: `conic-gradient(from 0deg, transparent 0%, rgba(255, 255, 255, 0.07) 12%, transparent 26%, transparent 52%, rgba(139, 92, 246, 0.10) 62%, transparent 78%)`,
        borderRadius: '50%',
        mixBlendMode: 'screen',
      }} />
    </div>
  );
}

// ── Other solar systems within Cephalo Sophie galaxy ────────────────────────
// Tiny distant systems — visible only when far out (galaxy view).
function OtherSystem({ system, t, opacity }) {
  if (opacity <= 0.01) return null;

  // Tiny planets orbiting each distant star
  const planets = React.useMemo(() => {
    const arr = [];
    const seed = (i) => {
      const x = Math.sin(i * 9301 + system.x + system.y) * 233280;
      return x - Math.floor(x);
    };
    for (let i = 0; i < system.planets; i++) {
      arr.push({
        orbitR: 50 + i * 35 + seed(i) * 15,
        speed: 0.04 + seed(i + 100) * 0.04,
        startAngle: seed(i + 200) * Math.PI * 2,
        size: 4 + seed(i + 300) * 3,
      });
    }
    return arr;
  }, [system]);

  return (
    <div style={{
      position: 'absolute',
      left: system.x, top: system.y,
      transform: 'translate(-50%, -50%)',
      opacity,
      pointerEvents: 'none',
    }}>
      {/* halo */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        width: 120, height: 120,
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(circle, ${system.color}40 0%, ${system.color}15 40%, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(10px)',
      }} />
      {/* central star */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        width: 16, height: 16,
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(circle, #ffffff 0%, ${system.color} 60%, ${system.color}88 100%)`,
        borderRadius: '50%',
        boxShadow: `0 0 20px ${system.color}cc, 0 0 40px ${system.color}66`,
      }} />
      {/* orbit rings */}
      {planets.map((p, i) => (
        <div key={'r' + i} style={{
          position: 'absolute',
          left: '50%', top: '50%',
          width: p.orbitR * 2, height: p.orbitR * 2,
          transform: 'translate(-50%, -50%)',
          border: `1px solid ${system.color}`,
          opacity: 0.18,
          borderRadius: '50%',
        }} />
      ))}
      {/* planets */}
      {planets.map((p, i) => {
        const angle = p.startAngle + t * p.speed * Math.PI * 2;
        const px = Math.cos(angle) * p.orbitR;
        const py = Math.sin(angle) * p.orbitR;
        return (
          <div key={'p' + i} style={{
            position: 'absolute',
            left: '50%', top: '50%',
            width: p.size, height: p.size,
            transform: `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`,
            background: system.color,
            borderRadius: '50%',
            boxShadow: `0 0 6px ${system.color}`,
          }} />
        );
      })}
      {/* label */}
      <div style={{
        position: 'absolute',
        left: '50%', top: 'calc(50% + 75px)',
        transform: 'translateX(-50%)',
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: 14,
        fontStyle: 'italic',
        color: system.color,
        whiteSpace: 'nowrap',
        opacity: 0.7,
        letterSpacing: '0.1em',
      }}>
        {system.name}
      </div>
    </div>
  );
}

// ── Orbit ring ──────────────────────────────────────────────────────────────
function OrbitRing({ r, opacity = 0.12, color = '#ffffff' }) {
  return (
    <div style={{
      position: 'absolute',
      left: CX - r, top: CY - r,
      width: r * 2, height: r * 2,
      borderRadius: '50%',
      border: `1px solid ${color}`,
      opacity,
      pointerEvents: 'none',
    }} />
  );
}

// ── Planet ──────────────────────────────────────────────────────────────────
function Planet({ editor, t, isFocused }) {
  const { x, y } = bodyPosition(editor, t);
  const pulse = 1 + Math.sin(t * 2 + editor.startAngle) * 0.03;
  const size = editor.size * pulse;
  const glowColor = editor.color;

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      transform: 'translate(-50%, -50%)',
    }}>
      {/* glow */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        width: size * 2.6, height: size * 2.6,
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(circle, ${glowColor}55 0%, ${glowColor}15 40%, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(8px)',
      }} />
      {/* body */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        width: size, height: size,
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(circle at 35% 30%, ${lightenColor(glowColor, 40)} 0%, ${glowColor} 50%, ${darkenColor(glowColor, 30)} 100%)`,
        borderRadius: '50%',
        boxShadow: `inset -6px -8px 20px rgba(0,0,0,0.5), 0 0 30px ${glowColor}66`,
      }} />
      {/* atmosphere ring (only on focused) */}
      {isFocused && (
        <div style={{
          position: 'absolute',
          left: '50%', top: '50%',
          width: size * 1.5, height: size * 1.5,
          transform: 'translate(-50%, -50%)',
          border: `1px solid ${glowColor}`,
          borderRadius: '50%',
          opacity: 0.4,
        }} />
      )}
    </div>
  );
}

// ── Moon (orbiting a planet) ────────────────────────────────────────────────
function Moon({ parent, moon, t }) {
  const { x, y } = moonPosition(parent, moon, t);
  const parentPos = bodyPosition(parent, t);

  return (
    <>
      {/* moon orbit ring around parent */}
      <div style={{
        position: 'absolute',
        left: parentPos.x - moon.orbitR, top: parentPos.y - moon.orbitR,
        width: moon.orbitR * 2, height: moon.orbitR * 2,
        borderRadius: '50%',
        border: `1px dashed ${moon.color}`,
        opacity: 0.25,
        pointerEvents: 'none',
      }} />
      {/* moon body */}
      <div style={{
        position: 'absolute',
        left: x, top: y,
        transform: 'translate(-50%, -50%)',
      }}>
        <div style={{
          position: 'absolute',
          left: '50%', top: '50%',
          width: moon.size * 2, height: moon.size * 2,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${moon.color}55 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(4px)',
        }} />
        <div style={{
          position: 'absolute',
          left: '50%', top: '50%',
          width: moon.size, height: moon.size,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle at 35% 30%, ${lightenColor(moon.color, 40)} 0%, ${moon.color} 60%, ${darkenColor(moon.color, 30)} 100%)`,
          borderRadius: '50%',
          boxShadow: `inset -3px -4px 8px rgba(0,0,0,0.5), 0 0 12px ${moon.color}66`,
        }} />
      </div>
    </>
  );
}

// ── Color helpers ───────────────────────────────────────────────────────────
function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 255) + percent);
  const g = Math.min(255, ((num >> 8) & 255) + percent);
  const b = Math.min(255, (num & 255) + percent);
  return `rgb(${r}, ${g}, ${b})`;
}

function darkenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, ((num >> 16) & 255) - percent);
  const g = Math.max(0, ((num >> 8) & 255) - percent);
  const b = Math.max(0, (num & 255) - percent);
  return `rgb(${r}, ${g}, ${b})`;
}

// ── Info Panel ──────────────────────────────────────────────────────────────
function InfoPanel({ camera }) {
  const sceneId = camera.sceneId;
  const localT = camera.sceneLocalT;
  const sceneDur = camera.sceneDur;

  // Fade in after 1.8s of scene, fade out in last 1.5s
  const fadeInStart = 1.8;
  const fadeOutStart = sceneDur - 1.5;
  let opacity = 0;
  if (localT > fadeInStart && localT < fadeOutStart) {
    const inProg = clamp((localT - fadeInStart) / 0.6, 0, 1);
    const outProg = localT > fadeOutStart ? clamp((localT - fadeOutStart) / 1.5, 0, 1) : 0;
    opacity = Easing.easeOutCubic(inProg) * (1 - outProg);
  } else if (localT >= fadeOutStart && localT < sceneDur) {
    const outProg = clamp((localT - fadeOutStart) / 1.5, 0, 1);
    opacity = 1 - Easing.easeInCubic(outProg);
  }

  let body = null;

  if (sceneId === 'galaxy' || sceneId === 'outro') {
    body = <PanelContent
      eyebrow="LA GALAXIE"
      greek={CEPHALO.greek}
      name={CEPHALO.name}
      role={CEPHALO.role}
      desc={CEPHALO.desc}
      color={CEPHALO.color}
      side="bottom"
    />;
  } else if (sceneId === 'system') {
    body = <PanelContent
      eyebrow="L'ÉCOSYSTÈME"
      greek="ΣΥΣΤΗΜΑ"
      name="Le Système Kanto Aplo"
      role="Une étoile, six éditeurs, deux lunes"
      desc="Au cœur de la galaxie Cephalo Sophie, l'étoile Kanto Aplo gouverne un système de six éditeurs grecs en orbite. Chacun maître d'un domaine — la forge, l'oracle, le messager, le collaborateur, le moment juste."
      color="#C9963A"
      side="bottom"
    />;
  } else if (sceneId === 'kanto') {
    body = <PanelContent
      eyebrow="L'ÉTOILE"
      greek={KANTO_APLO.greek}
      name={KANTO_APLO.name}
      role={KANTO_APLO.role}
      desc={KANTO_APLO.desc}
      color="#C9963A"
      gradient="linear-gradient(90deg, #C9963A, #5fa86b, #8B5CF6)"
      side="left"
    />;
  } else if (sceneId === 'hephaistos') {
    body = <PanelContent
      eyebrow="LA PLANÈTE FORGE · 2 LUNES"
      greek={EDITORS.hephaistos.greek}
      name={EDITORS.hephaistos.name}
      role={EDITORS.hephaistos.role}
      desc={EDITORS.hephaistos.desc}
      color={EDITORS.hephaistos.color}
      moons={EDITORS.hephaistos.moons}
      side="right"
    />;
  } else if (sceneId === 'tekton') {
    const m = EDITORS.hephaistos.moons[0];
    body = <PanelContent
      eyebrow="LUNE D'HÉPHAÏSTOS · LE BÂTISSEUR"
      greek={m.greek}
      name={m.name}
      role={m.role}
      desc={m.desc}
      color={m.color}
      side="right"
    />;
  } else if (sceneId === 'logos') {
    const m = EDITORS.hephaistos.moons[1];
    body = <PanelContent
      eyebrow="LUNE D'HÉPHAÏSTOS · LA LOGIQUE"
      greek={m.greek}
      name={m.name}
      role={m.role}
      desc={m.desc}
      color={m.color}
      side="right"
    />;
  } else if (EDITORS[sceneId]) {
    const e = EDITORS[sceneId];
    body = <PanelContent
      eyebrow="ÉDITEUR · PLANÈTE"
      greek={e.greek}
      name={e.name}
      role={e.role}
      desc={e.desc}
      color={e.color}
      side="right"
    />;
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      opacity,
      pointerEvents: 'none',
      transition: 'opacity 0.1s linear',
    }}>
      {body}
    </div>
  );
}

function PanelContent({ eyebrow, greek, name, role, desc, color, gradient, moons, side = 'right' }) {
  const positions = {
    right:  { right: 80, top: '50%', transform: 'translateY(-50%)', textAlign: 'left' },
    left:   { left: 80, top: '50%', transform: 'translateY(-50%)', textAlign: 'left' },
    bottom: { left: '50%', bottom: 100, transform: 'translateX(-50%)', textAlign: 'center' },
  };
  const pos = positions[side];

  return (
    <div style={{
      position: 'absolute',
      ...pos,
      maxWidth: 580,
      color: '#f6f4ef',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* eyebrow */}
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 13,
        letterSpacing: '0.18em',
        color: color,
        marginBottom: 16,
        opacity: 0.9,
      }}>
        ◆ {eyebrow}
      </div>

      {/* greek */}
      <div style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: 28,
        letterSpacing: '0.15em',
        color: 'rgba(246, 244, 239, 0.6)',
        marginBottom: 8,
        fontWeight: 400,
      }}>
        {greek}
      </div>

      {/* name */}
      <div style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: 76,
        fontWeight: 500,
        lineHeight: 1.0,
        marginBottom: 14,
        color: '#fff',
        letterSpacing: '-0.01em',
        ...(gradient ? {
          background: gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        } : {}),
      }}>
        {name}
      </div>

      {/* role */}
      <div style={{
        fontSize: 22,
        fontStyle: 'italic',
        color: color,
        marginBottom: 24,
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontWeight: 400,
        letterSpacing: '0.02em',
      }}>
        {role}
      </div>

      {/* divider */}
      <div style={{
        width: 60, height: 1,
        background: color,
        opacity: 0.5,
        marginBottom: 24,
        marginLeft: side === 'bottom' ? 'auto' : 0,
        marginRight: side === 'bottom' ? 'auto' : 0,
      }} />

      {/* description */}
      <div style={{
        fontSize: 19,
        lineHeight: 1.55,
        color: 'rgba(246, 244, 239, 0.85)',
        fontWeight: 300,
        textWrap: 'pretty',
        maxWidth: side === 'bottom' ? 720 : 520,
        marginLeft: side === 'bottom' ? 'auto' : 0,
        marginRight: side === 'bottom' ? 'auto' : 0,
      }}>
        {desc}
      </div>

      {/* moons */}
      {moons && (
        <div style={{ marginTop: 28, display: 'flex', gap: 24 }}>
          {moons.map(m => (
            <div key={m.name} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 16px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${m.color}40`,
              borderRadius: 4,
            }}>
              <div style={{
                width: 14, height: 14,
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 30%, ${lightenColor(m.color, 40)}, ${m.color})`,
                boxShadow: `0 0 10px ${m.color}88`,
              }} />
              <div>
                <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(246,244,239,0.5)', letterSpacing: '0.1em' }}>
                  {m.greek}
                </div>
                <div style={{ fontSize: 16, color: '#fff', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
                  {m.name} · <span style={{ color: m.color, opacity: 0.85 }}>{m.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Scene title overlay (top) ───────────────────────────────────────────────
function SceneCounter({ camera }) {
  const sceneIdx = SCENES.findIndex(s => s.id === camera.sceneId);
  const total = SCENES.length;
  return (
    <div style={{
      position: 'absolute',
      top: 36, left: 48,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 11,
      letterSpacing: '0.25em',
      color: 'rgba(246, 244, 239, 0.4)',
    }}>
      <div>CEPHALO·SOPHIE / KANTO·APLO</div>
      <div style={{ marginTop: 6, color: 'rgba(246,244,239,0.3)' }}>
        SCENE {String(sceneIdx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>
    </div>
  );
}

// ── Main scene ──────────────────────────────────────────────────────────────
function CosmicScene() {
  const t = useTime();
  const camera = getCamera(t);

  // Camera transform: scale the world, then translate so target ends up centered
  const worldTransform = `translate(${CX - camera.tx * camera.zoom}px, ${CY - camera.ty * camera.zoom}px) scale(${camera.zoom})`;

  const focusedKey = camera.sceneId in EDITORS ? camera.sceneId : null;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      overflow: 'hidden',
      background: '#050410',
    }}>
      {/* Galaxy backdrop — partially decoupled from camera so stars feel parallax */}
      <GalaxyBackdrop camera={camera} />

      {/* World layer (camera-transformed) */}
      <div style={{
        position: 'absolute', inset: 0,
        transform: worldTransform,
        transformOrigin: '0 0',
        willChange: 'transform',
      }}>
        {/* Other solar systems within Cephalo Sophie galaxy — only visible far out */}
        {OTHER_SYSTEMS.map(sys => (
          <OtherSystem
            key={sys.id}
            system={sys}
            t={t}
            opacity={clamp(1.4 - camera.zoom * 1.2, 0, 1)}
          />
        ))}

        {/* Orbit rings */}
        {Object.values(EDITORS).map(e => (
          <OrbitRing key={e.name} r={e.orbitR} opacity={camera.zoom > 1.5 ? 0.08 : 0.15} color={e.color} />
        ))}

        {/* Kanto Aplo star */}
        <KantoAploStar />

        {/* Planets */}
        {Object.entries(EDITORS).map(([key, editor]) => (
          <React.Fragment key={key}>
            <Planet editor={editor} t={t} isFocused={focusedKey === key} />
            {editor.moons && editor.moons.map(m => (
              <Moon key={m.name} parent={editor} moon={m} t={t} />
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Comets — drift across viewport, not world-space */}
      <Comets />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)',
        pointerEvents: 'none',
      }} />

      {/* UI overlays */}
      <SceneCounter camera={camera} />
      <InfoPanel camera={camera} />
    </div>
  );
}

Object.assign(window, { CosmicScene, TOTAL_DURATION });
