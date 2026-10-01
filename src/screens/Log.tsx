import { useState } from "react";
import { Camera, Fish, Trash2, TrendingUp } from "lucide-react";
import { api, E, fmt, ltr } from "../lib";
import { Card } from "../components/ui";

const inp = "w-full rounded-xl bg-mist/70 px-3 py-2.5 text-[15px] ring-1 ring-line focus:bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--c1)]";
function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <label className={`flex min-w-0 flex-col gap-1 ${full ? "col-span-full" : ""}`}><span className="text-[12.5px] font-semibold text-ink-soft">{label}</span>{children}</label>;
}
function readPhoto(file?: File): Promise<string | null> {
  return new Promise(res => {
    if (!file) return res(null);
    const fr = new FileReader();
    fr.onload = () => { const img = new Image(); img.onload = () => { const k = Math.min(1, 520 / Math.max(img.width, img.height)), c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height); try { res(c.toDataURL("image/jpeg", .72)); } catch { res(null); } }; img.onerror = () => res(null); img.src = String(fr.result); };
    fr.onerror = () => res(null); fr.readAsDataURL(file);
  });
}
async function conditionsFor(sp: any, terrain: string, date: string, time: string) {
  const S = api.S, hr = +time.slice(0, 2);
  let a: any = S.spotId === sp.id && S.source !== "demo" && (S.terrain || sp.terrain) === terrain && S.analyzed.find((x: any) => x.h.date === date && x.h.hour === hr);
  if (!a) {
    try {
      const [w, m] = await Promise.all([E.weatherService.fetch(sp.lat, sp.lon, { start: date, end: date }), E.marineService.fetch(sp, { start: date, end: date })]);
      const h = E.buildHours(w, m).find((x: any) => x.hour === hr); if (h) a = E.analyzeHour(h, sp, terrain, api.CFG);
    } catch { return null; }
  }
  if (!a) return null;
  const tmin = E.toMin(time);
  return { waveH: a.h.waveH, heff: a.wp.heff, period: a.h.wavePeriod, wind: a.h.windSpeed, windDir: a.h.windDir, windCls: a.wind.cls, gust: a.h.gust, sst: a.h.sst, cloud: a.h.cloud, pressure: a.h.pressure, pTrend: a.h.pTrend, moon: a.moon.illum, phase: a.phase, minsFromSunrise: tmin - a.h.sunrise, minsToSunset: a.h.sunset - tmin, safety: a.safety.score };
}

export function LogPanel() {
  const S = api.S, sp0 = api.SPOTS.find((s: any) => s.id === S.spotId) || api.SPOTS[0];
  const [f, setF] = useState<any>({ spot: sp0.id, terrain: S.terrain || sp0.terrain, date: E.localISODate(), time: String(E.localHour()).padStart(2, "0") + ":00", species: api.SPECIES[0]?.id, method: (api.PREFS.techs || [])[0] || "spin", weight: "", length: "", lure: "", color: "", notes: "" });
  const [file, setFile] = useState<File | undefined>();
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const nm = (id: string) => api.SPECIES.find((s: any) => s.id === id)?.nameHebrew || (id === "other" ? "אחר" : id);
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg({ ok: true, t: "שומר ומושך את תנאי הים של אותה שעה…" });
    const sp = api.SPOTS.find((s: any) => s.id === f.spot) || sp0;
    const entry: any = { id: "c" + Date.now(), spotId: sp.id, spotName: sp.name, terrain: f.terrain, date: f.date, time: f.time, species: f.species, method: f.method, weight: f.weight ? +f.weight : null, length: f.length ? +f.length : null, lure: f.lure.trim(), color: f.color.trim(), notes: f.notes.trim() };
    entry.photo = await readPhoto(file); entry.cond = await conditionsFor(sp, f.terrain, f.date, f.time);
    const ok = api.addLog(entry); setBusy(false);
    setMsg(!ok ? { ok: false, t: "לא הצלחתי לשמור בדפדפן – ייצא גיבוי בהגדרות." } : { ok: true, t: entry.cond ? "נשמר עם תנאי הים של אותה שעה." : "נשמר. תנאי הים לא נמשכו (אין חיבור או תאריך רחוק)." });
    setF({ ...f, weight: "", length: "", lure: "", color: "", notes: "" }); setFile(undefined);
  }
  const log = [...api.LOG].sort((a: any, b: any) => (b.date + b.time).localeCompare(a.date + a.time));
  return (
    <div className="space-y-4" style={{ ["--c1" as any]: "#b45309", ["--c2" as any]: "#fbbf24" }}>
      <Card title="תפיסה חדשה" sub="התנאים נשמרים אוטומטית" icon={<Fish className="size-4.5" />}>
        <form onSubmit={save} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="מקום"><select className={inp} value={f.spot} onChange={set("spot")}>{api.SPOTS.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
          <Field label="עמדה"><select className={inp} value={f.terrain} onChange={set("terrain")}>{Object.entries(E.TERRAIN_HE).map(([k, v]: any) => <option key={k} value={k}>{v}</option>)}</select></Field>
          <Field label="מין דג"><select className={inp} value={f.species} onChange={set("species")}>{api.SPECIES.map((s: any) => <option key={s.id} value={s.id}>{s.nameHebrew}</option>)}<option value="other">אחר</option></select></Field>
          <Field label="תאריך"><input type="date" className={inp} value={f.date} onChange={set("date")} required /></Field>
          <Field label="שעה"><input type="time" className={inp} value={f.time} onChange={set("time")} required /></Field>
          <Field label="שיטה"><select className={inp} value={f.method} onChange={set("method")}>{api.TECHS.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>
          <Field label="משקל (ק״ג)"><input type="number" step="0.01" min="0" inputMode="decimal" className={inp} value={f.weight} onChange={set("weight")} /></Field>
          <Field label="אורך (ס״מ)"><input type="number" step="0.5" min="0" inputMode="decimal" className={inp} value={f.length} onChange={set("length")} /></Field>
          <Field label="פתיון / דמוי"><input className={inp} value={f.lure} onChange={set("lure")} placeholder="Minnow 12 ס״מ" /></Field>
          <Field label="צבע"><input className={inp} value={f.color} onChange={set("color")} placeholder="כסוף-כחול" /></Field>
          <Field label="תמונה"><label className={`${inp} flex cursor-pointer items-center gap-2 text-ink-soft`}><Camera className="size-4" />{file ? file.name : "צרף תמונה"}<input type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files?.[0])} /></label></Field>
          <Field label="הערות" full><input className={inp} value={f.notes} onChange={set("notes")} placeholder="מה עבד, איפה בדיוק, מה ראית במים" /></Field>
          <div className="col-span-full flex flex-wrap items-center gap-3">
            <button disabled={busy} className="bg-sport rounded-2xl px-6 py-3 text-[15px] font-bold text-white shadow-md active:scale-95 disabled:opacity-60">שמור תפיסה</button>
            {msg && <span className={`text-[13.5px] font-semibold ${msg.ok ? "text-emerald-700" : "text-rose-600"}`}>{msg.t}</span>}
          </div>
        </form>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="מה היומן מלמד" sub="סטטיסטיקה פשוטה על התפיסות שלך" icon={<TrendingUp className="size-4.5" />}>
          <ul className="space-y-2">{E.learningInsights(api.LOG).map((i: any, k: number) => <li key={k} className="rounded-2xl bg-mist/70 px-3 py-2.5 text-[14px]">{ltr(i.text)}</li>)}</ul>
        </Card>
        <Card title="התפיסות שלי" sub={log.length ? `${log.length} תפיסות` : ""}>
          {!log.length && <p className="text-[14px] text-ink-soft">עוד אין תפיסות. אחרי היציאה הבאה הוסף כאן מה תפסת.</p>}
          <ul className="space-y-2">
            {log.map((e: any) => (
              <li key={e.id} className="flex items-center gap-3 rounded-2xl bg-mist/60 p-2.5">
                {e.photo ? <img src={e.photo} alt="" className="size-14 shrink-0 rounded-xl object-cover" /> : <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-white text-2xl">🐟</span>}
                <div className="min-w-0 flex-1">
                  <b className="text-[14.5px]">{nm(e.species)}{e.weight ? ` · ${e.weight} ק״ג` : ""}{e.length ? ` · ${e.length} ס״מ` : ""}</b>
                  <div className="truncate text-[12.5px] text-ink-soft">{e.spotName} · {E.shortDate(e.date)} {e.time} · {api.TECH[e.method === "bait" ? "surf" : e.method]?.name || ""}{e.lure ? ` · ${e.lure}` : ""}</div>
                  <div className="truncate text-[12px] text-ink-soft">{e.cond ? `גל ${fmt(e.cond.waveH, 1)} מ׳ · רוח ${fmt(e.cond.wind, 0)} ${E.WIND_CLS_HE[e.cond.windCls] || ""} · מים ${fmt(e.cond.sst, 1)}°` : "ללא נתוני תנאים"}</div>
                </div>
                <button onClick={() => confirm === e.id ? (api.removeLog(e.id), setConfirm(null)) : setConfirm(e.id)} className={`shrink-0 rounded-xl px-2.5 py-2 text-[12.5px] font-semibold ${confirm === e.id ? "bg-rose-600 text-white" : "bg-white text-rose-600 ring-1 ring-rose-200"}`} aria-label="מחיקה">
                  {confirm === e.id ? "בטוח?" : <Trash2 className="size-4" />}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
