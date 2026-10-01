import { useId } from "react";
import type { SportId } from "../theme/sports";

/* =====================================================================
   סצנות מונפשות לכל ענף – איורי פיקטוגרמה לבנים על רקע בצבעי הענף.
   הכול SVG + CSS (ו-animateMotion לקשתות של כדורים ודגים).
   ===================================================================== */
const W = { stroke: "#fff", strokeWidth: 9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
const thin = { stroke: "#fff", strokeWidth: 1.4, fill: "none", strokeLinecap: "round" as const };
const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function wave(y: number, amp: number, len: number, width = 800) {
  let d = `M0 ${y}`;
  for (let x = 0; x < width; x += len) d += ` q${len / 4} ${-amp} ${len / 2} 0 t${len / 2} 0`;
  return d + " L800 240 L0 240 Z";
}
function Sea({ y = 150, calm = false, tint = "#ffffff", width = 800 }: { y?: number; calm?: boolean; tint?: string; width?: number }) {
  const a = calm ? 0.5 : 1;
  return (
    <g>
      <g className="wave-3"><path d={wave(y - 6, 5 * a, 100, width)} fill={tint} fillOpacity=".14" /></g>
      <g className="wave-2"><path d={wave(y + 8, 7 * a, 80, width)} fill={tint} fillOpacity=".2" /></g>
      <g className="wave-1"><path d={wave(y + 24, 9 * a, 100, width)} fill={tint} fillOpacity=".28" /></g>
    </g>
  );
}
function Sun({ x = 64, y = 48, r = 22 }) {
  return (
    <g>
      <circle className="glow" cx={x} cy={y} r={r * 1.9} fill="#fff" fillOpacity=".18" />
      <circle cx={x} cy={y} r={r} fill="#fff" fillOpacity=".85" />
    </g>
  );
}
function Clouds() {
  return (
    <g fill="#fff" fillOpacity=".35">
      <g className="drift-1"><ellipse cx="380" cy="40" rx="34" ry="9" /><ellipse cx="400" cy="34" rx="20" ry="10" /><ellipse cx="620" cy="60" rx="30" ry="8" /></g>
      <g className="drift-2"><ellipse cx="520" cy="26" rx="26" ry="7" /><ellipse cx="200" cy="70" rx="22" ry="6" /></g>
    </g>
  );
}
function Gulls() {
  return (
    <g stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity=".8">
      <g className="fly-1"><g className="flap"><path d="M430 62 q7 -7 14 0 q7 -7 14 0" /></g></g>
      <g className="fly-2"><g className="flap"><path d="M470 36 q5 -5 10 0 q5 -5 10 0" /></g></g>
    </g>
  );
}
function Sand({ y = 165 }) { return <path d={`M-400 ${y - 4} Q-200 ${y - 12} 0 ${y} Q100 ${y - 10} 200 ${y - 4} T400 ${y - 6} T800 ${y - 4} T1200 ${y - 6} L1200 240 L-400 240Z`} fill="#fde68a" fillOpacity=".55" />; }
function Head({ x, y }: { x: number; y: number }) { return <circle cx={x} cy={y} r="9" fill="#fff" />; }
function Ball({ path, dur = "2.4s", r = 8, fill = "#fff" }: { path: string; dur?: string; r?: number; fill?: string }) {
  return (
    <g>
      <circle r={r} fill={fill} stroke="rgba(0,0,0,.18)" strokeWidth="1.5" cx={reduce ? Number(path.split(" ")[0].slice(1)) : 0} cy={reduce ? Number(path.split(" ")[1]) : 0}>
        {!reduce && <animateMotion path={path} dur={dur} repeatCount="indefinite" keyPoints="0;1;0" keyTimes="0;.5;1" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1" />}
      </circle>
    </g>
  );
}

/* ---------------- figures ---------------- */
const figures: Record<string, (p: { u: string }) => React.ReactNode> = {
  surf: () => (
    <>
      <path d="M210 150 C230 70 330 50 370 110 C340 90 300 96 285 128 Z" fill="#fff" fillOpacity=".22" />
      <path d="M215 148 C236 78 326 58 366 108" {...thin} strokeWidth={3} strokeOpacity=".7" />
      <g className="ride">
        <g transform="translate(205 122)">
          <ellipse cx="0" cy="26" rx="46" ry="6.5" fill="#fff" transform="rotate(-9)" />
          <Head x={6} y={-44} />
          <path d="M4 -32 L-6 -6" {...W} />
          <path d="M-6 -6 L-24 18 M-6 -6 L14 6 L20 19" {...W} />
          <path d="M1 -26 L-26 -34 M1 -26 L26 -16" {...W} />
        </g>
      </g>
    </>
  ),
  kite: () => (
    <>
      <g className="sway" style={{ transformOrigin: "190px 120px" }}>
        <path d="M250 38 Q300 8 350 38 Q300 22 250 38Z" fill="#fff" />
        <path d="M262 33 Q300 14 338 33" stroke="#fb7185" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M252 38 L192 118 M348 38 L196 118" {...thin} />
      </g>
      <g className="bob">
        <g transform="translate(180 124)">
          <ellipse cx="0" cy="30" rx="30" ry="5" fill="#fff" />
          <Head x={-12} y={-34} />
          <path d="M-10 -22 L0 4 M0 4 L-12 28 M0 4 L14 28 M-8 -16 L14 -6" {...W} />
        </g>
      </g>
    </>
  ),
  windsurf: () => (
    <g className="bob">
      <g transform="translate(190 60)">
        <ellipse cx="10" cy="104" rx="52" ry="6.5" fill="#fff" />
        <path d="M30 100 L40 0" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        <path d="M40 2 C70 30 80 70 36 98 Z" fill="#fff" fillOpacity=".95" />
        <path d="M44 20 C62 38 66 64 40 86" stroke="#60a5fa" strokeWidth="6" fill="none" strokeLinecap="round" />
        <Head x={-8} y={36} />
        <path d="M-6 48 L-12 74 M-12 74 L-20 100 M-12 74 L6 100 M-4 54 L34 58" {...W} />
      </g>
    </g>
  ),
  sup: () => (
    <g className="bob-soft">
      <g transform="translate(200 72)">
        <ellipse cx="0" cy="96" rx="70" ry="6.5" fill="#fff" />
        <Head x={0} y={0} />
        <path d="M0 12 L0 52 M0 52 L-10 92 M0 52 L10 92" {...W} />
        <g className="stroke-anim" style={{ transformOrigin: "200px 90px" }}>
          <path d="M-4 20 L-36 36 M4 22 L-30 44" {...W} strokeWidth={7} />
          <path d="M-44 -2 L-24 110" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M-26 100 l-4 22 l10 2 z" fill="#fff" />
        </g>
      </g>
    </g>
  ),
  kayak: () => (
    <g className="bob-soft">
      <g transform="translate(200 128)">
        <path d="M-80 18 Q0 34 80 18 Q0 8 -80 18Z" fill="#fff" />
        <Head x={0} y={-22} />
        <path d="M0 -10 L0 12" {...W} />
        <g className="stroke-anim" style={{ transformOrigin: "200px 126px" }}>
          <path d="M-58 20 L58 -20" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="-60" cy="21" rx="8" ry="4" fill="#fff" transform="rotate(-20 -60 21)" />
          <ellipse cx="60" cy="-21" rx="8" ry="4" fill="#fff" transform="rotate(-20 60 -21)" />
          <path d="M0 -4 L-20 4 M0 -4 L20 -4" {...W} strokeWidth={7} />
        </g>
      </g>
    </g>
  ),
  footvolley: () => (
    <>
      <Sand y={160} />
      <path d="M200 82 L200 176" stroke="#fff" strokeWidth="3.5" />
      <rect x="160" y="84" width="80" height="22" fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="1.5" />
      {[168, 176, 184, 192, 208, 216, 224, 232].map(x => <path key={x} d={`M${x} 84 L${x} 106`} stroke="#fff" strokeOpacity=".5" strokeWidth="1" />)}
      <path d="M160 95 L240 95" stroke="#fff" strokeOpacity=".5" strokeWidth="1" />
      <g transform="translate(300 116)">
        <Head x={-4} y={-30} />
        <path d="M-2 -18 L4 12 M4 12 L10 44 M-4 -12 L-24 -2 M-2 -12 L20 -22" {...W} />
        <g className="kick" style={{ transformOrigin: "304px 128px" }}><path d="M4 12 L-26 -6" {...W} /></g>
      </g>
      <g transform="translate(96 120)">
        <Head x={4} y={-32} />
        <path d="M2 -20 L0 10 M0 10 L-12 42 M0 10 L14 40 M0 -14 L-18 0 M2 -14 L22 0" {...W} />
      </g>
      <Ball path="M282 104 Q200 -4 112 76" dur="2.6s" fill="#fde047" />
    </>
  ),
  volleyball: () => (
    <>
      <Sand y={160} />
      <path d="M200 70 L200 176" stroke="#fff" strokeWidth="3.5" />
      <rect x="150" y="72" width="100" height="20" fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="1.5" />
      {[160, 170, 180, 190, 210, 220, 230, 240].map(x => <path key={x} d={`M${x} 72 L${x} 92`} stroke="#fff" strokeOpacity=".5" strokeWidth="1" />)}
      <g className="jump"><g transform="translate(262 118)">
        <Head x={0} y={-36} />
        <path d="M0 -24 L2 8 M2 8 L-8 40 M2 8 L14 38 M0 -18 L-18 -46 M0 -18 L18 -6" {...W} />
      </g></g>
      <g transform="translate(120 122)">
        <Head x={2} y={-32} />
        <path d="M2 -20 L0 10 M0 10 L-10 40 M0 10 L12 40 M0 -12 L20 -4 M0 -12 L22 2" {...W} />
      </g>
      <Ball path="M244 70 Q196 0 136 84" dur="2.2s" fill="#fff" />
    </>
  ),
  matkot: () => (
    <>
      <Sand y={158} />
      <g transform="translate(96 118)">
        <Head x={0} y={-32} />
        <path d="M0 -20 L0 10 M0 10 L-12 42 M0 10 L12 42 M0 -14 L20 -22" {...W} />
        <ellipse cx="28" cy="-28" rx="9" ry="12" fill="#fff" />
      </g>
      <g transform="translate(304 118)">
        <Head x={0} y={-32} />
        <path d="M0 -20 L0 10 M0 10 L-12 42 M0 10 L12 42 M0 -14 L-20 -18" {...W} />
        <ellipse cx="-28" cy="-24" rx="9" ry="12" fill="#fff" />
      </g>
      <Ball path="M132 88 Q200 60 268 92" dur="1.6s" r={5} fill="#fde047" />
    </>
  ),
  swim: () => (
    <>
      <g className="bob-soft"><g transform="translate(190 130)">
        <Head x={-46} y={-4} />
        <path d="M-34 2 L40 8 M40 8 L64 2 M40 8 L66 16" {...W} />
        <g className="spin-slow" style={{ transformOrigin: "center" }}><path d="M-20 -2 L-20 -32" {...W} /></g>
      </g></g>
      {[0, 1, 2, 3].map(i => <circle key={i} className="bubble" style={{ animationDelay: `${i * 1.2}s` }} cx={120 + i * 18} cy={200} r={3 + (i % 2)} fill="#fff" fillOpacity=".6" />)}
    </>
  ),
  snorkel: () => (
    <>
      {[60, 150, 260].map((x, i) => <path key={x} className="shimmer" style={{ animationDelay: `${i}s` }} d={`M${x} 0 L${x + 40} 0 L${x + 110} 240 L${x + 50} 240Z`} fill="#fff" />)}
      <path d="M-400 212 Q-200 200 0 214 Q60 196 120 210 T240 206 T400 210 T800 208 T1200 210 L1200 240 L-400 240Z" fill="#fff" fillOpacity=".25" />
      <g fill="#fde68a" fillOpacity=".75"><path d="M300 214 q6 -26 -4 -44 q16 16 12 44z" /><path d="M318 214 q-2 -20 10 -32 q-4 18 -2 32z" /><path d="M70 214 q4 -18 -6 -30 q14 10 12 30z" /></g>
      <g transform="translate(200 44)"><g className="bob-soft">
        <Head x={-40} y={0} /><path d="M-40 -9 L-40 -24" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        <path d="M-28 4 L34 10 M34 10 L58 4 M34 10 L58 18" {...W} />
      </g></g>
      {[["fish-1", 150, "#fde047"], ["fish-2", 110, "#fb923c"], ["fish-3", 175, "#fff"]].map(([c, y, f]) => (
        <g key={c as string} className={c as string}><g transform={`translate(420 ${y})`}><ellipse cx="0" cy="0" rx="12" ry="6" fill={f as string} /><path d="M10 0 l10 -7 v14z" fill={f as string} /><circle cx="-6" cy="-1" r="1.5" fill="#1e1b4b" /></g></g>
      ))}
      {[0, 1, 2].map(i => <circle key={i} className="bubble" style={{ animationDelay: `${i * 1.6}s` }} cx={168 + i * 6} cy={60} r={2.5 + i} fill="#fff" fillOpacity=".7" />)}
    </>
  ),
  fishing: () => (
    <>
      <path d="M270 240 L284 166 Q300 150 330 156 L360 150 Q390 154 400 170 L400 240Z" fill="#0b1f33" fillOpacity=".55" />
      <g transform="translate(318 104)">
        <Head x={0} y={-30} />
        <path d="M0 -18 L2 14 M2 14 L-8 50 M2 14 L14 50 M0 -12 L-24 -4 M0 -10 L-20 4" {...W} />
      </g>
      <path d="M292 102 Q230 20 150 32" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M150 32 L130 146" {...thin} strokeOpacity=".8" />
      <g className="bob-soft"><ellipse cx="130" cy="148" rx="5" ry="7" fill="#fb7185" /><rect x="128.5" y="136" width="3" height="8" fill="#fff" /></g>
      <g fill="#fff" fillOpacity=".92">
        <g>
          {!reduce && <animateMotion path="M56 178 Q86 92 118 178" dur="3.4s" repeatCount="indefinite" rotate="auto" />}
          <ellipse cx="0" cy="0" rx="12" ry="5" /><path d="M-11 0 l-8 -6 v12z" />
        </g>
      </g>
    </>
  ),
  beach: () => (
    <>
      <Sand y={150} />
      <path d="M150 170 L170 64" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M112 72 Q170 18 228 72 Z" fill="#fff" />
      <path d="M132 58 Q170 30 190 40 L186 70 Z" fill="#fb7185" />
      <path d="M200 44 Q222 56 228 72 L206 70 Z" fill="#fb7185" />
      <rect x="190" y="176" width="70" height="16" rx="3" fill="#fff" fillOpacity=".85" transform="rotate(-4 225 184)" />
      <rect x="190" y="181" width="70" height="4" fill="#38bdf8" transform="rotate(-4 225 184)" />
      <g className="ball-bounce"><g transform="translate(300 156)">
        <circle r="14" fill="#fff" /><path d="M-14 0 A14 14 0 0 1 0 -14 L0 0Z" fill="#f43f5e" /><path d="M0 14 A14 14 0 0 1 -14 0 L0 0Z" fill="#facc15" /><path d="M14 0 A14 14 0 0 1 0 14 L0 0Z" fill="#38bdf8" />
      </g></g>
    </>
  ),
};

/** full scene: sky gradient in sport colors + sea/sand + animated figure */
export function Scene({ kind, c1, c2, className = "", sun = true, wide = false }: { kind: SportId | "home"; c1: string; c2: string; className?: string; sun?: boolean; wide?: boolean }) {
  const VW = wide ? 800 : 400, dx = wide ? 110 : 0, land = ["footvolley", "volleyball", "matkot", "beach"].includes(kind);
  const id = useId().replace(/:/g, "");
  const under = kind === "snorkel";
  const Fig = kind !== "home" ? figures[kind] : null;
  return (
    <svg className={`scene ${className}`} viewBox={`0 0 ${VW} 220`} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} />
        </linearGradient>
      </defs>
      <rect width={VW} height="240" fill={`url(#sky${id})`} />
      {!under && sun && <Sun />}
      {!under && <Clouds />}
      {!under && <Gulls />}
      {!under && <Sea width={VW + 400} y={kind === "swim" ? 118 : land ? 138 : 150} calm={["sup", "kayak", "snorkel"].includes(kind)} />}
      {Fig && <g transform={`translate(${dx} 0)`}><Fig u={id} /></g>}
      {kind === "home" && (
        <g className="bob-soft" transform={`translate(${120 + dx} 128)`}>
          <path d="M-30 20 L30 20 L22 30 L-22 30Z" fill="#fff" />
          <path d="M0 18 L0 -40" stroke="#fff" strokeWidth="2.5" />
          <path d="M2 -38 L30 14 L2 14Z" fill="#fff" fillOpacity=".95" /><path d="M-2 -30 L-22 14 L-2 14Z" fill="#fff" fillOpacity=".75" />
        </g>
      )}
    </svg>
  );
}
