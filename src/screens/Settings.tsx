import { useEffect, useState } from "react";
import { Download, MapPinned, ShieldCheck, SlidersHorizontal, Upload, UserRound, Fish, LayoutGrid, Pencil, Trash2 } from "lucide-react";
import { api, E, mySports, ltr } from "../lib";
import { CATEGORIES, SPORTS, type SportId } from "../theme/sports";
import { Card, Segmented, Tips } from "../components/ui";
import { safetyFor } from "./Sport";

const inp = "w-full rounded-xl bg-mist/70 px-3 py-2.5 text-[15px] ring-1 ring-line focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500";
const L = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="flex min-w-0 flex-col gap-1"><span className="text-[12.5px] font-semibold text-ink-soft">{label}</span>{children}</label>;

function Toggle({ on, onClick, title, sub, c1 }: { on: boolean; onClick: () => void; title: string; sub?: string; c1: string }) {
  return (
    <button onClick={onClick} aria-pressed={on} className={`flex items-center gap-3 rounded-2xl p-3 text-right ring-1 transition-all ${on ? "bg-white shadow-sm" : "bg-mist/40 opacity-70"}`} style={{ boxShadow: on ? `inset 0 0 0 2px ${c1}` : undefined }}>
      <span className="relative h-6 w-10 shrink-0 rounded-full transition-colors" style={{ background: on ? c1 : "#cbd5e1" }}><span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${on ? "right-0.5" : "right-[18px]"}`} /></span>
      <span className="min-w-0"><b className="block text-[14.5px]">{title}</b>{sub && <span className="line-clamp-2 text-[12.5px] text-ink-soft">{sub}</span>}</span>
    </button>
  );
}

export function SettingsScreen({ section }: { section?: string }) {
  const [tab, setTab] = useState<string>(section || "prefs");
  return (
    <div className="space-y-4" style={{ ["--c1" as any]: "#0369a1", ["--c2" as any]: "#22d3ee" }}>
      <h1 className="text-[28px] font-extrabold">הגדרות</h1>
      <Segmented value={tab} onChange={setTab} options={[["prefs", "העדפות"], ["spots", "חופים"], ["safety", "בטיחות"], ["calib", "כיול"], ["backup", "גיבוי"]]} />
      {tab === "prefs" && <Prefs />}
      {tab === "spots" && <Spots />}
      {tab === "safety" && <Safety />}
      {tab === "calib" && <Calib />}
      {tab === "backup" && <Backup />}
    </div>
  );
}

function Prefs() {
  const mine = mySports(), techs: string[] = (api.PREFS.techs || []).filter((x: string) => api.TECH[x]).length ? api.PREFS.techs : api.TECHS.map((t: any) => t.id);
  const toggleSport = (id: SportId) => { const n = mine.includes(id) ? mine.filter(x => x !== id) : [...mine, id]; if (n.length) api.setPrefs({ acts: n }); };
  const toggleTech = (id: string) => { const n = techs.includes(id) ? techs.filter(x => x !== id) : [...techs, id]; if (n.length) { api.setPrefs({ techs: n, styleSet: true }); if (api.S.method !== "auto" && !n.includes(api.S.method)) E.update({ method: "auto" }); } };
  return <>
    <Card title="הענפים שלי" sub="רק הם יופיעו בבית, בקטגוריות ובשבוע" icon={<LayoutGrid className="size-4.5" />}>
      <div className="space-y-4">
        {CATEGORIES.map(c => (
          <div key={c.id}>
            <div className="mb-2 flex items-center gap-2 text-[13.5px] font-bold" style={{ color: c.c1 }}><span className="size-2.5 rounded-full" style={{ background: c.c1 }} />{c.name}</div>
            <div className="grid gap-2 sm:grid-cols-2">{c.sports.map(id => <Toggle key={id} on={mine.includes(id)} onClick={() => toggleSport(id)} title={SPORTS[id].name} sub={SPORTS[id].tagline} c1={SPORTS[id].c1} />)}</div>
          </div>
        ))}
      </div>
    </Card>
    <Card title="שיטות הדיג שלי" sub="כשבוחרים 'הכי מתאים', המערכת בוחרת רק מתוכן" icon={<Fish className="size-4.5" />}>
      <div className="grid gap-2 sm:grid-cols-2">{api.TECHS.map((t: any) => <Toggle key={t.id} on={techs.includes(t.id)} onClick={() => toggleTech(t.id)} title={t.name} sub={t.desc} c1="#b45309" />)}</div>
    </Card>
    <Card title="נתונים אישיים" icon={<UserRound className="size-4.5" />}>
      <div className="grid gap-3 sm:grid-cols-2">
        <L label="משקל גולש (לגודל קייט ומפרש)"><input type="number" min={30} max={150} inputMode="numeric" className={inp} defaultValue={api.PREFS.riderKg || 75} onBlur={e => api.setPrefs({ riderKg: Math.min(150, Math.max(30, +e.target.value || 75)) })} /></L>
        <L label="רמת גלישת גלים"><select className={inp} value={api.PREFS.surfLevel || "intermediate"} onChange={e => api.setPrefs({ surfLevel: e.target.value })}><option value="beginner">מתחיל</option><option value="intermediate">בינוני</option><option value="advanced">מתקדם</option></select></L>
        <L label="ציוד דיג קל או כבד"><select className={inp} value={api.PREFS.gearWeight || "std"} onChange={e => api.setPrefs({ gearWeight: e.target.value })}><option value="std">רגיל – לפי ההמלצה</option><option value="light">מעדיף ציוד קל</option><option value="heavy">מעדיף ציוד כבד</option></select></L>
        <L label="חוף הבית"><select className={inp} value={api.PREFS.home || api.S.spotId} onChange={e => api.setPrefs({ home: e.target.value })}>{api.SPOTS.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></L>
      </div>
    </Card>
  </>;
}

function Spots() {
  const empty = { id: "", name: "", lat: "", lon: "", facing: "", terrain: "sand", notes: "" };
  const [f, setF] = useState<any>(empty), [msg, setMsg] = useState(""), [confirm, setConfirm] = useState<string | null>(null);
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const s = { id: f.id || "s" + Date.now(), name: String(f.name).trim(), lat: +f.lat, lon: +f.lon, facing: ((+f.facing % 360) + 360) % 360, terrain: f.terrain, notes: String(f.notes || "").trim(), verified: true };
    if (!s.name || !(s.lat > 29 && s.lat < 34) || !(s.lon > 33.5 && s.lon < 36)) { setMsg("בדוק שם וקואורדינטות (ישראל: lat 29–34, lon 33.5–36)."); return; }
    const list = [...api.SPOTS], i = list.findIndex((x: any) => x.id === s.id); if (i >= 0) list[i] = s; else list.push(s);
    api.setSpots(list); setF(empty); setMsg("החוף נשמר.");
    if (s.id === api.S.spotId) E.loadForecast();
  };
  return <>
    <Card title={f.id ? `עריכת ${f.name}` : "הוספת חוף"} sub="כיוון החוף: לאן אתה מסתכל כשאתה עומד על קו המים ופניך לים. 270° = מערב" icon={<MapPinned className="size-4.5" />}>
      <form onSubmit={save} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <L label="שם"><input className={inp} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required /></L>
        <L label="Latitude"><input type="number" step="0.0001" inputMode="decimal" className={inp} value={f.lat} onChange={e => setF({ ...f, lat: e.target.value })} required /></L>
        <L label="Longitude"><input type="number" step="0.0001" inputMode="decimal" className={inp} value={f.lon} onChange={e => setF({ ...f, lon: e.target.value })} required /></L>
        <L label="החוף פונה ל (°)"><input type="number" min={0} max={359} inputMode="numeric" className={inp} value={f.facing} onChange={e => setF({ ...f, facing: e.target.value })} required /></L>
        <L label="עמדה עיקרית"><select className={inp} value={f.terrain} onChange={e => setF({ ...f, terrain: e.target.value })}>{Object.entries(E.TERRAIN_HE).map(([k, v]: any) => <option key={k} value={k}>{v}</option>)}</select></L>
        <L label="הערות"><input className={inp} value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} /></L>
        <div className="col-span-full flex flex-wrap items-center gap-3">
          <button className="rounded-2xl bg-sky-700 px-6 py-3 font-bold text-white">שמור חוף</button>
          {f.id && <button type="button" onClick={() => setF(empty)} className="rounded-2xl bg-mist px-4 py-3 font-semibold">ביטול</button>}
          {msg && <span className="text-[13.5px] font-semibold text-sky-800">{msg}</span>}
        </div>
      </form>
    </Card>
    <Card title="החופים שלי">
      <ul className="space-y-2">
        {api.SPOTS.map((s: any) => (
          <li key={s.id} className="flex items-center gap-3 rounded-2xl bg-mist/60 p-3">
            <span className="num grid size-12 shrink-0 place-items-center rounded-xl bg-white text-[12px] font-bold">{s.facing}°</span>
            <div className="min-w-0 flex-1"><b className="text-[14.5px]">{s.name}</b> {s.verified === false ? <span className="rounded-full bg-amber-100 px-2 text-[11.5px] font-semibold text-amber-800">משוער</span> : <span className="rounded-full bg-emerald-100 px-2 text-[11.5px] font-semibold text-emerald-800">מאומת</span>}
              <div className="truncate text-[12.5px] text-ink-soft"><span className="num">{s.lat.toFixed(3)}, {s.lon.toFixed(3)}</span> · פונה {E.windCalculator.compassHe(s.facing)} · {E.TERRAIN_HE[s.terrain]}</div></div>
            <button onClick={() => { setF({ ...s }); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="grid size-9 place-items-center rounded-xl bg-white ring-1 ring-line" aria-label="עריכה"><Pencil className="size-4" /></button>
            <button onClick={() => { if (api.SPOTS.length <= 1) return; if (confirm !== s.id) return setConfirm(s.id); api.setSpots(api.SPOTS.filter((x: any) => x.id !== s.id)); setConfirm(null); }} className={`grid h-9 min-w-9 place-items-center rounded-xl px-2 text-[12px] font-semibold ${confirm === s.id ? "bg-rose-600 text-white" : "bg-white text-rose-600 ring-1 ring-rose-200"}`} aria-label="מחיקה">{confirm === s.id ? "בטוח?" : <Trash2 className="size-4" />}</button>
          </li>
        ))}
      </ul>
    </Card>
  </>;
}

function Safety() {
  return <>
    <Card title="בטיחות בים ובחוף" icon={<ShieldCheck className="size-4.5" />}>
      <Tips items={["רחצה ושחייה רק בחוף מוכרז, בשעות ההצלה. דגל שחור – אסור להיכנס; דגל אדום – מסוכן; דגל לבן – רחצה מותרת.", "זרם חוזר: לא שוחים נגדו. שוחים במקביל לחוף עד שהוא נחלש, ומסמנים למציל ביד מורמת.", "רוח מהיבשה מסוכנת לסאפ, קיאק, קייט, גלישת רוח ומזרונים – היא דוחפת החוצה.", "סופת רעמים: יוצאים מהמים ומהחוף הפתוח מיד.", "עומס חום: שתייה כל 15–20 דקות, צל בצהריים, כובע."]} />
    </Card>
    <Card title="תקנות דיג" sub="יש לבדוק את התקנות העדכניות של אגף הדיג ורשות הטבע והגנים לפני יציאה">
      <ul className="divide-y divide-line/70">{api.REGS.map((r: any, i: number) => <li key={i} className="py-3"><b className="text-[15px]">{r.title}</b> {r.status && <span className={`rounded-full px-2 text-[11.5px] font-semibold ${r.status === "לאימות" ? "bg-amber-100 text-amber-800" : "bg-mist text-ink-soft"}`}>{r.status}</span>}<p className="text-[14px] text-ink-soft">{ltr(r.body)}</p></li>)}</ul>
    </Card>
  </>;
}

function Calib() {
  const [key, setKey] = useState("activities"), [txt, setTxt] = useState(""), [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null), [confirm, setConfirm] = useState(false);
  useEffect(() => { setTxt(JSON.stringify(api.cfgGet(key), null, 2)); setMsg(null); setConfirm(false); }, [key]);
  return (
    <Card title="כיול המנוע" sub="כל הספים והמשקלים כ-JSON. שינוי נשמר בדפדפן הזה" icon={<SlidersHorizontal className="size-4.5" />}>
      <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
        {[["activities", "ענפים"], ["config", "דיג – כללי"], ["techniques", "שיטות דיג"], ["species", "דגים"], ["regs", "תקנות"]].map(([k, l]) => <button key={k} onClick={() => setKey(k)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold ${k === key ? "bg-sky-700 text-white" : "bg-mist"}`}>{l}</button>)}
      </div>
      <textarea dir="ltr" spellCheck={false} value={txt} onChange={e => setTxt(e.target.value)} rows={18} className="num w-full rounded-2xl bg-slate-900 p-3 text-left text-[12.5px] leading-relaxed text-emerald-200" />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={() => { try { api.cfgSet(key, JSON.parse(txt)); setMsg({ ok: true, t: "נשמר. הציונים חושבו מחדש." }); } catch { setMsg({ ok: false, t: "ה-JSON לא תקין או חסרים בו שדות." }); } }} className="rounded-2xl bg-sky-700 px-5 py-2.5 font-bold text-white">שמור והחל</button>
        <button onClick={() => { if (!confirm) return setConfirm(true); api.cfgReset(key); setTxt(JSON.stringify(api.cfgGet(key), null, 2)); setConfirm(false); setMsg({ ok: true, t: "הוחזר לברירת מחדל." }); }} className="rounded-2xl bg-mist px-4 py-2.5 font-semibold">{confirm ? "לחץ שוב לאישור" : "ברירת מחדל"}</button>
        {msg && <span className={`text-[13.5px] font-semibold ${msg.ok ? "text-emerald-700" : "text-rose-600"}`}>{msg.t}</span>}
      </div>
    </Card>
  );
}

function Backup() {
  const [msg, setMsg] = useState("");
  return (
    <Card title="גיבוי ושחזור" sub="היומן, החופים וההגדרות נשמרים בדפדפן הזה בלבד – כדאי לגבות מדי פעם">
      <div className="flex flex-wrap gap-3">
        <button onClick={() => { const blob = new Blob([JSON.stringify(api.exportData(), null, 1)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `yam-hacham-backup-${E.localISODate()}.json`; document.body.appendChild(a); a.click(); a.remove(); setMsg("הגיבוי ירד."); }} className="flex items-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-bold text-white"><Download className="size-4.5" />ייצוא גיבוי</button>
        <label className="flex cursor-pointer items-center gap-2 rounded-2xl bg-mist px-5 py-3 font-semibold"><Upload className="size-4.5" />ייבוא גיבוי<input type="file" accept="application/json" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (!f) return; try { api.importData(JSON.parse(await f.text())); setMsg("הגיבוי נטען."); } catch { setMsg("הקובץ אינו גיבוי תקין."); } e.target.value = ""; }} /></label>
      </div>
      {msg && <p className="mt-3 text-[14px] font-semibold text-sky-800">{msg}</p>}
      <p className="mt-4 text-[13px] text-ink-soft">מקור התחזית: Open-Meteo (Weather + Marine). הציונים הם הערכה לפי ספים שניתנים לכיול – לא תחליף לשיקול דעת ולהוראות המציל.</p>
    </Card>
  );
}
