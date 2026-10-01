import { useSyncExternalStore } from "react";
import * as Engine from "./engine/engine.js";
/** the engine is plain JS – typed loosely on purpose */
export const E: any = Engine;
import type { SportId } from "./theme/sports";

export const api: any = (E as any).api;

/** re-render on any engine change */
export function useEngine() {
  useSyncExternalStore(E.subscribe, () => api.S.version ?? 0);
  return api;
}

export const S = () => api.S;
export const dayOf = (idx = api.S.dateIdx) => api.S.analyzed.filter((a: any) => a.h.date === api.S.dates[idx]);
export const isToday = (idx = api.S.dateIdx) => api.S.dates[idx] === E.localISODate();
export function live(list: any[], idx = api.S.dateIdx) {
  if (!isToday(idx)) return list;
  const h = E.localHour(), f = list.filter(a => a.h.hour >= h);
  return f.length ? f : list;
}
export const needsDay = (id: SportId) => id !== "fishing";
export function candidates(id: SportId, list: any[], idx?: number) {
  const l = live(list, idx);
  if (!needsDay(id)) return l;
  const d = l.filter(a => E.isDaylight(a.h));
  return d.length ? d : l;
}
export const scoreAt = (a: any, id: SportId) => id === "fishing" ? E.scoreOf(a, api.S.method) : E.actScore(a, id);
export function bestOf(id: SportId, list: any[], idx?: number) {
  if (!list.length) return null;
  return E.bestWindowFn(candidates(id, list, idx), (a: any) => scoreAt(a, id));
}
/** the hour the screen is looking at: chosen hour, otherwise the best window's peak */
export function focusHour(id: SportId, list: any[]) {
  const S = api.S;
  if (S.hourSel !== "best") { const a = list.find((x: any) => String(x.h.hour) === String(S.hourSel)); if (a) return { a, win: { from: a.h.min, to: a.h.min + 60, best: a, score: scoreAt(a, id), hours: [a] }, picked: true }; }
  const win = bestOf(id, list);
  return win ? { a: win.best, win, picked: false } : null;
}
/** "now" snapshot for home */
export function nowHour(list: any[]) {
  const S = api.S;
  if (S.hourSel !== "best") { const a = list.find((x: any) => String(x.h.hour) === String(S.hourSel)); if (a) return a; }
  return list.find((x: any) => x.h.hour === (isToday() ? E.localHour() : 9)) || list[0];
}
export function mySports(): SportId[] {
  const all: SportId[] = ["fishing", "surf", "kite", "windsurf", "sup", "kayak", "footvolley", "volleyball", "matkot", "swim", "snorkel", "beach"];
  const p = (api.PREFS.acts || []).filter((x: string) => all.includes(x as SportId));
  return p.length ? p : all;
}
export const kn = (kmh: number | null) => E.KN(kmh);
export const fmt = E.fmt as (v: any, d?: number, u?: string) => string;
export const hhmm = E.hhmm as (m: number) => string;
export function dayName(idx: number) {
  const d = api.S.dates[idx]; if (!d) return "";
  const t = E.localISODate();
  if (d === t) return "היום";
  const td = new Date(t + "T12:00:00"); td.setDate(td.getDate() + 1);
  const tomorrow = td.getFullYear() + "-" + String(td.getMonth() + 1).padStart(2, "0") + "-" + String(td.getDate()).padStart(2, "0");
  if (d === tomorrow) return "מחר";
  return "יום " + ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"][new Date(d + "T12:00:00").getDay()];
}
export const shortDate = (iso: string) => E.shortDate(iso);
/** keeps number ranges like 10–25 or 06:00–09:00 in the right order inside Hebrew text */
export const ltr = (s: string) => String(s).replace(/(\d[\d.:\/]*)–(\d[\d.:\/]*)/g, "⁦$1–$2⁩");
export const greeting = () => { const h = E.localHour(); return h < 5 ? "לילה טוב" : h < 12 ? "בוקר טוב" : h < 17 ? "צהריים טובים" : h < 21 ? "ערב טוב" : "לילה טוב"; };
