# ים חכם

תנאי ים וחוף לכל פעילות: דיג, גלישת גלים, קייט, גלישת רוח, סאפ, קיאק, פוציוולי, כדורעף חופים, מטקות, שחייה, שנורקל ויום חוף.

## Stack
React 19 · TypeScript · Vite · Tailwind CSS 4 · Motion · lucide-react. נתונים: Open-Meteo (Weather + Marine).

## פיתוח
```
npm install
npm run dev      # שרת פיתוח
npm run build    # dist/index.html – קובץ אחד שנפתח בכל דפדפן
```

## מבנה
- `src/engine/engine.js` – נתונים, שירותי תחזית ומנועי הניקוד (דיג + כל הענפים). בלי UI.
- `src/lib.ts` – חיבור המנוע ל-React (useEngine) ועזרים.
- `src/theme/sports.ts` – קטגוריות, ענפים וצבעים.
- `src/components/Scene.tsx` – הירו מונפש לכל ענף (SVG + CSS).
- `src/components/layout.tsx`, `ui.tsx` – ניווט, פס ימים, פס שעות, כרטיסים, טבעת ציון.
- `src/screens/*` – בית, קטגוריה, ענף, דיג, השבוע, יומן, הגדרות.
