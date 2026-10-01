import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Compass, Droplets, Gauge, Lightbulb, Navigation, ShieldAlert, Sun, Sunrise, Thermometer, Waves, Wind, Backpack, CloudSun, History } from "lucide-react";
import { api, E, dayOf, focusHour, bestOf, hhmm, fmt, kn, dayName, shortDate, ltr } from "../lib";
import { SPORTS, scoreColor, verdict, type SportId } from "../theme/sports";
import { Hero, SportHeroBody, GlassChip, DateStrip, HourStrip, type Route } from "../components/layout";
import { Card, Metric, Segmented, Alert, Why, Checklist, Html, Tips, KV, ScorePill } from "../components/ui";

/* מדד לפי מפתח – אותם מפתחות שהמנוע מגדיר לכל ענף */
export function MetricByKey({ k, a }: { k: string; a: any }) {
  const h = a.h;
  switch (k) {
    case "wave": return <Metric icon={<Waves className="size-3.5" />} label="גלים" value={fmt(h.waveH, 1)} unit="מ׳" sub={`אפקטיבי ${fmt(a.wp.heff, 2)} · ${fmt(h.wavePeriod, 1)} ש׳`} />;
    case "swell": return <Metric icon={<Waves className="size-3.5" />} label="סוול" value={fmt(h.swellH, 1)} unit="מ׳" sub={`${fmt(h.swellPeriod, 0)} ש׳ · ${E.windCalculator.compassHe(h.swellDir ?? h.waveDir)}`} />;
    case "wind": return <Metric icon={<Wind className="size-3.5" />} label="רוח" value={fmt(h.windSpeed, 0)} unit="קמ״ש" sub={`משבים ${fmt(h.gust, 0)} · ${fmt(kn(h.windSpeed), 0)} קשר`} />;
    case "windKn": return <Metric icon={<Wind className="size-3.5" />} label="רוח" value={fmt(kn(h.windSpeed), 0)} unit="קשר" sub={`${fmt(h.windSpeed, 0)} קמ״ש`} />;
    case "gust": return <Metric icon={<Gauge className="size-3.5" />} label="משבים" value={fmt(kn(h.gust), 0)} unit="קשר" sub={`פער ${fmt(kn(h.gust) - kn(h.windSpeed), 0)} קשר`} />;
    case "rel": return <Metric icon={<Navigation className="size-3.5" style={{ transform: `rotate(${(h.windDir ?? 0) + 180}deg)` }} />} label="ביחס לחוף" value={<span className="font-display text-[18px]">{E.REL_HE[a.rel.cls]}</span>} sub={`${E.windCalculator.compassHe(h.windDir)} · ${fmt(h.windDir, 0, "°")}`} />;
    case "sst": return <Metric icon={<Droplets className="size-3.5" />} label="מים" value={`${fmt(h.sst, 1)}°`} sub={E.wetsuitFor(h.sst)} />;
    case "feels": return <Metric icon={<Thermometer className="size-3.5" />} label="מרגיש כמו" value={`${fmt(h.feels, 0)}°`} sub={`${fmt(h.temp, 0)}° · לחות ${fmt(h.hum, 0)}%`} />;
    case "uv": return <Metric icon={<Sun className="size-3.5" />} label="UV" value={fmt(h.uv, 0)} sub={E.uvLabel(h.uv)} tone={(h.uv ?? 0) >= 8 ? "#e11d48" : undefined} />;
    case "sky": return <Metric icon={<CloudSun className="size-3.5" />} label="שמיים" value={`${fmt(h.cloud, 0)}%`} sub={(h.precip ?? 0) > 0.1 ? `גשם ${fmt(h.precip, 1)} מ״מ` : "בלי גשם"} />;
    case "calm24": return <Metric icon={<History className="size-3.5" />} label="ים ב-24 ש׳" value={fmt(h.maxWave24, 1)} unit="מ׳" sub={(h.maxWave24 ?? 1) < 0.3 ? "צפוי צלול" : (h.maxWave24 ?? 1) < 0.5 ? "ראות בינונית" : "צפוי עכור"} />;
    case "sun": return <Metric icon={<Sunrise className="size-3.5" />} label="זריחה · שקיעה" value={<span className="text-[18px]">{h.sunriseStr} · {h.sunsetStr}</span>} sub={E.PHASE_HE[a.phase]} />;
    default: return null;
  }
}

export function SportScreen({ id, go, tab: tab0 }: { id: SportId; go: (r: Route) => void; tab?: string }) {
  const [tab, setTab] = useState<"now" | "week" | "guide">((tab0 as any) || "now");
  const S = api.S, list = dayOf(), meta = SPORTS[id], act = E.ACT[id];
  const f = focusHour(id, list);
  if (!f) return <div className="py-24 text-center text-ink-soft">אין נתונים ליום הזה.</div>;
  const { a, win } = f, h = a.h, r = a.acts[id], sc = r.score;
  const when = ({ goldenMorning: "בוקר", goldenEvening: "ערב", day: "יום", midday: "צהריים", night: "לילה" } as any)[a.phase];
  const ex = E.expertAdvice(id, a), pack = E.actPack(id, a, win), checked = api.CHECKS["act_" + id] || {};
  const calmDir = (h.windSpeed ?? 0) < (act.minDirKmh ?? 0), zone = calmDir ? "good" : act.zone(a.rel.abs ?? 90);
  return (
    <div className="space-y-4" style={{ ["--c1" as any]: meta.c1, ["--c2" as any]: meta.c2 }}>
      <Hero kind={id} c1={meta.c1} c2={meta.c2}>
        <SportHeroBody sport={id} score={sc} headline={meta.name}
          sub={<>{when} {verdict(sc)} · {f.picked ? "השעה שבחרת" : "השעות הטובות"} <b className="num" dir="ltr">{hhmm(win.from)}–{hhmm(win.to)}</b></>}
          chips={<>
            <GlassChip>{dayName(S.dateIdx)} {shortDate(h.date)}</GlassChip>
            <GlassChip>רוח {E.REL_HE[a.rel.cls]} · {act.knots ? `${fmt(kn(h.windSpeed), 0)} קשר` : `${fmt(h.windSpeed, 0)} קמ״ש`}</GlassChip>
            <GlassChip>{calmDir ? "רוח חלשה – הכיוון לא משנה" : zone === "good" ? "כיוון טוב" : zone === "ok" ? "כיוון סביר" : "כיוון בעייתי"}</GlassChip>
          </>} />
      </Hero>

      <DateStrip sport={id} />
      <HourStrip sport={id} knots={!!act.knots} />
      <Segmented value={tab} onChange={setTab} options={[["now", "עכשיו"], ["week", "השבוע"], ["guide", "מדריך"]]} />

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .2 }} className="space-y-4">
          {tab === "now" && <>
            {r.alerts.map((x: any, i: number) => <Alert key={i} level={x.lvl === "bad" ? "bad" : "warn"}>{x.lvl === "bad" ? "⚠️ " : ""}{x.text}</Alert>)}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">{act.metrics.map((k: string) => <MetricByKey key={k} k={k} a={a} />)}</div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card title="הרוח ביחס לחוף" sub={`${api.SPOTS.find((s: any) => s.id === S.spotId)?.name} פונה ${E.windCalculator.compassHe(api.SPOTS.find((s: any) => s.id === S.spotId)?.facing)}`} icon={<Compass className="size-4.5" />}>
                <Html html={E.windDiagram(id, a)} className="mx-auto max-w-[300px] [&>svg]:h-auto [&>svg]:w-full" />
                <p className="mt-2 text-[13px] text-ink-soft">החץ מראה מאיפה הרוח מגיעה. הים למעלה, החוף למטה, והצבעים מסמנים אילו כיווני רוח טובים ל{meta.name}.</p>
              </Card>
              <Card title="המלצת מומחה" icon={<Lightbulb className="size-4.5" />}>
                <KV rows={ex.rows} />
                <div className="mt-3"><Tips items={ex.tips} /></div>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card title="מה לקחת" icon={<Backpack className="size-4.5" />}>
                <Checklist items={pack} checked={checked} onToggle={(k, v) => api.setChecks("act_" + id, { ...checked, [k]: v })} onReset={() => api.setChecks("act_" + id, null)} />
              </Card>
              <Card><Why items={r.items} title={`למה ${sc}?`} open /></Card>
            </div>
          </>}

          {tab === "week" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {S.dates.map((d: string, i: number) => {
                const w = bestOf(id, dayOf(i), i); if (!w) return null; const b = w.best, rr = b.acts[id];
                return (
                  <button key={d} onClick={() => { E.update({ dateIdx: i, hourSel: "best" }); setTab("now"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className={`flex items-center gap-3 rounded-3xl bg-white p-4 text-right ring-1 ${i === S.dateIdx ? "ring-2 ring-[color:var(--c1)]" : "ring-line/70"}`}>
                    <div className="grid size-14 shrink-0 place-items-center rounded-2xl font-display text-[20px] font-extrabold text-white" style={{ background: scoreColor(w.score) }}>{w.score}</div>
                    <div className="min-w-0 flex-1">
                      <b className="text-[15.5px]">{dayName(i)} <span className="num text-[12.5px] font-normal text-ink-soft">{shortDate(d)}</span></b>
                      <div className="text-[13.5px]">{verdict(w.score)} · <span className="num" dir="ltr">{hhmm(w.from)}–{hhmm(w.to)}</span></div>
                      <div className="truncate text-[12.5px] text-ink-soft">{act.knots ? `${fmt(kn(b.h.windSpeed), 0)} קשר` : `${fmt(b.h.windSpeed, 0)} קמ״ש`} {E.REL_HE[b.rel.cls]} · גל {fmt(b.h.waveH, 1)} מ׳ · {fmt(b.h.feels, 0)}°{rr.alerts[0] ? ` · ${rr.alerts[0].text}` : ""}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {tab === "guide" && <>
            <Card title={`תנאים אידיאליים ל${meta.name}`} icon={<Lightbulb className="size-4.5" />}>
              <p className="mb-3 text-[14.5px]">{act.desc}</p>
              <Tips items={act.ideal} />
            </Card>
            <Card title="בטיחות" icon={<ShieldAlert className="size-4.5" />}>
              <Tips items={safetyFor(id)} />
            </Card>
          </>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function safetyFor(id: string): string[] {
  const base = ["סופת רעמים – יוצאים מהמים ומהחוף הפתוח מיד."];
  const m: Record<string, string[]> = {
    surf: ["זרם חוזר ליד שוברי גלים וסלעים – שם הוא הכי חזק.", "לא גולשים לבד בים גבוה. leash תמיד."],
    kite: ["לעולם לא ברוח מהיבשה בלי סירת חילוץ.", "הזנקה ונחיתה עם עזרה, 30 מ׳ ממכשולים ומאנשים.", "בדוק את מנגנון השחרור לפני כל יציאה."],
    windsurf: ["רוח מהיבשה – נשארים קרוב לחוף.", "משבים חזקים – מפרש קטן יותר."],
    sup: ["רוח מהיבשה היא הסכנה הגדולה – דוחפת החוצה.", "leash ואפוד ציפה תמיד."],
    kayak: ["אפוד ציפה ומשרוקית.", "יוצאים נגד הרוח וחוזרים איתה."],
    footvolley: ["חימום קרסוליים וברכיים – חול רך מעמיס.", "חול לוהט בצהרי קיץ – משחקים בבוקר או אחרי 16:00.", "שתייה כל 15–20 דקות בחום."],
    volleyball: ["חול לוהט – גרבי חול.", "שתייה והפסקות בצל."],
    matkot: ["לשחק הרחק מהמתרחצים.", "שתייה וכובע בשעות החמות."],
    swim: ["רק בחוף מוכרז בשעות ההצלה. דגל שחור – אסור; אדום – מסוכן; לבן – מותר.", "זרם חוזר: שוחים במקביל לחוף עד שהוא נחלש."],
    snorkel: ["מצוף סימון בולט – סירות ואופנועי ים לא רואים שנורקלים.", "לא צוללים לבד."],
    beach: ["צל בין 11:00 ל-15:00 וקרם 50.", "ילדים במים רק ליד מציל ובהשגחה צמודה."],
  };
  return [...(m[id] || []), ...base];
}
