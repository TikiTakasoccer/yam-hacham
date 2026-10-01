import { motion } from "motion/react";
import { Droplets, Navigation, Sun, Sunrise, Thermometer, Waves, Wind } from "lucide-react";
import { api, E, dayOf, nowHour, bestOf, mySports, hhmm, fmt, kn, greeting, dayName, shortDate, ltr } from "../lib";
import { CATEGORIES, SPORTS, scoreColor, verdict, type SportId } from "../theme/sports";
import { Hero, DateStrip, type Route } from "../components/layout";
import { Scene } from "../components/Scene";
import { Card, ScorePill } from "../components/ui";

export function Home({ go }: { go: (r: Route) => void }) {
  const S = api.S, list = dayOf(), mine = mySports();
  if (!list.length) return <div className="py-24 text-center text-ink-soft">מושך תחזית ים ורוח…</div>;
  const a = nowHour(list), h = a.h, sp = api.SPOTS.find((s: any) => s.id === S.spotId);
  const scored = mine.map(id => ({ id, s: id === "fishing" ? E.scoreOf(a, "auto") : E.actScore(a, id), w: bestOf(id, list) }));
  const top = scored.filter(x => x.s >= 65).sort((p, q) => q.s - p.s).slice(0, 4);
  const cats = CATEGORIES.map(c => {
    const ids = c.sports.filter(id => mine.includes(id));
    const best = ids.map(id => ({ id, w: bestOf(id, list) })).filter(x => x.w).sort((p, q) => q.w!.score - p.w!.score)[0];
    return { c, ids, best };
  }).filter(x => x.ids.length);
  const hour = h.hour, sky = hour < 5 || hour >= 20 ? ["#0f172a", "#1e3a8a"] : hour < 8 ? ["#f97316", "#38bdf8"] : hour < 17 ? ["#0284c7", "#7dd3fc"] : ["#ea580c", "#7c3aed"];
  return (
    <div className="space-y-5">
      <Hero kind="home" c1={sky[0]} c2={sky[1]} tall>
        <div className="flex min-h-[inherit] flex-col justify-between gap-4 p-5">
          <div>
            <div className="text-[14px] font-semibold text-white/85">{greeting()} · {dayName(S.dateIdx)} {shortDate(h.date)} · {hhmm(h.min)}</div>
            <h1 className="mt-1 text-[30px] font-extrabold leading-tight sm:text-[38px]">{sp?.name}</h1>
            <p className="text-[15px] text-white/90">הרוח {E.REL_HE[a.rel.cls]} · {E.windCalculator.compassHe(h.windDir)} · {a.moon.icon} {a.moon.name}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {[
              [<Wind key="w" className="size-4" />, "רוח", `${fmt(h.windSpeed, 0)}`, `קמ״ש · ${fmt(kn(h.windSpeed), 0)} קשר`],
              [<Navigation key="n" className="size-4" style={{ transform: `rotate(${(h.windDir ?? 0) + 180}deg)` }} />, "מאיפה", E.REL_HE[a.rel.cls], `משבים ${fmt(h.gust, 0)}`],
              [<Waves key="g" className="size-4" />, "גלים", `${fmt(h.waveH, 1)}`, `מ׳ · ${fmt(h.wavePeriod, 0)} ש׳`],
              [<Droplets key="d" className="size-4" />, "מים", `${fmt(h.sst, 0)}°`, E.wetsuitFor(h.sst)],
              [<Thermometer key="t" className="size-4" />, "מרגיש", `${fmt(h.feels, 0)}°`, `לחות ${fmt(h.hum, 0)}%`],
              [<Sun key="s" className="size-4" />, "UV", `${fmt(h.uv, 0)}`, E.uvLabel(h.uv)],
            ].map(([ic, k, v, sub], i) => (
              <div key={i} className="glass rounded-2xl p-2.5">
                <div className="flex items-center gap-1 text-[11.5px] font-semibold text-white/85">{ic}{k}</div>
                <div className="num mt-0.5 truncate text-[19px] font-semibold leading-tight">{v}</div>
                <div className="truncate text-[11px] text-white/80">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </Hero>

      <DateStrip sport={mine} />

      {top.length > 0 ? (
        <div>
          <h2 className="mb-2 text-[18px] font-extrabold">מה הכי מתאים עכשיו</h2>
          <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
            {top.map(t => (
              <button key={t.id} onClick={() => go({ screen: "sport", id: t.id })} style={{ ["--c1" as any]: SPORTS[t.id].c1, ["--c2" as any]: SPORTS[t.id].c2 }}
                className="bg-sport flex shrink-0 items-center gap-3 rounded-2xl py-2.5 ps-4 pe-3 text-white shadow-md active:scale-95">
                <span className="text-right"><b className="block text-[15px]">{SPORTS[t.id].name}</b><span className="text-[12px] text-white/85">{verdict(t.s)} עכשיו</span></span>
                <span className="num grid size-10 place-items-center rounded-full bg-white/25 text-[15px] font-bold">{t.s}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white px-4 py-3 text-[14px] text-ink-soft ring-1 ring-line">אף ענף לא מקבל ציון טוב בשעה הזאת. בכל קטגוריה מופיע החלון הטוב של היום.</div>
      )}

      <div>
        <h2 className="mb-2 text-[18px] font-extrabold">במה מתעניינים היום?</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {cats.map(({ c, ids, best }, i) => (
            <motion.button key={c.id} onClick={() => ids.length === 1 ? go({ screen: "sport", id: ids[0] }) : go({ screen: "category", id: c.id })}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .05 }} whileTap={{ scale: .97 }}
              className="group relative isolate flex min-h-[170px] flex-col justify-end overflow-hidden rounded-[26px] p-3.5 text-right text-white shadow-[0_14px_30px_-16px_rgba(12,36,50,.6)] sm:min-h-[200px]">
              <Scene kind={SPORTS[ids[0]] ? (ids[0] as SportId) : "home"} c1={c.c1} c2={c.c2} className="absolute inset-0 -z-10 size-full transition-transform duration-500 group-hover:scale-105" sun={false} />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              {best && <span className="num absolute top-3 left-3 grid size-11 place-items-center rounded-full bg-white text-[16px] font-extrabold shadow" style={{ color: scoreColor(best.w!.score) }}>{best.w!.score}</span>}
              <b className="font-display text-[20px] font-extrabold leading-tight">{c.name}</b>
              <span className="text-[12.5px] text-white/85">{c.tagline}</span>
              {best && <span className="mt-1.5 text-[12px] font-semibold text-white/95">{SPORTS[best.id].short} · <span dir="ltr" className="num">{hhmm(best.w!.from)}–{hhmm(best.w!.to)}</span></span>}
            </motion.button>
          ))}
        </div>
      </div>

      <Card title="השבוע במבט" sub="הציון הטוב בכל יום · לחיצה על ענף פותחת אותו" action={<button onClick={() => go({ screen: "week" })} className="text-[13px] font-semibold text-sky-700">לכל השבוע</button>}>
        <div className="space-y-2">
          {mine.slice(0, 5).map(id => (
            <button key={id} onClick={() => go({ screen: "sport", id })} className="flex w-full items-center gap-2">
              <span className="w-24 shrink-0 truncate text-right text-[13.5px] font-semibold">{SPORTS[id].short}</span>
              <span className="flex flex-1 gap-1">
                {S.dates.map((_: string, i: number) => { const w = bestOf(id, dayOf(i), i); const s = w ? w.score : 0; return <span key={i} className="h-7 flex-1 rounded-lg" style={{ background: `color-mix(in srgb, ${scoreColor(s)} ${20 + s * .6}%, white)` }} title={`${dayName(i)} ${s}`} />; })}
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
