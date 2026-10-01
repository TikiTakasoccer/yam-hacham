import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Anchor, Backpack, Crosshair, Fish, Lightbulb, ListOrdered, MapPinned, Moon, Sparkles, Waves, Wrench } from "lucide-react";
import { api, E, dayOf, focusHour, hhmm, fmt, kn, dayName, shortDate, ltr, isToday } from "../lib";
import { SPORTS, scoreColor, verdict } from "../theme/sports";
import { Hero, SportHeroBody, GlassChip, DateStrip, HourStrip, type Route } from "../components/layout";
import { Card, Segmented, Alert, Why, Checklist, Html, Tips, KV, Chip, ScorePill, Metric } from "../components/ui";
import { MetricByKey } from "./Sport";
import { LogPanel } from "./Log";

const PH: any = { goldenMorning: "בוקר", goldenEvening: "ערב", day: "יום", midday: "צהריים", night: "לילה" };

export function FishingScreen({ go, tab: tab0 }: { go: (r: Route) => void; tab?: string }) {
  const [tab, setTab] = useState<string>(tab0 || "now");
  const S = api.S, list = dayOf(), meta = SPORTS.fishing;
  const f = focusHour("fishing", list);
  if (!f) return <div className="py-24 text-center text-ink-soft">אין נתונים ליום הזה.</div>;
  const { a, win } = f, h = a.h, id = E.methodOf(a, S.method), t = api.TECH[id], ov = E.scoreOf(a, S.method), sf = a.safety;
  const terrain = S.terrain || api.SPOTS.find((s: any) => s.id === S.spotId)?.terrain;
  const myTechs = (api.PREFS.techs || []).filter((x: string) => api.TECH[x]).length ? api.PREFS.techs.filter((x: string) => api.TECH[x]) : api.TECHS.map((x: any) => x.id);
  return (
    <div className="space-y-4" style={{ ["--c1" as any]: meta.c1, ["--c2" as any]: meta.c2 }}>
      <Hero kind="fishing" c1="#1e3a8a" c2="#f59e0b">
        <SportHeroBody sport="fishing" score={ov} headline={t.name}
          sub={<>{PH[a.phase]} {verdict(ov)} · {f.picked ? "השעה שבחרת" : "השעות הטובות"} <b className="num" dir="ltr">{hhmm(win.from)}–{hhmm(win.to)}</b></>}
          chips={<><GlassChip>{E.TERRAIN_HE[terrain]}</GlassChip><GlassChip>בטיחות {sf.score}</GlassChip><GlassChip>{a.moon.icon} {a.moon.name}</GlassChip></>} />
      </Hero>

      <div className="space-y-2">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          <Chip active={S.method === "auto"} onClick={() => E.update({ method: "auto" })}>✨ הכי מתאים</Chip>
          {myTechs.map((x: string) => <Chip key={x} active={S.method === x} onClick={() => E.update({ method: x })}>{api.TECH[x].name}</Chip>)}
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {Object.entries(E.TERRAIN_HE).map(([k, v]: any) => <button key={k} onClick={() => E.update({ terrain: k })} className={`shrink-0 rounded-full px-3 py-1 text-[12.5px] font-semibold ${terrain === k ? "bg-ink text-white" : "bg-white text-ink-soft ring-1 ring-line"}`}>{v}</button>)}
        </div>
      </div>

      <DateStrip sport="fishing" />
      <HourStrip sport="fishing" />
      <Segmented value={tab} onChange={setTab} options={[["now", "עכשיו"], ["days", "היום ומחר"], ["week", "השבוע"], ["gear", "ציוד וריגים"], ["log", "יומן"]]} />

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .2 }} className="space-y-4">
          {tab === "now" && <FishingNow a={a} win={win} id={id} />}
          {tab === "days" && <FishingDays go={go} setTab={setTab} />}
          {tab === "week" && <FishingWeek setTab={setTab} />}
          {tab === "gear" && <FishingGear a={a} />}
          {tab === "log" && <LogPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FishingNow({ a, win, id }: { a: any; win: any; id: string }) {
  const S = api.S, h = a.h, t = api.TECH[id], sf = a.safety, adv = E.techAdvice(id, a), plan = E.sessionPlan(win, id), ck = E.checklist(id, win), checked = api.CHECKS[id] || {};
  const rk = E.rankTechs(a), tg = E.speciesFor(a, id), second = rk.find((r: any) => r.id !== id);
  return <>
    {(sf.level === "bad" || sf.warnAbs) && <Alert level="bad">⚠️ תנאי הדיג יכולים להיות פעילים, אבל הים לא מומלץ לעמידה ב{E.TERRAIN_HE[a.terrain]}. בטיחות {sf.score}.</Alert>}
    {sf.level === "warn" && <Alert level="warn">זהירות: {sf.items.filter((i: any) => i.pts < 0).map((i: any) => i.label).join(" · ")}</Alert>}

    <Card title="השיטות שלך עכשיו" sub="לחיצה בוחרת שיטה" icon={<Sparkles className="size-4.5" />}>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {rk.map((r: any) => (
          <button key={r.id} onClick={() => E.update({ method: r.id })} className={`grid grid-cols-[8.5rem_1fr_2.5rem] items-center gap-3 rounded-xl px-2 py-1.5 text-right ${r.id === id ? "bg-sport-soft ring-1 ring-[color:var(--c1)]" : "hover:bg-mist"}`}>
            <span className="truncate text-[14px] font-semibold">{r.t.name}</span>
            <span className="h-2 overflow-hidden rounded-full bg-mist"><motion.span className="block h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${r.score}%` }} style={{ background: scoreColor(r.score) }} /></span>
            <span className="num text-left text-[13px] font-bold" style={{ color: scoreColor(r.score) }}>{r.score}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 rounded-2xl bg-mist/70 px-3 py-2.5 text-[14px]">{ltr(adv.retrieve)}</p>
    </Card>

    <UseCard a={a} id={id} />

    <div className="grid gap-4 md:grid-cols-2">
      <Card title="תוכנית הדיג" sub={<span>{t.name} · <span dir="ltr" className="num">{hhmm(win.from)}–{hhmm(win.to)}</span></span>} icon={<ListOrdered className="size-4.5" />}>
        <ol className="space-y-3">
          {plan.map((p: any, i: number) => (
            <li key={i} className="flex gap-3">
              <span className="bg-sport num grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-bold text-white">{i + 1}</span>
              <div><b className="block text-[14.5px]">{p.t}</b><span className="text-[13.5px] text-ink-soft">{ltr(p.d)}</span></div>
            </li>
          ))}
        </ol>
      </Card>
      <Card title="ציוד וריג" sub="המלצה התחלתית בהתאם לתנאים" icon={<Wrench className="size-4.5" />}>
        <KV rows={[["חכה", t.gear.rod], ["סליל", t.gear.reel], ["חוט", t.gear.line], ["לידר", t.gear.leader], ...adv.rows.filter((r: any) => r[0] !== "ריג")]} />
        <RigBlock rig={adv.rig} extra={adv.rigWhy} />
      </Card>
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <Card title="מה לקחת" icon={<Backpack className="size-4.5" />}>
        <Checklist items={ck} checked={checked} onToggle={(k, v) => api.setChecks(id, { ...checked, [k]: v })} onReset={() => api.setChecks(id, null)} />
      </Card>
      <div className="space-y-4">
        <Card title="איפה לזרוק" sub={`${E.TERRAIN_HE[a.terrain]} · רוח ${E.WIND_CLS_HE[a.wind.cls]}`} icon={<Crosshair className="size-4.5" />}><Tips items={E.readTips(a)} /></Card>
        <Card title="מה לטרגט" sub="התאמה לתנאים – לא הבטחה לדג" icon={<Fish className="size-4.5" />}>
          <ul className="divide-y divide-line/70">
            {tg.map((s: any) => (
              <li key={s.id} className="flex items-center gap-3 py-2">
                <div className="min-w-0 flex-1"><b className="text-[15px]">{s.sp.nameHebrew}</b> <span className="text-[12px] text-ink-soft">{s.sp.nameEnglish}</span><div className="truncate text-[12.5px] text-ink-soft">{s.why.slice(1).join(" · ")}</div></div>
                <span className={`rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${s.fit === "good" ? "bg-emerald-50 text-emerald-700" : s.fit === "warn" ? "bg-amber-50 text-amber-700" : "bg-mist text-ink-soft"}`}>{s.fitHe}</span>
                <ScorePill score={s.score} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {["wave", "wind", "rel", "sst", "sun"].map(k => <MetricByKey key={k} k={k} a={a} />)}
      <Metric icon={<Moon className="size-3.5" />} label="ירח" value={`${Math.round(a.moon.illum * 100)}%`} sub={`${a.moon.icon} ${a.moon.name}`} />
      <Metric label="לחץ ברומטרי" value={fmt(h.pressure, 0)} unit="hPa" sub={h.pTrend == null ? "—" : h.pTrend <= api.CFG.pressure.fallingHpa3h ? `יורד (${fmt(h.pTrend, 1)})` : h.pTrend >= api.CFG.pressure.risingHpa3h ? `עולה (+${fmt(h.pTrend, 1)})` : "יציב"} />
      <Metric label="זרם" value={fmt(h.current, 1)} unit="קמ״ש" sub="נתון מודל ליד החוף" />
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <Card><Why items={a.tech[id].items} title={`${t.name} – למה ${a.tech[id].score}?`} /></Card>
      <Card><Why items={sf.items} title={`בטיחות – ${sf.score}`} /></Card>
    </div>
  </>;
}

function Art({ html, small }: { html: string; small?: boolean }) {
  return <div className="grid place-items-center rounded-2xl p-2" style={{ background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--c2) 26%, white) 0%, color-mix(in srgb, var(--c1) 8%, white) 80%)" }}><Html html={html} className={`w-full ${small ? "max-w-[170px]" : "max-w-[240px]"} [&>svg]:h-auto [&>svg]:w-full`} /></div>;
}

function UseCard({ a, id }: { a: any; id: string }) {
  const t = api.TECH[id];
  if (t.family === "lure") {
    const picks = E.pickLures(a, id), W = E.techAdvice(id, a).rows.find((r: any) => /משקל|ראש עופרת|גודל אגי/.test(r[0]));
    return (
      <Card title="במה בדיוק להשתמש" sub="דמויים לפי הגל, הרוח, האור והמטרות" icon={<Anchor className="size-4.5" />}>
        <div className="grid gap-3 sm:grid-cols-3">
          {picks.map((p: any, i: number) => (
            <div key={i} className={`flex flex-col gap-2 rounded-2xl p-3 ${i === 0 ? "bg-sport-soft ring-2 ring-[color:var(--c1)]" : "bg-mist/60"}`}>
              <span className="text-[11.5px] font-bold text-sport">{i === 0 ? "הבחירה הראשונה" : p.altVariant ? "צבע חלופי" : `חלופה ${i}`}</span>
              <Art html={E.lureSVG(p.l.draw, p.color)} />
              <b className="text-[15px]">{p.l.name}</b>
              <div className="flex flex-wrap items-center gap-1.5 text-[12.5px]"><Swatch k={p.color} /><span className="text-ink-soft">או</span><Swatch k={p.alt} /></div>
              <KV rows={[["גודל", i === 0 && W ? W[1] : p.l.size], ["עומק", p.l.depth]]} />
              <p className="text-[13px]">{ltr(p.l.work)}</p>
              {p.why.length > 0 && <p className="text-[12.5px] font-semibold text-emerald-700">{p.why.join(" · ")}</p>}
            </div>
          ))}
        </div>
      </Card>
    );
  }
  const picks = E.pickBaits(a, id), p = picks[0], B = E.BAITS[p.b], tg = E.speciesFor(a, id)[0];
  const hook = id === "livebait" ? "מעגלי 2/0–4/0" : (tg?.sp.hook || "#4–#1");
  return (
    <Card title="במה בדיוק להשתמש" sub="פתיון לפי המטרות והתנאים" icon={<Anchor className="size-4.5" />}>
      <div className="grid items-start gap-4 sm:grid-cols-[240px_1fr]">
        <Art html={E.baitSVG(p.b)} />
        <div>
          <span className="text-[11.5px] font-bold text-sport">הפתיון הראשון</span>
          <b className="block font-display text-[21px]">{B.name}</b>
          {p.for.length > 0 && <div className="text-[13px] text-ink-soft">ל{p.for.join(", ")}</div>}
          <div className="mt-2"><KV rows={[["הכנה", B.prep], ["על הקרס", B.hook], ["קרס", hook], ["עמידות", <Dots n={B.dur} key="d" />], ["ריח", <Dots n={B.scent} key="s" />]]} /></div>
          {p.why.length > 0 && <p className="mt-2 text-[12.5px] font-semibold text-emerald-700">{[...new Set(p.why)].join(" · ")}</p>}
        </div>
      </div>
      {picks.length > 1 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {picks.slice(1, 4).map((q: any, i: number) => (
            <div key={i} className="flex flex-col gap-1.5 rounded-2xl bg-mist/60 p-3">
              <span className="text-[11.5px] font-bold text-sport">גיבוי {i + 1}</span>
              <Art html={E.baitSVG(q.b)} small />
              <b className="text-[14.5px]">{E.BAITS[q.b].name}</b>
              <p className="text-[12.5px] text-ink-soft">{E.BAITS[q.b].hook}</p>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 rounded-2xl bg-mist/70 px-3 py-2.5 text-[13.5px]"><b>להכין מהבית: </b>{picks.slice(0, 3).map((q: any) => `${E.BAITS[q.b].name} – ${E.BAITS[q.b].prep}`).join(" · ")}</p>
    </Card>
  );
}
const Dots = ({ n }: { n: number }) => <span className="inline-flex gap-1 align-middle">{[1, 2, 3].map(i => <i key={i} className={`size-2.5 rounded-full ${i <= n ? "bg-sport" : "bg-line"}`} />)}</span>;
const Swatch = ({ k }: { k: string }) => { const c = E.COLORS[k]; return c ? <span className="inline-flex items-center gap-1 font-semibold"><span className="size-3.5 rounded-full ring-1 ring-line" style={{ background: `linear-gradient(${c.back},${c.side} 55%,${c.belly})` }} />{c.name}</span> : null; };

function RigBlock({ rig, extra }: { rig: string; extra?: string }) {
  const R = E.RIGS[rig];
  return (
    <div className="mt-4">
      <b className="font-display text-[15.5px]">{R.name}</b>
      <p className="text-[13px] text-ink-soft">{R.when}{extra ? ` ${extra}` : ""}</p>
      <div className="mt-2 rounded-2xl bg-mist/60 p-2"><Html html={E.rigSVG(rig)} className="mx-auto max-w-[360px] [&>svg]:h-auto [&>svg]:w-full" /></div>
      <ol className="mt-2 list-decimal space-y-1 ps-5 text-[13.5px]">{R.steps.map((s: string, i: number) => <li key={i}>{ltr(s)}</li>)}</ol>
    </div>
  );
}

/* ---- היום ומחר ---- */
function sessions(dateIdx: number) {
  const list = dayOf(dateIdx), today = isToday(dateIdx), nowH = E.localHour(), liveF = (a: any) => !today || a.h.hour >= nowH, S = api.S;
  return ([["goldenMorning", "סשן בוקר", (a: any) => a.phase === "goldenMorning"], ["goldenEvening", "סשן ערב", (a: any) => a.phase === "goldenEvening"], ["night", "לילה אחרי השקיעה", (a: any) => a.phase === "night" && a.h.hour >= 12]] as const)
    .map(([k, title, fn]) => {
      const all = list.filter(fn as any), hours = all.filter(liveF);
      if (!hours.length) return { k, title, empty: true, past: all.length > 0 } as any;
      const best = hours.reduce((p: any, q: any) => E.scoreOf(q, S.method) > E.scoreOf(p, S.method) ? q : p), m = E.methodOf(best, S.method);
      return { k, title, a: best, m, score: E.scoreOf(best, S.method), from: hours[0].h.min, to: hours[hours.length - 1].h.min + 60, adv: E.techAdvice(m, best), targets: E.speciesFor(best, m).slice(0, 3), safetyMin: Math.min(...hours.map((x: any) => x.safety.score)), pick: E.quickPick(best, m) };
    });
}
function FishingDays({ go, setTab }: { go: (r: Route) => void; setTab: (t: string) => void }) {
  const S = api.S, idxs = [0, 1].filter(i => i < S.dates.length);
  return <>
    {idxs.map(i => (
      <div key={i} className="space-y-3">
        <h3 className="font-display text-[20px] font-extrabold">{dayName(i)} <span className="num text-[14px] font-normal text-ink-soft">{shortDate(S.dates[i])}</span></h3>
        <div className="grid gap-3 md:grid-cols-3">
          {sessions(i).map((s: any) => s.empty ? (
            <div key={s.k} className="rounded-3xl bg-white/60 p-4 text-[14px] text-ink-soft ring-1 ring-line/70"><b className="text-ink">{s.title}</b><br />{s.past ? "החלון כבר עבר" : "אין שעות"}</div>
          ) : (
            <button key={s.k} onClick={() => { E.update({ dateIdx: i, hourSel: String(s.a.h.hour) }); setTab("now"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="rounded-3xl bg-white p-4 text-right ring-1 ring-line/70 hover:ring-[color:var(--c1)]">
              <div className="flex items-center gap-2"><b className="font-display text-[16px]">{s.title}</b><span className="ms-auto"><ScorePill score={s.score} /></span></div>
              <div className="num text-[13px] text-ink-soft" dir="ltr" style={{ textAlign: "right" }}>{hhmm(s.from)}–{hhmm(s.to)}</div>
              <div className="mt-2 space-y-1 text-[13.5px]">
                <div><b>{api.TECH[s.m].name}</b> · {E.RIGS[s.adv.rig].name}</div>
                <div className="text-ink-soft">{ltr(s.pick)}</div>
                <div>{s.targets.map((x: any) => x.sp.nameHebrew).join(" · ")}</div>
                <div className="text-ink-soft">גל {fmt(s.a.h.waveH, 1)} מ׳ · רוח {fmt(s.a.h.windSpeed, 0)} קמ״ש {E.WIND_CLS_HE[s.a.wind.cls]} · {s.a.moon.icon}</div>
              </div>
              {s.safetyMin < 50 && <div className="mt-2 text-[12.5px] font-semibold text-rose-600">⚠️ בטיחות נמוכה ({s.safetyMin})</div>}
            </button>
          ))}
        </div>
      </div>
    ))}
  </>;
}
function FishingWeek({ setTab }: { setTab: (t: string) => void }) {
  const S = api.S;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {S.dates.map((d: string, i: number) => {
        const l = dayOf(i), pick = (ph: string) => { const x = l.filter((a: any) => a.phase === ph); return x.length ? x.reduce((p: any, q: any) => E.scoreOf(q, S.method) > E.scoreOf(p, S.method) ? q : p) : null; };
        const mo = pick("goldenMorning"), ev = pick("goldenEvening"), best = [mo, ev].filter(Boolean).sort((p: any, q: any) => E.scoreOf(q, S.method) - E.scoreOf(p, S.method))[0] || l[0];
        if (!best) return null; const m = E.methodOf(best, S.method);
        return (
          <button key={d} onClick={() => { E.update({ dateIdx: i, hourSel: "best" }); setTab("now"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className={`rounded-3xl bg-white p-4 text-right ring-1 ${i === S.dateIdx ? "ring-2 ring-[color:var(--c1)]" : "ring-line/70"}`}>
            <div className="flex items-center gap-2"><b className="text-[15.5px]">{dayName(i)}</b><span className="num text-[12.5px] text-ink-soft">{shortDate(d)}</span><span className="ms-auto text-[13px]">{best.moon.icon}</span></div>
            <div className="mt-2 flex gap-2 text-[13px]"><span className="flex items-center gap-1">בוקר <ScorePill score={mo ? E.scoreOf(mo, S.method) : 0} /></span><span className="flex items-center gap-1">ערב <ScorePill score={ev ? E.scoreOf(ev, S.method) : 0} /></span></div>
            <div className="mt-1.5 truncate text-[13px] text-ink-soft">{api.TECH[m].name} · {E.speciesFor(best, m)[0]?.sp.nameHebrew || "—"} · גל {fmt(best.h.waveH, 1)} מ׳ · רוח {fmt(best.h.windSpeed, 0)}</div>
          </button>
        );
      })}
    </div>
  );
}

/* ---- ציוד וריגים ---- */
function FishingGear({ a }: { a: any }) {
  const [tid, setTid] = useState<string>(E.methodOf(a, api.S.method));
  const t = api.TECH[tid], sc = t.score;
  const bb = (() => { let bi = 0; sc.wave.forEach((b: any, i: number) => { if ((b.pts ?? 0) > (sc.wave[bi].pts ?? 0)) bi = i; }); return { from: bi ? sc.wave[bi - 1].max : 0, to: sc.wave[bi].max }; })();
  const times = Object.entries(sc.time).sort((p: any, q: any) => q[1] - p[1]).slice(0, 2).map(([k]) => E.PHASE_HE[k]).join(", ");
  const terr = Object.entries(sc.terrain).sort((p: any, q: any) => q[1] - p[1]).slice(0, 3).map(([k]) => E.TERRAIN_HE[k]).join(", ");
  const sp = api.SPECIES.filter((s: any) => s.techniques.includes(tid));
  return <>
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">{api.TECHS.map((x: any) => <Chip key={x.id} active={x.id === tid} onClick={() => setTid(x.id)}>{x.name}</Chip>)}</div>
    <div className="grid gap-4 md:grid-cols-2">
      <Card title={t.name} icon={<Waves className="size-4.5" />}>
        <p className="mb-3 text-[14.5px]">{t.desc}</p>
        <KV rows={[["גל אידיאלי", `${bb.from}–${bb.to} מ׳`], ["רוח", `עד ${sc.wind[0].max} קמ״ש – הכי טוב`], ["שעות", times], ["עמדות", terr], ...(sc.season ? [["עונה", `חודשים ${sc.season.months.join(", ")}`] as [string, string]] : []), ["מטרות", sp.map((s: any) => s.nameHebrew).join(" · ") || "—"], ["עכשיו", `ציון ${a.tech[tid].score}`]]} />
      </Card>
      <Card title="ציוד בסיסי" icon={<Wrench className="size-4.5" />}>
        <KV rows={[["חכה", t.gear.rod], ["סליל", t.gear.reel], ["חוט", t.gear.line], ["לידר", t.gear.leader], ["קשרים", t.knots.join(" · ")]]} />
        <h4 className="mb-2 mt-4 text-[15px] font-bold">לתיק</h4><Tips items={t.pack || []} />
      </Card>
    </div>
    <Card title="ריגים" icon={<Anchor className="size-4.5" />}><div className="grid gap-6 md:grid-cols-2">{t.rigs.filter((r: string) => E.RIGS[r]).map((r: string) => <RigBlock key={r} rig={r} />)}</div></Card>
    {t.family === "lure" ? <>
      <Card title="הדמויים של השיטה">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(E.LURES).filter((l: any) => l.techs.includes(tid)).map((l: any, i: number) => (
            <div key={i} className="flex flex-col gap-2 rounded-2xl bg-mist/60 p-3">
              <Art html={E.lureSVG(l.draw, tid === "eging" ? "red" : tid === "lrf" ? "clear" : "sardine")} />
              <b className="text-[15px]">{l.name}</b>
              <KV rows={[["גודל", l.size], ["עומק", l.depth], ["גל", `${l.cond.wave[0]}–${l.cond.wave[1]} מ׳ · רוח עד ${l.cond.windMax}`]]} />
              <p className="text-[13px]">{ltr(l.work)}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card title="מתי איזה צבע">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {(tid === "eging" ? ["red", "pink", "gold", "natural", "dark"] : tid === "lrf" ? ["clear", "white", "natural", "chartreuse", "pink"] : ["sardine", "blueSilver", "white", "gold", "pink", "chartreuse", "dark"]).map(k => (
            <div key={k} className="rounded-2xl bg-mist/60 p-2"><Art small html={E.lureSVG(tid === "eging" ? "egi" : tid === "lrf" ? "grub" : "minnow", k)} /><b className="mt-1 block text-[13.5px]">{E.COLORS[k].name}</b><span className="text-[12px] text-ink-soft">{E.COLORS[k].when}</span></div>
          ))}
        </div>
      </Card>
    </> : (
      <Card title="פתיונות – הכנה והשחלה">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(tid === "livebait" ? ["live", "sardine", "squid"] : tid === "float" ? ["bread", "dough", "shrimp", "worm", "mussel", "crab"] : ["shrimp", "sardine", "squid", "worm", "crab", "mussel", "dough", "chicken"]).map(k => {
            const B = E.BAITS[k], who = Object.entries(E.SPECIES_BAITS).filter(([, l]: any) => l.includes(k)).map(([s]) => api.SPECIES.find((x: any) => x.id === s)?.nameHebrew).filter(Boolean);
            return (
              <div key={k} className="flex flex-col gap-2 rounded-2xl bg-mist/60 p-3">
                <Art small html={E.baitSVG(k)} /><b className="text-[15px]">{B.name}</b>{who.length > 0 && <span className="text-[12.5px] text-ink-soft">ל{who.join(", ")}</span>}
                <KV rows={[["הכנה", B.prep], ["על הקרס", B.hook], ["עמידות", <Dots n={B.dur} key="d" />], ["ריח", <Dots n={B.scent} key="s" />]]} />
              </div>
            );
          })}
        </div>
      </Card>
    )}
  </>;
}
