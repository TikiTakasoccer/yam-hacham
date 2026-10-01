import { motion } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { api, E, dayOf, bestOf, mySports, hhmm, dayName, ltr } from "../lib";
import { CATEGORIES, SPORTS, scoreColor, verdict, type SportId } from "../theme/sports";
import { Hero, DateStrip, type Route } from "../components/layout";
import { ScoreRing } from "../components/ui";

export function CategoryScreen({ id, go }: { id: string; go: (r: Route) => void }) {
  const c = CATEGORIES.find(x => x.id === id)!, S = api.S, list = dayOf();
  const ids = c.sports.filter(s => mySports().includes(s)).length ? c.sports.filter(s => mySports().includes(s)) : c.sports;
  const rows = ids.map(sid => {
    const w = bestOf(sid, list);
    const r = w && sid !== "fishing" ? w.best.acts[sid] : null;
    const reason = r ? (r.alerts[0]?.text || [...r.items].sort((p: any, q: any) => (w!.score < 65 ? p.pts - q.pts : q.pts - p.pts))[0]?.label) : w ? `${api.TECH[E.methodOf(w.best, "auto")].name}` : "";
    return { sid, w, reason };
  }).sort((p, q) => (q.w?.score ?? 0) - (p.w?.score ?? 0));
  return (
    <div className="space-y-5" style={{ ["--c1" as any]: c.c1, ["--c2" as any]: c.c2 }}>
      <Hero kind={ids[0]} c1={c.c1} c2={c.c2}>
        <div className="flex min-h-[inherit] flex-col justify-end p-5">
          <div className="text-[13px] font-semibold text-white/85">{c.tagline}</div>
          <h1 className="text-[32px] font-extrabold leading-tight sm:text-[40px]">{c.name}</h1>
          <p className="text-[14.5px] text-white/90">{dayName(S.dateIdx)} · {api.SPOTS.find((s: any) => s.id === S.spotId)?.name}</p>
        </div>
      </Hero>
      <DateStrip sport={ids} />
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map(({ sid, w, reason }, i) => (
          <motion.button key={sid} onClick={() => go({ screen: "sport", id: sid })} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .06 }} whileTap={{ scale: .98 }}
            style={{ ["--c1" as any]: SPORTS[sid].c1, ["--c2" as any]: SPORTS[sid].c2 }}
            className="flex items-center gap-4 rounded-3xl bg-white p-4 text-right shadow-[0_8px_24px_-14px_rgba(12,36,50,.35)] ring-1 ring-line/70">
            <span className="bg-sport h-full min-h-[92px] w-2 shrink-0 self-stretch rounded-full" />
            <div className="min-w-0 flex-1">
              <b className="block font-display text-[19px] font-extrabold text-sport">{SPORTS[sid].name}</b>
              {w && <div className="text-[13.5px] font-semibold">{verdict(w.score)} · <span className="num">{ltr(`${hhmm(w.from)}–${hhmm(w.to)}`)}</span></div>}
              <div className="mt-1 line-clamp-2 text-[13px] text-ink-soft">{ltr(reason || "")}</div>
              <div className="mt-2 flex gap-1">
                {S.dates.map((_: string, k: number) => { const ww = bestOf(sid, dayOf(k), k); const s = ww ? ww.score : 0; return <span key={k} className={`h-1.5 flex-1 rounded-full ${k === S.dateIdx ? "ring-2 ring-offset-1 ring-[color:var(--c1)]" : ""}`} style={{ background: scoreColor(s) }} />; })}
              </div>
            </div>
            {w && <ScoreRing score={w.score} size={78} stroke={8} label={false} />}
            <ChevronLeft className="size-5 shrink-0 text-ink-soft" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
