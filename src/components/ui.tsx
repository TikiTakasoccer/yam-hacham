import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { scoreColor, verdict } from "../theme/sports";
import { ltr } from "../lib";

export function Card({ children, className = "", title, sub, icon, action }: { children: ReactNode; className?: string; title?: ReactNode; sub?: ReactNode; icon?: ReactNode; action?: ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}
      className={`rounded-3xl bg-white p-4 sm:p-5 shadow-[0_1px_2px_rgba(12,36,50,.06),0_8px_24px_-12px_rgba(12,36,50,.18)] ring-1 ring-line/70 min-w-0 ${className}`}>
      {(title || action) && (
        <header className="mb-3 flex items-center gap-2">
          {icon && <span className="grid size-8 place-items-center rounded-xl bg-sport-soft text-sport">{icon}</span>}
          <div className="min-w-0 flex-1">
            <h3 className="text-[16px] font-bold leading-tight">{title}</h3>
            {sub && <p className="text-[12.5px] text-ink-soft">{sub}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </motion.section>
  );
}

/** animated score ring */
export function ScoreRing({ score, size = 112, stroke = 10, light = false, label = true }: { score: number; size?: number; stroke?: number; light?: boolean; label?: boolean }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, col = light ? "#fff" : scoreColor(score);
  const mv = useMotionValue(0); const off = useTransform(mv, v => c * (1 - v / 100));
  const [n, setN] = useState(0);
  useEffect(() => { const a = animate(mv, score, { duration: .9, ease: "easeOut", onUpdate: v => setN(Math.round(v)) }); return () => a.stop(); }, [score]);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`ציון ${score} מתוך 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={light ? "rgba(255,255,255,.25)" : "#e6eef2"} strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} style={{ strokeDashoffset: off }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className={`font-display font-extrabold leading-none ${light ? "text-white" : ""}`} style={{ fontSize: size * 0.34, color: light ? undefined : col }}>{n}</div>
          {label && <div className={`mt-0.5 font-semibold ${light ? "text-white/85" : "text-ink-soft"}`} style={{ fontSize: Math.max(10, size * 0.11) }}>{verdict(score)}</div>}
        </div>
      </div>
    </div>
  );
}

export function ScorePill({ score, className = "" }: { score: number; className?: string }) {
  const c = scoreColor(score);
  return <span className={`num inline-grid min-w-9 place-items-center rounded-full px-2 py-0.5 text-[13px] font-semibold ${className}`} style={{ background: `color-mix(in srgb, ${c} 14%, white)`, color: c }}>{score}</span>;
}

export function Metric({ icon, label, value, unit, sub, tone }: { icon?: ReactNode; label: string; value: ReactNode; unit?: string; sub?: ReactNode; tone?: string }) {
  return (
    <div className="rounded-2xl bg-mist/70 p-3 min-w-0">
      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft">{icon}<span className="truncate">{label}</span></div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="num text-[22px] font-semibold leading-none" style={{ color: tone }}>{value}</span>
        {unit && <span className="text-[12px] text-ink-soft">{unit}</span>}
      </div>
      {sub && <div className="mt-1 truncate text-[12px] text-ink-soft">{sub}</div>}
    </div>
  );
}

export function Chip({ active, onClick, children, className = "" }: { active?: boolean; onClick?: () => void; children: ReactNode; className?: string }) {
  return (
    <button onClick={onClick} aria-pressed={!!active}
      className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold transition-all active:scale-95 ${active ? "bg-sport text-white shadow-md" : "bg-white text-ink ring-1 ring-line hover:ring-[color:var(--c1)]"} ${className}`}>
      {children}
    </button>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl bg-white p-1 ring-1 ring-line" role="tablist">
      {options.map(([v, l]) => (
        <button key={v} role="tab" aria-selected={v === value} onClick={() => onChange(v)}
          className={`relative shrink-0 flex-1 whitespace-nowrap rounded-xl px-3.5 py-2 text-[14px] font-semibold transition-colors ${v === value ? "text-white" : "text-ink-soft hover:text-ink"}`}>
          {v === value && <motion.span layoutId="seg" className="absolute inset-0 rounded-xl bg-sport shadow" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
          <span className="relative">{l}</span>
        </button>
      ))}
    </div>
  );
}

export function Alert({ level, children }: { level: "bad" | "warn" | "info"; children: ReactNode }) {
  const c = level === "bad" ? "#e11d48" : level === "warn" ? "#d97706" : "#0891b2";
  return <div className="rounded-2xl px-4 py-3 text-[14px] font-medium" style={{ background: `color-mix(in srgb, ${c} 10%, white)`, color: `color-mix(in srgb, ${c} 80%, #0c2432)`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${c} 30%, white)` }}>{children}</div>;
}

export function Why({ items, title = "למה הציון הזה?", open = false }: { items: { pts: number; label: string }[]; title?: string; open?: boolean }) {
  const [o, setO] = useState(open);
  return (
    <div>
      <button onClick={() => setO(!o)} className="flex w-full items-center justify-between gap-2 text-right font-display text-[15px] font-bold" aria-expanded={o}>
        {title}<ChevronDown className={`size-5 transition-transform ${o ? "rotate-180" : ""}`} />
      </button>
      {o && (
        <ul className="mt-3 space-y-1.5">
          {items.map((i, k) => (
            <li key={k} className="grid grid-cols-[3.2rem_1fr] items-start gap-2 text-[13.5px]">
              <span dir="ltr" className={`num rounded-lg px-1.5 py-0.5 text-center text-[12.5px] font-semibold ${i.pts > 0 ? "bg-emerald-50 text-emerald-700" : i.pts < 0 ? "bg-rose-50 text-rose-700" : "bg-mist text-ink-soft"}`}>{i.pts > 0 ? "+" : ""}{i.pts}</span>
              <span>{ltr(i.label)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Checklist({ items, checked, onToggle, onReset }: { items: { k: string; txt: string; why?: string }[]; checked: Record<string, boolean>; onToggle: (k: string, v: boolean) => void; onReset: () => void }) {
  const done = items.filter(i => checked[i.k]).length;
  return (
    <div>
      <div className="mb-2 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-mist"><motion.div className="h-full rounded-full bg-sport" animate={{ width: `${(done / Math.max(1, items.length)) * 100}%` }} /></div>
        <span className="num text-[12.5px] text-ink-soft">{done}/{items.length}</span>
        <button onClick={onReset} className="text-[12.5px] font-semibold text-sport">נקה</button>
      </div>
      <ul className="space-y-1">
        {items.map(i => (
          <li key={i.k}>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl px-2 py-1.5 hover:bg-mist/70">
              <input type="checkbox" checked={!!checked[i.k]} onChange={e => onToggle(i.k, e.target.checked)} className="mt-1 size-4.5 shrink-0 accent-[color:var(--c1)]" />
              <span className={`text-[14.5px] ${checked[i.k] ? "text-ink-soft line-through" : ""}`}>{ltr(i.txt)}{i.why && <small className="block text-[12px] text-ink-soft no-underline">{ltr(i.why)}</small>}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Html({ html, className = "" }: { html: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Tips({ items }: { items: string[] }) {
  return <ul className="space-y-2">{items.map((t, i) => <li key={i} className="flex gap-2.5 rounded-2xl bg-mist/70 px-3 py-2.5 text-[14px]"><span className="mt-1.5 size-2 shrink-0 rounded-full bg-sport" />{ltr(t)}</li>)}</ul>;
}

export function KV({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[14px]">
      {rows.map(([k, v], i) => <div key={i} className="contents"><dt className="whitespace-nowrap text-ink-soft">{k}</dt><dd className="min-w-0 font-medium">{typeof v === "string" ? ltr(v) : v}</dd></div>)}
    </dl>
  );
}
