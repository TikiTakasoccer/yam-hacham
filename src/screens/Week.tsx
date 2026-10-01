import { api, E, dayOf, bestOf, mySports, hhmm, dayName, shortDate } from "../lib";
import { SPORTS, scoreColor } from "../theme/sports";
import { DateStrip, type Route } from "../components/layout";
import { Card } from "../components/ui";

export function WeekScreen({ go }: { go: (r: Route) => void }) {
  const S = api.S, mine = mySports();
  const best = S.dates.map((_: string, i: number) => {
    const l = dayOf(i); return mine.map(id => ({ id, w: bestOf(id, l, i) })).filter(x => x.w).sort((p, q) => q.w!.score - p.w!.score)[0];
  });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[28px] font-extrabold">השבוע שלי</h1>
        <p className="text-[14.5px] text-ink-soft">{api.SPOTS.find((s: any) => s.id === S.spotId)?.name} · הציון הטוב בכל יום לכל ענף. לחיצה על משבצת פותחת את הענף באותו יום.</p>
      </div>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {best.map((b: any, i: number) => b && (
          <button key={i} onClick={() => { E.update({ dateIdx: i, hourSel: "best" }); go({ screen: "sport", id: b.id }); }}
            style={{ ["--c1" as any]: SPORTS[b.id as keyof typeof SPORTS].c1, ["--c2" as any]: SPORTS[b.id as keyof typeof SPORTS].c2 }}
            className="bg-sport min-w-[150px] shrink-0 rounded-3xl p-4 text-right text-white shadow-md">
            <div className="text-[13px] font-semibold text-white/85">{dayName(i)} · {shortDate(S.dates[i])}</div>
            <div className="font-display text-[19px] font-extrabold">{SPORTS[b.id as keyof typeof SPORTS].name}</div>
            <div className="num text-[13px]" dir="ltr" style={{ textAlign: "right" }}>{hhmm(b.w.from)}–{hhmm(b.w.to)}</div>
            <div className="num mt-1 text-[26px] font-extrabold">{b.w.score}</div>
          </button>
        ))}
      </div>
      <Card title="כל הענפים לפי יום">
        <div className="-mx-2 overflow-x-auto px-2">
          <table className="w-full min-w-[560px] border-separate border-spacing-1">
            <thead><tr><th />{S.dates.map((d: string, i: number) => <th key={d} className="text-center text-[12.5px] font-semibold text-ink-soft">{dayName(i)}<br /><span className="num font-normal">{shortDate(d)}</span></th>)}</tr></thead>
            <tbody>
              {mine.map(id => (
                <tr key={id}>
                  <th className="whitespace-nowrap pe-2 text-right text-[13.5px] font-semibold"><span className="me-1.5 inline-block size-2.5 rounded-full align-middle" style={{ background: SPORTS[id].c1 }} />{SPORTS[id].short}</th>
                  {S.dates.map((_: string, i: number) => {
                    const w = bestOf(id, dayOf(i), i), s = w ? w.score : 0;
                    return <td key={i}><button onClick={() => { E.update({ dateIdx: i, hourSel: "best" }); go({ screen: "sport", id }); }} className="num h-11 w-full rounded-xl text-[14px] font-bold transition-transform hover:scale-105" style={{ background: `color-mix(in srgb, ${scoreColor(s)} ${18 + s * .55}%, white)`, color: s >= 50 ? "#0c2432" : "#7f1d1d" }}>{s}</button></td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
