import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useEngine, E } from "./lib";
import { TopBar, BottomNav, SpotSheet, type Route } from "./components/layout";
import { Home } from "./screens/Home";
import { CategoryScreen } from "./screens/Category";
import { SportScreen } from "./screens/Sport";
import { FishingScreen } from "./screens/Fishing";
import { WeekScreen } from "./screens/Week";
import { LogPanel } from "./screens/Log";
import { SettingsScreen } from "./screens/Settings";
import { CATEGORIES, SPORTS } from "./theme/sports";

const key = (r: Route) => JSON.stringify(r);

export default function App() {
  const api = useEngine();
  const [route, setRoute] = useState<Route>(() => (history.state?.route as Route) || { screen: "home" });
  const [spotOpen, setSpotOpen] = useState(false);

  // ניווט עם היסטוריה – כפתור "חזרה" של הדפדפן/הטלפון עובד
  const go = useCallback((r: Route) => {
    if (key(r) === key(route)) return;
    history.pushState({ route: r }, ""); setRoute(r); window.scrollTo({ top: 0 });
  }, [route]);
  useEffect(() => {
    if (!history.state?.route) history.replaceState({ route }, "");
    const on = (e: PopStateEvent) => { setRoute((e.state?.route as Route) || { screen: "home" }); window.scrollTo({ top: 0 }); };
    window.addEventListener("popstate", on); return () => window.removeEventListener("popstate", on);
  }, []);
  useEffect(() => { E.loadForecast(); }, []);

  const back = route.screen === "category" || route.screen === "sport" ? () => history.back() : undefined;
  const title = route.screen === "category" ? CATEGORIES.find(c => c.id === route.id)?.name : route.screen === "sport" ? SPORTS[route.id].name : undefined;
  const ready = api.S.analyzed.length > 0;

  return (
    <div className="min-h-dvh pb-28">
      <TopBar onSpot={() => setSpotOpen(true)} onBack={back} title={title} />
      <main className="mx-auto max-w-5xl px-4 pt-4">
        {!ready ? <Loading /> : (
          <AnimatePresence mode="wait">
            <motion.div key={key(route)} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: .22, ease: "easeOut" }}>
              {route.screen === "home" && <Home go={go} />}
              {route.screen === "category" && <CategoryScreen id={route.id} go={go} />}
              {route.screen === "sport" && (route.id === "fishing" ? <FishingScreen go={go} tab={route.tab} /> : <SportScreen id={route.id} go={go} tab={route.tab} />)}
              {route.screen === "week" && <WeekScreen go={go} />}
              {route.screen === "log" && <div className="space-y-4"><h1 className="text-[28px] font-extrabold">יומן דיג</h1><LogPanel /></div>}
              {route.screen === "settings" && <SettingsScreen section={route.section} />}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
      <BottomNav route={route} go={go} />
      <SpotSheet open={spotOpen} onClose={() => setSpotOpen(false)} onManage={() => go({ screen: "settings", section: "spots" })} />
    </div>
  );
}

function Loading() {
  return (
    <div className="grid place-items-center py-28 text-center">
      <svg viewBox="0 0 120 40" className="w-40 text-sky-500" aria-hidden="true">
        <path d="M0 20 q15 -14 30 0 t30 0 t30 0 t30 0" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"><animate attributeName="d" dur="1.4s" repeatCount="indefinite" values="M0 20 q15 -14 30 0 t30 0 t30 0 t30 0;M0 20 q15 14 30 0 t30 0 t30 0 t30 0;M0 20 q15 -14 30 0 t30 0 t30 0 t30 0" /></path>
      </svg>
      <p className="mt-3 font-display text-[18px] font-bold">מושך תחזית ים ורוח…</p>
    </div>
  );
}
