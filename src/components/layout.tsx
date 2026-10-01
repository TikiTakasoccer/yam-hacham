import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { ArrowRight, CalendarDays, Home, MapPin, NotebookPen, RefreshCw, Settings2, ChevronDown, X, Navigation } from "lucide-react";
import { api, E, dayName, shortDate, dayOf, candidates, scoreAt, isToday, hhmm, kn, fmt } from "../lib";
import { Scene } from "./Scene";
import { SPORTS, scoreColor, type SportId } from "../theme/sports";
import { ScoreRing } from "./ui";

export type Route =
  | { screen: "home" } | { screen: "category"; id: string } | { screen: "sport"; id: SportId; tab?: string }
  | { screen: "week" } | { screen: "log" } | { screen: "settings"; section?: string };

export function TopBar({ onSpot, onBack, title }: { onSpot: () => void; onBack?: () => void; title?: string }) {
  const S = api.S, sp = api.SPOTS.find((s: any) => s.id === S.spotId) || api.SPOTS[0];
  const st = S.status || { cls: "loading", text: "טוען…" };
  const dot = st.cls === "live" ? "bg-emerald-500" : st.cls === "cache" ? "bg-sky-500" : st.cls === "demo" ? "bg-amber-500" : "bg-slate-400";
  return (
    <header className="sticky top-0 z-30 glass-strong border-b border-line/70" style={{ paddingTop: "env(safe-area-inset-top,0px)" }}>
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2.5">
        {onBack ? (
          <button onClick={onBack} className="grid size-10 place-items-center rounded-full bg-mist active:scale-95" aria-label="חזרה"><ArrowRight className="size-5" /></button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-sky-600 to-cyan-400 text-white shadow-md">
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" /><path d="M2 19c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" /><circle cx="16" cy="7" r="3" /></svg>
            </div>
            <div className="leading-tight"><div className="font-display text-[19px] font-extrabold">ים חכם</div></div>
          </div>
        )}
        {title && <div className="min-w-0 truncate font-display text-[17px] font-bold">{title}</div>}
        <button onClick={onSpot} className="ms-auto flex min-w-0 items-center gap-1.5 rounded-full bg-white px-3 py-2 text-[14px] font-semibold ring-1 ring-line active:scale-95">
          <MapPin className="size-4 shrink-0 text-sky-600" /><span className="max-w-[9.5rem] truncate">{sp?.name}</span><ChevronDown className="size-4 shrink-0 text-ink-soft" />
        </button>
        <button onClick={() => E.loadForecast()} className="relative grid size-10 shrink-0 place-items-center rounded-full bg-white ring-1 ring-line active:scale-95" title={st.text} aria-label={`רענון · ${st.text}`}>
          <RefreshCw className={`size-4.5 ${st.cls === "loading" ? "animate-spin" : ""}`} />
          <span className={`absolute -top-0.5 -left-0.5 size-3 rounded-full ring-2 ring-white ${dot}`} />
        </button>
      </div>
      {st.cls === "demo" && <div className="bg-amber-100 px-4 py-1 text-center text-[12.5px] font-semibold text-amber-800">{st.text} – מוצגים נתוני דוגמה</div>}
      {st.cls === "cache" && <div className="bg-sky-50 px-4 py-1 text-center text-[12.5px] font-semibold text-sky-800">{st.text}</div>}
    </header>
  );
}

export function BottomNav({ route, go }: { route: Route; go: (r: Route) => void }) {
  const items: [Route["screen"], string, ReactNode][] = [["home", "בית", <Home key="h" />], ["week", "השבוע", <CalendarDays key="w" />], ["log", "יומן דיג", <NotebookPen key="l" />], ["settings", "הגדרות", <Settings2 key="s" />]];
  const cur = route.screen === "category" || route.screen === "sport" ? "home" : route.screen;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-3" style={{ paddingBottom: "calc(env(safe-area-inset-bottom,0px) + 10px)" }}>
      <div className="glass-strong flex w-full max-w-md items-center justify-around rounded-[26px] p-1.5 shadow-[0_10px_30px_-10px_rgba(12,36,50,.35)] ring-1 ring-line">
        {items.map(([s, l, ic]) => (
          <button key={s} onClick={() => go({ screen: s } as Route)} className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11.5px] font-semibold ${cur === s ? "text-sky-700" : "text-ink-soft"}`} aria-current={cur === s ? "page" : undefined}>
            {cur === s && <motion.span layoutId="navpill" className="absolute inset-0 rounded-2xl bg-sky-100" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <span className="relative [&>svg]:size-5.5">{ic}</span><span className="relative">{l}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div className="absolute inset-0 bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div role="dialog" aria-modal="true" aria-label={title} className="relative max-h-[82vh] w-full max-w-lg overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-2xl sm:rounded-[28px]"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", stiffness: 380, damping: 34 }}>
            <div className="mb-3 flex items-center"><h2 className="text-[19px] font-extrabold">{title}</h2><button onClick={onClose} className="ms-auto grid size-9 place-items-center rounded-full bg-mist" aria-label="סגירה"><X className="size-5" /></button></div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function SpotSheet({ open, onClose, onManage }: { open: boolean; onClose: () => void; onManage: () => void }) {
  const S = api.S;
  return (
    <Sheet open={open} onClose={onClose} title="בחירת חוף">
      <ul className="space-y-1.5">
        {api.SPOTS.map((s: any) => (
          <li key={s.id}>
            <button onClick={() => { E.update({ spotId: s.id, terrain: null, hourSel: "best" }); onClose(); }}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-right ring-1 ${s.id === S.spotId ? "bg-sky-50 ring-sky-300" : "ring-line hover:bg-mist"}`}>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-mist"><Navigation className="size-4 text-sky-700" style={{ transform: `rotate(${s.facing}deg)` }} /></span>
              <span className="min-w-0 flex-1"><b className="block truncate text-[15px]">{s.name}</b><span className="text-[12.5px] text-ink-soft">{E.TERRAIN_HE[s.terrain]} · פונה {E.windCalculator.compassHe(s.facing)}{s.verified === false ? " · מיקום משוער" : ""}</span></span>
            </button>
          </li>
        ))}
      </ul>
      <button onClick={() => { onClose(); onManage(); }} className="mt-4 w-full rounded-2xl bg-mist py-3 text-[14px] font-semibold">הוספה ועריכה של חופים</button>
    </Sheet>
  );
}

/** 7-day selector with the best score of the day for the current context */
export function DateStrip({ sport }: { sport?: SportId | SportId[] }) {
  const S = api.S;
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1">
      {S.dates.map((d: string, i: number) => {
        const list = dayOf(i); let top = 0, icon = "";
        const ids = !sport ? [] : Array.isArray(sport) ? sport : [sport];
        ids.forEach(id => { const c = candidates(id, list, i); const v = c.length ? Math.max(...c.map((a: any) => scoreAt(a, id))) : 0; if (v > top) { top = v; icon = id; } });
        const on = i === S.dateIdx;
        return (
          <button key={d} onClick={() => E.update({ dateIdx: i, hourSel: "best" })} aria-pressed={on}
            className={`flex min-w-[66px] shrink-0 flex-col items-center rounded-2xl px-2.5 py-2 transition-all active:scale-95 ${on ? "bg-sport text-white shadow-lg" : "bg-white ring-1 ring-line"}`}>
            <span className="text-[13px] font-bold">{dayName(i)}</span>
            <span className={`num text-[11.5px] ${on ? "text-white/80" : "text-ink-soft"}`}>{shortDate(d)}</span>
            {ids.length > 0 && <span className="num mt-1 rounded-full px-2 text-[12px] font-bold" style={on ? { background: "rgba(255,255,255,.25)" } : { color: scoreColor(top), background: `color-mix(in srgb, ${scoreColor(top)} 12%, white)` }}>{top}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** hour-by-hour strip: bar = score, arrow = wind, tap to focus an hour */
export function HourStrip({ sport, knots = false }: { sport: SportId; knots?: boolean }) {
  const S = api.S, list = dayOf(), ref = useRef<HTMLDivElement>(null);
  const today = isToday(), nowH = E.localHour();
  const cand = new Set(candidates(sport, list));
  const best = [...cand].map((a: any) => ({ a, s: scoreAt(a, sport) })).sort((p, q) => q.s - p.s).slice(0, 3).map(x => x.a);
  useEffect(() => { const el = ref.current?.querySelector("[data-focus='1']") as HTMLElement | null; el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" }); }, [S.dateIdx, S.hourSel, S.spotId]);
  const focusH = S.hourSel === "best" ? best[0]?.h.hour : +S.hourSel;
  return (
    <div className="rounded-3xl bg-white p-3 ring-1 ring-line/70">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[13px] font-bold">שעה אחר שעה</span>
        <button onClick={() => E.update({ hourSel: "best" })} className={`rounded-full px-3 py-1 text-[12.5px] font-semibold ${S.hourSel === "best" ? "bg-sport text-white" : "bg-mist text-ink-soft"}`}>השעות הכי טובות</button>
      </div>
      <div ref={ref} className="no-scrollbar flex gap-1 overflow-x-auto pb-1">
        {list.map((a: any) => {
          const s = scoreAt(a, sport), past = today && a.h.hour < nowH, focus = a.h.hour === focusH, isBest = best.includes(a);
          const dark = !E.isDaylight(a.h);
          return (
            <button key={a.h.hour} data-focus={focus ? "1" : "0"} onClick={() => E.update({ hourSel: String(a.h.hour) })}
              className={`flex w-[46px] shrink-0 flex-col items-center gap-1 rounded-2xl py-1.5 transition-all ${focus ? "bg-sport-soft ring-2 ring-[color:var(--c1)]" : "hover:bg-mist"} ${past ? "opacity-40" : ""}`}
              aria-label={`${hhmm(a.h.min)} ציון ${s}`}>
              <span className="num text-[11px] font-semibold text-ink-soft">{String(a.h.hour).padStart(2, "0")}</span>
              <div className="relative flex h-16 w-3.5 items-end overflow-hidden rounded-full bg-mist">
                <motion.div className="w-full rounded-full" initial={{ height: 0 }} animate={{ height: `${Math.max(6, s)}%` }} transition={{ duration: .5 }} style={{ background: scoreColor(s) }} />
              </div>
              <span className="num text-[11.5px] font-bold" style={{ color: scoreColor(s) }}>{s}</span>
              <Navigation className="size-3.5 text-ink-soft" style={{ transform: `rotate(${(a.h.windDir ?? 0) + 180}deg)` }} />
              <span className="num text-[10.5px] text-ink-soft">{knots ? fmt(kn(a.h.windSpeed), 0) : fmt(a.h.windSpeed, 0)}</span>
              <span className="text-[10px]">{isBest ? "⭐" : dark ? "🌙" : ""}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-1 px-1 text-[11.5px] text-ink-soft">עמודה = ציון · חץ = לאן הרוח נושבת · מספר = רוח ב{knots ? "קשרים" : "קמ״ש"}</p>
    </div>
  );
}

/** animated hero with the sport's colors */
export function Hero({ kind, c1, c2, children, tall = false }: { kind: SportId | "home"; c1: string; c2: string; children: ReactNode; tall?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .45 }}
      className={`relative isolate overflow-hidden rounded-[30px] text-white shadow-[0_18px_40px_-18px_rgba(12,36,50,.55)] ${tall ? "min-h-[300px]" : "min-h-[250px]"}`}>
      <Scene kind={kind} c1={c1} c2={c2} className="absolute inset-0 -z-10 size-full sm:hidden" />
      <Scene kind={kind} c1={c1} c2={c2} wide className="absolute inset-0 -z-10 hidden size-full sm:block" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_left,rgba(0,0,0,.28),transparent_55%)]" />
      {children}
    </motion.div>
  );
}

export function SportHeroBody({ sport, score, headline, sub, chips }: { sport: SportId; score: number; headline: string; sub: ReactNode; chips?: ReactNode }) {
  return (
    <div className="flex h-full min-h-[inherit] flex-col justify-end gap-3 p-5">
      <div className="flex items-end gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-white/85">{SPORTS[sport].tagline}</div>
          <h1 className="mt-0.5 text-[28px] font-extrabold leading-tight drop-shadow-sm sm:text-[34px]">{headline}</h1>
          <div className="mt-1 text-[14.5px] text-white/90">{sub}</div>
        </div>
        <div className="rounded-full bg-black/15 p-1 backdrop-blur-sm"><ScoreRing score={score} size={104} light /></div>
      </div>
      {chips && <div className="flex flex-wrap gap-2">{chips}</div>}
    </div>
  );
}
export const GlassChip = ({ children }: { children: ReactNode }) => <span className="glass rounded-full px-3 py-1 text-[12.5px] font-semibold">{children}</span>;
